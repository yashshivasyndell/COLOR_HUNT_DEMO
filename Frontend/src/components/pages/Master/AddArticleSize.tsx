import React, { useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addSize, getSingleSize, updatSize } from "../../../api";
import CustomToast from "../../../showToast";

const AddArticleSize = () => {
  const { id } = useParams();
  const editId = Number(id);
  const navigate = useNavigate();

  // Validation Schema
  const SizeSchema = z.object({
    name: z
      .string()
      .nonempty("Size is required")
      .min(1, "Size must be at least 1 characters"),
  });

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SizeSchema),
  });

  const submit = async (name:any)=>{
    const payload={
        name:name.name
    }
    if(editId){
         try{const updated = await updatSize(editId,payload)
         if(updated.statusCode===200){
            CustomToast(200,'Size updated successfully')
         }}catch(error){
            CustomToast(500,'Size already exists')
         }
         
    }else{
        try{const adder = await addSize(name)
        if(adder.statusCode === 200){
            CustomToast(200,'Size added success')
        }}catch(error){
            CustomToast(500,'Size already exists')
        }
        
    }
  }

  const filldetail = async ()=>{
    const data = await getSingleSize(editId)
    data.data.map((item:any)=>{
           setValue('name',item.name)
    })
  }

  useEffect(()=>{
    if(editId){
        filldetail()
      }
  },[])
  return (
    <div className="p-5">
      <Card className="w-[40%]">
        <div>
          <form action="" onSubmit={handleSubmit(submit)}>
            <div className="p-2">Article Size - {editId ? "Edit" : "Add"}</div>
            <hr />
            <div className="grid gap-3 p-7">
              <label htmlFor="Size">Size</label>
              <input
                {...register("name")}
                type="text"
                className="pl-3 text-black rounded outline focus:ring-2 ring-blue-700"
              />
              {errors.name && (
                <span className="text-red-500">{errors.name.message}</span>
              )}
            </div>
            <div className="flex justify-between mx-3 p-5">
              <Button type="button" onClick={() => navigate("/articlesize")}>
                Back
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AddArticleSize;
