//const isDev = process.env.NODE_ENV === 'development';
const isDev = true;

export const logger = {
  log: (...args: any[]): void => {
    if (isDev) console.log(...args);
  },
  error: (...args: any[]): void => {
    console.error(...args);
  },
  warn: (...args: any[]): void => {
    if (isDev) console.warn(...args);
  },
  info: (...args: any[]): void => {
    if (isDev) console.info(...args);
  },
};