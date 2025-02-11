import Logo from "../../assets/logo.png";
import { NavLink } from "react-router-dom";
import { logout } from "../../api";
import CustomToast from "../../showToast";
import { useDispatch } from "react-redux";
import { userLogout } from "../../app/features/authSlice";
import { apiError } from "../../types/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface Link {
  to: string;
  icon: any;
  text: string;
  submenu?: boolean;
  submenuItems?: Link[];
}

const MasterLinks: Link[] = [
  {
    to: "/category",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-vocabulary"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M10 19h-6a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1h6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2z" />
        <path d="M12 5v16" />
        <path d="M7 7h1" />
        <path d="M7 11h1" />
        <path d="M16 7h1" />
        <path d="M16 11h1" />
        <path d="M16 15h1" />
      </svg>
    ),
    text: "Category",
  },
  {
    to: "/subcategory",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-vocabulary"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M10 19h-6a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1h6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2z" />
        <path d="M12 5v16" />
        <path d="M7 7h1" />
        <path d="M7 11h1" />
        <path d="M16 7h1" />
        <path d="M16 11h1" />
        <path d="M16 15h1" />
      </svg>
    ),
    text: "Subcategory",
  },
  {
    to: "/rangeseries",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-file-description"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
        <path d="M9 17h6" />
        <path d="M9 13h6" />
      </svg>
    ),
    text: "Rangeseries",
  },
  {
    to: "/workorder",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-stack-back"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 8l8 4l8 -4l-8 -4z" />
        <path d="M12 16l-4 -2l-4 2l8 4l8 -4l-4 -2l-4 2z" fill="currentColor" />
        <path d="M8 10l-4 2l4 2m8 0l4 -2l-4 -2" />
      </svg>
    ),
    text: "Work Order",
  },
  {
    to: "/articlecolor",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-palette"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25" />
        <path d="M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      </svg>
    ),
    text: "Article Color",
  },
  {
    to: "/articlesize",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-border-outer"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
        <path d="M12 8l0 .01" />
        <path d="M8 12l0 .01" />
        <path d="M12 12l0 .01" />
        <path d="M16 12l0 .01" />
        <path d="M12 16l0 .01" />
      </svg>
    ),
    text: "Article Size",
  },
  {
    to: "/vendor",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-user"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
    text: "Vendor",
  },
  {
    to: "/brand",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-badge-tm"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
        <path d="M6 9h4" />
        <path d="M8 9v6" />
        <path d="M13 15v-6l2 3l2 -3v6" />
      </svg>
    ),
    text: "Brand",
  },
  {
    to: "/party-master",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-users"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
      </svg>
    ),
    text: "Party Master",
  },
  {
    to: "/banner",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-flag-2"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 14h14v-9h-14v16" />
      </svg>
    ),
    text: "Banner",
  },
  {
    to: "/userrole",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-user-check"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
        <path d="M15 19l2 2l4 -4" />
      </svg>
    ),
    text: "User Role",
  },
  {
    to: "/financial-year",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-report-money"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
        <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
        <path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
        <path d="M12 17v1m0 -8v1" />
      </svg>
    ),
    text: "Financial Year",
  },
];

const MainLinks: Link[] = [
  {
    to: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-dashboard"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M13.45 11.55l2.05 -2.05" />
        <path d="M6.4 20a9 9 0 1 1 11.2 0z" />
      </svg>
    ),
    text: "Dashboard",
  },
  {
    to: "/userlist",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-users-group"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
        <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
        <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
        <path d="M17 10h2a2 2 0 0 1 2 2v1" />
        <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
        <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
      </svg>
    ),
    text: "User Management",
  },
  {
    to: "/assign-rights",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-user-shield"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h2" />
        <path d="M22 16c0 4 -2.5 6 -3.5 6s-3.5 -2 -3.5 -6c1 0 2.5 -.5 3.5 -1.5c1 1 2.5 1.5 3.5 1.5z" />
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
      </svg>
    ),
    text: "Assign Rights",
  },
  {
    to: "/article",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-dual-screen"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 4l8 3v15l-8 -3z" />
        <path d="M13 19h6v-15h-14" />
      </svg>
    ),
    text: "Article",
  },
  {
    to: "/purchase",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M17 17h-11v-14h-2" />
        <path d="M6 5l14 1l-1 7h-13" />
      </svg>
    ),
    text: "PO",
  },
  {
    to: "/inward",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-pin-end"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M21 11v-5a1 1 0 0 0 -1 -1h-16a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9" />
        <path d="M19 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M10 13v-4h4" />
        <path d="M14 13l-4 -4" />
      </svg>
    ),
    text: "Inward",
  },

  {
    to: "/sales",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-basket-dollar"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M17 10l-2 -6" />
        <path d="M7 10l2 -6" />
        <path d="M13 20h-5.756a3 3 0 0 1 -2.965 -2.544l-1.255 -7.152a2 2 0 0 1 1.977 -2.304h13.999a2 2 0 0 1 1.977 2.304" />
        <path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
        <path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
        <path d="M19 21v1m0 -8v1" />
      </svg>
    ),
    text: "Sales",
  },
  {
    to: "/quanlity-management",
    icon: (
      <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-checkbox"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 11l3 3l8 -8" /><path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" /></svg>
    ),
    text: "Quantity Management",
    submenu: true,
    submenuItems: [
      { to: "/approve-article", icon: (<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>), text: "Approve Article" },
      { to: "/hold-article", icon: (<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-player-pause"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /></svg>), text: "Hold Article" },
      { to: "/rejected-article", icon: (<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>), text: "Rejected Article" },
    ],
  },
];

export default function Sidebar() {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.statusCode === 200) {
        CustomToast(response.statusCode, response.message);
        dispatch(userLogout());
      }
    } catch (error) {
      const apiError = error as apiError;
      if (apiError.statusCode !== 200) {
        CustomToast(500, "Something went wrong");
      }
    }
  };

  return (
    <>
      <div className="fixed grid min-h-screen  w-full md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
        <div className="relative hidden  bg-background md:block ">
          <div className="relative flex h-full max-h-screen flex-col gap-2">
            {/* <!-- ===== Sideebar header starts here ===== --> */}
            <div className="flex h-14 justify-center items-center lg:h-[60px]  fixed  md:w-[220px] lg:w-[240px] bg-primary-foreground z-10">
              <div className="flex justify-center items-center gap-2 font-semibold">
                <div className="logo w-8 flex items-center justify-center">
                  <img className="rounded-full" src={Logo} alt="logo" />
                </div>
                <span className="">Company Name</span>
              </div>
            </div>
            {/* <!-- ===== Sideebar header ends here ===== --> */}

            {/* <!-- ===== Sidebar Links starts here ===== --> */}
            <div className="flex-1 mt-[60px] overflow-y-scroll">
              <nav className="relative h-[100%] flex flex-col justify-between px-2 gap-3 text-sm font-medium">
                <>
                  <div>
                    <div className="flex flex-col gap-2 mb-5">
                      General
                      {MainLinks.map((link) => {
                        if (link.submenu) {
                          return (
                            <div className="w-full">
                              <Accordion
                                defaultValue="item-1"
                                type="single"
                                collapsible={true}
                                className="w-full items-center gap-3  text-md transition-all hover:no-underline"
                              >
                                <AccordionItem
                                  value="item-1"
                                  className="border-none"
                                >
                                  <AccordionTrigger
                                    className={`flex hover:decoration-none items-center gap-3 rounded-lg px-3 py-2 text-md transition-all
                                    ${
                                      location.pathname.includes(link.to)
                                        ? "bg-linkhover font-bold text-secondary"
                                        : "hover:bg-linkhover hover:text-secondary"
                                    }`}
                                  >
                                    <span className="gap-3 p-0 flex items-center justify-between">
                                      {link.icon}
                                      {link.text}
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent className="p-1 flex flex-col ">
                                    {link?.submenuItems?.map((link) => (
                                      <NavLink
                                        to={link.to}
                                        id={link.to}
                                        className={({ isActive }) =>
                                          `flex items-center gap-3 rounded-lg px-3 py-2 text-md text-link transition-all ${
                                            isActive
                                              ? "bg-linkhover font-bold text-secondary"
                                              : "hover:bg-linkhover hover:text-secondary"
                                          }`
                                        }
                                      >
                                        <div className="stroke-red-400 text-sm">
                                          {link.icon}
                                        </div>
                                        <span className="text-sm">
                                          {link.text}
                                        </span>
                                      </NavLink>
                                    ))}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          );
                        } else {
                          return (
                            <NavLink
                              key={link?.to}
                              to={link?.to}
                              className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2 text-md text-link transition-all ${
                                  isActive
                                    ? "bg-linkhover font-bold text-secondary"
                                    : "hover:bg-linkhover hover:text-secondary"
                                }`
                              }
                            >
                              {link.icon}
                              {link.text}
                            </NavLink>
                          );
                        }
                      })}
                      {/* {MainLinks.map((link) => (
                        <NavLink
                          key={link?.to}
                          to={link?.to}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2 text-md text-link transition-all ${
                              isActive
                                ? "bg-linkhover font-bold text-secondary"
                                : "hover:bg-linkhover hover:text-secondary"
                            }`
                          }
                        >
                          {link.icon}
                          {link.text}
                        </NavLink>
                      ))} */}
                    </div>

                    <div className="flex flex-col gap-2 mb-5">
                      {/* Master Links */}
                      Master

                      {MasterLinks.map((link) => {
                        if (link.submenu) {
                          return (
                            <div className="w-full">
                              <Accordion
                                defaultValue="item-1"
                                type="single"
                                collapsible={true}
                                className="w-full items-center gap-3  text-md transition-all hover:no-underline"
                              >
                                <AccordionItem
                                  value="item-1"
                                  className="border-none"
                                >
                                  <AccordionTrigger
                                    className={`flex hover:decoration-none items-center gap-3 rounded-lg px-3 py-2 text-md transition-all
                                    ${
                                      location.pathname.includes(link.to)
                                        ? "bg-linkhover font-bold text-secondary"
                                        : "hover:bg-linkhover hover:text-secondary"
                                    }`}
                                  >
                                    <span className="gap-3 p-0 flex items-center justify-between">
                                      {link.icon}
                                      {link.text}
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent className="p-1 flex flex-col ">
                                    {link?.submenuItems?.map((link) => (
                                      <NavLink
                                        to={link.to}
                                        id={link.to}
                                        className={({ isActive }) =>
                                          `flex items-center gap-3 rounded-lg px-3 py-2 text-md text-link transition-all ${
                                            isActive
                                              ? "bg-linkhover font-bold text-secondary"
                                              : "hover:bg-linkhover hover:text-secondary"
                                          }`
                                        }
                                      >
                                        <div className="stroke-red-400 text-sm">
                                          {link.icon}
                                        </div>
                                        <span className="text-sm">
                                          {link.text}
                                        </span>
                                      </NavLink>
                                    ))}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          );
                        } else {
                          return (
                            <NavLink
                              key={link?.to}
                              to={link?.to}
                              className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2 text-md text-link transition-all ${
                                  isActive
                                    ? "bg-linkhover font-bold text-secondary"
                                    : "hover:bg-linkhover hover:text-secondary"
                                }`
                              }
                            >
                              {link.icon}
                              {link.text}
                            </NavLink>
                          );
                        }
                      })}
                      {/* {MasterLinks.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2 text-md text-link transition-all ${
                              isActive
                                ? "bg-linkhover font-bold text-secondary"
                                : "hover:bg-linkhover hover:text-secondary"
                            }`
                          }
                        >
                          {link.icon}
                          {link.text}
                        </NavLink>
                      ))} */}
                    </div>
                  </div>

                  <div
                    className="p-3 flex flex-row justify-start hover:bg-secondary hover:text-primary gap-3 border bg-accent-foreground text-accent rounded-md mb-3 items-center cursor-pointer "
                    onClick={handleLogout}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-logout-2"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" />
                      <path d="M15 12h-12l3 -3" />
                      <path d="M6 15l-3 -3" />
                    </svg>
                    <p>Logout</p>
                  </div>
                </>
              </nav>
            </div>
            {/* <!-- ===== Sidebar Links end here ===== --> */}
          </div>
        </div>
      </div>
    </>
  );
}
