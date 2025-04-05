
import React from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const MedicalDisclaimer: React.FC = () => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-700">Medical Disclaimer</AlertTitle>
      <AlertDescription className="text-amber-800">
        This AI assistant provides general information only and is not a substitute for professional medical advice, 
        diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any 
        questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking 
        it because of something you have read here.
      </AlertDescription>
    </Alert>
  );
};

export default MedicalDisclaimer;
