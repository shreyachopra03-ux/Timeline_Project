import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';

export default function TokenSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    getToken().then((token) => {
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    });
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}
