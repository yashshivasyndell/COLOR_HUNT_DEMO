import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import CustomToast from "../../../../showToast";
import { addCategory, getCategory, updateCategory } from "../../../../api";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";

const AddCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  
  const addCategorySchema = z.object({
    name: z.string().min(1, { message: "This field is required" }),
    colorflag: z.boolean().default(false),
    article_open_flag: z.boolean().default(false),
    mobile_status: z.boolean().default(true),
    isactive: z.boolean().default(true),
    image: z.string().optional().default(""),
  });

  type AddCategoryFormData = z.infer<typeof addCategorySchema>;

 
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCategoryFormData>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      name: "",
      colorflag: false,
      article_open_flag: false,
    },
  });

 
  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        try {
          const response = await getCategory(Number(id));
          if (response?.data?.length > 0) {
            const { name, colorflag, article_open_flag } = response.data[0];
            reset({
              name,
              colorflag: !!colorflag, 
              article_open_flag: !!article_open_flag,
            });
          }
        } catch (error) {
          console.error("Error fetching category data:", error);
        }
      };

      fetchCategory();
    }
  }, [id, reset]);

  
  const handleCat = async (data: AddCategoryFormData) => {
    const transformedData = {
      ...data,
      colorflag: data.colorflag ? 1 : 0,
      article_open_flag: data.article_open_flag ? 1 : 0,
      mobile_status: data.mobile_status ? 1 : 0,
      isactive: data.isactive ? 1 : 0,
    };

    try {
      if (id) {
        const updateRes = await updateCategory(Number(id), transformedData);
        if (updateRes?.statusCode === 200) {
          CustomToast(200, "Category updated successfully");
          navigate("/category");
        }
      } else {
   
        const addRes = await addCategory(transformedData);
        if (addRes?.statusCode === 200) {
          CustomToast(200, "Category added successfully");
          navigate("/category");
        }
      }
    } catch (error: any) {
      CustomToast(500, "An error occurred");
      console.error("Error:", error.message);
    }
  };

  return (
    <div className=" lg:p-10">
    <form onSubmit={handleSubmit(handleCat)}>
    <Card className="w-[100%] lg:w-[50%] h-[370px]">
      <div className="pl-9 p-3">Category - Add</div>
      <hr className="pb-2"/>
      <div className="pl-9 pb-3">Title <span className="text-red-500">*</span></div>
      <div className="mx-auto w-full">
      <Input {...register("name")} className="mx-auto w-[90%] border outline-none focus:ring focus-ring-blue-200 border-gray-500 focus:ring-offset-1 focus:shadow-sm transition duration-300"/>
      {errors.name && (
          <p className="text-red-500 text-sm ml-8 mt-1">{errors.name.message}</p>)}
      </div>
      <div className="mt-10 pl-8">
      <input type="checkbox" {...register("colorflag")} className="accent-green-200"/><label className="pl-3" htmlFor="">Color - Flag</label>
      </div>
      <div className="mt-10 pl-8">
      <input type="checkbox" {...register("article_open_flag")} className="accent-green-200"/><label className="pl-3" htmlFor="">Article - Open Flag
      </label>
      </div>
      <div className="flex justify-between mx-8 mt-9">
      <Button className="bg-green-500 w-28" 
      onClick={()=>{navigate("/category")}}>Back</Button>
      <Button className="bg-green-500 w-28"
      type="submit"
      >Submit</Button>
      </div>
    </Card>
    </form>
    </div>
  );
};

export default AddCategory;
