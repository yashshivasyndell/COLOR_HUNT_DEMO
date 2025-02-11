import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  addarticles,
  fetchBrands,
  fetchCategoryList,
  fetchSinglearticle,
  fetchSubcategorydata,
  getRangeSeriesList,
  updatearticle,
} from "../../../api";
import { useNavigate } from "react-router-dom";
import CustomToast from "../../../showToast";
import { useParams } from "react-router-dom";

const Addarticle = () => {
  const ArticleSchema = z.object({
    category_id: z.union([
      z.string(),
      z.number(),
    ]), 
    subcategory_id: z.union([z.string(), z.number()]),
    series_id: z.union([z.string({ message: "Select a series" }), z.number()]),
    article_number: z.union([z.number(),z.string()]),
    style_description: z
      .string({ message: "Please enter Description" }) 
      .min(5, { message: "Description must be 5 char long" }),
    brand_id: z.union([
      z.string({ message: "Please select a brand" }),
      z.number(),
    ]),
    fabric_name: z
      .string({ message: "Please enter fabric name" })
      .min(4, { message: "fabric name must be min 4 char long" }),
    fabric_composition: z
      .string({ message: "Please Enter fabric composition" })
      .min(4, { message: "fabric composition must be min 4 char long" }),
  });

  //For fetching all selects
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCat, setFilteredSubCat] = useState([]);
  const [series, setSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [brand, setBrand] = useState([]);
  

  const fetchSelects = async () => {
    const category = await fetchCategoryList();
    setCategories(category.data);

    const subCategory = await fetchSubcategorydata();
    setSubCategories(subCategory.data);

    const seriesRes = await getRangeSeriesList();
    setSeries(seriesRes.data);

    const brandRes = await fetchBrands();
    setBrand(brandRes.data);
  };
  
  //RHF X shadCn
  const form = useForm<z.infer<typeof ArticleSchema>>({
    resolver: zodResolver(ArticleSchema), 
  });
  const selectedCategory = form.watch("category_id");
  const selectedsubCategory = form.watch("subcategory_id");
  
  const matchIt = Number(selectedCategory);
  const matchItsub = Number(selectedsubCategory);

  useEffect(() => {
    if (selectedsubCategory) {
      const filSeries = series.filter(
        (serie: any) => parseInt(serie.subcategory_id) === matchItsub
      );
      setFilteredSeries(filSeries);
    }
  }, [selectedsubCategory, series]);

  useEffect(() => {
    if (selectedCategory) {
      const filteredSub = subCategories.filter(
        (subCat: any) => parseInt(subCat.category_id) === matchIt
      );
      setFilteredSubCat(filteredSub);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchSelects();
  }, []);

  const [seriesChange, setSeriesChange] = useState(false);

  const submit = async (data: any) => {
    const payload= {
      article_number: data.article_number,
      brand_id: data.brand_id,
      category_id: data.category_id,
      fabric_composition: data.fabric_composition,
      fabric_name: data.fabric_name,
      series_id: data.series_id,
      style_description: data.style_description,
      subcategory_id: data.subcategory_id,
    };
    if(editId){
       const updateArticle = await updatearticle(editId,payload)
       if(updateArticle.statusCode === 200){
        CustomToast(200,'Article updated success')
       }
       console.log('update',updateArticle);
    }else{
      try{
      const addArticle = await addarticles(payload);
    if(addArticle.statusCode===200){
      CustomToast(200,'Article added successfully')
    } 
  }catch(error){
    CustomToast(500,'Article already exists')
  }}
  };

  const {id} = useParams()
  const editId = Number(id)
  const {reset} = form;

 useEffect(() => {
  const fetchDetails = async () => {
    try {
      const fillData = await fetchSinglearticle(editId);
      const main = fillData.data.rows;
      if (main.length > 0) {
        const item = main[0]; 
        reset({
          category_id: item.category_id.toString(),
          subcategory_id: item.subcategory_id.toString(),
          series_id: item.series_id.toString(),
          article_number: item.article_number,
          style_description: item.style_description,
          brand_id: item.brand_id.toString(),
          fabric_name: item.fabric_name,
          fabric_composition: item.fabric_composition,
        });
        setLoader(false);
      }
    } catch (error) {
      console.error("Failed to fetch article:", error);
      setLoader(false); 
    }
  };
  
  fetchDetails();
}, [editId,reset]); 

  

  const [loader,setLoader] = useState(true)

  
  
  const navigate = useNavigate();

  if(loader){
    return (
      <div className="flex justify-center items-center min-h-screen">
      <div className="text-blue-500 font-medium">Loading...</div>
    </div>
    )
  }

  return (
    
    <div className="p-5 ">
      <div className="">
        <Card className="w-full max-w-2xl px-5">
          <CardHeader>Add Article</CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)}>
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString()} onValueChange={(value) => {
                       field.onChange(value);
                             console.log("Selected value:", value); 
                                        }}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select a Category" 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Categories</SelectLabel>
                            {categories.length &&
                              categories.map((Item: any) => (
                                <SelectItem
                                  key={Item.id}
                                  value={Item.id.toString()}
                                > 
                                  {Item.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sub Category<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString()}  onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select a SubCategory"
                            defaultValue={field.value}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Sub Categories</SelectLabel>
                            {editId
                              ? subCategories.map((item: any) => (
                                  <SelectItem
                                    key={item.subcategory_id}
                                    value={item.subcategory_id.toString()}
                                  >
                                    {item.subcategory_name}
                                  </SelectItem>
                                ))
                              : filteredSubCat.map((item: any) => (
                                  <SelectItem
                                    key={item.subcategory_id}
                                    value={item.subcategory_id.toString()}
                                  >
                                    {item.subcategory_name}
                                  </SelectItem>
                                ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="series_id"
                render={({ field }) => {
                  useEffect(() => {
                    if (field.value) {
                      setSeriesChange(true);
                    }
                  }, [field.value]);
                  return (
                  <FormItem>
                    <FormLabel>
                      Series<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString()} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSeriesChange(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select a series"
                            defaultValue={field.value}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Series</SelectLabel>
                            {filteredSeries &&
                              filteredSeries.map((item: any) => (
                                <SelectItem
                                  value={item.rangeseries_id.toString()}
                                >
                                  {item.rangeseries_name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}}
              />

              {seriesChange && (
                <div>
                  <FormField
                    control={form.control}
                    name="article_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Article <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter article size"
                            {...field}
                            
                          ></Input>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="style_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Style Description 
                          <span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Style Description"
                            {...field}
                          ></Input>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Select Brand <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select value={field.value?.toString()}  onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue
                                placeholder="Select A brand"
                                defaultValue={field.value}
                              ></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Brands</SelectLabel>
                                {brand &&
                                  brand.map((item: any) => (
                                    <SelectItem value={item.id.toString()}>
                                      {item.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fabric_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Fabric Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter Fabric name"
                          ></Input>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fabric_composition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Fabric composition <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter Fabric composition "
                          ></Input>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <div className="w-full flex justify-between p-5">
                <Button type="button" onClick={() => navigate("/article")}>
                  Back
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>

  );
};

export default Addarticle;
