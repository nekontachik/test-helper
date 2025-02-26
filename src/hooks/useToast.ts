import { useToast as useToastUI } from "@/components/ui/use-toast";

export function useToast(): {
  toast: ReturnType<typeof useToastUI>["toast"];
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
} {
  const { toast } = useToastUI();

  return {
    toast,
    showSuccessToast: (message: string): void => {
      toast({
        title: "Success",
        description: message,
        variant: "default",
      });
    },
    showErrorToast: (message: string): void => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };
}
