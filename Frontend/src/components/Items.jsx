import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListFilter, MoreHorizontal } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ItemsTable = ({ items, onDeleteItem }) => {
    const [filters, setFilters] = useState({
        found: true,
        lost: true,
        returned: true,
    });
    const [timeFilter, setTimeFilter] = useState("month");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilterChange = (filter) => {
        setFilters((prevFilter) => ({
            ...prevFilter,
            [filter]: !prevFilter[filter],
        }));
    };

    const handleTimeFilterChange = (value) => {
        setTimeFilter(value);
    };

    const filterItems = (items, timeFilter, statusFilters) => {
        const now = new Date();

        return items.filter((item) => {
            const dateReported = new Date(item.dateReported);

            const isWithinTime =
                (timeFilter === "week" && differenceInDays(now, dateReported) <= 7) ||
                (timeFilter === "month" && differenceInDays(now, dateReported) <= 30) ||
                (timeFilter === "year" && differenceInDays(now, dateReported) <= 365);
            const matchesStatus =
                (statusFilters.lost && item.status === "lost") ||
                (statusFilters.found && item.status === "found") ||
                (statusFilters.returned && item.status === "returned");
            return isWithinTime && matchesStatus;
        });
    };

    const filteredItems = filterItems(items, timeFilter, filters);

    const confirmDeleteItem = async (itemId) => {
        setIsDeleting(true);
        await onDeleteItem(itemId);
        setIsDeleting(false);
    };

    return (
        <div className="min-h-[60vh] grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
            <Tabs
                defaultValue="month"
                onValueChange={(value) => handleTimeFilterChange(value)}
            >
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="year">Year</TabsTrigger>
                    </TabsList>
                    <div className="ml-auto flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1 text-sm"
                                >
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only">Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    onCheckedChange={() => handleFilterChange("lost")}
                                    checked={filters.lost}
                                >
                                    Lost
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    onCheckedChange={() => handleFilterChange("found")}
                                    checked={filters.found}
                                >
                                    Found
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    onCheckedChange={() =>
                                        handleFilterChange("returned")
                                    }
                                    checked={filters.returned}
                                >
                                    Returned
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <TabsContent value={timeFilter}>
                    <Card>
                        <CardHeader className="px-7">
                            <CardTitle>Items</CardTitle>
                            <CardDescription>
                                Reported Lost/Found Items.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="hidden w-[100px] sm:table-cell">
                                            <span className="">Image</span>
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            ReportedBy
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Category
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Date Reported
                                        </TableHead>
                                        <TableHead>
                                            <span className="sr-only">Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.length > 0 ?
                                        filteredItems.map((item) => (
                                            <TableRow key={item._id}>
                                                <TableCell className="hidden sm:table-cell">
                                                    <img
                                                        className="aspect-square rounded-md object-cover"
                                                        height="64"
                                                        src={item?.images[0]?.url}
                                                        width="64"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{item.status}</Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="font-medium">
                                                        {item.reportedBy.firstName}
                                                    </div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        {item.reportedBy.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {item.category.name}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {new Date(item.dateReported).toDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                aria-haspopup="true"
                                                                size="icon"
                                                                variant="ghost"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Toggle menu
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuGroup>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently delete this item
                                                                                and remove item data from our servers.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                variant="destructive"
                                                                                onClick={() => confirmDeleteItem(item._id)}
                                                                                disabled={isDeleting}
                                                                            >
                                                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </DropdownMenuGroup>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">
                                                    No items found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ItemsTable;