
import { useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface OpponentSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function OpponentSelect({ value, onChange }: OpponentSelectProps) {
  const [open, setOpen] = useState(false);
  const [newOpponent, setNewOpponent] = useState('');
  
  // Fetch opponents from the opponents table with error handling
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['opponents'],
    queryFn: async () => {
      try {
        const { data: opponents, error } = await supabase
          .from('opponents')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Error fetching opponents:', error);
          return [];
        }

        if (!opponents || !Array.isArray(opponents)) {
          console.warn('No opponents data returned or data is not an array');
          return [];
        }

        return opponents.map(opponent => ({
          label: opponent.name,
          value: opponent.name,
          id: opponent.id
        }));
      } catch (err) {
        console.error('Unexpected error fetching opponents:', err);
        return [];
      }
    },
    // Important: Provide an initial empty array as placeholder
    placeholderData: [],
    // Add specific settings to prevent issues with undefined data
    meta: {
      onError: (error: any) => {
        console.error('Query error:', error);
        toast.error("Failed to load opponents");
      }
    }
  });
  
  const handleAddNewOpponent = async () => {
    if (!newOpponent.trim()) return;
    
    try {
      // Safely check if opponent exists - ensure data is an array first
      const opponents = Array.isArray(data) ? data : [];
      
      const opponentExists = opponents.some(
        opponent => opponent.value.toLowerCase() === newOpponent.trim().toLowerCase()
      );
      
      if (opponentExists) {
        toast.error('This opponent already exists');
        return;
      }

      const { data: newOpponentData, error } = await supabase
        .from('opponents')
        .insert([{ name: newOpponent.trim() }])
        .select()
        .single();

      if (error) {
        toast.error('Failed to add opponent');
        console.error('Error adding opponent:', error);
        return;
      }

      if (!newOpponentData) {
        toast.error('Failed to add opponent - no data returned');
        return;
      }

      onChange(newOpponentData.name);
      setNewOpponent('');
      setOpen(false);
      await refetch();
    } catch (err) {
      console.error('Error adding opponent:', err);
      toast.error('Failed to add opponent');
    }
  };

  // Always ensure opponents is an array, even if data is undefined
  const opponents = Array.isArray(data) ? data : [];
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Opponent Team</Label>
        <Button variant="outline" className="w-full justify-between" disabled>
          <span className="opacity-50">Loading opponents...</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }
  
  if (error) {
    console.error('Error in opponents query:', error);
  }

  return (
    <div className="space-y-2">
      <Label>Opponent Team</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? value
              : "Select or add opponent..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search opponents..." />
            <CommandList>
              <CommandEmpty className="py-2 px-4">
                <div className="space-y-2">
                  <p className="text-sm">No opponent found. Add a new one:</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="New opponent name"
                      value={newOpponent}
                      onChange={(e) => setNewOpponent(e.target.value)}
                      className="h-8"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddNewOpponent}
                      disabled={!newOpponent.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CommandEmpty>
              
              {/* Only render CommandGroup if opponents array exists and has items */}
              {opponents && opponents.length > 0 && (
                <CommandGroup>
                  {opponents.map((opponent) => (
                    <CommandItem
                      key={opponent.id}
                      value={opponent.value}
                      onSelect={(currentValue) => {
                        onChange(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === opponent.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opponent.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              <div className="border-t p-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="New opponent name"
                    value={newOpponent}
                    onChange={(e) => setNewOpponent(e.target.value)}
                    className="h-8"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddNewOpponent}
                    disabled={!newOpponent.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
