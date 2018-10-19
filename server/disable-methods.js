'use strict';
module.exports = function(model) {
  var methodNames = [
    'create',
    'upsert',
    'deleteById',
    'updateAll',
    'updateAttributes',
    'patchAttributes',
    'createChangeStream',
    'findOne',
    'find',
    'findById',
    'count',
    'exists',
    'replace',
    'replaceById',
    'upsertWithWhere',
    'replaceOrCreate',
  ];

  methodNames.forEach(function(methodName) {
    if (!!model.prototype[methodName]) {
      model.disableRemoteMethodByName('prototype.' + methodName);
    } else {
      model.disableRemoteMethodByName(methodName);
    }
  });
};
