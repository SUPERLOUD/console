var canVas = document.createElement('canvas');
canVas.id = "gameWindow";
canVas.width = 1280;
canVas.height = 720;
document.body.appendChild(canVas);
var ctx = canVas.getContext("2d");

var bg = new Image();
bg.src = "static/bkgrd.png";
ctx.drawImage(bg,0,0,1280,720);

var lastTime;
var scaleFactor = 3;
var background;
var explosion;
var characters = [];
var entities = [];
var playerSpeed = [200,200];
var playerSpeedx = [0,0];
var playerSpeedy = [0,0];
var knockbackSpeedx = [0,0];
var knockbackSpeedy = [0,0];
var gravityspeed = [0,0];
// [up,left,down,right,A,B]
var playerAction = [[false,false,false,false,false,false],
		    [false,false,false,false,false,false]];

//var syncanoKey = "2d2f7c0e75b16769aadb93a2a28111117d43deb5";
//var instanceKey = "dark-snowflake-7198";
//var syncanoChannel = "super-loud";

var syncanoKey = "b52cb72f9b01c614d882bc5712a3f32b97cb9001";
var instanceKey = "todolist";
var syncanoChannel = "todo-list";

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
	    if(res==="NO CONTENT"){
		if(!gameover)
		    watch();
	    }else if(res.action==="update"&&res.payload){
		var val = res.payload.iscompleted;
		switch(res.payload.id){
		case 8100: playerAction[0][0] = val; break;
		case 8102: playerAction[0][1] = val; break;
		case 8103: playerAction[0][2] = val; break;
		case 8104: playerAction[0][3] = val; break;
		case 8105: playerAction[1][0] = val; break;
		case 8106: playerAction[1][1] = val; break;
		case 8107: playerAction[1][2] = val; break;
		case 8108: playerAction[1][3] = val; break;
		default: break;
		}
		
		watch();
	    }
	}).catch(function(err){
	    console.log(err);
	});
}

resources.load(['../static/bkgrd.png',
                '../static/p1 walk.png',
                '../static/p1 walk flipped.png',
                '../static/p1 stand.png',
                '../static/p1 stand flipped.png',
                '../static/p2 walk.png',
                '../static/p2 walk flipped.png',
                '../static/p2 stand.png',
                '../static/p2 stand flipped.png',
                '../static/explosion.png']);
resources.onReady(getReady);
function getReady(){
    console.log("ready");
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
	    //	entities = [];
	    playerSpeed = [200,200];
            playerSpeedx = [0,0];
            playerSpeedy = [0,0];
            knockbackSpeedx = [0,0];
            knockbackSpeedy = [0,0];
	    playerAction = [[false,false,false,false,false,false],
			    [false,false,false,false,false,false]];

	    jumplimiter = [10,10];
	    gravityspeed = [0,0];
	    gameover = false;
	    gametime = 90;  

	    init();
//	    watch();
	    window.requestAnimationFrame(main);
	    entities= [];
	    canVas.onclick = null;
	    canVas.onmousemove = null;
	}
    }
}

function init(){
    background = resources.get('../static/bkgrd.png');
    explosion = resources.get('../static/explosion.png');
    characters.push({
	pos:[200,360],
	sprite: [new Sprite('../static/p1 walk.png',[0,0],[48,48],3,[0,1,2,]),
                new Sprite('../static/p1 walk flipped.png',[0,0],[48,48],3,[0,1,2]),
                new Sprite('../static/p1 stand.png',[0,0],[48,48],4,[0,1,2,1]),
                new Sprite('../static/p1 stand flipped.png',[0,0],[48,48],4,[0,1,2,1])
        ],
        HP:400
    });
    characters.push({
	pos:[1000,360],
	sprite: [new Sprite('../static/p2 walk.png',[0,0],[48,48],3,[0,1,2]),
                new Sprite('../static/p2 walk flipped.png',[0,0],[48,48],3,[0,1,2]),
                new Sprite('../static/p2 stand.png',[0,0],[48,48],4,[0,1,2,1]),
                new Sprite('../static/p2 stand flipped.png',[0,0],[48,48],4,[0,1,2,1])],
        HP:400
    });
    ctx.drawImage(background,0,0,1280,720);
    lastTime = Date.now();
}

function update(dt){
    handleInput(dt);
    updatepositions();
    for(var i = 0;i<characters.length;i++){
	characters[i].sprite[directions[i]].update(dt);
        //gravity
        //characters[i].pos[1] += gravityspeed[i];
        playerSpeedy[i] += gravityspeed[i];
        knockbackSpeedy[0] += .25;
        knockbackSpeedy[1] += .25;
    }
}

function render(){
    ctx.fillRect(0,0,1280,720);
    ctx.drawImage(background,0,0,1280,720);
    for(var i = 0;i<characters.length;i++){
	renderEach(characters[i],directions[i]);
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
    if((input.isDown("UP")||playerAction[0][0])&&jumplimiter[0]<10){
	//characters[0].pos[1] -= playerSpeed[0] * dt * 5;
        playerSpeedy[0] = playerSpeed[0] * dt * -5;
	jumplimiter[0]++;
    }
    else if (jumplimiter[0] > 0) {
        jumplimiter[0] = 10;
        gravityspeed[0] += .25;
    }
    if(input.isDown("DOWN")||playerAction[0][2]) {
	//characters[0].pos[1] += playerSpeed[0] * dt;
        playerSpeedy[0] = playerSpeed[0] * dt;
    }
    
    if(input.isDown("LEFT")||playerAction[0][1]) {
	//characters[0].pos[0] -= playerSpeed[0] * dt;
        playerSpeedx[0] = playerSpeed[0] * dt * -1;
        directions[0] = 0;
    }
    else if(input.isDown("RIGHT")||playerAction[0][3]) {
	//characters[0].pos[0] += playerSpeed[0] * dt;
        playerSpeedx[0] = playerSpeed[0] * dt;
        directions[0] = 1;
    }
    else if (input.getlastkey() == "LEFT") {
        playerSpeedx[0] = 0;
        directions[0] = 2;
    }
    else if (input.getlastkey() == "RIGHT") {
        playerSpeedx[0] = 0;
        directions[0] = 3;
    }
    else playerSpeedx[0] = 0;
    
    //player 2
    if((input.isDown("w")||playerAction[1][0])&&jumplimiter[1]<10){
	//characters[1].pos[1] -= playerSpeed[1] * dt * 5;
        playerSpeedy[1] = playerSpeed[1] * dt * -5;
	jumplimiter[1]++;
    }
    else if (jumplimiter[1] > 0) {
        jumplimiter[1] = 10;
        gravityspeed[1] += .25;
    }
    if(input.isDown("s")||playerAction[1][2]) {
	//characters[1].pos[1] += playerSpeed[1] * dt;
        playerSpeedy[1] = playerSpeed[1] * dt;
    }
    
    if(input.isDown("a")||playerAction[1][1]) {
	//characters[1].pos[0] -= playerSpeed[1] * dt;
        playerSpeedx[1] = playerSpeed[1] * dt * -1;
        directions[1] = 0;
    }
    else if(input.isDown("d")||playerAction[1][3]) {
	//characters[1].pos[0] += playerSpeed[1] * dt;
        playerSpeedx[1] = playerSpeed[1] * dt;
        directions[1] = 1;
    }
    else if (input.getlastkey() == "A") {
        playerSpeedx[1] = 0;
        directions[1] = 2;
    }
    else if (input.getlastkey() == "D") {
        playerSpeedx[1] = 0;
        directions[1] = 3;
    }
    else playerSpeedx[1] = 0;
}

function updatepositions() {
    characters[0].pos[0] += playerSpeedx[0] + knockbackSpeedx[0];
    characters[0].pos[1] += playerSpeedy[0] + knockbackSpeedy[0];
    characters[1].pos[0] += playerSpeedx[1] + knockbackSpeedx[1];
    characters[1].pos[1] += playerSpeedy[1] + knockbackSpeedy[1];
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
    
    if (characters[0].pos[0] > canVas.width - characters[0].sprite[0].size[0]*scaleFactor)
	characters[0].pos[0] = canVas.width - characters[0].sprite[0].size[0]*scaleFactor;
    
    //character 0 floor and reset jump and gravity speed
    if (characters[0].pos[1] >= canVas.height - characters[0].sprite[0].size[1]*scaleFactor) {
        characters[0].pos[1] = canVas.height - characters[0].sprite[0].size[1]*scaleFactor;
        playerSpeedy[0] = 0;
        knockbackSpeedx[0] = 0;
        knockbackSpeedy[0] = 0;
        if (jumplimiter[0] > 0) {
	    jumplimiter[0] = 0;
            gravityspeed[0] = 0;
        }
    }
    
    //character 1 x coordinates
    if (characters[1].pos[0] < 0)
	characters[1].pos[0] = 0;
    
    if (characters[1].pos[0] > canVas.width - characters[1].sprite[0].size[0]*scaleFactor)
	characters[1].pos[0] = canVas.width - characters[1].sprite[0].size[0]*scaleFactor;
    
    //character 1 floor and reset jump
    if (characters[1].pos[1] >= canVas.height - characters[1].sprite[0].size[1]*scaleFactor) {
        characters[1].pos[1] = canVas.height - characters[1].sprite[0].size[1]*scaleFactor;
        playerSpeedy[1] = 0;
        knockbackSpeedx[1] = 0;
        knockbackSpeedy[1] = 0;
        if (jumplimiter[1] > 0) {
	    jumplimiter[1] = 0;
            gravityspeed[1] = 0;
        }
    }
}

function dealdamage(target,damage) {
    characters[target].HP -= damage;
    ctx.font = damage + 20 + "px Arial"
    ctx.fillStyle = "#FF0000";
    ctx.drawImage(explosion,characters[target].pos[0],characters[target].pos[1]-characters[target].sprite[0].size[0]/2,40,40);
    ctx.fillText(damage,characters[target].pos[0]+10,characters[target].pos[1]+5);
    
    knockbackleft(target,damage);
}

function knockbackleft(target,damage) {
    knockbackSpeedx[target] = damage * -1;
    knockbackSpeedy[target] = damage * -1 / 2;
    jumplimiter[target] = 10;
}

function knockbackright(target,damage) {
    knockbackSpeedx[target] = damage;
    knockbackSpeedy[target] = damage * -1 / 2;
    jumplimiter[target] = 10;
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
        dealdamage(0,1);
        dealdamage(1,50);
    }
}

function drawthings() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(Math.floor(gametime),10,50);
    ctx.fillRect(10,80,characters[0].HP,10);
    ctx.fillText(characters[0].HP,420,90);
    ctx.fillRect(canVas.width/2,80,characters[1].HP,10);
    ctx.fillText(characters[1].HP,canVas.width/2+420,90);
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
