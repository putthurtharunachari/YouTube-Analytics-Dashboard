import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Eye, Video, ThumbsUp, MessageCircle, Clock, Loader2, AlertCircle, FileText, Download } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import axios from "axios";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";
import { formatNumber } from "@/lib/mockData";
import TooltipComponent from "@/components/Tooltip";

const TOOLTIP_TEXTS = {
    "Subscribers": "Total number of users subscribed to this channel.",
    "Total Views": "Total lifetime views across all videos on the channel.",
    "Videos": "Total number of videos uploaded by this channel.",
    "Likes": "Total number of likes across all videos.",
    "Comments": "Total number of comments received.",
    "Engagement Rate": "Percentage of viewers who like or comment. Formula: (Likes + Comments) / Views * 100."
};

const COLORS = ['#00d2ff', '#3a86ff', '#8338ec', '#ff006e', '#fb5607'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 border border-border !bg-popover/90 shadow-2xl backdrop-blur-md rounded-xl">
                <p className="text-foreground font-medium mb-1">{label}</p>
                <p className="text-primary font-bold text-lg">
                    {formatNumber(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState("all");

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
                const res = await axios.get(`${API_BASE_URL}/api/analytics/${channelId}/dashboard?time_range=${timeRange}`);
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
    }, [timeRange]);

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

    const { channelInfo, metrics, topVideos, growthData, categoryData } = data;

    // Dynamically assign icons safely
    const assignIcon = (label) => {
        if (label.includes("Subscribers")) return Users;
        if (label.includes("Views")) return Eye;
        if (label.includes("Video")) return Video;
        if (label.includes("Likes")) return ThumbsUp;
        if (label.includes("Comment")) return MessageCircle;
        return Clock;
    };

    return (
        <AnimatedPage>
            <motion.div variants={staggerChild} className="mb-8 flex items-end gap-6">
                <div className="w-16 h-16 rounded-2xl bg-cover bg-center border-2 border-white/10 shadow-lg" style={{ backgroundImage: `url(${channelInfo.thumbnail})` }}></div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Channel Overview</h1>
                    <p className="mt-1 text-muted-foreground font-medium">{channelInfo.name} <span className="opacity-60 text-sm ml-2">{channelInfo.handle}</span></p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open(`${API_BASE_URL}/api/analytics/export?channel_id=${localStorage.getItem('selectedChannel')}&format=pdf`, '_blank')}
                        className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" /> PDF Report
                    </button>
                    <button
                        onClick={() => window.open(`${API_BASE_URL}/api/analytics/export?channel_id=${localStorage.getItem('selectedChannel')}&format=xlsx`, '_blank')}
                        className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Excel Data
                    </button>
                </div>
            </motion.div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                {metrics.map((stat, i) => {
                    const Icon = assignIcon(stat.label);
                    return (
                        <motion.div
                            key={stat.label}
                            variants={staggerChild}
                            whileHover={{ y: -4, rotateY: 5, rotateX: 5, scale: 1.02 }}
                            className="glass-card p-5 relative group"
                            style={{ transformStyle: "preserve-3d", perspective: "800px" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl pointer-events-none" />

                            <div className="flex justify-between items-start mb-2" style={{ transform: "translateZ(20px)" }}>
                                <p className="text-sm font-medium text-muted-foreground flex items-center">
                                    {stat.label}
                                    {TOOLTIP_TEXTS[stat.label] && <TooltipComponent text={TOOLTIP_TEXTS[stat.label]} />}
                                </p>
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Icon className="w-4 h-4 text-primary" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold font-display text-foreground" style={{ transform: "translateZ(30px)" }}>
                                {stat.isSuffix ? `${stat.value}%` : formatNumber(stat.value)}
                            </h3>

                            <div className="mt-2 flex items-center text-xs" style={{ transform: "translateZ(10px)" }}>
                                <span className="text-emerald-400 font-medium">↑ {stat.trend}</span>
                                <span className="text-muted-foreground ml-1">vs last period</span>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 w-full">
                {/* Line Chart Area */}
                <motion.div variants={staggerChild} className="glass-card p-6 lg:col-span-2 relative group w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <h3 className="font-display font-bold text-lg flex items-center justify-between">
                        Views Trend
                        <select
                            className="bg-white/5 border border-white/10 text-xs rounded-lg px-2 py-1 outline-none font-normal text-muted-foreground cursor-pointer"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="12">Last 12 Months</option>
                            <option value="6">Last 6 Months</option>
                            <option value="all">All Time</option>
                        </select>
                    </h3>
                    <div className="h-[300px] w-full mt-4">
                        {growthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#00d2ff"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">Not enough timeline data to plot views.</div>
                        )}
                    </div>
                </motion.div>

                {/* Pie Chart Area */}
                <motion.div variants={staggerChild} className="glass-card p-6 w-full relative group flex flex-col items-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <h3 className="font-display font-bold text-lg mb-2 self-start w-full">Content Categories</h3>
                    <div className="flex-1 w-full flex items-center justify-center min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Top Videos Table */}
            <motion.div variants={staggerChild} className="glass-card p-6 w-full overflow-hidden relative">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 blur-3xl pointer-events-none" />
                <h3 className="font-display font-bold text-lg mb-6">Top Performing Videos</h3>

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-4 rounded-tl-lg">#</th>
                                <th scope="col" className="px-6 py-4 w-full">Title</th>
                                <th scope="col" className="px-6 py-4 text-right">Views</th>
                                <th scope="col" className="px-6 py-4 text-right">Likes</th>
                                <th scope="col" className="px-6 py-4 text-right">Comments</th>
                                <th scope="col" className="px-6 py-4 text-right rounded-tr-lg">Engagement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topVideos.map((video, idx) => (
                                <motion.tr
                                    key={video.id + "-" + idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.05) }}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                                    onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                                >
                                    <td className="px-6 py-4 font-medium text-muted-foreground">{idx + 1}</td>
                                    <td className="px-6 py-4 font-medium text-foreground whitespace-normal w-full group-hover:text-primary transition-colors flex items-center gap-4">
                                        <div className="w-20 h-12 bg-secondary rounded overflow-hidden flex-shrink-0 relative">
                                            <img src={video.thumbnail} alt={video.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                        <span className="line-clamp-2 max-w-sm">{video.title}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">{formatNumber(video.views)}</td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">{formatNumber(video.likes)}</td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">{formatNumber(video.comments)}</td>
                                    <td className="px-6 py-4 text-right text-primary font-medium">{video.engagement}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </AnimatedPage>
    );
}
