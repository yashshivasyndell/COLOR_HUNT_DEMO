import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Eye, EyeOff } from "lucide-react";
import { z, ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import CustomToast from "../../showToast";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useEffect, useState } from "react";
import { login } from "../../api";
import { apiError } from "../../types/types";
import { useDispatch } from "react-redux";
import { userLogin } from "../../app/features/authSlice";
import { AppDispatch, RootState } from "../../app/store";
import { useSelector } from "react-redux";
import { Loader } from "../Loader";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);


  // interface of form
  interface FormData {
    email: string;
    password: string;
  }

  // schema of form
  const schema: ZodType<FormData> = z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email()
      .refine((value) => value.trim().length !== 0, {
        message: "Email is required",
        path: ["email"],
      }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Minimum 6 characters required")
      .max(10, "Maximum 10 charcters are allowed"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // handle login
  const handleLogin = async (formData: FormData) => {
    try {
      const response = await login(formData);
      dispatch(userLogin(formData));
      navigate("/dashboard");
    } catch (error) {
      const apiError = error as apiError;
      console.log("Api Error: ", apiError);
      if (apiError.statusCode === 400) {
        if (!apiError.errors.userExists) {
          CustomToast(400, "User does not exist");
        }

        if (apiError.errors.invalidCredentials) {
          setError("password", { message: "Invalid Credentials" });
        }
      }
    }
  };

  return (
    <>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen md:min-h-[100vh]  md:max-h-[100vh]">
        <div className="hidden lg:grid place-content-center border m-5 rounded-sm moving-gradient h-[95vh] overflow-hidden">
          <img
            src={Logo}
            alt="Logo"
            className="mix-blend-color-dodge rounded-[100%] w-[250px] h-[250px] p-3 shadow-black border-orange-300"
          />
        </div>
        <div className="w-full max-h-[100vh] grid place-items-center">
          <div className="flex flex-col  items-center">
            <div className="p-5 flex items-center gap-4">
              <img
                src={Logo}
                alt="Logo"
                className="w-[50px] h-[50px] rounded-full"
              />
              <h3 className="text-xl">Company Name</h3>
            </div>
            <form onSubmit={handleSubmit(handleLogin)}>
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Login</CardTitle>
                  <CardDescription>
                    Enter your details below to login to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="email">
                      Email<span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="e.g johndoe@gmail.com"
                      className="rounded-md w-full p-2"
                      {...register("email")}
                    />
                    {errors.email && (
                      <span className="text-sm text-red-600">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="password">
                      Password<span className="text-red-600">*</span>
                    </label>
                    <div className="flex flex-row justify-between items-center relative">
                      <Input
                        type={passwordVisibility ? "text" : "password"}
                        id="password"
                        placeholder="**********"
                        className="rounded-md w-full p-2"
                        {...register("password")}
                      />

                      {passwordVisibility ? (
                        <Eye
                          onClick={() =>
                            setPasswordVisibility(!passwordVisibility)
                          }
                          className="absolute right-2 opacity-30 w-5 cursor-pointer"
                        />
                      ) : (
                        <EyeOff
                          onClick={() =>
                            setPasswordVisibility(!passwordVisibility)
                          }
                          className="absolute right-2 opacity-30 w-5 cursor-pointer"
                        />
                      )}
                    </div>
                    {errors.password && (
                      <span className="text-sm text-red-600">
                        {errors.password.message}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
