"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
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
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/utils";

const tabList = [
  { value: "Steam", label: "Steam" },
  { value: "Valorant", label: "Valorant" },
  { value: "iOS", label: "iOS" },
  { value: "PSN", label: "PSN" },
];

const columns = [
  { key: "seller", label: "Seller" },
  { key: "price", label: "Price" },
  { key: "amount", label: "Amount" },
  { key: "availability", label: "Availability" },
];

function SortableTable({ data }) {
  const [sortKey, setSortKey] = useState("seller");
  const [sortDir, setSortDir] = useState("asc");

  const sortedData = [...data].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    // Remove $ for price and convert to number
    if (sortKey === "price") {
      aVal = Number(aVal.replace("$", ""));
      bVal = Number(bVal.replace("$", ""));
    }
    if (sortKey === "amount") {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <Table>
      <TableCaption>Gift Card Analytics</TableCaption>
      <TableHeader>
        <TableRow className="bg-muted/70">
          {columns.map((col) => (
            <TableHead key={col.key} className="bg-transparent select-none">
              <button
                className="font-medium text-foreground/90 hover:text-primary transition-colors w-full text-left"
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortKey === col.key ? (
                  sortDir === "asc" ? (
                    <ChevronUpIcon className="ml-1 w-4 h-4 inline" />
                  ) : (
                    <ChevronDownIcon className="ml-1 w-4 h-4 inline" />
                  )
                ) : null}
              </button>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row, i) => (
          <TableRow key={i}>
            <TableCell className="font-bold text-primary bg-primary/10 dark:bg-primary/20">
              {row.seller}
            </TableCell>
            <TableCell>{row.price}</TableCell>
            <TableCell>{row.amount}</TableCell>
            <TableCell>{row.availability}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>("");

  useEffect(() => {
    async function fetchTimestamps() {
      const { data: timestampData, error } = await supabase
        .from('gift-cards')
        .select('batch_id')
        .order('batch_id', { ascending: false });

      if (!error && timestampData && timestampData.length > 0) {
        const uniqueTimestamps = [...new Set(timestampData.map(row => row.batch_id))];
        setTimestamps(uniqueTimestamps);
        setSelectedTimestamp(uniqueTimestamps[0]); // Set to latest timestamp
      }
    }
    fetchTimestamps();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!selectedTimestamp) return;

      setLoading(true);
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
                <div>Loading...</div>
              ) : (
                tabList.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="w-full">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          {columns.map((col: string) => (
                            <th key={col} className="border px-4 py-2 bg-gray-100">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(data as any[])
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
                              {columns.map((col: string) => (
                                <td key={col} className="border px-4 py-2">
                                  {col === 'availability' ? (row[col] ? 'true' : 'false') : row[col]}
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
