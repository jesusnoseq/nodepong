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



var Actor = (function(w,h,vx, vy, xIni, yIni) {
	this.vx = vx;
	this.vy = vy;
	this.x = xIni;
	this.y = yIni;
	this.w = w;
	this.h = h;
});

var Jugador = (function(vx, vy, xini, yini, w, h) {
	Actor.call(this, w, h, vx, vy, xini, yini);
	this.nombre;
	this.goles = 0;
	this.mover = (function(dir) {
		switch(dir) {
			case KEY_UP:
				if (this.y > 0) {
					this.y -= this.vy;
				}
				break;
			case KEY_DOWN:
				if ((this.y + this.alto) < altoEscenario) {
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
		var vyt = (this.vy * Math.sin(this.angulo));
		var vxt = (this.vx * Math.cos(this.angulo));
		this.x += vxt;
		this.y += vyt;
		//console.log("angulo: "+this.angulo );
		//console.log( vxt+" --"+vyt + " || "+Math.sin(angulo)+" -- "+Math.cos(angulo));
		//console.log("Actual:"+ this.x+","+this.y);
	});

	this.chocar = (function(pos) {

		switch(pos) {
			case TOP:
				this.angulo += this.angulo + Math.PI / 2;
				break;
			case LEFT:
				this.angulo += this.angulo + Math.PI / 2;
				break;
			case BOT:
				this.angulo += this.angulo + Math.PI / 2;
				console.log("BOT");
				break;
			case RIGHT:
				this.angulo += this.angulo + Math.PI / 2;
				break;
		}

		//this.angulo+Math.PI/4;
		// normalizar

	});
});
Bola.prototype = new Actor();



function resetBola() {
	b.x = anchoEscenario / 2 - b.diametro / 2;
	b.y = altoEscenario / 2 - b.diametro / 2;
}

function checkCol() {
	//goles
	if ((b.x + b.diametro) < 0) {
		resetBola();
		p2.goles++;
	}
	if (b.x > anchoEscenario) {
		resetBola();
		p1.goles++;
	}

	//colisiones
	if (b.y <= 0) {
		b.chocar(TOP);
	}
	if ((b.y + b.diametro) >= altoEscenario) {
		b.chocar(BOT);
	}

	//colision con palas
	if (b.y >= p1.y && (b.y + b.diametro) <= (p1.y + p1.alto)) {
		if (b.x >= p1.x && b.x <= (p1.x + p1.ancho)) {
			b.chocar(LEFT);
		}
	}
	if (b.y >= p2.y && b.y <= p2.y + p2.alto) {
		if ((b.x + b.diametro) <= (p2.x + p2.ancho) && (b.x + b.diametro) <= p2.x) {
			b.chocar(RIGHT);
		}
	}
}

function update() {
	b.mover();
	checkCol();
}

if (jugador1 && jugador2) {

}

function gameStart() {
	interval = setInterval(update, 1000 / FPS);
}

function gameStop() {
	clearInterval(interval);
}

function gameReset() {
	resetBola();
	p1.goles = 0;
	p2.goles = 0;
}



var FPS = 30;
var anchoEscenario = 1000;
var altoEscenario = 500;
var KEY_UP = 38;
var KEY_DOWN = 40;
var TOP = 0;
var LEFT = 1;
var BOT = 2;
var RIGHT = 3;

var p1 = new Jugador(0, 10, 10, 200, 15, 100);
var p2 = new Jugador(0, 10, 975, 200, 15, 100);
var b = new Bola(10, 10, 490, 240, 20, Math.PI / 4);

var jugador1 = null;
var jugador2 = null;
var users = [];

var playerIDCounter = 0;
//var game=require('./game.js');

io.sockets.on('connection', function(socket) {
	//socket.set('id',playerIDCounter);
	//console.log(socket);
	var myid = playerIDCounter;

	playerIDCounter++;
	if (playerIDCounter == 2) {
		gameStart();
	}

	//console.log("New user");
	console.log("Mi ide es: " + myid);
	socket.on('adduser', function(data) {
		if (myid == 0) {
			p1.nombre = data.nombre + "#" + myid;
		} else if (myid == 1) {
			p2.nombre = data.nombre + "#" + myid;
		}
		socket.set('nombre', data.nombre/*, function () { socket.emit('ready'); }*/);
		//console.log(socket);
	});

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
		console.log("Llega " + (data.key) + " de " + myid);
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
		socket.broadcast.emit('draw', {
			'p1' : p1,
			'p2' : p2,
			'bola' : b
		});
	}, 1000 / FPS);

	socket.on('play', function(data) {
		//console.log(data);
	});

	socket.on('disconnect', function() {
		io.sockets.emit('user' + myid + 'disconnected');
	});

});

console.log("Listening on port " + port);