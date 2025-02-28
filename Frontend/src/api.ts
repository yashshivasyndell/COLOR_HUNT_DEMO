/* eslint-disable @typescript-eslint/no-unused-vars */
import { AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import { apiError, apiResponse } from "./types/types";


const API_URL = import.meta.env.VITE_API_URl_DEV;
const API_KEY = import.meta.env.VITE_API_KEY;

// Base configuration
const baseConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

// Configurations for states and city api (Third party API)
const apiConfig = {
  ...baseConfig,
  headers: {
    ...baseConfig.headers,
    Accept: "application/json",
    "X-CSCAPI-KEY": API_KEY,
  },
};

type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";

// Generic Request function
const request = async <T>(
  endPoint: string,
  options?: {
    data?: unknown;
    method: HttpMethods;
    headers?: Record<string, string>;
    configType?: "default" | "api";
  }
): Promise<T> => {
  const {
    data,
    method = "GET",
    headers = {},
    configType = "default",
  } = options || {};

  const config = configType === "default" ? baseConfig : apiConfig;

  try {
    const response: AxiosResponse<T> = await axios({
      method,
      url: `${API_URL}${endPoint}`,
      data,
      headers: {
        ...config.headers,
        ...headers,
      },
      withCredentials: config.withCredentials,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<apiResponse>;
      throw new apiError(
        axiosError.response?.data.message || "An unknown error occurred",
        axiosError.response?.status || 500,
        axiosError.response?.data.errors
      );
    }
    throw new apiError("An unknown error occurred", 500, error);
  }
};

// Helper functions
const get = <T>(endPoint: string, data?: unknown) =>
  request<T>(endPoint, { method: "GET", data });
const post = <T>(endPoint: string, data: unknown) =>
  request<T>(endPoint, { method: "POST", data });

// <!-- ==== API Functions === -->

// Authentication
const login = (data: object): Promise<apiResponse> =>
  post<apiResponse>("/auth/login", data);
const logout = (): Promise<apiResponse> => post<apiResponse>("/auth/logout", {});

// State and City API Routes
// fetch states of India
const getStates = async () => {
  try {
    const response: any = await axios.get(
      "/api/countries/IN/states",
      apiConfig
    );

    if (response && response.data.length !== 0) {
      const states = response.data.map(
        (state: { id: string; name: string; iso2: string }) => {
          return { label: state.name, value: state.id, code: state.iso2 };
        }
      );
      return states;
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError;
  }
};

// fetch cities of specific state
const getCities = async (state: string | null) => {
  try {
    const response: any = await axios.get(
      `/api/countries/IN/states/${state}/cities`,
      apiConfig
    );

    if (response && response.data.length !== 0) {
      const cities = response.data.map((city: { id: string; name: string }) => {
        return { label: city.name, value: city.id };
      });
      return cities;
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError;
  }
};

// Party
const createParty = (data: object): Promise<apiResponse> =>
  post<apiResponse>("/party/create-party", data);
const getAllParties = (): Promise<apiResponse> => get("/party/get-parties");
const fetchPartyDetails = (data: object): Promise<apiResponse> =>
  post<apiResponse>("/party/fetch-party-details", data);
const deleteParty = (data: object): Promise<apiResponse> =>
  post("/party/delete-party", data);
const editParty = (data: object): Promise<apiResponse> =>
  post("/party/edit-party", data);

// Products
const fetchProducts = (): Promise<apiResponse> => get<apiResponse>("/product/get-products");
const fetchProductDetails = (data: object): Promise<apiResponse> => post<apiResponse>("/product/fetch-product-details", data);
const fetchProductUnits = (): Promise<apiResponse> =>
  get<apiResponse>("/product/get-product-units");
const createNewProduct = (data: object): Promise<apiResponse> =>
  post<apiResponse>("/product/create-product", data);


// <!-- ===== Master Link ===== -->

// Category
const fetchCategoryList = (): Promise<apiResponse> => get<apiResponse>("/master/category/get");
const deleteCategory = (id: number):Promise<apiResponse> => post<apiResponse>(`/master/category/delete/${id}`, {});
const addCategory = (data:object):Promise<apiResponse> => post<apiResponse>(`/master/category/add`, data);
const updateCategory = (id:number,data:object):Promise<apiResponse> => post<apiResponse>(`/master/category/update/${id}`,data);
const getCategory = (id:number):Promise<apiResponse> => get<apiResponse>(`/master/category/get/${id}`);

//SubCategory
const fetchSubcategorydata = (): Promise<apiResponse> => get<apiResponse>("/master/subcategory/get")
const getSubCategoryList = ():Promise<apiResponse> => get<apiResponse>('/master/subcategory/get')
const addSubCategory = (data:object):Promise<apiResponse> => post<apiResponse>('/master/subcategory/add',data)
const deleteSubCategory = (id:number):Promise<apiResponse> => post<apiResponse>(`/master/subcategory/delete/${id}`,{})
const getSingleSubCat = (id:number):Promise<apiResponse> =>get<apiResponse>(`/master/subcategory/get/${id}`)
const updateSubCategory = (id:Number,body:object):Promise<apiResponse> => post<apiResponse>(`/master/subcategory/update/${id}`,body)

//Range Series
const getRangeSeriesList = ():Promise<apiResponse> => get<apiResponse>("/master/rangeseries/get")
const addRangeSeriesList = (data:any):Promise<apiResponse> => post<apiResponse>("/master/rangeseries/add",data)
const getSingleRangeSeriesDetails = (id:number):Promise<apiResponse> => get<apiResponse>(`/master/rangeseries/get/${id}`)
const updateRangeSeries = (id:number,payload:object):Promise<apiResponse> => post<apiResponse>(`/master/rangeseries/update/${id}`,payload)
const deleteRangeSeries = (id:number):Promise<apiResponse> => post<apiResponse>(`/master/rangeseries/delete/${id}`,{})

//Work order
const getworkorderList = ():Promise<apiResponse> => get<apiResponse>("/master/workorder/get")
const addworkorder = (payload:object):Promise<apiResponse>=>post<apiResponse>("/master/workorder/add",payload)
const getSingleWorkOrder = (id:number):Promise<apiResponse>=>get(`/master/workorder/get/${id}`)
const updateWorkorder = (id:number,payload:object):Promise<apiResponse>=>post(`/master/workorder/update/${id}`,payload)
const deleteWorkorder = (id:number):Promise<apiResponse>=>post(`/master/workorder/delete/${id}`,{})

//Article color
const getArticleColorLists = ():Promise<apiResponse>=>get<apiResponse>("/master/colors/get")
const addArticleColor = (payload:object):Promise<apiResponse>=>post<apiResponse>("/master/colors/add",payload)
const getSingleArticleColor = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/colors/get/${id}`)
const updateArticleColor = (id:number,payload:object):Promise<apiResponse>=>post(`/master/colors/update/${id}`,payload)
const deleteArticleColor = (id:number):Promise<apiResponse>=>post<apiResponse>(`/master/colors/delete/${id}`,{})

//Article Size 
const getSize = ():Promise<apiResponse>=>get<apiResponse>("/master/sizes/get")
const addSize = (payload:object):Promise<apiResponse>=>post<apiResponse>("/master/sizes/add",payload)
const getSingleSize = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/sizes/get/${id}`)
const updatSize = (id:number,payload:any):Promise<apiResponse>=>post(`/master/sizes/update/${id}`,payload)
const deleteSize = (id:number):Promise<apiResponse>=>post(`/master/sizes/delete/${id}`,{})

//Vendors
const getVendors = ():Promise<apiResponse>=>get<apiResponse>("/master/vendor/get")
const getSingleVendor = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/vendor/get/${id}`)
const addVendor = (payload:object):Promise<apiResponse>=>post<apiResponse>(`master/vendor/add`,payload)
const updatevendor = (id:number,payload:object):Promise<apiResponse>=>post<apiResponse>(`/master/vendor/update/${id}`,payload)
const deleteVendor = (id:number):Promise<apiResponse>=>post<apiResponse>(`/master/vendor/delete/${id}`,{})

//Users

const getUsers = ():Promise<apiResponse>=>get<apiResponse>("/master/user/get")
const addUsers = (payload:object):Promise<apiResponse>=>post<apiResponse>("/master/user/add",payload)
const updateUser = (id:number,payload:object):Promise<apiResponse>=>post<apiResponse>(`/master/user/update/${id}`,payload)
const deleteUser = (id:number):Promise<apiResponse>=>post<apiResponse>(`/master/user/delete/${id}`,{})
const getUserRoles = ():Promise<apiResponse>=>get<apiResponse>("/master/userrole/get")
const getSingleUser = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/user/get/${id}`)

//Party master
const fetchPartyList = (): Promise<apiResponse> => get<apiResponse>("/master/party/get");
const getsalesPerson = (): Promise<apiResponse> => get<apiResponse>("/master/getSalesPersons");
const addParty = (data: any): Promise<apiResponse> => post<apiResponse>("/master/party/add", data);
const fetchSinglePartyDetails = (id: number): Promise<apiResponse> => get<apiResponse>(`/master/party/get/${id}`);
const updateParty = (id: number, data: any): Promise<apiResponse> => post(`/master/party/update/${id}`, data);
const deleteparty = (id: number): Promise<apiResponse> => post<apiResponse>(`/master/party/delete/${id}`, {});
const updatePartyStatus = (id: number, data: any): Promise<apiResponse> => post(`/master/party/updateStatus/${id}`, data);

//brand
const fetchBrands = ():Promise<apiResponse> => get<apiResponse>("/master/brand/get")

// Articles
const addarticles = (payload:object):Promise<apiResponse> => post<apiResponse>("/master/article/add",payload)
const fetcharticles = ():Promise<apiResponse>=>get<apiResponse>("/master/article/fetcharticles")
const deletearticles = (id:number):Promise<apiResponse>=>post<apiResponse>(`/master/article/deletearticles/${id}`,{})
const fetchSinglearticle = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/article/fetchsinglearticle/${id}`)
const updatearticle = (id:number,body:object):Promise<apiResponse>=>post<apiResponse>(`/master/article/updatearticle/${id}`,body)

//Purchase order
const fetchyears = ():Promise<apiResponse>=>get<apiResponse>("/master/getfinancialyear")
const fetchvendors = ():Promise<apiResponse>=>get<apiResponse>("/master/getvendors")
const addpurchaseorder = (payload:object):Promise<apiResponse>=>post<apiResponse>("/master/purchaseorder/add",payload)
const fetchColor = ():Promise<apiResponse>=>get<apiResponse>("/master/colors/get")
const fetchSize = ():Promise<apiResponse>=>get<apiResponse>("/master/sizes/get")
const fetchworkorder = ():Promise<apiResponse>=>get<apiResponse>("/master/workorder/get")

const fetchsinglePO = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/getSinglePO/${id}`)
const fetchpurchaseList = ():Promise<apiResponse>=>get<apiResponse>("/master/getpurchasenumberlist")
const fetchPurchaseNumberTable = ():Promise<apiResponse>=>get<apiResponse>("/master/fetchMainTable")
const deletePO = (id:number):Promise<apiResponse>=>post<apiResponse>(`/master/deletepurchasenumber/${id}`,{})
const deleteWholePO = (id:number):Promise<apiResponse>=>post<apiResponse>(`/master/deletewholePo/${id}`,{})
const fetchPODtable = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/fetchPODtable/${id}`)
const editPODtable = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/editPODTable/${id}`)

// Inward apis
const fetchArticleDetails = (id:number):Promise<apiResponse>=>get<apiResponse>(`/master/fetchArticleDetails/${id}`)
const addInward = (payload:object):Promise<apiResponse>=>post<apiResponse>(`/master/inward/addinward`,payload)
const fetchinwardTable = ():Promise<apiResponse>=>get<apiResponse>("/master/inward/fetchtable")
const deleteWholeInward = (id:number):Promise<apiResponse>=>post<apiResponse>(`/master/inward/deletewholeinward/${id}`,{})
const fetchSingleInwardTable = (id:String):Promise<apiResponse>=>post<apiResponse>(`/master/inward/fetchSingleInwardTable`,id)
const getSingleInwardDetails = (id:String):Promise<apiResponse>=>post<apiResponse>(`/master/inward/fetchSingleInwardDetails/`,id) 

export {
  login,
  logout,
  getStates,
  getCities,
  createParty,
  getAllParties,
  fetchPartyDetails,
  deleteParty,
  editParty,
  fetchProducts,
  fetchProductUnits,
  fetchProductDetails,
  createNewProduct,
  addCategory,
  fetchCategoryList,
  deleteCategory,
  updateCategory,
  getCategory,
  fetchSubcategorydata,
  getSubCategoryList,
  addSubCategory,
  deleteSubCategory,
  updateSubCategory,
  getSingleSubCat,
  getRangeSeriesList,
  addRangeSeriesList,
  getSingleRangeSeriesDetails,
  updateRangeSeries,
  deleteRangeSeries,
  addworkorder,
  getworkorderList,
  deleteWorkorder,
  updateWorkorder,
  getSingleWorkOrder,
  getArticleColorLists,
  addArticleColor,
  getSingleArticleColor,
  updateArticleColor,
  deleteArticleColor,
  getSize,
  getSingleSize,
  addSize,
  updatSize,
  deleteSize,
  addVendor,
  getSingleVendor,
  updatevendor,
  deleteVendor,
  getVendors,
  getUsers,
  addUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getUserRoles,
  fetchPartyList,
  addParty,
  fetchSinglePartyDetails,
  updateParty,
  deleteparty,
  updatePartyStatus,
  getsalesPerson,
  fetchBrands,
  addarticles,
  fetcharticles,
  deletearticles,
  fetchSinglearticle,
  updatearticle,
  fetchyears,
  addpurchaseorder,
  fetchvendors,
  fetchColor,
  fetchSize,
  fetchworkorder,
  fetchpurchaseList,
  deletePO,
  fetchsinglePO,
  fetchPODtable,
  fetchPurchaseNumberTable,
  deleteWholePO,
  editPODtable,
  fetchArticleDetails,
  addInward,
  fetchinwardTable,
  deleteWholeInward,
  fetchSingleInwardTable,
  getSingleInwardDetails
};
