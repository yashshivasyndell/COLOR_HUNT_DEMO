import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/toaster";
import Layout from "./components/layout/layout";
import AuthLayout from "./components/layout/AuthLayout";
import Dashboard from "./components/pages/Dashbaord/Dashboard";
import Party from "./components/pages/Party/PartyList";
import Product from "./components/pages/Product/ProductList";
import Login from "./components/auth/login";
import ProtectedRoute from "./components/pages/ProtectedRoute";
import _404Page from "./components/pages/Errors/_404Page";
import SalesList from "./components/pages/Sales/SalesList";
import PurchaseList from "./components/pages/Purchase/PurchaseList";
import CategoryList from "./components/pages/Master/Category/CategoryList";
import SubCategory from "./components/pages/Master/SubCategory";

import WorkOrder from "./components/pages/Master/WorkOrder";
import ArticleColor from "./components/pages/Master/ArticleColor";
import ArticleSize from "./components/pages/Master/ArticleSize";
import Vendor from "./components/pages/Master/Vendor";
import Brand from "./components/pages/Master/Brand";
import PartyMaster from "./components/pages/Master/PartyMaster";
import Banner from "./components/pages/Master/Banner";
import UserRole from "./components/pages/Master/UserRole";
import FinancialYear from "./components/pages/Master/FinancialYear";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "./app/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./app/features/authSlice";
import AddCategory from "./components/pages/Master/Category/AddCategory";
import AddSubCategory from "./components/pages/Master/AddSubCategory";
import RangeSeries from "./components/pages/Master/RangeSeries";
import AddRangeSeries from "./components/pages/Master/AddRangeSeries";
import AddWorkorder from "./components/pages/Master/AddWorkorder";
import AddArticleColor from "./components/pages/Master/AddArticleColor";
import AddArticleSize from "./components/pages/Master/AddArticleSize";
import Addusers from "./components/pages/Master/Addusers";
import AddPartyMaster from "./components/pages/Master/AddPartyMaster";
import Article from "./components/pages/Master/Article";
import Addarticle from "./components/pages/Master/Addarticle";
import Addpurchase from "./components/pages/Purchase/Addpurchase";






function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Toaster />
      {/* Public Routes */}
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/party" element={<Party />} />
            <Route path="/products" element={<Product />} />

            <Route path="/purchase" element={<PurchaseList />} />
            <Route path="/add" element={<Addpurchase />} />
            <Route path="/editPO/:id" element={<Addpurchase />} />
            <Route path="/sales" element={<SalesList />} />

            {/* Master Links */}
            <Route path="/category" element={<CategoryList />} />
            <Route path="/category/add" element={<AddCategory />} />
            <Route path="category/edit/:id" element={<AddCategory />} />
            <Route path="/subcategory" element={<SubCategory />} />
            <Route path="/addsubcategory" element={<AddSubCategory/>} />
            <Route path="/addsubcategory/edit/:id" element={<AddSubCategory/>} />
            <Route path="/rangeseries" element={<RangeSeries/>} />
            <Route path="/addrangeseries" element={<AddRangeSeries/>} />
            <Route path="/addrangeseries/:id" element={<AddRangeSeries/>} />
            <Route path="/workorder" element={<WorkOrder />} />
            <Route path="/addworkorder" element={<AddWorkorder />} />
            <Route path="/addworkorder/:id" element={<AddWorkorder />} />
            <Route path="/article" element={<Article />} />
            <Route path="/add-article" element={<Addarticle />} />
            <Route path="/add-article/:id" element={<Addarticle />} />
            
            <Route path="/addarticlecolor" element={<AddArticleColor />} />
            <Route path="/addarticlecolor/:id" element={<AddArticleColor/>} />
            <Route path="/articlesize" element={<ArticleSize />} />
            <Route path="/addarticlesize" element={<AddArticleSize />} />
            <Route path="/addarticlesize/:id" element={<AddArticleSize />} />
            <Route path="/vendor" element={<Vendor />} />
            <Route path="/brand" element={<Brand />} />
            <Route path="/party-master" element={<PartyMaster />} />
            <Route path="/addparty-master" element={<AddPartyMaster />} />
            <Route path="/addparty-master/:id" element={<AddPartyMaster />} />
            <Route path="/banner" element={<Banner />} />
            <Route path="/userlist" element={<UserRole />} />
            <Route path="/adduser" element={<Addusers />} />
            <Route path="/adduser/:id" element={<Addusers />} />
            <Route path="/financial-year" element={<FinancialYear />} />
          </Route>
        </Route>

        <Route path="*" element={<_404Page />} />
      </Routes>
    </>
  );
}

export default App;
