import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    Home,
    Search,
    LayoutDashboard,
    Video,
    Heart,
    TrendingUp,
    Sun,
    Moon,
    Play,
    Scale,
    FileText,
    HelpCircle,
    Menu
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Channel Lookup" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/videos", icon: Video, label: "Videos" },
    { to: "/engagement", icon: Heart, label: "Engagement" },
    { to: "/trends", icon: TrendingUp, label: "Trends" },
    { to: "/comparison", icon: Scale, label: "Comparison" },
    { to: "/report-builder", icon: FileText, label: "Report/Export" },
    { to: "/help", icon: HelpCircle, label: "Help/FAQ" },
];

export default function Sidebar() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
        {/* Mobile Toggle */}
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden fixed top-4 right-4 z-[60] bg-primary text-white p-2 rounded-lg shadow-lg"
        >
            <Menu className="w-5 h-5" />
        </button>

        <aside className={`w-64 border-r border-border bg-background/95 md:bg-background/50 flex flex-col h-[100dvh] fixed left-0 top-0 pt-6 backdrop-blur-xl z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="px-6 mb-8 flex items-center gap-3">
                <div className="bg-primary text-white p-2 rounded-xl">
                    <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                    <h1 className="font-display font-bold text-lg leading-tight uppercase tracking-wider text-foreground">
                        YT Analytics
                    </h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Performance Hub</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,180,255,0.1)]"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            }`
                        }
                        onClick={() => setIsOpen(false)}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-border">
                <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="w-full flex items-center justify-start gap-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-4 py-2 text-sm font-medium rounded-xl hover:bg-white/5 dark:hover:bg-white/10"
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                </button>
            </div>
        </aside>
        
        {/* Mobile overlay */}
        {isOpen && (
            <div 
                className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />
        )}
        </>
    );
}
