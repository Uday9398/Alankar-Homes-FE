export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    // Format validation errors list from Joi schemas
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      return error.errors.map((err: any) => err.message).join('. ');
    }

    if (error.message) {
      return error.message;
    }
  }

  return 'An unexpected error occurred';
};
