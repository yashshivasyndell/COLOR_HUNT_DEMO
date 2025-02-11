import { toast } from "./components/ui/use-toast";

const CustomToast = (statusCode: number, message: string) => {
  toast({
    title: statusCode >= 200 && statusCode < 400 ? "Success" : "Error",
    description: message
      ? message
      : statusCode >= 200 && statusCode < 400
      ? "Success"
      : "Something went wrong",
    variant: statusCode >= 200 && statusCode < 400 ? "success" : "destructive",
    duration: 5000,
  });

  return null;
};

export default CustomToast;
