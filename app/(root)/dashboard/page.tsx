import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const DashboardPage = async () => {
  return (
    <div className={"w-full h-full flex-grow flex flex-col gap-4 p-4"}>
      <Link href={"/cars"}>
        <Button size={"lg"}>Cars</Button>
      </Link>
    </div>
  );
};

export default DashboardPage;
