import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Car, Home, Plane, Briefcase, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  { name: "Health Insurance", type: "Health", desc: "Covers medical expenses", icon: Heart, plans: "42 plans", startPrice: "₹399/mo" },
  { name: "Term Life", type: "Life", desc: "Financial security for family", icon: Shield, plans: "28 plans", startPrice: "₹490/mo" },
  { name: "Car Insurance", type: "Vehicle", desc: "Comprehensive vehicle cover", icon: Car, plans: "35 plans", startPrice: "₹2,999/yr" },
  { name: "Home Insurance", type: "Home", desc: "Protect your property", icon: Home, plans: "18 plans", startPrice: "₹1,200/yr" },
  { name: "Travel Insurance", type: "Travel", desc: "Safe trips worldwide", icon: Plane, plans: "22 plans", startPrice: "₹199/trip" },
  { name: "Business Insurance", type: "Business", desc: "Secure your business", icon: Briefcase, plans: "15 plans", startPrice: "₹5,999/yr" },
];

const BuyInsurance = () => {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buy Insurance</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose from our wide range of insurance products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.name} className="shadow-card border-0 hover:shadow-card-hover transition-all duration-300 group cursor-pointer" onClick={() => navigate(`/insurance-details?category=${cat.type}`)}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <cat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{cat.plans}</p>
                    <p className="text-sm font-semibold text-primary">From {cat.startPrice}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyInsurance;
