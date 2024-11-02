type DetermineDateFormat = (
  date: string,
) => "yyyy-MM" | "yyyy-MM-dd" | "invalid";
export const determineDateFormat: DetermineDateFormat = (date) => {
  if (yyyyMmPattern.test(date)) {
    return "yyyy-MM";
  }
  if (yyyyMmDdPattern.test(date)) {
    return "yyyy-MM-dd";
  }

  return "invalid";
};

const yyyyMmPattern = /^\d{4}-\d{2}$/;
const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/;
