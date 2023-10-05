import { Hash } from "lucide-react";

import { MobileToggle } from "@/components/mobile-toggle";
import { UserAvatar } from "@/components/user-avatar";

interface MainHeaderProps {
  name?: string;
  imageUrl?: string;
}

export const MainHeader = ({ name, imageUrl }: MainHeaderProps) => {
  return (
    <div className="text-md font-semibold flex items-center h-20 border-neutral-200 dark:border-neutral-800 ">
      <h1 className="font-semibold text-4xl text-black dark:text-white">
        VRealize Ops Reports
      </h1>
    </div>
  );
};
