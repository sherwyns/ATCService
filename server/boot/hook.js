// 'use strict';
// module.exports = function(app) {
//   var remotes = app.remotes();
//     // modify all returned values
//   remotes.after('**', function(ctx, next) {
//     if (ctx) {
//       ctx.result = {
//         status: true,
//         data: ctx.result,
//         message: 'Success',
//       };
//     } else {
//       var err = new Error();
//       next({
//         status: false,
//         data: err,
//         message: 'oops! Something went wrong',
//       });
//     }
//     next();
//   });
// };
