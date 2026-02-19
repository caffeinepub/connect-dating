import { useEffect } from 'react';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';

interface MatchNotificationProps {
  matchName: string;
}

export default function MatchNotification({ matchName }: MatchNotificationProps) {
  useEffect(() => {
    toast.success(
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <img
            src="/assets/generated/heart-icon.dim_64x64.png"
            alt="Match"
            className="h-12 w-12"
          />
        </div>
        <div>
          <p className="font-semibold">It's a Match! 💕</p>
          <p className="text-sm text-muted-foreground">
            You and {matchName} liked each other!
          </p>
        </div>
      </div>,
      {
        duration: 5000,
      }
    );
  }, [matchName]);

  return null;
}
