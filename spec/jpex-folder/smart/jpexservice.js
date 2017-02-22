var jpex = require('jpex');

module.exports = jpex.extend({
  constructor : function(){
    this.test = 'jpex service';
  },
  interface : 'iinterface'
});
