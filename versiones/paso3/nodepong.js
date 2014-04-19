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


var clientCounter=0;
// Parte para cada cliente
io.sockets.on('connection', function(socket) {
	socket.on('adduser', function(data) {
		clientCounter++;
		console.log(' Contador:' + clientCounter);
		console.log(data);
	});
	
	
	socket.on('disconnect', function() {
		console.log("Cliente desconectado");
	});
});

console.log("Listening on port " + port);
