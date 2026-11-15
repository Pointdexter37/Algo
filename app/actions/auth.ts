"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { redirect } from "next/navigation"

export type RegistrationState = {
  error?: string
}

export async function registerUser(
  _previousState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const name = formData.get("name")
  const email = formData.get("email")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { error: "Please fill out all fields." }
  }

  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
    return { error: "Please fill out all fields." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  })

  if (existingUser) {
    return { error: "An account with this email already exists." }
  }

  try {
    await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        password: hashPassword(password),
      },
    })
  } catch (error) {
    console.error("Registration failed", error)
    return { error: "We could not create your account. Please try again." }
  }

  redirect("/signin?callbackUrl=/onboarding")
}
