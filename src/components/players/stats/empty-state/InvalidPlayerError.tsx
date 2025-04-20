
import { AlertCircle } from "lucide-react";

interface InvalidPlayerErrorProps {
  playerId: string;
  errorDetails: string | null;
}

export default function InvalidPlayerError({ playerId, errorDetails }: InvalidPlayerErrorProps) {
  return (
    <div className="text-center text-red-600 p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h3 className="font-medium text-lg mb-2">Player ID Not Found</h3>
      <p>The player ID ({playerId}) does not exist in the database.</p>
      {errorDetails && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded text-sm">
          <p className="font-medium">Error details:</p>
          <p>{errorDetails}</p>
        </div>
      )}
      <div className="mt-4">
        <p>This is likely a data integrity issue. Possible causes:</p>
        <ul className="list-disc list-inside text-left mt-2 text-sm">
          <li>The player was deleted but still has game events</li>
          <li>The player ID was changed or migrated incorrectly</li>
          <li>There's a mismatch between team_members and users tables</li>
        </ul>
      </div>
    </div>
  );
}
