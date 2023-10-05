"use client";
import { DataTable } from "@/components/data-table";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useVmStats } from "@/hooks/use-vm-stats";
import { AccordionItem } from "@radix-ui/react-accordion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export const columns: any[] = [
  {
    accessorKey: "diskspace|workload",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Disk Usage (%)
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => (
      <div className="capitalize">{row.getValue("diskspace|workload")}</div>
    ),
  },
  {
    accessorKey: "config|hardware|disk_Space",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Disk Capacity (GB)
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => (
      <div>{row.getValue("config|hardware|disk_Space")}</div>
    ),
  },
  {
    accessorKey: "cpu|workload",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          CPU Usage (%)
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => <div>{row.getValue("cpu|workload")}</div>,
  },
  {
    accessorKey: "cpu|vm_capacity_provisioned",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total CPU Freq (Mhz)
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => (
      <div>{row.getValue("cpu|vm_capacity_provisioned")}</div>
    ),
  },
  {
    accessorKey: "mem|workload",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Memory Usage (%)
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => <div>{row.getValue("mem|workload")}</div>,
  },
  {
    accessorKey: "mem|guest_provisioned",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Memory (MB)
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => <div>{row.getValue("mem|guest_provisioned")}</div>,
  },
];

const DetailPage = (props: any) => {
  const [detailData, setDetailData] = useState<any>({});
  const { id }: any = useParams();
  const { data, setData }: any = useVmStats();
  const { onOpen } = useModal();

  const { isLoading } = useQuery(
    ["resource", id.split("%")[0]],
    async () => {
      return await axios.get(`/api/resource-properties/${id.split("%")[0]}`);
    },
    {
      onSuccess: (res) => {
        if (res.status === 200) {
          const storedData = JSON.parse(
            localStorage.getItem("resourceData") as string
          );
          const storedInfo = storedData[res?.data?.resourceId];
          storedInfo.properties = res?.data?.property;
          setDetailData(storedInfo);
        }
      },
    }
  );

  useEffect(() => {
    if (data?.dataTableRows) {
      setData({});
    }
  }, []);

  return (
    <div className="w-full mb-5">
      <div className="flex justify-between">
        <div>
          <h1 className="font-bold text-xl mb-3">Main Information</h1>
          <p>Name: {detailData?.name}</p>
          <p>Resource Kind: {detailData?.resourceKind}</p>
          <p>Adapter Kind: {detailData?.adapterKind}</p>
          <p>IP Address: {detailData?.ip_address}</p>
        </div>
        <div>
          <Button
            onClick={() =>
              onOpen("reports", { identifier: detailData.identifier })
            }
          >
            Get Report Stats
          </Button>
        </div>
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h1 className="font-bold text-xl my-3 ">Other Information</h1>
          </AccordionTrigger>
          <AccordionContent>
            {isLoading && <p>Loading Data...</p>}
            <div className="grid  grid-cols-2">
              {detailData?.properties?.map((property: any, idx: number) => (
                <div key={idx} className="flex items-center space-x-2">
                  <p className="font-semibold">{property.name} :</p>
                  <p>{property.value}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <DataTable
        columns={columns}
        rows={data?.dataTableRows || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DetailPage;
