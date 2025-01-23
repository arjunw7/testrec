import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left section with product info */}
      <div className="flex-1 bg-[#025F4C] p-12 flex flex-col">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[#BCDD33] text-3xl font-bold">inSync</h1>
          <span className="text-[#BCDD33]/80 text-sm">by Loop</span>
        </div>

        <div className="mt-auto">
          <h2 className="text-white text-5xl font-bold leading-tight">
            Smart and Accurate <br />Reconciliation
          </h2>
          
          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4 text-white/90">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 7L13 15L9 11L3 17M21 7H15M21 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Automated Matching</h3>
                <p className="text-white/70">Smart algorithms automatically match and reconcile employee records across HR, insurer, and internal systems.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-white/90">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Error Detection</h3>
                <p className="text-white/70">Instantly identify discrepancies and data mismatches across different data sources.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-white/90">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Secure Processing</h3>
                <p className="text-white/70">Enterprise-grade security ensures your sensitive employee data remains protected.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-white/10">
            <div className="flex items-center gap-6">
              <div className="text-white/90">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-white/70">Accuracy Rate</div>
              </div>
              <div className="text-white/90">
                <div className="text-3xl font-bold">75%</div>
                <div className="text-sm text-white/70">Time Saved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right section with login */}
      <div className="w-[480px] flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full flex items-center justify-between px-6 py-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors group h-auto"
          >
            <div className="flex items-center gap-4">
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              <span className="font-medium">
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </Button>
        </div>
      </div>
    </div>
  );
}