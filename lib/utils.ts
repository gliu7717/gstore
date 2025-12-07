import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Product } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert prism object to regualar js object
export function convertToPlainObject<T>(value:T ):Product[]{
  return JSON.parse(JSON.stringify(value))
}

// format  number with decimal places
export function formatNumberwithDecimal(num:number):string{
  const [int,decimal] = num.toString().split('.');
  return decimal? `${int}.${decimal.padEnd(2,'0)}')}`:`${int}.00`
}