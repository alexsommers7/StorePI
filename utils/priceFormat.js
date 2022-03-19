exports.numericPrice = (number) => parseFloat(number.toFixed(2));

exports.prettyPrice = (number) =>
  number.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
