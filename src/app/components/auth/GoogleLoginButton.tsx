import { Chrome } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "../../../store/auth-store";

export function GoogleLoginButton({ disabled }: { disabled?: boolean }) {
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

    return (
        <Button
            type="button"
            variant="outline"
            onClick={loginWithGoogle}
            disabled={disabled}
            className="h-11 w-full rounded-xl border-2 border-stone-800 bg-white font-bold text-stone-800 shadow-[3px_3px_0px_#1C1917] transition-all hover:bg-stone-100 active:translate-y-[2px] active:shadow-[1px_1px_0px_#1C1917] dark:border-stone-500 dark:bg-stone-800 dark:text-stone-100 dark:shadow-[3px_3px_0px_rgba(255,255,255,0.12)] dark:hover:bg-stone-700"
        >
            <Chrome className="h-4 w-4" />
            Continue with Google
        </Button>
    );
}
