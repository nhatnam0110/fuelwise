import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
