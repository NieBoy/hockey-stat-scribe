
import React from "react";
import { LineChart } from "lucide-react";

const StatsTabContent = () => {
  return (
    <div className="text-center py-10">
      <LineChart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
      <h3 className="mt-4 text-lg font-medium">Team stats coming soon</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        This feature is still under development. Check back soon to view team statistics.
      </p>
    </div>
  );
};

export default StatsTabContent;
