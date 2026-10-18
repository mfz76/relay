// Centralized API client for Relay backend

const BASE_URL = '/api'

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  try {
    const res = await fetch(url, { ...options, headers })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || `Server returned ${res.status}`)
    }
    return await res.json()
  } catch (error) {
    // If proxy failed, attempt direct localhost:8000
    if (url.startsWith('/api')) {
      try {
        const directUrl = `http://localhost:8000${endpoint}`
        const resDirect = await fetch(directUrl, { ...options, headers })
        if (!resDirect.ok) {
          const errData = await resDirect.json().catch(() => ({}))
          throw new Error(errData.detail || `Server returned ${resDirect.status}`)
        }
        return await resDirect.json()
      } catch (fallbackError) {
        console.error(`API request error on ${endpoint}:`, fallbackError)
        throw fallbackError
      }
    }
    console.error(`API request error on ${endpoint}:`, error)
    throw error
  }
}

export const api = {
  // Integrations status
  getIntegrations: () => request('/integrations/status'),
  getIntegrationStates: () => request('/integrations/states'),
  toggleIntegration: (name) => request(`/integrations/${name}/toggle`, { method: 'PATCH' }),

  // Workflows CRUD
  getWorkflows: () => request('/workflows'),
  getWorkflow: (id) => request(`/workflows/${id}`),
  createWorkflow: (data) => request('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflow: (id, data) => request(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleWorkflow: (id) => request(`/workflows/${id}/activate`, { method: 'PATCH' }),
  deleteWorkflow: (id) => request(`/workflows/${id}`, { method: 'DELETE' }),

  // Live Execution & Triage
  submitInquiry: (data) => request('/inquiry', { method: 'POST', body: JSON.stringify(data) }),
  testRun: (data) => request('/test-run', { method: 'POST', body: JSON.stringify(data) }),
  getExecutions: () => request('/executions'),
}
