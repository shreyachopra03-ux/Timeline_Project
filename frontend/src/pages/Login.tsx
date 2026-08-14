import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-16 overflow-x-hidden overflow-y-auto"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #fdfaf3 0%, #f5f0e8 55%, #ece3d3 100%)'
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: '#2c2416', color: '#fefcf7', boxShadow: '0 8px 20px rgba(44,36,22,0.25)' }}
          >
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#2c2416' }}>Welcome Back</h1>
          <p className="text-sm mt-1.5" style={{ color: '#8a7d68' }}>Sign in to your TimelineApp</p>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            backgroundColor: '#fefcf7',
            boxShadow: '0 20px 40px -12px rgba(44,36,22,0.18), 0 1px 2px rgba(44,36,22,0.06)',
            border: '1px solid #ece3d3'
          }}
        >
          <SignIn
            signUpUrl="/register"
            appearance={{
              elements: {
                rootBox: { width: '100%' },
                cardBox: { width: '100%', boxShadow: 'none' },
                card: { boxShadow: 'none', borderRadius: '0', padding: '2rem', width: '100%' },
                header: { display: 'none' },
                socialButtonsBlockButton: {
                  backgroundColor: '#f5f0e8',
                  border: '1px solid #c8bfad',
                  color: '#2c2416',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                },
                formFieldLabel: {
                  color: '#2c2416',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                },
                formFieldInput: {
                  backgroundColor: '#f5f0e8',
                  border: '1px solid #c8bfad',
                  borderRadius: '0.5rem',
                  color: '#2c2416',
                  fontSize: '0.875rem',
                  padding: '0.625rem 0.75rem'
                },
                formButtonPrimary: {
                  backgroundColor: '#2c2416',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  padding: '0.625rem 1rem',
                  ':hover': { backgroundColor: '#3d3224' }
                },
                footerAction: { display: 'none' },
                dividerLine: { backgroundColor: '#c8bfad' },
                dividerText: { color: '#8a7d68' },
              }
            }}
          />
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#8a7d68' }}>
          Don't have an account?{' '}
          <a href="/register" className="font-medium" style={{ color: '#7b1fa2' }}>Register</a>
        </p>
      </div>
    </div>
)};
