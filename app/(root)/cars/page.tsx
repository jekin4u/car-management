import React from "react";
import { GetAllCars } from "@/lib/actions.cars";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import NoCarImage from "@/public/images/no-car-image.svg";

const CarsPage = async () => {
  const cars = await GetAllCars();

  return (
    <div className={"w-full h-full flex-grow flex flex-col gap-4 p-4"}>
      <div className={"w-full"}>
        <Link href={"/cars/new"}>
          <Button>New</Button>
        </Link>
      </div>

      <div
        className={
          "flex flex-wrap gap-4 md:flex-row justify-center md:justify-start"
        }
      >
        {cars.length == 0 && (
          <div className={"w-full text-base/none text-center"}>No Cars</div>
        )}

        {cars.map((car) => (
          <Link
            key={`car-${car.id}`}
            href={`/cars/${car.id}`}
            className={
              "w-64 flex rounded-md bg-background p-2 hover:bg-primary border-2 border-primary flex-col transition-all gap-2 group"
            }
          >
            <div className={"w-full h-40 relative"}>
              <Image
                src={car?.image_url || NoCarImage}
                alt={`car-${car.id}-image`}
                fill
                style={{ objectFit: "contain" }}
              />
            </div>

            <h1
              className={
                "text-center text-base/none font-bold group-hover:text-primary-foreground"
              }
            >
              {car.name}
            </h1>
            <p className={"text-center text-xs/none font-thin text-gray-300"}>
              {car.total_bookings && car.total_bookings.length > 0
                ? car.total_bookings[0].count
                : 0}{" "}
              Bookings
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CarsPage;
