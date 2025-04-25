
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface StatsProcessingStatusProps {
  statusMessages: string[];
  error: string | null;
  isProcessing: boolean;
  finishedProcessing: boolean;
}

export const StatsProcessingStatus = ({
  statusMessages,
  error,
  isProcessing,
  finishedProcessing
}: StatsProcessingStatusProps) => {
  if (statusMessages.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Processing Log
        </span>
        
        {finishedProcessing ? (
          <span className="text-xs text-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Complete
          </span>
        ) : isProcessing ? (
          <span className="text-xs text-amber-500 flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            In Progress
          </span>
        ) : statusMessages.length > 0 && error ? (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        ) : null}
      </div>
      
      {error && (
        <Alert variant="default" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs text-red-500">{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-muted p-2 rounded text-xs overflow-auto max-h-40 font-mono">
        {statusMessages.map((msg, i) => (
          <div key={i} className="pb-0.5">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};
