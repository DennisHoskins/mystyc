export const toSentenceCase = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatStringForDisplay = (str: string): string => {
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => toSentenceCase(word))
    .join(' ');
};