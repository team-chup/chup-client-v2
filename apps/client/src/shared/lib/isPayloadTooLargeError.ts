interface ApiErrorType {
  response?: {
    status?: number;
  };
}

export const isPayloadTooLargeError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  (error as ApiErrorType).response?.status === 413;
