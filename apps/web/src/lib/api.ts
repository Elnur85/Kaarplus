import { API_URL } from "./constants";

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface ApiError {
  error: string;
  details?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const isAbsoluteBase = this.baseUrl.startsWith("http://") || this.baseUrl.startsWith("https://");
    const baseUrl = isAbsoluteBase
      ? `${this.baseUrl.replace(/\/$/, "")}/`
      : typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost";

    const target = isAbsoluteBase
      ? path.replace(/^\//, "")
      : `${this.baseUrl}${path}`;

    const url = new URL(target, baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return isAbsoluteBase ? url.toString() : `${url.pathname}${url.search}`;
  }

  async request<T>(path: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorBody.error);
    }

    return response.json();
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET", params });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_URL);
