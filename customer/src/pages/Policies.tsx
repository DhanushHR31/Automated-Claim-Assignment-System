import { DashboardLayout } from "@/components/DashboardLayout";
import { PoliciesTable } from "@/components/PoliciesTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Policies = () => {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Policies</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all your insurance policies</p>
          </div>
          <Button onClick={() => navigate("/buy-insurance")} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Buy New Policy
          </Button>
        </div>
        <PoliciesTable />
      </div>
    </DashboardLayout>
  );
};

export default Policies;
