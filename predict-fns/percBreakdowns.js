module.exports = {
  'overall': () => true,
  'testsPredictedUp': perc => perc > 50,
  'withoutUnsures (> 55% || < 45%)': perc => perc < 40 || perc > 60,
  'sureThings (> 55%)': perc => perc > 50,
  'real sureThings (> 60%)': perc => perc > 60,
  'kinda really sureThings (> 65%)': perc => perc > 65,
  'really sureThings (> 70%)': perc => perc > 70
};
