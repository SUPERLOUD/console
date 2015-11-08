var canVas = document.createElement('canvas');
canVas.id = "gameWindow";
canVas.width = 1280;
canVas.height = 720;
document.body.appendChild(canVas);
var ctx = canVas.getContext("2d");

var bg = new Image();
bg.src = "static/bkgrd.png";
ctx.drawImage(bg,0,0,1280,720);

var flr = 75;
var lastTime;
var lastFire = Date.now();
var scaleFactor = 3;
var background;
var explosion;
var characters = [];
var entities = [];
var punches = [[],[]];
var playerSpeed = [200,200];
var gravityspeed = [0,0];
// [up,left,down,right,A,B]
var playerAction = [[false,false,false,false,false,false,0],
		    [false,false,false,false,false,false,0]];

var syncanoKey = "0c652470a423f5edea87fc77956f7e8b129ca607";
var instanceKey = "dark-snowflake-7198";
var syncanoChannel = "super-loud";
/*
var syncanoKey = "b52cb72f9b01c614d882bc5712a3f32b97cb9001";
var instanceKey = "todolist";
var syncanoChannel = "todo-list";
*/
var jumplimiter = [10,10];

var gameover = false;
var gametime = 90;

var directions = [3,2];

var syncano = new Syncano({
    apiKey: syncanoKey,
    instance: instanceKey,
    userKey: "680405847ef8175e53ee7c834fd9e27ca6312d22"
});

function watch(){
    syncano.channel(syncanoChannel).poll()
	.then(function(res){
	    console.log(res);
	    if(res==="NO CONTENT"){
		if(!gameover)
		    watch();
	    }else if(res.action==="update"){
		console.log(res.payload);
		switch(res.payload.id){
		case 17: playerAction[0][0] = !playerAction[0][0]; break;
		case 18: playerAction[0][1] = !playerAction[0][1]; break;
		case 19: playerAction[0][2] = !playerAction[0][2]; break;
		case 20: playerAction[0][3] = !playerAction[0][3]; break;
		case 21: playerAction[0][4] = !playerAction[0][4]; break;
		case 22: playerAction[0][5] = !playerAction[0][5]; break;
		case 23: playerAction[0][6] += res.payload.dummy; break;
		case 24: playerAction[1][0] = !playerAction[1][0]; break;
		case 25: playerAction[1][1] = !playerAction[1][1]; break;
		case 26: playerAction[1][2] = !playerAction[1][2]; break;
		case 27: playerAction[1][3] = !playerAction[1][3]; break;
		case 28: playerAction[1][4] = !playerAction[1][4]; break;
		case 29: playerAction[1][5] = !playerAction[1][5]; break;
		case 30: playerAction[1][6] += res.payload.dummy; break;
		default: break;
		}
		
		watch();
	    }
	}).catch(function(err){
	    console.log(err);
	});
}

resources.load(['../static/bkgrd.jpg',
                '../static/p1 walk.png',
                '../static/p1 walk flipped.png',
                '../static/p1 stand.png',
                '../static/p1 stand flipped.png',
                '../static/p2 walk.png',
                '../static/p2 walk flipped.png',
                '../static/p2 stand.png',
                '../static/p2 stand flipped.png',
                '../static/explosion.png',
		'../static/punch.png',
		'../static/punch flipped.png']);
resources.onReady(getReady);
function getReady(){
    var topX = 500;
    var topY = 300;
    var bW = 240;
    var bH = 80;
    var dx = 65;
    var dy = 59;
    var hover = false;
    var btnVal = "Start";
    if(gameover){
	topY = 500;
	btnVal = "Try Again";
	dx = 10;
    }
    ctx.fillStyle = "rgb(150,150,150)";
    ctx.fillRect(topX,topY,bW,bH);
    entities.push({x:topX,y:topY,width:bW,height:bH});
    ctx.font = "50px Arial";
    ctx.fillStyle = "rgb(50,50,50)";
    ctx.fillText(btnVal,topX+dx,topY+dy);
    entities.push({"x":topX+dx,'y':topY+dy,'width':-1,'height':-1});
    canVas.onmousemove = function(e){
	var x = e.pageX - canVas.offsetLeft;
	var y = e.pageY - canVas.offsetTop;
	if(x>entities[0].x && x<entities[0].x+entities[0].width&&
	   y > entities[0].y && y < entities[0].y+entities[0].height){
	    if(!hover){
		ctx.fillStyle = "rgb(120,120,120)";
		ctx.fillRect(topX,topY,bW,bH);
		entities.push({x:topX,y:topY,width:bW,height:bH});
		ctx.font = "50px Arial";
		ctx.fillStyle = "rgb(50,50,50)";
		ctx.fillText(btnVal,topX+dx,topY+dy);
		hover = !hover;
	    }
	}
	else{
	    if(hover){
		ctx.fillStyle = "rgb(150,150,150)";
		ctx.fillRect(topX,topY,bW,bH);
		entities.push({x:topX,y:topY,width:bW,height:bH});
		ctx.font = "50px Arial";
		ctx.fillStyle = "rgb(50,50,50)";
		ctx.fillText(btnVal,topX+dx,topY+dy);
		hover = !hover;
	    }
	}
    };
    canVas.onclick = function(e){
	var x = e.pageX - canVas.offsetLeft;
	var y = e.pageY - canVas.offsetTop;
	if(x>entities[0].x && x<entities[0].x+entities[0].width&&
	   y > entities[0].y && y < entities[0].y+entities[0].height){
	    ctx.drawImage(bg,0,0,1280,720);
	
	    lastTime = 0.0; 
	    characters = [];
	    entities = [];
	    punches = [[],[]];
	    playerSpeed = [200,200];
	    playerAction = [[false,false,false,false,false,false,0],
			    [false,false,false,false,false,false,0]];

	    jumplimiter = [10,10];
	    gravityspeed = [0,0];
	    gameover = false;
	    gametime = 90;  

	    init();
	    watch();
	    window.requestAnimationFrame(main);
	    entities= [];
	    canVas.onclick = null;
	    canVas.onmousemove = null;
	}
    }
}

function init(){
    background = resources.get('../static/bkgrd.jpg');
    explosion = resources.get('../static/explosion.png');
    characters.push({
	pos:[200,360],
	sprite: [new Sprite('../static/p1 walk.png',[0,0],[48,48],3,[0,1,2,]),
                new Sprite('../static/p1 walk flipped.png',[0,0],[48,48],3,[0,1,2]),
                new Sprite('../static/p1 stand.png',[0,0],[48,48],4,[0,1,2,1]),
                new Sprite('../static/p1 stand flipped.png',[0,0],[48,48],4,[0,1,2,1])
        ],
        HP:300,
	power:0
    });
    characters.push({
	pos:[1000,360],
	sprite: [new Sprite('../static/p2 walk.png',[0,0],[48,48],3,[0,1,2]),
                new Sprite('../static/p2 walk flipped.png',[0,0],[48,48],3,[0,1,2]),
                new Sprite('../static/p2 stand.png',[0,0],[48,48],4,[0,1,2,1]),
                new Sprite('../static/p2 stand flipped.png',[0,0],[48,48],4,[0,1,2,1])],
        HP:400,
	power:0
    });
    ctx.drawImage(background,0,0,1280,720);
    lastTime = Date.now();
}

function update(dt){
    handleInput(dt);
    for(var i = 0;i<characters.length;i++){
	characters[i].sprite[directions[i]].update(dt);
        //gravity
        characters[i].pos[1] += gravityspeed[i];
	characters[i].power = playerAction[i][6];
    }
    for(var i = 0;i<punches[0].length;i++){
	if(Date.now()-punches[0][i].DOB > 1000){
	    console.log('punch you too old!');
	    punches[0].splice(i,1);
	}
	else{
	    punches[0][i].pos = characters[0].pos;
	    punches[0][i].sprite[0].update(dt);
	}
    }
    for(var i = 0;i<punches[1].length;i++){
	if(Date.now()-punches[1][i].DOB > 1000)
	    punches[1].splice(i,1);
	else{
	    punches[1][i].pos = characters[1].pos;
	    punches[1][i].sprite[0].update(dt);
	}
	    
    }
}

function render(){
    ctx.fillRect(0,0,1280,720);
    ctx.drawImage(background,0,0,1280,720);
    for(var i = 0;i<characters.length;i++){
	renderEach(characters[i],directions[i]);
    }
    for(var i = 0;i<punches[0].length;i++){
	console.log("here some punches");
	renderEach(punches[0][i],0);
    }
    for(var i = 0;i<punches[1].length;i++){
	renderEach(punches[1][i],0);
    }
}

function renderEach(entity,i){
    ctx.save();
    ctx.translate(entity.pos[0],entity.pos[1]);
    entity.sprite[i].render(ctx,scaleFactor);
    ctx.restore();
}

function handleInput(dt){
    
    //player 1
    if((input.isDown("UP")||playerAction[1][0])&&jumplimiter[1]<10){
	characters[1].pos[1] -= playerSpeed[1] * dt * 5;
	jumplimiter[1]++;
    }
    else if (jumplimiter[1] > 0) {
        jumplimiter[1] = 10;
        gravityspeed[1]++;
    }
    if(input.isDown("DOWN")||playerAction[1][2])
	characters[1].pos[1] += playerSpeed[1] * dt;
    
    if(input.isDown("LEFT")||playerAction[1][1]) {
	characters[1].pos[0] -= playerSpeed[1] * dt;
        directions[1] = 0;
    }
    else if(input.isDown("RIGHT")||playerAction[1][3]) {
	characters[1].pos[0] += playerSpeed[1] * dt;
        directions[1] = 1;
    }
    else if (input.getlastkey() == "LEFT") directions[1] = 2;
    else if (input.getlastkey() == "RIGHT") directions[1] = 3;
    
    //player 2
    if((input.isDown("w")||playerAction[0][0])&&jumplimiter[0]<10){
	characters[0].pos[1] -= playerSpeed[0] * dt * 5;
	jumplimiter[0]++;
    }
    else if (jumplimiter[0] > 0) {
        jumplimiter[0] = 10;
        gravityspeed[0]++;
    }
    if(input.isDown("s")||playerAction[0][2])
	characters[0].pos[1] += playerSpeed[0] * dt;
    
    if(input.isDown("a")||playerAction[0][1]) {
	characters[0].pos[0] -= playerSpeed[0] * dt;
        directions[0] = 0;
    }
    else if(input.isDown("d")||playerAction[0][3]) {
	characters[0].pos[0] += playerSpeed[0] * dt;
        directions[0] = 1;
    }
    else if (input.getlastkey() == "A") directions[0] = 2;
    else if (input.getlastkey() == "D") directions[0] = 3;

    if(input.isDown("g")|| playerAction[0][4]){
	if(Date.now() - lastFire > 100){
	    var pSizeX = characters[0].sprite[0].size[0];
	    var pSizeY = characters[0].sprite[0].size[1];
	    var file = "../static/punch.png";
	    if(input.getlastkey() == "A"){
		pSizeX = -pSizeX;
		file = "../static/punch flipped.png";
	    }
	    var x = characters[0].pos[0] + pSizeX;
	    var y = characters[0].pos[1] + pSizeY;
	    punches[0].push({pos:[x,y],
			     sprite:[new Sprite("../static/explosion.png",[0,0],[50,50],1,[0])],
			     DOB:Date.now()
			    });
		
	}
	    lastFire = Date.now();
    }
    if(input.isDown("h")||playerAction[0][5]){}
    if(input.isDown("n")|| playerAction[1][4]){
    	if(Date.now() - lastFire > 100){
	    var pSizeX = characters[1].sprite[0].size[0];
	    var pSizeY = characters[1].sprite[0].size[1];
	    var file = "../static/punch.png";
	    if(input.getlastkey() == "LEFT"){
		pSizeX = -pSizeX;
		file = "../static/punch flipped.png";
	    }
	    var x = characters[1].pos[0] + pSizeX;
	    var y = characters[1].pos[1] + pSizeY;
	    punches[1].push({pos:[x,y],
			     sprite:[new Sprite("../static/explosion.png",[0,0],[50,50],1,[0])],
			     DOB:Date.now()
			    });
	    
	}
	lastFire = Date.now();
    }
    if(input.isDown("m")||playerAction[1][5]){}
}

var requestAnimFrame = function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
}
    
function checkPlayerBounds() {
    //character 0 x coordinates
    if (characters[0].pos[0] < 0)
	characters[0].pos[0] = 0;
    
    if (characters[0].pos[0] > canVas.width-flr - characters[0].sprite[0].size[0]*scaleFactor)
	characters[0].pos[0] = canVas.width-flr - characters[0].sprite[0].size[0]*scaleFactor;
    
    //character 0 floor and reset jump and gravity speed
    if (characters[0].pos[1] >canVas.height-flr - characters[0].sprite[0].size[1]*scaleFactor) {
        characters[0].pos[1] = canVas.height-flr - characters[0].sprite[0].size[1]*scaleFactor;
        if (jumplimiter[0] > 0) {
	    jumplimiter[0] = 0;
            gravityspeed[0] = 0;
        }
    }
    
    //character 1 x coordinates
    if (characters[1].pos[0] < 0)
	characters[1].pos[0] = 0;
    
    if (characters[1].pos[0] > canVas.width-flr - characters[1].sprite[0].size[0]*scaleFactor)
	characters[1].pos[0] = canVas.width-flr - characters[1].sprite[0].size[0]*scaleFactor;
    
    //character 1 floor and reset jump
    if (characters[1].pos[1] > canVas.height-flr - characters[1].sprite[0].size[1]*scaleFactor) {
        characters[1].pos[1] = canVas.height-flr - characters[1].sprite[0].size[1]*scaleFactor;
        if (jumplimiter[1] > 0) {
	    jumplimiter[1] = 0;
            gravityspeed[1] = 0;
        }
    }
}

function dealdamage(target,damage) {
    characters[target].HP -= damage;
    ctx.fillStyle = "#FF0000";
    ctx.drawImage(explosion,characters[target].pos[0],characters[target].pos[1]-characters[target].sprite[0].size[0]/2,40,40);
    ctx.fillText(damage,characters[target].pos[0]+10,characters[target].pos[1]+5);
}

function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(pos1, size1, pos2, size2) {
    return collides(pos1[0], pos1[1],
                    pos1[0] + size1[0], pos1[1] + size1[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions() {
    checkPlayerBounds();
    if (boxCollides(characters[0].pos,
		    characters[0].sprite[0].size,
		    characters[1].pos,
		    characters[1].sprite[0].size)) {
	/*
        characters[0].HP--;
        characters[1].HP--;
	*/
	dealdamage(1,5);
    }
}

function drawthings() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(Math.floor(gametime),canVas.width/2-10,50);
    ctx.fillRect(150,80,characters[0].HP,10);
    ctx.fillText(characters[0].HP,170+characters[0].HP,90);
    ctx.fillRect(730+(400-characters[1].HP),80,characters[1].HP,10);
    ctx.fillText(characters[1].HP,670+(400-characters[1].HP),90);
    ctx.save();
    ctx.lineWidth="4";
    ctx.strokeRect(75,canVas.height-30,175,20);
    ctx.strokeRect(canVas.width-250,canVas.height-30,175,20);
    ctx.restore();
    ctx.save();
    var p1_gradient = ctx.createLinearGradient(75,0,250,0);
    p1_gradient.addColorStop(0,"#000000");
    p1_gradient.addColorStop(1,"#EEEEEE");
    ctx.fillStyle=p1_gradient;
    ctx.fillRect(75,canVas.height-28,characters[0].power,16);
    var p2_gradient = ctx.createLinearGradient(1030,0,1185,0);
    p2_gradient.addColorStop(1,"#000000");
    p2_gradient.addColorStop(0,"#EEEEEE");
    ctx.fillStyle=p2_gradient;
    ctx.fillRect(1030+(175-characters[1].power),canVas.height-28,
		 characters[1].power,16);
    ctx.restore();
}

function foo(){
    characters[0].power++;
    characters[1].power++;    
    console.log(characters[0].power,characters[1].power);
}
function printgameover() {
    ctx.save();
    ctx.fillStyle = "rgba(50,50,50,.4)";
    ctx.fillRect(0,0,canVas.width,canVas.height);
    ctx.restore();
    ctx.font = "80px Arial";
    ctx.fillText("GAME OVER", canVas.width/2-250, canVas.height/2);
    getReady();
}

function main(){
    var now = Date.now();
    var dt = (now - lastTime)/1000.0;
    
    update(dt);
    render();
    checkCollisions();
    
    lastTime = Date.now();
    
    if (!gameover) window.requestAnimationFrame(main);
    
    gametime-=dt;
    drawthings();
    if (characters[0].HP <= 0 || characters[1].HP <= 0) {
        gameover = true;
        printgameover();
	return;
    }
    if (gametime < 0) {
        gameover = true;
        printgameover();
	return;
    }
};
