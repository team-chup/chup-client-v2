export const transportSubsidyUrl = {
  getTransportSubsidies: () => '/api/transport-subsidies',
  postTransportSubsidy: (companyName: string, interviewAt: string) =>
    '/api/transport-subsidies?companyName=' +
    encodeURIComponent(companyName) +
    '&interviewAt=' +
    encodeURIComponent(interviewAt),
} as const;
