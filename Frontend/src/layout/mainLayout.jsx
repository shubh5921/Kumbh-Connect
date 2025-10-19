import { Link, Outlet, useNavigate } from "react-router-dom";
import { selectUser } from "@/slices/authSlice";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import Navigation from "@/components/navigation";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useSelector(selectUser);
  const path = location.pathname;
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    if (!userInfo && path !== "/" && path!=="/menu") {
      navigate("/accounts/sign-in", { replace: true });
    }

    if (userInfo && userInfo.role !== "admin" && path.includes("/dashboard")) {
      toast({ title: "403 Access Denied." });
      navigate("/", { replace: true });
    }
  }, [navigate, userInfo, path]);

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/menu" className="flex items-center gap-2 font-semibold">
            <span className='text-2xl font-bold text-gray-500'>
                कुम्भ Connect
              </span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            <Navigation
              openMenus={openMenus}
              toggleMenu={toggleMenu}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Toaster />
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}