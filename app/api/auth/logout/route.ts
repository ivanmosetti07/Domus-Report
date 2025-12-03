import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout effettuato con successo",
  })

  // Clear auth cookie
  response.cookies.delete("auth-token")

  return response
}
