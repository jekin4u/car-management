export type AppResponse = {
  status: "success" | "error";
  data: any;
};

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  pin: string;
  created_at: string;
};

export enum CarMaintenanceType {
  OilChange = "oil-change",
  TireRotation = "tire-rotation",
  BrakeCheck = "brake-check",
  GeneralServicing = "general-serving",
  Other = "other",
}

export type Car = {
  id: number;
  name: string;
  image: File | null | undefined;
  image_url: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  odometer_reading: string;
  maintenance_date: Date;
  maintenance_type: string;
  service_provider_name: string;
  service_provider_contact: string;
  parts_replaced: string;
  cost: number;
  next_maintenance_date: Date;
  remarks: string;
  created_at: Date;
  bookings: CarBooking[];
  total_bookings?: { count: number }[];
};

export type CarBooking = {
  id?: number;
  car_id?: number;
  from: Date;
  to: Date;
  description: string;
  summary: string;
  pickup_image: File | null | undefined;
  pickup_image_url: string;
  drop_image: File | null | undefined;
  drop_image_url: string;
};
