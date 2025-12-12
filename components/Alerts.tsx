'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bell, BellDot, Check, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useSupabaseClient } from '@/components/SupabaseProvider';

interface Alert {
  id: string;
  loan_id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  triggered_at: string;
  read: boolean;
  created_at?: string;
  resolved?: boolean;
}

interface AlertsProps {
  userId?: string;
}

export default function Alerts({}: AlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useSupabaseClient();

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to load alerts', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch alerts only when the user opens the alerts panel
  useEffect(() => {
    if (isOpen && alerts.length === 0 && !isLoading) {
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Realtime subscription - only subscribe after initial load
  useEffect(() => {
    // Delay subscription setup to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      const channel = supabase
        .channel('alerts-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
          },
          (payload) => {
            const newAlert = payload.new as Alert;
            setAlerts((current) => [newAlert, ...current]);

            // Show toast notification for new alert
            toast.warning('New Alert', {
              description: newAlert.message,
              action: {
                label: 'View',
                onClick: () => {
                  setIsOpen(true);
                },
              },
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'alerts',
          },
          (payload) => {
            setAlerts((current) =>
              current.map((alert) =>
                alert.id === payload.new.id ? (payload.new as Alert) : alert
              )
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'alerts',
          },
          (payload) => {
            setAlerts((current) => current.filter((alert) => alert.id !== payload.old.id));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, 1000); // Delay by 1 second

    return () => {
      clearTimeout(timeoutId);
    };
  }, [supabase]);


  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((current) =>
        current.map((alert) =>
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to mark as read', {
        description: errorMessage,
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = alerts.filter((a) => !a.read).map((a) => a.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setAlerts((current) =>
        current.map((alert) => ({ ...alert, read: true }))
      );

      toast.success('All alerts marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to mark all as read', {
        description: errorMessage,
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((current) => current.filter((alert) => alert.id !== alertId));
      toast.success('Alert deleted');
    } catch (error) {
      console.error('Error deleting alert:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to delete alert', {
        description: errorMessage,
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-xs">High</Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">Medium</Badge>
        );
      case 'low':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Low</Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">{severity}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      overdue: 'bg-red-100 text-red-800 border-red-200',
      payment_due: 'bg-orange-100 text-orange-800 border-orange-200',
      high_risk: 'bg-purple-100 text-purple-800 border-purple-200',
      payment_received: 'bg-green-100 text-green-800 border-green-200',
      default: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    const colorClass = typeColors[type] || typeColors.default;

    return (
      <Badge variant="outline" className={`text-xs ${colorClass}`}>
        {type.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          <SheetDescription>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No notifications
              </h3>
              <p className="text-sm text-slate-600">
                You&apos;re all caught up! New alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    alert.read
                      ? 'border-slate-200 bg-white'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(alert.type)}
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-slate-600"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="text-sm text-slate-900 mb-2">{alert.message}</p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {formatDateTime(alert.triggered_at || alert.created_at || '')}
                    </p>
                    <div className="flex items-center gap-2">
                      {alert.loan_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            router.push(`/loans/${alert.loan_id}`);
                            setIsOpen(false);
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Loan
                        </Button>
                      )}
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
