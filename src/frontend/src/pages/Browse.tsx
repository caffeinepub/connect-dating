import { useState, useEffect } from 'react';
import { useGetActiveParticipants, useGetCallerUserProfile, useLikeUser } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProfileCard from '../components/ProfileCard';
import MatchNotification from '../components/MatchNotification';
import { Button } from '../components/ui/button';
import { Loader2, Heart } from 'lucide-react';
import { Status, type UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

export default function Browse() {
  const { identity } = useInternetIdentity();
  const { data: participants, isLoading: participantsLoading } = useGetActiveParticipants();
  const { data: currentProfile } = useGetCallerUserProfile();
  const likeUser = useLikeUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);

  const currentUserPrincipal = identity?.getPrincipal().toString();

  // Filter out current user and already matched users
  const browsableProfiles = participants ? participants.filter(([principal]) => {
    const principalStr = principal.toString();
    if (principalStr === currentUserPrincipal) return false;
    if (currentProfile?.matches.some((m) => m.toString() === principalStr)) return false;
    return true;
  }) : [];

  const currentProfile_browsing = browsableProfiles?.[currentIndex];

  const handleLike = async () => {
    if (!currentProfile_browsing) return;

    const [principal] = currentProfile_browsing;
    try {
      const isMutualMatch = await likeUser.mutateAsync(principal);
      if (isMutualMatch) {
        // Show match notification - we need to get the user's name
        // For now, we'll use the principal as identifier
        setMatchedUser(principal.toString());
        setTimeout(() => setMatchedUser(null), 5000);
      }
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to like user:', error);
    }
  };

  const handlePass = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  if (!identity) {
    return (
      <div className="container py-12 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground">Please login to browse profiles</p>
      </div>
    );
  }

  if (participantsLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!browsableProfiles || browsableProfiles.length === 0 || currentIndex >= browsableProfiles.length) {
    return (
      <div className="container py-12 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">No More Profiles</h2>
        <p className="text-muted-foreground mb-6">
          You've seen all available profiles. Check back later for new connections!
        </p>
        <Button onClick={() => setCurrentIndex(0)} variant="outline">
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Discover Connections</h1>
          <p className="text-muted-foreground">
            {browsableProfiles.length - currentIndex} profile{browsableProfiles.length - currentIndex !== 1 ? 's' : ''} to explore
          </p>
        </div>

        {matchedUser && <MatchNotification matchName="your match" />}

        <div className="animate-fade-in">
          <ProfileCard
            profile={{
              fullName: 'User',
              age: BigInt(0),
              bio: 'Loading profile...',
              interests: [],
              nativeLanguages: [],
              targetLanguages: [],
              lastActive: BigInt(0),
              matches: [],
              sentMatchRequests: [],
              receivedMatchRequests: [],
              currentStatus: Status.offline,
              lastMessageCheck: BigInt(0),
            }}
            onLike={handleLike}
            onPass={handlePass}
            isLoading={likeUser.isPending}
          />
        </div>
      </div>
    </div>
  );
}
