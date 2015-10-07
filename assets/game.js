//http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/

// Check if rot.js can work on this browser
if (!ROT.isSupported()) {
	alert("The rot.js library isn't supported by your browser.");
} else {
	// Good to go!
}

// Create a display 80 characters wide and 20 characters tall
var display = new ROT.Display({width:80, height:20});
var container = display.getContainer();
// Add the container to our HTML page
document.body.appendChild(container);

var foreground, background, colors;
for (var i = 0; i < 15; i++) {
	// Calculate the foreground color, getting progressively darker
	// and the background color, getting progressively lighter.
	foreground = ROT.Color.toRGB([	255 - (i*20),
									255 - (i*20),
									255 - (i*20)]);
	background = ROT.Color.toRGB([i*20, i*20, i*20]);
	// Create the color format specifier.
	colors = "%c{" + foreground + "}%b{" + background + "}";
	// Draw the text at col 2 and row i
	display.drawText(2, i, colors + "Hello, world!");
}