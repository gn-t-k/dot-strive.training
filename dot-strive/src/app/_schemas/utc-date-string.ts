import { z } from "zod";

export const utcDateStringSchema = z
  .string()
  .datetime()
  .refine((dateString) => isUTC(dateString), {
    message: "date must be a UTC date string",
  });
const isUTC = (date: string): boolean => {
  return (
    date.endsWith("Z") || date.includes("+00:00") || date.includes("-00:00")
  );
};

export type UTCDateString = z.infer<typeof utcDateStringSchema>;
