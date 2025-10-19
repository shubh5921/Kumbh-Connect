import React from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Tags,
  Users,
  AlertCircle,
  ArrowUpRight,
  UserSearch,
  UserCheck,
  Clock,
  Calendar,
  Store
} from "lucide-react";
import { useGetItemsQuery } from "@/slices/itemSlice";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ItemsListingPage from "./Items/itemsListing";
import { useGetPersonsQuery } from "@/slices/personSlice";

const StatsCard = ({ title, value, secondaryValue, icon: Icon, trend, description }) => (
  <Card className="hover:bg-accent/5 transition-colors">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="flex items-baseline space-x-2">
        <div className="text-2xl font-bold">{value}</div>
        {secondaryValue && (
          <div className="text-sm text-muted-foreground">
            {secondaryValue}
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
      {trend && (
        <div className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </CardContent>
  </Card>
);

const QuickAction = ({ title, description, icon: Icon, to }) => (
  <Link to={to}>
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-primary" />
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

const AdminDashboardPage = () => {
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useGetItemsQuery();
  const { data: peopleData, isLoading: peopleLoading, error: peopleError } = useGetPersonsQuery();

  React.useEffect(() => {
    if (itemsError || peopleError) {
      toast({
        title: "Failed to Load Data",
        description: (itemsError || peopleError)?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [itemsError, peopleError]);

  const items = itemsData?.items || [];
  const people = peopleData?.persons || [];

  const stats = {
    items: {
      total: items.length,
      lost: items.filter(item => item.status === "lost").length,
      found: items.filter(item => item.status === "found").length,
      returned: items.filter(item => item.returnedToOwner).length,
    },
    people: {
      total: people.length,
      missing: people.filter(person => person.status === "lost").length,
      found: people.filter(person => person.status === "found").length,
      resolved: people.filter(person => person.returnedToGuardian).length,
      recent: people.filter(person => {
        const reportDate = new Date(person.dateReported);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return reportDate >= thirtyDaysAgo;
      }).length,
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of items and people reports
          </p>
        </div>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items">Items Overview</TabsTrigger>
            <TabsTrigger value="people">People Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard 
                title="Total Items" 
                value={stats.items.total} 
                icon={Package}
                trend={12}
              />
              <StatsCard 
                title="Lost Items" 
                value={stats.items.lost} 
                icon={AlertCircle}
                trend={-8}
              />
              <StatsCard 
                title="Found Items" 
                value={stats.items.found} 
                icon={Package}
                trend={24}
              />
              <StatsCard 
                title="Returned Items" 
                value={stats.items.returned} 
                icon={Users}
                trend={18}
              />
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard 
                title="Missing People" 
                value={stats.people.missing}
                secondaryValue="Active Cases"
                icon={UserSearch}
                trend={-5}
              />
              <StatsCard 
                title="Found People" 
                value={stats.people.found}
                description="Successfully located individuals"
                icon={UserCheck}
                trend={15}
              />
              <StatsCard 
                title="Recent Reports" 
                value={stats.people.recent}
                description="Last 30 days"
                icon={Clock}
              />
              <StatsCard 
                title="Total Cases" 
                value={stats.people.total}
                secondaryValue={`${stats.people.resolved} resolved`}
                icon={Calendar}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Report Missing Person"
            description="File a new missing person report"
            icon={UserSearch}
            to="/report/person"
          />
          <QuickAction
            title="Report Found Person"
            description="Report a found individual"
            icon={UserCheck}
            to="/dashboard/report/found-person"
          />
          <QuickAction
            title="Manage Categories"
            description="Create and manage item categories"
            icon={Tags}
            to="/dashboard/category/add-new"
          />
          <QuickAction
            title="Center Management"
            description="Add new Center"
            icon={Store}
            to="/dashboard/store/add-new"
          />
          <QuickAction
            title="Claims Management"
            description="Review and process item claims"
            icon={LayoutDashboard}
            to="/dashboard/claims"
          />
          <QuickAction
            title="Case Management"
            description="Manage missing person cases"
            icon={LayoutDashboard}
            to="/dashboard/people"
          />
        </div>

        <ItemsListingPage />
      </div>
    </div>
  );
};

export default AdminDashboardPage;