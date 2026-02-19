import { useState } from 'react';
import { useCreateUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { Status, type ShortProfile } from '../backend';

interface ProfileSetupProps {
  open: boolean;
}

export default function ProfileSetup({ open }: ProfileSetupProps) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [nativeLanguageInput, setNativeLanguageInput] = useState('');
  const [nativeLanguages, setNativeLanguages] = useState<string[]>([]);
  const [targetLanguageInput, setTargetLanguageInput] = useState('');
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);

  const createProfile = useCreateUserProfile();

  const addNativeLanguage = () => {
    if (nativeLanguageInput.trim() && !nativeLanguages.includes(nativeLanguageInput.trim())) {
      setNativeLanguages([...nativeLanguages, nativeLanguageInput.trim()]);
      setNativeLanguageInput('');
    }
  };

  const removeNativeLanguage = (lang: string) => {
    setNativeLanguages(nativeLanguages.filter((l) => l !== lang));
  };

  const addTargetLanguage = () => {
    if (targetLanguageInput.trim() && !targetLanguages.includes(targetLanguageInput.trim())) {
      setTargetLanguages([...targetLanguages, targetLanguageInput.trim()]);
      setTargetLanguageInput('');
    }
  };

  const removeTargetLanguage = (lang: string) => {
    setTargetLanguages(targetLanguages.filter((l) => l !== lang));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !age || !bio.trim()) {
      return;
    }

    const profileData: ShortProfile = {
      fullName: fullName.trim(),
      age: BigInt(parseInt(age)),
      bio: bio.trim(),
      nativeLanguages,
      targetLanguages,
      currentStatus: Status.offline,
    };

    try {
      await createProfile.mutateAsync(profileData);
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Welcome to Connect! 💕</DialogTitle>
          <DialogDescription>
            Let's create your profile to start connecting with amazing people.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nativeLanguage">Native Languages</Label>
            <div className="flex gap-2">
              <Input
                id="nativeLanguage"
                value={nativeLanguageInput}
                onChange={(e) => setNativeLanguageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNativeLanguage();
                  }
                }}
                placeholder="e.g., English"
              />
              <Button type="button" onClick={addNativeLanguage} variant="secondary">
                Add
              </Button>
            </div>
            {nativeLanguages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {nativeLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="gap-1">
                    {lang}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeNativeLanguage(lang)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetLanguage">Languages You Want to Learn</Label>
            <div className="flex gap-2">
              <Input
                id="targetLanguage"
                value={targetLanguageInput}
                onChange={(e) => setTargetLanguageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTargetLanguage();
                  }
                }}
                placeholder="e.g., Spanish"
              />
              <Button type="button" onClick={addTargetLanguage} variant="secondary">
                Add
              </Button>
            </div>
            {targetLanguages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {targetLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="gap-1">
                    {lang}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTargetLanguage(lang)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createProfile.isPending || !fullName.trim() || !age || !bio.trim()}
          >
            {createProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
