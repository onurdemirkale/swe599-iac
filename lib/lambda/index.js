'use strict';
exports.__esModule = true;
exports.main = void 0;
const main = function (event, context, callback) {
  console.log('Event: '.concat(JSON.stringify(event, null, 2)));
  console.log('Context: '.concat(JSON.stringify(context, null, 2)));
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello World!',
    }),
  });
};
exports.main = main;
