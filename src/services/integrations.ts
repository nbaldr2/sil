// API Base URL
import { API_BASE_URL } from '../config/api';

// ... existing code ...

// Authentication token management
let authToken: string | null = localStorage.getItem('sil_lab_token');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('sil_lab_token', token);
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('sil_lab_token');
};

// API request helper with retry mechanism
const apiRequest = async (endpoint: string, options: RequestInit = {}, retries = 2) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Always get the latest token from localStorage
  const currentToken = localStorage.getItem('sil_lab_token');
  const currentUser = localStorage.getItem('sil_lab_user');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    ...(options.headers as Record<string, string> || {}),
  };

  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  console.log('API Request Debug:', {
    url,
    hasToken: !!currentToken,
    user: currentUser ? JSON.parse(currentUser) : null,
    method: options.method || 'GET'
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store'
    });

    // Treat 304 as non-OK and retry once with a cache buster
    if (response.status === 304 && retries > 0) {
      const cacheBusted = url.includes('?') ? `${url}&_=${Date.now()}` : `${url}?_=${Date.now()}`;
      const retryResponse = await fetch(cacheBusted, {
        ...options,
        headers,
        cache: 'no-store'
      });
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${retryResponse.status}`);
      }
      const retryResult = await retryResponse.json();
      console.log('API Response (retry):', endpoint, retryResult);
      return retryResult;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Retry on rate limiting with exponential backoff
      if (response.status === 429 && retries > 0) {
        const delay = Math.pow(2, 3 - retries) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiRequest(endpoint, options, retries - 1);
      }
      
      // Include more detailed error information if available
      let errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      
      // Handle validation errors
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
      }
      
      const errorDetails = errorData.details ? `: ${errorData.details}` : '';
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url,
        method: options.method || 'GET'
      });
      console.error('Full Error Data:', JSON.stringify(errorData, null, 2));
      throw new Error(errorMessage + errorDetails);
    }

    const result = await response.json();
    console.log('API Response:', endpoint, result);
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    clearAuthToken();
  },

  getCurrentUser: async () => {
    try {
      const response = await apiRequest('/auth/me');
      return response.user;
    } catch (error) {
      clearAuthToken();
      throw error;
    }
  },

  createUser: async (userData: any) => {
    const response = await apiRequest('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.user;
  },

  getUsers: async () => {
    const response = await apiRequest('/auth/users');
    return response.users;
  },

  updateUser: async (id: string, data: any) => {
    const response = await apiRequest(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.user;
  },

  deleteUser: async (id: string) => {
    await apiRequest(`/auth/users/${id}`, {
      method: 'DELETE',
    });
  }
};

// Patients service
export const patientsService = {
  getPatients: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/patients?${queryString}`);
    return response;
  },

  getPatient: async (id: string) => {
    const response = await apiRequest(`/patients/${id}`);
    return response.patient;
  },

  createPatient: async (patientData: any) => {
    const response = await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
    return response.patient;
  },

  updatePatient: async (id: string, patientData: any) => {
    const response = await apiRequest(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
    return response.patient;
  },

  deletePatient: async (id: string) => {
    await apiRequest(`/patients/${id}`, {
      method: 'DELETE',
    });
  },

  getPatientStats: async () => {
    const response = await apiRequest('/patients/stats/overview');
    return response;
  }
};

// Doctors service
export const doctorsService = {
  getDoctors: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/doctors?${queryString}`);
    return response;
  },

  getDoctor: async (id: string) => {
    const response = await apiRequest(`/doctors/${id}`);
    return response.doctor;
  },

  createDoctor: async (doctorData: any) => {
    const response = await apiRequest('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
    return response.doctor;
  },

  updateDoctor: async (id: string, doctorData: any) => {
    const response = await apiRequest(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    });
    return response.doctor;
  },

  deleteDoctor: async (id: string) => {
    await apiRequest(`/doctors/${id}`, {
      method: 'DELETE',
    });
  },

  searchDoctors: async (query: string) => {
    const response = await apiRequest(`/doctors/search/autocomplete?q=${encodeURIComponent(query)}`);
    return response.doctors;
  },

  getDoctorStats: async () => {
    const response = await apiRequest('/doctors/stats/overview');
    return response;
  }
};

// Analyses service
export const analysesService = {
  getAnalyses: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/analyses?${queryString}`);
    return response;
  },

  getAnalysis: async (id: string) => {
    const response = await apiRequest(`/analyses/${id}`);
    return response.analysis;
  },

  createAnalysis: async (analysisData: any) => {
    const response = await apiRequest('/analyses', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
    return response.analysis;
  },

  updateAnalysis: async (id: string, analysisData: any) => {
    const response = await apiRequest(`/analyses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(analysisData),
    });
    return response.analysis;
  },

  deleteAnalysis: async (id: string) => {
    await apiRequest(`/analyses/${id}`, {
      method: 'DELETE',
    });
  },

  getCategories: async () => {
    const response = await apiRequest('/analyses/categories/list');
    return response.categories;
  },

  searchAnalyses: async (query: string) => {
    const response = await apiRequest(`/analyses/search/autocomplete?q=${encodeURIComponent(query)}`);
    return response.analyses;
  },

  bulkUpdatePrices: async (updates: any[]) => {
    const response = await apiRequest('/analyses/prices/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
    return response;
  },

  getAnalysisStats: async () => {
    const response = await apiRequest('/analyses/stats/overview');
    return response;
  }
};

// Requests service
export const requestsService = {
  getRequests: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/requests?${queryString}`);
    return response;
  },

  getRequest: async (id: string) => {
    // add cache-busting param to avoid 304 with empty body
    const response = await apiRequest(`/requests/${id}?_=${Date.now()}`);
    return response.request;
  },

  createRequest: async (requestData: any) => {
    const response = await apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response.request;
  },

  updateRequest: async (id: string, requestData: any) => {
    const response = await apiRequest(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    return response.request;
  },

  updateRequestStatus: async (id: string, status: string) => {
    const response = await apiRequest(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.request;
  },

  deleteRequest: async (id: string) => {
    await apiRequest(`/requests/${id}`, {
      method: 'DELETE',
    });
  },

  getRequestStats: async (period: string = 'month') => {
    const response = await apiRequest(`/requests/stats/overview?period=${period}`);
    return response;
  },

  markAsDelivered: async (id: string, deliveredBy: string) => {
    const response = await apiRequest(`/requests/${id}/deliver`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveredBy }),
    });
    return response.request;
  }
};

// Results service
export const resultsService = {
  getResults: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/results?${queryString}`);
    return response;
  },

  getResult: async (id: string) => {
    const response = await apiRequest(`/results/${id}`);
    return response.result;
  },

  createResult: async (resultData: any) => {
    const response = await apiRequest('/results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
    return response.result;
  },

  updateResult: async (id: string, resultData: any) => {
    const response = await apiRequest(`/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resultData),
    });
    return response.result;
  },

  validateResult: async (id: string, validatedBy: string) => {
    const response = await apiRequest(`/results/${id}/validate`, {
      method: 'PATCH',
      body: JSON.stringify({ validatedBy }),
    });
    return response.result;
  },

  getResultsByRequest: async (requestId: string) => {
    const response = await apiRequest(`/results/request/${requestId}`);
    return response.results;
  },

  getResultStats: async () => {
    const response = await apiRequest('/results/stats/overview');
    return response;
  }
};

// Configuration service
export const configService = {
  getConfig: async () => {
    const response = await apiRequest('/config');
    return response.config;
  },

  updateConfig: async (configData: any) => {
    const response = await apiRequest('/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
    return response.config;
  },

  getStats: async () => {
    const response = await apiRequest('/config/stats');
    return response;
  },

  exportData: async (type: string) => {
    const response = await apiRequest(`/config/export?type=${type}`);
    return response;
  },

  createBackup: async () => {
    const response = await apiRequest('/config/backup', {
      method: 'POST',
    });
    return response;
  }
};

// Legacy compatibility - keep the old service names for existing components
export const sheetsService = {
  saveRequest: async (requestData: any) => {
    try {
      const request = await requestsService.createRequest(requestData);
      return { success: true, data: request };
    } catch (error) {
      console.error('Save request error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  getRequests: async () => {
    try {
      const response = await requestsService.getRequests();
      return { success: true, data: response.requests };
    } catch (error) {
      console.error('Get requests error:', error);
      return { success: false, error: (error as Error).message };
    }
  }
};

// Pricing service (now uses analyses from API)
export const pricingService = {
  getPrices: async () => {
    try {
      const response = await analysesService.getAnalyses();
      return response.analyses.map((analysis: any) => ({
        id: analysis.id,
        code: analysis.code,
        nom: analysis.nom || analysis.name, // Handle both nom and name fields
        category: analysis.category,
        price: analysis.price,
        tva: analysis.tva,
        cost: analysis.cost
      }));
    } catch (error) {
      console.error('Get prices error:', error);
      return [];
    }
  },

  savePrices: async (prices: any[]) => {
    try {
      // Filter out prices without ID (these would be default data that doesn't exist in DB yet)
      const updates = prices
        .filter(price => price.id) // Only include prices with ID
        .map(price => ({
          id: price.id,
          price: price.price,
          tva: price.tva
        }));
      
      if (updates.length === 0) {
        console.warn('No valid price updates to save (missing IDs)');
        return false;
      }
      
      const response = await analysesService.bulkUpdatePrices(updates);
      const success = response.results.every((r: any) => r.success);
      
      if (!success) {
        console.error('Some price updates failed:', response.results.filter((r: any) => !r.success));
      }
      
      return success;
    } catch (error) {
      console.error('Save prices error:', error);
      return false;
    }
  },

  calculateRequestTotal: (selectedAnalyses: any[], discount: number = 0, advancePayment: number = 0) => {
    let subtotal = 0;
    let tvaTotal = 0;

    selectedAnalyses.forEach(analysis => {
      const price = analysis.price || 0;
      const tva = analysis.tva || 20;
      const tvaAmount = price * (tva / 100);
      
      subtotal += price;
      tvaTotal += tvaAmount;
    });

    const totalBeforeDiscount = subtotal + tvaTotal;
    const discountAmount = totalBeforeDiscount * (discount / 100);
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;
    const amountDue = totalAfterDiscount - advancePayment;

    return {
      subtotal: subtotal,
      tvaTotal: tvaTotal,
      totalBeforeDiscount: totalBeforeDiscount,
      discount: discount,
      discountAmount: discountAmount,
      totalAfterDiscount: totalAfterDiscount,
      advancePayment: advancePayment,
      amountDue: amountDue
    };
  },

  getCurrencySettings: () => {
    try {
      const saved = localStorage.getItem('sil_lab_currency');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
    }
    
    // Return default currency settings
    return {
      symbol: 'dh',
      code: 'MAD',
      position: 'after' as 'before' | 'after',
      decimalPlaces: 2
    };
  },

  saveCurrencySettings: (settings: any) => {
    try {
      localStorage.setItem('sil_lab_currency', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving currency settings:', error);
      return false;
    }
  }
};

// Print service (unchanged)
export const printService = {
  printLabels: (requestData: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const barcode = `SIL${Date.now()}`;
    const content = `
      <html>
        <head>
          <title>Sample Labels</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .label { border: 2px solid #000; padding: 10px; margin: 10px 0; width: 300px; }
            .barcode { font-family: monospace; font-size: 12px; }
            .urgent { background-color: #ffebee; border-color: #f44336; }
          </style>
        </head>
        <body>
          <div class="label ${requestData.urgent ? 'urgent' : ''}">
            <h3>SIL Laboratory</h3>
            <p><strong>Patient:</strong> ${requestData.patient?.prenom} ${requestData.patient?.nom}</p>
            <p><strong>CNSS:</strong> ${requestData.patient?.numeroCNSS}</p>
            <p><strong>Date:</strong> ${requestData.appointment?.date} ${requestData.appointment?.time}</p>
            <p><strong>Analyses:</strong></p>
            <ul>
              ${requestData.analyses?.map((a: any) => `<li>${a.nom}</li>`).join('') || ''}
            </ul>
            <p class="barcode">${barcode}</p>
            ${requestData.urgent ? '<p style="color: red; font-weight: bold;">URGENT</p>' : ''}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  },

  printReceipt: (requestData: any, pricingData: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { border: 1px solid #ccc; padding: 20px; width: 400px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px solid #000; padding-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>SIL Laboratory</h2>
              <p>123 Medical Center, City, Country</p>
              <p>Phone: +1234567890 | Email: info@sil.lab</p>
            </div>
            
            <h3>Payment Receipt</h3>
            <p><strong>Patient:</strong> ${requestData.patient?.prenom} ${requestData.patient?.nom}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Request ID:</strong> ${requestData.id}</p>
            
            <h4>Analyses:</h4>
            ${requestData.analyses?.map((a: any) => `
              <div class="item">
                <span>${a.nom}</span>
                <span>${a.price} €</span>
              </div>
            `).join('') || ''}
            
            <div class="total">
              <div class="item">
                <span>Subtotal:</span>
                <span>${pricingData.subtotal} €</span>
              </div>
              <div class="item">
                <span>TVA:</span>
                <span>${pricingData.tvaTotal} €</span>
              </div>
              ${pricingData.discount > 0 ? `
                <div class="item">
                  <span>Discount (${pricingData.discount}%):</span>
                  <span>-${pricingData.discountAmount} €</span>
                </div>
              ` : ''}
              ${pricingData.advancePayment > 0 ? `
                <div class="item">
                  <span>Advance Payment:</span>
                  <span>-${pricingData.advancePayment} €</span>
                </div>
              ` : ''}
              <div class="item">
                <span><strong>Amount Due:</strong></span>
                <span><strong>${pricingData.amountDue} €</strong></span>
              </div>
            </div>
            
            <p style="margin-top: 20px; text-align: center;">
              Thank you for choosing SIL Laboratory
            </p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
};

// Stock Management Service
export const stockService = {
  // Dashboard
  getDashboard: () => apiRequest('/stock/dashboard'),
  
  // Products
  getProducts: (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stock/products?${queryString}`);
  },
  createProduct: (data: any) => apiRequest('/stock/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProduct: (id: string, data: any) => apiRequest(`/stock/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProduct: (id: string) => apiRequest(`/stock/products/${id}`, {
    method: 'DELETE',
  }),
  
  // Suppliers
  getSuppliers: (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stock/suppliers?${queryString}`);
  },
  createSupplier: (data: any) => apiRequest('/stock/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSupplier: (id: string, data: any) => apiRequest(`/stock/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSupplier: (id: string) => apiRequest(`/stock/suppliers/${id}`, {
    method: 'DELETE',
  }),
  
  // Orders
  getOrders: (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stock/orders?${queryString}`);
  },
  createOrder: (data: any) => apiRequest('/stock/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateOrder: (id: string, data: any) => apiRequest(`/stock/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteOrder: (id: string) => apiRequest(`/stock/orders/${id}`, {
    method: 'DELETE',
  }),
  
  // Stock Operations
  addStock: (data: any) => apiRequest('/stock/stock-in', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  useStock: (data: any) => apiRequest('/stock/stock-out', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  transferStock: (data: any) => apiRequest('/stock/transfer', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  adjustInventory: (data: any) => apiRequest('/stock/adjust', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // History and Reports
  getStockHistory: (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stock/history?${queryString}`);
  },
  getStockActivities: (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stock/activities?${queryString}`);
  },
  exportStockReport: (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stock/export?${queryString}`);
  },
};

// Debug function for development
export const debugRequests = () => {
  console.log('Debug function - API is now connected to PostgreSQL backend');
  console.log('Use the browser network tab to see API requests');
};

// Automate Services
export const automatesService = {
  getAutomates: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/automates?${queryString}`);
  },

  getAutomate: async (id: string) => {
    return await apiRequest(`/automates/${id}`);
  },

  createAutomate: async (data: any) => {
    return await apiRequest('/automates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateAutomate: async (id: string, data: any) => {
    return await apiRequest(`/automates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteAutomate: async (id: string) => {
    return await apiRequest(`/automates/${id}`, {
      method: 'DELETE'
    });
  },

  addCodeMapping: async (automateId: string, data: any) => {
    return await apiRequest(`/automates/${automateId}/codes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateCodeMapping: async (automateId: string, mappingId: string, data: any) => {
    return await apiRequest(`/automates/${automateId}/codes/${mappingId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteCodeMapping: async (automateId: string, mappingId: string) => {
    return await apiRequest(`/automates/${automateId}/codes/${mappingId}`, {
      method: 'DELETE'
    });
  },

  getTransferLogs: async (automateId: string, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/automates/${automateId}/logs?${queryString}`);
  },

  updateStatus: async (automateId: string, data: any) => {
    return await apiRequest(`/automates/${automateId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};
 