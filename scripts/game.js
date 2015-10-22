var Game ={
	_display: null,
	_ui: null,
	_width: 80,
	_height: 25,
	init: function() {
		// Any necessary initialization will go here.
		this._display = new ROT.Display({width: this._width,
													height: this._height});
		// Create a helper function for binding to an event
		// and making it send it to the screen
		var game = this; // So that we don't lose this
		var bindEventToScreen = function(event) {
				window.addEventListener(event, function(e) {
					// When an event is received, send it to the
					// screen if there is one
					if (game._ui !== null) {
						// Send the event type and data to the screen
						game._ui.controls(event, e);
					 }
				});
		};
		// Bind keyboard input events
		bindEventToScreen('keydown');
		//bindEventToScreen('keyup');
		bindEventToScreen('keypress');
	},
	changeUI: function(ui) {
		if (this._ui) {
			this._ui.exit();
		}
		this._ui = ui;
		this._ui.enter();
		this._ui.render(this._display);
	}
};

window.onload = function() {
	// Check if rot.js can work on this browser
	if (!ROT.isSupported()) {
		alert("The rot.js library isn't supported by your browser.");
	} else {
		// Initialize the game
		Game.init();
		// Add the container to our HTML page
		document.body.appendChild(Game._display.getContainer());
		// Load the start screen
		Game.changeUI(Game.UI.startScreen);
	 }
};