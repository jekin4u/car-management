import { GetCurrentUser } from "@/lib/actions.users";
import React from "react";
import CarsForm from "@/components/cars/cars-form";
import NoUser from "@/components/no-user";
import NoCar from "@/components/no-car";
import { GetCarByID } from "@/lib/actions.cars";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CarsDeleteButton from "@/components/cars/cars-delete-button";
import NoCarImage from "@/public/images/no-car-image.svg";
import { GetAllBookingsForCar } from "@/lib/actions.car-bookings";
import { CheckDateInRange } from "@/lib/utils";

type Props = {
  params: Promise<{ id: number }>;
};

const CarsEditPage = async ({ params }: Props) => {
  const [user, { id }] = await Promise.all([GetCurrentUser(), params]);
  if (!user) return <NoUser />;

  const [car, bookings] = await Promise.all([
    GetCarByID(id),
    GetAllBookingsForCar(id),
  ]);
  if (!car) return <NoCar />;

  return (
    <div
      className={"flex gap-4 p-4 w-full h-full flex-grow flex-col lg:flex-row"}
    >
      <div className={"w-full lg:w-3/12 flex flex-col gap-4"}>
        <div className={"w-full flex gap-2"}>
          <Link href={`/cars/${id}/calendar`}>
            <Button>Car Calendar</Button>
          </Link>

          <CarsDeleteButton car={car} />
        </div>

        <div className={"w-full max-w-60 aspect-[1.2] relative"}>
          <Image
            src={car.image_url || NoCarImage}
            alt={`image-car-${car.id}`}
            fill
            style={{ objectFit: "contain", objectPosition: "top" }}
          />
        </div>

        <div className={"flex flex-col gap-2"}>
          <h1 className={"font-bold text-xl/none"}>Status</h1>
          <p className={"text-base/none"}>
            {bookings.filter((b) =>
              CheckDateInRange(new Date(Date.now()), b.from, b.to),
            ).length > 0
              ? "In Booking"
              : new Date().toDateString() ==
                    new Date(car.maintenance_date).toDateString() ||
                  new Date().toDateString() ==
                    new Date(car.next_maintenance_date).toDateString()
                ? "In Maintenance"
                : "Available"}
          </p>
        </div>
      </div>
      <div className={"flex-grow"}>
        <CarsForm user={user} car={car} />
      </div>
    </div>
  );
};

export default CarsEditPage;
