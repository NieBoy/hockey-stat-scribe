
// Import directly from sonner
import { toast as sonnerToast } from "sonner";

// Re-export the shadcn toast hook
export { useToast } from "@/components/ui/use-toast";

// Export the toast function for direct use without hook
export const toast = sonnerToast;
