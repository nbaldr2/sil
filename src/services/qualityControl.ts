const API_BASE_URL = 'http://localhost:5001/api';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('sil_lab_token')}`,
  'Content-Type': 'application/json',
});

export interface QualityControlResult {
  id: string;
  automateId: string;
  testName: string;
  level: string;
  value: number;
  expected: number;
  deviation: number;
  status: string;
  timestamp: string;
  automate: {
    name: string;
    type: string;
    manufacturer: string;
  };
}

export interface QCStats {
  statusStats: Array<{
    status: string;
    _count: { status: number };
  }>;
  totalResults: number;
  testStats: Array<{
    testName: string;
    status: string;
    _count: { testName: number };
  }>;
  period: string;
}

export interface QCFilters {
  page?: number;
  limit?: number;
  status?: string;
  level?: string;
  testName?: string;
  automateId?: string;
}

export interface CreateQCResult {
  testName: string;
  level: string;
  value: number;
  expected: number;
  deviation: number;
  status: string;
}

export const qualityControlService = {
  // Get all QC results across all automates
  async getAllQCResults(filters: QCFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/automates/qc-results/all?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch QC results');
    }

    return response.json();
  },

  // Get QC results for a specific automate
  async getAutomateQCResults(automateId: string, filters: QCFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/automates/${automateId}/qc-results?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch automate QC results');
    }

    return response.json();
  },

  // Get QC statistics for an automate
  async getQCStats(automateId: string, days: number = 30) {
    const response = await fetch(`${API_BASE_URL}/automates/${automateId}/qc-stats?days=${days}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch QC statistics');
    }

    return response.json();
  },

  // Create a new QC result
  async createQCResult(automateId: string, data: CreateQCResult) {
    const response = await fetch(`${API_BASE_URL}/automates/${automateId}/qc-results`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create QC result');
    }

    return response.json();
  },

  // Update a QC result
  async updateQCResult(qcId: string, data: CreateQCResult) {
    const response = await fetch(`${API_BASE_URL}/automates/qc-results/${qcId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update QC result');
    }

    return response.json();
  },

  // Delete a QC result
  async deleteQCResult(qcId: string) {
    const response = await fetch(`${API_BASE_URL}/automates/qc-results/${qcId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete QC result');
    }

    return response.json();
  },

  // Get all automates
  async getAutomates() {
    const response = await fetch(`${API_BASE_URL}/automates`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch automates');
    }

    return response.json();
  }
};