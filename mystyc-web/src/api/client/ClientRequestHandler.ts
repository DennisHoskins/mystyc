import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  action?: string;
  data?: any;
  headers?: Record<string, string>;
}

export class ClientRequestHandler {
  static async makeRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', action, data, headers = {} } = options;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Build request body
    let body: any = {};
    if (action) {
      body.action = action;
    }
    if (data) {
      if (action) {
        body.dto = data;
      } else {
        body = data;
      }
    }

    if (Object.keys(body).length > 0) {
      logger.log('API request body:', JSON.stringify(body, null, 2));
      requestOptions.body = JSON.stringify(body);
    }

    logger.log(`API request: ${method} ${endpoint}`, requestOptions);

    try {
      const response = await fetch(endpoint, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API error: ${response.status}`;
        logger.error('API error response:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {}

        const apiError = new Error(errorMessage);
        (apiError as any).status = response.status;
        (apiError as any).response = { status: response.status, data: errorText };

        errorHandler.processError(apiError, {
          component: 'ClientRequestHandler',
          action: `${method} ${endpoint}`,
          additional: { status: response.status },
        });

        throw apiError;
      }

      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      errorHandler.processError(error as Error, {
        component: 'ClientRequestHandler',
        action: `${method} ${endpoint}`,
        additional: {
          isOnline: navigator.onLine,
          url: endpoint,
        },
      });
      throw error;
    }
  }
}