import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReconciliationInterface } from './pages/ReconciliationInterface';
import { Button } from './components/ui/button';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger,TooltipContent } from './components/ui/tooltip';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-[#025F4C] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#025F4C]">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if(user) {
    Featurebase("initialize_feedback_widget", {
      organization: "loophealth", // Replace this with your organization name, copy-paste the subdomain part from your Featurebase workspace url (e.g. https://*yourorg*.featurebase.app)
      theme: "light", // required
      placement: "right", // optional - remove to hide the floating button
      email: user?.email, // optional
      locale: "en", // Change the language, view all available languages from https://help.featurebase.app/en/articles/8879098-using-featurebase-in-my-language  
      metadata: null // Attach session-specific metadata to feedback. Refer to the advanced section for the details: https://help.featurebase.app/en/articles/3774671-advanced#7k8iriyap66
    });
    pendo.initialize({
      visitor: {
          id: user?.email,
          email: user?.email,
          firstName: user?.displayName,
        },
        account: {
            id: 'loop',
            accountName: 'loop-health',
        }
    });
  }
  
  return children;
}

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-[#025F4C] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#025F4C]">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}


function HelpButton() {
  const { user } = useAuth();
  if(user) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-9 px-4 bg-[#025F4C] hover:bg-[#025F4C]/90 text-white gap-2 shadow-lg"
              onClick={() => window.open('https://loophealth.featurebase.app/en/help', '_blank')}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Need help?</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Visit our help center for guides and documentation</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  } return null;
}
export default function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                <AuthenticatedRoute>
                  <LoginPage />
                </AuthenticatedRoute>
              } 
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <ReconciliationInterface />
                </ProtectedRoute>
              }
            />
          </Routes>
          <HelpButton />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}