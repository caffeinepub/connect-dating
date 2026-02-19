import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, X } from 'lucide-react';
import type { UserProfile } from '../backend';

interface ProfileCardProps {
  profile: UserProfile;
  onLike: () => void;
  onPass: () => void;
  isLoading?: boolean;
}

export default function ProfileCard({ profile, onLike, onPass, isLoading }: ProfileCardProps) {
  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="w-full max-w-md mx-auto shadow-romantic animate-scale-in">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src="/assets/generated/profile-placeholder.dim_200x200.png" />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-display text-2xl font-bold">{profile.fullName}</h3>
            <p className="text-muted-foreground">Age {profile.age.toString()}</p>
          </div>
        </div>

        <p className="text-foreground leading-relaxed">{profile.bio}</p>

        {profile.nativeLanguages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Native Languages</p>
            <div className="flex flex-wrap gap-2">
              {profile.nativeLanguages.map((lang) => (
                <Badge key={lang} variant="secondary">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.targetLanguages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Learning</p>
            <div className="flex flex-wrap gap-2">
              {profile.targetLanguages.map((lang) => (
                <Badge key={lang} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2"
            onClick={onPass}
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
            Pass
          </Button>
          <Button
            size="lg"
            className="flex-1 gap-2"
            onClick={onLike}
            disabled={isLoading}
          >
            <Heart className="h-5 w-5" />
            Like
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
