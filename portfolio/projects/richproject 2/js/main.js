// main.js
// Dependencies: 
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

/*
 .main is an object literal that is a property of the app global
 This object literal has its own properties and methods (functions)
 
 */
app.main = {
	//  properties
    WIDTH : 640, 
    HEIGHT: 480,
    canvas: undefined,
    ctx: undefined,
   	lastTime: 0, // used by calculateDeltaTime() 
    debug: true,
	CIRCLE_STATE: Object.freeze({NORMAL:0,
	EXPLODING:1,
	//MAX_SIZE:2,
	//IMPLODING:3,
	DONE:2}),
   circles : [], numCircles: this.NUM_CIRCLES_START,
   gameState: undefined,
	roundScore:0, totalScore:0,
	paused: false, animationID: 0,
	crashed:false, death:false,
	
    CIRCLE: Object.freeze({
	 NUM_CIRCLES_START:5,
	NUM_CIRCLES_END: 20,
	 START_RADIUS:12,
	 MAX_RADIUS: 45,
	 MIN_RADIUS: 2,
	 MAX_LIFETIME: 2.5,
	 MAX_SPEED:80,
	 //IMPLOSION_SPEED:60,
	 //EXPLOSION_SPEED:84,
	 }),
	 
	 
	 sound:undefined,
	
	GAME_STATE:Object.freeze({
	//BEGIN:0,
	DEFAULT:0,
	//EXPLODING:1,
	END:1,
	}),
	
	//  "Ultra Red", "Ultra Orange", "Ultra Yellow","Chartreuse","Ultra Green","Ultra Blue","Ultra Pink","Hot Magenta"
colors: ["#FD5B78","#FF6037","#FF9966","#FFFF66","#66FF66","#50BFE6","#FF6EFF","#EE34D2","#606020","#ffffff"],
	
    // methods
	circleHitLeftRight: function(c){
	if(c.x <= c.radius || c.x >= this.WIDTH - c.radius){
	return true;
	}
	},
	circleHitTopBottom: function(c){
	if(c.y < c.radius || c.y > this.HEIGHT - c.radius){
	return true;
	}
	},
	
	
	
	makeCircles: function(num){
	var circleMove = function(dt){
	this.x += this.xSpeed *this.speed*dt;
	this.y += this.ySpeed *this.speed*dt;
	};
	
	var circleDraw = function(ctx){
	ctx.save();
	ctx.beginPath();
	ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
	ctx.closePath();
	ctx.fillStyle = this.fillStyle;
	ctx.fill();
	ctx.restore();
	};
	var array = [];
	for(var i = 0; i<num;i++){
	var c = {};
	
	c.x = getRandom(this.CIRCLE.START_RADIUS * 2, this.WIDTH - this.CIRCLE.START_RADIUS *2);
	c.y = getRandom(this.CIRCLE.START_RADIUS * 2, this.HEIGHT - this.CIRCLE.START_RADIUS *2);
	
	c.radius = this.CIRCLE.START_RADIUS;
	
	var randomVector = getRandomUnitVector();
	c.xSpeed = randomVector.x;
	c.ySpeed = randomVector.y;
	
	c.speed = this.CIRCLE.MAX_SPEED;
	c.fillStyle = this.colors[i % this.colors.length];
	c.state = this.CIRCLE_STATE.NORMAL;
	c.lifetime = 0;
	
	c.draw = circleDraw;
	c.move = circleMove;
	
	Object.seal(c);
	array.push(c);
	}
	return array;
	},
	
	drawCircles: function(ctx){
	//if(this.gameState == this.GAME_STATE.ROUND_OVER) this.ctx.globalAlpha = 0.25;
	for(var i=0;i<this.circles.length;i++){
	var c = this.circles[i];
	if(c.state === this.CIRCLE_STATE.DONE) continue;
	c.draw(ctx);
	}
	},
	
	moveCircles: function(dt){
		for(var i=0;i<this.circles.length; i++){
			var c = this.circles[i];
			
			// move circles
			c.move(dt);
		
			// did circles leave screen?
			if(this.circleHitLeftRight(c)){
			c.xSpeed *= -1;
			c.move(dt);
			}
 			if(this.circleHitTopBottom(c)){
			c.ySpeed *= -1;
			c.move(dt);
			}
	
		} // end for loop
	},
	
	drawPauseScreen: function(ctx){
	ctx.save();
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	this.fillText(ctx,"...PAUSED...",this.WIDTH/2,this.HEIGHT/2,"40pt courier", "teal");
	ctx.restore();
	},
	
	drawCrashScreen: function(ctx){
	ctx.save();
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	this.fillText(ctx,"OH DEAR GOD!",this.WIDTH/2,this.HEIGHT/2 - 20,"50pt courier", "red");
	this.fillText(ctx,"An error has occurred. Please reload the window.",this.WIDTH/2,this.HEIGHT/2 + 30,"15pt courier", "green");
	ctx.restore();
	},
	
	drawDeathScreen: function(ctx){
	ctx.save();
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	this.fillText(ctx,"NOOOOO!",this.WIDTH/2,this.HEIGHT/2 - 20,"50pt courier", "red");
	this.fillText(ctx,"If you do that I will die. Please reload the window.",this.WIDTH/2,this.HEIGHT/2 + 30,"15pt courier", "green");
	ctx.restore();
	},
	
	doMouseDown: function(e){
	//this.sound.playBGAudio();
	
	if(this.paused){
	this.paused = false;
	this.update();
	return;
	};
	
	var mouse = getMouse(e);
	this.checkCircleClicked(mouse);
	},
	
	getMouse: function(e){
	var mouse = {} // make an object
	mouse.x = e.pageX - e.target.offsetLeft;
	mouse.y = e.pageY - e.target.offsetTop;
	return mouse;
},

	drawHUD: function(ctx){
		ctx.save(); // NEW
		// draw score
      	// fillText(string, x, y, css, color)
		this.fillText(ctx,"Total collisions: " + this.roundScore/2, 20, 20, "14pt courier", "#ddd");

		
		ctx.restore(); // NEW
	},
	

	checkCircleClicked: function(mouse){
	for(var i = this.circles.length - 1; i>=0;i--){
	var c = this.circles[i];
	if (pointInsideCircle(mouse.x,mouse.y,c)){
	
	this.death = true;
	
	break;
	}
	}
	},

	checkForCollisions: function(){
		//if(this.gameState == this.GAME_STATE.EXPLODING){
			// check for collisions between circles
			for(var i=0;i<this.circles.length; i++){
				var c1 = this.circles[i];
				// only check for collisions if c1 is exploding
				
				for(var j=0;j<this.circles.length; j++){
					var c2 = this.circles[j];
				// don't check for collisions if c2 is the same circle
					if (c1 === c2) continue; 
				// don't check for collisions if c2 is already exploding 
					if (c2.state != this.CIRCLE_STATE.NORMAL ) continue;  
					if (c2.state === this.CIRCLE_STATE.DONE) continue;
				
					// Now you finally can check for a collision
					if(circlesIntersect(c1,c2) ){
						//this.sound.playEffect();
						//c2.state = this.CIRCLE_STATE.EXPLODING;
						c2.xSpeed *= -1;
						c2.ySpeed *= -1;
						//c1.move(dt);
						//c2.move(dt);
						this.roundScore ++;
					}
				}
			} // end for
			
			
				
		//} // end if GAME_STATE_EXPLODING
	},
	
	pauseGame: function(){
	this.paused = true;
	cancelAnimationFrame(this.animationID);
	this.pauseBGAudio();
	this.update();
	},
	
	crashGame: function(){
	this.crashed = true;
	cancelAnimationFrame(this.animationID);
	this.stopBGAudio();
	this.update();
	},
	
	killGame: function(){
	this.death = true;
	cancelAnimationFrame(this.animationID);
	this.stopBGAudio;
	this.update();
	},
	
	resumeGame: function(){
	cancelAnimationFrame(this.animationID);
	this.paused = false;
	this.sound.playBGAudio;
	this.update();
	},
	
	stopBGAudio: function(){
	this.bgAudio.pause();
	this.bgAudio.currentTime = 0;
	//this.bgAudio.stopBGAudio();
	},
	
	pauseBGAudio: function(){
	this.bgAudio.pause();
	},
	
	playEffect:function(){
	this.effectAudio.src = "media/" + this.effectSounds[this.currentEffect];
	this.effectAudio.play();
	
	this.currentEffect += this.currentDirection;
	if(this.curretEffect == this.effectSounds.length || this.currentEffect == -1){
	this.currentDirection *=  -1;
	this.currentEffect += this.currentDirection;
	}},
	
	die: function(){
		 this.death = true;
	},
	
	crashIt: function(){
		 this.crashed = true;
	},
	
	addThing: function(){
		 this.numCircles += 1;
		this.roundScore = 0;
		this.circles = this.makeCircles(this.numCircles);
	},
	
	removeThing: function(){
		 this.numCircles -= 1;
		this.roundScore = 0;
		this.circles = this.makeCircles(this.numCircles);
	},
	
	something: function(){
	this.makeCircles.xSpeed += 1;
	this.makeCircles.ySpeed += 1;
	},
	
	init : function() {
		console.log("app.main.init() called");
		// initialize properties
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		
		this.numCircles = this.CIRCLE.NUM_CIRCLES_START;
		this.circles = this.makeCircles(this.numCircles);
		console.log("this.circles = " + this.circles);
		
		this.bgAudio = document.querySelector("#bgAudio");
		this.bgAudio.volume=0.25;
		this.effectAudio = document.querySelector("#effectAudio");
		this.effectAudio.volume = 0.3;
		this.sound.playBGAudio();
		
		
		
		this.gameState = this.GAME_STATE.DEFAULT;
		this.canvas.onmousedown = this.doMouseDown.bind(this);
		this.reset();
		// start the game loop
		this.update();
	},
	
	reset:function(){
	this.numCircles += 5;
	this.roundScore = 0;
	this.circles = this.makeCircles(this.numCircles);
	},
	
	update: function(){
		// 1) LOOP
		// schedule a call to update()
	 	this.animationID = requestAnimationFrame(this.update.bind(this));
	 	
	 	// 2) PAUSED?
	 	// if so, bail out of loop
	 	if(this.paused){
		this.drawPauseScreen(this.ctx);
		return;
		}
		
		if(this.crashed){
		this.drawCrashScreen(this.ctx);
		return;
		}
		
		if(this.death){
		this.drawDeathScreen(this.ctx);
		return;
		}
	 	// 3) HOW MUCH TIME HAS GONE BY?
	 	var dt = this.calculateDeltaTime();
	 	 
	 	// 4) UPDATE
	 	// move circles
	 	this.moveCircles(dt);
		this.checkForCollisions();
		/*
		if(this.circleHitLeftRight(this.x,this.y,this.radius)){
		this.xSpeed *= -1;
		}
		if(this.circleHitTopBottom(this.x,this.y,this.radius)){
		this.ySpeed *= -1;
		}*/
		
		// 5) DRAW	
		// i) draw background
		this.ctx.fillStyle = "black"; 
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
	
		this.sound.playBGAudio();
		// ii) draw circles
		this.ctx.globalAlpha =0.9;
		this.drawCircles(this.ctx);
		// iii) draw HUD
		this.ctx.globalAlpha =1;
		this.drawHUD(this.ctx);
		
		
		if(this.roundScore/2 >700){
		this.crashed = true;
		}
		
		// iv) draw debug info
		if (this.debug){
			// draw dt in bottom right corner
			this.fillText(ctx,"dt: " + dt.toFixed(3), this.WIDTH - 150, this.HEIGHT - 10, "18pt courier", "white");
		}
		
	},
	
	fillText: function(ctx,string, x, y, css, color) {
		ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		ctx.font = css;
		ctx.fillStyle = color;
		ctx.fillText(string, x, y);
		ctx.restore();
	},
	
	calculateDeltaTime: function(){
		// what's with (+ new Date) below?
		// + calls Date.valueOf(), which converts it from an object to a 	
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},
	
    
    
}; // end app.main