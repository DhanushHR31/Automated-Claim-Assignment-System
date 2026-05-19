import { ShoppingCart, RefreshCw, FileCheck, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Buy New Policy",
    description: "Explore & purchase plans",
    icon: ShoppingCart,
    href: "/buy-insurance",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Renew Policy",
    description: "Renew expiring policies",
    icon: RefreshCw,
    href: "/policies",
    color: "bg-success/10 text-success",
  },
  {
    title: "File a Claim",
    description: "Submit insurance claims",
    icon: FileCheck,
    href: "/claims",
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Download Docs",
    description: "Get policy documents",
    icon: Download,
    href: "/policies",
    color: "bg-info/10 text-info",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.href)}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:scale-[1.02] group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
