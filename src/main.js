var gameWorld;

window.addEventListener("DOMContentLoaded", function () {
	/* create a game world, including canvas, context and configuration... load resources */
	gameWorld = Object.create(World).init();

	//var s = Object.create(Scene).init("mainmenu");
	//gameWorld.scene = s;

});