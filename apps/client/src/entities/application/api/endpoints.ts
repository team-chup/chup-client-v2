export const applicationUrl = {
  getApplications: () => '/api/applications',
  postExternalApplication: () => '/api/applications/external',
  postApplication: (jobId: number) => `/api/jobs/${jobId}/applications`,
} as const;
