'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabaseClient } from '@/components/SupabaseProvider';
import { Session } from '@supabase/supabase-js';
import Alerts from '@/components/Alerts';

interface Profile {
  id: string;
  email: string;
  role: string;
  created_at?: string;
}

interface ProtectedLayoutClientProps {
  children: React.ReactNode;
  session: Session;
  profile: Profile | null;
}

export default function ProtectedLayoutClient({
  children,
  session,
  profile,
}: ProtectedLayoutClientProps) {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Sign out failed', {
        description: error.message,
      });
      return;
    }

    toast.success('Signed out successfully');
    router.push('/login');
    router.refresh();
  };

  // Get user initials for avatar fallback
  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">LoanGuard</h1>
            </div>

            <div className="flex items-center gap-4">
              <Alerts userId={session.user.id} />

              <div className="hidden sm:block text-right mr-2">
                <p className="text-sm font-medium text-slate-900">
                  {session.user.email}
                </p>
                {profile?.role && (
                  <p className="text-xs text-slate-600 capitalize">
                    {profile.role}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.user.user_metadata?.avatar_url}
                        alt={session.user.email || 'User'}
                      />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(session.user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.email}
                      </p>
                      {profile?.role && (
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                          {profile.role}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
