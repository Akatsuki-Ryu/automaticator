var async = require('async');
var helpers = require('../libs/helpers');

exports.simulate = function(req, res, next) {
  if(!req.session.user_id) {
    var error = new Error('Not logged in');
    error.setStatus(401);
    return next(error);
  }
  if(!req.body.eventType) {
    var error = new Error('No event type sent');
    error.setStatus(403);
    return next(error);
  }
  if(req.body.eventType === 'trip') {
    var events = helpers.generateTrip();
    async.mapSeries(events, function(event, cb) {
      sendEvent(helpers.generateEvent(req.session.user_id, event.type, event.location));
      setTimeout(cb, event.delay);
    });
  } else {
    var event = helpers.generateEvent(req.session.user_id, req.body.eventType);
    sendEvent(event);
  }
  res.json({success: true});
};
