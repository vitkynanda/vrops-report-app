"use client";

import { useEffect, useState } from "react";
import { ConfigReport } from "@/components/modals/config-report";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <ConfigReport />
    </>
  );
};
