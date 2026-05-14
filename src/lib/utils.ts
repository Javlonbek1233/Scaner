import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  dailyWaterGoal: number;
  dailySleepGoal: number;
  createdAt: any;
}

export interface HealthLog {
  id?: string;
  userId: string;
  type: "sleep" | "water" | "activity" | "mood";
  value: number;
  unit: string;
  notes?: string;
  timestamp: any;
}

export interface Habit {
  id?: string;
  userId: string;
  title: string;
  completed: boolean;
  currentStreak: number;
  lastCompleted?: any;
}
