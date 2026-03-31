/**
 * Formats a number as Indian Rupees (INR)
 */
export const formatINR = (amount: number | string | bigint) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Calculates percentage and returns a formatted string
 */
export const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};
