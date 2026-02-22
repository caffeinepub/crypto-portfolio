import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AuthGate from './components/auth/AuthGate';
import UserProfileSetupDialog from './components/auth/UserProfileSetupDialog';
import AppLayout from './components/layout/AppLayout';
import PortfolioSummaryCards from './components/portfolio/PortfolioSummaryCards';
import HoldingsPanel from './components/holdings/HoldingsPanel';
import PerformancePanel from './components/performance/PerformancePanel';
import PerformanceVisualizationPanel from './components/performance/PerformanceVisualizationPanel';
import TransactionHistoryPanel from './components/transactions/TransactionHistoryPanel';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppLayout>
          <AuthGate />
        </AppLayout>
        <Toaster />
      </ThemeProvider>
    );
  }

  if (profileLoading || !isFetched) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        </AppLayout>
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppLayout>
        {showProfileSetup && <UserProfileSetupDialog />}
        <div className="space-y-8 pb-12">
          <PortfolioSummaryCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <HoldingsPanel />
              <PerformancePanel />
            </div>
            <div className="lg:col-span-1">
              <PerformanceVisualizationPanel />
            </div>
          </div>
          <TransactionHistoryPanel />
        </div>
      </AppLayout>
      <Toaster />
    </ThemeProvider>
  );
}
