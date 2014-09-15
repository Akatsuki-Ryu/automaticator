var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var memoryStore = session.MemoryStore;
var store = new memoryStore();
var db = require('./database');

var nconf = require('nconf');

var routes = require('./routes');
var api = require('./routes/api');
var oauth = require('./routes/oauth');

var app = express();

app.set('store', store);

nconf.env().argv();
nconf.file('./config.json');

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser(nconf.get('SESSION_SECRET')));
app.use(session({
  store: store,
  secret: nconf.get('SESSION_SECRET'),
  saveUninitialized: true,
  resave: true
}));
app.use(express.static(path.join(__dirname, 'public')));


if (app.get('env') !== 'development') {
  app.all('*', routes.force_https);
}

app.get('/', routes.index);
app.get('/logs/', routes.logs);
app.get('/logs/api/', api.logs);

app.get('/authorize/', oauth.authorize);
app.get('/logout/', oauth.logout);
app.get('/redirect/', oauth.redirect);

app.post('/webhook/', function(req, res) {
  var wss = app.get('wss');
  console.log('>>>>>>> Incoming Webhook: ' + JSON.stringify(req.body));
  if(req.body) {
    wss.sendEvent(req.body);
    db.saveLog(req.body);
    res.json({success: true});
  }
});


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if(app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.send({
    message: err.message,
    error: {}
  });
});


module.exports = app;
