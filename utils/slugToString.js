const slugToString = (brand) => {
  let ret = brand.toUpperCase();
  ret = brand
    .split('-')
    .join(' ')
    .replace(/\w\S*/g, (txt) => txt.toUpperCase());

  return ret;
};

module.exports = slugToString;
