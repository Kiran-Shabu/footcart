var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars')
var app = express();
var db = require('./config/connection')
let handlebars = require('hbs')
var session = require('express-session')
const nocache =require("nocache");

const multer = require("multer")

const dotenv= require('dotenv').config()


var Handlebars = require('handlebars');

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});
Handlebars.registerHelper("checkCancel", function(status, options)
{
    if(status == 'Canceled')
    {
      return true ;
    }else
    {
      return false;
    }
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/'}))

app.use(session({secret : "Key" , cookie:{maxAge:600000}}));
app.use(nocache());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
handlebars.registerHelper('a',function (number){
  console.log(number);
  return parseInt(number)+1;
})

app.use('/', userRouter);
app.use('/admin', adminRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


db.connect((err)=>{
  if(err)

{console.log("connection error"+err);
}
else 
   console.log("connected sucefully");
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
