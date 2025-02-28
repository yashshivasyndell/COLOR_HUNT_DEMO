import { Button } from "../../ui/button";
import {useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardDescription, CardHeader } from "../../ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Select } from "../../ui/select";
import {
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../../ui/select";
import {
  addpurchaseorder,
  deletePO,
  fetcharticles,
  fetchColor,
  fetchPODtable,
  fetchSinglearticle,
  fetchsinglePO,
  fetchSize,
  fetchvendors,
  fetchworkorder,
  getSingleArticleColor,
} from "../../../api";
import { useEffect, useState } from "react";

import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { CalendarIcon, Eye, FilePenLine, Trash2 } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { format } from "date-fns";
import CustomToast from "../../../showToast";
import { useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../Table/data-table-column-header";
import { DataTable } from "../Table/data-table";


const Addpurchase = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editId = Number(id);

  const purchaseSchema = z.object({
    purchase_number: z.string().optional(),
    vendor_id: z.union([
      z.string({ message: "Select a vendor" }),
      z.number({ message: "Select a vendor" }),
    ]),
    article_id: z.union([z.number(), z.string()]),
    po_date: z.date({ message: "Po date is must" }),
    num_packs: z.union([z.number(), z.string()]).optional(),
    remarks: z.string({ message: "Remarks are must" }),
    workorder_id: z.union([z.number(), z.string(), z.null()]).optional(),
    workorder_date: z.date().optional(),
    category: z.string().or(z.number()).or(z.null()).optional(),
    sub_category: z.string().or(z.number()).or(z.null()).optional(),
    brand: z.string().or(z.number()).or(z.null()).optional(),
    serial: z.string().or(z.number()).or(z.null()).optional(),
    style_description: z.string().or(z.number()).or(z.null()).optional(),
    color: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
    size: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
    ratio: z.string().refine(
      (val) => {
        const selectedOptionsLength = selectedOptions.length;
        const values = val.split(",");
        const isValidNumberList = values.every((v) => /^[0-9]+$/.test(v));
        return isValidNumberList && values.length === selectedOptionsLength;
      },
      { message: "Enter valid ratio for size" }
    ),
    stock_ratio: z
      .union([z.number({ message: "Stock ratio is must" }), z.string()])
      .optional(),
    rate: z
      .union([z.number({ message: "Rate is must" }), z.string()])
      .optional(),
    weight: z
      .union([z.number({ message: "Weight is a must" }), z.string()])
      .optional(),
    color_quantity: z.array(
      z.object({  
        color_id: z
          .union([
            z.string({ message: "color id is req" }),
            z.number({ message: "color id is req" }),
          ])
          .optional(),
        quantity: z.union([z.number(), z.string()]),
      })
    ),
  });
  const [selectedOptions, setSelectedOptions] = useState<any>([]);

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      workorder_date: new Date(),
      po_date: new Date(),
      color: [],
      color_quantity: [],
      size: [],
      ratio: "",
      article_id: "",
      vendor_id: "",
      remarks: "",
      workorder_id: "",
    },
    mode: "onChange",
  });

  

  const [articles, setArticles] = useState<any>([]);
  const [articlefield, setarticlefield] = useState(false);
  const [vendor, setVendor] = useState<any>([]);
  const [colorQuant, setColorQuant] = useState(false);
  const [colors, setColor] = useState<any>([]);
  const [selectedColors, setSelectedColors] = useState<
    { id: number; name: string }[]>([]);

  const [selectedSizes, setSelectedSizes] = useState<
    { id: number; name: string }[]>([]);
  const [workorder, setWorkorder] = useState([]);

  const getYear = async () => {
    const article = await fetcharticles();
    setArticles(article.data);
    const vendor = await fetchvendors();
    setVendor(vendor.message);
    const colors = await fetchColor();
    setColor(colors.data);

    const sizes = await fetchSize();

    setSelectedSizes(sizes.data);
    const workorder = await fetchworkorder();
    setWorkorder(workorder.data);
  };

  const getSingleArticle = async (id: number) => {
    const article = await fetchSinglearticle(id);

    const array = article.data.rows;
    array.map((val: any) =>
      form.reset({
        ...form.getValues(),
        category: val.category_name,
        sub_category: val.subcategory_name,
        serial: val.series_id,
        brand: val.brand_name,
        style_description: val.style_description,
      })
    );
  };

  const [NewArticle, SetNewArticle] = useState(false);
  let poNumber = location.pathname === "/add" ? "ADD" : "EDIT";

  if (NewArticle) {
    poNumber = "";
  }

  const [poNumId, setPoNumId] = useState<number | null>(null);
  const [articleNoId, setArticleNoId] = useState<number | null>(null);
  const [Id, setId] = useState("");
  const [po_fy, setPo_fy] = useState("");
  const [callTable, setcallTable] = useState(false);

  const submit = async (data: any) => {
    const payload = {
      Id: editId,
      po_number: poNumber,
      po_num_id: poNumId,
      size_ratio: data.ratio,
      article_no_id: articleNoId,
      color: data.color,
      size: data.size,
      article_id: parseInt(data.article_id),
      po_date: moment(data.po_date).format("YYYY-MM-DD"),
      num_packs: data.num_packs,
      remarks: data.remarks,
      vendor_id: parseInt(data.vendor_id),
      workorder_id: parseInt(data.workorder_id),
      workorder_date: moment(data.workorder_date).format("YYYY-MM-DD"),
    };
    console.log("payload", payload);
    try {
      const addPurchaseorder = await addpurchaseorder(payload);
      console.log("res add", addPurchaseorder);
      setcallTable(true);
      const redirectId = addPurchaseorder.rows[0].id;
      if (addPurchaseorder?.rows?.length > 0) {
        setLoader(true);
        setPo_fy("PO number " + addPurchaseorder.rows[0].po_fy);
        setId(addPurchaseorder.rows[0].id);
        setPoNumId(addPurchaseorder.rows[0].po_number_id);
        setArticleNoId(addPurchaseorder.rows[0].article_id);
        setLoader(false);
      }

      if (addPurchaseorder.data === 200) {
        form.reset({
          article_id: "",
          vendor_id: "",
          remarks: "",
          workorder_id: "",
          color: [],
          color_quantity: [],
          size: [],
          ratio: " ",
          category: "",
          sub_category: "",
          serial: "",
          style_description: "",
          brand: "",
          num_packs: "",
        });
     
        form.setValue("remarks", form.getValues("remarks"));
        form.setValue("color_quantity", form.getValues("color_quantity"));
        form.setValue("workorder_id", "");
        form.setValue("color", form.getValues("color"));
        form.setValue("color_quantity", form.getValues("color_quantity"));
        // 
        
        form.setValue("vendor_id", form.getValues("vendor_id"));
        setLoader(true);
        SetNewArticle(true);
        setLoader(false);

        CustomToast(200, "Data successfuly added");
        navigate(`/editPO/${redirectId}`);
      }
      fetchPOD();
    } catch (error) {
      fetchPOD();
      console.log("Lafda", error);
    } finally {
      if (editId) {
        form.reset({
          color: [],
          color_quantity: [],
          size: [],
          ratio: "",
        });
       
      } else {
        form.reset();
        
        form.setValue("color", []);
        form.setValue("color_quantity", []);
        form.setValue("ratio", " ");
        setLoader(true);
        fetchPOD();
        setLoader(false);
      }
    }
  };

  // const [ratioString, setRatioString] = useState<string>("");

  const [loader, setLoader] = useState(true);
  const [po_num, setPo_num] = useState("");

  const fetchSingle = async () => {
    const resPO = await fetchsinglePO(editId);
    console.log("single", resPO);
    setPo_fy("Purchase Number: " + resPO.message.po_fy);
    const message =
      typeof resPO.message === "string"
        ? JSON.parse(resPO.message)
        : resPO.message;
    setPo_num("PO number :" + message.po_fy);
    const mappedColorQuantities = (message.color || []).map(
      (color: any, index: number) => ({
        color_id: color.id,
        quantity: message.num_packs?.[index] ?? "",
      })
    );
    form.reset({
      article_id: message.article_id,
      purchase_number: message.po_fy,
      vendor_id: message.vendor_id,
      remarks: message.remarks,
      po_date: message.po_date ? new Date(message.po_date) : new Date(),
      ratio: message.article_ratios,
      color: message.color || "nothing",
      workorder_id: message.workorder_id,
      workorder_date: message.workorder_date
        ? new Date(message.workorder_date)
        : new Date(),
      size: message.size,
      color_quantity: mappedColorQuantities,
      num_packs: Array.isArray(message.num_packs)
        ? message.num_packs.join(", ")
        : message.num_packs,
    });
    setSelectedColors(message.color || []);
    setSelectedOptions(message.size || []);
    setLoader(false);
  };

  useEffect(() => {
    if (editId) {
      fetchSingle();
    } else {
      setLoader(false);
    }
  }, [editId]);

  useEffect(() => {
    getYear();
  }, []);

  const handleColoronChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const quantities = form.watch("color_quantity") || [];
    quantities[idx] = { quantity: e.target.value };
    form.setValue("color_quantity", quantities);
    const numPacks = quantities.map((item) => item.quantity).join(",");
    form.setValue("num_packs", numPacks);
  };

  const [podTable, setPodtable] = useState<any>([]);

  const fetchPOD = async () => {
    try {
      const tab = await fetchPODtable(editId);
      setPodtable(tab.message);
    } catch (error) {
      console.log("PROBLEM IS", error);
    }
  };

  useEffect(() => {
    if (editId) {
      fetchPOD();
    }
  }, [editId, callTable]);

  //POD table

  interface PODtable {
    id: number;
    no: number;
    article_number: number;
    brand_name: string;
    category_name: string;
    pieces: number;
    serial: number;
    subcategory_name: string;
    vendor_name: string;
  }

  const handleDelete = async (id: number) => {
    try {
      const del = await deletePO(id);
      fetchPOD();
      if (podTable.length === 1) {
        setPodtable([]);
      }
      if (podTable.length === 0) {
        setPodtable([]);
      }
      if (del.statusCode === 200) {
        CustomToast(200, "Successfully deleted");
      }
    } catch (error) {
      CustomToast(500, "Error occured deleting");
    }
  };

  const podColumn: ColumnDef<PODtable>[] = [
    {
      accessorKey: "no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="S NO" />
      ),
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "article_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ARTICLE NUMBER" />
      ),
    },
    {
      accessorKey: "vendor_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="VENDOR" />
      ),
    },
    {
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CATEGORY" />
      ),
    },
    {
      accessorKey: "subcategory_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SUB CATEGORY" />
      ),
    },
    {
      accessorKey: "serial",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SERIAL" />
      ),
    },
    {
      accessorKey: "pieces",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PEICES" />
      ),
    },
    {
      accessorKey: "brand_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="BRAND NAME" />
      ),
    },
    {
      header: "ACTION",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex gap-3">
            <div>
              <span>
                <Eye />
              </span>
            </div>
            <div>
              <span>
                <Trash2 onClick={() => handleDelete(data.id)} />
              </span>
            </div>
            <div>
              <span>
                <FilePenLine onClick={() => navigate(`/editPO/${data.id}`)} />
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-blue-500 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="">
      <Card className="w-[80%]">
        <CardHeader>
          <div className="flex justify-between">
            {po_fy}{" "}
            {po_fy && (
              <span className="bg-gray-600 rounded-lg p-5"> {po_fy}</span>
            )}
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)}>
            <div className="flex flex-wrap gap-5 p-5">
              <FormField
                control={form.control}
                name="purchase_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      PO number <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        className="bg-gray-200 text-gray-700 cursor-not-allowed"
                        placeholder="PO number "
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Select vendor <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-52">
                          <SelectValue
                            placeholder="Select a vendor"
                            className="text-black"
                          />
                        </SelectTrigger>
                        <SelectGroup>
                          <SelectContent>
                            <SelectLabel>Vendors</SelectLabel>
                            {vendor &&
                              vendor.map((item: any) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id.toString()}
                                >
                                  {item.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </SelectGroup>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Remarks</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Remarks"></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="article_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Select Article <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setarticlefield(true);
                          getSingleArticle(Number(value));
                          
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="w-52">
                          <SelectValue
                            placeholder="Select Article"
                            defaultValue={field.value}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Articles </SelectLabel>
                            {articles &&
                              articles.map((item: any) => (
                                <SelectItem
                                  key={item.articleid}
                                  value={item.articleid.toString()}
                                >
                                  {item.article_number}
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="">
                      Category <span className="text-red-600">*</span>
                    </FormLabel>
                    <Input
                      placeholder="Category"
                      disabled
                      className="cursor-not-allowed text-gray-700 bg-gray-300"
                      {...field}
                    ></Input>
                  </FormItem>
                )}
              />
            </div>
            {/*2nd row*/}
            <div className="flex flex-wrap gap-5 p-5">
              <FormField
                control={form.control}
                name="sub_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sub Category <span className="text-red-600">*</span>
                    </FormLabel>
                    <Input
                      placeholder="Sub Category"
                      disabled
                      className="text-gray-700 bg-gray-300"
                      {...field}
                    ></Input>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Serial <span className="text-red-600">*</span>
                    </FormLabel>
                    <Input
                      placeholder="Serial"
                      disabled
                      className="cursor-not-allowed text-gray-700 bg-gray-300"
                      {...field}
                    ></Input>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="style_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Style Description <span className="text-red-600">*</span>
                    </FormLabel>
                    <Input
                      placeholder="Style Description"
                      disabled
                      className="cursor-not-allowed text-gray-700 bg-gray-300"
                      {...field}
                    ></Input>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Brand <span className="text-red-600">*</span>
                    </FormLabel>
                    <Input
                      placeholder="Brand"
                      disabled
                      className="cursor-not-allowed text-gray-700 bg-gray-300"
                      {...field}
                    ></Input>
                  </FormItem>
                )}
              />
              <span className="mt-2">
                <FormField
                  control={form.control}
                  name="po_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        PO date <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-9 w-52 ",
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
                        <PopoverContent className="w-auto " align="start">
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
              </span>
            </div>
            {/*3 rd row*/}
            <div className="flex flex-wrap gap-5 p-5">
              <FormField
                control={form.control}
                name="workorder_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select workorder</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger className="w-52">
                          <SelectValue placeholder="Select workorder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Workorder </SelectLabel>
                            {workorder &&
                              workorder.map((item: any) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id.toString()}
                                >
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
              {/*hidden*/}
              <FormField
                control={form.control}
                name="num_packs"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} placeholder="Numpacks"></Input>
                    </FormControl>
                  </FormItem>
                )}
              />
              <span className="mt-2">
                <FormField
                  control={form.control}
                  name="workorder_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Workorder date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-9 w-52 ",
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
                        <PopoverContent className="w-auto " align="start">
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
              </span>
              {articlefield && (
                <>
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Color <span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select>
                            <Popover>
                              <PopoverTrigger asChild>
                                <SelectTrigger className="w-52 flex flex-wrap min-h-[40px] gap-1 p-1">
                                  {selectedColors.length > 0 ? (
                                    <>
                                      {selectedColors
                                        .slice(0, 2)
                                        .map((color) => (
                                          <span
                                            key={color.id}
                                            className="bg-orange-300 text-gray-700 px-2 py-1 rounded flex items-center space-x-1"
                                          >
                                            <span>{color.name}</span>
                                            <button
                                              type="button"
                                              className="text-red-500 hover:text-red-700"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updated =
                                                  selectedColors.filter(
                                                    (c) => c.id !== color.id
                                                  );

                                                setSelectedColors(updated);
                                                field.onChange(
                                                  updated.map((c) => ({
                                                    id: c.id,
                                                    name: c.name,
                                                  }))
                                                );

                                                const currentNumPacks =
                                                  form.getValues("num_packs") ||
                                                  "";

                                                const numPacksArray =
                                                  currentNumPacks
                                                    ? currentNumPacks.split(",")
                                                    : [];

                                                const indexToRemove =
                                                  selectedColors.findIndex(
                                                    (color) =>
                                                      color.id === color.id
                                                  );

                                                if (indexToRemove !== -1) {
                                                  const updatedNumPacksArray =
                                                    numPacksArray.filter(
                                                      (_, i) =>
                                                        i !== indexToRemove
                                                    );
                                                  const updatedNumPacks =
                                                    updatedNumPacksArray.join(
                                                      ","
                                                    );
                                                  form.setValue(
                                                    "num_packs",
                                                    updatedNumPacks
                                                  );
                                                }
                                              }}
                                            >
                                              ✕
                                            </button>
                                          </span>
                                        ))}
                                      {selectedColors.length > 3 && (
                                        <span className="text-gray-500 ml-2">
                                          + {selectedColors.length - 3} more
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <SelectValue placeholder="Select color" />
                                  )}
                                </SelectTrigger>
                              </PopoverTrigger>
                              <PopoverContent className="w-52">
                                <SelectGroup>
                                  <SelectLabel>Color</SelectLabel>
                                  {colors &&
                                    colors.map((value: any) => {
                                      const isChecked = selectedColors.some(
                                        (c) => c.id === value.id
                                      );
                                      return (
                                        <div
                                          key={value.id}
                                          className="flex items-center px-3 py-2 cursor-pointer"
                                          onClick={() => {
                                            let updated;
                                            if (isChecked) {
                                              updated = selectedColors.filter(
                                                (c) => c.id !== value.id
                                              );
                                            }else{
                                              updated = [
                                                ...selectedColors,
                                                {
                                                  id: value.id, 
                                                  name: value.name,
                                                },
                                              ];
                                            }
                                            setSelectedColors(updated);
                                            field.onChange(
                                              updated.map((c) => ({
                                                id: c.id,
                                                name: c.name,
                                              }))
                                            );

                                            const updatedNumPacks = updated
                                              .map((c) => c.id)
                                              .join(",");
                                            form.setValue(
                                              "num_packs",
                                              updatedNumPacks
                                            );
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            readOnly
                                            className="mr-2"
                                          />
                                          {value.name}
                                        </div>
                                      );
                                    })}
                                </SelectGroup>
                              </PopoverContent>
                            </Popover>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Size <span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select value={field.value || []}>
                            <Popover>
                              <PopoverTrigger asChild>
                                <SelectTrigger className="w-52 flex flex-wrap min-h-[40px] gap-0.5 p-1">
                                  {selectedOptions.length > 0 ? (
                                    <>
                                      {selectedOptions
                                        .slice(0, 3)
                                        .map((option: any) => (
                                          <span
                                            key={option.id}
                                            className="bg-blue-300 text-gray-700 px-2 py-1 rounded flex items-center space-x-1"
                                          >
                                            <span>{option.name}</span>
                                            <button
                                              type="button"
                                              className="text-red-500 hover:text-red-700"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updated =
                                                  selectedOptions.filter(
                                                    (o: any) =>
                                                      o.id !== option.id
                                                  );
                                                setSelectedOptions(updated);
                                                field.onChange(updated);

                                                // const ratioArray = ratioString
                                                //   .split(",")
                                                //   .map((r) => r.trim());
                                                // ratioArray.splice(
                                                //   selectedOptions.indexOf(
                                                //     option
                                                //   ),
                                                //   1
                                                // );
                                                // const newRatioString =
                                                //   ratioArray.join(", ");

                                                // setRatioString(newRatioString);
                                                // form.setValue(
                                                //   "ratio",
                                                //   newRatioString
                                                // );
                                              }}
                                            >
                                              ✕
                                            </button>
                                          </span>
                                        ))}
                                      {selectedOptions.length > 3 && (
                                        <span className="text-gray-500 ">
                                          + {selectedOptions.length - 3} more
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <SelectValue placeholder="Select Sizes" />
                                  )}
                                </SelectTrigger>
                              </PopoverTrigger>
                              <PopoverContent className="w-52">
                                <SelectGroup>
                                  <SelectLabel>Sizes</SelectLabel>
                                  {selectedSizes.map((value: any) => {
                                    const isChecked = selectedOptions.some(
                                      (o: any) => o.id === value.id
                                    );
                                    return (
                                      <div
                                        key={value.id}
                                        className="flex items-center px-3 py-2 cursor-pointer"
                                        onClick={() => {
                                          let updated: any[];

                                          if (isChecked) {
                                            updated = selectedOptions.filter(
                                              (o: any) => o.id !== value.id
                                            );
                                           
                                          } else {
                                            updated = [
                                              ...selectedOptions,
                                              {
                                                id: value.id,
                                                name: value.name,
                                              },
                                            ];
                                          }

                                          setSelectedOptions(updated);
                                          field.onChange(updated);
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          readOnly
                                          className="mr-2"
                                        />
                                        {value.name}
                                      </div>
                                    );
                                  })}
                                </SelectGroup>
                              </PopoverContent>
                            </Popover>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ratio</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            {selectedColors.length > 0 && (
              <div className="flex flex-wrap p-5 gap-5">
                {selectedColors.map((color, idx) => (
                  <FormField
                    key={idx}
                    control={form.control}
                    name={`color_quantity.${idx}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Enter Color {color.name} quantity
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleColoronChange(e, idx);
                            }}
                          ></Input>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-20 ml-5 p-5">
              <Button type="button" onClick={() => navigate("/purchase")}>
                Back
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </Card>
      {!isNaN(editId) ? (
        <div className="w-[80%]">
          <DataTable columns={podColumn} data={podTable} />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Addpurchase;
