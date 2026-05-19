import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Agent, Claim } from "@/types";

type ClaimMapProps = {
  agents?: Agent[];
  claims?: Claim[];
  showAgents?: boolean;
  showClaims?: boolean;
  className?: string;
};

const DEFAULT_CENTER: L.LatLngExpression = [15, 77];
const DEFAULT_ZOOM = 6;

function createIcon(color: string, label: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: 700;
      font-family: system-ui, sans-serif;
    ">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

const agentIcon = (availability: Agent["availability"]) => {
  const colors: Record<string, string> = {
    available: "#22a06b",
    on_assignment: "#2684fc",
    on_leave: "#8993a5",
  };

  return createIcon(colors[availability] || colors.on_leave, "A");
};

const claimIcon = (urgency: Claim["urgency"]) => {
  const colors: Record<string, string> = {
    emergency: "#e34935",
    high: "#e34935",
    medium: "#e28b20",
    low: "#22a06b",
  };

  return createIcon(colors[urgency] || colors.medium, "C");
};

export default function ClaimMap({
  agents = [],
  claims = [],
  showAgents = true,
  showClaims = true,
  className,
}: ClaimMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const visibleAgents = useMemo(() => (showAgents ? agents : []), [agents, showAgents]);
  const visibleClaims = useMemo(() => (showClaims ? claims : []), [claims, showClaims]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      layerGroupRef.current?.clearLayers();
      layerGroupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const boundsPoints: L.LatLngExpression[] = [];

    visibleAgents.forEach((agent) => {
      const position: L.LatLngExpression = [agent.latitude, agent.longitude];
      boundsPoints.push(position);

      L.marker(position, { icon: agentIcon(agent.availability) })
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.45;">
            <strong>${agent.name}</strong><br />
            <span style="color: #666; font-size: 11px;">${agent.agent_code}</span><br />
            📍 ${agent.home_city}, ${agent.home_state}<br />
            Status: <strong>${agent.availability.replace(/_/g, " ")}</strong><br />
            Score: ${agent.performance_score}% · Claims: ${agent.active_claims}
          </div>
        `)
        .addTo(layerGroup);
    });

    visibleClaims.forEach((claim) => {
      const position: L.LatLngExpression = [claim.latitude, claim.longitude];
      boundsPoints.push(position);

      L.marker(position, { icon: claimIcon(claim.urgency) })
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.45;">
            <strong>${claim.claim_code}</strong> · <span style="text-transform: capitalize;">${claim.urgency}</span><br />
            <span style="color: #666; font-size: 11px;">${claim.claim_type.replace(/_/g, " ")}</span><br />
            📍 ${claim.city}, ${claim.state}<br />
            ${claim.description}<br />
            ₹${Number(claim.estimated_value).toLocaleString()} · ${claim.status.replace(/_/g, " ")}
          </div>
        `)
        .addTo(layerGroup);
    });

    if (boundsPoints.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 10);
      map.invalidateSize();
      return;
    }

    map.fitBounds(L.latLngBounds(boundsPoints), { padding: [40, 40] });
    map.invalidateSize();
  }, [visibleAgents, visibleClaims]);

  return (
    <div className={className}>
      <div ref={mapElementRef} className="h-full w-full rounded-lg" style={{ minHeight: 350 }} />
    </div>
  );
}
