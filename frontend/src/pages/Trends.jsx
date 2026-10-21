import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Zap, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";
import {
    AreaChart, Area, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

const iconMap = {
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown,
    Target: Target,
    Zap: Zap
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover/90 backdrop-blur-md p-4 border border-border shadow-2xl rounded-xl">
                <p className="text-foreground font-medium mb-2">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry, index) => {
                        let val = entry.value;
                        if (entry.dataKey === 'subscribers' || entry.dataKey === 'views') {
                            val = val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
                        }
                        const pName = entry.dataKey === 'videos' ? 'videos' : entry.name;
                        return (
                            <div key={index} className="flex items-center justify-between gap-6 text-sm">
                                <span style={{ color: entry.color }} className="capitalize font-medium">
                                    {pName} :
                                </span>
                                <span className="text-foreground font-bold">
                                    {val}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
    return null;
};

const formatYAxisSubscribers = (tickItem) => {
    if (tickItem >= 1000000) return (tickItem / 1000000).toFixed(1) + 'M';
    if (tickItem >= 1000) return (tickItem / 1000).toFixed(1) + 'K';
    return tickItem;
};

export default function Trends() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const channelId = localStorage.getItem('selectedChannel');
        if (!channelId) {
            setError("No channel selected. Please search for a channel first.");
            setLoading(false);
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/analytics/${channelId}/trends`);
                if (res.data.status === 'success') {
                    setData(res.data.data);
                } else {
                    setError("Failed to fetch analytics.");
                }
            } catch (err) {
                console.error(err);
                setError("Error connecting to backend analytics API.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return (
        <AnimatedPage className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </AnimatedPage>
    );

    if (error) return (
        <AnimatedPage className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold font-display">{error}</h2>
            <a href="/search" className="btn-primary-glow px-6 py-2">Go to Search</a>
        </AnimatedPage>
    );

    const { topStats, subscriberGrowth, monthlyUploads, growthStory } = data;

    return (
        <AnimatedPage>
            <motion.div variants={staggerChild} className="mb-8">
                <div>
                    <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">Trends & Insights</h1>
                    <p className="mt-2 text-muted-foreground font-medium text-lg">Growth patterns, predictions, and actionable insights</p>
                </div>
            </motion.div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {topStats.map((stat, idx) => {
                    const Icon = iconMap[stat.icon] || TrendingUp;
                    return (
                        <motion.div
                            key={idx}
                            variants={staggerChild}
                            className="glass-card p-6 flex flex-col justify-between rounded-2xl shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                                </div>
                                <div className={`p-2 rounded-full ${stat.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug">{stat.desc}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 w-full">
                {/* Subscriber Growth Trend */}
                <motion.div variants={staggerChild} className="glass-card p-6 rounded-2xl shadow-sm w-full">
                    <h3 className="font-display font-bold text-lg mb-6 text-foreground">Subscriber Growth Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={subscriberGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff006e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ff006e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={true} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 12 }} tickFormatter={formatYAxisSubscribers} width={50} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeOpacity: 0.2, strokeWidth: 1, strokeDasharray: '5 5' }} />
                                <Area type="monotone" dataKey="subscribers" stroke="#ff006e" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" dot={{ r: 4, fill: '#ff006e', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Monthly Upload Frequency */}
                <motion.div variants={staggerChild} className="glass-card p-6 rounded-2xl shadow-sm w-full">
                    <h3 className="font-display font-bold text-lg mb-6 text-foreground">Monthly Upload Frequency</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyUploads} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={true} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 12 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 12 }} width={30} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 12 }} tickFormatter={formatYAxisSubscribers} width={50} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', fillOpacity: 0.05 }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" formatter={(value) => <span className="text-muted-foreground font-medium capitalize">{value}</span>} />
                                <Bar yAxisId="left" dataKey="videos" barSize={20} fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="views" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, fill: '#fbbf24', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* The Growth Story */}
            <motion.div variants={staggerChild} className="glass-card p-8 rounded-2xl shadow-sm w-full mb-8">
                <h3 className="font-display font-bold text-2xl mb-8 text-foreground">The Growth Story</h3>
                <div className="relative border-l-2 border-border ml-3 md:ml-6 space-y-12 pb-4">
                    {growthStory.map((story, idx) => (
                        <div key={idx} className="relative pl-8 md:pl-10">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-[4px] border-card shadow-sm`} style={{ backgroundColor: story.color }} />

                            <div>
                                <span className="text-sm font-semibold tracking-wide" style={{ color: story.color }}>{story.date}</span>
                                <h4 className="text-lg font-bold text-foreground mt-1 mb-2">{story.title}</h4>
                                <p className="text-muted-foreground text-sm md:text-base">{story.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </AnimatedPage>
    );
}
