import { API_BASE_URL } from '@chup/core/shared';

export const transportSubsidyUrl = {
  getStudents: () => '/api/admin/transport-subsidies/students',
  getTransportSubsidies: (userId?: number) =>
    userId ? `/api/admin/transport-subsidies?userId=${userId}` : '/api/admin/transport-subsidies',
  patchResult: (applicationId: number) => `/api/admin/transport-subsidies/${applicationId}/result`,
  getEvidence: (applicationId: number) =>
    `${API_BASE_URL}/api/admin/transport-subsidies/${applicationId}/evidence`,
} as const;
