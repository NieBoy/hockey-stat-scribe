
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { GameFormState, Team } from "@/types";
import { cn } from "@/lib/utils";
import { mockTeams } from "@/lib/mock-data";

interface NewGameFormProps {
  onSubmit: (data: GameFormState) => void;
  teams: Team[];
  isSubmitting?: boolean; // Added isSubmitting prop
}

export default function NewGameForm({ onSubmit, teams = mockTeams, isSubmitting = false }: NewGameFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<GameFormState>({
    date: new Date(),
    homeTeam: "",
    awayTeam: "",
    location: "",
    periods: 3,
  });

  const handleChange = (field: keyof GameFormState, value: string | Date | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create New Game</CardTitle>
          <CardDescription>
            Schedule a new hockey game and assign stat trackers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Game Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    if (date) {
                      setDate(date);
                      handleChange("date", date);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeTeam">Home Team</Label>
              <Select 
                onValueChange={(value) => handleChange("homeTeam", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="awayTeam">Away Team</Label>
              <Select 
                onValueChange={(value) => handleChange("awayTeam", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter arena name"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="periods">Number of Periods</Label>
            <Select 
              defaultValue="3" 
              onValueChange={(value) => handleChange("periods", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Periods</SelectItem>
                <SelectItem value="3">3 Periods</SelectItem>
                <SelectItem value="4">4 Periods</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Game"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
