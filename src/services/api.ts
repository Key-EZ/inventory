const BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : 'http://localhost:5000/api');

export function getHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('inventory_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: string = 'GET',
  body: any = null
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: getHeaders(),
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errText = await response.text();
    let errJson: any = {};
    try {
      errJson = JSON.parse(errText);
    } catch (e) {
      errJson = { message: errText };
    }
    throw new Error(errJson.message || `HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
