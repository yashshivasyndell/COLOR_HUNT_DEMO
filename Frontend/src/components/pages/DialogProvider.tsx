import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";


interface DialogProviderProps {
  isOpen: boolean;
  onOpenChange: any;
  loading: boolean;
  content: () => JSX.Element,
  title: string;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({
  isOpen,
  onOpenChange,
  loading,
  content,
  title,
}) => {

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange} defaultOpen={isOpen}>
        {loading ? <DialogContent className="w-full border  flex justify-center items-center h-[350px]  md:h-[420px]">
         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </DialogContent> :<DialogContent className=" h-[350px] md:h-[420px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
             <div className="p-2">
              {content()}
             </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent> }
        
      </Dialog>
    </>
  );
};
