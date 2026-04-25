import { ApiResponse, CompanyProfile } from '../types';
import { api } from './api';

export const companyProfileService = {
  getPublicProfile: async () => (await api.get<ApiResponse<CompanyProfile | null>>('/public/company-profile')).data,
};
