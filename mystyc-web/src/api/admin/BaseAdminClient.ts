import { getDeviceInfo } from '../apiClient';
import { logger } from '@/util/logger';

import { BaseAdminQuery, AdminStatsQuery } from 'mystyc-common/admin';
import { handleSessionError } from '@/util/sessionErrorHandler'; 

export class BaseAdminClient {
  protected readonly API_BASE_URL = '/api';

  protected async fetchWithAuth(url: string, method?: "GET" | "POST", options: RequestInit = {}) {
    try {
      const bodyData = options.body ? JSON.parse(options.body as string) : {};
      const requestBody = {
        ...bodyData,
        method: method,
        deviceInfo: getDeviceInfo(),
        clientTimestamp: new Date().toISOString()
      };

      const response = await fetch(url, {
        method: 'POST',
        ...options,
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          await handleSessionError(errorData.error, 'admin/fetchWithAuth');
        }
        throw new Error(errorData?.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch(err) {
      logger.error('fetchWithAuth failed:', err);
      throw err;
    }
  }

  protected buildQueryString(query?: Partial<BaseAdminQuery>): string {
    if (!query) return '';
    
    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  protected buildQueryParams(obj: any, prefix = ''): URLSearchParams {
    const params = new URLSearchParams();
    
    if (!obj || typeof obj !== 'object') return params;
    
    Object.entries(obj).forEach(([key, value]) => {
      const paramKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        return;
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          params.append(paramKey, value.join(','));
        }
      } else if (typeof value === 'object' && value.constructor === Object) {
        const nestedParams = this.buildQueryParams(value, paramKey);
        nestedParams.forEach((val, nestedKey) => {
          params.append(nestedKey, val);
        });
      } else {
        params.append(paramKey, String(value));
      }
    });
    
    return params;
  }

  protected buildStatsQueryString(query?: Partial<AdminStatsQuery>): string {
    if (!query) return '';
    
    const params = this.buildQueryParams(query);
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }
}