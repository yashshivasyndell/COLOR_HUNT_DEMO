import {
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { ModeToggle } from "../pages/mode-switcher";
import CustomToast from "../../showToast";
import { logout } from "../../api";
import { apiResponse } from "../../types/types";
import { useDispatch } from "react-redux";
import { userLogout } from "../../app/features/authSlice";


const MasterLinks = [
  {
    to: "/products",
    // icon: <Box className="h-5 w-5" />,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-package"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /><path d="M12 12l8 -4.5" /><path d="M12 12l0 9" /><path d="M12 12l-8 -4.5" /><path d="M16 5.25l-8 4.5" /></svg>,
    text: "Products",
  },
  {
    to: "/party",
    // icon: <Handshake className="h-5 w-5" />,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-empathize"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" /><path d="M12 21.368l5.095 -5.096a3.088 3.088 0 1 0 -4.367 -4.367l-.728 .727l-.728 -.727a3.088 3.088 0 1 0 -4.367 4.367l5.095 5.096z" /></svg>,
    text: "Party",
  },
];

const MainLinks = [
  {
    to: "/dashboard",
    // icon: <Gauge className="h-5 w-5" />,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-dashboard"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M13.45 11.55l2.05 -2.05" /><path d="M6.4 20a9 9 0 1 1 11.2 0z" /></svg>,
    text: "Dashboard",
  },
  {
    to: "/purchase",
    // icon: <NotebookIcon className="h-5 w-5" />,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-shopping-bag-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12.5 21h-3.926a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304h11.339a2 2 0 0 1 1.977 2.304l-.263 1.708" /><path d="M16 19h6" /><path d="M19 16v6" /><path d="M9 11v-5a3 3 0 0 1 6 0v5" /></svg>,
    text: "Purchase",
  },
  {
    to: "/sales",
    // icon: <BadgeIndianRupee className="h-5 w-5" />,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-basket-dollar"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 10l-2 -6" /><path d="M7 10l2 -6" /><path d="M13 20h-5.756a3 3 0 0 1 -2.965 -2.544l-1.255 -7.152a2 2 0 0 1 1.977 -2.304h13.999a2 2 0 0 1 1.977 2.304" /><path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" /><path d="M19 21v1m0 -8v1" /></svg>,
    text: "Sales",
  },
];
function Header() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    const response: apiResponse = await logout();
    if (response?.statusCode === 200) {
      CustomToast(response?.statusCode, response?.message);
      dispatch(userLogout());
    } else {
      CustomToast(500, "Something went wrong!");
    }
  };
  return (
    <>
      <header className="fixed md:ml-[220px] lg:ml-[240px]  z-40 top-0 left-0 right-0 shadow-card w-full block bg-background">
        <div className="h-14 lg:h-[61px] flex items-center justify-between px-4 ">
          {/* <!-- ===== Sidebar starts here ===== --> */}
          <div className="cursor-pointer block md:hidden p-2 rounded-md">
            <Sheet>
              <SheetTrigger className="md:hidden block w-full" asChild>
                <Menu />
              </SheetTrigger>
              <SheetTitle className="hidden">Sidebar</SheetTitle>
              <div className="flex h-full max-h-screen flex-col gap-2 overflow-y-scroll bg-muted/40">
                <SheetContent side={"left"} className="max-w-[240px] pt-14">
                  <div className="flex h-14 items-center px-4 mb-5 lg:h-[60px] lg:px-6">
                    <div className="flex justify-center items-center gap-2 font-semibold">
                      <div className="logo w-8 flex items-center justify-center">
                        <img className="rounded-full" src={Logo} alt="logo" />
                      </div>
                      <span className="">Company Name</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <nav className="relative h-[100%] flex flex-col justify-between px-2 gap-3 text-sm font-medium">
                      <>
                        <div>
                          <div className="flex flex-col gap-2 mb-5">
                            General
                            {MainLinks.map((link) => (
                              <NavLink
                                key={link?.to}
                                to={link?.to}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 rounded-lg px-3 py-2 text-md text-link transition-all ${isActive
                                    ? "bg-linkhover font-bold text-secondary"
                                    : "hover:bg-linkhover hover:text-secondary"
                                  }`
                                }
                              >
                                {link.icon}
                                {link.text}
                              </NavLink>
                            ))}
                          </div>

                          <div className="flex flex-col gap-2 mb-5">
                            {/* Master Links */}
                            Master
                            {MasterLinks.map((link) => (
                              <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 rounded-lg px-3 py-2 text-md text-link transition-all ${isActive
                                    ? "bg-linkhover font-bold text-secondary"
                                    : "hover:bg-linkhover hover:text-secondary"
                                  }`
                                }
                              >
                                {link.icon}
                                {link.text}
                              </NavLink>
                            ))}
                          </div>
                        </div>

                        <div
                          className="p-3 flex flex-row justify-start hover:bg-secondary hover:text-primary gap-3 border bg-accent-foreground text-accent rounded-md mb-3 items-center cursor-pointer "
                          onClick={handleLogout}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-logout-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" /><path d="M15 12h-12l3 -3" /><path d="M6 15l-3 -3" /></svg>
                          <p>Logout</p>
                        </div>
                      </>
                    </nav>
                  </div>
                </SheetContent>
              </div>
            </Sheet>
          </div>
          {/* <!-- ===== Sidebar ends here ===== --> */}

          {/* <!-- ===== Theme Toggle ===== --> */}
          <div className="flex items-center justify-between gap-3">
            <ModeToggle />
          </div>
          {/* <!-- ===== Theme Toggle ===== --> */}
        </div>
      </header>
    </>
  );
}

export default Header;
