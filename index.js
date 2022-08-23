const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')
const flash = require('connect-flash');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize')
const cors = require('cors')
const {create} = require('express-handlebars');
const csrf = require('csurf');

const User = require('./models/User');
require('dotenv').config();
const clientDB = require('./database/db')

const app = express();

const corsOptions = {
    credentials: true,
    origin: process.env.PATHHEROKU || '*',
    methods: ['GET', 'POST']
}

app.use(cors())

app.use(session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: 'secret-name-peter',
    store: MongoStore.create({
        clientPromise: clientDB,
        dbName: process.env.DBNAME
    }),
    cookie: {secure: process.env.MODO === 'production' ? true : false, maxAge: 30 * 24 * 60 * 60 * 1000},
}));

app.use(flash());

app.use(passport.initialize())
app.use(passport.session())

//mis preguntas
passport.serializeUser((user, done) => done(null, {id: user._id, userName: user.userName}))
passport.deserializeUser(async(user, done) => {
    const userDB = await User.findById(user.id)
    return done(null, {id: userDB._id, username: userDB.userName})
})

app.get('/mensaje-flash', (req, res) => {
    res.json(req.flash('mensaje'))
})

app.get('/crear-mensaje', (req, res) => {
    req.flash('mensaje', 'este es un mensaje de error')
    res.redirect('/mensaje-flash')
})

app.get('/ruta-protegida', (req, res) => {
    res.json(req.session.usuario || 'Sin sesión de usuario')
});

app.get('/crear-session', (req, res) => {
    req.session.usuario = 'Peter';
    res.redirect('/ruta-protegida');
})

app.get('/destruir-session', (req, res) => {
    req.session.destroy()
    res.redirect('/ruta-protegida')
})

const hbs = create({
    extname: '.hbs',
    partialsDir: ["views/components"],
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.urlencoded({extended: true}));

app.use(csrf());
app.use(mongoSanitize())

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken()
    res.locals.mensajes = req.flash('mensajes')
    next()
})

app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth'));
app.use(express.static(__dirname + "/public"));

const port = process.env.PORT || 5600;
app.listen(port, () => console.log("servidor andando en puerto " + port));