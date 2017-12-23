// from stock day array

function generateUpDownString(dayArray) {
  // needs Date Open Close properties
  const withUpDown = dayArray.map(day => ({
    ...day,
    Date: new Date(day.Date),
    DateInformal: day.Date,
    UpDown: (Number(day.Close) > Number(day.Open)) ? 'up' : 'down'
  }));
  // console.log('withUpDown', withUpDown);
  const upDownString = withUpDown.map(day => {
    return day.UpDown === 'up' ? 1 : 0;
  }).join('');
  return upDownString;
}

module.exports = generateUpDownString;
