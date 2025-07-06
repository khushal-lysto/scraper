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
  { value: "iOS", label: "iOS" },
  { value: "PSN", label: "PSN" },
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

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} orientation="vertical" className="flex w-full">
        {/* Sidebar Tabs */}
        <div className="h-screen fixed left-0 top-0 z-10 flex flex-col items-center justify-start min-w-[180px] border-r bg-muted pt-20 px-2 sm:px-4">
          <TabsList className="flex flex-col gap-2 w-full bg-transparent shadow-none">
            {tabList.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="w-full justify-start">
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
                              <th key={col} className="border px-4 py-2 bg-gray-100">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data
                            .filter(row => row.card === tab.value)
                            .filter(row => !sellerFilter || row.seller === sellerFilter)
                            .filter(row => !sourceFilter || row.source === sourceFilter)
                            .filter(row => !amountFilters[tab.value] || Number(row.amount) === Number(amountFilters[tab.value]))
                            .sort((a, b) => {
                              if (a.seller < b.seller) return -1;
                              if (a.seller > b.seller) return 1;
                              // If seller is the same, sort by price (as number)
                              const priceA = Number(a.price);
                              const priceB = Number(b.price);
                              return priceA - priceB;
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
              <button
                className="mt-2 px-4 py-2 rounded bg-muted text-foreground border hover:bg-muted/70"
                onClick={() => {
                  setSellerFilter("");
                  setSourceFilter("");
                  setAmountFilters({});
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
