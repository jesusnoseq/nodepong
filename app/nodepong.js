var express = require("express");
var app = express();
var port = 80;

//app.set('port',process.env.PORT || 80);

app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(express.cookieParser());
app.use(express.session({
	secret : 'esto es secreto'
}));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.get("/", function(req, res) {
	res.render("index");
});

var io = require('socket.io').listen(app.listen(port));

/*
io.configure('production', function(){
  io.enable('browser client etag');
  io.set('log level', 1);

  io.set('transports', [
    'websocket',
    'flashsocket'
  ]);
});*/
process.env.NODE_ENV = 'production';
io.configure('development', function(){
  io.set('transports', ['websocket']);
});

var playerIDCounter = 0;
var fps = 30;
var speed = 10;


io.sockets.on('connection', function(socket) {
	//socket.set('id',playerIDCounter);
	playerIDCounter++;
	
	
	socket.emit('draw', {
		//id : socket.get('id')
	});

	socket.on('play', function(data) {
		console.log(data);
	});
	
	socket.on('disconnect', function() {
		io.sockets.emit('user disconnected');
	});
});

console.log("Listening on port " + port); 