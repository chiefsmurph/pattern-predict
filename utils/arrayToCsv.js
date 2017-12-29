module.exports = array => {
  const headers = Object.keys(array[0]).join(',');
  const keys = Object.keys(headers);

  const vals = array.map(dayVals => {
    return Object.values(dayVals).join(',');
  }).join('\n');

  return `${headers}\n${vals}`;

};
