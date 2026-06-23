import { SignUp } from '@clerk/clerk-react';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f5f0e8' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center text-lg font-bold" style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}>
            T
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#2c2416' }}>Create Account</h1>
          <p className="text-sm mt-1" style={{ color: '#8a7d68' }}>Join TimelineApp today</p>
        </div>

        <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#fefcf7', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <SignUp
            signInUrl="/login"
            appearance={{
              elements: {
                card: { boxShadow: 'none', borderRadius: '0', padding: '2rem' },
                header: { display: 'none' },
                socialButtonsBlockButton: {
                  backgroundColor: '#f5f0e8',
                  border: '1px solid #c8bfad',
                  color: '#2c2416',
                  borderRadius: '0.375rem',
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
                  borderRadius: '0.375rem',
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
          Already have an account?{' '}
          <a href="/login" className="font-medium" style={{ color: '#7b1fa2' }}>Sign In</a>
        </p>
      </div>
    </div>
  )
};