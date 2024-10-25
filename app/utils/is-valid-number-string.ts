type IsValidNumberString = (value: string) => boolean;
export const isValidNumberString: IsValidNumberString = (value) => {
  return (
    !Number.isNaN(Number.parseFloat(value)) &&
    Number.isFinite(Number.parseFloat(value))
  );
};
