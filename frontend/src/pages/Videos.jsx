import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Loader2,
    AlertCircle,
    Search,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    Download
} from "lucide-react";
import axios from "axios";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";
import { formatNumber } from "@/lib/mockData";

export default function Videos() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States
    const [search, setSearch] = useState("");
    const [viewsRange, setViewsRange] = useState("");
    const [dateRange, setDateRange] = useState("");
    const [engRange, setEngRange] = useState("");
    const [durationRange, setDurationRange] = useState("");
    const [sortBy, setSortBy] = useState("views");
    const [sortOrder, setSortOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const limit = 10; // Items per page

    const channelId = localStorage.getItem('selectedChannel');

    const fetchFilteredVideos = async () => {
        if (!channelId) {
            setError("No channel selected. Please search for a channel first.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit,
                sort_by: sortBy,
                sort_order: sortOrder
            });

            if (search) params.append("search", search);
            if (viewsRange) params.append("views_range", viewsRange);
            if (dateRange) params.append("date_range", dateRange);
            if (engRange) params.append("eng_range", engRange);
            if (durationRange) params.append("duration_range", durationRange);

            const res = await axios.get(`http://localhost:8001/api/analytics/${channelId}/videos/filter?${params.toString()}`);
            if (res.data.status === 'success') {
                setData(res.data.data);
            } else {
                setError("Failed to fetch categorized videos.");
            }
        } catch (err) {
            console.error(err);
            setError("Error connecting to analytics API.");
        } finally {
            setLoading(false);
        }
    };

    // Refetch when any filter state changes
    useEffect(() => {
        fetchFilteredVideos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewsRange, dateRange, engRange, durationRange, sortBy, sortOrder, page]);

    // Handle search input separate from instant refetch to avoid spamming the backend
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchFilteredVideos();
    };

    const clearFilters = () => {
        if (window.confirm("Are you sure you want to clear all active filters?")) {
            setSearch("");
            setViewsRange("");
            setDateRange("");
            setEngRange("");
            setDurationRange("");
            setSortBy("views");
            setSortOrder("desc");
            setPage(1);
        }
    };

    if (!data && loading && !error) return (
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

    const { videos, total_count } = data || { videos: [], total_count: 0 };
    const totalPages = Math.ceil(total_count / limit);

    return (
        <AnimatedPage>
            <motion.div variants={staggerChild} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Video Analytics</h1>
                    <p className="mt-1 text-muted-foreground">Deep dive into individual video performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open(`http://localhost:8001/api/analytics/export?channel_id=${channelId}&format=pdf`, '_blank')}
                        className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" /> PDF Report
                    </button>
                    <button
                        onClick={() => window.open(`http://localhost:8001/api/analytics/export?channel_id=${channelId}&format=xlsx`, '_blank')}
                        className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Excel Data
                    </button>
                </div>
            </motion.div>

            {/* Filters Bar */}
            <motion.div variants={staggerChild} className="glass-card p-4 rounded-xl mb-6 relative z-20">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search video titles or descriptions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder-muted-foreground"
                        />
                        {search && (
                            <button type="button" onClick={() => { setSearch(""); setPage(1); setTimeout(fetchFilteredVideos, 0); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                        )}
                    </form>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap gap-3">
                        <select value={viewsRange} onChange={(e) => { setViewsRange(e.target.value); setPage(1); }} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                            <option value="">Views: All</option>
                            <option value="0-10000">&lt; 10k</option>
                            <option value="10000-100000">10k - 100k</option>
                            <option value="100000+">&gt; 100k</option>
                        </select>

                        <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setPage(1); }} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                            <option value="">Date: All Time</option>
                            <option value="last_month">Last Month</option>
                            <option value="last_year">Last Year</option>
                        </select>

                        <select value={engRange} onChange={(e) => { setEngRange(e.target.value); setPage(1); }} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                            <option value="">Engagement: Any</option>
                            <option value="high">High (&gt; 10%)</option>
                            <option value="medium">Medium (2-10%)</option>
                            <option value="low">Low (&lt; 2%)</option>
                        </select>

                        <select value={durationRange} onChange={(e) => { setDurationRange(e.target.value); setPage(1); }} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                            <option value="">Duration: Any</option>
                            <option value="short">Short (&lt; 5m)</option>
                            <option value="medium">Medium (5-15m)</option>
                            <option value="long">Long (&gt; 15m)</option>
                        </select>

                        <button onClick={clearFilters} className="flex items-center gap-2 hover:bg-secondary px-3 py-2 rounded-lg text-sm transition-colors text-rose-400">
                            <X className="w-4 h-4" /> Clear All
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Controls Row: Sort & Items Count */}
            <motion.div variants={staggerChild} className="flex flex-col sm:flex-row justify-between items-center mb-4 text-sm text-muted-foreground">
                <p>Showing {videos.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, total_count)} of {total_count} videos</p>
                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <span className="flex items-center gap-1"><SlidersHorizontal className="w-4 h-4" /> Sort by:</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-foreground cursor-pointer focus:outline-none">
                        <option value="views">Views</option>
                        <option value="likes">Likes</option>
                        <option value="date">Publish Date</option>
                        <option value="engagement">Engagement</option>
                    </select>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-transparent text-foreground cursor-pointer focus:outline-none border-l border-border pl-3 ml-1">
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </motion.div>

            {/* Data Table */}
            <motion.div
                key={`${channelId}-${viewsRange}-${dateRange}-${engRange}-${durationRange}-${sortBy}-${sortOrder}-${page}`}
                variants={staggerChild}
                className="glass-card w-full overflow-hidden relative mb-6"
            >
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary border-b border-border">
                            <tr>
                                <th scope="col" className="px-6 py-4">Video</th>
                                <th scope="col" className="px-6 py-4 text-right">Published</th>
                                <th scope="col" className="px-6 py-4 text-right">Duration</th>
                                <th scope="col" className="px-6 py-4 text-right">Views</th>
                                <th scope="col" className="px-6 py-4 text-right">Likes</th>
                                <th scope="col" className="px-6 py-4 text-right">Eng. Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {videos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                        No videos match your current filters.
                                    </td>
                                </tr>
                            ) : (
                                videos.map((video) => (
                                    <tr
                                        key={video.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                                        onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                                    >
                                        <td className="px-6 py-3 font-medium text-foreground whitespace-normal w-[400px] lg:w-[600px] group-hover:text-primary transition-colors flex items-center gap-4">
                                            <div className="w-24 h-14 bg-secondary rounded overflow-hidden flex-shrink-0 relative">
                                                <img src={video.thumbnail} alt={video.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                            <span className="line-clamp-2 leading-snug">{video.title}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">{video.published_at}</td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">{video.duration?.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '') || 'N/A'}</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatNumber(video.views)}</td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">{formatNumber(video.likes)}</td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${video.engagement >= 10 ? 'bg-emerald-500/20 text-emerald-400' : video.engagement < 2 ? 'bg-rose-500/20 text-rose-400' : 'bg-primary/20 text-primary'}`}>
                                                {video.engagement}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <motion.div variants={staggerChild} className="flex justify-center items-center gap-2 mb-10">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            // Smart pagination logic for UI to show around current page
                            let pageNum = page;
                            if (page <= 3) pageNum = i + 1;
                            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = page - 2 + i;

                            if (pageNum > 0 && pageNum <= totalPages) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`px-4 py-2 text-sm font-medium transition-colors ${page === pageNum ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </motion.div>
            )}

        </AnimatedPage>
    );
}
