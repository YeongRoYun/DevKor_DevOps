const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const passportConfig = require('./passport');
const cookieParser = require('cookie-parser');


const indexRouter = require('./routes');
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const shopRouter = require('./routes/shop');
const errorRouter = require('./routes/error');
const reviewRouter = require('./routes/review');

dotenv.config();
passportConfig();

const app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', paht.join(__dirname, 'views'));
app.set('views engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie',
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    if(process.env.NODE_ENV === 'production') {
        morgan('combined')(req, res, next);
    } else {
        morgan('dev')(req, res, next);
    }
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/shop', shopRouter);
app.use('/review', reviewRouter);
app.use(errorRouter);

app.listen(app.get('port'), ()=> {
    console.log(app.get('port'), 'ready...');
});