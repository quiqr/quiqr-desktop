import axios from 'axios';
import { clearTokens } from './token-storage';

export async function logout(): Promise<void> {
  try {
    await axios.post('/api/auth/logout');
  } catch {
    // Even if the server call fails, clear local tokens
  }
  clearTokens();
  window.location.reload();
}
