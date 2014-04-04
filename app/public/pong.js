window.onload = (function() {

	var socket = io.connect('http://localhost:80');

	socket.on('connect', function() {
		socket.send();
		console.log('Connected!');
		
		
		//player = new Player(50, 50);
	});

	socket.on('draw', function(data) {
		console.log(data);
	});

	socket.on('disconnect', function() {
		console.log('Disconnected!');
	});

});

function keyPress(key) {
	socket.emit('keypress', {
		keypress : key
	});
}
