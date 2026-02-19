import { useState, useEffect, useRef } from 'react';
import { useSendMessage } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send } from 'lucide-react';
import type { Message, UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

interface ConversationViewProps {
  partner: UserProfile;
  partnerPrincipal: Principal;
  messages: Message[];
}

export default function ConversationView({
  partner,
  partnerPrincipal,
  messages,
}: ConversationViewProps) {
  const [messageText, setMessageText] = useState('');
  const { identity } = useInternetIdentity();
  const sendMessage = useSendMessage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserPrincipal = identity?.getPrincipal().toString();

  // Filter messages for this conversation
  const conversationMessages = messages.filter(
    (msg) =>
      (msg.sender.toString() === currentUserPrincipal &&
        msg.recipient.toString() === partnerPrincipal.toString()) ||
      (msg.sender.toString() === partnerPrincipal.toString() &&
        msg.recipient.toString() === currentUserPrincipal)
  );

  // Sort by timestamp
  const sortedMessages = [...conversationMessages].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessage.mutateAsync({
        recipient: partnerPrincipal,
        message: messageText.trim(),
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const partnerInitials = partner.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/assets/generated/profile-placeholder.dim_200x200.png" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {partnerInitials}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="font-display">{partner.fullName}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {sortedMessages.length === 0 ? (
              <div className="text-center py-8">
                <img
                  src="/assets/generated/message-icon.dim_48x48.png"
                  alt="Messages"
                  className="h-12 w-12 mx-auto mb-3 opacity-50"
                />
                <p className="text-muted-foreground">No messages yet. Say hello! 👋</p>
              </div>
            ) : (
              sortedMessages.map((msg, idx) => {
                const isCurrentUser = msg.sender.toString() === currentUserPrincipal;
                return (
                  <div
                    key={idx}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sendMessage.isPending || !messageText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
