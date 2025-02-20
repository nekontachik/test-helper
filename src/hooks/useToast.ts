import { useToast as useToastUI } from "@/components/ui/use-toast";

export function useToast() {
  const { toast } = useToastUI();

  return {
    toast,
    showSuccessToast: (message: string) => {
      toast({
        title: "Success",
        description: message,
        variant: "default",
      });
    },
    showErrorToast: (message: string) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };
}
