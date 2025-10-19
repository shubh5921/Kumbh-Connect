import {
  Box,
    ChevronDown,
    ChevronRight,
    Home,
    LineChart,
    User2,
    UserIcon,
    UserPen,
  } from "lucide-react";
  import {  useNavigate } from "react-router-dom";
  import {  selectUser } from "@/slices/authSlice";
  import {  useSelector } from "react-redux";
  import { useLocation } from "react-router-dom";
  import { navItems } from "@/constants/data";
  import { cn } from "@/lib/utils";

  export default function Navigation ({ mobile = false, onNavigate, openMenus, toggleMenu }) {
    const location = useLocation();
    const navigate = useNavigate();
    const userInfo = useSelector(selectUser);
    const path = location.pathname;
  
    const handleItemClick = (url) => {
      navigate(url);
      if (onNavigate) onNavigate();
    };
  
    const renderNavItems = () => {
      return navItems
        .filter((item) => {
          if (item.authRequired && !userInfo) return false;
          if (item.role && userInfo?.role !== item.role) return false;
          return true;
        })
        .map((item, index) => (
          <div key={index} className="relative">
            <div
              className={cn(
                "flex items-center gap-4 rounded-lg px-3 py-2",
                "cursor-pointer transition-colors duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                path === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                item.items?.length > 0 && openMenus[index] && "bg-accent/50"
              )}
              onClick={() => {
                if (item.items && item.items.length > 0) {
                  toggleMenu(index);
                } else if (item.url) {
                  handleItemClick(item.url);
                }
              }}
            >
              <span className="flex items-center gap-4">
                {getIcon(item.icon)}
                <span>{item.title}</span>
              </span>
              {item.items && item.items.length > 0 && (
                <span className="ml-auto">
                  {openMenus[index] ? (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                  )}
                </span>
              )}
            </div>
            {item.items && item.items.length > 0 && openMenus[index] && (
              <div className="ml-4 mt-1 space-y-1 border-l pl-4">
                {item.items
                  .filter((subItem) => {
                    if (userInfo && (subItem.title === "Login" || subItem.title === "Register")) {
                      return false;
                    }
                    if (subItem.authRequired && !userInfo) return false;
                    return true;
                  })
                  .map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2",
                        "cursor-pointer transition-colors duration-200",
                        "hover:bg-accent hover:text-accent-foreground",
                        path === subItem.url ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => {
                        if (subItem.url) {
                          handleItemClick(subItem.url);
                        }
                      }}
                    >
                      {subItem.title}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ));
    };
  
    return (
      <nav className={cn(
        "grid items-start gap-1 px-2 text-sm font-medium",
        !mobile && "lg:px-4"
      )}>
        {renderNavItems()}
      </nav>
    );
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "dashboard":
        return <LineChart className="h-4 w-4" />;
      case "user":
        return <User2 className="h-4 w-4" />;
      case "userPen":
        return <UserPen className="h-4 w-4" />;
      case "store":
        return <Box className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };