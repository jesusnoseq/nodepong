var express = require("express");
var app = express();
var port = 8080;

// Fijando el sistema de plantillas
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// Indicando las rutas de ficheros de vistas y estaticos
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


// Definiendo rutas
app.get("/", function(req, res) {
	res.render("index");
});

// Indicamos que escuche en el puerto especificado
var io = require('socket.io').listen(app.listen(port));
// Nivel de log de socket.io
io.set('log level', 1);
//Indicando metodos de comunicacion a usar
io.set('transports', ['websocket']);



// Constantes del juego
var FPS = 30;
var W = 1000;
var H = 500;
var KEY_UP = 38;
var KEY_DOWN = 40;
var TOP = 0;
var LEFT = 1;
var BOT = 2;
var RIGHT = 3;
var STARTED = 1;
var STOPPED = 0;

var Actor = (function(x, y, w, h, vx, vy) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.vx = vx;
	this.vy = vy;
});

var Paddle = (function(x, y, w, h, vx, vy) {
	Actor.call(this, x, y, w, h, vx, vy);
	this.points = 0;
	this.dir=0;
	
	this.lastKey=(function(key){
		this.dir=key;
	});
	
	this.move = (function() {
		switch(this.dir) {
			case KEY_UP:
				if (this.y > 0) {
					this.y -= this.vy;
				}
				break;
			case KEY_DOWN:
				if ((this.y + this.h) < H) {
					this.y += this.vy;
				}
				break;
			default:

		}
		this.dir=0;
	});
});
Paddle.prototype = new Actor();

var Ball = (function(x, y, w, h, vx, vy, angle) {
	Actor.call(this, x, y, w, h, vx, vy);
	// en radianes
	this.angle = angle;


	this.move = (function() {
		var vyt = (this.vy * Math.sin(this.angle));
		var vxt = (this.vx * Math.cos(this.angle));
		this.x += vxt;
		this.y -= vyt;
	});

	this.collide = (function(pos) {
		switch(pos) {
			case TOP:
				this.angle = -this.angle;
				break;
			case LEFT:
				if (this.angle>0){
					this.angle -= Math.PI / 2;
				}else{
					this.angle += Math.PI / 2;
				}
				break;
			case BOT:
				this.angle= -this.angle;
				break;
			case RIGHT:
				if (this.angle>0){
					this.angle += Math.PI / 2;
				}else{
					this.angle -= Math.PI / 2;
				}
				break;
		}
	});
	
	this.resetBall= (function (dir) {
		b.x = W / 2 - b.w / 2;
		b.y = H / 2 - b.h / 2;
		if(dir==LEFT){
			b.angle=-Math.PI/4;
		}else{
			b.angle=(Math.PI/4)*3;
		}
	});
});
Ball.prototype = new Actor();


// variables del juego
var playerCounter = 0;
var gameStatus=STOPPED;
var interval;

var paddleW = 15;
var paddleH = 100;
var ballDiam = 20;

var p1 = new Paddle(10 					, H/2-paddleH/2 , paddleW , paddleH , 0 , 20 );
var p2 = new Paddle(W-10-paddleW		, H/2-paddleH/2 , paddleW , paddleH , 0 , 20 );
var b  = new Ball  (W / 2 - ballDiam/2	, H/2-ballDiam/2, ballDiam, ballDiam, 10, 10, -Math.PI/4);

var player1 = null;
var player2 = null;
var users = [];



function collides(a, b) {
    return !(
        ((a.y + a.h) < (b.y)) ||
        (a.y > (b.y + b.h)) ||
        ((a.x + a.w) < b.x) ||
        (a.x > (b.x + b.w))
    );
}

function checkCollisions() {
	//goles
	if ((b.x + b.w) < 0) {
		b.resetBall(LEFT);
		p2.points++;
	}

	if (b.x > W) {
		b.resetBall(RIGHT);
		p1.points++;
	}

	//colisiones con paredes
	if (b.y <= 0) {
		b.collide(TOP);
	}
	if ((b.y + b.h) >= H) {
		b.collide(BOT);
	}

	//colision con palas
	if (collides(p1, b)) {
		b.collide(LEFT);
	}

	if (collides(p2, b)) {
		b.collide(RIGHT);
	}
}

function gameStart() {
	interval = setInterval(update, 1000 / FPS);
	gameStatus=STARTED;
}

function gameStop() {
	clearInterval(interval);
	gameStatus=STOPPED;
}

function gameReset() {
	b.resetBall();
	p1.points = 0;
	p2.points = 0;
}

function chagePlayer(){
	for (var i = 0; i < users.length; ++i){
		if(users[i]!=player1 && users[i]!=player2){
			if(player1==null){
				player1=users[i];
				return true;
			}else if(player2==null){
				player2=users[i];
				return true;
			}
		}
	}
	return false;
}

function update() {
	p1.move();
	p2.move();
	b.move();
	checkCollisions();
	io.sockets.emit('draw', {
		'p1' : p1,
		'p2' : p2,
		'ball' : b
	});
}



// Parte para cada cliente
io.sockets.on('connection', function(socket) {
	socket.on('adduser', function(data) {
		playerCounter++;
		console.log(' Contador:' + playerCounter);
		console.log(data);
	});
	
	socket.on('disconnect', function() {
		console.log("Cliente desconectado");
	});
});

console.log("Listening on port " + port);
