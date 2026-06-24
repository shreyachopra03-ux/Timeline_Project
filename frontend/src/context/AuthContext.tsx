import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, useUser, ClerkProvider } from '@clerk/clerk-react';
import TokenSync from '../components/TokenSync';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file')
};

interface AuthContextType {
  isSignedIn: boolean
  userId: string | undefined
  userName: string | null | undefined
  isLoaded: boolean
};

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: !!isSignedIn,
        userId: user?.id,
        userName: user?.fullName,
        isLoaded
      }}
    >
      <TokenSync />
      {children}
    </AuthContext.Provider>
  )
};

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY!} proxyUrl="/clerk-proxy" afterSignOutUrl="/login">
      <AuthProviderInner>{children}</AuthProviderInner>
    </ClerkProvider>
  )
};

export function useAuthCtx() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthCtx must be used within AuthProvider')
  return ctx
};

export { useAuth, useUser } from '@clerk/clerk-react';