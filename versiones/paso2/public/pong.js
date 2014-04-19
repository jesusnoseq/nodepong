var url="http://localhost:8080";


var KEY_UP = 38;
var KEY_DOWN = 40;
var canvas = null, ctx = null;


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
	ctx.fillRect(10, 200, 15, 100);

	//BARRA DEL JUGADOR 2
	ctx.fillRect(975, 200, 15, 100);
	
	//BOLITA
	ctx.fillRect(490, 240, 20, 20);

	//RED
	paintLet();
	
	//DATOS
	paintData();
}

function paintLet()
{
	var i;
	for(i=10;i<500;i+=20)
	{
		ctx.fillRect(495,i,10,10);
	}
}

function paintData(data)
{
	//GOLES J1
	ctx.font="75px Arial";
	ctx.fillText(0,390,75); 
	
	//GOLES J2
	ctx.fillText(0,560,75); 
	
	//USERS
	//ctx.font="15px Arial";
	//ctx.fillText(Bill,10,485); 
	//ctx.fillText(Steve,990-(5)*7,485);
}