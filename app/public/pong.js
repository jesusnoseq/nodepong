window.onload = (function() {

	var socket = io.connect('http://localhost:8080');

	socket.on('connect', function() {
		socket.send();
		console.log('Connected!');
	});

	socket.on('initData', function(data) {
		console.log(data);
		console.log(data.FPS);
	});
	socket.on('draw', function(data) {
		console.log(data);
	});

	socket.on('disconnect', function() {
		console.log('Disconnected!');
	});
	
	socket.on('initData', function(data) {
		console.log(data);
	});

});

window.addEventListener('load',init,false);

var canvas=null, ctx=null;

function init(){
    canvas=document.getElementById('juego');

    
    ctx=canvas.getContext('2d');
    
    setFullScreen();
    paint(ctx);
}

function setFullScreen()
{
	canvas.width=1000;
	canvas.height=500;
	
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
	ctx.fillRect(0,0,1000,500);
	
	//BARRA DEL JUGADOR 1
    ctx.fillStyle='#0f0';
    ctx.fillRect(10,200,15,100);
    
    //BARRA DEL JUGADOR 2
    ctx.fillStyle='#0f0';
    ctx.fillRect(975,200,15,100);
    
    //BOLITA
    ctx.fillStyle='#f00';
    ctx.arc(490,240,20,0,(Math.PI/180)*360,true);
    ctx.fill(); //Necesario para rellenar la bola de color y se pueda ver en el escenario
}


function keyPress(key) {
	socket.emit('keypress', {
		keypress : key
	});
}

