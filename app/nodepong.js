var express=require('express');
var http=require('http');
var port = 80;

var app=express();
//app.set('port',process.env.PORT || 80);

app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + 'public'));

app.use(express.cookieParser());
app.use(express.session({ secret: 'esto es secreto'}));
app.use(express.bodyParser());
app.use(express.methodOverride());







app.get("/", function(req, res){
    res.render("index");
}); 


var io = require('socket.io').listen(port);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});


//app.listen(port);
console.log("Listening on port " + port);