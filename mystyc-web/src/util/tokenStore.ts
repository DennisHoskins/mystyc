let currentToken: string | null = null;

export const tokenStore = {
  setToken: (token: string | null): void => {
    currentToken = token;
  },
  
  getToken: (): string | null => {
    return currentToken;
  },
  
  clearToken: (): void => {
    currentToken = null;
  }
};