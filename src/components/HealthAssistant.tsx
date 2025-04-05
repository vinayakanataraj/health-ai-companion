
import React from "react";
import TopBar from "@/components/TopBar";
import ChatInterface from "@/components/ChatInterface";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import HealthInfoCard from "@/components/HealthInfoCard";
import { InfoIcon, ShieldIcon, BookOpenIcon, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const HealthAssistant: React.FC = () => {
  const [showSidebar, setShowSidebar] = React.useState(true);
  const isMobile = useIsMobile();
  
  // On mobile, hide sidebar by default
  React.useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [isMobile]);

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full bg-white">
          <div className="p-4">
            <MedicalDisclaimer />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </div>
        
        {/* Toggle sidebar button (only show on mobile) */}
        {isMobile && (
          <Button 
            variant="outline" 
            size="icon"
            className="absolute bottom-20 right-4 z-10 bg-white shadow-md rounded-full h-10 w-10"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        )}
        
        {/* Information sidebar */}
        {showSidebar && (
          <div className="w-80 bg-gray-50 p-4 border-l border-border overflow-y-auto">
            <h2 className="text-lg font-medium mb-4">Health Resources</h2>
            
            <div className="space-y-4">
              <HealthInfoCard 
                title="About This Assistant" 
                icon={<InfoIcon className="h-4 w-4 text-health-primary" />}
              >
                <p>This AI assistant provides general health information and guidance based on reputable medical sources.</p>
                <p className="mt-2">It cannot diagnose conditions or replace professional medical advice.</p>
              </HealthInfoCard>
              
              <HealthInfoCard 
                title="Safety First" 
                icon={<ShieldIcon className="h-4 w-4 text-health-warning" />}
              >
                <ul className="space-y-1 list-disc list-inside">
                  <li>Seek emergency care for severe symptoms</li>
                  <li>Consult your doctor for personal medical advice</li>
                  <li>Do not use for medical emergencies</li>
                  <li>Information is general in nature</li>
                </ul>
              </HealthInfoCard>
              
              <HealthInfoCard 
                title="Reliable Resources" 
                icon={<BookOpenIcon className="h-4 w-4 text-health-secondary" />}
              >
                <p>For additional health information, please consult these trusted sources:</p>
                <ul className="mt-2 space-y-1">
                  <li>• <a href="https://www.who.int" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">World Health Organization</a></li>
                  <li>• <a href="https://www.cdc.gov" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Centers for Disease Control</a></li>
                  <li>• <a href="https://medlineplus.gov" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">MedlinePlus</a></li>
                </ul>
              </HealthInfoCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAssistant;
