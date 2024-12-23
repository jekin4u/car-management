import React from "react";
import CarsCalendar from "@/components/cars/cars-calendar";
import { GetCarByID } from "@/lib/actions.cars";
import NoCar from "@/components/no-car";
import { GetAllBookingsForCar } from "@/lib/actions.car-bookings";

type Props = {
  params: Promise<{ id: number }>;
};

const CarsCalendarPage = async ({ params }: Props) => {
  const { id } = await params;
  const [car, bookings] = await Promise.all([
    GetCarByID(id),
    GetAllBookingsForCar(id),
  ]);

  if (!car) return <NoCar />;

  return (
    <div className={"w-full h-full flex-grow p-4"}>
      <CarsCalendar car={car} bookings={bookings} />
    </div>
  );
};

export default CarsCalendarPage;
