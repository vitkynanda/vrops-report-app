"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Cookies from "js-cookie";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const NavigationSidebar = () => {
  const router = useRouter();
  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
      {/* <NavigationAction /> */}
      <Link href="/">
        <h3 className="font-bold">VR</h3>
      </Link>
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full"></ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <Button
          variant="ghost"
          onClick={() => {
            Cookies.remove("token");
            router.push("/sign-in");
          }}
        >
          <LogOut />
        </Button>
        <ModeToggle />
      </div>
    </div>
  );
};
