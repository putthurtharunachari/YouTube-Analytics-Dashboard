import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";
import { formatNumber } from "@/lib/mockData";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-4 border border-border !bg-popover/95 shadow-2xl backdrop-blur-md rounded-xl">
                <p className="text-foreground font-medium mb-3 border-b border-border pb-2">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-muted-foreground text-sm font-medium">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="text-foreground font-bold text-sm">
                                {formatNumber(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function Engagement() {
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
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/analytics/${channelId}/engagement`);
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

    if (loading && !data) return (
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

    const { channelInfo, funnelData, patternData, timelineData, heatmapData } = data;

    // We calculate max value in funnel to size the bars
    const maxFunnelValue = Math.max(...funnelData.map(d => d.value));

    return (
        <AnimatedPage>
            <motion.div variants={staggerChild} className="mb-8 flex items-end gap-6">
                <div className="w-16 h-16 rounded-2xl bg-cover bg-center border-2 border-white/10 shadow-lg" style={{ backgroundImage: `url(${channelInfo.thumbnail})` }}></div>
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">Engagement Analytics</h1>
                        <p className="mt-1 text-muted-foreground font-medium">Understand how your audience interacts with content</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-6">
                {/* Weekly Engagement Pattern (Radar) */}
                <motion.div variants={staggerChild} className="glass-card p-6 w-full flex flex-col items-center">
                    <h3 className="font-display font-bold text-lg mb-2 self-start">Weekly Engagement Pattern</h3>
                    <div className="w-full h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={patternData}>
                                <PolarGrid stroke="#ffffff20" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Views" dataKey="Views" stroke="#00a8e8" fill="#00a8e8" fillOpacity={0.4} />
                                <Radar name="Likes" dataKey="Likes" stroke="#f72585" fill="#f72585" fillOpacity={0.4} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Engagement Funnel */}
                <motion.div variants={staggerChild} className="glass-card p-6 w-full">
                    <h3 className="font-display font-bold text-lg mb-6 self-start">Engagement Funnel</h3>
                    <div className="space-y-4">
                        {funnelData.map((item, index) => (
                            <div key={index} className="w-full">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                                    <span className="text-sm font-medium text-muted-foreground">{formatNumber(item.value)}</span>
                                </div>
                                <div className="w-full h-6 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: item.fill, width: `${Math.max((item.value / maxFunnelValue) * 100, 1)}%` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max((item.value / maxFunnelValue) * 100, 1)}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Engagement Metrics Over Time */}
            <motion.div variants={staggerChild} className="glass-card p-6 w-full mb-6">
                <h3 className="font-display font-bold text-lg mb-6">Engagement Metrics Over Time</h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey="views" name="views" stroke="#00a8e8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="likes" name="likes" stroke="#f72585" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="comments" name="comments" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div variants={staggerChild} className="glass-card p-6 w-full">
                <h3 className="font-display font-bold text-lg mb-6">Activity Heatmap</h3>
                <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full border-collapse min-w-[600px]">
                        <thead>
                            <tr>
                                <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground w-20">Time</th>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <th key={day} className="text-center py-4 px-2 text-sm font-medium text-muted-foreground">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {heatmapData.map((row, i) => (
                                <tr key={i} className="border-t border-white/5">
                                    <td className="py-4 px-2 text-sm text-foreground font-medium">{row.time}</td>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                        const val = row[day] || 0;
                                        // Visual intensity coloring (light blue to solid blue based on value 0-100)
                                        const bgOpacity = Math.max(0.1, val / 100);
                                        return (
                                            <td key={day} className="p-2 text-center">
                                                <div
                                                    className="w-full py-3 rounded-full text-xs font-bold transition-all hover:scale-105 cursor-pointer"
                                                    style={{
                                                        backgroundColor: `rgba(0, 168, 232, ${bgOpacity})`,
                                                        color: bgOpacity > 0.5 ? '#fff' : '#e2e8f0'
                                                    }}
                                                >
                                                    {val}
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </AnimatedPage>
    );
}
