import { motion } from "framer-motion";
import { Play, BarChart2, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";

const features = [
    {
        icon: BarChart2,
        title: "Deep Analytics",
        description: "Comprehensive channel performance metrics and KPIs",
    },
    {
        icon: TrendingUp,
        title: "Trend Insights",
        description: "Identify content patterns and growth opportunities",
    },
    {
        icon: Sparkles,
        title: "Engagement Tracking",
        description: "Monitor likes, comments, and audience interaction",
    },
];

export default function Home() {
    return (
        <AnimatedPage className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4 relative">
            {/* Decorative blurred background shapes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-[100%] blur-[100px] -z-10 pointer-events-none" />

            <motion.div
                variants={staggerChild}
                className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-[0_0_40px_rgba(0,180,255,0.4)] relative"
            >
                <div className="absolute inset-0 bg-primary/50 blur-xl rounded-3xl" />
                <Play className="h-8 w-8 fill-white text-white z-10" />
            </motion.div>

            <motion.h1
                variants={staggerChild}
                className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6"
            >
                Performance &<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#00d2ff]">
                    Engagement
                </span> Analytics
            </motion.h1>

            <motion.p
                variants={staggerChild}
                className="max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed"
            >
                Unlock deep insights into your YouTube channel's growth, audience
                engagement, and content performance with cinematic data visualization.
            </motion.p>

            <motion.div variants={staggerChild}>
                <Link
                    to="/search"
                    className="btn-primary-glow flex items-center gap-2 text-base px-8 py-3 mb-20"
                >
                    Explore Dashboard
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                {features.map((feature, i) => (
                    <motion.div
                        key={feature.title}
                        variants={staggerChild}
                        whileHover={{ y: -8, rotateY: 5, rotateX: 5 }}
                        className="glass-card p-8 text-center flex flex-col items-center gap-4 relative group"
                        style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl pointer-events-none" />
                        <feature.icon className="h-8 w-8 text-primary" style={{ transform: "translateZ(30px)" }} />
                        <h3 className="font-display text-xl font-bold text-foreground" style={{ transform: "translateZ(20px)" }}>
                            {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground" style={{ transform: "translateZ(10px)" }}>
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </AnimatedPage>
    );
}
