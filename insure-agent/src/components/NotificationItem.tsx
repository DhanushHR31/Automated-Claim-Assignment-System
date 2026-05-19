import { Notification } from "@/data/mockData";
import { Bell, AlertTriangle, CloudRain, MessageCircle, CreditCard, FileText } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
}

const typeConfig = {
  claim: { icon: FileText, className: "bg-primary/10 text-primary" },
  emergency: { icon: AlertTriangle, className: "bg-emergency/10 text-emergency" },
  weather: { icon: CloudRain, className: "bg-warning/10 text-warning" },
  message: { icon: MessageCircle, className: "bg-info/10 text-info" },
  payment: { icon: CreditCard, className: "bg-success/10 text-success" },
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${!notification.read ? "bg-primary/5" : "hover:bg-muted/50"}`}>
      <div className={`rounded-full p-2 shrink-0 ${config.className}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {notification.description}
        </p>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
        {notification.time}
      </span>
    </div>
  );
}
