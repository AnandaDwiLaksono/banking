'use server'

import { ID } from "node-appwrite"
import { cookies } from "next/headers"

import { createAdminClient, createSessionClient } from "../appwrite"
import { parseStringify } from "../utils"

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();

    const response = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", response.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(response);
  } catch (error) {
    console.error('Error: ', error)
  }
}

export const signUp = async (userData: SignUpParams) => {
  const { firstName, lastName, email, password } = userData;

  try {
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUserAccount);
  } catch (error) {
    console.error('Error: ', error)
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();

    const user = await account.get();

    return parseStringify(user);
  } catch (error) {
    return error;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    
    (await cookies()).delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return error;
  }
}
