export const transportSubsidyQueryKeys = {
  all: () => ['transport-subsidies'] as const,
  getTransportSubsidyStudents: () => ['transport-subsidies', 'students'] as const,
  getTransportSubsidies: (userId?: number) =>
    userId
      ? (['transport-subsidies', 'list', userId] as const)
      : (['transport-subsidies', 'list'] as const),
} as const;
