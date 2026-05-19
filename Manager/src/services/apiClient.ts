// API configuration and base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  detail?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private setToken(token: string): void {
    localStorage.setItem("access_token", token);
  }

  private removeToken(): void {
    localStorage.removeItem("access_token");
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.error || "An error occurred");
    }
    return response.json();
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(includeAuth),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(includeAuth),
    });
    return this.handleResponse<T>(response);
  }

  async login(username: string, password: string): Promise<{ access_token: string; user: any }> {
    const response = await this.post<{ access_token: string; user: any }>(
      "/auth/login",
      { username, password },
      false
    );
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    return response;
  }

  async register(email: string, username: string, full_name: string, password: string): Promise<any> {
    return this.post(
      "/auth/register",
      { email, username, full_name, password, role: "agent" },
      false
    );
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken_(): string | null {
    return this.getToken();
  }
}

export const apiClient = new ApiClient();
