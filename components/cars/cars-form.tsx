"use client";

import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Car, CarMaintenanceType, User } from "@/lib/models";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BeautifyCarMaintenanceType,
  CheckFileForImage,
  MAX_FILE_SIZE,
} from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InsertCar, UpdateCar } from "@/lib/actions.cars";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  id: z.number(),
  name: z.string().trim().min(1, {
    message: "Name is required.",
  }),
  image: z
    .any()
    .refine(
      (file) => (file ? file.size < MAX_FILE_SIZE : true),
      "Max size is 5MB.",
    )
    .refine(
      (file) => (file ? CheckFileForImage(file) : true),
      "Only PNG, JPEG formats are supported.",
    ),
  image_url: z.string(),
  make: z.string().trim().min(1, {
    message: "Make is required.",
  }),
  model: z.string().trim().min(1, {
    message: "Model is required.",
  }),
  year: z.coerce.number().min(0, {
    message: "Year is required.",
  }),
  license_plate: z.string().trim().min(1, {
    message: "License is required.",
  }),
  odometer_reading: z.string().trim().min(1, {
    message: "Odometer reading is required.",
  }),
  maintenance_date: z.coerce.date({
    required_error: "Maintenance date is required.",
  }),
  maintenance_type: z.string().trim().min(1, {
    message: "Maintenance type is required.",
  }),
  service_provider_name: z.string().trim(),
  service_provider_contact: z.string().trim(),
  parts_replaced: z.string().trim(),
  cost: z.coerce.number().min(0, {
    message: "Cost must be higher than 0.",
  }),
  next_maintenance_date: z.coerce.date({
    required_error: "Next maintenance date is required.",
  }),
  remarks: z.string().trim(),
});

type Props = {
  user: User;
  car?: Car;
};

const CarsForm = ({ car }: Props) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: car?.id ?? 0,
      name: car?.name ?? "",
      image: null,
      image_url: car?.image_url ?? "",
      make: car?.make ?? "",
      model: car?.model ?? "",
      year: car?.year ?? 2000,
      cost: car?.cost ?? 0,
      license_plate: car?.license_plate ?? "",
      maintenance_date: car?.maintenance_date ?? new Date(0),
      maintenance_type:
        car?.maintenance_type ?? CarMaintenanceType.Other.toString(),
      next_maintenance_date: car?.next_maintenance_date ?? new Date(0),
      odometer_reading: car?.odometer_reading ?? "",
      parts_replaced: car?.parts_replaced ?? "",
      remarks: car?.remarks ?? "",
      service_provider_contact: car?.service_provider_contact ?? "",
      service_provider_name: car?.service_provider_name ?? "",
    },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof FormSchema>): Promise<void> => {
    setLoading(true);

    const response = car ? await UpdateCar(data) : await InsertCar(data);

    if (response.status == "error") {
      toast({
        variant: "destructive",
        title: response.data,
      });
    } else {
      toast({
        variant: "default",
        title: response.data,
      });

      router.push("/cars");
    }

    setLoading(false);
  };

  return (
    <div className={"w-full h-full flex-grow flex flex-col gap-4"}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-auto space-y-6"
        >
          <div className={"w-full flex gap-4 flex-wrap"}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={"image/*"}
                      defaultValue={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.files && e.target.files[0])
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={"w-full flex gap-4 flex-wrap"}>
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter make..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter model..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter year..."
                      type={"number"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={"w-full flex gap-4 flex-wrap"}>
            <FormField
              control={form.control}
              name="license_plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter license plate..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="odometer_reading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odometer Reading</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter odometer reading..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={"w-full flex gap-4 flex-wrap"}>
            <FormField
              control={form.control}
              name="maintenance_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className={"pb-2.5"}>Maintenance Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maintenance_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem
                            value={CarMaintenanceType.OilChange.toString()}
                          >
                            {BeautifyCarMaintenanceType(
                              CarMaintenanceType.OilChange,
                            )}
                          </SelectItem>
                          <SelectItem
                            value={CarMaintenanceType.TireRotation.toString()}
                          >
                            {BeautifyCarMaintenanceType(
                              CarMaintenanceType.TireRotation,
                            )}
                          </SelectItem>
                          <SelectItem
                            value={CarMaintenanceType.BrakeCheck.toString()}
                          >
                            {BeautifyCarMaintenanceType(
                              CarMaintenanceType.BrakeCheck,
                            )}
                          </SelectItem>
                          <SelectItem
                            value={CarMaintenanceType.GeneralServicing.toString()}
                          >
                            {BeautifyCarMaintenanceType(
                              CarMaintenanceType.GeneralServicing,
                            )}
                          </SelectItem>
                          <SelectItem
                            value={CarMaintenanceType.Other.toString()}
                          >
                            {BeautifyCarMaintenanceType(
                              CarMaintenanceType.Other,
                            )}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="next_maintenance_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className={"pb-2.5"}>
                    Next Maintenance Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={"w-full flex gap-4 flex-wrap"}>
            <FormField
              control={form.control}
              name="service_provider_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Provider Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_provider_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Provider Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter cost..."
                      type={"number"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={"w-full flex gap-4 flex-wrap"}>
            <FormField
              control={form.control}
              name="parts_replaced"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parts Replaced</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter parts replaced..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CarsForm;
