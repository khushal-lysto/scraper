import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_ADDRESS || process.env.SUPABASE_ADDRESS;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY || process.env.SUPABASE_API_KEY;

// Create a mock client if environment variables are not available (for static export)
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: [], error: null }),
      order: () => Promise.resolve({ data: [], error: null })
    })
  } as unknown as ReturnType<typeof createClient>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
