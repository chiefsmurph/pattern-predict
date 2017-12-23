const csv = require('csvtojson');

function csvToArray(file) {
  return new Promise((resolve, reject) => {
    const returnArr = [];
    csv()
      .fromFile(file)
      .on('json', jsonObj => {
        // console.log('json', jsonObj);
        returnArr.push(jsonObj);
      })
      .on('done', error => {
      	// console.log('end');
        resolve(returnArr);
      });
  });
}

module.exports = csvToArray;
