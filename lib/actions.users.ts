"use server";

import { cookies } from "next/headers";
import { encrypt, getSession } from "@/lib/auth";
import { createClient } from "@/lib/superbase/client";
import { AppResponse, User } from "@/lib/models";
import { redirect } from "next/navigation";

const superbase = createClient();

export async function GetCurrentUser(): Promise<User | null> {
  try {
    const session = await getSession();
    if (!session) return null;

    const { data } = await superbase
      .from("cm-users")
      .select()
      .eq("id", session.id || -1);

    if (!data || data.length == 0) {
      return null;
    }

    return data[0];
  } catch {
    return null;
  }
}

export async function UpdateUser(
  partialUser: Partial<User>,
): Promise<AppResponse> {
  try {
    const session = await getSession();
    if (!session)
      return {
        status: "error",
        data: "No user found.",
      };

    const { error } = await superbase
      .from("cm-users")
      .update({
        first_name: partialUser.first_name,
        last_name: partialUser.last_name,
        pin: partialUser.pin,
      })
      .eq("id", session.id || -1);

    if (error) {
      return {
        status: "error",
        data: "Error while updating. Try again later.",
      };
    }

    return { status: "success", data: "Successfully updated." };
  } catch {
    return { status: "error", data: "Server error. Try again later." };
  }
}

export async function login(formData: FormData): Promise<AppResponse> {
  const pin = formData.get("pin");

  if (!pin) return { status: "error", data: "Invalid PIN." };

  const { data } = await superbase.from("cm-users").select().eq("pin", pin);

  if (!data || data.length == 0) {
    return { status: "error", data: "Invalid PIN." };
  }

  const user: User = data[0];
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  const session = await encrypt({ id: user.id, expires });

  (await cookies()).set("session", session, { expires, httpOnly: true });

  return { status: "success", data: data };
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
  redirect("/");
}
