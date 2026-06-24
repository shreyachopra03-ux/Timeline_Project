import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';

export default function TokenSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    });
  }, [getToken]);

  return null;
}
