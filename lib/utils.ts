import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from "slugify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugifyPropertyName(name: string) {
  return slugify(name, { lower: true, strict: true, locale: "es" })
}
