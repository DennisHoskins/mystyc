export function parseApiDate(dateString: string | Date | null | undefined): Date | null {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateForApi(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return date instanceof Date ? date.toISOString() : undefined;
}