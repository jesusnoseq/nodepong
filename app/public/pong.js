window.onload = (function() {

	var socket = io.connect('http://localhost:8080');

	socket.on('connect', function() {
		socket.send();
		console.log('Connected!');
	});

	socket.on('draw', function(data) {
		console.log(data);
	});

	socket.on('disconnect', function() {
		console.log('Disconnected!');
	});
	
	socket.on('initData', function(data) {
		console.log(data);
		init(data);
	});


});

//window.addEventListener('load',init,false);

var canvas=null, ctx=null;
var datos;


function init(data)
{	
	datos=data;
    canvas=document.getElementById('juego');
    ctx=canvas.getContext('2d');
    setFullScreen();
    paint(ctx);
}

function setFullScreen()
{
	canvas.width=datos.width;
	canvas.height=datos.height;
	
	var w=window.innerWidth/canvas.width;
    var h=window.innerHeight/canvas.height;
    var scale=Math.min(h,w);
 
 	//DEFINIR ANCHO Y ALTO DEL CANVAS
    canvas.style.width=(canvas.width*scale)+'px';
    canvas.style.height=(canvas.height*scale)+'px';
    
    //CENTRAR PANTALLA
    canvas.style.position='fixed';
    canvas.style.left='50%';
    canvas.style.top='50%';
    canvas.style.marginLeft=-(canvas.width*scale)/2+'px';
    canvas.style.marginTop=-(canvas.height*scale)/2+'px';
}

function paint(ctx){
	//FONDO
	ctx.fillStyle='#000';
	ctx.fillRect(0,0,datos.width,datos.height);
	
	//BARRA DEL JUGADOR 1
    ctx.fillStyle='#0f0';
    ctx.fillRect(datos.p1.x,datos.p1.y,datos.p1.ancho,datos.p1.alto);
    
    //BARRA DEL JUGADOR 2
    ctx.fillStyle='#0f0';
    ctx.fillRect(datos.p2.x,datos.p2.y,datos.p2.ancho,datos.p2.alto);
    
    //BOLITA
    ctx.fillStyle='#f00';
    //ctx.arc(490,240,20,0,(Math.PI/180)*360,true);
    ctx.arc(datos.bola.x,datos.bola.y,datos.bola.radio,0,(Math.PI/180)*360,true);
   
    ctx.fill(); //Necesario para rellenar la bola de color y se pueda ver en el escenario
}


function keyPress(key) {
	socket.emit('keypress', {
		keypress : key
	});
}

