
import React from 'react';
import { Label } from '@/components/ui/label';
import { StatAssignment } from '@/hooks/useStatTrackerAssignment';

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
          <select
            value={selectedTrackers[statType] || ''}
            onChange={(e) => onSelect(statType, e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="">Select Tracker</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name || member.email} {member.role ? `(${member.role})` : ''}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};
