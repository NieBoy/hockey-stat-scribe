
/**
 * This file is the main entry point for plus/minus functionality across the application
 * It ensures a consistent interface for all plus/minus operations
 */

// Re-export the plusMinus functionality from the game-stats module
export { calculatePlusMinus } from './game-stats/plusMinus';
export { calculatePlusMinusValue, recordPlusMinus, PLUS_EVENT_VALUE, MINUS_EVENT_VALUE } from './utils/plusMinusCalculator';
