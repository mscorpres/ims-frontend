import { SelectOptionType } from "@/types/general";

export const scalingOptions: SelectOptionType[] = [
  { text: "No Scaling", value: "0" },
  { text: "Thousands", value: "T" },
  { text: "Lakhs", value: "L" },
  { text: "Crores", value: "Cr" },
];

export const scalingCurrencyOptions: SelectOptionType[] = [
  {
    text: "INR",
    value: "inr",
  },
  {
    text: "Foreign",
    value: "foreign",
  },
];
