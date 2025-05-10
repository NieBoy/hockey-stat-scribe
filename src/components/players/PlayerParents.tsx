
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { User, Role } from "@/types";

interface PlayerParentsProps {
  playerId?: string;
}

// Define a type for parent data
interface ParentData {
  id: string;
  name: string;
  email: string;
}

export default function PlayerParents({ playerId }: PlayerParentsProps) {
  const [parents, setParents] = useState<ParentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for now
  useState(() => {
    if (playerId) {
      // Simulated data fetch
      setParents([
        { id: 'p1', name: 'John Doe', email: 'john@example.com' },
        { id: 'p2', name: 'Jane Doe', email: 'jane@example.com' }
      ]);
      setIsLoading(false);
    }
  });

  const handleAddParent = () => {
    console.log("Add parent functionality would go here");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Parents</CardTitle>
        <Button 
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleAddParent}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Parent
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-sm text-muted-foreground">Loading parents...</p>
          </div>
        ) : parents.length > 0 ? (
          <div className="space-y-2">
            {parents.map((parent) => (
              <div 
                key={parent.id} 
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{parent.name}</p>
                  <p className="text-sm text-muted-foreground">{parent.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-16">
            <p className="text-sm text-muted-foreground">No parents associated with this player.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
