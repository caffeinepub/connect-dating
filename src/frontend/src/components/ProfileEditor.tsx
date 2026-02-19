import { useState, useEffect } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import type { UserProfile } from '../backend';

interface ProfileEditorProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export default function ProfileEditor({ open, onClose, profile }: ProfileEditorProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [age, setAge] = useState(profile.age.toString());
  const [bio, setBio] = useState(profile.bio);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [nativeLanguageInput, setNativeLanguageInput] = useState('');
  const [nativeLanguages, setNativeLanguages] = useState<string[]>(profile.nativeLanguages);
  const [targetLanguageInput, setTargetLanguageInput] = useState('');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(profile.targetLanguages);

  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    setFullName(profile.fullName);
    setAge(profile.age.toString());
    setBio(profile.bio);
    setInterests(profile.interests);
    setNativeLanguages(profile.nativeLanguages);
    setTargetLanguages(profile.targetLanguages);
  }, [profile]);

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

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

    const updatedProfile: UserProfile = {
      ...profile,
      fullName: fullName.trim(),
      age: BigInt(parseInt(age)),
      bio: bio.trim(),
      interests,
      nativeLanguages,
      targetLanguages,
    };

    try {
      await saveProfile.mutateAsync(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Your Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest">Interests</Label>
            <div className="flex gap-2">
              <Input
                id="interest"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                placeholder="Add an interest"
              />
              <Button type="button" onClick={addInterest} variant="secondary">
                Add
              </Button>
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
            )}
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
                placeholder="Add a language"
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
                placeholder="Add a language"
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

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
