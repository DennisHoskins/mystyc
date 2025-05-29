export function parseApiDate(dateString: string | Date | null | undefined): Date | null {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  
  // For date-only strings (birth dates), parse as UTC to avoid timezone shifts
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString + 'T00:00:00.000Z');
  }
  
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateForApi(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return date instanceof Date ? date.toISOString().slice(0, 10) : undefined;
}

export function formatDateForDisplay(dateValue: string | Date | null | undefined): string | null {
  if (!dateValue) return null;
  
  const parsedDate = parseApiDate(dateValue);
  if (!parsedDate || isNaN(parsedDate.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
}

export function formatDateForInput(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '';
  
  const parsedDate = parseApiDate(dateValue);
  if (!parsedDate || isNaN(parsedDate.getTime())) return '';

  return parsedDate.toISOString().slice(0, 10);
}