import { NextResponse } from "next/server";
import axios from "@/lib/axios";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log(payload);

    const res = await axios.post("/resources/stats/query", payload, {
      headers: {
        Authorization: "vRealizeOpsToken " + cookies().get("token")?.value,
      },
    });

    return NextResponse.json({
      ...res.data,
    });
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
