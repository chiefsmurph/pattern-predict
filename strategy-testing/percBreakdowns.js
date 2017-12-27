module.exports = {
  'overall': () => true,
  'testsPredictedUp': perc => perc > 50,
  // 'withoutUnsures (> 55% || < 45%)': perc => perc < 40 || perc > 60,
  'not recommended at all (< 20%)': perc => perc < 20,
  'not recommended (35 - 50%)': perc => perc > 35 && perc <= 50,
  'sureThings (50 - 60%)': perc => perc > 50 && perc <= 60,
  'real sureThings (60% - 70%)': perc => perc > 60 && perc <= 70,
  'kinda really sureThings (70 - 80%)': perc => perc > 70 && perc <= 80,
  'really sureThings (> 80%)': perc => perc > 80
};
