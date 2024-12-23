"use server";

import { createClient } from "@/lib/superbase/client";
import { AppResponse, CarBooking } from "@/lib/models";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

const superbase = createClient();

export async function GetAllBookingsForCar(
  car_id: number,
): Promise<CarBooking[]> {
  try {
    const { data } = await superbase
      .from("cm-car-bookings")
      .select()
      .eq("car_id", car_id);

    if (!data || data.length == 0) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function InsertCarBooking(
  booking: CarBooking,
  car_id: number,
): Promise<AppResponse> {
  try {
    let drop_image_url = "";
    let pickup_image_url = "";

    if (booking.drop_image) {
      const { data, error } = await superbase.storage
        .from("cm-images")
        .upload(
          `public/car-${car_id}-booking-drop-${randomUUID()}.png`,
          booking.drop_image,
          {
            cacheControl: "3600",
            upsert: false,
          },
        );

      if (!error && data) {
        const { data: publicData } = superbase.storage
          .from("cm-images")
          .getPublicUrl(data.path);

        drop_image_url = publicData.publicUrl;
      }
    }

    if (booking.pickup_image) {
      const { data, error } = await superbase.storage
        .from("cm-images")
        .upload(
          `public/car-${car_id}-booking-pickup-${randomUUID()}.png`,
          booking.pickup_image,
          {
            cacheControl: "3600",
            upsert: false,
          },
        );

      if (!error && data) {
        const { data: publicData } = superbase.storage
          .from("cm-images")
          .getPublicUrl(data.path);

        pickup_image_url = publicData.publicUrl;
      }
    }

    delete booking.id;
    delete booking.drop_image;
    delete booking.pickup_image;

    const { error } = await superbase
      .from("cm-car-bookings")
      .insert({ ...booking, car_id, pickup_image_url, drop_image_url });

    if (error) {
      return { status: "error", data: "Server error. Try again." };
    }

    revalidatePath(`/cars/${car_id}/calendar`);
    return { status: "success", data: "Successfully added booking." };
  } catch {
    return { status: "error", data: "Server error. Try again." };
  }
}

export async function UpdateBookingByID(
  booking: Partial<CarBooking>,
): Promise<AppResponse> {
  try {
    let drop_image_url = booking?.drop_image_url || "";
    let pickup_image_url = booking?.pickup_image_url || "";
    const id = booking.id;
    const car_id = booking.car_id;

    if (!id) return { status: "error", data: "Invalid ID. Try again." };

    if (booking.drop_image) {
      const { data, error } = await superbase.storage
        .from("cm-images")
        .upload(
          `public/car-${booking.car_id}-booking-drop-${randomUUID()}.png`,
          booking.drop_image,
          {
            cacheControl: "3600",
            upsert: false,
          },
        );

      if (!error && data) {
        const { data: publicData } = superbase.storage
          .from("cm-images")
          .getPublicUrl(data.path);

        drop_image_url = publicData.publicUrl;
      }
    }

    if (booking.pickup_image) {
      const { data, error } = await superbase.storage
        .from("cm-images")
        .upload(
          `public/car-${booking.car_id}-booking-pickup-${randomUUID()}.png`,
          booking.pickup_image,
          {
            cacheControl: "3600",
            upsert: false,
          },
        );

      if (!error && data) {
        const { data: publicData } = superbase.storage
          .from("cm-images")
          .getPublicUrl(data.path);

        pickup_image_url = publicData.publicUrl;
      }
    }

    delete booking.id;
    delete booking.car_id;
    delete booking.drop_image;
    delete booking.pickup_image;

    const { error } = await superbase
      .from("cm-car-bookings")
      .update({ ...booking, pickup_image_url, drop_image_url })
      .eq("id", id);

    if (error) {
      return { status: "error", data: "Server error. Try again." };
    }

    revalidatePath(`/cars/${car_id}/calendar`);
    return { status: "success", data: "Successfully updated car booking." };
  } catch {
    return { status: "error", data: "Server error. Try again." };
  }
}

export async function DeleteBookingByID(
  booking: CarBooking,
): Promise<AppResponse> {
  try {
    const { error } = await superbase
      .from("cm-car-bookings")
      .delete()
      .eq("id", booking.id);

    if (error) {
      return { status: "error", data: "Server error. Try again." };
    }

    revalidatePath(`/cars/${booking.car_id}/calendar`);
    return { status: "success", data: "Successfully deleted car booking." };
  } catch {
    return { status: "error", data: "Server error. Try again." };
  }
}
