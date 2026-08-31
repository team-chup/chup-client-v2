interface ServerValidationErrorType {
  message?: string;
  fieldErrors: Record<string, string>;
}

export const getServerValidationError = (error: unknown): ServerValidationErrorType => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return { fieldErrors: {} };
  }

  const response = error.response;

  if (typeof response !== 'object' || response === null || !('data' in response)) {
    return { fieldErrors: {} };
  }

  const data = response.data;

  if (typeof data !== 'object' || data === null) return { fieldErrors: {} };

  const validationData =
    'data' in data && typeof data.data === 'object' && data.data !== null ? data.data : data;
  const fieldErrorSource =
    'fieldErrors' in validationData &&
    typeof validationData.fieldErrors === 'object' &&
    validationData.fieldErrors !== null
      ? validationData.fieldErrors
      : 'errors' in validationData &&
          typeof validationData.errors === 'object' &&
          validationData.errors !== null
        ? validationData.errors
        : {};
  const fieldErrors = Object.fromEntries(
    Object.entries(fieldErrorSource).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

  return {
    message: 'message' in data && typeof data.message === 'string' ? data.message : undefined,
    fieldErrors,
  };
};
