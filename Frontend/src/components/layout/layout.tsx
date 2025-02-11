import ArticleSearch from "../pages/ArticleSearch/ArticleSearch";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      {/*<!-- ===== Main Wrapper starts here ===== -->*/}
      {/* changed from relative to fixed */}
      <div className="relative main-container flex">
        {/*<!-- ===== Page Wrapper starts here ===== -->*/}
        <div className="flex min-h-screen w-full ">
          {/* <!-- ===== Sidebar starts here ===== --> */}
          <Sidebar />
          {/* <!-- ===== Sidebar ends here ===== --> */}

          {/* <!-- ===== Content starts here ===== --> */}
          <div className="flex flex-1 flex-col w-full max-w-screen border">
            {/* <!-- Header starts here --> */}
            <Header />
            {/* <!-- Header ends here --> */}

            {/* <!-- ===== Main Content starts here */}
            <main className="md:ml-[220px] lg:ml-[240px] z-20 mt-20">
              {/* <!-- Article Search starts here --> */}
              <ArticleSearch />
              {/* <!-- Article Search ends here --> */}
              <div className="mx-auto max-w-screen-2xl border-none  p-0 md:p-0 2xl:p-0">
                <Outlet />
              </div>
            </main>
            {/* <!-- ===== Main Content ends here */}
          </div>
          {/* <!-- ===== Content ends here ===== --> */}
        </div>

        {/*<!-- ===== Page Wrapper ends here ===== -->*/}
      </div>
      {/*<!-- ===== Main Wrapper ends here ===== -->*/}
    </>
  );
};

export default Layout;
