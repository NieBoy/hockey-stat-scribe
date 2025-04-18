
import React from 'react';
import { Label } from '@/components/ui/label';
import { StatAssignment } from '@/hooks/useStatTrackerAssignment';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from 'lucide-react';

const statTypes = ['goals', 'assists', 'penalties', 'shots', 'saves'] as const;

interface StatTypeSelectorProps {
  selectedTrackers: StatAssignment;
  teamMembers: any[];
  onSelect: (statType: string, value: string) => void;
}

export const StatTypeSelector = ({
  selectedTrackers,
  teamMembers,
  onSelect
}: StatTypeSelectorProps) => {
  return (
    <div className="grid gap-6">
      {statTypes.map(statType => (
        <div key={statType} className="space-y-2">
          <Label className="text-lg font-semibold capitalize">
            {statType} Tracker
          </Label>
          
          <Select
            value={selectedTrackers[statType] || ""}
            onValueChange={(value) => onSelect(statType, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Tracker" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {teamMembers.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No available users for tracking
                </div>
              ) : (
                teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{member.name || member.email}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
};
