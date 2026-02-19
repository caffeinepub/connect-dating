import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProfileEditor from '../components/ProfileEditor';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Loader2, Edit, User } from 'lucide-react';

export default function MyProfile() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (!identity) {
    return (
      <div className="container py-12 text-center">
        <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground">Please login to view your profile</p>
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

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">Please complete your profile setup</p>
      </div>
    );
  }

  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-romantic">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src="/assets/generated/profile-placeholder.dim_200x200.png" />
                  <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="font-display text-3xl">{profile.fullName}</CardTitle>
                  <p className="text-muted-foreground">Age {profile.age.toString()}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="font-semibold mb-2">About Me</h3>
              <p className="text-foreground leading-relaxed">{profile.bio}</p>
            </div>

            {profile.interests.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.nativeLanguages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Native Languages</h3>
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
              <div>
                <h3 className="font-semibold mb-2">Learning</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.targetLanguages.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {profile.matches.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Matches</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {profile.sentMatchRequests.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Likes Sent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditing && (
        <ProfileEditor
          open={isEditing}
          onClose={() => setIsEditing(false)}
          profile={profile}
        />
      )}
    </div>
  );
}
