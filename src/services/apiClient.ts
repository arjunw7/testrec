import { auth } from '../lib/firebase';

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL;
    this.token = null;
  }

  private async getToken() {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }
    return await auth.currentUser.getIdToken();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, refresh and retry
      const newToken = await this.getToken();
      return this.request(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
          ...options.headers,
        },
      });
    }

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return response.json();
  }

  async getCompanies() {
    return this.request('/company');
  }

  async getPolicies(companyId: string) {
    return this.request(`/policyPlan/active/${companyId}`);
  }

  async getGenomeRoster(companyId: string, policyId: string) {
    return this.request(`/user/fetchMembersByPolicy/${companyId}/${policyId}`);
  }
}

export const apiClient = new ApiClient();
