import { useState, useEffect } from 'react';
import { useGetMessages, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSearch } from '@tanstack/react-router';
import ConversationView from '../components/ConversationView';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Loader2, MessageCircle } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { Status, type UserProfile } from '../backend';

export default function Messages() {
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading } = useGetMessages();
  const { data: currentProfile } = useGetCallerUserProfile();
  const search = useSearch({ strict: false }) as { partner?: string };
  const [selectedPartner, setSelectedPartner] = useState<Principal | null>(null);

  const currentUserPrincipal = identity?.getPrincipal().toString();

  // Get unique conversation partners
  const conversationPartners = messages
    ? Array.from(
        new Set(
          messages
            .map((msg) => {
              if (msg.sender.toString() === currentUserPrincipal) {
                return msg.recipient.toString();
              } else if (msg.recipient.toString() === currentUserPrincipal) {
                return msg.sender.toString();
              }
              return null;
            })
            .filter((p): p is string => p !== null)
        )
      )
    : [];

  // Set initial selected partner from URL or first conversation
  useEffect(() => {
    if (search.partner) {
      try {
        setSelectedPartner(Principal.fromText(search.partner));
      } catch (error) {
        console.error('Invalid partner principal:', error);
      }
    } else if (conversationPartners.length > 0 && !selectedPartner) {
      setSelectedPartner(Principal.fromText(conversationPartners[0]));
    }
  }, [search.partner, conversationPartners, selectedPartner]);

  if (!identity) {
    return (
      <div className="container py-12 text-center">
        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground">Please login to view your messages</p>
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

  if (conversationPartners.length === 0) {
    return (
      <div className="container py-12 text-center">
        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">No Messages Yet</h2>
        <p className="text-muted-foreground">
          Start a conversation with your matches to see messages here
        </p>
      </div>
    );
  }

  // Create mock profile for selected partner (in real app, fetch from backend)
  const selectedPartnerProfile: UserProfile | null = selectedPartner
    ? {
        fullName: selectedPartner.toString().slice(0, 8) + '...',
        age: BigInt(0),
        bio: '',
        interests: [],
        nativeLanguages: [],
        targetLanguages: [],
        lastActive: BigInt(0),
        matches: [],
        sentMatchRequests: [],
        receivedMatchRequests: [],
        currentStatus: Status.offline,
        lastMessageCheck: BigInt(0),
      }
    : null;

  return (
    <div className="container py-6">
      <div className="grid md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h2 className="font-display text-xl font-semibold">Conversations</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-2 space-y-1">
                {conversationPartners.map((partnerStr) => {
                  const isSelected = selectedPartner?.toString() === partnerStr;
                  return (
                    <button
                      key={partnerStr}
                      onClick={() => setSelectedPartner(Principal.fromText(partnerStr))}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/assets/generated/profile-placeholder.dim_200x200.png" />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm truncate">
                          {partnerStr.slice(0, 12)}...
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Conversation View */}
        <div className="h-full">
          {selectedPartner && selectedPartnerProfile && messages ? (
            <ConversationView
              partner={selectedPartnerProfile}
              partnerPrincipal={selectedPartner}
              messages={messages}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
