import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addworkorder, getSingleWorkOrder, updateWorkorder } from "../../../api";
import CustomToast from "../../../showToast";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const AddWorkorder = () => {
  const navigate = useNavigate();
  const {id} = useParams()
  const editId = Number(id)
  
  const schema = z.object({
    name: z
      .string()
      .nonempty("Name is required")
      .min(3, "Name must be at least 3 characters"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  
  const addwork = async (data: any) => {
    const payload = {
      name: data.name,
    };

    if(editId){
      try{
          const data = await updateWorkorder(editId,payload)

          if(data.statusCode === 200){
          CustomToast(200,'Data updated successfully')
        }}catch(error){
          CustomToast(400,'Data already exist')
        }
    }
    else{
      try {
      const addData = await addworkorder(payload);
      console.log("Work order response:", addData);
      CustomToast(200, "Work Order added successfully");
      navigate("/workorder");
    } catch (error) {
      console.error("Error adding work order:", error);
      CustomToast(500, "Failed to add Work Order");
    }
  }
   
  };
  
  const filldetail = async ()=>{
    const resp = await getSingleWorkOrder(editId)
    
    resp.data.map((item:any)=>{
      
        setValue('name',item.name)
    }) 
    
  }

  useEffect(()=>{
   filldetail()
  },[])

  return (
    <div className="lg:p-10">
      <Card className="lg:w-[40%]">
        <div>
          <div className="p-2">Work Order Status - Add</div>
          <hr />
          <form onSubmit={handleSubmit(addwork)}>
            {/* Name Field */}
            <div className="flex flex-col mb-10 mt-5 gap-5">
              <label className="ml-10">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                type="text"
                className="pl-2 text-black w-[81%] rounded focus:ring-2 ring-blue-400 outline mx-10"
              />
              {errors.name && (
                <span className="text-red-500 mx-10">{typeof errors.name.message === 'string'? errors.name.message:'Invalid error message'}</span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between mx-10 pb-5">
              <Button
                type="button"
                onClick={() => navigate("/workorder")}
                className="bg-green-500"
              >
                Back
              </Button>
              <Button type="submit" className="bg-green-500">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AddWorkorder;
