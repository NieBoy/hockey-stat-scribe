
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
  
  const deleteForwardLine = (lineIndex: number) => {
    const newLines = { ...lines };
    newLines.forwards = newLines.forwards.filter((_, index) => index !== lineIndex);
    // Re-number the lines after deletion
    newLines.forwards = newLines.forwards.map((line, index) => ({
      ...line,
      lineNumber: index + 1
    }));
    setLines(newLines);
  };

  const deleteDefenseLine = (lineIndex: number) => {
    const newLines = { ...lines };
    newLines.defense = newLines.defense.filter((_, index) => index !== lineIndex);
    // Re-number the lines after deletion
    newLines.defense = newLines.defense.map((line, index) => ({
      ...line,
      lineNumber: index + 1
    }));
    setLines(newLines);
  };

  return {
    addForwardLine,
    addDefenseLine,
    deleteForwardLine,
    deleteDefenseLine
  };
}
