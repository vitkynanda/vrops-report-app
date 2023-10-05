import { useRouter } from "next/navigation";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { MoreHorizontal } from "lucide-react";
import { useModal } from "@/hooks/use-modal";

export function ActionTable({ data }: any) {
  const router = useRouter();
  const { onOpen } = useModal();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(data.identifier);
            toast.success("Identifier copied successfully !");
          }}
        >
          Copy Identifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/${data.identifier}}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onOpen("reports", { identifier: data.identifier })}
        >
          Export Reports
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
