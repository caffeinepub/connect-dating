import { useGetMatches, useGetCallerUserProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Loader2, Heart, MessageCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Matches() {
  const { identity } = useInternetIdentity();
  const { data: matches, isLoading } = useGetMatches();
  const { data: currentProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  if (!identity) {
    return (
      <div className="container py-12 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground">Please login to view your matches</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter matches to only show mutual matches
  const mutualMatches = matches?.filter((match) =>
    currentProfile?.matches.some((m) => m.toString() === match.user.toString())
  );

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Your Matches</h1>
          <p className="text-muted-foreground">
            {mutualMatches?.length || 0} mutual connection{mutualMatches?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {!mutualMatches || mutualMatches.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-display text-2xl font-bold mb-2">No Matches Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start browsing profiles to find your perfect match!
            </p>
            <Button onClick={() => navigate({ to: '/browse' })}>Browse Profiles</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {mutualMatches.map((match) => (
              <Card key={match.user.toString()} className="hover:shadow-soft transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/assets/generated/profile-placeholder.dim_200x200.png" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="font-display text-lg">
                        {match.user.toString().slice(0, 8)}...
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Matched {new Date(Number(match.timestamp) / 1000000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full gap-2"
                    onClick={() =>
                      navigate({
                        to: '/messages',
                        search: { partner: match.user.toString() },
                      })
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
