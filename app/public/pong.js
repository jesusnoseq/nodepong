var KEY_UP = 38;
var KEY_DOWN = 40;

var canvas = null, ctx = null;

window.onload = (function() {
	var nombre = prompt("Please enter your name");

	var socket = io.connect('http://localhost:8080');

	socket.on('connect', function() {
		socket.emit('adduser',{'nombre':nombre});
		//console.log('Connected!');
	});

	socket.on('draw', function(data) {
		//console.log(data);
			
		paint(data);
	});

	socket.on('disconnect', function() {
		console.log('Disconnected!');
	});

	socket.on('initData', function(data) {
		//console.log(data);
		init(data);
	});

	//Leemos que tecla estamos pulsando
	document.addEventListener('keydown', function(evt) {
		var lastPress = evt.keyCode;
		if (lastPress == KEY_UP || lastPress == KEY_DOWN) {
			//console.log("emitiendo "+lastPress);
			socket.emit('keypress', {
				'key' : lastPress
			});
		}
	}, false);


});

function init(data) {
	canvas = document.getElementById('juego');
	ctx = canvas.getContext('2d');

	setFullScreen(data);
	
	paint(data);
}



function setFullScreen(data) {
	canvas.width = data.width;
	canvas.height = data.height;

	var w = window.innerWidth / canvas.width;
	var h = window.innerHeight / canvas.height;
	var scale = Math.min(h, w);

	//DEFINIR ANCHO Y ALTO DEL CANVAS
	canvas.style.width = (canvas.width * scale) + 'px';
	canvas.style.height = (canvas.height * scale) + 'px';

	//CENTRAR PANTALLA
	canvas.style.position = 'fixed';
	canvas.style.left = '50%';
	canvas.style.top = '50%';
	canvas.style.marginLeft = -(canvas.width * scale) / 2 + 'px';
	canvas.style.marginTop = -(canvas.height * scale) / 2 + 'px';
}

function paint(data) {		
	//FONDO
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//BARRA DEL JUGADOR 1
	ctx.fillStyle = '#fff';
	ctx.fillRect(data.p1.x, data.p1.y, data.p1.ancho, data.p1.alto);

	//BARRA DEL JUGADOR 2
	ctx.fillRect(data.p2.x, data.p2.y, data.p2.ancho, data.p2.alto);
	
	//BOLITA
	ctx.fillRect(data.bola.x, data.bola.y, data.bola.diametro, data.bola.diametro);

	//RED
	//pintaRed();
	
	
	//GOLES
	ctx.font="50px Verdana";
	ctx.fillText(data.p1.goles+"-"+data.p2.goles,445,50); 
	
	//USERS
	ctx.font="10px Verdana";
	ctx.fillText(data.p1.nombre+"-"+data.p2.nombre,445,485); 
}

function pintaRed()
{
	var i;
	for(i=10;i<500;i+20)
		ctx.fillRect(495,i,10,10);
}



