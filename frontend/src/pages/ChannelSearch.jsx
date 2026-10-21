import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Eye, Video, ThumbsUp, Calendar, ExternalLink, Loader2 } from "lucide-react";
import axios from "axios";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";
import { formatNumber } from "@/lib/mockData";
import { z } from "zod";

const channelIdSchema = z
    .string()
    .trim()
    .min(1, "Please enter a Channel ID")
    .max(50, "Channel ID is too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid Channel ID format");

const defaultId = "UCBcRF18a7Qf58cCRy5xuWwQ";

export default function ChannelSearch() {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState("Fetching channel data...");
    const [recentChannels, setRecentChannels] = useState([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/channels/recent`)
            .then(res => {
                if (res.data.status === "success") setRecentChannels(res.data.data);
            })
            .catch(err => console.error("Could not load recent channels.", err));
    }, []);

    const handleSearch = async (overrideId) => {
        setError(null);
        setSuccessMsg(null);
        const val = typeof overrideId === 'string' ? overrideId : (inputValue.trim() || defaultId);
        const parsed = channelIdSchema.safeParse(val);

        if (!parsed.success) {
            setError(parsed.error.errors[0].message);
            return;
        }

        setLoading(true);
        setLoadingStatus("Fetching Channel Basic Metadata...");
        setResult(null);

        try {
            // Step 1: Call Python FastAPI backend for Channel Info
            const response = await axios.post(`${API_BASE_URL}/api/extract/channel/${parsed.data}`);

            if (response.data.status === "success" && response.data.data) {
                const apiData = response.data.data;
                const dbId = response.data.db_id;

                // Show channel info UI immediately
                setResult({
                    id: apiData.channel_id,
                    name: apiData.name,
                    handle: "@" + apiData.name.replace(/\s+/g, '').toLowerCase(),
                    subscribers: apiData.subscribers,
                    totalViews: apiData.total_views,
                    totalVideos: apiData.total_videos,
                    likes: Math.floor(apiData.total_views * 0.05), // Mock likes if API doesn't provide channel-wide likes
                    description: apiData.description,
                    createdAt: apiData.published_at,
                    thumbnail: apiData.thumbnail,
                    banner: apiData.banner || "",
                    country: "Global",
                    engagementRate: 5.4,
                });

                // Save selected channel to local storage for use in Dashboard, Trends, etc.
                localStorage.setItem('selectedChannel', apiData.channel_id);

                // Step 2: Fetch and store Videos securely, pass the DB ID
                setLoadingStatus("Scanning all Video metadata to calculate Engagement...");
                const videoRes = await axios.post(`${API_BASE_URL}/api/extract/videos/${parsed.data}?db_id=${dbId}`);

                setSuccessMsg(videoRes.data.message);

                // Optional: Update recent channels list after new fetch
                axios.get(`${API_BASE_URL}/api/channels/recent`)
                    .then(res => setRecentChannels(res.data.data));
            } else {
                setError("Failed to parse valid channel data from API.");
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(`API Error: ${err.response.data.detail}`);
            } else {
                setError("Failed to connect to the backend server. Is it running on port 8001?");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedPage>
            <motion.div variants={staggerChild} className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground">Channel Lookup</h1>
                <p className="mt-1 text-muted-foreground">Enter a YouTube Channel ID to fetch analytics</p>
            </motion.div>

            {/* Search Input */}
            <motion.div
                variants={staggerChild}
                className="glass-card mx-auto max-w-2xl p-6"
            >
                <label className="mb-2 block text-sm font-medium text-foreground">YouTube Channel ID</label>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => { setInputValue(e.target.value); setError(null); }}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="e.g. UCBcRF18a7Qf58cCRy5xuWwQ"
                            maxLength={50}
                            className="h-12 w-full rounded-xl border border-input bg-secondary/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSearch}
                        disabled={loading}
                        className="btn-primary-glow flex h-12 items-center gap-2 whitespace-nowrap disabled:opacity-60"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Fetch Data
                    </motion.button>
                </div>

                {error && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-destructive">
                        {error}
                    </motion.p>
                )}

                {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <p className="font-medium text-sm flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {successMsg}
                        </p>
                    </motion.div>
                )}

                {recentChannels.length > 0 ? (
                    <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Recently Analyzed:</p>
                        <div className="flex flex-wrap gap-2">
                            {recentChannels.map((rc) => (
                                <button
                                    key={rc.channel_id}
                                    onClick={() => { setInputValue(rc.channel_id); handleSearch(rc.channel_id); }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition text-xs text-primary font-medium"
                                >
                                    <img
                                        src={rc.thumbnail}
                                        alt={rc.name}
                                        referrerPolicy="no-referrer"
                                        className="w-4 h-4 rounded-full object-cover"
                                    />
                                    {rc.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Try: <button onClick={() => setInputValue("UCBcRF18a7Qf58cCRy5xuWwQ")} className="text-primary hover:underline">UCBcRF18a7Qf58cCRy5xuWwQ</button>
                        {" · "}
                        <button onClick={() => setInputValue("UC_x5XG1OV2P6uZZ5FSM9Ttw")} className="text-primary hover:underline">UC_x5XG1OV2P6uZZ5FSM9Ttw</button>
                        {" · "}
                        <button onClick={() => setInputValue("UCVHFbqXqoYvEWM1Ddxl0QDg")} className="text-primary hover:underline">UCVHFbqXqoYvEWM1Ddxl0QDg</button>
                    </p>
                )}
            </motion.div>

            {/* Loading State */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-12 flex flex-col items-center gap-4"
                    >
                        <motion.div
                            className="h-16 w-16 rounded-2xl bg-primary/20"
                            animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                            transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                        />
                        <p className="text-sm font-medium text-foreground">{loadingStatus}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
                {result && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                        className="mx-auto mt-10 max-w-4xl"
                    >
                        {/* Channel Header */}
                        <motion.div
                            className="glass-card overflow-hidden"
                            whileHover={{ y: -2 }}
                        >
                            {/* Banner area */}
                            <div className="h-32 w-full relative bg-secondary overflow-hidden">
                                {result.banner ? (
                                    <img
                                        src={result.banner}
                                        alt="Channel Banner"
                                        referrerPolicy="no-referrer"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 w-full h-full" style={{ background: "var(--gradient-primary)" }} />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>

                            {/* Logo and Content Area */}
                            <div className="relative px-6 pb-6">
                                {/* Overlapping Logo */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="flex h-20 w-20 -mt-10 mb-4 items-center justify-center rounded-2xl border-4 border-card bg-secondary text-2xl font-bold text-foreground font-display overflow-hidden shadow-xl relative z-20"
                                >
                                    {result.thumbnail ? (
                                        <img src={result.thumbnail} alt="logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    ) : (
                                        result.name.charAt(0)
                                    )}
                                </motion.div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="font-display text-2xl font-bold text-foreground">{result.name}</h2>
                                        <p className="text-sm text-muted-foreground">{result.handle}</p>
                                    </div>
                                    <a href={`https://www.youtube.com/channel/${result.id}`} target="_blank" rel="noreferrer" className="hero-badge text-xs hover:bg-primary/20 transition-colors">
                                        <ExternalLink className="h-3 w-3" />
                                        View
                                    </a>
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.description}</p>
                            </div>
                        </motion.div>

                        {/* Stats Grid */}
                        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {[
                                { label: "Subscribers", value: result.subscribers, icon: Users },
                                { label: "Total Views", value: result.totalViews, icon: Eye },
                                { label: "Videos", value: result.totalVideos, icon: Video },
                                { label: "Total Likes", value: result.likes, icon: ThumbsUp },
                                { label: "Created", value: result.createdAt, icon: Calendar, isDate: true },
                                { label: "Engagement", value: result.engagementRate, icon: ThumbsUp, isSuffix: true },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    whileHover={{ y: -4, rotateY: -3 }}
                                    className="metric-card text-center relative group"
                                    style={{ transformStyle: "preserve-3d", perspective: "800px" }}
                                >
                                    {/* Subtle hover gradient background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl pointer-events-none" />

                                    <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary" style={{ transform: "translateZ(20px)" }} />
                                    <p className="font-display text-xl font-bold text-foreground" style={{ transform: "translateZ(30px)" }}>
                                        {stat.isDate
                                            ? new Date(stat.value).getFullYear()
                                            : stat.isSuffix
                                                ? `${stat.value}%`
                                                : formatNumber(stat.value)}
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground" style={{ transform: "translateZ(10px)" }}>{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatedPage>
    );
}
