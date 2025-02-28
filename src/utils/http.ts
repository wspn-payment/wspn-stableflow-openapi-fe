type Interceptor = {
  request?: (config: RequestInit) => RequestInit;
  response?: (response: Response) => Promise<any>;
};

class HttpRequest {
  private baseURL: string;
  private timeout: number;
  private interceptors: Interceptor;
  constructor(config: { baseURL: string; timeout?: number }) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.interceptors = { request: undefined, response: undefined };
  }
  use(interceptors: Interceptor) {
    this.interceptors = { ...this.interceptors, ...interceptors };
  }
  async request<T>(url: string, config: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const mergedConfig = this.interceptors.request
        ? this.interceptors.request(config)
        : config;

      const fullUrl = `${this.baseURL}${url}`;
      const response = await fetch(fullUrl, {
        ...mergedConfig,
        signal: controller.signal,
      });

      let resdata = await response.json();
      if (resdata.code === 200) {
        resdata = resdata.data;
      }
      clearTimeout(timer);
      return resdata;
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  }

  get<T>(url: string, config?: RequestInit): Promise<T> {
    return this.request(url, { ...config, method: "GET" });
  }

  post<T>(url: string, data?: T, config?: RequestInit): Promise<T> {
    return this.request(url, {
      ...config,
      method: "POST",
      headers: { "Content-Type": "application/json", ...config?.headers },
      body: JSON.stringify(data),
    });
  }
}

const http = new HttpRequest({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

http.use({
  request: (config) => {
    return {
      ...config,
      headers: {
        ...config.headers,
      },
    };
  },
  response: async (response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }
    return response.json();
  },
});

export { http };
