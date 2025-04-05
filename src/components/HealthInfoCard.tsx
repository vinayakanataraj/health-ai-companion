
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthInfoCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const HealthInfoCard: React.FC<HealthInfoCardProps> = ({ title, icon, children }) => {
  return (
    <Card className="bg-white border-blue-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-gray-600">{children}</CardContent>
    </Card>
  );
};

export default HealthInfoCard;
