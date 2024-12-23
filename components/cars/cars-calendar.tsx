"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Car, CarBooking } from "@/lib/models";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DeleteBookingByID,
  InsertCarBooking,
  UpdateBookingByID,
} from "@/lib/actions.car-bookings";
import { toast } from "@/hooks/use-toast";
import { CheckDateInRange, GetDatesInRange } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import ImagePlaceholder from "@/public/images/no-car-image.svg";
import { useSidebar } from "@/components/ui/sidebar";
import { SiKakaotalk } from "react-icons/si";
import { WhatsappShare } from "react-share-kit";

enum BookingDialogState {
  Idle,
  Deleting,
  Updating,
}

type Props = {
  car: Car;
  bookings: CarBooking[];
};

const CarsCalendar = ({ car, bookings }: Props) => {
  const [addBookingPopoverOpen, setAddBookingPopoverOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const [booking, setBooking] = useState<
    CarBooking & { dateRange: DateRange | undefined; isValid: boolean }
  >({
    description: "",
    summary: "",
    pickup_image: null,
    pickup_image_url: "",
    drop_image: null,
    drop_image_url: "",
    from: new Date(0),
    to: new Date(0),
    car_id: 0,
    id: 0,
    dateRange: undefined,
    isValid: false,
  });

  const [loading, setLoading] = useState(false);
  const [bookingDialogState, setBookingDialogState] =
    useState<BookingDialogState>(BookingDialogState.Idle);
  const { isMobile } = useSidebar();

  const selectedBooking = useRef<CarBooking | null>(null);

  const addBookingHandler = async () => {
    if (!booking.isValid) return;
    if (!booking.dateRange) return;
    setLoading(true);

    const response = await InsertCarBooking(
      {
        from: booking.dateRange.from as Date,
        to: booking.dateRange.to as Date,
        pickup_image: booking.pickup_image,
        drop_image: booking.drop_image,
        summary: booking.summary,
        description: booking.description,
        drop_image_url: "",
        pickup_image_url: "",
      },
      car.id,
    );

    toast({
      variant: response.status == "error" ? "destructive" : "default",
      title: response.data,
    });

    setAddBookingPopoverOpen(false);
    setLoading(false);
  };

  const resetHandler = () => {
    setBooking({
      ...booking,
      isValid: false,
      description: "",
      summary: "",
      pickup_image: null,
      drop_image: null,
    });
  };

  const renderAddBookingContent = () => {
    return (
      <div className={"w-full flex flex-col gap-4"}>
        <Calendar
          mode="range"
          numberOfMonths={isMobile ? 1 : 2}
          onSelect={(dateRange) => {
            setBooking({ ...booking, dateRange: dateRange });
          }}
          selected={booking.dateRange}
          disabled={selectedDates}
          className="rounded-md border shadow w-fit"
          classNames={{
            day_today: "bg-gray-400 text-white",
            months: "flex flex-col lg:flex-row",
          }}
        />

        <div className="w-full max-w-sm flex flex-col gap-1.5">
          <Label htmlFor="email">Description</Label>
          <Input
            onChange={(e) =>
              setBooking({
                ...booking,
                description: e.target.value.trim(),
              })
            }
            placeholder={"Enter description"}
          />
        </div>

        <div className="w-full max-w-sm flex flex-col gap-1.5">
          <Label htmlFor="email">Summary</Label>
          <Textarea
            onChange={(e) =>
              setBooking({ ...booking, summary: e.target.value.trim() })
            }
            placeholder={"Enter summary"}
            className={"max-h-64 min-h-16"}
          />
        </div>

        <div className={"w-full flex gap-2 flex-col lg:flex-row"}>
          <div className="w-full max-w-sm flex flex-col gap-1.5">
            <Label htmlFor="email">Drop Image</Label>
            <Input
              type={"file"}
              onChange={(e) =>
                setBooking({
                  ...booking,
                  drop_image: e.target.files && e.target.files[0],
                })
              }
            />
          </div>

          <div className="w-full max-w-sm flex flex-col gap-1.5">
            <Label htmlFor="email">Pickup Image</Label>
            <Input
              type={"file"}
              onChange={(e) =>
                setBooking({
                  ...booking,
                  pickup_image: e.target.files && e.target.files[0],
                })
              }
            />
          </div>
        </div>

        <Button
          disabled={!booking.isValid || loading}
          onClick={addBookingHandler}
        >
          {loading ? "Adding..." : "Add"}
        </Button>
      </div>
    );
  };

  useEffect(() => {
    setBooking({
      ...booking,
      isValid:
        booking.description.length != 0 &&
        booking.summary.length != 0 &&
        !!booking.dateRange,
    });
  }, [booking.description, booking.summary, booking.dateRange]);

  const selectedDates = useMemo(() => {
    return bookings.reduce<Date[]>((result, booking) => {
      return [...result, ...GetDatesInRange(booking.from, booking.to)];
    }, []);
  }, [bookings]);

  return (
    <div className={"w-full flex flex-col gap-6 items-start pb-12"}>
      <h1 className={"text-lg/none"}>
        Car: <span className={"font-bold"}>{car.name}</span>
      </h1>

      <Dialog
        open={bookingDialogOpen}
        onOpenChange={(state) => {
          setBookingDialogOpen(state);
          if (!state) selectedBooking.current = null;
        }}
      >
        <DialogContent className="w-full max-w-[90%] lg:w-fit p-4 pt-6">
          <DialogHeader>
            <DialogTitle>Car Booking</DialogTitle>
            <DialogDescription>View, Edit or Delete Booking</DialogDescription>
          </DialogHeader>
          <div className={"w-full flex flex-col gap-4"}>
            <div className="w-full max-w-sm flex flex-col gap-1.5">
              <Label htmlFor="email">Description</Label>
              <Input
                defaultValue={selectedBooking.current?.description ?? ""}
                onChange={(e) =>
                  setBooking({ ...booking, description: e.target.value.trim() })
                }
                placeholder={"Enter description"}
              />
            </div>

            <div className="w-full max-w-sm flex flex-col gap-1.5">
              <Label htmlFor="email">Summary</Label>
              <Textarea
                defaultValue={selectedBooking.current?.summary ?? ""}
                onChange={(e) =>
                  setBooking({ ...booking, summary: e.target.value.trim() })
                }
                placeholder={"Enter description"}
                className={"max-h-64 min-h-16"}
              />
            </div>

            <div className={"w-full flex gap-2"}>
              <div className="w-full max-w-sm flex flex-col gap-1.5">
                <Label htmlFor="email">Drop Image</Label>
                <Input
                  type={"file"}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      drop_image: e.target.files && e.target.files[0],
                    })
                  }
                />
              </div>

              <div className="w-full max-w-sm flex flex-col gap-1.5">
                <Label htmlFor="email">Pickup Image</Label>
                <Input
                  type={"file"}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      pickup_image: e.target.files && e.target.files[0],
                    })
                  }
                />
              </div>
            </div>

            <div className={"w-full grid grid-cols-2 gap-2"}>
              <div className={"relative aspect-[1.2]"}>
                <Image
                  src={
                    selectedBooking.current?.drop_image_url?.trim()
                      ? selectedBooking.current?.drop_image_url
                      : ImagePlaceholder
                  }
                  alt={"drop-image"}
                  fill
                  style={{ objectFit: "contain", objectPosition: "top" }}
                />
              </div>

              <div className={"relative aspect-[1.2]"}>
                <Image
                  src={
                    selectedBooking.current?.pickup_image_url?.trim()
                      ? selectedBooking.current?.pickup_image_url
                      : ImagePlaceholder
                  }
                  alt={"drop-image"}
                  fill
                  style={{ objectFit: "contain", objectPosition: "top" }}
                />
              </div>
            </div>

            <div className={"w-full flex items-center justify-between gap-4"}>
              <div className={"flex items-center justify-start gap-2"}>
                <WhatsappShare
                  url={`Description:\n${selectedBooking.current?.description}\n\nSummary:\n${selectedBooking.current?.summary}\n\nDates:\n${new Date(selectedBooking.current?.from ?? 0).toISOString().split("T")[0]} - ${new Date(selectedBooking.current?.to ?? 0).toISOString().split("T")[0]}`}
                  size={36}
                  borderRadius={10}
                />

                <SiKakaotalk
                  className={"text-yellow-500 text-4xl/none cursor-pointer"}
                  onClick={() => {
                    // @ts-ignore
                    const kakao = window.Kakao;
                    if (!kakao) return;

                    if (!kakao.isInitialized()) {
                      kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
                    }

                    kakao.Share.sendDefault({
                      objectType: "text",
                      text: `Description:\n${selectedBooking.current?.description}\n\nSummary:\n${selectedBooking.current?.summary}\n\nDates:\n${new Date(selectedBooking.current?.from ?? 0).toISOString().split("T")[0]} - ${new Date(selectedBooking.current?.to ?? 0).toISOString().split("T")[0]}`,
                      link: {
                        webUrl: "https://developers.kakao.com",
                        mobileWebUrl: "https://developers.kakao.com",
                      },
                    });
                  }}
                />
              </div>

              <div className={"flex items-center justify-end gap-4"}>
                <Button
                  variant={"destructive"}
                  disabled={bookingDialogState != BookingDialogState.Idle}
                  onClick={async () => {
                    if (!selectedBooking.current) return;
                    setBookingDialogState(BookingDialogState.Deleting);

                    const response = await DeleteBookingByID(
                      selectedBooking.current,
                    );

                    toast({
                      variant:
                        response.status == "error" ? "destructive" : "default",
                      title: response.data,
                    });

                    selectedBooking.current = null;
                    setBookingDialogOpen(false);
                    setBookingDialogState(BookingDialogState.Idle);
                  }}
                >
                  {bookingDialogState == BookingDialogState.Deleting
                    ? "Deleting..."
                    : "Delete"}
                </Button>
                <Button
                  disabled={bookingDialogState != BookingDialogState.Idle}
                  onClick={async () => {
                    if (!selectedBooking.current) return;
                    setBookingDialogState(BookingDialogState.Updating);

                    const response = await UpdateBookingByID({
                      description: booking.description,
                      summary: booking.summary,
                      drop_image: booking.drop_image,
                      pickup_image: booking.pickup_image,
                      car_id: selectedBooking.current.car_id,
                      id: selectedBooking.current.id,
                    });

                    toast({
                      variant:
                        response.status == "error" ? "destructive" : "default",
                      title: response.data,
                    });

                    selectedBooking.current = null;
                    setBookingDialogOpen(false);
                    setBookingDialogState(BookingDialogState.Idle);
                  }}
                >
                  {bookingDialogState == BookingDialogState.Updating
                    ? "Updating..."
                    : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Calendar
        mode="multiple"
        onDayClick={(date) => {
          const filteredBookings = bookings.filter((b) =>
            CheckDateInRange(date, b.from, b.to),
          );
          selectedBooking.current =
            filteredBookings.length > 0 ? filteredBookings[0] : null;
          setBookingDialogOpen(!!selectedBooking.current);
        }}
        numberOfMonths={isMobile ? 2 : 3}
        showOutsideDays={false}
        selected={selectedDates}
        className="rounded-md border shadow w-fit"
        classNames={{
          day_today: "bg-gray-400 text-white",
          months: "flex flex-col lg:flex-row",
        }}
      />

      {isMobile ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button className={"w-fit"}>Add booking</Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[90%] p-4 pt-6">
            <DialogHeader>
              <DialogTitle className={"hidden"}></DialogTitle>
              <DialogDescription className={"hidden"}></DialogDescription>
            </DialogHeader>
            {renderAddBookingContent()}
          </DialogContent>
        </Dialog>
      ) : (
        <Popover
          open={addBookingPopoverOpen}
          onOpenChange={(state) => {
            setAddBookingPopoverOpen(state);
            if (!state) resetHandler();
          }}
        >
          <PopoverTrigger asChild>
            <Button
              className={"w-fit"}
              onClick={() => setAddBookingPopoverOpen(true)}
            >
              Add booking
            </Button>
          </PopoverTrigger>
          <PopoverContent side={"right"} sideOffset={-10} asChild>
            {renderAddBookingContent()}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default CarsCalendar;
