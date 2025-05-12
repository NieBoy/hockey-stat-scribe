
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface GameDetailErrorProps {
  onBack: () => void;
}

export default function GameDetailError({ onBack }: GameDetailErrorProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p>Game not found</p>
        <Button onClick={onBack} className="mt-4">
          Back to Games
        </Button>
      </CardContent>
    </Card>
  );
}
