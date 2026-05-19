import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHospitalsPublic } from "@/hooks/useFastAPIData";

const Hospitals = () => {
  const navigate = useNavigate();
  const { data: hospitals, isLoading, error } = useHospitalsPublic();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hospitals</h1>
            <p className="text-sm text-muted-foreground mt-1">Find and view hospital information from our network.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading hospitals...</p>
        ) : error ? (
          <p className="text-sm text-destructive">Unable to load hospitals. Please try again later.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(hospitals ? hospitals : []).map((hospital: any) => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/hospital/' + hospital.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {hospital.address ? hospital.address : (hospital.city ? hospital.city + (hospital.state ? ', ' + hospital.state : '') : 'No address available')}
                      </CardDescription>
                    </div>
                    <Badge variant="default">Public</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {hospital.contact ? hospital.contact : (hospital.email ? hospital.email : 'Contact info unavailable')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                      {hospital.specialization ? hospital.specialization : 'General care'}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {hospital.bed_capacity ? String(hospital.bed_capacity) + ' beds' : 'Bed capacity not listed'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Hospitals;
