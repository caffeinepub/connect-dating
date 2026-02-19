import { ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Heart, MessageCircle, Users, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const location = useLocation();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <Heart className="h-7 w-7 text-primary fill-primary group-hover:scale-110 transition-transform" />
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Connect
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/browse">
                <Button
                  variant={isActive('/browse') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Browse
                </Button>
              </Link>
              <Link to="/matches">
                <Button
                  variant={isActive('/matches') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Matches
                </Button>
              </Link>
              <Link to="/messages">
                <Button
                  variant={isActive('/messages') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Button>
              </Link>
              <Link to="/profile">
                <Button
                  variant={isActive('/profile') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
            </nav>
          )}

          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
            className="rounded-full"
          >
            {buttonText}
          </Button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-muted/30 py-8 mt-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Connect Dating</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
