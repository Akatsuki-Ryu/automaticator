exports.index = function(req, res) {
  if(process.env.TOKEN) {
    req.session.access_token = process.env.TOKEN;
    req.session.user_id = process.env.USER_ID;
  }

  if(req.session && req.session.access_token) {
    res.render('map');
  } else {
    res.render('signin');
  }
};


exports.logs = function(req, res) {
  if(req.session && req.session.access_token) {
    res.render('logs');
  } else {
    res.redirect('/');
  }
};


exports.simulate = function(req, res) {
  if(req.session && req.session.access_token) {
    res.render('simulate');
  } else {
    res.redirect('/');
  }
};


exports.force_https = function(req, res, next) {
  if(req.headers['x-forwarded-proto'] != 'https') {
    res.redirect('https://' + req.headers.host + req.path);
  } else {
    next();
  }
};
