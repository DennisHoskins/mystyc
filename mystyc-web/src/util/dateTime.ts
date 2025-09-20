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

export function formatDateForDisplay(dateValue: string | Date | null | undefined, showTime = true): string | null {
  if (!dateValue) return null;
  
  const parsedDate = parseApiDate(dateValue);
  if (!parsedDate || isNaN(parsedDate.getTime())) return null;

  if (!showTime) {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(parsedDate);
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
}

export function formatTimeForDisplay(dateValue: string | Date | null | undefined): string | null {
  if (!dateValue) return null;
  
  const parsedDate = parseApiDate(dateValue);
  if (!parsedDate || isNaN(parsedDate.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
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

export function formatTimestampForComponent(timestamp: number | string): string {
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

export function formatDateRangeForComponent(
  startDate: string | Date | null | undefined, 
  endDate: string | Date | null | undefined, 
): string {
  if (!startDate || !endDate) {
    return "No date range";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid date range";
  }

  // Calculate the difference in days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Handle same day
  if (diffDays === 0) {
    return "Today";
  }

  // Handle single day difference
  if (diffDays === 1) {
    return "1 day";
  }

  // Handle days (up to 6 days)
  if (diffDays < 7) {
    return `${diffDays} days`;
  }

  // Handle weeks (7-29 days)
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    
    if (weeks === 1 && remainingDays === 0) {
      return "1 week";
    } else if (remainingDays === 0) {
      return `${weeks} weeks`;
    } else if (weeks === 1) {
      return `1 week, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`;
    } else {
      return `${weeks} weeks, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`;
    }
  }

  // Handle months (30-364 days)
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    
    if (months === 1 && remainingDays === 0) {
      return "1 month";
    } else if (remainingDays === 0) {
      return `${months} months`;
    } else if (months === 1) {
      return `1 month, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`;
    } else {
      return `${months} months, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`;
    }
  }

  // Handle years (365+ days)
  const years = Math.floor(diffDays / 365);
  const remainingDays = diffDays % 365;

  if (years === 1 && remainingDays === 0) {
    return "1 year";
  } else if (remainingDays === 0) {
    return `${years} years`;
  } else if (years === 1) {
    return `1 year, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`;
  } else {
    return `${years} years, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`;
  }
}