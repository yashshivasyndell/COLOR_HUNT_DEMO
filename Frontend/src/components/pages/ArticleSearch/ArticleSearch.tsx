import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

const ArticleSearch = () => {
  return (
    <>
      <div className="main-container">
        <div className="flex flex-col md:flex-row flex-1 gap-3 px-3 shadow-md pb-3">
          <div className="flex flex-row justify-start gap-3 items-center">
            <Select>
              <SelectTrigger className=" w-full md:w-[220px]">
                <SelectValue className="text-gray-500" placeholder="Article Search" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Article 1</SelectItem>
                <SelectItem value="dark">Article 2</SelectItem>
                <SelectItem value="system">Article 3</SelectItem>
              </SelectContent>
            </Select>
            <div className="p-[5px] border border-gray-300 rounded-md cursor-pointer">
              <Search className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex flex-row justify-start gap-3 items-center cursor-pointer">
            <Select>
              <SelectTrigger>
                <SelectValue className="text-gray-500" placeholder="Article Search (Outlet)" />
              </SelectTrigger>
              <SelectContent className=" w-full md:w-[220px]">
                <SelectItem value="light">Article 1</SelectItem>
                <SelectItem value="dark">Article 2</SelectItem>
                <SelectItem value="system">Article 3</SelectItem>
              </SelectContent>
            </Select>
            <div className="p-[5px] border border-gray-300 rounded-md">
              <Search className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleSearch;
