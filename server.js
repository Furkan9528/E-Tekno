require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const https = require('https')
const http = require('http')
const path = require('path')
const fs = require('fs')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT 
const mongoose=require('mongoose');
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore =require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events')





//Database
mongoose.connect(process.env.MONGO_CONNECTION_URL,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify: true
});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('connection is successfull')
}).catch(err => {
    console.log("no connection ");
});


// Session Store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

//Session Authentication
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 *24} // 24 heurs
}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use(flash())

//Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})


//set Template engine
app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)
app.use((req, res) => {
    res.status(404).render('errors/404')
})

var https_port    =   process.env.PORT_HTTPS || 8000; 
 
 const options = {
    key: fs.readFileSync('./certificate/key.pem'),
    cert: fs.readFileSync('./certificate/cert.pem')
  };

  app.set("port",https_port);

  server = https.createServer(options, app).listen(https_port, function () {
    console.log('Magic happens on port ' + https_port); 
   });


   http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(PORT,https_port) + req.url });
    console.log("http requet, will go to >> ");
    console.log("https://" + req.headers['host'].replace(PORT,https_port) + req.url );
    res.end();
  }).listen(PORT);


// const server = app.listen(PORT, () => {
//     console.log(`Listening on port ${PORT}`)
// })

// Socket
const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})

 