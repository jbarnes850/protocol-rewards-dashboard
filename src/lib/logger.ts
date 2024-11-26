export const logger = {
  error: (message: string, error?: any) => {
    console.error(message, error);
  },
  info: (message: string, data?: any) => {
    console.info(message, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data);
  },
}; 