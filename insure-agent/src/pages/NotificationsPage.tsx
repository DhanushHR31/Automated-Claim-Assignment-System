import { useNavigate } from "react-router-dom";
import { NotificationItem } from "@/components/NotificationItem";
import { notifications } from "@/data/mockData";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unread} unread notifications</p>
        </div>
        <Button variant="outline" size="sm">
          <CheckCheck className="h-4 w-4 mr-2" /> Mark All Read
        </Button>
      </div>
      <div className="space-y-1">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}
