const percBreakdowns = require('./percBreakdowns');

module.exports = (todaysOutlook, strategyPerformance) => {

  const newStrategies = Object.keys(todaysOutlook.strategies).reduce((acc, stratKey) => {

    const stratValue = todaysOutlook.strategies[stratKey];
    const breakdownMet = Object.keys(percBreakdowns).reverse().find(breakdownName => {
      // console.log('checking out', breakdownName);
      const percFilter = percBreakdowns[breakdownName];
      return percFilter(stratValue);
    });
    const breakdownPerformance = strategyPerformance.find(breakdownObj => {
      return breakdownObj.breakdownName === breakdownMet;
    });
    // console.log(breakdownPerformance)
    const stratPerf = breakdownPerformance.strategyPerformance.find(stratPerf => stratPerf.strategy === stratKey).percCorrect;
    acc[stratKey] = {
      val: stratValue,
      testPerformance: stratPerf
    };

    return acc;
  }, {});

  return {
    ...todaysOutlook,
    strategies: newStrategies
  };
  
};
