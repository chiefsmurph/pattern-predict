const arrayAvg = require('../utils/arrayAvg');

// takes in todaysPerms and generates final calls

module.exports = todaysPerms => {
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
    })()
  };
};
