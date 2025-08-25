const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const manifest = require('../utils/moduleManifest');

// Return module manifest (static + DB merge optional)
router.get('/', async (req, res) => {
  try {
    // Optionally merge DB modules metadata if present
    const dbModules = await prisma.module.findMany({ where: { isActive: true } });
    // Map dbModules to manifest shape when possible
    const mappedDb = dbModules.map(m => ({
      id: m.name,
      name: m.name,
      displayName: { fr: m.displayName, en: m.displayName },
      description: { fr: m.description, en: m.description },
      version: m.version,
      category: m.category,
      icon: null,
      price: m.price,
      features: m.features
    }));

    // Merge static manifest entries with DB entries (DB first)
    const merged = mappedDb.concat(manifest.filter(s => !mappedDb.some(d => d.id === s.id)));

    res.json({ modules: merged });
  } catch (error) {
    console.error('Error fetching module manifest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoints
// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    let daysBack = 30;
    switch (period) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      case '1y': daysBack = 365; break;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Tests per day for the specified period
    const testsPerDayRaw = await prisma.request.groupBy({
      by: ['collectionDate'],
      where: {
        collectionDate: { gte: new Date(startDate.toDateString()) }
      },
      _count: { id: true }
    });

    const testsPerDay = testsPerDayRaw.map(r => ({ date: r.collectionDate, count: r._count.id }));

    // Average TAT (time between createdAt and updatedAt for completed requests)
    const tatRaw = await prisma.request.findMany({
      where: { status: 'COMPLETED', updatedAt: { gte: startDate } },
      select: { createdAt: true, updatedAt: true }
    });

    const tatValues = tatRaw.map(r => (new Date(r.updatedAt) - new Date(r.createdAt)) / (1000 * 60 * 60)); // hours
    const avgTAT = tatValues.length ? tatValues.reduce((a,b)=>a+b,0)/tatValues.length : 0;

    // Department share from analyses in the specified period
    const revenueByCategory = await prisma.requestAnalysis.findMany({
      where: { request: { createdAt: { gte: startDate } } },
      select: {
        analysis: { select: { category: true } },
        price: true
      }
    });

    const categoryMap = {};
    revenueByCategory.forEach(r => {
      const cat = r.analysis.category || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + (r.price || 0);
    });

    const departmentShare = Object.keys(categoryMap).map(k => ({ category: k, revenue: categoryMap[k] }));

    // Additional KPIs
    const totalRequests = await prisma.request.count({
      where: { createdAt: { gte: startDate } }
    });

    const completedRequests = await prisma.request.count({
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      }
    });

    const pendingRequests = await prisma.request.count({
      where: { 
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        createdAt: { gte: startDate }
      }
    });

    const activeTechnicians = await prisma.user.count({
      where: { role: 'TECHNICIAN' }
    });

    const completionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    res.json({ 
      testsPerDay, 
      avgTAT, 
      departmentShare,
      totalRequests,
      completedRequests,
      pendingRequests,
      activeTechnicians,
      completionRate
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/advanced - For Analytics Pro
router.get('/advanced', async (req, res) => {
  try {
    const { period = '30d', department, technician } = req.query;
    
    let daysBack = 30;
    switch (period) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      case '1y': daysBack = 365; break;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Workload by department over time (stacked bar data)
    const workloadByDept = await prisma.requestAnalysis.findMany({
      where: { 
        request: { createdAt: { gte: startDate } },
        ...(department && department !== 'all' ? { analysis: { category: department } } : {})
      },
      select: {
        analysis: { select: { category: true } },
        request: { select: { createdAt: true } }
      }
    });

    // Group by day and category
    const workloadMap = {};
    workloadByDept.forEach(item => {
      const day = item.request.createdAt.toISOString().split('T')[0];
      const category = item.analysis.category || 'Uncategorized';
      
      if (!workloadMap[day]) workloadMap[day] = {};
      workloadMap[day][category] = (workloadMap[day][category] || 0) + 1;
    });

    // Test volumes by hour (heatmap data)
    const hourlyVolumes = await prisma.request.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true }
    });

    const heatmapData = {};
    hourlyVolumes.forEach(req => {
      const hour = req.createdAt.getHours();
      const day = req.createdAt.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      if (!heatmapData[hour]) heatmapData[hour] = {};
      heatmapData[hour][day] = (heatmapData[hour][day] || 0) + 1;
    });

    // Error rates and test correlation (scatter plot data)
    const errorData = await prisma.result.findMany({
      where: { 
        createdAt: { gte: startDate },
        status: 'REJECTED'
      },
      select: {
        request: { 
          select: { 
            id: true,
            _count: { select: { results: true } }
          }
        }
      }
    });

    // Technician performance
    const technicianPerformance = await prisma.request.findMany({
      where: { 
        createdAt: { gte: startDate },
        ...(technician && technician !== 'all' ? { createdById: technician } : {})
      },
      select: {
        createdBy: { select: { name: true } },
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Revenue trends
    const revenueData = await prisma.requestAnalysis.findMany({
      where: { request: { createdAt: { gte: startDate } } },
      select: {
        price: true,
        request: { select: { createdAt: true } }
      }
    });

    const dailyRevenue = {};
    revenueData.forEach(item => {
      const day = item.request.createdAt.toISOString().split('T')[0];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + (item.price || 0);
    });

    res.json({
      workloadByDept: workloadMap,
      heatmapData,
      errorData,
      technicianPerformance,
      dailyRevenue,
      period
    });
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/predictions - Predictive analytics
router.get('/predictions', async (req, res) => {
  try {
    // Simple prediction based on historical trends
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const historicalData = await prisma.request.groupBy({
      by: ['collectionDate'],
      where: {
        collectionDate: { gte: last30Days }
      },
      _count: { id: true }
    });

    // Calculate average and trend
    const counts = historicalData.map(d => d._count.id);
    const average = counts.reduce((a, b) => a + b, 0) / counts.length;
    
    // Simple linear trend calculation
    const trend = counts.length > 1 ? 
      (counts[counts.length - 1] - counts[0]) / counts.length : 0;

    // Generate 7-day forecast
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const predictedValue = Math.max(0, Math.round(average + (trend * i)));
      forecast.push({
        day: i,
        predicted: predictedValue,
        confidence: Math.max(0.6, 1 - (i * 0.05)) // Decreasing confidence over time
      });
    }

    res.json({
      historical: historicalData,
      forecast,
      insights: {
        trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        averageDaily: Math.round(average),
        recommendation: trend > 5 ? 'Consider additional staffing' : 
                      trend < -5 ? 'Workload decreasing, optimize resources' : 
                      'Maintain current staffing levels'
      }
    });
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
