import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Heart, MessageCircle, Users, Sparkles } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Home() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="container py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 mb-16">
        <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-romantic">
          <img
            src="/assets/generated/hero-banner.dim_1200x600.png"
            alt="Connect Dating"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-4 bg-clip-text text-transparent">
          Find Your Connection
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Connect with people who share your interests and language learning goals. Build meaningful
          relationships while exploring new cultures together.
        </p>

        {!isAuthenticated && (
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/browse">
              <Button size="lg" className="gap-2 rounded-full px-8">
                <Heart className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/browse">
              <Button size="lg" className="gap-2 rounded-full px-8">
                <Users className="h-5 w-5" />
                Start Browsing
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center space-y-3 p-6 rounded-2xl bg-card border border-border/50 hover:shadow-soft transition-shadow">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold">Browse Profiles</h3>
          <p className="text-muted-foreground">
            Discover people with shared interests and language learning goals
          </p>
        </div>

        <div className="text-center space-y-3 p-6 rounded-2xl bg-card border border-border/50 hover:shadow-soft transition-shadow">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold">Make Matches</h3>
          <p className="text-muted-foreground">
            Like profiles and get notified when there's a mutual connection
          </p>
        </div>

        <div className="text-center space-y-3 p-6 rounded-2xl bg-card border border-border/50 hover:shadow-soft transition-shadow">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold">Start Chatting</h3>
          <p className="text-muted-foreground">
            Message your matches and build meaningful connections
          </p>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="text-center mt-16 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-chart-2/10 to-chart-4/10 border border-primary/20">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="font-display text-3xl font-bold mb-3">Ready to Connect?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join our community and start building meaningful relationships today
          </p>
          <Link to="/browse">
            <Button size="lg" className="gap-2 rounded-full px-8">
              <Heart className="h-5 w-5" />
              Join Now
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
