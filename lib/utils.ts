import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CarMaintenanceType } from "./models";

export const MAX_FILE_SIZE = 5000000;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function BeautifyCarMaintenanceType(type: CarMaintenanceType) {
  return type
    .toString()
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function CheckFileForImage(file: File) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (!fileType) return false;

    if (["png", "jpg", "jpeg"].includes(fileType)) return true;
  }
  return false;
}

export function GetDatesInRange(from: Date, to: Date) {
  const dateArray: Date[] = [];
  const startDate = new Date(from);
  const stopDate = new Date(to);
  let currentDate = startDate;

  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));

    const newDate = new Date(currentDate.valueOf());
    newDate.setDate(newDate.getDate() + 1);
    currentDate = newDate;
  }
  return dateArray;
}

export function CheckDateInRange(date: Date, from: Date, to: Date) {
  const startDate = new Date(from);
  const stopDate = new Date(to);

  return (
    date.getTime() >= startDate.getTime() &&
    date.getTime() <= stopDate.getTime()
  );
}
