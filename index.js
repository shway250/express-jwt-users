var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var User = require('./models/user');
var app = express();

var secret = 'supersecretpassword';

mongoose.connect('mongodb://localhost:27017/myauthenticatedusers');

app.use('/api/users', expressJWT({secret: secret}).unless({method: 'POST'}));
app.use(function(err, req, res, next){
  if(err.name === 'UnauthorizedError'){
    res.status(401).send({message: 'You need authorization, loser'});
  }
});
app.use(bodyParser.urlencoded({extended:true}));
app.use('/api/users', require('./controllers/users'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/auth', function(req, res){
  User.findOne({email: req.body.email}, function(err, user){
    if(err || !user) return res.send({message: 'User not found'});
    user.authenticated(req.body.password, function(){
      if(err || !user) return res.send({message: 'User not authenticated'});
      var token = jwt.sign(user, secret);
      res.send({user: user, token: token});
    });
  });
});

app.listen(3000);
