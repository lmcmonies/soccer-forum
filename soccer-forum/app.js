
const express        = require('express');
const engine         = require('ejs-mate');
const path           = require('path');
const cookieParser   = require('cookie-parser');
const logger         = require('morgan');
const bodyParser     = require('body-parser');
const passport       = require('passport');

const flash          = require('connect-flash');
const User           = require('./models/user');
const session        = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config({path:'.env'});
const mongoose       = require('mongoose');
const MONGO_KEY = process.env.MONGO_KEY;

//require routes
const indexRouter = require('./routes/index');

const app = express();

//connect to the database
//const url = 'mongodb://localhost:27017/soccer-forum';
connectDB = async () => {
   await mongoose.connect(MONGO_KEY, 
    { useUnifiedTopology: true, 
      useNewUrlParser: true, 
      useCreateIndex: true })
      console.log('connected_DB');
};

connectDB();





//use ejs-locals for all ejs templates
app.engine('ejs', engine);

// view engine setup
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
//set public assets directory
app.use(express.static('public'));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname , 'public')));
app.use(methodOverride('_method'));
app.use(flash());


//configure passport and sessions
app.use(session({
  secret: 'BCW',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//set local variables middleware & flash messages
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.error =  req.flash("error");
  res.locals.success =  req.flash("success");
 next();
});


//mount routes
app.use('/', indexRouter);

//ignore favicon.ico 500 error
function ignoreFavicon(req, res, next) {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).json({nope: true});
  } else {
    next();
  }
}

app.use(ignoreFavicon);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
 //set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
   console.log(err);
   req.session.error = err.message;
   res.redirect('back');
 });


module.exports = app;
