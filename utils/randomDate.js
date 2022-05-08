const randomDate = (start = new Date(2020, 0, 1), end = new Date()) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

module.exports = randomDate;
