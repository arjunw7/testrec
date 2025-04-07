import companies from '../mock/companies.json';
import policies from '../mock/policies.json';
import members from '../mock/members.json';
import { Company, Policy } from '../types';

export const api = {
  getCompanies: async (searchTerm?: string): Promise<Company[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allCompanies = companies.data?.companies;
    if (!searchTerm) return allCompanies;
    
    return allCompanies.filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  getPolicies: async (companyId: string): Promise<Policy[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return policies.data.map(policy => ({
      id: policy.id,
      name: policy.nickName,
      company_id: companyId,
      nickName: policy.nickName,
      policyType: policy.policyType,
      insurerLogo: policy.insurerLogo,
      insurerName: policy.insurerName,
      sumAssuredSlabs: policy.sumAssuredSlabs
    }));
  },

  getGenomeRoster: async (policyId: string): Promise<any[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter members by policy ID
    return members.data.users?.filter(member => member.policyId === policyId);
  }
};