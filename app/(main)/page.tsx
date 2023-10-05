"use client";
import { DataTable } from "@/components/data-table";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { ActionTable } from "@/components/data-table/action-table";

export const columns: any[] = [
  {
    id: "select",
    header: ({ table }: any) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value: any) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "identifier",
    header: "Identifier",
    cell: ({ row }: any) => (
      <div className="capitalize">{row.getValue("identifier")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "ip_address",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ip Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => <div>{row.getValue("ip_address")}</div>,
  },
  {
    accessorKey: "adapterKind",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Adapter Kind
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => <div>{row.getValue("adapterKind")}</div>,
  },
  {
    accessorKey: "resourceKind",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Resource Kind
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => <div>{row.getValue("adapterKind")}</div>,
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }: any) => {
      const data = row.original;

      return <ActionTable data={data} />;
    },
  },
];

export default function MainPage() {
  const [resources, setResources] = useState<any>({});

  const { isLoading } = useQuery(
    ["resources"],
    async () => {
      try {
        if (localStorage.getItem("resourceData")) {
          return JSON.parse(localStorage.getItem("resourceData") as string);
        }
        const res = await axios.get("/api/resources?pageSize=4000");
        if (res.status === 200) {
          return res.data;
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    {
      onSuccess: (data: any) => {
        localStorage.setItem("resourceData", JSON.stringify(data));
        setResources(data);
      },
    }
  );

  return (
    <main>
      <DataTable
        columns={columns}
        rows={Object.values(resources)}
        isLoading={isLoading}
        withFilter
      />
    </main>
  );
}
