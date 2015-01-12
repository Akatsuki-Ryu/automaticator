var db = require('../libs/database');

exports.logs = function(req, res, next) {
  if(!req.session.user_id) {
    var error = new Error('Not logged in');
    error.setStatus(401);
    return next(error);
  }
  db.getLogs(req.session.user_id, function(e, docs) {
    if(e) return next(e);
    res.json(docs);
  });
};
