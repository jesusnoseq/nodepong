var express = require("express");
var app = express();
var port = 8080;

//app.set('port',process.env.PORT || 80);

app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(express.cookieParser());
app.use(express.session({
	secret : 'esto es secreto'
}));

//Estas dos lineas estan añadidas para que funcione bien el server en mi maquina concretamente en vez de
//app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());

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

process.env.NODE_ENV = 'development';
io.configure('development', function() {
	io.set('transports', ['websocket']);
});

var playerIDCounter = 0;
var FPS = 30;
var speed = 10;
var scenaryWithd=1000;
var scenaryHeight=500;

var Actor = (function(velocidad, xIni, yIni) {
	this.v = velocidad;
	this.x = xIni;
	this.y = yIni;
});

var Jugador=(function() {

	this.mover=(function (dir) {
		switch(dir) {
			case 1:
				this.y+=this.v;
				break;
			case 2:
				this.y-=this.v;
				break;
			default:

		}
	});
});

var Bola=(function(angulo) {
	this.angulo=angulo;// en radianes

	this.mover = (function() {
		vy = (float)(v * Math.sin(angulo));
		vx = (float)(v * Math.cos(angulo));
		x += vx;
		y -= vy;
	});

	this.chocar = (function() {

	});
});

Jugador.prototype = new Actor();
Bola.prototype = new Actor();

function update(){
	
}


/*
setInterval(function() {
    update();
    player.draw();
}, 1000/FPS);
*/


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
