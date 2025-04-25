
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
  
  // Fetch unique opponent names from existing games
  const { data = [], refetch } = useQuery({
    queryKey: ['opponents'],
    queryFn: async () => {
      try {
        const { data: gameData, error } = await supabase
          .from('games')
          .select('opponent_name')
          .not('opponent_name', 'is', null)
          .order('opponent_name');
        
        if (error) {
          console.error('Error fetching opponents:', error);
          return [];
        }

        // Safely extract unique opponent names
        if (!gameData || !Array.isArray(gameData)) {
          return [];
        }

        // Extract unique opponent names using Set
        const uniqueNames = new Set<string>();
        gameData.forEach(game => {
          if (game && game.opponent_name) {
            uniqueNames.add(game.opponent_name);
          }
        });
          
        return Array.from(uniqueNames).map(name => ({ label: name, value: name }));
      } catch (err) {
        console.error('Unexpected error fetching opponents:', err);
        return [];
      }
    },
    // Ensure data is always an array
    placeholderData: []
  });
  
  const handleAddNewOpponent = () => {
    if (!newOpponent.trim()) return;
    
    // Safely check if opponent exists
    const opponentExists = Array.isArray(data) && data.some(
      opponent => opponent.value.toLowerCase() === newOpponent.trim().toLowerCase()
    );
    
    if (opponentExists) {
      toast.error('This opponent already exists');
      return;
    }
    
    onChange(newOpponent.trim());
    setNewOpponent('');
    setOpen(false);
    refetch();
  };

  // Ensure we have a valid array for rendering
  const opponents = Array.isArray(data) ? data : [];

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
            {opponents.length > 0 && (
              <CommandGroup>
                {opponents.map((opponent) => (
                  <CommandItem
                    key={opponent.value}
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
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
