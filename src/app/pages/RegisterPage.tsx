import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, LoaderCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '../components/auth/AuthLayout';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuthStore } from '../../store/auth-store';
import { cn } from '../../lib/utils';

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

function validate(name: string, email: string, password: string, confirmPassword: string) {
  const errors: RegisterErrors = {};
  if (!name.trim()) errors.name = 'Name is required.';
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    const nextErrors = validate(name, email, password, confirmPassword);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await register({ name, email, password });
      toast.success('Account created. You can login now.');
      navigate('/login', { replace: true });
    } catch (submitError) {
      setErrors({
        form: submitError instanceof Error ? submitError.message : 'Register failed.',
      });
    }
  }

  return (
    <AuthLayout title="Create player" subtitle="Save scores, records, and your hard-earned drawing glory.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {(errors.form || error) && (
          <div className="flex gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errors.form || error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="register-name" className="text-stone-800 dark:text-stone-200">
            Name
          </Label>
          <Input
            id="register-name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            className="h-11 rounded-xl border-2 border-stone-200 bg-amber-50/60 focus-visible:border-amber-400 dark:border-stone-700 dark:bg-stone-950"
            placeholder="Ridho"
          />
          {errors.name && <p className="text-sm text-red-600 dark:text-red-300">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-stone-800 dark:text-stone-200">
            Email
          </Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            className="h-11 rounded-xl border-2 border-stone-200 bg-amber-50/60 focus-visible:border-amber-400 dark:border-stone-700 dark:bg-stone-950"
            placeholder="ridho@example.com"
          />
          {errors.email && <p className="text-sm text-red-600 dark:text-red-300">{errors.email}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="register-password" className="text-stone-800 dark:text-stone-200">
              Password
            </Label>
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              className="h-11 rounded-xl border-2 border-stone-200 bg-amber-50/60 focus-visible:border-amber-400 dark:border-stone-700 dark:bg-stone-950"
              placeholder="8+ characters"
            />
            {errors.password && <p className="text-sm text-red-600 dark:text-red-300">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm-password" className="text-stone-800 dark:text-stone-200">
              Confirm
            </Label>
            <PasswordInput
              id="register-confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              className="h-11 rounded-xl border-2 border-stone-200 bg-amber-50/60 focus-visible:border-amber-400 dark:border-stone-700 dark:bg-stone-950"
              placeholder="Repeat password"
            />
            {errors.confirmPassword && <p className="text-sm text-red-600 dark:text-red-300">{errors.confirmPassword}</p>}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            'h-11 w-full rounded-xl border-2 border-stone-800 bg-violet-500 font-bold text-white',
            'shadow-[3px_3px_0px_#1C1917] transition-all hover:bg-violet-600',
            'active:translate-y-[2px] active:shadow-[1px_1px_0px_#1C1917]',
            'dark:border-stone-500 dark:shadow-[3px_3px_0px_rgba(255,255,255,0.12)]',
          )}
        >
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Register
        </Button>

        <GoogleLoginButton disabled={isLoading} />

        <div className="space-y-2 pt-2 text-center text-sm text-stone-500 dark:text-stone-400">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-violet-600 hover:underline dark:text-violet-300">
              Login
            </Link>
          </p>
          <Link to="/join" className="inline-flex font-bold text-stone-700 hover:underline dark:text-stone-200">
            Continue as Guest
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
