const express = require("express");
const {
  verifyToken,
  canList,
  canAdd,
  canDelete,
  canEdit,
} = require("../middlewares/verifyToken");
const {
  getCategoryList,
  addCategory,
  deleteCategory,
  updateCategory,
  getSubCategoryList,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getWorkOrderList,
  addWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getRangeSeriesList,
  addRangeSeries,
  updateRangeSeries,
  deleteRangeSeries,
  getBrandList,
  addBrand,
  updateBrand,
  deleteBrand,
  getColorList,
  addColor,
  updateColor,
  deleteColor,
  getSizeList,
  addSize,
  updateSize,
  deleteSize,
  getVendorList,
  addVendor,
  updateVendor,
  deleteVendor,
  getUserRoleList,
  addUserRole,
  updateUserRole,
  deleteUserRole,
  updateMobileStatus,
  getSingleCategoryDetails,
  getSingleSubCategoryDetails,
  getSubcatOfCategory,
  getSingleRangeSeriesDetails,
  getSingleWorkOrderDetails,
  getSingleColorDetails,
  getSingleSizeDetails,
  getSingleVendorDetails,
  getSingleBrandDetails,
  getSalesPersons,
  getUserList,
  addUser,
  getSingleUserDetails,
  updateUser,
  deleteUser,
  getPartyList,
  addParty,
  getSinglePartyDetails,
  updateParty,
  deleteParty,
  updateStatusOfParty,
  addArticle,
  fetchArticles,
  deleteArticle,
  getSingleArticle,
  updatearticle,
  addPurchaseOrder,
  getfinancialYear,
  fetchvendors,
  getPurchaseOrderNumber,
  getPurchaseOrderList,
  deletePurchaseOrder,
  fetchSinglePo,
  fetchPO_details,
  getPurchaseNumberTable,
  deletePoNumber,
  editPODtable,
} = require("../controllers/masterController");
const { fetchArticleDetails } = require("../controllers/InwardController");
const masterRouter = express.Router();

masterRouter.get("/getSalesPersons", verifyToken,getSalesPersons);

// Category Routes
masterRouter.get("/category/get", verifyToken, canList, getCategoryList);
masterRouter.get("/category/get/:id", verifyToken, canList, getSingleCategoryDetails);
masterRouter.post("/category/add", verifyToken, canAdd, addCategory);
masterRouter.post("/category/update/:id", verifyToken, canEdit, updateCategory);
masterRouter.post(
  "/category/delete/:id",
  verifyToken,                                
  canDelete,
  deleteCategory
);
masterRouter.post("/category/updateStatus/:id", verifyToken, canEdit, updateMobileStatus);

// Subcategory Routes
masterRouter.get("/subcategory/get", verifyToken, canList, getSubCategoryList);
masterRouter.get("/subcategory/get/:id", verifyToken, canList, getSingleSubCategoryDetails);
masterRouter.get("/subcategory/get-subcats/:id", verifyToken, canList, getSubcatOfCategory);
masterRouter.post("/subcategory/add", verifyToken, canAdd, addSubCategory);
masterRouter.post(
  "/subcategory/update/:id",
  verifyToken,
  canEdit,
  updateSubCategory
);
masterRouter.post(
  "/subcategory/delete/:id",
  verifyToken,
  canDelete,
  deleteSubCategory
);


// Users
masterRouter.get("/user/get", verifyToken, canList, getUserList);
// masterRouter.post(
//   "/user/updateStatus/:id",
//   verifyToken,
//   canEdit,
//   updateUserStatus
// );
masterRouter.post("/user/add" , addUser);
masterRouter.get("/user/get/:id", verifyToken, canList, getSingleUserDetails);
masterRouter.post("/user/update/:id", verifyToken, canEdit, updateUser);
masterRouter.post("/user/delete/:id", verifyToken, canDelete, deleteUser);



// Workorder Routes
masterRouter.get("/workorder/get", verifyToken, canList, getWorkOrderList);
masterRouter.post("/workorder/add", verifyToken, canAdd, addWorkOrder);
masterRouter.get("/workorder/get/:id", verifyToken, canAdd, getSingleWorkOrderDetails);
masterRouter.post(
  "/workorder/update/:id",
  verifyToken,
  canEdit,
  updateWorkOrder
);
masterRouter.post(
  "/workorder/delete/:id",
  verifyToken,
  canDelete,
  deleteWorkOrder
);

// Range Series
masterRouter.get("/rangeseries/get", verifyToken, canList, getRangeSeriesList);
masterRouter.post("/rangeseries/add", verifyToken, canAdd, addRangeSeries);
masterRouter.get("/rangeseries/get/:id", verifyToken, canAdd, getSingleRangeSeriesDetails);
masterRouter.post(
  "/rangeseries/update/:id",
  verifyToken,
  canEdit,
  updateRangeSeries
);
masterRouter.post(
  "/rangeseries/delete/:id",
  verifyToken,
  canDelete,
  deleteRangeSeries
);

// Brand
masterRouter.get("/brand/get", verifyToken, canList, getBrandList);
masterRouter.get("/brand/get/:id", verifyToken, canList, getSingleBrandDetails);
masterRouter.post("/brand/add", verifyToken, canAdd, addBrand);
masterRouter.post("/brand/update/:id", verifyToken, canEdit, updateBrand);
masterRouter.post("/brand/delete/:id", verifyToken, canDelete, deleteBrand);

// Colors
masterRouter.get("/colors/get", verifyToken, canList, getColorList);
masterRouter.get("/colors/get/:id", verifyToken, canAdd, getSingleColorDetails);
masterRouter.post("/colors/add", verifyToken, canAdd, addColor);
masterRouter.post("/colors/update/:id", verifyToken, canEdit, updateColor);
masterRouter.post("/colors/delete/:id", verifyToken, canDelete, deleteColor);

// Sizes
masterRouter.get("/sizes/get", verifyToken, canList, getSizeList);
masterRouter.get("/sizes/get/:id", verifyToken, canList, getSingleSizeDetails);
masterRouter.post("/sizes/add", verifyToken, canAdd, addSize);
masterRouter.post("/sizes/update/:id", verifyToken, canEdit, updateSize);
masterRouter.post("/sizes/delete/:id", verifyToken, canDelete, deleteSize);

// Vendor
masterRouter.get("/vendor/get", verifyToken, canList, getVendorList);
masterRouter.get("/vendor/get/:id", verifyToken, canList, getSingleVendorDetails);
masterRouter.post("/vendor/add", verifyToken, canAdd, addVendor);
masterRouter.post("/vendor/update/:id", verifyToken, canEdit, updateVendor);
masterRouter.post("/vendor/delete/:id", verifyToken, canDelete, deleteVendor);

// User Role
masterRouter.get("/userrole/get", verifyToken, canList, getUserRoleList);
masterRouter.post("/userrole/add", verifyToken, canAdd, addUserRole);
masterRouter.post("/userrole/update/:id", verifyToken, canEdit, updateUserRole);
masterRouter.post("/userrole/delete/:id", verifyToken, canDelete, deleteUserRole);

//brand 
masterRouter.get("/brand/get", verifyToken, canList, getBrandList);

//Article

masterRouter.post("/article/add",verifyToken,addArticle)
masterRouter.get("/article/fetcharticles",verifyToken,fetchArticles)
masterRouter.post("/article/deletearticles/:id",verifyToken,deleteArticle)
masterRouter.get("/article/fetchsinglearticle/:id",verifyToken,getSingleArticle)
masterRouter.post("/article/updatearticle/:id",verifyToken,updatearticle)

//Party route
masterRouter.get("/party/get", verifyToken, canList, getPartyList);
// masterRouter.post("/party/updateStatus/:id", verifyToken, canEdit, updateUserStatus);
masterRouter.post("/party/add", verifyToken, canAdd, addParty);
masterRouter.get("/party/get/:id", verifyToken, canList, getSinglePartyDetails);
masterRouter.get("/party/getSales", verifyToken, canList, getSalesPersons);
masterRouter.post("/party/update/:id", verifyToken, canEdit, updateParty);
masterRouter.post("/party/delete/:id", verifyToken, canDelete, deleteParty);
masterRouter.post(
  "/party/updateStatus/:id",
  verifyToken,
  canEdit,
  updateStatusOfParty
);

//PO Routes
masterRouter.post("/purchaseorder/add",verifyToken,canAdd,addPurchaseOrder)
masterRouter.get("/getfinancialyear",verifyToken,getfinancialYear)
masterRouter.get("/getvendors",verifyToken,fetchvendors)
masterRouter.get("/getpurchasenumber",verifyToken,getPurchaseOrderNumber)
masterRouter.get("/getpurchasenumberlist",verifyToken,getPurchaseOrderList)
masterRouter.post("/deletepurchasenumber/:id",verifyToken,deletePurchaseOrder)
masterRouter.post("/deletewholePo/:id",verifyToken,deletePoNumber)
masterRouter.get("/getSinglePO/:id",verifyToken,fetchSinglePo)
masterRouter.get("/fetchPODtable/:id",verifyToken,fetchPO_details)
masterRouter.get("/fetchMainTable",getPurchaseNumberTable)
masterRouter.post("/editPODTable",editPODtable)

// Inward Routes
masterRouter.get("/fetchArticleDetails/:id",fetchArticleDetails)

module.exports = masterRouter;
