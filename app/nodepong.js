var express = require("express");
var app = express();
var port = 80;
 

//app.set('port',process.env.PORT || 80);

app.set('view engine', "jade");
app.engine('jade', require('jade').__express);


app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public')); 


app.use(express.cookieParser());
app.use(express.session({ secret: 'esto es secreto'}));
app.use(express.bodyParser());
app.use(express.methodOverride());



app.get("/", function(req, res){
    res.render("index");
});


var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
	
  socket.emit('news', { hello: 'world' });
  
  socket.on('play', function (data) {
    console.log(data);
  });
});

console.log("Listening on port " + port);