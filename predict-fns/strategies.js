const arrayAvg = require('../utils/arrayAvg');

// takes in todaysPerms and generates final calls

module.exports = (todaysPerms, { dayArray, index }) => {
  const avgPerc = arrayAvg(todaysPerms.map(perm => perm.perc));
  return {

    avgPerc,

    weightedPerc: (() => {
      let percentages = [];
      todaysPerms.forEach((perm, i) => {
        // console.log('perm', perm);
        percentages = percentages.concat(new Array(i).fill(perm.perc));
      });
      // console.log(percentages,' percs');
      return arrayAvg(percentages);
    })(),

    // compareToPast: (() => {
    //   let returnPerc = 40;
    //   const curClose = dayArray[index].Close;
    //   const dayComparisons = {
    //     5: 15,  // if trending upward in last 5 days...increase returnPerc by 15
    //     30: 10,
    //     60: 10
    //   };
    //   Object.keys(dayComparisons).forEach(numDays => {
    //     const trendingUpwardSinceDay = (dayArray[index - numDays] || {}).Open < curClose;
    //     if (trendingUpwardSinceDay) {
    //       returnPerc += dayComparisons[numDays];
    //     }
    //   });
    //   return returnPerc;
    // })(),
    //
    // avgWith30Random: (() => {
    //   return avgPerc + (Math.random() > 0.5 ? 30 : -30)
    // })(),
    //
    // avgWith20Random: (() => {
    //   return avgPerc + (Math.random() > 0.5 ? 20 : -20)
    // })(),
    //
    // avgWith10Random: (() => {
    //   return avgPerc + (Math.random() > 0.5 ? 10 : -10)
    // })(),
    //
    // closeYesterdayLessThanOpenToday: (() => {
    //   const closeYesterday = (dayArray[index - 1] || {}).Close;
    //   const openToday = dayArray[index].Open;
    //   return (closeYesterday && closeYesterday < openToday) ? 70 : 30;
    // })(),

  };
};
