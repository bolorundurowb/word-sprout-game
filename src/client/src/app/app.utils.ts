export const parseErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  return (error as any)?.error?.message ?? 'Something went wrong';
}
