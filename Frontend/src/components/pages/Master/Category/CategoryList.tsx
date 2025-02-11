import { useEffect, useState } from "react";
import { DataTable } from "../../Table/data-table";
import { apiError } from "../../../../types/types";
import CustomToast from "../../../../showToast";
import { deleteCategory, deleteParty, fetchCategoryList, updateCategory } from "../../../../api";
import { Loader } from "../../../Loader";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../../Table/data-table-column-header";
import { Switch } from "../../../ui/switch";
import { AwardIcon, Edit, Trash } from "lucide-react";
import { Heading } from "../../../layout/Heading";
import { LoadingButton } from "../../../ui/LoadingButton";
import { useNavigate } from "react-router-dom";

const Category = () => {
  const navigate = useNavigate();
  interface Category {
    id: number;
    name: string;
    article_open_flag: number;
    colorflag: number;
    image: string | null;
    isactive: number;
    mobile_status: number;
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [categoryList, setCategoryList] = useState<any>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  useEffect(() => {
    async function getCategoryList() {
      try {
        setLoading(true);
        const response = await fetchCategoryList();
        console.log("Response: ", response);
        if (response.statusCode === 200) {
          setCategoryList(response.data);
          
        }
      } catch (error) {
        const apiError = error as apiError;
        if (apiError.statusCode === 400) {
          CustomToast(400, "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }
    getCategoryList();
  }, []);

  const handleEditCategory = async(id:number,data:any)=>{
     try{
      const { id: _, created_at: __, updated_at: ___, ...validData } = data;
      navigate(`/category/edit/${id}`)
     }catch(error){
      console.log("error in update ",error);
     }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      setLoading(true);
      const response = await deleteCategory(id);
      console.log("after deleting ",response);
      
      const newLs = await fetchCategoryList()
      setCategoryList(newLs.data)
      if (response.statusCode === 200) {
        CustomToast(200, "Category deleted successfully");
        setRefresh(!refresh); 
      } else {
        CustomToast(400, response.message || "Failed to delete category");
      }
    } catch (error:any) {
      if(error.statusCode === 400){
           setCategoryList({})
      }
      const apiError = error as apiError;
      CustomToast(apiError.statusCode || 500, apiError.message || "Error deleting category");
    } finally {
      setLoading(false);
    }
  };

  const CategoryCols: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "colorflag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Color Flag" />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return <span>{data.colorflag ? "Yes" : "No"}</span>;
      },
    },
    {
      accessorKey: "article_open_flag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Article Open Flag" />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return <span>{data.article_open_flag ? "Yes" : "No"}</span>;
      },
    },
    {
      accessorKey: "image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return (
          <img
            src="http://via.placeholder.com/1280x720"
            alt={data.name}
            width={80}
            height={80}
          />
        );
      },
    },
    {
      accessorKey: "mobile_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mobile App Status" />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return <Switch checked={data && data.mobile_status !== 0} />;
      },
    },
    {
      accessorKey: "actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex flex-row justify-center gap-3">
            <div className="w-fit cursor-pointer" onClick={()=>handleEditCategory(data.id,data)}>
      
              <Edit className="h-5 w-5" />
         
            </div>
            <div className="w-fit cursor-pointer" onClick={() => handleDeleteCategory(data.id)}>
              <Trash className="h-5 w-5" />
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <>
      {loading && <Loader />}

      <div>
        <Heading
          title="Category"
          content={
            <LoadingButton
              loading={loading}
              content="Add Category"
              handleClick={() => navigate("/category/add")}
            />
          }
        />
      </div>

      <div className="main-container">
        <DataTable columns={CategoryCols} data={categoryList} />
      </div>
    </>
  );
};

export default Category;
