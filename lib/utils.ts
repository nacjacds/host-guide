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

export function avatarStoragePath(url: string): string | null {
  const marker = "/object/public/avatars/"
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0])
}

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  const initials = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[1][0]
  return initials.toUpperCase()
}

export function isActiveNavLink(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}
