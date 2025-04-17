
import { Link } from "react-router-dom";
import { CaseSensitive } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <CaseSensitive className="h-8 w-8 text-primary" />
      <Link to="/" className="text-xl font-bold">
        Hockey Stat Scribe
      </Link>
    </div>
  );
}
