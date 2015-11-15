

var resolveup = require('./');
// console.log(resolveup('*'));

console.time('generators');
console.log(resolveup(['generate-*', '@*/generate-*'], {realpath: true}));
console.timeEnd('generators');
