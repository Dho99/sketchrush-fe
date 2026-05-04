import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AlertCircle, LoaderCircle, LogIn } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "../components/auth/AuthLayout";
import { GoogleLoginButton } from "../components/auth/GoogleLoginButton";
import { PasswordInput } from "../components/auth/PasswordInput";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuthStore } from "../../store/auth-store";
import { cn } from "../../lib/utils";

type LoginErrors = {
    email?: string;
    password?: string;
    form?: string;
};

function validate(email: string, password: string) {
    const errors: LoginErrors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
        errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    return errors;
}

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<LoginErrors>({});
    const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
            ?.pathname || "/";

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        clearError();
        const nextErrors = validate(email, password);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            await login({ email, password });
            toast.success("Welcome back.");
            navigate(redirectTo, { replace: true });
        } catch (submitError) {
            setErrors({
                form:
                    submitError instanceof Error
                        ? submitError.message
                        : "Login failed.",
            });
        }
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Jump back in and keep your play records tidy."
        >
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {(errors.form || error) && (
                    <div className="flex gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{errors.form || error}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <Label
                        htmlFor="login-email"
                        className="text-stone-800 dark:text-stone-200"
                    >
                        Email
                    </Label>
                    <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        className="h-11 rounded-xl border-2 border-stone-200 bg-amber-50/60 focus-visible:border-amber-400 dark:border-stone-700 dark:bg-stone-950"
                        placeholder="you@example.com"
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600 dark:text-red-300">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="login-password"
                        className="text-stone-800 dark:text-stone-200"
                    >
                        Password
                    </Label>
                    <PasswordInput
                        id="login-password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        className="h-11 rounded-xl border-2 border-stone-200 bg-amber-50/60 focus-visible:border-amber-400 dark:border-stone-700 dark:bg-stone-950"
                        placeholder="Your password"
                    />
                    {errors.password && (
                        <p className="text-sm text-red-600 dark:text-red-300">
                            {errors.password}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "h-11 w-full rounded-xl border-2 border-stone-800 bg-amber-400 font-bold text-stone-900",
                        "shadow-[3px_3px_0px_#1C1917] transition-all hover:bg-amber-500",
                        "active:translate-y-[2px] active:shadow-[1px_1px_0px_#1C1917]",
                        "dark:border-stone-500 dark:shadow-[3px_3px_0px_rgba(255,255,255,0.12)]",
                    )}
                >
                    {isLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                        <LogIn className="h-4 w-4" />
                    )}
                    Login
                </Button>
                <div className="relative py-2 text-center text-xs font-bold uppercase tracking-wide text-stone-400">
                    <span className="bg-white px-3 dark:bg-stone-900">or</span>
                    <div className="absolute left-0 right-0 top-1/2 -z-0 border-t border-stone-200 dark:border-stone-700" />
                </div>

                <GoogleLoginButton disabled={isLoading} />

                <div className="space-y-2 pt-2 text-center text-sm text-stone-500 dark:text-stone-400">
                    <p>
                        New around here?{" "}
                        <Link
                            to="/register"
                            className="font-bold text-violet-600 hover:underline dark:text-violet-300"
                        >
                            Create an account
                        </Link>
                    </p>
                    <Link
                        to="/join"
                        className="inline-flex font-bold text-stone-700 hover:underline dark:text-stone-200"
                    >
                        Continue as Guest
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
