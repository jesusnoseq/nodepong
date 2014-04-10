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

var Actor = (function(w, h, x, y, vx, vy) {
	this.w = w;
	this.h = h;
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
});

var Paddle = (function(w, h, x, y, vx, vy) {
	Actor.call(this, w, h, x, y, vx, vy);
	this.points = 0;
	this.move = (function(dir) {
		switch(dir) {
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
	});
});
Paddle.prototype = new Actor();

var Ball = (function(w, h, x, y, vx, vy, angulo) {
	Actor.call(this, w, h, x, y, vx, vy);angle
	this.angle = angle;
	// en radianes

	this.move = (function() {
		var vyt = (this.vy * Math.sin(this.angle));
		var vxt = (this.vx * Math.cos(this.angle));
		this.x += vxt;
		this.y += vyt;
		//console.log("angulo: "+this.angulo );
		//console.log( vxt+" --"+vyt + " || "+Math.sin(angulo)+" -- "+Math.cos(angulo));
		//console.log("Actual:"+ this.x+","+this.y);
	});

	this.collide = (function(pos) {
		switch(pos) {
			case TOP:
				this.angle += this.angle + Math.PI / 2;
				break;
			case LEFT:
				this.angle += this.angle + Math.PI / 2;
				break;
			case BOT:
				this.angle += this.angle + Math.PI / 2;
				console.log("BOT");
				break;
			case RIGHT:
				this.angle += this.angle + Math.PI / 2;
				break;
		}

		//this.angulo+Math.PI/4;
		// normalizar

	});
});
Ball.prototype = new Actor();

function resetBola() {
	b.x = W / 2 - b.h / 2;
	b.y = W / 2 - b.w / 2;
}

function checkCollisions() {
	//goles
	if ((b.x + b.w) < 0) {
		resetBall();
		p2.poins++;
	}
	if (b.x > W) {
		resetBall();
		p1.poins++;
	}

	//colisiones
	if (b.y <= 0) {
		b.chocar(TOP);
	}
	if ((b.y + b.h) >= H) {
		b.chocar(BOT);
	}

	//colision con palas
	if (b.y >= p1.y && (b.y + b.h) <= (p1.y + p1.h)) {
		if (b.x >= p1.x && b.x <= (p1.x + p1.w)) {
			b.chocar(LEFT);
		}
	}
	if (b.y >= p2.y && b.y <= p2.y + p2.h) {
		if ((b.x + b.w) <= (p2.x + p2.w) && (b.x + b.w) <= p2.x) {
			b.chocar(RIGHT);
		}
	}
}

function update() {
	b.move();
	checkCollisions();
}

function gameStart() {
	interval = setInterval(update, 1000 / FPS);
}

function gameStop() {
	clearInterval(interval);
}

function gameReset() {
	resetBall();
	p1.points = 0;
	p2.points = 0;
}

var FPS = 30;
var W = 1000;
var H = 500;
var KEY_UP = 38;
var KEY_DOWN = 40;
var TOP = 0;
var LEFT = 1;
var BOT = 2;
var RIGHT = 3;

var p1 = new Paddle(0, 10, 10, 200, 15, 100);
var p2 = new Paddle(0, 10, 975, 200, 15, 100);
var b = new Paddle(10, 10, 490, 240, 20, Math.PI / 4);

var player1 = null;
var player2 = null;
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
			p1.nick = data.nick + "#" + myid;
		} else if (myid == 1) {
			p2.nick = data.nick + "#" + myid;
		}
		socket.set('nick', data.nick/*, function () { socket.emit('ready'); }*/);
		//console.log(socket);
	});

	socket.emit('initData', {
		/*'id' : myid,*/
		'width' : W,
		'height' : H,
		'p1' : p1,
		'p2' : p2,
		'ball' : b
	});

	socket.on('keypress', function(data) {
		if (myid == 0) {
			p1.move((data.key));
		} else if (myid == 1) {
			p2.move((data.key));
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
		io.sockets.emit('User ' + myid + 'disconnected');
	});

});

console.log("Listening on port " + port);
