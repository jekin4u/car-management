"use server";

import { createClient } from "@/lib/superbase/client";
import { AppResponse, Car } from "@/lib/models";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

const superbase = createClient();

export async function GetAllCars(): Promise<Car[]> {
  try {
    const { data } = await superbase
      .from("cm-cars")
      .select(`*, total_bookings:"cm-car-bookings"(count)`);

    if (!data || data.length == 0) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function GetCarByID(id: number): Promise<Car | null> {
  try {
    const { data } = await superbase
      .from("cm-cars")
      .select(`*, total_bookings:"cm-car-bookings"(count)`)
      .eq("id", id);

    if (!data || data.length == 0) {
      return null;
    }

    return data[0];
  } catch {
    return null;
  }
}

export async function InsertCar(car: Partial<Car>): Promise<AppResponse> {
  try {
    let image_url = "";

    if (car.image) {
      const { data, error } = await superbase.storage
        .from("cm-images")
        .upload(`public/car-${randomUUID()}.png`, car.image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!error && data) {
        const { data: publicData } = superbase.storage
          .from("cm-images")
          .getPublicUrl(data.path);

        image_url = publicData.publicUrl;
      }
    }

    delete car.image;
    delete car.id;

    const { error } = await superbase
      .from("cm-cars")
      .insert({ ...car, image_url });

    if (error) {
      return { status: "error", data: "Server error. Try again." };
    }

    revalidatePath("/cars");
    return { status: "success", data: "Successfully added car." };
  } catch {
    return { status: "error", data: "Server error. Try again." };
  }
}

export async function UpdateCar(car: Partial<Car>): Promise<AppResponse> {
  try {
    let image_url = car?.image_url || "";
    const car_id = car.id;

    if (car.image) {
      const { data, error } = await superbase.storage
        .from("cm-images")
        .upload(`public/car-${randomUUID()}.png`, car.image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!error && data) {
        const { data: publicData } = superbase.storage
          .from("cm-images")
          .getPublicUrl(data.path);

        image_url = publicData.publicUrl;
      }
    }

    delete car.image;
    delete car.id;

    const { error } = await superbase
      .from("cm-cars")
      .update({ ...car, image_url })
      .eq("id", car_id);

    if (error) {
      return { status: "error", data: "Server error. Try again." };
    }

    revalidatePath("/cars");
    return { status: "success", data: "Successfully updated car." };
  } catch {
    return { status: "error", data: "Server error. Try again." };
  }
}

export async function DeleteCarByID(id: number): Promise<AppResponse> {
  try {
    const { error } = await superbase.from("cm-cars").delete().eq("id", id);

    if (error) {
      return { status: "error", data: "Server error. Try again." };
    }

    revalidatePath("/cars");
    return { status: "success", data: "Successfully deleted car." };
  } catch {
    return { status: "error", data: "Server error. Try again." };
  }
}
