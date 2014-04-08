var KEY_UP = 38;
var KEY_DOWN = 40;

var canvas = null, ctx = null;

window.onload = (function() {

	var socket = io.connect('http://192.168.1.12:8080');

	socket.on('connect', function() {
		socket.send();
		//console.log('Connected!');
	});

	socket.on('draw', function(data) {
		console.log(data);
		paint(ctx,data);
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
			console.log("emitiendo "+lastPress);
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
	
	paint(ctx,data);
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

function paint(ctx,datos) {

	//FONDO
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//BARRA DEL JUGADOR 1
	ctx.fillStyle = '#0f0';
	ctx.fillRect(datos.p1.x, datos.p1.y, datos.p1.ancho, datos.p1.alto);

	//BARRA DEL JUGADOR 2
	ctx.fillStyle = '#0f0';
	ctx.fillRect(datos.p2.x, datos.p2.y, datos.p2.ancho, datos.p2.alto);

	//BOLITA
	ctx.fillStyle = '#f00';
	//ctx.arc(490,240,20,0,(Math.PI/180)*360,true);
	ctx.arc(datos.bola.x, datos.bola.y, datos.bola.radio, 0, (Math.PI / 180) * 360, true);
	ctx.fill();
	//Necesario para rellenar la bola de color y se pueda ver en el escenario
	
	//GOLES
	ctx.font="50px Verdana";
	ctx.fillStyle = '#00f';
	ctx.fillText(datos.p1.goles+"-"+datos.p2.goles,445,50); 
	
	//USERS
	ctx.font="10px Verdana";
	ctx.fillStyle = '#00f';
	ctx.fillText(datos.p1.nombre+"-"+datos.p2.nombre,445,485); 
}

