export const prettyNumber = (value: any): string => {
  if (!value) return "";
  return parseFloat(value)
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
