import { useState } from "react";
import { HelpCircle } from "lucide-react";

export default function Tooltip({ text }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative inline-flex items-center justify-center ml-1.5"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
            
            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-secondary text-foreground text-xs font-medium rounded-lg shadow-xl z-50 pointer-events-none text-center border border-border">
                    {text}
                    {/* Tooltip arrow */}
                    <svg className="absolute text-border h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
            )}
        </div>
    );
}
