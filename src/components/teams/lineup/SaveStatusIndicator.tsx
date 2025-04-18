
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'success' | 'error';
}

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  if (status === 'idle') return null;

  if (status === 'saving') {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving...
      </Badge>
    );
  }

  if (status === 'success') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Saved
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      Save Error
    </Badge>
  );
}
