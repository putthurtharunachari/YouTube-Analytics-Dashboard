import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Scale,
    TrendingUp,
    Users,
    Eye,
    Video,
    ThumbsUp,
    Trophy,
    Download,
    Plus,
    X,
    Check,
    BarChart3
} from "lucide-react";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";
import { formatNumber } from "@/lib/mockData";

export default function Comparison() {
    const [recentChannels, setRecentChannels] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [benchmark, setBenchmark] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [activeMetric, setActiveMetric] = useState("subscribers");

    useEffect(() => {
        // Fetch recent channels for selection
        axios.get(`${API_BASE_URL}/api/channels/recent`)
            .then(res => {
                if (res.data.status === "success") setRecentChannels(res.data.data);
            });

        // Fetch initial leaderboard
        fetchLeaderboard("subscribers");
    }, []);

    useEffect(() => {
        if (selectedIds.length > 0) {
            fetchComparisonData();
            if (selectedIds.length === 1) {
                fetchBenchmark(selectedIds[0]);
            } else {
                setBenchmark(null);
            }
        } else {
            setComparisonData([]);
            setTrendData([]);
            setBenchmark(null);
        }
    }, [selectedIds]);

    const fetchComparisonData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const ids = selectedIds.join(",");
            const [compRes, trendRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/analytics/compare?channel_ids=${ids}`),
                axios.get(`${API_BASE_URL}/api/analytics/compare/trends?channel_ids=${ids}`)
            ]);

            if (compRes.data.status === "success") {
                setComparisonData(compRes.data.data);
            } else {
                setErrorMsg("Backend returned an unsuccessful status.");
            }

            if (trendRes.data.status === "success") setTrendData(trendRes.data.data);
        } catch (error) {
            console.error("Comparison fetch failed", error);
            const backendError = error.response?.data?.detail;
            setErrorMsg(backendError ? `Data Issue: ${backendError}` : "Connection Error: Please ensure the analytics server is running.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async (metric) => {
        setActiveMetric(metric);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/analytics/leaderboard?metric=${metric}`);
            if (res.data.status === "success") setLeaderboard(res.data.data);
        } catch (error) {
            console.error("Leaderboard fetch failed", error);
        }
    };

    const fetchBenchmark = async (id) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/analytics/benchmark/${id}`);
            if (res.data.status === "success") setBenchmark(res.data.data);
        } catch (error) {
            console.error("Benchmark fetch failed", error);
        }
    };

    const toggleChannel = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else if (selectedIds.length < 3) {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleExport = (id) => {
        window.open(`${API_BASE_URL}/api/analytics/export?channel_id=${id}&format=csv`);
    };

    const colors = ["#00d2ff", "#ff006e", "#38bdf8"];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-xl shadow-xl backdrop-blur-md">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">{label}</p>
                    <div className="space-y-1.5">
                        {payload.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-semibold text-foreground">{item.name}</span>
                                </div>
                                <span className="text-xs font-display font-bold text-foreground">{formatNumber(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AnimatedPage>
            <motion.div variants={staggerChild} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Comparative Analytics</h1>
                    <p className="mt-1 text-muted-foreground">Compare performance across multiple channels and industry benchmarks</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 1 && (
                        <div className="flex bg-secondary/50 rounded-xl p-1 border border-border">
                            <button
                                onClick={() => window.open(`${API_BASE_URL}/api/analytics/compare/export?channel_ids=${selectedIds.join(",")}&format=pdf`)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                            >
                                <Download className="w-3 h-3" /> Combined PDF
                            </button>
                            <button
                                onClick={() => window.open(`${API_BASE_URL}/api/analytics/compare/export?channel_ids=${selectedIds.join(",")}&format=csv`)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                            >
                                <Download className="w-3 h-3" /> Combined CSV
                            </button>
                        </div>
                    )}
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Reset
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Channel Selection Strip */}
            <motion.div variants={staggerChild} className="glass-card p-6 mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Plus className="w-4 h-4" /> Select up to 3 channels to compare
                </h3>
                <div className="flex flex-wrap gap-3">
                    {recentChannels.map((ch) => (
                        <button
                            key={ch.channel_id}
                            onClick={() => toggleChannel(ch.channel_id)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 ${selectedIds.includes(ch.channel_id)
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50"
                                }`}
                        >
                            <div className="relative">
                                <img src={ch.thumbnail} alt={ch.name} className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                                {selectedIds.includes(ch.channel_id) && (
                                    <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                                        <Check className="w-2 h-2 shadow-sm" />
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-bold whitespace-nowrap">{ch.name}</span>
                        </button>
                    ))}
                    {recentChannels.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No channels analyzed yet. Go to Search to add some!</p>
                    )}
                </div>
            </motion.div>

            {errorMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {errorMsg}
                </motion.div>
            )}

            {selectedIds.length > 0 ? (
                <>
                    {/* Comparison Table */}
                    <motion.div variants={staggerChild} className="glass-card overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-secondary/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Metric</th>
                                        {comparisonData.map((ch, idx) => (
                                            <th key={ch.id} className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: colors[idx] }} />
                                                    <span className="font-display font-bold text-foreground text-base">{ch.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {[
                                        { label: "Subscribers", key: "subscribers", icon: <Users className="w-4 h-4" /> },
                                        { label: "Total Views", key: "total_views", icon: <Eye className="w-4 h-4" /> },
                                        { label: "Total Videos", key: "total_videos", icon: <Video className="w-4 h-4" /> },
                                        { label: "Engagement Rate", key: "engagement_rate", icon: <ThumbsUp className="w-4 h-4" />, suffix: "%" },
                                        { label: "Avg Views/Video", key: "avg_views_per_video", icon: <BarChart3 className="w-4 h-4" /> }
                                    ].map((row) => (
                                        <tr key={row.key} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-6 py-4 flex items-center gap-3 text-sm font-medium text-muted-foreground group-hover:text-foreground">
                                                {row.icon}
                                                {row.label}
                                            </td>
                                            {comparisonData.map((ch) => (
                                                <td key={ch.id} className="px-6 py-4">
                                                    <span className="font-display font-bold text-foreground">
                                                        {formatNumber(ch[row.key])}{row.suffix || ""}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground">Action</td>
                                        {comparisonData.map((ch) => (
                                            <td key={ch.id} className="px-6 py-4">
                                                <button
                                                    onClick={() => handleExport(ch.id)}
                                                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                                                >
                                                    <Download className="w-3 h-3" /> Export CSV
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Trend Comparison */}
                        <motion.div variants={staggerChild} className="glass-card p-6">
                            <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-foreground">
                                <TrendingUp className="w-5 h-5 text-primary" /> Growth Trend Comparison
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="top" align="right" height={36} />
                                        {comparisonData.map((ch, idx) => (
                                            <Line
                                                key={ch.id}
                                                type="monotone"
                                                dataKey={ch.name}
                                                stroke={colors[idx]}
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: colors[idx], strokeWidth: 2, stroke: 'var(--background)' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Benchmark Analysis */}
                        <motion.div variants={staggerChild} className="glass-card p-6">
                            <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-foreground">
                                <BarChart3 className="w-5 h-5 text-primary" /> Benchmark Analysis
                            </h3>
                            {benchmark ? (
                                <div className="space-y-6">
                                    <p className="text-sm text-muted-foreground mb-4">Comparing <span className="text-primary font-bold">{benchmark.channel.name}</span> against database averages.</p>
                                    {[
                                        { label: "Engagement Rate", key: "engagement_rate", suffix: "%" },
                                        { label: "Subscriber Base", key: "subscribers" },
                                        { label: "Overall Reach", key: "total_views" }
                                    ].map((metric) => {
                                        const chVal = benchmark.channel[metric.key];
                                        const avgVal = benchmark.averages[metric.key];
                                        const diff = ((chVal - avgVal) / avgVal) * 100;

                                        return (
                                            <div key={metric.key} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-sm font-medium text-foreground">{metric.label}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                                        {diff >= 0 ? "+" : ""}{diff.toFixed(1)}% vs. Avg
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${Math.min((chVal / avgVal) * 50, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                    <span>Your Channel: {formatNumber(chVal)}{metric.suffix || ""}</span>
                                                    <span>DB Avg: {formatNumber(avgVal)}{metric.suffix || ""}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-2xl">
                                    <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                    <p className="text-sm text-muted-foreground">Select exactly 1 channel to see industry benchmark analysis</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            ) : (
                <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
                    <Scale className="w-16 h-16 text-primary/20 mb-6" />
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2">No Channels Selected</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Choose up to 3 channels from the list above to compare their growth, engagement, and reach side-by-side.
                    </p>
                </div>
            )}

            {/* Global Leaderboard Section */}
            <motion.div variants={staggerChild} className="glass-card p-8 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="font-display font-bold text-2xl flex items-center gap-3 text-foreground">
                            <Trophy className="w-6 h-6 text-yellow-500" /> Global Leaderboard
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">Top performing channels in your analyzed collection</p>
                    </div>
                    <div className="flex rounded-xl bg-secondary p-1">
                        {["subscribers", "views"].map((m) => (
                            <button
                                key={m}
                                onClick={() => fetchLeaderboard(m)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeMetric === m ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {leaderboard.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-secondary/30 border border-border p-4 rounded-2xl relative group hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white font-display font-bold text-sm shadow-xl z-10 border-4 border-card">
                                {item.rank}
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 border-2 border-primary/20 group-hover:border-primary transition-colors">
                                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <h4 className="font-bold text-foreground text-sm line-clamp-1 mb-1">{item.name}</h4>
                                <p className="text-primary font-display font-black text-lg">
                                    {formatNumber(item.value)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {leaderboard.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground italic">
                            Analyzing channels to build the leaderboard...
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatedPage>
    );
}
