import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/auth-store';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    let active = true;

    fetchMe().then((user) => {
      if (!active) return;
      if (user) {
        toast.success('Google login successful.');
        navigate('/', { replace: true });
      } else {
        toast.error('Google login failed. Please try again.');
        navigate('/login', { replace: true });
      }
    });

    return () => {
      active = false;
    };
  }, [fetchMe, navigate]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-amber-500" />
      <p className="font-bold text-stone-700 dark:text-stone-200">Finishing login...</p>
    </div>
  );
}
