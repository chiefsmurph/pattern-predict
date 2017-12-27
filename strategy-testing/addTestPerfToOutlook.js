const percBreakdowns = require('./percBreakdowns');
const calcStrategyPerformance = require('./calcStrategyPerformance');

module.exports = (todaysOutlook, testResults) => {

  const strategyPerformance = calcStrategyPerformance(testResults);
  console.log(JSON.stringify(strategyPerformance, null, 2), 'stratperf');

  const newStrategies = Object.keys(todaysOutlook.strategies).reduce((acc, stratKey) => {

    const stratValue = todaysOutlook.strategies[stratKey];
    const breakdownMet = Object.keys(percBreakdowns).reverse().find(breakdownName => {
      // console.log('checking out', breakdownName);
      const percFilter = percBreakdowns[breakdownName];
      return percFilter(stratValue);
    });

    const stratPerf = Object.keys(strategyPerformance).reduce((acc, timeBreakdown) => {
      const timePeriodStratPerf = strategyPerformance[timeBreakdown];
      const breakdownPerformance = timePeriodStratPerf.find(breakdownObj => {
        return breakdownObj.breakdownName === breakdownMet;
      });
      // console.log(breakdownPerformance)
      const stratPerf = breakdownPerformance.strategyPerformance[stratKey];
      acc[timeBreakdown] = stratPerf;
      return acc;
    }, {});

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
