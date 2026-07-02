import { apiRequest } from '../../../services/api';

export async function login(payload) {
  return apiRequest('/login', 'POST', payload);
}
