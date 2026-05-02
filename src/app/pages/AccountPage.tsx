import { useAuthStore } from '../../store/auth-store';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function AccountPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Please login to view your account.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
          Account Settings
        </h1>
        <p className="text-stone-500 dark:text-stone-400">
          Manage your personal information and account preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-2 border-stone-800 dark:border-stone-400 shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-amber-400 border-2 border-stone-800 flex items-center justify-center text-4xl mb-4 shadow-[3px_3px_0px_#1C1917]">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold">{user.name || 'Anonymous User'}</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">{user.email}</p>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-2 border-stone-200 dark:border-stone-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                Profile Information
              </CardTitle>
              <CardDescription>Details linked to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 py-2 border-b border-stone-100 dark:border-stone-800">
                <User className="w-4 h-4 text-stone-400" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Full Name</p>
                  <p className="font-semibold">{user.name || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-b border-stone-100 dark:border-stone-800">
                <Mail className="w-4 h-4 text-stone-400" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Email Address</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-b border-stone-100 dark:border-stone-800">
                <Calendar className="w-4 h-4 text-stone-400" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Joined On</p>
                  <p className="font-semibold">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Recently'}
                  </p>
                </div>
              </div>
              
              {user.provider && (
                <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-sm">
                  Connected via <span className="font-bold capitalize">{user.provider}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-sm">
            <strong>Note:</strong> Currently, account updates are handled via the original login provider. In-app profile editing is coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
