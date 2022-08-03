require('dotenv').config();
var compression = require('compression');
var createError = require('http-errors');
var express = require('express');
var helmet = require('helmet');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var groceriesRouter = require('./routes/groceries');

var app = express();

app.use(helmet());

var dev_db_url = 'mongodb+srv://wasim:1234@cluster0.cl5o5.mongodb.net/inventory-db?retryWrites=true&w=majority';
var mongoDB = process.env.MONGODB_URL || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/groceries', groceriesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
