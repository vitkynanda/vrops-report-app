import { format, parse } from "date-fns";
import { utils, writeFile } from "xlsx";

export const formatDateToEpoch = (date: Date): number => {
  // Format the date as a string in a suitable format (e.g., ISO 8601)
  const formattedDate = format(date, "yyyy-MM-dd HH:mm:ss");

  // Parse the formatted date string back to a Date object
  const parsedDate = parse(formattedDate, "yyyy-MM-dd HH:mm:ss", new Date());

  // Convert the Date object to an epoch timestamp (in milliseconds)
  const epochTimestamp = parsedDate.getTime();

  return epochTimestamp;
};

export const exportExcel = (data: any, filename?: string | undefined): void => {
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet(data);
  utils.book_append_sheet(wb, ws, "Sheet1");
  writeFile(wb, filename ? `${filename}.xlsx` : "export.xlsx");
};
