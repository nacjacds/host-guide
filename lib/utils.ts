import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from "slugify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugifyPropertyName(name: string) {
  return slugify(name, { lower: true, strict: true, locale: "es" })
}

export function blockImageStoragePath(url: string): string | null {
  const marker = "/object/public/block-images/"
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}

export function coverImageStoragePath(url: string): string | null {
  const marker = "/object/public/cover-images/"
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0])
}
