
import React from "react";
import { HeartPulse } from "lucide-react";

const TopBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <HeartPulse className="h-6 w-6 text-health-primary" />
        <h1 className="text-xl font-semibold">Health AI Assistant</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
          Powered by Gemini AI
        </span>
      </div>
    </div>
  );
};

export default TopBar;
