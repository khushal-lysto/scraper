"use client";

import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/utils";

const tabList = [
  { value: "Steam", label: "Steam" },
  { value: "Valorant", label: "Valorant" },
  { value: "Xbox", label: "Xbox" },
  { value: "Nintendo", label: "Nintendo" },
  { value: "PSN", label: "PSN" },
  { value: "iOS", label: "iOS" },
  { value: "Roblox", label: "Roblox" },
  { value: "MOBA Legends", label: "MOBA Legends" },
  { value: "Marvel RIvals", label: "Marvel RIvals" },
  { value: "Crunchyroll", label: "Crunchyroll" },
  { value: "Genshin Impact", label: "Genshin Impact" },
  { value: "Honkai Starrail", label: "Honkai Starrail" },
];





export default function Home() {
  const [data, setData] = useState<Record<string, string | number | boolean>[]>([]);
  const [loading, setLoading] = useState(true);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>("");

  // Filter state
  const [sellerFilter, setSellerFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [amountFilters, setAmountFilters] = useState<Record<string, string>>({});
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Unique sellers, sources, and amounts for dropdowns
  const uniqueSellers = useMemo(() => Array.from(new Set(data.map(row => typeof row.seller === 'string' ? row.seller : undefined))).filter((v): v is string => typeof v === 'string' && !!v), [data]);
  const uniqueSources = useMemo(() => Array.from(new Set(data.map(row => typeof row.source === 'string' ? row.source : undefined))).filter((v): v is string => typeof v === 'string' && !!v), [data]);
  const uniqueAmountsByTab = useMemo(() => {
    const result: Record<string, number[]> = {};
    tabList.forEach(tab => {
      result[tab.value] = Array.from(new Set(
        data.filter(row => row.card === tab.value)
          .map(row => typeof row.amount === 'number' || typeof row.amount === 'string' ? Number(row.amount) : undefined)
      ))
        .filter((v): v is number => typeof v === 'number' && !isNaN(v))
        .sort((a, b) => a - b);
    });
    return result;
  }, [data]);

  useEffect(() => {
    async function fetchTimestamps() {
      try {
        const { data: timestampData, error } = await supabase
          .from('gift-cards')
          .select('batch_id')
          .order('batch_id', { ascending: false });

        if (!error && timestampData && timestampData.length > 0) {
          const uniqueTimestamps = [...new Set(timestampData.map((row: Record<string, unknown>) => row.batch_id as string))] as string[];
          setTimestamps(uniqueTimestamps);
          setSelectedTimestamp(uniqueTimestamps[0]); // Set to latest timestamp
        } else {
          console.warn('No timestamp data available or error occurred:', error);
        }
      } catch (err) {
        console.warn('Failed to fetch timestamps:', err);
      }
    }
    fetchTimestamps();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!selectedTimestamp) return;

      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from('gift-cards')
          .select('*')
          .eq('batch_id', selectedTimestamp);

        if (error) {
          console.error('Error fetching data:', error);
          setData([]);
        } else {
          setData(rows || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setData([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedTimestamp]);

  // Remove batch_id, id, and card columns
  let columns = data.length > 0 ? Object.keys(data[0]).filter(col => col !== 'batch_id' && col !== 'id' && col !== 'card') : [];
  // Reorder columns: seller, retail-price, discounted-price, amount, ...rest
  if (columns.length > 0) {
    const desiredOrder = [
      'seller',
      'retail-price',
      'discounted-price',
      'amount',
      'availability',
      'source',
    ];
    columns = [
      ...desiredOrder.filter(col => columns.includes(col)),
      ...columns.filter(col => !desiredOrder.includes(col)),
    ];
  }

  // Track the selected tab for the filters panel
  const [selectedTab, setSelectedTab] = useState(tabList[0].value);
  // Update selectedTab when the user changes tabs
  // (TabsTrigger sets value, so we can listen for that)
  // Pass value and onValueChange to Tabs

  // Function to remove duplicate entries
  const removeDuplicates = (rows: Record<string, string | number | boolean>[]) => {
    const seen = new Set<string>();
    return rows.filter(row => {
      // Create a unique key based on seller, amount, retail-price, and discounted-price
      const key = `${row.seller}-${row.amount}-${row['retail-price']}-${row['discounted-price']}`;
      if (seen.has(key)) {
        return false; // This is a duplicate
      }
      seen.add(key);
      return true; // This is unique
    });
  };

  // Function to handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, set it as sort column with ascending direction
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Function to get sort icon
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return "↕️"; // Default icon for unsorted columns
    }
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} orientation="vertical" className="flex w-full">
        {/* Sidebar Tabs */}
        <div className="h-screen fixed left-0 top-0 z-10 flex flex-col items-center justify-center min-w-[180px] border-r bg-muted px-2 sm:px-4 overflow-y-auto">
          <TabsList className="flex flex-col gap-2 w-full bg-transparent shadow-none">
            {tabList.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="w-full justify-start py-3">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="flex-1 flex flex-row min-h-screen ml-[180px]">
          <div className="flex-1 flex flex-col">
            {/* Heading Bar */}
            <header className="w-full h-16 flex items-center px-8 border-b bg-card sticky top-0 z-20">
              <div className="flex items-center justify-between w-full">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Gift Card Table</h1>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {selectedTimestamp || "Select Date"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {timestamps.map((timestamp) => (
                      <DropdownMenuItem
                        key={timestamp}
                        onClick={() => setSelectedTimestamp(timestamp)}
                      >
                        {timestamp}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 flex flex-col items-start justify-start p-4 sm:p-12">
              <div className="w-full max-w-5xl">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-lg">Loading...</div>
                  </div>
                ) : data.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">No data available</div>
                      <div className="text-sm text-muted-foreground">
                        {timestamps.length === 0
                          ? "Unable to connect to database. Please check your environment variables."
                          : "No data found for the selected timestamp."
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  tabList.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value} className="w-full">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr>
                            {columns.map((col) => (
                              <th
                                key={col}
                                className="border px-4 py-2 bg-gray-100 cursor-pointer hover:bg-gray-200 select-none"
                                onClick={() => handleSort(col)}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{col}</span>
                                  <span className="ml-2 text-sm">{getSortIcon(col)}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {removeDuplicates(
                            data
                              .filter(row => row.card === tab.value)
                              .filter(row => !sellerFilter || row.seller === sellerFilter)
                              .filter(row => !sourceFilter || row.source === sourceFilter)
                              .filter(row => !amountFilters[tab.value] || Number(row.amount) === Number(amountFilters[tab.value]))
                              .filter(row => availabilityFilter === "" || String(row.availability) === availabilityFilter)
                          )
                            .sort((a, b) => {
                              if (!sortColumn) {
                                // Default sorting: seller first, then price
                                if (a.seller < b.seller) return -1;
                                if (a.seller > b.seller) return 1;
                                const priceA = Number(a.price);
                                const priceB = Number(b.price);
                                return priceA - priceB;
                              }

                              // Custom column sorting
                              const aValue = a[sortColumn];
                              const bValue = b[sortColumn];

                              // Handle different data types
                              let comparison = 0;
                              if (typeof aValue === 'number' && typeof bValue === 'number') {
                                comparison = aValue - bValue;
                              } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                                comparison = aValue.localeCompare(bValue);
                              } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                                comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
                              } else {
                                // Convert to string for comparison
                                const aStr = String(aValue || '');
                                const bStr = String(bValue || '');
                                comparison = aStr.localeCompare(bStr);
                              }

                              return sortDirection === 'asc' ? comparison : -comparison;
                            })
                            .map((row, i) => (
                              <tr key={i}>
                                {columns.map((col) => (
                                  <td key={col} className="border px-4 py-2">
                                    {col === 'availability' ? (row[col] ? 'true' : 'false') : String(row[col])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </TabsContent>
                  ))
                )}
              </div>
            </main>
          </div>
          {/* Filters Tab */}
          <aside className="w-72 min-w-[220px] max-w-xs border-l bg-card/80 p-6 flex flex-col gap-6 sticky top-0 h-screen z-20">
            <h2 className="text-lg font-semibold mb-2">Filters</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Seller</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={sellerFilter}
                  onChange={e => setSellerFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueSellers.map(seller => (
                    <option key={seller} value={seller}>{seller}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={amountFilters[selectedTab] || ""}
                  onChange={e => setAmountFilters(f => ({ ...f, [selectedTab]: e.target.value }))}
                >
                  <option value="">All</option>
                  {(uniqueAmountsByTab[selectedTab] || []).map(amount => (
                    <option key={amount} value={amount}>{amount}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Availability</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={availabilityFilter}
                  onChange={e => setAvailabilityFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
              <button
                className="mt-2 px-4 py-2 rounded bg-muted text-foreground border hover:bg-muted/70"
                onClick={() => {
                  setSellerFilter("");
                  setSourceFilter("");
                  setAmountFilters({});
                  setAvailabilityFilter("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </aside>
        </div>
      </Tabs>
    </div>
  );
}
