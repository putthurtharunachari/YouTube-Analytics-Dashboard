import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChannelSearch from "./pages/ChannelSearch";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Videos from "./pages/Videos";
import Engagement from "./pages/Engagement";
import Trends from "./pages/Trends";
import Comparison from "./pages/Comparison";
import ReportBuilder from "./pages/ReportBuilder";
import Help from "./pages/Help";
import BackgroundBlobs from "./components/BackgroundBlobs";

const NotFound = () => <div className="p-8"><h2 className="text-2xl font-bold font-display text-destructive">404 - Not Found</h2></div>;

function App() {
  return (
    <div className="min-h-screen bg-transparent flex text-foreground relative">
      <BackgroundBlobs />
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative w-full overflow-hidden">
        <main className="flex-1 p-4 md:p-8 pb-24 overflow-x-hidden w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<ChannelSearch />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/engagement" element={<Engagement />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/report-builder" element={<ReportBuilder />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer as requested */}
        <footer className="absolute bottom-0 w-full p-4 border-t border-border bg-background/80 backdrop-blur-sm text-center">
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            &copy; 2025 YouTube Analytics Dashboard | Developed by <span className="text-primary">Putthur Tharun Achari</span> for Infosys Springboard
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
