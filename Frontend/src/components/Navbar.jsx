import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  CircleUser,
  Menu,
  LogOut,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "@/components/ui/use-toast";
import { logout, selectUser } from "@/slices/authSlice";
import { useGetItemsQuery } from "@/slices/itemSlice";
import Navigation from "./navigation";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector(selectUser);
  const { data, isLoading, error, refetch } = useGetItemsQuery();
  const items = data?.items || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    if (error) {
        toast({
            title: "Failed to Load Items",
            description: error?.data?.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
}, [error, toast]);

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsSidebarOpen(false);
    toast({
      title: "Logout Successfully.",
    });
  };

  const handleItemClick = (id) => {
    navigate(`/item/${id}`);
    setSearchQuery("");
    setValue("");
    setIsSidebarOpen(false);
  };

  const handleSelect = (currentValue) => {
    const selectedItem = items.find(item => item.name === currentValue);
    if (selectedItem) {
      handleItemClick(selectedItem._id);
    }
    setValue("");
    setOpen(false);
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle asChild>
              <Link
                to="/menu"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="flex items-center space-x-4">
              <span className='text-2xl font-bold text-gray-500'>
                कुम्भ Connect
              </span>
            </div>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto py-4">
            <Navigation
              mobile
              onNavigate={() => setIsSidebarOpen(false)}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
            />
          </div>
          {userInfo ? (
            <div className="border-t p-4">
              <div className="mb-2 px-2 text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{userInfo.firstName}</span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="border-t p-4 space-y-2">
              <Link to="/accounts/sign-in" onClick={() => setIsSidebarOpen(false)}>
                <Button variant="secondary" className="w-full">Login</Button>
              </Link>
              <Link to="/accounts/sign-up" onClick={() => setIsSidebarOpen(false)}>
                <Button variant="outline" className="w-full">Register</Button>
              </Link>
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      <div className="w-full flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] md:w-[400px] lg:w-[600px] justify-between"
            >
              {value
                ? items.find(item => item.name === value)?.name
                : "Search items..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] md:w-[400px] lg:w-[600px] p-0">
            <Command>
              <CommandInput 
                placeholder="Search items..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No items found.</CommandEmpty>
                <CommandGroup>
                  {items
                    .filter(item => 
                      item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => (
                      <CommandItem
                        key={item._id}
                        value={item.name}
                        onSelect={() => handleSelect(item.name)}
                      >
                        <Check 
                          className={`mr-2 h-4 w-4 ${
                            value === item.name ? "opacity-100" : "opacity-0"
                          }`} 
                        />
                        {item.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {userInfo ? (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Hi, {userInfo.firstName}</p>
                  <p className="text-xs text-muted-foreground">
                    {userInfo.role === "admin" ? "Administrator" : "User"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <Link to="/accounts/sign-in">
                <DropdownMenuItem>Login</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link to="/accounts/sign-up">
                <DropdownMenuItem>Register</DropdownMenuItem>
              </Link>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Navbar;