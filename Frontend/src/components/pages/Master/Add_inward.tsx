import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader } from "../../ui/card";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  fetchArticleDetails,
  fetcharticles,
  fetchColor,
  fetchSize,
  fetchvendors,
} from "../../../api";
import { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";

const Add_inward = () => {
  const navigate = useNavigate()
  // Zod schema
  const inwardSchema = z.object({
    inward_date: z.date(),
    remark: z.union([z.string(), z.number()]),
    supplier: z.union([z.string(), z.number()]),
    article_no: z.union([z.string(), z.number()]),
    po_number: z.string(),
    quantity: z.union([z.string(),z.number()]),
    color_flag: z.union([z.string(), z.number()]),
    vendor: z.string(),
    color: z.array(z.object({ id: z.number(), name: z.string() })),
    size: z.array(z.object({ id: z.number(), name: z.string() })),
    ratio: z.string().refine((val) => {
      const selectedSizeLen = selectedSizes.length;
      const value = val.split(",");
      const isValidSizeList = value.every((v) => /^[0-9]+$/.test(v));
      return isValidSizeList && selectedSizeLen === selectedSizeLen;
    }),
    stock_ratio: z.union([z.string(),z.number()]),
    color_quantity: z.array(z.number()).default([]),
    weight: z.union([z.string(),z.number()]),
    style_desc: z.string().optional(),
    brand_name: z.string().optional(),
    category: z.string().optional(),
    series: z.string().optional(),
    sub_category: z.string().optional(),
    no_of_peice:z.union([z.string(),z.number()])
  });

  const form = useForm<z.infer<typeof inwardSchema>>({
    resolver: zodResolver(inwardSchema),
    defaultValues: {
      inward_date: new Date(),
      remark: "",
      supplier: "",
      article_no: "",
      po_number: "",
      quantity: "",
      color_flag: "",
      vendor: "",
      color: [],
      size: [],
      ratio: "",
      stock_ratio: "",
      weight: "",
      style_desc: "",
      category: "",
      series: "",
      sub_category: "",
      color_quantity: [],
      no_of_peice:""
    },
    
    mode: "onBlur",
  });
  
  const [vendor, SetVendor] = useState<any>([]);
  const [article, SetArticle] = useState([]);
  const [colors, SetColor] = useState([]);
  const [sizes, SetSizes] = useState([]);
  //Fetching all selects
  const fetchSelects = async () => {
    const suppliers = await fetchvendors();
    SetVendor(suppliers.message);
    const article = await fetcharticles();
    SetArticle(article.data);
    const colors = await fetchColor();
    SetColor(colors.data);
    const sizes = await fetchSize();
    SetSizes(sizes.data);
  };
  useEffect(() => {
    fetchSelects();
  }, []);

  //HandleChange for colors
  const [selectedColors, setSelectedColors] = useState<{ id: number; name: string }[]>([]);

  const handleColorSelect = (color: { id: number; name: string }) => {
    setSelectedColors((prev) => {
      let updated;

      if (prev.some((c) => c.id === color.id)) {
        // If already selected, remove it
        updated = prev.filter((c) => c.id !== color.id);
      } else {
        // If not selected, add it
        updated = [...prev, color];
      }

      // Update form field value
      form.setValue(
        "color",
        updated.map((c) => ({ id: c.id, name: c.name }))
      );

      return updated;
    });
  };
  //Size 
  const [selectedSizes, setSelectedSizes] = useState<{ id: number; name: string }[]>([]);

  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    form.reset();
    setResetKey((prev) => prev + 1); 
  };
  //Article selection
  const handleArticles = async(id:number)=>{
    const ArticleDetails = await fetchArticleDetails(id)
    const arrayA = ArticleDetails.data
    console.log(arrayA);
    const colorFlag = arrayA[0].colorflag
    if(colorFlag !== 1){
        SetColor([])
        SetSizes([])
    }else{
      const cols =await fetchColor()
      SetColor(cols.data)
      const siz = await fetchSize()
      SetSizes(siz.data)
    }
    arrayA.map((items:any)=>{
      form.reset({
        ...form.getValues(),
        po_number:items.po_fy || "N/A",
        quantity:parseInt(items.num_packs) ,
        color_flag:items.colorflag,
        vendor:items.vendor_name || "N/A",
        style_desc:items.style_description || "N/A",
        brand_name:items.brand_name || "N/A",
        category:items.category_name || "N/A",
        sub_category:items.sub_cat_name || "N/A",
        series:items.series || "N/A"
      }),
      { keepDefaultValues: true }
    })
    
  }

  
const handleSizeSelect = (size: { id: number; name: string }) => {
  setSelectedSizes((prev) => {
    let updated;

    if (prev.some((s) => s.id === size.id)) {
      
      updated = prev.filter((s) => s.id !== size.id);
    } else {
      updated = [...prev, size];
    }

    
    form.setValue(
      "size",
      updated.map((s) => ({ id: s.id, name: s.name }))
    );

    return updated;
  });
};

   //Errors of form
   console.log("Errors",form.formState.errors);
   
  //Submit function
  const submit = (data:object) => {
    console.log("submit",data);
  };
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <span className="text-3xl">INWARD</span>
          <span className="text-3xl">GRN:453/89</span>
        </CardHeader>
        <hr />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)}>
            {/*first row*/}
            <div className="grid gap-3 lg:flex lg:gap-14 p-5 bg-gray-700">
              {/*inward date*/}
              <FormField
                control={form.control}
                name="inward_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-2 mb-1">
                      INWARD-DATE <span className="text-red-600">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-9 w-full px-5 py-5 text-lg",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto" align="start">
                        <Calendar
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/*REMARK*/}
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      REMARKS <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="p-5"></Input>
                    </FormControl>
                  </FormItem>
                )}
              />
              {/*SUPPLIERS*/}
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ml-1 block mb-1">
                      Supplier <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-full lg:w-52 p-5 text-lg">
                        <SelectValue placeholder="Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>SUPPLIER</SelectLabel>
                          {vendor &&
                            vendor.map((vend: any) => (
                              <SelectItem
                                key={vend.id}
                                value={vend.id.toString()}
                              >
                                {vend.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/*Second row*/}
            <div className="grid gap-3 lg:flex lg:gap-14 p-5">
              {/*Article*/}
              <FormField
                control={form.control}
                name="article_no"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                      key={resetKey}
                        value={field.value}
                        onValueChange={
                          (id: any) =>{
                          field.onChange(id.toString())
                          handleArticles(id.toString())}
                        }
                      >
                        <FormLabel className="block ml-1 mb-1">
                          ARTICLE <span className="text-red-500">*</span>
                        </FormLabel>
                        <SelectTrigger className="w-full lg:w-60 p-5 text-lg">
                          <SelectValue placeholder="Select article" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>ARTICLES</SelectLabel>
                            {article &&
                              article.map((art: any) => (
                                <SelectItem
                                  key={art.articleid}
                                  value={art.articleid.toString()}
                                >
                                  {art.article_number}
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
                name="po_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      PO NUMBER <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="bg-gray-500 cursor-not-allowed p-5"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      QUANTITY <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="p-5 cursor-not-allowed bg-gray-500"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color_flag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      COLOR FLAG <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="p-5 cursor-not-allowed bg-gray-500"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      VENDOR <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="p-5 bg-gray-500 cursor-not-allowed"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/*Third row*/}
            <div className="grid gap-3 lg:flex lg:gap-14 p-5">
              {/*Color*/}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      COLOR <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-full lg:w-60 p-5 text-lg">
                        {selectedColors.length > 0 ? (
                          <div className="flex gap-1">
                            {selectedColors.slice(0, 2).map((color) => (
                              <span
                                key={color.id}
                                className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm cursor-pointer"
                                onClick={() => handleColorSelect(color)}
                              >
                                {color.name}
                              </span>
                            ))}
                            {selectedColors.length > 2 && (
                              <span className="text-gray-500">
                                +{selectedColors.length - 2} more...
                              </span>
                            )}
                          </div>
                        ) : (
                          <SelectValue placeholder="SELECT COLOR" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Colors</SelectLabel>
                          {colors.map((col: any) => {
                            const isChecked = selectedColors.some(
                              (c) => c.id === col.id
                            );

                            return (
                              <div
                                key={col.id}
                                className="flex items-center px-3 py-2 cursor-pointer"
                                onClick={() => handleColorSelect(col)}
                              >
                                <input
                                  className="mr-2"
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                />
                                {col.name}
                              </div>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      SIZE <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-full lg:w-56 p-5 text-lg">
                        {selectedSizes.length > 0 ? (
                          <div className="flex gap-1">
                            {selectedSizes.slice(0, 3).map((size) => (
                              <span
                                key={size.id}
                                className="px-1 py-1 bg-blue-500 text-white rounded-md text-sm cursor-pointer"
                                onClick={() => handleSizeSelect(size)}
                              >
                                {size.name}
                              </span>
                            ))}
                            {selectedSizes.length > 3 && (
                              <span className="text-gray-500">
                                +{selectedSizes.length - 3}more..
                              </span>
                            )}
                          </div>
                        ) : (
                          <SelectValue placeholder="SELECT SIZE" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Sizes</SelectLabel>
                          {sizes.map((size) => {
                            const isChecked = selectedSizes.some(
                              (s) => s.id === size.id
                            );
                            return (
                              <div
                                key={size.id}
                                className="flex items-center px-3 py-2 cursor-pointer"
                                onClick={
                                  () => {
                                    handleSizeSelect(size)
                                  }
                                }
                              >
                                <input
                                  className="mr-2"
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                />
                                {size.name}
                              </div>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ratio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block mb-1 ml-1">
                      RATIO <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input {...field} className="p-5"></Input>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock_ratio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block mb-1 ml-1">
                      STOCK RATIO (MOBILE APP){" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : undefined;
                          field.onChange(isNaN(value) ? "" : value);
                      }}
                      className="p-5"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block mb-1 ml-1">
                      WEIGHT <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || "")
                      }
                      className="p-5"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/*fourth row*/}
            <div className="grid gap-3 lg:flex lg:gap-14 p-5">
              <FormField
                control={form.control}
                name="style_desc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      STYLE DESCRIPTION <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="bg-gray-500 cursor-not-allowed p-5 lg:w-60"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      BRAND <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="bg-gray-500 cursor-not-allowed p-5 lg:w-56"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      CATEGORY <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="bg-gray-500 cursor-not-allowed p-5 lg:w-56"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="series"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      SERIES <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="bg-gray-500 cursor-not-allowed p-5 lg:w-56"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sub_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      SUB CATEGORY <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input
                      {...field}
                      disabled
                      className="bg-gray-500 cursor-not-allowed p-5 lg:w-52"
                    ></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/*fifth row*/}
            <div className="grid gap-3 lg:flex lg:gap-14 p-5">
              <FormField
                control={form.control}
                name="no_of_peice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-1 mb-1">
                      NO OF PEICES <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input {...field} className="p-5 lg:w-60"></Input>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedColors.map((color, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`color_quantity.${index}`}
                  render={({ field }) => (
                    <FormItem className="-mt-3">
                      <FormLabel className="">
                        Enter quantity {color.name}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="p-5 w-56"
                          type="text"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value: any = e.target.value
                              ? Number(e.target.value)
                              : "";
                            form.setValue(`color_quantity.${index}`, parseFloat(value));
                          }}
                          placeholder={`Enter value for ${color.name}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/*BUTTONS row*/}
            <div className=" lg:flex  lg:justify-between p-5">
              <div>
                <Button
                  type="submit"
                  className="mb-5 lg:mb-0 w-20 px-20 bg-green-500 py-5 text-lg"
                >
                  Submit
                </Button>
              </div>
              <div className="flex gap-5">
                <Button
                  type="button"
                  onClick={()=>navigate('/inward')}
                  className="w-20 px-20 bg-green-500 py-5 text-lg"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  className="w-20 px-20 bg-green-500 py-5 text-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Add_inward;
