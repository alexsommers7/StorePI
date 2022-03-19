const filterObj = (obj, ...fieldsToKeep) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (fieldsToKeep.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

module.exports = filterObj;
