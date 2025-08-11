import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('£', '£')
}

export function formatBedrooms(bedrooms: number): string {
  if (bedrooms === 0) return 'Studio'
  if (bedrooms === 1) return '1 Bedroom'
  return `${bedrooms} Bedrooms`
}

export function formatBathrooms(bathrooms: number): string {
  if (bathrooms === 1) return '1 Bathroom'
  return `${bathrooms} Bathrooms`
}
