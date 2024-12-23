"use client";

import { DeleteCarByID } from "@/lib/actions.cars";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car } from "@/lib/models";

type Props = {
  car: Car;
};

const CarsDeleteButton = ({ car }: Props) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const clickHandler = async () => {
    const response = await DeleteCarByID(car.id);

    setDialogOpen(false);

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
  };

  return (
    <Dialog open={dialogOpen}>
      <Button variant={"destructive"} onClick={() => setDialogOpen(true)}>
        Delete
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            You are deleting car &quot;{car.name}&quot;
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className={"flex gap-2"}>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button onClick={clickHandler} variant={"destructive"}>
              Agree
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CarsDeleteButton;
