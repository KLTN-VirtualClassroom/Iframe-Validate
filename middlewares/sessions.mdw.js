var session = require('express-session');
export default function (app){
    
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'SECRET_KEY',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    //secure: true 
  }
}));

}