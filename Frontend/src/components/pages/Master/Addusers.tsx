import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addUsers,
  getSingleUser,
  getUserRoles,
  updateUser,
} from "../../../api";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import CustomToast from "../../../showToast";

const Addusers = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  console.log("edit id came", editId);

  
    const editUserSchema = z.object({
        role: z.union([
            z
              .string()
              .min(1, { message: "Please select a category" })
              .refine((value) => value !== "", {
                message: "Please select a valid category",
              }),
            z.number().min(1, { message: "Please select a valid category" }),
          ]),
      
          name: z
            .string()
            .nonempty("Name can't be empty")
            .min(3, { message: "name must be 3 characters long" }),
      
          email: z
            .string()
            .nonempty("Email can't be empty")
            .email({ message: "Please provide a valid email" }),
      
          password: z
            .string()
            .optional(),
      
          phone: z
            .string()
            .nonempty("Phone number can't be empty")
            .refine((value) => /^[0-9]{10}$/.test(value), {
              message: "Enter a valid phone number",
            }),
    })
  
      const userSchema = z.object({
        role: z.union([
          z
            .string()
            .min(1, { message: "Please select a category" })
            .refine((value) => value !== "", {
              message: "Please select a valid category",
            }),
          z.number().min(1, { message: "Please select a valid category" }),
        ]),
    
        name: z
          .string()
          .nonempty("Name can't be empty")
          .min(3, { message: "Name must be 3 characters long" }),
    
        email: z
          .string()
          .nonempty("Email can't be empty")
          .email({ message: "Please provide a valid email" }),
    
        password: z
          .string()
          .refine(
            (value) => {
              if (editId) {
               
                return true;
              }
              return value && value.length >= 8;
            },
            {
              message: "Password must be at least 8 characters long",
            }
          )
          .refine(
            (value) => {
              if (editId) return true;
              return (
                /[A-Z]/.test(value) &&
                /[a-z]/.test(value) &&
                /[0-9]/.test(value) &&
                /[@$!%*?&#]/.test(value)
              );
            },
            {
              message:
                "Password must include uppercase, lowercase, number, and special character",
            }
          )
          .optional(),
    
        phone: z
          .string()
          .nonempty("Phone number can't be empty")
          .refine((value) => /^[0-9]{10}$/.test(value), {
            message: "Enter a valid phone number",
          }),
      });
  


  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(editId ? editUserSchema : userSchema) });

  const submit = async (data: any) => {
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
      phone_no: data.phone,
    };

    if (editId) {
      try {
        const resUpdated = await updateUser(editId, payload);
        if (resUpdated) {
          CustomToast(200, "User successfully updated");
        }
      } catch (error) {
        CustomToast(500, "Error updating");
      }
    } else {
      try {
        const res = await addUsers(payload);
        if (res.statusCode === 200) {
          CustomToast(200, "User Registered Successfully");
        }
      } catch (error) {
        CustomToast(500, "User already exists");
      }
    }
  };

  const [roles, setRoles] = useState([]);
  const fetchRoles = async () => {
    const res = await getUserRoles();
    setRoles(res.data);
  };

  const fillDetail = async () => {
    if (!editId) return;
    const data = await getSingleUser(editId);
    data.data.map((item: any) => {
      setValue("role", item.role_id);
      setValue("name", item.name);
      setValue("email", item.email);
      setValue("phone", item.phone_no);
    });
  };

  useEffect(() => {
    fetchRoles();
    fillDetail();
  }, [editId]);

  return (
    <div className="p-10">
      <Card className="w-[80%]">
        <div>
          <form action="" onSubmit={handleSubmit(submit)}>
            <div className="p-3 ml-3 uppercase">User</div>
            <hr />
            <div className="flex justify-between p-6">
              <div className="grid gap-3 w-[100%]">
                <label htmlFor="">Role</label>
                <select
                  {...register("role")}
                  className="text-black outline rounded w-[90%] p-2"
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.length > 0 &&
                    roles.map((item: any, key: any) => (
                      <option key={key} value={item.id}>
                        {item.role}
                      </option>
                    ))}
                </select>
                {errors.role && (
                  <p className="text-red-500">{errors.role.message}</p>
                )}
              </div>
              <div className="grid gap-3 w-[100%]">
                <label htmlFor="">Name</label>
                <input
                  {...register("name")}
                  type="text"
                  className="text-black outline p-2 rounded focus:ring-2 ring-blue-500 transition-all duration-300 w-[90%]"
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name?.message}</div>
                )}
              </div>
            </div>
            <div className="flex justify-between p-6">
              <div className="grid gap-3 w-[80%]">
                <label htmlFor="">Email</label>
                <input
                  {...register("email")}
                  type="text"
                  className="outline text-black w-[90%] rounded p-2"
                />
                {errors.email && (
                  <div className="text-red-500">{errors.email?.message}</div>
                )}
              </div>
              <div className="grid gap-3 w-[80%]">
                <label htmlFor="">Password</label>
                <input
                  {...register("password")}
                  type="text"
                  className="outline text-black w-[90%] rounded p-2"
                />
                {errors.password && (
                  <div className="text-red-500">{errors.password.message}</div>
                )}
              </div>
            </div>
            <div className="p-6 gap-3 grid w-[100%]">
              <label htmlFor="">Phone No</label>
              <input
                {...register("phone")}
                type="text"
                className="outline text-black p-2 w-[45%] rounded"
              />
              {errors.phone && (
                <div className="text-red-500">{errors.phone.message}</div>
              )}
            </div>
            <div className="flex justify-between mx-5 p-5">
              <Button type="button"
                onClick={() => navigate("/userlist")}
                className="px-10 bg-green-500"
              >
                Back
              </Button>
              <Button className="px-10 bg-green-500">Submit</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Addusers;
