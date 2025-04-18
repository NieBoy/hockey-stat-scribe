
import { Lines } from "@/types";

export function useLineManagement(lines: Lines, setLines: (lines: Lines) => void) {
  const addForwardLine = () => {
    const newLines = { ...lines };
    newLines.forwards.push({
      lineNumber: newLines.forwards.length + 1,
      leftWing: null,
      center: null,
      rightWing: null
    });
    setLines(newLines);
  };

  const addDefenseLine = () => {
    const newLines = { ...lines };
    newLines.defense.push({
      lineNumber: newLines.defense.length + 1,
      leftDefense: null,
      rightDefense: null
    });
    setLines(newLines);
  };

  return {
    addForwardLine,
    addDefenseLine
  };
}
