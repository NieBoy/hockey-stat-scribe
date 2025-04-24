
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings2 } from "lucide-react";
import { useState } from "react";

interface TeamStatsSettingsProps {
  onAutoRefreshChange: (enabled: boolean) => void;
  onPrecisionChange: (highPrecision: boolean) => void;
}

export default function TeamStatsSettings({
  onAutoRefreshChange,
  onPrecisionChange,
}: TeamStatsSettingsProps) {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [highPrecision, setHighPrecision] = useState(false);

  const handleAutoRefreshChange = (enabled: boolean) => {
    setAutoRefresh(enabled);
    onAutoRefreshChange(enabled);
  };

  const handlePrecisionChange = (enabled: boolean) => {
    setHighPrecision(enabled);
    onPrecisionChange(enabled);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Stats Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Auto Refresh</h4>
            <p className="text-sm text-muted-foreground">
              Automatically refresh stats every minute
            </p>
          </div>
          <Switch
            checked={autoRefresh}
            onCheckedChange={handleAutoRefreshChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">High Precision</h4>
            <p className="text-sm text-muted-foreground">
              Show detailed decimal places in calculations
            </p>
          </div>
          <Switch
            checked={highPrecision}
            onCheckedChange={handlePrecisionChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
