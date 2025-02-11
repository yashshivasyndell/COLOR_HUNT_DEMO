import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigateBackProps {
  content: string;
  path?: string;
}

const NavigateBack: React.FC<NavigateBackProps> = ({ content, path }) => {
  const navigate = useNavigate();
  const handleNavigateBack = () => {
    if (path) {
      navigate(path);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="w-full p-3 flex  justify-normal items-center gap-5">
      {/* Back Arrow */}
      <div onClick={handleNavigateBack} className="w-fit p-1 rounded-md hover:bg-linkhover hover:text-secondary cursor-pointer">
        <MoveLeft height={20} width={20}  />
      </div>
      {/* Content */}
      <div>{content}</div>
    </div>
  );
};

export default NavigateBack;
