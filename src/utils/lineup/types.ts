
import { User, Lines, Position } from "@/types";

export interface LinePosition {
  lineNumber: number;
  position: Position;
}

export interface PlayerPositionUpdate {
  playerId: string;
  position: Position;
  lineNumber: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface LineupValidationResult extends ValidationResult {
  lines?: Lines;
}

export interface PlayerAssignment {
  player: User;
  position: Position;
  lineNumber: number;
}

export interface LineupBuildOptions {
  enforcePositionValidation?: boolean;
  allowEmptyLines?: boolean;
}
