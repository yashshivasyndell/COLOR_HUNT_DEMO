import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { useForm } from "react-hook-form";
import { any, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { data, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import CustomToast from "../../../showToast";
import {
  addParty,
  fetchSinglePartyDetails,
  getsalesPerson,
  updateParty,
} from "../../../api";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { triggerAsyncId } from "async_hooks";


const AddPartyMaster = () => {
  const navigate = useNavigate();

  const PartySchema = z.object({
    name: z.string().trim().min(1, { message: "Name is required" }),

    address: z.string().trim().min(1, { message: "Address is required" }),
    email: z.string().trim().min(1, { message: "Email is required" }),

    phone_no: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits" }),

    additional_phone_no: z.string().optional(),
    

    state: z.string().trim().min(1, { message: "State is required" }),

    city: z.string().trim().min(1, { message: "City is required" }),

    pincode: z
      .union([z.string(), z.number()])
      .refine((val) => /^[1-9][0-9]{5}$/.test(val.toString()), {
        message: "Pincode must be a valid 6-digit number",
      }),

    discount: z.union([z.string(), z.number()]),

    country: z.string().trim().min(1, { message: "Country is required" }),

    contact_person: z
      .string()
      .trim()
      .min(1, { message: "Contact person is required" }),

    user_id: z.union([z.string(), z.number()]),

    gst_no: z.string().optional(),
  
    pan_no: z.string().optional(),

    outlet_assign: z.union([z.boolean(),z.number()]).default(false),
    gst_type: z.enum(["GST", "IGST"]).default("GST"),

    additional_rate: z.string().optional(),

    source: z.string().trim().min(1, { message: "Source is required" }),
  }).refine((data) => data.gst_no || data.pan_no, {
    message: "Either GST or PAN number is required.",
    path: ["gst_no", "pan_no"], 
  });

  type PartyFormData = z.infer<typeof PartySchema>;

  const {
    register,
    handleSubmit,
    formState: { errors,isDirty, isSubmitting, isValid },
    setValue,
    watch,
    reset,
    trigger,
    getValues,
  } = useForm<PartyFormData>({ resolver: zodResolver(PartySchema),defaultValues:{
    name: "",
      address: "",
      phone_no: "",
      email: "",
      contact_person: "",
      state: "",
      city: "",
      pincode: "",
      country: "",
      gst_no: "",
      pan_no: "",
      gst_type: undefined,
      discount: "",
      outlet_assign: false,
      additional_rate: "",
      user_id:"",
      source: "",
  } });

  const watchAllFields = watch(); 

  useEffect(() => {
    
    console.log("Form Values: ", watchAllFields);
    console.log("Is Form Dirty: ", isDirty);
    console.log("Is Form Valid: ", isValid);
    console.log("Is Form Submitting: ", isSubmitting);
  }, [watchAllFields, isDirty, isValid, isSubmitting]);

  const [additionalPhone, setadditionalPhone] = useState(false);

  const [loading, setloading] = useState(false);

  const submit = async (data: any) => {
    
    if (data.additional_phone_no === "") {
      delete data.additional_phone_no;
    }
    try {
      if (editId) {
        
        const updatRes = await updateParty(editId, data);
        console.log("success", updatRes);
        CustomToast(200, "successfully updated");
      } else {
        const addRes = await addParty(data);
        if (addRes.statusCode === 200) {
          CustomToast(200, "Party successfully added");
        }
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const gstType = watch("gst_type");
  const [salesperson, setSalesP] = useState([]);

  const { id } = useParams();
  const editId = Number(id);

  const fetchSalesP = async () => {
    const res = await getsalesPerson();
    setSalesP(res.data); 
    console.log(
      "sales persons",
      salesperson.map((item: any) => {
        return item;
      })
    );
  };
  
  useEffect(()=>{
    if(editId){
      const singlePartyfunc = async ()=>{
        try{
        const partyData = await fetchSinglePartyDetails(editId)
        const data = partyData.data[0]
        reset({
          name: data.name,
          address: data.address,
          phone_no: data.phone_no,
          email: data.email,
          contact_person: data.contact_person,
          state: data.state,
          city: data.city,
          pincode: data.pincode,
          country: data.country,
          gst_no: data.gst_no,
          pan_no: data.pan_no,
          gst_type: data.gst_type,
          discount: data.discount,
          outlet_assign: data.outlet_assign,
          additional_rate: data.additional_rate,
          user_id: data.user_id,
          source: data.source,
        });  
        trigger()
      }catch(error){
        console.log("something went wrong");
      }
      }
      singlePartyfunc()
    }
    
  },[editId,reset])

  useEffect(() => {
    fetchSalesP();

  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-blue-500 font-medium">Loading...</div>
      </div>
    );
  }
  return (
    <div className="p-5">
      <Card className="w-[85%]">
        <div className="p-2">Party - Add</div>
        <hr />
        <form className="">
          <div className="mx-10 lg:flex gap-6 mt-5">
            <div className="grid gap-3 mb-3">
              <Label htmlFor="">Party Name</Label>
              <Input
                {...register("name")}
                type="text"
                className="outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.name && (
                <div className="text-red-500">{errors.name.message}</div>
              )}
            </div>
            <div className="grid gap-3 mb-3">
              <Label htmlFor="">Address</Label>
              <Input
                {...register("address")}
                type="text"
                className="outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.address && (
                <div className="text-red-500">{errors.address.message}</div>
              )}
            </div>
            <div className="flex flex-col items-start  gap-3">
              <Label htmlFor="">Phone Number *</Label>
              <Input
                {...register("phone_no")}
                type="text"
                className="outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.phone_no && (
                <div className="text-red-500">{errors.phone_no.message}</div>
              )}
              
          
            </div>
            <div className="grid gap- mb-3 mt-3">
              <Label htmlFor="">Email</Label>
              <Input
                type="text"
                {...register("email")}
                className=" outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.email && (
                <div className="text-red-500">{errors.email.message}</div>
              )}
            </div>
          </div>
          <div className="text-center relative">
          {additionalPhone && (
            <div className="flex w-[75%] ml-10 lg:w-[21%] lg:ml-[51%] mt-5 lg:mt-0 mb-3">
              <Input
                {...register("additional_phone_no")}
                type="text"
                placeholder="Additonal phone"
                className="rounded outline "
              />
              {errors.additional_phone_no && (
                <div className="text-red-500">
                  {errors.additional_phone_no.message}
                </div>
              )}
              <Button
                type="button"
                onClick={() => setadditionalPhone(false)}
                className="bg-red-400 rounded left-[60.5%] lg:left-[63.2%] absolute"
              >
                Remove
              </Button>
            </div>
          )}
          <div className="">
            <Button type="button" className="lg:ml-48" onClick={() => setadditionalPhone(true)}>
              + Add Phone Number
            </Button>
          </div>
          </div>
          {/*second row*/}
          <div className="mx-10 lg:flex gap-6 mt-3">
            <div className="grid gap-2">
              <Label htmlFor="">Contact Person</Label>
              <Input
                type="text"
                {...register("contact_person")}
                className="outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.contact_person && (
                <div className="text-red-500">
                  {errors.contact_person.message}
                </div>
              )}
            </div>
            <div className="grid gap-2 mt-3">
              <Label htmlFor="">State *</Label>
              <Input
                type="text"
                {...register("state")}
                className="outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.state && (
                <div className="text-red-500">{errors.state.message}</div>
              )}
            </div>
            <div className="grid gap-2 mt-3">
              <Label htmlFor="">City *</Label>
              <Input
                type="text"
                {...register("city")}
                className="outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.city && (
                <div className="text-red-500">{errors.city.message}</div>
              )}
            </div>
            <div className="grid gap-2 mt-3">
              <Label htmlFor="">PinCode *</Label>
              <Input
                type="text"
                {...register("pincode")}
                className="outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.pincode && (
                <div className="text-red-500">{errors.pincode.message}</div>
              )}
            </div>
          </div>
          {/*third*/}
          <div className="mx-10 lg:flex gap-6 mt-3">
            <div className="grid gap-2 items-center">
              <Label htmlFor="">Country *</Label>
              <Input
                type="text"
                {...register("country")}
                className="outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.country && (
                <div className="text-red-500">{errors.country.message}</div>
              )}
            </div>
            <div className="grid gap-2 items-center mt-3">
              <Label htmlFor="">GST Number*</Label>
              <div className="grid gap-2">
                <Input
                  type="text"
                  {...register("gst_no")}
                  className=" outline  focus:ring-4 ring-blue-700 transition duration-300 rounded"
                />
                {errors.gst_no && (
                  <div className="text-red-500 ">{errors.gst_no.message}</div>
                )}
                
              </div>
            </div>
              <div className="lg:my-auto sm:mt-3">
                <span>OR</span>
              </div>

            <div className="grid gap-2 ">
              <Label htmlFor="">PAN Number*</Label>
              <Input
                type="text"
                {...register("pan_no")}
                className=" outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.pan_no && (
                <div className="text-red-500">{errors.pan_no.message}</div>
              )}
            </div>
            <div className="grid gap-2 ml-5 mt-5 right-20">
              <Label htmlFor="">GST Type </Label>
              <div className="flex gap-5">
                <RadioGroup
                  value={gstType}
                  onValueChange={(value: "GST" | "IGST") =>
                    setValue("gst_type", value)
                  }
                  className="flex"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GST" id="gst" />
                    <Label htmlFor="gst">GST</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="IGST" id="igst" />
                    <Label htmlFor="igst">IGST</Label>
                  </div>
                </RadioGroup>
                {errors.gst_type && (
                  <div className="text-red-500">{errors.gst_type.message}</div>
                )}
              </div>
            </div>
          </div>
          {/*fourth*/}
          <div className="mx-10 lg:flex gap-6 mt-3">
            <div className="grid gap-2 ">
              <Label htmlFor="">Discount </Label>
              <Input
                type="text"
                {...register("discount")}
                className="outline  focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.discount && (
                <div className="text-red-500">{errors.discount.message}</div>
              )}
            </div>

            <div className="grid gap-2 mt-">
              <Label htmlFor="">Additional Rate </Label>
              <Input
                type="text"
                {...register("additional_rate")}
                className="  outline focus:ring-4 ring-blue-700 transition duration-300 rounded"
              />
              {errors.additional_rate && (
                <div className="text-red-500">
                  {errors.additional_rate.message}
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center m-5 lg:m-0">
              <Label htmlFor="">Outlet</Label>
              <Input
                {...register("outlet_assign")}
                onChange={(e) => setValue("outlet_assign", e.target.checked)}
                type="checkbox"
                className=" rounded"
              />
            {errors.outlet_assign && (
              <div className="text-red-600">{errors.outlet_assign.message}</div>
            ) }
            </div>
            <div className="grid gap-2 ">
              <Label htmlFor="">Sales person *</Label>
              <select
                id=""
                {...register("user_id")}
                
                className=" text-black w-[200px] outline-4 border-black border-2 p-1 rounded"
              >
                {salesperson &&
                  salesperson.map((item: any, idx: any) => (
                    <option key={idx} value={item.user_id}>
                      {item.name}
                    </option>
                  ))}
              </select>
              {errors.user_id && (
                <div className="text-red-500">{errors.user_id.message}</div>
              )}
            </div>
          </div>
          {/*fifth*/}
          <div className=" w-52 mt-3">
            <div className="grid gap-2">
              <Label htmlFor="" className="ml-10">Source *</Label>
              <Input
                type="text"
                {...register("source")}
                className="outline focus:ring-4 ring-blue-700 ml-10 transition duration-300 rounded"
              />
              {errors.source && (
                <div className="text-red-500 ml-10">{errors.source.message}</div>
              )}
            </div>
          </div>
          {/*button*/}
          <div className="p-5 flex mx-5 justify-between">
            <Button onClick={() => navigate("/party-master")} className="px-10" type="button">
              Back
            </Button>
            <Button type="submit" onClick={handleSubmit(submit)} className="px-10">
              Submit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddPartyMaster;
