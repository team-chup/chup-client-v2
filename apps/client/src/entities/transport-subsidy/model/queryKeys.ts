export const transportSubsidyQueryKeys = {
  all: () => ['transport-subsidies'] as const,
  getTransportSubsidies: () => ['transport-subsidies', 'list'] as const,
} as const;
