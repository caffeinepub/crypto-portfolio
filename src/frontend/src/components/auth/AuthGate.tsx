import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, TrendingUp, Shield, BarChart3 } from 'lucide-react';

export default function AuthGate() {
  const { login, loginStatus, loginError } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';
  const isError = loginStatus === 'loginError';

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/assets/generated/portfolio-logo.dim_512x512.png" 
              alt="Crypto Portfolio" 
              className="h-20 w-20"
            />
          </div>
          <CardTitle className="text-3xl">Welcome to Crypto Portfolio</CardTitle>
          <CardDescription className="text-base">
            Track your crypto investments with live prices and performance analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <Wallet className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium">Manual Holdings</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium">Live Prices</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <BarChart3 className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium">Performance</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <Shield className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium">Secure Auth</p>
            </div>
          </div>

          {isError && loginError && (
            <Alert variant="destructive">
              <AlertDescription>{loginError.message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your portfolio data is private and secured by Internet Identity
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
