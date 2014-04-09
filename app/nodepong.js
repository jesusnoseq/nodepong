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
io.set('log level', 1);
io.set('transports', ['websocket']);
/*
 io.configure('production', function(){
 io.enable('browser client etag');
 io.set('log level', 1);

 io.set('transports', [
 'websocket',
 'flashsocket'
 ]);
 });

process.env.NODE_ENV = 'development';
io.configure('development', function() {
	io.set('transports', ['websocket']);
});*/

/*
 setInterval(function() {
 update();
 player.draw();
 }, 1000/FPS);
 */
var playerIDCounter = 0;
//var game=require('./game.js');
var FPS = 30;
var anchoEscenario = 1000;
var altoEscenario = 500;
var KEY_UP = 38;
var KEY_DOWN = 40;


var Actor = (function(vx, vy, xIni, yIni) {
	this.vx = vx;
	this.vy = vy;
	this.x = xIni;
	this.y = yIni;
});

var Jugador = (function(vx, vy, xini, yini, ancho, alto) {
	Actor.call(this, vx, vy, xini, yini);
	this.nombre;
	this.ancho = ancho;
	this.alto = alto;
	this.goles = 0;
	this.mover = (function(dir) {
		switch(dir) {
			case KEY_UP:
				if(this.y>0){
					console.log("Moviendo arriba !!"+this.y);
					this.y -= this.vy;
				}
				break;
			case KEY_DOWN:
				console.log("Moviendo abajo !!"+this.y);
				if((this.y+this.alto)<altoEscenario){
					console.log("mueve outa");
					this.y += this.vy;
				}
				break;
			default:

		}
	});
});
Jugador.prototype = new Actor();

var Bola = (function(vx, vy, xini, yini, diametro, angulo) {
	Actor.call(this, vx, vy, xini, yini);
	this.diametro = diametro;
	this.angulo = angulo;
	// en radianes

	this.mover = (function() {
		var vyt = (this.vy * Math.sin(angulo));
		var vxt = (this.vx * Math.cos(angulo));
		this.x += vxt;
		this.y -= vyt;
	});

	this.chocar = (function() {
		this.angulo *= -1;
	});
});
Bola.prototype = new Actor();

var p1 = new Jugador(0, 10, 10, 200, 15, 100);
var p2 = new Jugador(0, 10, 975, 200, 15, 100);
var b = new Bola(5, 5, 490, 240, 20, 0);

function resetBola(){
	b.x=anchoEscenario/2-b.ancho/2;
	b.y=altoEscenario/2-b.alto/2;
}

function checkCol() {
	//goles
	if((b.x+b.diametro)<0){
		resetBola();
		p2.goles++;
	}
	if(b.x>anchoEscenario){
		resetBola();
		p1.goles++;
	}
	//colisiones
	if(b.y<0){
		b.chocar();
	}
	if((b.y+b.diametro)>altoEscenario){
		b.chocar();
	}
	if(b.y<altoEscenario){
		b.chocar();
	}
	if(b.y<altoEscenario){
		b.chocar();
	}
	if(b.y< p1.y && b.y > p1.y+p1.alto){
		if(b.x< p1.x && b.x > p1.x+p1.ancho){
			b.chocar();
		}
	}
	if(b.y< p2.y && b.y > p2.y+p2.alto){
		if(b.x< p2.x && b.x > p2.x+p2.ancho){
			b.chocar();
		}
	}
}

function update() {
	//b.mover();
	//checkCol();
}



io.sockets.on('connection', function(socket) {
	//socket.set('id',playerIDCounter);
	var myid = playerIDCounter;
	if(myid==0){
		p1.nombre="Player"+myid;
	}else if(myid==1){
		p2.nombre="Player"+myid;
	}

	playerIDCounter++;
	console.log("New user");
	console.log("Mi ide es: " + myid);

	socket.emit('initData', {
		'id' : myid,
		'width' : anchoEscenario,
		'height' : altoEscenario,
		'FPS' : FPS,
		'p1' : p1,
		'p2' : p2,
		'bola' : b
	});

	socket.on('keypress', function(data) {
		console.log("Llega "+(data.key)+" de "+myid);
		if (myid == 0) {
			p1.mover((data.key));
			console.log("player 1 " + (data.key));
		} else if (myid == 1) {
			p2.mover((data.key));
			console.log("player 2 " + (data.key));
		}
	});

	
	setInterval(function() {
		update();
		socket.emit('draw', {
			'p1' : p1,
			'p2' : p2,
			'bola' : b
		});
	}, 1000 / FPS);


	socket.on('play', function(data) {
		//console.log(data);
	});

	socket.on('disconnect', function() {
		io.sockets.emit('user disconnected');
	});

});

console.log("Listening on port " + port);
