import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Navigation, Clock, Phone, Mail, Star, Send,
  MessageCircle, FileText, User, ChevronRight, Activity,
  CheckCircle2, AlertCircle, IndianRupee, Timer, Locate
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { mockAgents, mockClaims } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const agentLocations = [
  { agentId: "1", x: 22, y: 35, area: "Andheri West, Mumbai", lastSeen: "2 min ago", traveling: true, speed: "32 km/h", destination: "Customer Site - Suresh Mehta" },
  { agentId: "2", x: 55, y: 25, area: "Dadar, Mumbai", lastSeen: "5 min ago", traveling: false, speed: "0 km/h", destination: "Office" },
  { agentId: "4", x: 78, y: 60, area: "Shivaji Nagar, Pune", lastSeen: "1 min ago", traveling: true, speed: "45 km/h", destination: "Customer Site - Kavita Nair" },
  { agentId: "5", x: 35, y: 70, area: "Thane West, Mumbai", lastSeen: "8 min ago", traveling: true, speed: "28 km/h", destination: "Claims Office" },
  { agentId: "6", x: 65, y: 80, area: "MG Road, Bangalore", lastSeen: "3 min ago", traveling: false, speed: "0 km/h", destination: "Survey Site" },
];

const initialChatMessages: Record<string, { sender: string; text: string; time: string }[]> = {
  "1": [
    { sender: "manager", text: "Rajesh, please update on CLM-001 status", time: "10:30 AM" },
    { sender: "agent", text: "Sir, I'm heading to the customer location now. Will complete survey by 2 PM.", time: "10:32 AM" },
    { sender: "manager", text: "Good. Send photos once done.", time: "10:33 AM" },
  ],
  "2": [
    { sender: "manager", text: "Priya, CLM-002 documents verified?", time: "9:15 AM" },
    { sender: "agent", text: "Yes sir, all 5 documents verified. Recommending approval.", time: "9:20 AM" },
  ],
  "4": [
    { sender: "agent", text: "Sir, customer is not available at location for CLM-003.", time: "11:00 AM" },
    { sender: "manager", text: "Try calling again. If not reachable, reschedule for tomorrow.", time: "11:05 AM" },
  ],
  "5": [],
  "6": [
    { sender: "manager", text: "Neha, how is the MG Road survey going?", time: "2:00 PM" },
    { sender: "agent", text: "Almost done sir, uploading documents now.", time: "2:15 PM" },
  ],
};

// Landmark/POI data for realistic map
const landmarks = [
  { name: "Mumbai Airport", x: 18, y: 28, type: "airport" },
  { name: "CST Station", x: 45, y: 18, type: "station" },
  { name: "Pune Station", x: 75, y: 52, type: "station" },
  { name: "Hospital", x: 30, y: 45, type: "hospital" },
  { name: "Mall", x: 60, y: 40, type: "mall" },
  { name: "Police Stn", x: 50, y: 65, type: "police" },
  { name: "Court", x: 40, y: 55, type: "govt" },
  { name: "Bank", x: 70, y: 72, type: "bank" },
  { name: "School", x: 25, y: 58, type: "school" },
  { name: "Park", x: 58, y: 88, type: "park" },
];

const TrackingPage = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [agentPositions, setAgentPositions] = useState(agentLocations);
  const [showAgentDetail, setShowAgentDetail] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => setPulsePhase(p => (p + 1) % 60), 50);
    return () => clearInterval(interval);
  }, []);

  // Animate agent positions
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentPositions(prev =>
        prev.map(loc => {
          if (!loc.traveling) return loc;
          const dx = (Math.random() - 0.5) * 1.2;
          const dy = (Math.random() - 0.5) * 1.2;
          return {
            ...loc,
            x: Math.max(5, Math.min(95, loc.x + dx)),
            y: Math.max(5, Math.min(95, loc.y + dy)),
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Draw the realistic map
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    // Base terrain - green areas
    ctx.fillStyle = "#e8f5e9";
    ctx.fillRect(0, 0, w, h);

    // Water bodies
    ctx.fillStyle = "#b3e5fc";
    ctx.beginPath();
    ctx.ellipse(w * 0.08, h * 0.15, w * 0.06, h * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.88, h * 0.85, w * 0.07, h * 0.06, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // River
    ctx.strokeStyle = "#81d4fa";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.bezierCurveTo(w * 0.15, h * 0.42, w * 0.3, h * 0.48, w * 0.45, h * 0.44);
    ctx.bezierCurveTo(w * 0.6, h * 0.4, w * 0.75, h * 0.46, w, h * 0.43);
    ctx.stroke();

    // Parks / green zones
    const parks = [
      { x: 0.12, y: 0.6, w: 0.08, h: 0.06 },
      { x: 0.55, y: 0.83, w: 0.1, h: 0.07 },
      { x: 0.82, y: 0.3, w: 0.06, h: 0.05 },
    ];
    parks.forEach(p => {
      ctx.fillStyle = "#c8e6c9";
      ctx.beginPath();
      ctx.roundRect(p.x * w, p.y * h, p.w * w, p.h * h, 6);
      ctx.fill();
      ctx.fillStyle = "#81c784";
      for (let i = 0; i < 5; i++) {
        const tx = (p.x + Math.random() * p.w) * w;
        const ty = (p.y + Math.random() * p.h) * h;
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // City blocks / buildings
    ctx.fillStyle = "#f5f5f5";
    const blocks = [
      [0.1, 0.2, 0.08, 0.06], [0.22, 0.14, 0.06, 0.05], [0.35, 0.1, 0.07, 0.05],
      [0.48, 0.12, 0.06, 0.06], [0.62, 0.15, 0.07, 0.05], [0.72, 0.2, 0.06, 0.04],
      [0.15, 0.38, 0.05, 0.04], [0.28, 0.35, 0.06, 0.05], [0.42, 0.32, 0.05, 0.04],
      [0.58, 0.28, 0.06, 0.05], [0.7, 0.38, 0.07, 0.04], [0.82, 0.42, 0.05, 0.05],
      [0.12, 0.52, 0.06, 0.04], [0.3, 0.55, 0.05, 0.04], [0.45, 0.52, 0.07, 0.05],
      [0.62, 0.55, 0.06, 0.04], [0.75, 0.58, 0.05, 0.05],
      [0.18, 0.72, 0.06, 0.04], [0.35, 0.68, 0.05, 0.05], [0.48, 0.72, 0.07, 0.04],
      [0.65, 0.68, 0.06, 0.05], [0.78, 0.75, 0.05, 0.04],
      [0.25, 0.82, 0.06, 0.04], [0.42, 0.85, 0.05, 0.04], [0.72, 0.82, 0.06, 0.05],
    ];
    blocks.forEach(([bx, by, bw, bh]) => {
      ctx.fillStyle = "#eeeeee";
      ctx.fillRect(bx * w, by * h, bw * w, bh * h);
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bx * w, by * h, bw * w, bh * h);
      // Inner building lines
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 0.3;
      const cols = Math.floor(bw * w / 12);
      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(bx * w + i * 12, by * h);
        ctx.lineTo(bx * w + i * 12, by * h + bh * h);
        ctx.stroke();
      }
    });

    // Minor roads (grid pattern)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for (let i = 1; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo((w / 20) * i, 0);
      ctx.lineTo((w / 20) * i, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (h / 20) * i);
      ctx.lineTo(w, (h / 20) * i);
      ctx.stroke();
    }

    // Major roads with yellow center lines
    const majorRoads = [
      { points: [[0.05, 0.3], [0.95, 0.3]], width: 6 },
      { points: [[0.2, 0.05], [0.2, 0.95]], width: 6 },
      { points: [[0.5, 0.05], [0.5, 0.95]], width: 7 },
      { points: [[0.8, 0.15], [0.8, 0.9]], width: 6 },
      { points: [[0.05, 0.6], [0.95, 0.6]], width: 6 },
      { points: [[0.05, 0.85], [0.95, 0.85]], width: 5 },
    ];
    majorRoads.forEach(road => {
      const [[x1, y1], [x2, y2]] = road.points;
      // Road surface
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = road.width;
      ctx.beginPath();
      ctx.moveTo(x1 * w, y1 * h);
      ctx.lineTo(x2 * w, y2 * h);
      ctx.stroke();
      // Road border
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = road.width + 2;
      ctx.beginPath();
      ctx.moveTo(x1 * w, y1 * h);
      ctx.lineTo(x2 * w, y2 * h);
      ctx.stroke();
      // Re-draw road surface on top
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = road.width;
      ctx.beginPath();
      ctx.moveTo(x1 * w, y1 * h);
      ctx.lineTo(x2 * w, y2 * h);
      ctx.stroke();
      // Center dashes
      ctx.strokeStyle = "#fdd835";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(x1 * w, y1 * h);
      ctx.lineTo(x2 * w, y2 * h);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Curved highway
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.1);
    ctx.bezierCurveTo(w * 0.3, h * 0.15, w * 0.5, h * 0.05, w * 0.7, h * 0.12);
    ctx.bezierCurveTo(w * 0.85, h * 0.18, w * 0.9, h * 0.25, w * 0.95, h * 0.2);
    ctx.stroke();
    ctx.strokeStyle = "#fff9c4";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.1);
    ctx.bezierCurveTo(w * 0.3, h * 0.15, w * 0.5, h * 0.05, w * 0.7, h * 0.12);
    ctx.bezierCurveTo(w * 0.85, h * 0.18, w * 0.9, h * 0.25, w * 0.95, h * 0.2);
    ctx.stroke();
    ctx.strokeStyle = "#fdd835";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.1);
    ctx.bezierCurveTo(w * 0.3, h * 0.15, w * 0.5, h * 0.05, w * 0.7, h * 0.12);
    ctx.bezierCurveTo(w * 0.85, h * 0.18, w * 0.9, h * 0.25, w * 0.95, h * 0.2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Area labels
    ctx.font = "bold 11px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    const areas = [
      { label: "Andheri", x: 0.18, y: 0.26, color: "#616161" },
      { label: "Dadar", x: 0.52, y: 0.22, color: "#616161" },
      { label: "Bandra", x: 0.35, y: 0.18, color: "#616161" },
      { label: "Pune", x: 0.78, y: 0.55, color: "#616161" },
      { label: "Thane", x: 0.32, y: 0.66, color: "#616161" },
      { label: "Bangalore", x: 0.63, y: 0.78, color: "#616161" },
      { label: "Worli", x: 0.42, y: 0.38, color: "#9e9e9e" },
      { label: "Juhu", x: 0.12, y: 0.34, color: "#9e9e9e" },
    ];
    areas.forEach(a => {
      ctx.fillStyle = a.color;
      ctx.globalAlpha = 0.6;
      ctx.fillText(a.label, a.x * w, a.y * h);
      ctx.globalAlpha = 1;
    });

    // Landmarks with icons
    ctx.font = "9px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    landmarks.forEach(lm => {
      const px = (lm.x / 100) * w;
      const py = (lm.y / 100) * h;
      // Icon bg
      const colors: Record<string, string> = {
        airport: "#1565c0", station: "#6a1b9a", hospital: "#c62828",
        mall: "#e65100", police: "#1b5e20", govt: "#4e342e",
        bank: "#00695c", school: "#f57f17", park: "#2e7d32",
      };
      ctx.fillStyle = colors[lm.type] || "#757575";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.roundRect(px - 4, py - 4, 8, 8, 2);
      ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#424242";
      ctx.fillText(lm.name, px, py + 14);
      ctx.globalAlpha = 1;
    });

    // Draw agent markers with pulsing
    const pulse = Math.sin((pulsePhase / 60) * Math.PI * 2) * 0.5 + 0.5;
    agentPositions.forEach(loc => {
      const agent = mockAgents.find(a => a.id === loc.agentId);
      if (!agent) return;
      const px = (loc.x / 100) * w;
      const py = (loc.y / 100) * h;
      const isSelected = selectedAgent === loc.agentId;

      // Outer pulse ring for traveling
      if (loc.traveling) {
        const r = 18 + pulse * 10;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(76, 175, 80, ${0.12 - pulse * 0.08})`;
        ctx.fill();
        // Inner pulse
        ctx.beginPath();
        ctx.arc(px, py, 14 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(76, 175, 80, 0.15)`;
        ctx.fill();
      }

      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(px, py, 22, 0, Math.PI * 2);
        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 26, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(25, 118, 210, ${0.3 + pulse * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Shadow
      ctx.beginPath();
      ctx.arc(px + 1, py + 2, 15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fill();

      // Agent circle with gradient
      const grad = ctx.createRadialGradient(px - 3, py - 3, 2, px, py, 15);
      if (isSelected) {
        grad.addColorStop(0, "#42a5f5");
        grad.addColorStop(1, "#1565c0");
      } else if (loc.traveling) {
        grad.addColorStop(0, "#66bb6a");
        grad.addColorStop(1, "#2e7d32");
      } else {
        grad.addColorStop(0, "#5c6bc0");
        grad.addColorStop(1, "#283593");
      }
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      // White ring
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Agent initials
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(agent.avatar, px, py);

      // Name label with bg
      ctx.font = "bold 9px 'Segoe UI', sans-serif";
      const nameWidth = ctx.measureText(agent.name.split(" ")[0]).width;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.roundRect(px - nameWidth / 2 - 4, py + 18, nameWidth + 8, 14, 3);
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#1976d2" : loc.traveling ? "#4caf50" : "#5c6bc0";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.fillStyle = "#212121";
      ctx.fillText(agent.name.split(" ")[0], px, py + 25);

      // Speed badge for traveling
      if (loc.traveling) {
        ctx.font = "bold 7px 'Segoe UI', sans-serif";
        const speedText = loc.speed;
        const sw = ctx.measureText(speedText).width;
        ctx.fillStyle = "#4caf50";
        ctx.beginPath();
        ctx.roundRect(px - sw / 2 - 3, py + 33, sw + 6, 11, 3);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(speedText, px, py + 38.5);
      }

      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    });

    // Map attribution
    ctx.font = "9px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#9e9e9e";
    ctx.textAlign = "right";
    ctx.fillText("ClaimFlow Live Map © 2026", w - 8, h - 6);
    ctx.textAlign = "start";

    // Scale bar
    ctx.strokeStyle = "#757575";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, h - 12);
    ctx.lineTo(72, h - 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, h - 16);
    ctx.lineTo(12, h - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(72, h - 16);
    ctx.lineTo(72, h - 8);
    ctx.stroke();
    ctx.font = "8px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#757575";
    ctx.textAlign = "center";
    ctx.fillText("5 km", 42, h - 16);
    ctx.textAlign = "start";
  }, [agentPositions, selectedAgent, pulsePhase]);

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // Redraw on resize
  useEffect(() => {
    const onResize = () => drawMap();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawMap]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    let closest: string | null = null;
    let minDist = Infinity;
    agentPositions.forEach(loc => {
      const dist = Math.sqrt((clickX - loc.x) ** 2 + (clickY - loc.y) ** 2);
      if (dist < 6 && dist < minDist) {
        minDist = dist;
        closest = loc.agentId;
      }
    });
    if (closest) {
      setSelectedAgent(closest === selectedAgent ? null : closest);
    } else {
      setSelectedAgent(null);
    }
  };

  const selectedLoc = agentPositions.find(l => l.agentId === selectedAgent);
  const selectedAgentData = mockAgents.find(a => a.id === selectedAgent);
  const agentClaims = (agentId: string) => mockClaims.filter(c => {
    const agent = mockAgents.find(a => a.id === agentId);
    return agent && c.agent === agent.name;
  });

  const activeAgents = mockAgents.filter(a => a.status !== "offline");

  const sendMessage = () => {
    if (!newMessage.trim() || !chatAgent) return;
    const updated = { ...chatMessages };
    if (!updated[chatAgent]) updated[chatAgent] = [];
    updated[chatAgent].push({ sender: "manager", text: newMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    setChatMessages(updated);
    setNewMessage("");
    toast({ title: "Message sent", description: `Message sent to ${mockAgents.find(a => a.id === chatAgent)?.name}` });
    setTimeout(() => {
      const replies = ["Noted sir, will update shortly.", "On it!", "Yes sir, understood.", "Will send the documents soon.", "Reaching location in 10 minutes."];
      setChatMessages(prev => {
        const copy = { ...prev };
        if (!copy[chatAgent]) copy[chatAgent] = [];
        copy[chatAgent] = [...copy[chatAgent], {
          sender: "agent",
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }];
        return copy;
      });
    }, 1500);
  };

  const chatAgentData = mockAgents.find(a => a.id === chatAgent);
  const selectedClaimData = mockClaims.find(c => c.id === selectedClaim);

  return (
    <DashboardLayout title="Live Tracking">
      <div className="space-y-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Agents", value: activeAgents.filter(a => a.status === "active").length, icon: Activity, color: "bg-primary/10", iconColor: "text-primary" },
            { label: "Busy Agents", value: activeAgents.filter(a => a.status === "busy").length, icon: Timer, color: "bg-warning/10", iconColor: "text-warning" },
            { label: "Traveling", value: agentPositions.filter(l => l.traveling).length, icon: Navigation, color: "bg-success/10", iconColor: "text-success" },
            { label: "Offline", value: mockAgents.filter(a => a.status === "offline").length, icon: MapPin, color: "bg-destructive/10", iconColor: "text-destructive" },
          ].map(s => (
            <Card key={s.label} className="bg-card border">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-card-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                    <Locate className="h-4 w-4 text-primary" /> Live Map View
                  </CardTitle>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />Traveling</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Stationary</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-info" />Selected</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 relative">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-pointer"
                  style={{ height: 480 }}
                  onClick={handleCanvasClick}
                />

                {/* Selected agent popup */}
                {selectedAgent && selectedLoc && selectedAgentData && (
                  <div className="absolute bottom-3 left-3 right-3 bg-card/95 backdrop-blur-md rounded-xl shadow-xl border p-4 animate-in slide-in-from-bottom-2">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                        {selectedAgentData.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-card-foreground">{selectedAgentData.name}</h4>
                          <StatusBadge status={selectedAgentData.status} />
                          {selectedLoc.traveling && (
                            <Badge variant="outline" className="text-success border-success/30 text-[10px]">
                              <Navigation className="h-2.5 w-2.5 mr-0.5" />{selectedLoc.speed}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedLoc.area}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{selectedLoc.lastSeen}</span>
                          <span className="flex items-center gap-1"><Navigation className="h-3 w-3" />{selectedLoc.destination}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowAgentDetail(true)}>
                          <User className="h-3 w-3 mr-1" />Details
                        </Button>
                        <Button size="sm" className="h-8 text-xs" onClick={() => setChatAgent(selectedAgent)}>
                          <MessageCircle className="h-3 w-3 mr-1" />Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Agent List */}
          <Card>
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-semibold text-card-foreground">
                All Agents ({mockAgents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                <div className="p-2 space-y-1.5">
                  {mockAgents.map(agent => {
                    const loc = agentPositions.find(l => l.agentId === agent.id);
                    const isSelected = selectedAgent === agent.id;
                    const claims = agentClaims(agent.id);
                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                        className={`p-3 rounded-lg transition-all cursor-pointer border ${isSelected ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-card border-transparent hover:bg-muted/40"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold ${isSelected ? "gradient-info" : "gradient-primary"}`}>
                              {agent.avatar}
                            </div>
                            {loc?.traveling && (
                              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success flex items-center justify-center">
                                <Navigation className="h-2 w-2 text-primary-foreground" />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-card-foreground truncate">{agent.name}</p>
                              <StatusBadge status={agent.status} />
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{loc?.area || "Offline"}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>

                        {isSelected && (
                          <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-muted/50 rounded-md p-1.5">
                                <p className="text-xs text-muted-foreground">Claims</p>
                                <p className="text-sm font-bold text-card-foreground">{agent.assignedClaims}</p>
                              </div>
                              <div className="bg-muted/50 rounded-md p-1.5">
                                <p className="text-xs text-muted-foreground">Done</p>
                                <p className="text-sm font-bold text-success">{agent.completedClaims}</p>
                              </div>
                              <div className="bg-muted/50 rounded-md p-1.5">
                                <p className="text-xs text-muted-foreground">Rating</p>
                                <p className="text-sm font-bold text-warning">{agent.rating}★</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{agent.phone}</div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{agent.email}</div>
                            {loc?.traveling && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Navigation className="h-3 w-3 text-success" />Heading: {loc.destination} ({loc.speed})
                              </div>
                            )}
                            <div className="flex gap-1.5 pt-1">
                              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={(e) => { e.stopPropagation(); setShowAgentDetail(true); }}>Full Profile</Button>
                              <Button size="sm" className="flex-1 h-7 text-xs" onClick={(e) => { e.stopPropagation(); setChatAgent(agent.id); }}>
                                <MessageCircle className="h-3 w-3 mr-1" />Chat
                              </Button>
                            </div>

                            {claims.length > 0 && (
                              <div className="pt-1">
                                <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Assigned Claims</p>
                                {claims.map(claim => (
                                  <div
                                    key={claim.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedClaim(claim.id); }}
                                    className="flex items-center justify-between p-1.5 rounded bg-muted/30 hover:bg-muted/50 cursor-pointer mb-1 text-xs"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <FileText className="h-3 w-3 text-primary" />
                                      <span className="font-medium text-card-foreground">{claim.id}</span>
                                      <span className="text-muted-foreground">• {claim.type}</span>
                                    </div>
                                    <StatusBadge status={claim.status} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={showAgentDetail && !!selectedAgentData} onOpenChange={setShowAgentDetail}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedAgentData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {selectedAgentData.avatar}
                  </div>
                  <div>
                    <span className="text-lg">{selectedAgentData.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={selectedAgentData.status} />
                      {selectedLoc?.traveling && (
                        <Badge variant="outline" className="text-success border-success/30 text-xs">
                          <Navigation className="h-3 w-3 mr-1" />Traveling
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-2">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="info">Information</TabsTrigger>
                  <TabsTrigger value="claims">Claims ({agentClaims(selectedAgentData.id).length})</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-card-foreground">{selectedAgentData.email}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-card-foreground">{selectedAgentData.phone}</span></div>
                      <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-card-foreground">{selectedLoc?.area || "Offline"}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-card-foreground">Last seen: {selectedLoc?.lastSeen || "N/A"}</span></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-warning" /><span className="text-card-foreground">Rating: {selectedAgentData.rating}/5.0</span></div>
                      <div className="flex items-center gap-2 text-sm"><IndianRupee className="h-4 w-4 text-success" /><span className="text-card-foreground">Earnings: ₹{selectedAgentData.earnings.toLocaleString()}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Navigation className="h-4 w-4 text-primary" /><span className="text-card-foreground">Dest: {selectedLoc?.destination || "N/A"}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => setChatAgent(selectedAgentData.id)} className="flex-1"><MessageCircle className="h-4 w-4 mr-1.5" />Chat</Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/agents/${selectedAgentData.id}`)} className="flex-1"><User className="h-4 w-4 mr-1.5" />Full Profile</Button>
                  </div>
                </TabsContent>

                <TabsContent value="claims" className="mt-4">
                  <div className="space-y-2">
                    {agentClaims(selectedAgentData.id).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No claims assigned</p>}
                    {agentClaims(selectedAgentData.id).map(claim => (
                      <div key={claim.id} onClick={() => { setShowAgentDetail(false); setSelectedClaim(claim.id); }} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-semibold text-card-foreground">{claim.id}</p>
                            <p className="text-xs text-muted-foreground">{claim.customer} • {claim.type} • ₹{claim.amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={claim.status} />
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border"><CardContent className="p-4 text-center"><CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold text-card-foreground">{selectedAgentData.completedClaims}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
                    <Card className="border"><CardContent className="p-4 text-center"><AlertCircle className="h-8 w-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold text-card-foreground">{selectedAgentData.assignedClaims}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
                    <Card className="border"><CardContent className="p-4 text-center"><Star className="h-8 w-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold text-card-foreground">{selectedAgentData.rating}</p><p className="text-xs text-muted-foreground">Rating</p></CardContent></Card>
                    <Card className="border"><CardContent className="p-4 text-center"><IndianRupee className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold text-card-foreground">₹{selectedAgentData.earnings.toLocaleString()}</p><p className="text-xs text-muted-foreground">Earnings</p></CardContent></Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={!!chatAgent} onOpenChange={() => setChatAgent(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {chatAgentData && (
            <>
              <div className="flex items-center gap-3 p-4 border-b bg-primary/5">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {chatAgentData.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground text-sm">{chatAgentData.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={chatAgentData.status} />
                    <span className="text-xs text-muted-foreground">
                      {agentPositions.find(l => l.agentId === chatAgent)?.area || "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-80 p-4">
                <div className="space-y-3">
                  {(chatMessages[chatAgent!] || []).map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "manager" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.sender === "manager" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-card-foreground rounded-bl-sm"}`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "manager" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  {(chatMessages[chatAgent!] || []).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation!</p>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-3 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 h-9 text-sm"
                />
                <Button size="sm" onClick={sendMessage} className="h-9 px-3"><Send className="h-4 w-4" /></Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-lg">
          {selectedClaimData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {selectedClaimData.id} — {selectedClaimData.type} Claim
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Customer</p><p className="text-sm font-semibold text-card-foreground">{selectedClaimData.customer}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Assigned Agent</p><p className="text-sm font-semibold text-card-foreground">{selectedClaimData.agent}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-bold text-card-foreground">₹{selectedClaimData.amount.toLocaleString()}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={selectedClaimData.status} /></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Incident Type</p><p className="text-sm font-semibold text-card-foreground">{selectedClaimData.type}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Date Filed</p><p className="text-sm font-semibold text-card-foreground">{selectedClaimData.date}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3 col-span-2"><p className="text-xs text-muted-foreground">Incident Description</p><p className="text-sm text-card-foreground">{selectedClaimData.description}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3 col-span-2"><p className="text-xs text-muted-foreground">Documents</p><p className="text-sm font-semibold text-card-foreground">{selectedClaimData.documents} files</p></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => { const agent = mockAgents.find(a => a.name === selectedClaimData.agent); if (agent) setChatAgent(agent.id); }}>
                    <MessageCircle className="h-4 w-4 mr-1.5" />Chat with Agent
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedClaim(null); navigate(`/claims/${selectedClaimData.id}`); }}>
                    <FileText className="h-4 w-4 mr-1.5" />Full Details
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TrackingPage;
