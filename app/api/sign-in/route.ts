import { NextResponse } from "next/server";
import axios from "@/lib/axios";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const res = await axios.post("/auth/token/acquire", payload);
    cookies().set("token", res.data.token, { maxAge: res.data.validity });

    return NextResponse.json({
      ...res.data,
    });
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
