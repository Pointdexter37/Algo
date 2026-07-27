"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
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
    throw new Error("Please fill out all fields.")
  }

  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
    throw new Error("Please fill out all fields.")
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.")
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  })

  if (existingUser) {
    throw new Error("An account with this email already exists.")
  }

  await prisma.user.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      password: hashPassword(password),
    },
  })

  redirect("/api/auth/signin?callbackUrl=/onboarding")
}
