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
app.listen(port);


console.log("Listening on port " + port);
