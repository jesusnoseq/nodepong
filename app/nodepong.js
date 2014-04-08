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

/*
 setInterval(function() {
 update();
 player.draw();
 }, 1000/FPS);
 */
var playerIDCounter = 0;
//var game=require('./game.js');
var FPS = 30;
var ancho = 1000;
var alto = 500;

var Actor = (function(vx, vy, xIni, yIni) {
	this.vx = vx;
	this.vy = vy;
	this.x = xIni;
	this.y = yIni;
});

var Jugador = (function(vx,vy,xini,yini,ancho,alto) {
	Actor.call(this,vx,vy,xini,yini);
	this.ancho = ancho;
	this.alto = alto;
	this.mover = (function(dir) {
		switch(dir) {
			case 1:
				this.y += this.v;
				break;
			case 2:
				this.y -= this.v;
				break;
			default:

		}
	});
});
Jugador.prototype = new Actor();

var Bola = (function(vx,vy,xini,yini,radio,angulo) {
	Actor.call(this,vx,vy,xini,yini);
	this.radio = radio;
	this.angulo = angulo;
	// en radianes

	this.mover = (function() {
		vy = (float)(v * Math.sin(angulo));
		vx = (float)(v * Math.cos(angulo));
		x += vx;
		y -= vy;
	});

	this.chocar = (function() {
		this.angulo *= -1;
	});
});
Bola.prototype = new Actor();

var anchoPala=15;
var altoPala=100;
var p1 = new Jugador(0,10,10,200,15,100);
var p2 = new Jugador(0,10,975,200,15,100);
var b = new Bola(5,5,490,240,10,0);


function update() {

}

io.sockets.on('connection', function(socket) {
	//socket.set('id',playerIDCounter);
	playerIDCounter++;
	console.log("New user");

	socket.emit('initData', {
		'id' : playerIDCounter,
		'width' : ancho,
		'height' : alto,
		'FPS' : FPS,
		'p1' : p1,
		'p2' : p2,
		'bola' : b
	});

	if (playerIDCounter == 2) {
		socket.emit('draw', {
			'p1' : p1,
			'p2' : p2,
			'bola' : b
		});

		socket.on('play', function(data) {
			console.log(data);
		});
	}
	socket.on('disconnect', function() {
		io.sockets.emit('user disconnected');
	});

});

console.log("Listening on port " + port);
