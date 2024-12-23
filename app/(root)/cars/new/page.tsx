import { GetCurrentUser } from "@/lib/actions.users";
import React from "react";
import CarsForm from "@/components/cars/cars-form";
import NoUser from "@/components/no-user";

const CarsNewPage = async () => {
  const user = await GetCurrentUser();

  if (!user) return <NoUser />;

  return (
    <div className={"w-full h-full flex-grow p-4"}>
      <CarsForm user={user} />
    </div>
  );
};

export default CarsNewPage;
