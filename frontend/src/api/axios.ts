import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7779', 
  withCredentials: true,
  timeout: 300000, 
});

api.interceptors.request.use(async (config) => {
  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      const token = await clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

export default api;
