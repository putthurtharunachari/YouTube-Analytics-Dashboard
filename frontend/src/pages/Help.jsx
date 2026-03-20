import { motion } from "framer-motion";
import { HelpCircle, Info, BookOpen, Lightbulb, ChevronDown } from "lucide-react";
import AnimatedPage, { staggerChild } from "@/components/AnimatedPage";
import { useState } from "react";

const faqs = [
    {
        q: "What is Engagement Rate?",
        a: "Engagement Rate is the percentage of viewers who interact with a video. It is calculated as: ((Total Likes + Total Comments) / Total Views) * 100. A higher engagement rate indicates that the audience finds the content compelling."
    },
    {
        q: "What does View Distribution Mean?",
        a: "View Distribution (in Content Categories) shows how the channel's total views are spread across different types of videos or playlists."
    },
    {
        q: "How often is data updated?",
        a: "Data is fetched directly from the YouTube Data API in real-time when you search for a channel. The system then caches and stores it for quick analytical processing."
    },
    {
        q: "How do I create a Custom Report?",
        a: "Navigate to the Report Builder tab. Select the modules you want to include (e.g., Channel Overview, Top Videos Chart), choose your export format (PDF, CSV, or Excel), and click Generate Report. You can also save your selections as a Template for future use."
    }
];

export default function Help() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <AnimatedPage>
            <motion.div variants={staggerChild} className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground">Help & Resources</h1>
                <p className="mt-1 text-muted-foreground">Learn how to maximize your insights with the dashboard</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* FAQ Accordion */}
                    <motion.div variants={staggerChild} className="glass-card p-6">
                        <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
                        </h3>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div 
                                    key={index} 
                                    className="border border-border/50 bg-secondary/30 rounded-xl overflow-hidden transition-colors hover:bg-secondary/50"
                                >
                                    <button 
                                        onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                        className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                                    >
                                        <span className="font-semibold text-foreground text-sm">{faq.q}</span>
                                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    <motion.div 
                                        initial={false}
                                        animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-border/30">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    {/* Quick Start Guide */}
                    <motion.div variants={staggerChild} className="glass-card p-6 border-l-4 border-l-emerald-500">
                        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-400" /> Usage Instructions
                        </h3>
                        <ol className="space-y-4 text-sm text-muted-foreground list-decimal list-inside">
                            <li><strong className="text-foreground">Search Channel:</strong> Start by entering a YouTube Channel ID to fetch the latest analytics.</li>
                            <li><strong className="text-foreground">View Dashboard:</strong> Head to the Dashboard for a high-level overview of metrics and top videos.</li>
                            <li><strong className="text-foreground">Filter Videos:</strong> Go to the Videos page to deeply search, filter, and sort all videos from the channel.</li>
                            <li><strong className="text-foreground">Export Data:</strong> Use the Report Builder to generate professional PDFs or spreadsheets.</li>
                        </ol>
                    </motion.div>

                    {/* Pro Tip */}
                    <motion.div variants={staggerChild} className="glass-card p-6 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 blur-xl rounded-full" />
                        <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-400" /> Pro Tip
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Hover over metric tiles in the Dashboard (e.g. Engagement Rate) to see detailed formulas using the tooltip icons!
                        </p>
                    </motion.div>
                </div>
            </div>
        </AnimatedPage>
    );
}
