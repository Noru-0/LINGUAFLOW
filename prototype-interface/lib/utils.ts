import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeJsonParse<T = any>(val: any, fallback: T): T {
  if (val === null || val === undefined) {
    return fallback
  }
  if (typeof val === 'object') {
    return val as T
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      return parsed !== null && parsed !== undefined ? (parsed as T) : fallback
    } catch {
      return fallback
    }
  }
  return fallback
}

