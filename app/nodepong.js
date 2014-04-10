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
	secret : 'this is a secret'
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



var FPS = 30;
var W = 1000;
var H = 500;
var KEY_UP = 38;
var KEY_DOWN = 40;
var TOP = 0;
var LEFT = 1;
var BOT = 2;
var RIGHT = 3;

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
	this.nick;
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

var Ball = (function(x, y, w, h, vx, vy, angle) {
	Actor.call(this, x, y, w, h, vx, vy);
	// en radianes
	this.angle = angle;


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
		var dir=RIGHT;
		//this.angle=this.angle%(Math.PI*2);
		//if(this.angle>Math.PI/2 && this.angle < (Math.PI+Math.PI/2)){
			//dir=LEFT;
		//}
		console.log("Dir: "+ dir+"   "+this.angle);
		
		/*if(pos==TOP && dir==LEFT){
			this.angle += Math.PI / 2;
		}
		if(pos==TOP && dir==RIGHT){
			this.angle -= Math.PI / 2;
		}
		if(pos==BOT && dir==LEFT){
			this.angle -= Math.PI / 2;
		}
		if(pos==BOT && dir==RIGHT){
			this.angle += Math.PI / 2;
		}
		if(pos==RIGHT){
			this.angle += Math.PI/2;
		}
		if(pos==LEFT){
			this.angle += Math.PI/2;
		}*/
		
		switch(pos) {
			case TOP:
				this.angle = -this.angle;
				//console.log("TOP");
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
				//console.log("BOT");
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
});
Ball.prototype = new Actor();

function resetBall(dir) {
	b.x = W / 2 - b.w / 2;
	b.y = H / 2 - b.h / 2;
	if(dir==LEFT){
		b.angle=-Math.PI/4;
	}else{
		b.angle=(Math.PI/4)*3;
	}

}
function collides(a, b) {
    return !(
        ((a.y + a.h) < (b.y)) ||
        (a.y > (b.y + b.h)) ||
        ((a.x + a.w) < b.x) ||
        (a.x > (b.x + b.w))
    );
}
/*
function collides(aa, bb) {
	if (Math.abs(aa.x - bb.x) < aa.w + bb.w) {
		if (Math.abs(aa.y - bb.y) < aa.h + bb.h) {
			return true;
		}
	}

	return false;
}*/

function checkCollisions() {
	//goles
	if ((b.x + b.w) < 0) {
		resetBall(LEFT);
		p2.points++;
	}

	if (b.x > W) {
		resetBall(RIGHT);
		p1.points++;
	}

	//colisiones
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
	gameStatus=1;
}

function gameStop() {
	clearInterval(interval);
	gameStatus=0;
}

function gameReset() {
	resetBall();
	p1.points = 0;
	p2.points = 0;
}



var gameStatus=0;
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


function update() {
	b.move();
	checkCollisions();
}


var playerIDCounter = 0;
//var game=require('./game.js');

io.sockets.on('connection', function(socket) {
	//socket.set('id',playerIDCounter);
	//console.log(socket);
	var myid = playerIDCounter;

	playerIDCounter++;
	

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


	if (playerIDCounter == 2) {
		gameStart();
		/*setInterval(function() {
				console.log("Intervalo "+ myid);
				update();
				socket.broadcast.emit('draw', {
					'p1' : p1,
					'p2' : p2,
					'ball' : b
				});
		}, 1000 / FPS);*/
	}
	setInterval(function() {
		if(gameStatus==1){
			socket.emit('draw', {
				'p1' : p1,
				'p2' : p2,
				'ball' : b
			});
		}
	}, 1000 / FPS);


	socket.on('disconnect', function() {
		io.sockets.emit('User ' + myid + 'disconnected');
	});

});

console.log("Listening on port " + port);
