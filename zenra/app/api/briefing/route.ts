import { NextResponse } from "next/server";
import { USER } from "@/lib/seed";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    text: `Good morning, ${USER.name}! You got nearly 7 hours of sleep. You'd better hurry — work starts at 9!`,
  });
}
