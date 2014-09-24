var request = require('request')
  , nconf = require('nconf');


exports.authorize = function(req, res) {
  var scopes = 'scope:trip scope:location scope:vehicle:profile scope:vehicle:events';
  res.redirect(nconf.get('AUTOMATIC_AUTHORIZE_URL') + '?client_id=' + nconf.get('AUTOMATIC_CLIENT_ID') + '&response_type=code&scope=' + scopes);
};


exports.logout = function(req, res) {
  req.session.destroy();
  res.redirect('/');
};


exports.redirect = function(req, res) {
  if(req.query.code) {
    request.post({
      uri: nconf.get('AUTOMATIC_AUTH_TOKEN_URL'),
      form: {
          client_id: nconf.get('AUTOMATIC_CLIENT_ID')
        , client_secret: nconf.get('AUTOMATIC_CLIENT_SECRET')
        , code: req.query.code
        , grant_type: 'authorization_code'
      }
    }, saveAuthToken);
  } else {
    res.redirect('/');
  }

  function saveAuthToken(e, r, body) {
    var access_token;
    try {
      access_token = JSON.parse(body || '{}');
      req.session.access_token = access_token.access_token;
      req.session.user_id = access_token.user.id;
      req.session.scopes = access_token.scopes;
      res.redirect('/');
    } catch(e) {
      console.log(e);
      res.json({error: 'No access token'});
    }
  }
};
