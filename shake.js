//github copilot generated code

window.onload = function() {
	var shake = function() {
		var body = document.getElementsByTagName('body')[0];
		body.classList.add('shake');

		var rand = Math.round(Math.random() * (1000)) + 3000;
		setTimeout(function() {
			body.classList.remove('shake');
		}, rand);
	}
	var shakeInterval = function() {
		var rand = Math.round(Math.random() * (1000)) + 3000;
		setTimeout(function() {
			shake();
			shakeInterval();
		}, rand);
	}
	shakeInterval();
}