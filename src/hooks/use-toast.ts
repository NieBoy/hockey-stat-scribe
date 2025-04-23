
import { useToast as useShadcnToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

// We're creating a unified hook that works with both toast systems
export function useToast() {
  const shadcnToast = useShadcnToast();
  
  return {
    ...shadcnToast,
    toast: (props: any) => {
      // For backwards compatibility with existing code
      if (typeof props === 'string') {
        return sonnerToast(props);
      }
      return shadcnToast.toast(props);
    }
  };
}

// Toast function for direct use without hook
export const toast = sonnerToast;
