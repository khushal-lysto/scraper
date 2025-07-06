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

import { useState, useEffect } from "react";
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
  const columns = data.length > 0 ? Object.keys(data[0]).filter(col => col !== 'batch_id' && col !== 'id' && col !== 'card') : [];

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Tabs defaultValue="Steam" orientation="vertical" className="flex w-full">
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
        <div className="flex-1 flex flex-col min-h-screen ml-[180px]">
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
      </Tabs>
    </div>
  );
}
