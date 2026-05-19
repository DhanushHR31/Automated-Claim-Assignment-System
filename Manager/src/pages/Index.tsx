import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, FileText, CheckCircle, Clock, DollarSign, TrendingUp, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { claimStatusData, monthlyClaimsData, agentPerformanceData, mockClaims, mockAgents } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cursor-pointer" onClick={() => navigate("/agents")}>
            <StatCard title="Total Agents" value={mockAgents.length} icon={<Users className="h-5 w-5" />} trend={{ value: 12, positive: true }} gradient="gradient-primary" />
          </div>
          <div className="cursor-pointer" onClick={() => navigate("/claims")}>
            <StatCard title="Active Claims" value={mockClaims.filter(c => c.status === "in-progress" || c.status === "pending").length} icon={<FileText className="h-5 w-5" />} trend={{ value: 8, positive: true }} gradient="gradient-info" />
          </div>
          <div className="cursor-pointer" onClick={() => navigate("/claims")}>
            <StatCard title="Completed Claims" value={mockClaims.filter(c => c.status === "approved").length} icon={<CheckCircle className="h-5 w-5" />} trend={{ value: 15, positive: true }} gradient="gradient-success" />
          </div>
          <div className="cursor-pointer" onClick={() => navigate("/claims")}>
            <StatCard title="Pending Claims" value={mockClaims.filter(c => c.status === "pending").length} icon={<Clock className="h-5 w-5" />} trend={{ value: 3, positive: false }} gradient="gradient-warning" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Cost Spent" value="₹12.5L" icon={<DollarSign className="h-5 w-5" />} gradient="gradient-warning" />
          <StatCard title="Approval Ratio" value={`${Math.round(mockClaims.filter(c => c.status === "approved").length / mockClaims.length * 100)}%`} icon={<TrendingUp className="h-5 w-5" />} gradient="gradient-success" />
          <StatCard title="Avg Performance" value={`${(mockAgents.reduce((a, b) => a + b.rating, 0) / mockAgents.length).toFixed(1)} ★`} icon={<Star className="h-5 w-5" />} gradient="gradient-primary" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-base">Claims Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={claimStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={4} strokeWidth={0}>
                    {claimStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {claimStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Monthly Claims Overview</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyClaimsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="claims" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="approved" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="rejected" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Claims + Top Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Claims</CardTitle>
              <button onClick={() => navigate("/claims")} className="text-xs text-primary hover:underline">View All →</button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockClaims.slice(0, 5).map((claim) => (
                  <div key={claim.id} onClick={() => navigate(`/claims/${claim.id}`)} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg gradient-info flex items-center justify-center text-info-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{claim.id} — {claim.customer}</p>
                        <p className="text-xs text-muted-foreground">₹{claim.amount.toLocaleString()} · {claim.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Top Agents</CardTitle>
              <button onClick={() => navigate("/agents")} className="text-xs text-primary hover:underline">View All →</button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...mockAgents].sort((a, b) => b.rating - a.rating).slice(0, 5).map((agent) => (
                  <div key={agent.id} onClick={() => navigate(`/agents/${agent.id}`)} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {agent.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.completedClaims} completed · {agent.assignedClaims} active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-xs">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        <span className="font-medium text-card-foreground">{agent.rating}</span>
                      </div>
                      <StatusBadge status={agent.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance Chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Agent Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="score" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="claims" fill="hsl(142, 76%, 36%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
