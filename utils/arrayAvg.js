module.exports = array => {
  return array.reduce((acc, val) => acc + val, 0) / array.length;
};
