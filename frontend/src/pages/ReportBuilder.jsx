import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    Save,
    Trash2,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Layout,
    BarChart3,
    Table as TableIcon,
    History
} from "lucide-react";
import axios from "axios";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";

const REPORT_MODULES = [
    { id: "overview", label: "Channel Overview", icon: Layout, desc: "Key metrics including subscribers, views, and engagement." },
    { id: "top_videos", label: "Top Videos Chart", icon: BarChart3, desc: "Performance breakdown of your most popular content." },
    { id: "engagement_funnel", label: "Engagement Funnel", icon: CheckCircle2, desc: "Visual funnel of views, likes, and comments." },
    { id: "upload_heatmap", label: "Upload Frequency", icon: TableIcon, desc: "Activity heatmap showing when you post most often." }
];

export default function ReportBuilder() {
    const [selectedModules, setSelectedModules] = useState(["overview", "top_videos"]);
    const [format, setFormat] = useState("pdf");
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [templateName, setTemplateName] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const channelId = localStorage.getItem('selectedChannel');

    useEffect(() => {
        if (channelId) fetchTemplates();
    }, [channelId]);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`http://localhost:8001/api/analytics/report/templates/${channelId}`);
            if (res.data.status === 'success') setTemplates(res.data.data);
        } catch (err) {
            console.error("Failed to fetch templates", err);
        }
    };

    const toggleModule = (id) => {
        setSelectedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleExport = async () => {
        if (!channelId) return setError("Please select a channel first.");
        setLoading(true);
        setError(null);
        try {
            // For custom report, we use the new /report/custom endpoint
            const res = await axios.post(
                `http://localhost:8001/api/analytics/report/custom?channel_id=${channelId}&format=${format}`,
                selectedModules,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Analytics_Report_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setSuccess("Report generated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to generate report. Check backend connectivity.");
        } finally {
            setLoading(false);
        }
    };

    const saveTemplate = async () => {
        if (!templateName) return setError("Please provide a template name.");
        try {
            const res = await axios.post(`http://localhost:8001/api/analytics/report/templates?name=${templateName}&channel_id=${channelId}&config=${JSON.stringify(selectedModules)}`);
            if (res.data.status === 'success') {
                setSuccess("Template saved!");
                setTemplateName("");
                fetchTemplates();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            setError("Failed to save template.");
        }
    };

    const loadTemplate = (template) => {
        try {
            const config = JSON.parse(template.config);
            setSelectedModules(config);
            setSuccess(`Loaded template: ${template.name}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError("Error loading template configuration.");
        }
    };

    const deleteTemplate = async (id) => {
        if (window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:8001/api/analytics/report/templates/${id}`);
                fetchTemplates();
            } catch (err) {
                setError("Failed to delete template.");
            }
        }
    };

    return (
        <AnimatedPage>
            <motion.div variants={staggerChild} className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground">Custom Report Builder</h1>
                <p className="mt-1 text-muted-foreground">Design and export professional analytics reports tailored to your needs.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Module Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={staggerChild} className="glass-card p-6">
                        <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-primary" /> Select Report Modules
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {REPORT_MODULES.map((module) => {
                                const Icon = module.icon;
                                const isSelected = selectedModules.includes(module.id);
                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => toggleModule(module.id)}
                                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left group ${isSelected
                                                ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,180,255,0.1)]"
                                                : "bg-secondary/50 border-border hover:border-muted-foreground"
                                            }`}
                                    >
                                        <div className={`p-3 rounded-lg ${isSelected ? "bg-primary text-white" : "bg-white/5 text-muted-foreground group-hover:text-foreground"}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{module.label}</p>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{module.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Format Selection */}
                    <motion.div variants={staggerChild} className="glass-card p-6">
                        <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <Download className="w-5 h-5 text-primary" /> Export Configuration
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {["pdf", "csv", "xlsx"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    className={`px-6 py-3 rounded-xl border font-bold text-sm uppercase tracking-wider transition-all ${format === f
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                            : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center gap-4">
                            <button
                                onClick={handleExport}
                                disabled={loading || selectedModules.length === 0}
                                className="btn-primary-glow px-8 py-3 flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                Generate Report
                            </button>
                            {loading && <span className="text-sm text-muted-foreground animate-pulse">Processing your data...</span>}
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-medium">{success}</span>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Sidebar: Templates */}
                <div className="space-y-6">
                    <motion.div variants={staggerChild} className="glass-card p-6 h-full">
                        <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" /> Saved Templates
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New template name..."
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    onClick={saveTemplate}
                                    className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                                    title="Save Template"
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {templates.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8 bg-white/5 rounded-xl border border-dashed border-border">
                                    No templates saved yet.
                                </p>
                            ) : (
                                templates.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group">
                                        <button
                                            onClick={() => loadTemplate(t)}
                                            className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left truncate flex-1 mr-4"
                                        >
                                            {t.name}
                                        </button>
                                        <button
                                            onClick={() => deleteTemplate(t.id)}
                                            className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatedPage>
    );
}
