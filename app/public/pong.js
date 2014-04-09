var url="http://192.168.1.13:8080";


var KEY_UP = 38;
var KEY_DOWN = 40;
var canvas = null, ctx = null;

window.onload = (function() {
	var nombre = prompt("Please enter your name");

	var socket = io.connect(url);

	socket.on('connect', function() {
		socket.emit('adduser',{'nombre':nombre});
	});

	socket.on('draw', function(data) {
		paint(data);
	});

	socket.on('disconnect', function() {
		console.log('Disconnected!');
	});

	socket.on('initData', function(data) {
		init(data);
	});

	//Leemos que tecla estamos pulsando
	document.addEventListener('keydown', function(evt) {
		var lastPress = evt.keyCode;
		if (lastPress == KEY_UP || lastPress == KEY_DOWN) {
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
	pintaRed();
	
	//DATOS
	pintaDatos(data);
}

function pintaRed()
{
	var i;
	for(i=10;i<500;i+=20)
	{
		ctx.fillRect(495,i,10,10);
	}
}

function pintaDatos(data)
{
	//GOLES J1
	ctx.font="75px Arial";
	ctx.fillText(data.p1.goles,390,75); 
	
	//GOLES J2
	ctx.fillText(data.p2.goles,560,75); 
	
	//USERS
	ctx.font="15px Arial";
	ctx.fillText(data.p1.nombre,10,485); 
	ctx.fillText(data.p2.nombre,990-(data.p2.nombre.length)*7,485); //HAY QUE CORREGIR LA SITUACION DEL NOMBRE
}