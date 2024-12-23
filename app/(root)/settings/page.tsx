import React from "react";
import { GetCurrentUser } from "@/lib/actions.users";
import NoUser from "@/components/no-user";
import SettingsForm from "@/components/settings/settings-form";

const SettingsPage = async () => {
  const user = await GetCurrentUser();

  if (!user) return <NoUser />;

  return (
    <div className={"w-full h-full flex-grow flex p-4"}>
      <SettingsForm user={user} />
    </div>
  );
};

export default SettingsPage;
