"use client";

import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { exportExcel, formatDateToEpoch } from "@/utils";
import { useVmStats } from "@/hooks/use-vm-stats";
import toast from "react-hot-toast";
const formSchema = z.object({
  rangeType: z.string().min(1, {
    message: "Range type is required.",
  }),
  intervalType: z.string().min(1, {
    message: "Interval type is required.",
  }),
  intervalQuantifier: z
    .string()
    .min(1, {
      message: "Interval quantifier is required.",
    })
    .max(3, { message: "Invalid interval input" }),
  aggType: z.string().min(1, {
    message: "Aggregation type is required.",
  }),
  startDate: z.date(),
  endDate: z.date(),
});

enum RangeType {
  LAST_MONTH = "LAST MONTH",
  LAST_YEAR = "LAST YEAR",
  CUSTOM = "CUSTOM",
}

enum IntervalType {
  MINUTES = "MINUTES",
  DAYS = "DAYS",
  WEEKS = "WEEKS",
  YEARS = "YEARS",
}

enum AggType {
  MAX = "MAX",
  MIN = "MIN",
  AVG = "AVG",
}

export const ConfigReport = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, onClose, type, data } = useModal();
  const { setData } = useVmStats();

  const open = isOpen && type === "reports";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rangeType: "",
      startDate: new Date(),
      endDate: new Date(),
      intervalType: "",
      intervalQuantifier: "1",
      aggType: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const currentDate = new Date();
    if (values.rangeType === "LAST YEAR") {
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      values.startDate = oneYearAgo;
    }
    if (values.rangeType === "LAST MONTH") {
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);
      values.startDate = oneMonthAgo;
    }
    const payload = {
      begin: formatDateToEpoch(values.startDate),
      end: formatDateToEpoch(values.endDate),
      intervalType: values.intervalType,
      intervalQuantifier: values.intervalQuantifier,
      rollUpType: values.aggType,
      resourceId: [data?.identifier],
      statKey: [
        "diskspace|workload",
        "config|hardware|disk_Space",
        "cpu|workload",
        "cpu|vm_capacity_provisioned",
        "mem|workload",
        "mem|guest_provisioned",
      ],
    };

    try {
      const res = await axios.post(`/api/stats`, payload);

      const largestTimestamp = {
        index: 0,
        total: 0,
      };
      const headers = [];

      if (res.status === 200) {
        if (res.data.values.length === 0) {
          return toast.error("Report data not found");
        }

        const allStats = res?.data?.values[0]["stat-list"].stat;

        for (const [index, stat] of allStats.entries()) {
          headers.push(stat.statKey.key);
          if (stat.timestamps.length > largestTimestamp.total) {
            largestTimestamp.total = stat.timestamps.length;
            largestTimestamp.index = index;
          }
        }

        headers.push("timestamp");

        const timestampDict: any = {};

        for (const [idx, ts] of allStats[
          largestTimestamp.index
        ].timestamps.entries()) {
          timestampDict[ts] = idx;
        }

        const rows = new Array(largestTimestamp.total);
        for (let i = 0; i < largestTimestamp.total; i++) {
          rows[i] = new Array(headers.length).fill("-");
        }

        for (const [index, stat] of allStats.entries()) {
          const { timestamps } = stat;
          for (const [idx, value] of stat.data.entries()) {
            const timestamp = timestamps[idx];
            const dataIndex = timestampDict[timestamp];
            if (dataIndex !== undefined) {
              rows[dataIndex][index] = value;
              rows[dataIndex][allStats.length] = timestamp;
            }
          }
        }

        const tableRows: any = [];

        for (const row of rows) {
          const tempTableRow: any = {};
          for (const [index, value] of row.entries()) {
            tempTableRow[headers[index]] = value;
          }
          tableRows.push(tempTableRow);
        }

        const sheetAOA = [headers, ...rows];
        setData({ aoaData: sheetAOA, dataTableRows: tableRows });
        const storedData = JSON.parse(
          localStorage.getItem("resourceData") as string
        );
        exportExcel(
          sheetAOA,
          `${storedData[data?.identifier as string]?.name}-reports`
        );
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="  p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold ">
            Report Configuration
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Customsize your report request data.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-5 px-6  ">
              <FormField
                control={form.control}
                name="rangeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Range Type
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select Range Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(RangeType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("rangeType") === "CUSTOM" && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2 ">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                          Start Date
                        </FormLabel>
                        <Popover>
                          <FormControl>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              disabled={isLoading}
                              onSelect={field.onChange}
                              mode="single"
                              selected={new Date(field.value)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                          End Date
                        </FormLabel>
                        <Popover>
                          <FormControl>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              disabled={isLoading}
                              onSelect={field.onChange}
                              mode="single"
                              selected={new Date(field.value)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <FormField
                control={form.control}
                name="intervalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Interval Type
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select Interval Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(IntervalType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intervalQuantifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Interval Quantifier
                    </FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          type="number"
                          disabled={isLoading}
                          className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                          placeholder="Enter Quantifier"
                          {...field}
                        />
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aggType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Aggregation Type
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select Aggregation Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AggType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4">
              <Button disabled={isLoading}>Get Stats</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
