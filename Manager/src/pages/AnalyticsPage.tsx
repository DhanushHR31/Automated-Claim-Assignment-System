import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart
} from "recharts";
import { monthlyClaimsData, agentPerformanceData, claimStatusData, claimTypeData, weeklyTrendData } from "@/lib/mockData";
import StatCard from "@/components/StatCard";
import { TrendingUp, Clock, Zap, DollarSign, Users, FileText, Target, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const revenueData = [
  { month: "Jan", revenue: 450000, cost: 320000, profit: 130000 },
  { month: "Feb", revenue: 520000, cost: 350000, profit: 170000 },
  { month: "Mar", revenue: 610000, cost: 400000, profit: 210000 },
  { month: "Apr", revenue: 480000, cost: 310000, profit: 170000 },
  { month: "May", revenue: 550000, cost: 360000, profit: 190000 },
  { month: "Jun", revenue: 670000, cost: 420000, profit: 250000 },
];

const radarData = [
  { metric: "Speed", Rajesh: 78, Priya: 92, Sneha: 96, fullMark: 100 },
  { metric: "Quality", Rajesh: 85, Priya: 88, Sneha: 94, fullMark: 100 },
  { metric: "Accuracy", Rajesh: 82, Priya: 90, Sneha: 91, fullMark: 100 },
  { metric: "Communication", Rajesh: 88, Priya: 85, Sneha: 89, fullMark: 100 },
  { metric: "Punctuality", Rajesh: 80, Priya: 93, Sneha: 95, fullMark: 100 },
  { metric: "Documentation", Rajesh: 75, Priya: 91, Sneha: 90, fullMark: 100 },
];

const tooltipStyle = { borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 };

const AnalyticsPage = () => (
  <DashboardLayout title="Analytics Dashboard">
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Claim Success Rate" value="78%" icon={<TrendingUp className="h-5 w-5" />} trend={{ value: 5, positive: true }} gradient="gradient-success" />
        <StatCard title="Avg Claim Time" value="4.2 days" icon={<Clock className="h-5 w-5" />} trend={{ value: 12, positive: true }} gradient="gradient-info" />
        <StatCard title="Agent Efficiency" value="87%" icon={<Zap className="h-5 w-5" />} trend={{ value: 3, positive: true }} gradient="gradient-primary" />
        <StatCard title="Total Revenue" value="₹32.5L" icon={<DollarSign className="h-5 w-5" />} trend={{ value: 18, positive: true }} gradient="gradient-warning" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Active Agents</p><p className="text-xl font-bold text-card-foreground">5</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><FileText className="h-5 w-5 text-success" /></div>
          <div><p className="text-xs text-muted-foreground">Total Claims</p><p className="text-xl font-bold text-card-foreground">734</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Target className="h-5 w-5 text-warning" /></div>
          <div><p className="text-xs text-muted-foreground">Avg Rating</p><p className="text-xl font-bold text-card-foreground">4.5 ★</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-xs text-muted-foreground">Rejection Rate</p><p className="text-xl font-bold text-card-foreground">12%</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Analysis</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Claims Area Chart */}
            <Card>
              <CardHeader><CardTitle className="text-base">Monthly Claims Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyClaimsData}>
                    <defs>
                      <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="claims" stroke="hsl(217, 91%, 60%)" fill="url(#colorClaims)" strokeWidth={2} name="Total Claims" />
                    <Area type="monotone" dataKey="approved" stroke="hsl(142, 76%, 36%)" fill="url(#colorApproved)" strokeWidth={2} name="Approved" />
                    <Line type="monotone" dataKey="rejected" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} name="Rejected" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card>
              <CardHeader><CardTitle className="text-base">This Week's Activity</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="claims" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="New Claims" barSize={20} />
                    <Line type="monotone" dataKey="resolved" stroke="hsl(142, 76%, 36%)" strokeWidth={2.5} name="Resolved" dot={{ r: 4, fill: "hsl(142, 76%, 36%)" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader><CardTitle className="text-base">Claims Status Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={claimStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={4} strokeWidth={0}>
                      {claimStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center">
                  {claimStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Claim Types */}
            <Card>
              <CardHeader><CardTitle className="text-base">Claim Types Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={claimTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={70} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}`, "Count"]} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                      {claimTypeData.map((_, i) => (
                        <Cell key={i} fill={["hsl(217, 91%, 60%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Bar */}
            <Card>
              <CardHeader><CardTitle className="text-base">Agent Performance Scores</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="score" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} name="Score" barSize={25} />
                    <Bar dataKey="efficiency" fill="hsl(142, 76%, 36%)" radius={[6, 6, 0, 0]} name="Efficiency %" barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader><CardTitle className="text-base">Top Agents Comparison</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Rajesh" dataKey="Rajesh" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Priya" dataKey="Priya" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Sneha" dataKey="Sneha" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.15} strokeWidth={2} />
                    <Legend />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Avg Claim Time */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Agent Avg Claim Processing Time (days)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={agentPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="avgTime" radius={[6, 6, 0, 0]} barSize={30}>
                      {agentPerformanceData.map((entry, i) => (
                        <Cell key={i} fill={entry.avgTime < 3 ? "hsl(142, 76%, 36%)" : entry.avgTime < 4 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Cost */}
            <Card>
              <CardHeader><CardTitle className="text-base">Revenue vs Cost</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v / 1000}K`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[6, 6, 0, 0]} name="Revenue" />
                    <Bar dataKey="cost" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profit Trend */}
            <Card>
              <CardHeader><CardTitle className="text-base">Profit Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v / 1000}K`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Profit"]} />
                    <Area type="monotone" dataKey="profit" stroke="hsl(142, 76%, 36%)" fill="url(#colorProfit)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(142, 76%, 36%)" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Claim Amount by Type */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Settlement Amount by Claim Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={claimTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v / 100000}L`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Amount"]} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={40}>
                      {claimTypeData.map((_, i) => (
                        <Cell key={i} fill={["hsl(217, 91%, 60%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(199, 89%, 48%)"][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </DashboardLayout>
);

export default AnalyticsPage;
