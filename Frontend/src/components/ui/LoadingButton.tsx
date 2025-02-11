/* eslint-disable @typescript-eslint/no-unused-vars */
import { CirclePlus, Loader2 } from "lucide-react";
import { Button } from "./button";

interface LoadingButtonProps {
  loading: boolean;
  content: string;
  handleClick: (e: any) => void;
  className?: string;
  variant?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  content,
  handleClick,
  className,
  variant,
}) => {
  return (
    <Button
      type="submit"
      disabled={loading}
      className={`flex flex-row items-center gap-1 md:w-fit w-full ${className}`}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CirclePlus className={`${(variant === "delete" || variant === 'edit') ? "hidden" : ""}`} />
      )}
      {loading ? "Please Wait" : content}
    </Button>
  );
};
