import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Globe, Award, Users, Clock } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useHospitalPublic } from "@/hooks/useFastAPIData";

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: hospital, isLoading, error } = useHospitalPublic(id ? id : "");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center py-20 text-muted-foreground">
          Loading hospital information...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !hospital) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">Hospital Not Found</h1>
          <Button onClick={() => navigate("/hospitals")}>Back to Hospitals</Button>
        </div>
      </DashboardLayout>
    );
  }

  const addressText = hospital.address ? hospital.address : (hospital.city ? hospital.city + (hospital.state ? ", " + hospital.state : "") : "Address not available");

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{hospital.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">{hospital.specialization ? hospital.specialization : "General hospital services"}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/hospitals")}>Back to Hospitals</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span>{addressText}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="w-5 h-5" />
              <span>{hospital.contact ? hospital.contact : "Contact unavailable"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="w-5 h-5" />
              <span>{hospital.email ? hospital.email : "Email unavailable"}</span>
            </div>
            {hospital.website ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Globe className="w-5 h-5" />
                <a href={hospital.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {hospital.website}
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{hospital.bed_capacity ? String(hospital.bed_capacity) : "—"}</p>
                  <p className="text-xs text-muted-foreground">Bed capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{hospital.license_number ? hospital.license_number : "—"}</p>
                  <p className="text-xs text-muted-foreground">License</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{hospital.specialization ? hospital.specialization.split(",")[0] : "Care"}</p>
                  <p className="text-xs text-muted-foreground">Specialty</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">{hospital.email ? hospital.email : "No email"}</p>
                  <p className="text-xs text-muted-foreground">Info</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hospital details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold">Specialization</p>
              <p className="text-sm text-muted-foreground">{hospital.specialization ? hospital.specialization : "General care"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">License number</p>
              <p className="text-sm text-muted-foreground">{hospital.license_number ? hospital.license_number : "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Bed capacity</p>
              <p className="text-sm text-muted-foreground">{hospital.bed_capacity ? String(hospital.bed_capacity) : "Not listed"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HospitalDetails;
