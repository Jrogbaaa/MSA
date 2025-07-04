import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatPhone = (phone: string): string => {
  // UK phone number formatting
  const cleaned = phone.replace(/\D/g, '');
  
  // Mobile numbers (11 digits starting with 07)
  if (cleaned.length === 11 && cleaned.startsWith('07')) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // Landline numbers (11 digits starting with 01 or 02)
  if (cleaned.length === 11 && (cleaned.startsWith('01') || cleaned.startsWith('02'))) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // International format (starting with +44)
  if (cleaned.startsWith('44') && cleaned.length === 13) {
    return `+44 ${cleaned.slice(2, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  return phone;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // UK phone number validation
  const cleaned = phone.replace(/\D/g, '');
  
  // Mobile numbers (11 digits starting with 07)
  if (cleaned.length === 11 && cleaned.startsWith('07')) {
    return true;
  }
  
  // Landline numbers (11 digits starting with 01 or 02)
  if (cleaned.length === 11 && (cleaned.startsWith('01') || cleaned.startsWith('02'))) {
    return true;
  }
  
  // International format (starting with +44)
  if (cleaned.startsWith('44') && cleaned.length === 13) {
    return true;
  }
  
  return false;
};

export const calculateMonthlyPayment = (
  principal: number,
  rate: number,
  years: number
): number => {
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

export function formatBedrooms(bedrooms: number): string {
  if (bedrooms === 0) {
    return 'Studio';
  }
  return `${bedrooms} bed${bedrooms !== 1 ? 's' : ''}`;
}

export function formatBathrooms(bathrooms: number): string {
  return `${bathrooms} bath${bathrooms !== 1 ? 's' : ''}`;
} 