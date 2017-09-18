module.exports = function(){
  "use strict";
  var config = {
    src: ['./src/**/*.js'],
    dest: './dist/',
    exp: './examples',
    lint: {
      config: './.eslintrc',
      ignore: './.eslintignore'
    }
  };
  return config;
};
