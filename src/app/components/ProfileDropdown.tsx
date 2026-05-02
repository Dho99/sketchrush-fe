import { Link } from 'react-router';
import { 
  User, 
  History, 
  BarChart3, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuthStore } from '../../store/auth-store';
import { cn } from '../../lib/utils';

export function ProfileDropdown() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl border-2 border-stone-200 bg-amber-50 px-2.5 py-1.5 text-sm font-bold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 hover:bg-amber-100 dark:hover:bg-stone-700 transition-colors">
          <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-[10px] border border-stone-800">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <span className="max-w-24 truncate">{user.name || user.email.split('@')[0]}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-2 border-stone-800 dark:border-stone-400 p-1 shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
        <DropdownMenuLabel className="font-bold text-stone-900 dark:text-stone-100">
          My Account
        </DropdownMenuLabel>
        <div className="px-2 pb-2 text-xs text-stone-500 dark:text-stone-400 truncate">
          {user.email}
        </div>
        <DropdownMenuSeparator className="bg-stone-200 dark:bg-stone-700" />
        
        <DropdownMenuItem asChild>
          <Link to="/account" className="flex items-center gap-2 cursor-pointer focus:bg-amber-50 dark:focus:bg-stone-800">
            <User className="h-4 w-4" />
            <span>Manage Account</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/playing-history" className="flex items-center gap-2 cursor-pointer focus:bg-amber-50 dark:focus:bg-stone-800">
            <History className="h-4 w-4" />
            <span>Playing History</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/stats" className="flex items-center gap-2 cursor-pointer focus:bg-amber-50 dark:focus:bg-stone-800">
            <BarChart3 className="h-4 w-4" />
            <span>User Stats</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-stone-200 dark:bg-stone-700" />
        
        <DropdownMenuItem 
          onClick={() => logout()}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
