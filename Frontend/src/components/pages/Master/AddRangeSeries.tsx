import React, { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addRangeSeriesList, fetchCategoryList, fetchSubcategorydata, getSingleRangeSeriesDetails, updateRangeSeries } from "../../../api";
import SubcategoryList from "./SubCategory";
import CustomToast from "../../../showToast";
import { useParams } from "react-router-dom";
import { Label } from "../../ui/label";

const AddRangeSeries = () => {
  const { id } = useParams();
  const editId = Number(id);
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [filteredSubCat, setFilteredSubCat] = useState([]);
  const [loading, setLoading] = useState(false);

  // Zod schema for validation
  const schema = z.object({
    category: z.union([z.string(), z.number()]).refine(
      (value) => value !== "" && value !== null && value !== undefined,
      "Category is required"
    ),
    subCategory: z.union([z.string(), z.number()]).refine(
      (value) => value !== "" && value !== null && value !== undefined,
      "Sub-Category is required"
    ),
    seriesName: z.string().min(3, "Series Name must be at least 3 characters"),
    series: z.string().nonempty("Series is required"),
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const submit = async (data: any) => {
    const payload = {
      category_id: data.category,
      subcategory_id: data.subCategory,
      series_name: data.seriesName,
      series: data.series,
    };

   if(editId){
    
     const updatedRange = await updateRangeSeries(editId,payload)
     if(updatedRange.statusCode === 200){
      CustomToast(200,"Successfully updated")
     }
     console.log(updatedRange);
   }
   else{
    try {
      
      console.log("payload", payload);
      const rangeRes = await addRangeSeriesList(payload);
      console.log("range series", rangeRes);
      if (rangeRes.statusCode === 200) {
        CustomToast(200, "Range series successfully added");
      }
    } catch (error) {
      CustomToast(500, "Range Series already exists");
    }
  }}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryRes = await fetchCategoryList();
        const subcategoryRes = await fetchSubcategorydata();
        setCategory(categoryRes.data);
        setSubCategory(subcategoryRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  
  useEffect(() => {
    if (editId && subCategory.length > 0) {
      setLoading(true)
      const getSingleRange = async () => {
        try {
          const res = await getSingleRangeSeriesDetails(editId);
          if (res.data.length) {
            const item = res.data[0];
            setValue("category", item.category_id);
            setValue("subCategory", item.subcategory_id);
            setValue("seriesName", item.series_name);
            setValue("series", item.series);

            const filtered = subCategory.filter(
              (subCat: any) => parseInt(subCat.category_id) === parseInt(item.category_id)
            );
            
            setFilteredSubCat(filtered);
            setLoading(false)
            
          } 
        } catch (error) {
          console.error("Error fetching single range details:", error);
        }
      };

      getSingleRange();
    }
  }, [editId, subCategory]);

  const selectedCategory = watch("category");

  useEffect(() => {
    if (selectedCategory) {
      const filtered = subCategory.filter(
        (subCat: any) => parseInt(subCat.category_id) === parseInt(selectedCategory)
      );
      setFilteredSubCat(filtered);
      
    }
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-blue-500 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="lg:p-10">
      <Card className="lg:w-[45%]">
        <div className="p-4 bg-gray-200 text-black w-full rounded-t-md">
          <span>Range Series - Add</span>
        </div>
        <hr />
        <div className="w-full p-10">
          <form onSubmit={handleSubmit(submit)}>
            {/* Category Field */}
            <div className="grid gap-2 mb-4">
              <Label htmlFor="category" className="font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                {...register("category")}
                className="p-2 rounded border-black border text-black focus:ring-2 ring-blue-500 transition duration-300"
              >
                <option value="">Select Category</option>
                { 
                  category.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <span className="text-red-500 text-sm">{errors.category.message}</span>
              )}
            </div>

            {/* Sub-Category Field */}
            <div className="grid gap-2 mb-4">
              <label htmlFor="subCategory" className="font-medium text-gray-700">
                Sub-Category <span className="text-red-500">*</span>
              </label>
              <select
                id="subCategory"
                {...register("subCategory")}
                className="p-2 rounded text-black border-gray-400 border focus:ring-2 ring-blue-500 transition duration-300"
              > 
                <option value="">Select Sub-Category</option>
                {filteredSubCat.length > 0 &&
                  filteredSubCat.map((item: any) => (
                    <option key={item.id} value={item.subcategory_id}>
                      {item.subcategory_name}
                    </option>
                  ))}
              </select>
              {errors.subCategory && (
                <span className="text-red-500 text-sm">{errors.subCategory.message}</span>
              )}
            </div>

            {/* Series Name Field */}
            <div className="grid gap-2 mb-4">
              <label htmlFor="seriesName" className="font-medium text-gray-700">
                Series Name <span className="text-red-500">*</span>
              </label>
              <input
                id="seriesName"
                {...register("seriesName")}
                type="text"
                placeholder="Enter Series Name"
                className="p-2 rounded text-black border-gray-400 border focus:ring-2 ring-blue-500 transition duration-300"
              />
              {errors.seriesName && (
                <span className="text-red-500 text-sm">{errors.seriesName.message}</span>
              )}
            </div>

            {/* Series Field */}
            <div className="grid gap-2 mb-4">
              <label htmlFor="series" className="font-medium text-gray-700">
                Series <span className="text-red-500">*</span>
              </label>
              <input
                id="series"
                {...register("series")}
                type="text"
                placeholder="Enter Series"
                className="p-2 rounded border-gray-400 text-black border focus:ring-2 ring-blue-500 transition duration-300"
              />
              {errors.series && (
                <span className="text-red-500 text-sm">{errors.series.message}</span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between mx-3 p-3">
              <Button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 px-5 rounded"
                onClick={() => navigate("/rangeseries")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-blue-600 text-white p-2 px-5 rounded"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}; 

export default AddRangeSeries;
