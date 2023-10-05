import { NextResponse } from "next/server";
import axios from "@/lib/axios";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const res = await axios.get(
      `/resources?pageSize=${searchParams.get("pageSize")}`,
      {
        headers: {
          Authorization: "vRealizeOpsToken " + cookies().get("token")?.value,
        },
      }
    );

    const resourceData: any = {};

    for (const [idx, resource] of res.data.resourceList.entries()) {
      const { identifier } = resource;

      resourceData[resource?.identifier] = {
        identifier: resource?.identifier,
        name: resource?.resourceKey?.name || "",
        adapterKind: resource?.resourceKey?.adapterKindKey,
        resourceKind: resource?.resourceKey?.resourceKindKey,
        resourceHealth: resource?.resourceHealth,
        resourceHealthValue: resource?.resourceHealthValue,
      };

      if (resourceData[identifier]?.ip_address || !identifier) continue;

      const response = await axios.get(`/resources/${identifier}/properties`, {
        headers: {
          Authorization: "vRealizeOpsToken " + cookies().get("token")?.value,
        },
      });

      if (response.status === 200) {
        resourceData[identifier].ip_address =
          response?.data?.property?.find(
            (r: any) =>
              r?.name === "summary|guest|ipAddress" ||
              r?.name === "net:4000|ip_address"
          )?.value || "-";
      }
    }

    return NextResponse.json({
      resourceData,
    });
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
