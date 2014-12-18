var request = require('request'),
    nconf = require('nconf');


var oauth2 = require('simple-oauth2')({
  clientID: nconf.get('AUTOMATIC_CLIENT_ID'),
  clientSecret: nconf.get('AUTOMATIC_CLIENT_SECRET'),
  site: 'https://accounts.automatic.com',
  tokenPath: '/oauth/access_token'
});

var authorization_uri = oauth2.authCode.authorizeURL({
  scope: 'scope:trip scope:location scope:vehicle:profile scope:vehicle:events'
});

exports.index = function(req, res) {
  if(req.session && req.session.access_token) {
    res.render('map');
  } else {
    res.render('signin');
  }
};


exports.authorize = function(req, res) {
  res.redirect(authorization_uri);
};


exports.redirect = function(req, res) {
  var code = req.query.code;

  oauth2.authCode.getToken({
    code: code
  }, saveToken);

  function saveToken(error, result) {
    if (error) {
      console.log('Access token error', error.message);
      res.send('Access token error: ' +  error.message);
      return;
    }

    // Attach `token` to the user's session for later use
    var token = oauth2.accessToken.create(result);

    req.session.access_token = token.token.access_token;
    req.session.user_id = token.token.user.id;

    res.redirect('/');
  }
};


exports.logout = function(req, res) {
  req.session.destroy();
  res.redirect('/');
};


exports.logs = function(req, res) {
  if(req.session && req.session.access_token) {
    res.render('logs');
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


exports.check_dev_token = function(req, res, next) {
  if(process.env.TOKEN) {
    req.session.access_token = process.env.TOKEN;
    req.session.user_id = process.env.USER_ID;
  }
  next();
};
