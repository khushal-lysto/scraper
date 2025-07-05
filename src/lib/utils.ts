import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_ADDRESS || process.env.SUPABASE_ADDRESS;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY || process.env.SUPABASE_API_KEY;

export const supabase = createClient(supabaseUrl!, supabaseKey!);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
