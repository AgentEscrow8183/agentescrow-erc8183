import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Award,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";
import { trpc } from "@/lib/trpc";

const STATE_COLORS: Record<string, string> = {
  open: "oklch(0.82 0.05 200)",
  funded: "oklch(0.72 0.22 195)",
  submitted: "oklch(0.75 0.22 55)",
  completed: "oklch(0.78 0.22 145)",
  rejected: "oklch(0.62 0.25 25)",
  expired: "oklch(0.55 0.04 220)",
  cancelled: "oklch(0.45 0.04 220)",
};

const STATE_HEX: Record<string, string> = {
  open: "#a8d8e8",
  funded: "#4fc3f7",
  submitted: "#ffd54f",
  completed: "#81c784",
  rejected: "#e57373",
  expired: "#90a4ae",
  cancelled: "#78909c",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="cyber-card rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-['Orbitron'] font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-[oklch(0.55_0.04_220)] mt-1">{label}</div>
      {sub && <div className="text-[10px] text-[oklch(0.45_0.04_220)] mt-0.5">{sub}</div>}
    </motion.div>
  );
}

export default function Analytics() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: allJobs = [], isLoading } = trpc.jobs.list.useQuery(
    {},
    { refetchInterval: 30000 }
  );

  // Compute stats from jobs
  const total = allJobs.length;
  const completed = allJobs.filter((j) => j.state === "completed").length;
  const rejected = allJobs.filter((j) => j.state === "rejected").length;
  const active = allJobs.filter((j) => ["open", "funded", "submitted"].includes(j.state)).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // State distribution for pie chart
  const stateCounts = Object.entries(
    allJobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.state] = (acc[j.state] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value, color: STATE_HEX[name] ?? "#888" }));

  // Jobs by day (last 7 days)
  const now = Date.now();
  const dayMs = 86400000;
  const jobsByDay = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (6 - i) * dayMs;
    const dayEnd = dayStart + dayMs;
    const date = new Date(dayStart);
    const label = date.toLocaleDateString("en", { weekday: "short" });
    const count = allJobs.filter((j) => {
      const t = new Date(j.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    return { day: label, jobs: count };
  });

  // Top clients by job count
  const clientMap = allJobs.reduce<Record<string, number>>((acc, j) => {
    const addr = j.clientAddress;
    acc[addr] = (acc[addr] ?? 0) + 1;
    return acc;
  }, {});
  const topClients = Object.entries(clientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([addr, count]) => ({ addr, count }));

  // Top providers by completed jobs
  const providerMap = allJobs
    .filter((j) => j.state === "completed")
    .reduce<Record<string, number>>((acc, j) => {
      const addr = j.providerAddress;
      acc[addr] = (acc[addr] ?? 0) + 1;
      return acc;
    }, {});
  const topProviders = Object.entries(providerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([addr, count]) => ({ addr, count }));

  const shortAddr = (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="container py-6 sm:py-8 px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[oklch(0.72_0.22_195/0.1)] border border-[oklch(0.72_0.22_195/0.3)] flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-[oklch(0.78_0.22_195)]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-['Orbitron'] font-black text-[oklch(0.92_0.02_200)]">
                  PROTOCOL ANALYTICS
                </h1>
                <p className="text-xs text-[oklch(0.55_0.04_220)]">Real-time ERC-8183 statistics</p>
              </div>
            </div>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="flex items-center gap-2 text-xs text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors border border-[oklch(0.2_0.03_260)] px-3 py-1.5 rounded hover:border-[oklch(0.78_0.22_195/0.3)] self-start sm:self-auto"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[oklch(0.78_0.22_195)] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[oklch(0.55_0.04_220)]">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatCard
                  icon={Layers}
                  label="Total Jobs"
                  value={total}
                  sub="All time"
                  color="oklch(0.72 0.22 195)"
                  delay={0}
                />
                <StatCard
                  icon={Activity}
                  label="Active Jobs"
                  value={active}
                  sub="Open + Funded + Submitted"
                  color="oklch(0.75 0.22 55)"
                  delay={0.05}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Completed"
                  value={completed}
                  sub={`${completionRate}% completion rate`}
                  color="oklch(0.78 0.22 145)"
                  delay={0.1}
                />
                <StatCard
                  icon={XCircle}
                  label="Rejected"
                  value={rejected}
                  sub="Evaluator rejected"
                  color="oklch(0.62 0.25 25)"
                  delay={0.15}
                />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Jobs per day */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="cyber-card rounded-xl p-4 sm:p-5"
                >
                  <h3 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4">
                    JOBS CREATED (LAST 7 DAYS)
                  </h3>
                  {total === 0 ? (
                    <div className="flex items-center justify-center h-40 text-xs text-[oklch(0.45_0.04_220)]">
                      No data yet — create some jobs first
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={jobsByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.03 260)" />
                        <XAxis dataKey="day" tick={{ fill: "oklch(0.55 0.04 220)", fontSize: 10 }} />
                        <YAxis tick={{ fill: "oklch(0.55 0.04 220)", fontSize: 10 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            background: "oklch(0.1 0.02 260)",
                            border: "1px solid oklch(0.78 0.22 195 / 0.3)",
                            borderRadius: "8px",
                            color: "oklch(0.92 0.02 200)",
                            fontSize: "11px",
                          }}
                        />
                        <Bar dataKey="jobs" fill="oklch(0.72 0.22 195)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>

                {/* State distribution pie */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="cyber-card rounded-xl p-4 sm:p-5"
                >
                  <h3 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4">
                    JOB STATE DISTRIBUTION
                  </h3>
                  {total === 0 ? (
                    <div className="flex items-center justify-center h-40 text-xs text-[oklch(0.45_0.04_220)]">
                      No data yet — create some jobs first
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie
                            data={stateCounts}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {stateCounts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "oklch(0.1 0.02 260)",
                              border: "1px solid oklch(0.78 0.22 195 / 0.3)",
                              borderRadius: "8px",
                              color: "oklch(0.92 0.02 200)",
                              fontSize: "11px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-1.5 flex-1">
                        {stateCounts.map((s) => (
                          <div key={s.name} className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                              <span className="text-[oklch(0.65_0.04_220)] font-mono">{s.name}</span>
                            </div>
                            <span className="text-[oklch(0.92_0.02_200)] font-bold">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Leaderboards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Top Clients */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="cyber-card rounded-xl p-4 sm:p-5"
                >
                  <h3 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[oklch(0.72_0.22_195)]" />
                    TOP CLIENTS (BY JOBS CREATED)
                  </h3>
                  {topClients.length === 0 ? (
                    <p className="text-xs text-[oklch(0.45_0.04_220)] py-4 text-center">No data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {topClients.map((c, i) => (
                        <div key={c.addr} className="flex items-center gap-3">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              background: i === 0 ? "oklch(0.75 0.22 55 / 0.2)" : "oklch(0.2 0.03 260)",
                              color: i === 0 ? "oklch(0.75 0.22 55)" : "oklch(0.55 0.04 220)",
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-xs font-mono text-[oklch(0.72_0.22_195)] flex-1 truncate">
                            {shortAddr(c.addr)}
                          </span>
                          <span className="text-xs font-bold text-[oklch(0.92_0.02_200)]">{c.count} jobs</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Top Providers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="cyber-card rounded-xl p-4 sm:p-5"
                >
                  <h3 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[oklch(0.78_0.22_145)]" />
                    TOP PROVIDERS (COMPLETED JOBS)
                  </h3>
                  {topProviders.length === 0 ? (
                    <p className="text-xs text-[oklch(0.45_0.04_220)] py-4 text-center">No completed jobs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {topProviders.map((p, i) => (
                        <div key={p.addr} className="flex items-center gap-3">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              background: i === 0 ? "oklch(0.78 0.22 145 / 0.2)" : "oklch(0.2 0.03 260)",
                              color: i === 0 ? "oklch(0.78 0.22 145)" : "oklch(0.55 0.04 220)",
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-xs font-mono text-[oklch(0.68_0.28_295)] flex-1 truncate">
                            {shortAddr(p.addr)}
                          </span>
                          <span className="text-xs font-bold text-[oklch(0.92_0.02_200)]">{p.count} done</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Protocol health */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="cyber-card rounded-xl p-4 sm:p-5 mt-4 sm:mt-6"
              >
                <h3 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4">
                  PROTOCOL HEALTH
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Completion Rate", val: `${completionRate}%`, color: "oklch(0.78 0.22 145)" },
                    { label: "Rejection Rate", val: total > 0 ? `${Math.round((rejected / total) * 100)}%` : "0%", color: "oklch(0.62 0.25 25)" },
                    { label: "Active Rate", val: total > 0 ? `${Math.round((active / total) * 100)}%` : "0%", color: "oklch(0.72 0.22 195)" },
                    { label: "Avg Jobs/Day", val: total > 0 ? (total / 30).toFixed(1) : "0", color: "oklch(0.75 0.22 55)" },
                  ].map((h) => (
                    <div key={h.label} className="text-center">
                      <div className="text-xl sm:text-2xl font-['Orbitron'] font-bold" style={{ color: h.color }}>
                        {h.val}
                      </div>
                      <div className="text-[10px] text-[oklch(0.55_0.04_220)] mt-1">{h.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
      <AIChatWidget />
    </div>
  );
}
