Game.UI = {};

Game.UI.startScreen = {
	_parent: null,
	enter: function() {
		console.log("Entered start screen.");
	},
	exit: function() { console.log("Exited start screen."); },
	render: function(display) {
		// Render our prompt to the screen
		display.drawText(1,1, "%c{yellow}Javascript Roguelike");
		display.drawText(1,2, "Press [Enter] to start!");
	},
	controls: function (itype, idata) {
		if (itype == "keydown") {
			if (idata.keyCode == ROT.VK_RETURN) {
				alert("hello world!");
			}
		}		
	}
};

