import { NextResponse } from "next/server";
import axios from "@/lib/axios";
import { cookies } from "next/headers";

export async function GET(req: Request, { params }: any) {
  try {
    const res = await axios.get(`/resources/${params?.id}/properties`, {
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
