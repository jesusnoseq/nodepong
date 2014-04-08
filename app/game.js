var Game = (function() {
	this.FPS = 30;
	this.speed = 10;
	this.scenaryWidth = 1000;
	this.scenaryHeight = 500;

	this.Actor = (function(velocidad, xIni, yIni) {
		this.v = velocidad;
		this.x = xIni;
		this.y = yIni;
	});

	this.Jugador = (function() {
		this.ancho = 10;
		this.alto = 50;
		this.mover = (function(dir) {
			switch(dir) {
				case 1:
					this.y += this.v;
					break;
				case 2:
					this.y -= this.v;
					break;
				default:

			}
		});
	});

	this.Bola = (function(angulo) {
		this.radio = 20;
		this.angulo = angulo;
		// en radianes

		this.mover = (function() {
			vy = (float)(v * Math.sin(angulo));
			vx = (float)(v * Math.cos(angulo));
			x += vx;
			y -= vy;
		});

		this.chocar = (function() {
			this.angulo *= -1;
		});
	});

	Jugador.prototype = new Actor();
	Bola.prototype = new Actor();

	function update() {

	}

	this.p1 = new Player();
	this.p2 = new Player();
	this.b = new Bola();
});
module.exports = Game;

