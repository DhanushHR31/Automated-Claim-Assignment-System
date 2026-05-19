import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, CloudRain, Crosshair, RefreshCw, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { useClaims, getDistance, getClaimTypeIcon } from "@/hooks/useClaims";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createIcon = (color: string, size: number = 28) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="white" stroke="white" stroke-width="0">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="${color}"/>
      </svg></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const priorityIcons: Record<string, L.DivIcon> = {
  emergency: createIcon("#ef4444", 32),
  high: createIcon("#dc2626", 28),
  medium: createIcon("#f59e0b", 26),
  low: createIcon("#3b82f6", 24),
};

const agentIcon = L.divIcon({
  className: "agent-marker",
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#0ea5e9;border:4px solid white;box-shadow:0 0 0 4px rgba(14,165,233,0.3),0 2px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white" stroke="none">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export default function MapPage() {
  const { updateProfile } = useAuth();
  const { claims, loading, acceptClaim } = useClaims();
  const activeClaims = claims.filter((c) => c.status !== "completed");

  const [liveLocation, setLiveLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const agentMarkerRef = useRef<L.Marker | null>(null);
  const agentCircleRef = useRef<L.Circle | null>(null);
  const claimMarkersRef = useRef<L.Marker[]>([]);

  const karnatakaCenter: L.LatLngExpression = [12.9716, 77.5946];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(karnatakaCenter, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update claim markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    claimMarkersRef.current.forEach((m) => m.remove());
    claimMarkersRef.current = [];

    activeClaims.forEach((claim) => {
      const icon = priorityIcons[claim.priority.toLowerCase()] || priorityIcons.low;
      const dist = liveLocation
        ? getDistance(liveLocation.lat, liveLocation.lng, claim.location_lat, claim.location_lng).toFixed(1)
        : "—";

      const marker = L.marker([claim.location_lat, claim.location_lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="padding:4px;min-width:200px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span>${getClaimTypeIcon(claim.claim_type)}</span>
            <strong style="font-size:13px;">${claim.claim_number}</strong>
            <span style="font-size:10px;padding:2px 6px;border-radius:8px;font-weight:600;background:${
              claim.priority === "emergency" ? "#fee2e2" : claim.priority === "high" ? "#ffedd5" : claim.priority === "medium" ? "#fef3c7" : "#dbeafe"
            };color:${
              claim.priority === "emergency" ? "#b91c1c" : claim.priority === "high" ? "#c2410c" : claim.priority === "medium" ? "#a16207" : "#1d4ed8"
            }">${claim.priority}</span>
          </div>
          <p style="margin:0;font-size:13px;font-weight:500;">${claim.customer_name}</p>
          <p style="margin:2px 0;font-size:11px;color:#666;">${claim.location_address}</p>
          <p style="margin:2px 0;font-size:11px;color:#666;">${claim.district} • ${dist} km away</p>
          <p style="margin:4px 0;font-size:12px;font-weight:600;">₹${claim.claim_amount.toLocaleString()}</p>
          <div style="display:flex;gap:4px;margin-top:6px;">
            ${claim.status === "assigned" ? `<button onclick="window.__acceptClaim('${claim.id}')" style="padding:4px 8px;font-size:11px;font-weight:500;background:#22c55e;color:white;border:none;border-radius:4px;cursor:pointer;">✓ Accept</button>` : ""}
            <button onclick="window.__navigateToClaim(${claim.location_lat},${claim.location_lng})" style="padding:4px 8px;font-size:11px;font-weight:500;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;">🧭 Navigate</button>
            <a href="/claims/${claim.id}" style="padding:4px 8px;font-size:11px;font-weight:500;background:#f3f4f6;color:#374151;border-radius:4px;text-decoration:none;">Details →</a>
          </div>
        </div>
      `);
      claimMarkersRef.current.push(marker);
    });
  }, [activeClaims, liveLocation]);

  // Expose global functions for popup buttons
  useEffect(() => {
    (window as any).__acceptClaim = async (id: string) => {
      await acceptClaim(id);
    };
    (window as any).__navigateToClaim = (lat: number, lng: number) => {
      const origin = liveLocation ? `&origin=${liveLocation.lat},${liveLocation.lng}` : "";
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${origin}&travelmode=driving`, "_blank");
    };
    return () => {
      delete (window as any).__acceptClaim;
      delete (window as any).__navigateToClaim;
    };
  }, [acceptClaim, liveLocation]);

  // Update agent marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !liveLocation) return;

    if (agentMarkerRef.current) agentMarkerRef.current.remove();
    if (agentCircleRef.current) agentCircleRef.current.remove();

    agentMarkerRef.current = L.marker([liveLocation.lat, liveLocation.lng], { icon: agentIcon })
      .addTo(map)
      .bindPopup(`<div style="text-align:center;padding:4px;"><p style="font-weight:bold;font-size:13px;">📍 Your Location</p><p style="font-size:11px;color:#666;">${liveLocation.lat.toFixed(6)}, ${liveLocation.lng.toFixed(6)}</p><p style="font-size:11px;color:#666;">Accuracy: ${liveLocation.accuracy.toFixed(0)}m</p></div>`);

    agentCircleRef.current = L.circle([liveLocation.lat, liveLocation.lng], {
      radius: liveLocation.accuracy,
      color: "#0ea5e9",
      fillColor: "#0ea5e9",
      fillOpacity: 0.1,
      weight: 1,
    }).addTo(map);
  }, [liveLocation]);

  const collectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    toast.info("Collecting live location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LocationData = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp };
        setLiveLocation(loc);
        setLocationHistory((prev) => [...prev, loc]);
        updateProfile({ current_lat: loc.lat, current_lng: loc.lng, is_online: true });
        mapRef.current?.flyTo([loc.lat, loc.lng], 13, { duration: 1.5 });
        toast.success(`Location: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
      },
      (err) => toast.error(`Location error: ${err.message}`),
      { enableHighAccuracy: true }
    );
  };

  const toggleTracking = () => {
    if (tracking && watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setTracking(false);
      updateProfile({ is_online: false });
      toast.info("Live tracking stopped");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const loc: LocationData = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp };
        setLiveLocation(loc);
        setLocationHistory((prev) => [...prev, loc]);
        updateProfile({ current_lat: loc.lat, current_lng: loc.lng, is_online: true });
      },
      (err) => toast.error(`Tracking error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    watchIdRef.current = id;
    setTracking(true);
    toast.success("Live tracking started");
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const sortedClaims = liveLocation
    ? [...activeClaims].sort((a, b) =>
        getDistance(liveLocation.lat, liveLocation.lng, a.location_lat, a.location_lng) -
        getDistance(liveLocation.lat, liveLocation.lng, b.location_lat, b.location_lng)
      )
    : activeClaims;

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Map & Navigation</h1>
          <p className="text-sm text-muted-foreground">Karnataka Region • {activeClaims.length} active claims</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={collectLocation} variant="outline" size="sm">
            <Crosshair className="h-4 w-4 mr-2" /> Collect Location
          </Button>
          <Button
            onClick={toggleTracking}
            size="sm"
            className={tracking ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${tracking ? "animate-spin" : ""}`} />
            {tracking ? "Stop Tracking" : "Start Live Tracking"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border overflow-hidden" style={{ height: "480px" }}>
            <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
          </div>

          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-center gap-3">
            <CloudRain className="h-8 w-8 text-warning shrink-0" />
            <div>
              <p className="text-sm font-semibold">⚠️ Weather Alert: Heavy Rain - Karnataka</p>
              <p className="text-xs text-muted-foreground">Expected near Bengaluru Urban, Mysuru & DK districts.</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Map Legend</h3>
            <div className="flex flex-wrap gap-4 text-xs">
              {[
                { color: "#ef4444", label: "Emergency" },
                { color: "#dc2626", label: "High Priority" },
                { color: "#f59e0b", label: "Medium Priority" },
                { color: "#3b82f6", label: "Low Priority" },
                { color: "#0ea5e9", label: "Your Location" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white shadow" style={{ background: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-primary" />
              Agent Live Location
              {tracking && <Badge className="bg-success/10 text-success border-0 text-[10px] animate-pulse">LIVE</Badge>}
            </h3>
            {liveLocation ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Latitude</span><span className="font-mono font-medium">{liveLocation.lat.toFixed(6)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Longitude</span><span className="font-mono font-medium">{liveLocation.lng.toFixed(6)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span className="font-medium">{liveLocation.accuracy.toFixed(0)}m</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Updated</span><span className="font-medium">{new Date(liveLocation.timestamp).toLocaleTimeString()}</span></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Click "Collect Location" to capture your GPS position</p>
            )}
          </div>

          {locationHistory.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Location History
                <Badge variant="outline" className="text-[10px]">{locationHistory.length} points</Badge>
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {locationHistory.slice(-5).reverse().map((loc, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{new Date(loc.timestamp).toLocaleTimeString()}</span>
                    <span className="font-mono">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">{liveLocation ? "Nearest Claims" : "All Active Claims"}</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading claims...</p>
            ) : sortedClaims.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active claims found</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sortedClaims.slice(0, 10).map((claim) => {
                  const dist = liveLocation ? getDistance(liveLocation.lat, liveLocation.lng, claim.location_lat, claim.location_lng) : null;
                  return (
                    <Link key={claim.id} to={`/claims/${claim.id}`} className="block">
                      <div className={`rounded-lg border p-3 hover:shadow-sm transition-all cursor-pointer ${
                        claim.priority === "emergency" ? "border-destructive/30 bg-destructive/5" : "border-border"
                      }`}>
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{getClaimTypeIcon(claim.claim_type)}</span>
                            <span className="text-xs font-bold">{claim.claim_number}</span>
                          </div>
                          {dist !== null && (
                            <span className="text-[10px] font-semibold text-primary">{dist.toFixed(1)} km</span>
                          )}
                        </div>
                        <p className="text-xs font-medium">{claim.customer_name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">{claim.district}</span>
                          <span className="text-[10px] font-semibold">₹{claim.claim_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
