const arrayAvg = require('../utils/arrayAvg');

// takes in todaysPerms and generates final calls

module.exports = (todaysPerms, { dayArray, index }) => {
  return {

    avgPerc: arrayAvg(todaysPerms.map(perm => perm.perc)),

    weightedPerc: (() => {
      let percentages = [];
      todaysPerms.forEach((perm, i) => {
        // console.log('perm', perm);
        percentages = percentages.concat(new Array(i).fill(perm.perc));
      });
      // console.log(percentages,' percs');
      return arrayAvg(percentages);
    })(),

    compareToPast: (() => {
      let returnPerc = 40;
      try {
        var curClose = dayArray[index].Close;
      }
      catch (e) {
        console.log('error', e);
        console.log(dayArray)
        console.log('index,', index);
        console.log();
      }
      const dayComparisons = {
        5: 15,  // if trending upward in last 5 days...increase returnPerc by 15
        30: 10,
        60: 10
      };
      Object.keys(dayComparisons).forEach(numDays => {
        const trendingUpwardSinceDay = (dayArray[index - numDays] || {}).Open < curClose;
        if (trendingUpwardSinceDay) {
          returnPerc += dayComparisons[numDays];
        }
      });
      return returnPerc;
    })()

  };
};
