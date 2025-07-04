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
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
}

export function formatDateForInput(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '';
  
  const parsedDate = parseApiDate(dateValue);
  if (!parsedDate || isNaN(parsedDate.getTime())) return '';

  return parsedDate.toISOString().slice(0, 10);
}

export function formatTimestampForComponent(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return formatDateForComponent(date);
}
  
export function formatDateForComponent(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '';

  const parsedDate = parseApiDate(dateValue);
  if (!parsedDate || isNaN(parsedDate.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  
  // Calculate time differences
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // Build relative time string
  let relativeTime = "";
  if (days > 0) {
    relativeTime = `${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) {
      relativeTime += `, ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  } else if (hours > 0) {
    relativeTime = `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    relativeTime = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  // Format absolute time
  const timeStr = parsedDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: false 
  });
  const dateStr = parsedDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return `${relativeTime} (${timeStr} ${dateStr})`;
};
