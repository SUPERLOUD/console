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
var background;
var characters = [];
var playerSpeed = [200,200];
// [up,left,down,right,A,B]
var playerAction = [[false,false,false,false,false,false],
		    [false,false,false,false,false,false]];

//var syncanoKey = "2d2f7c0e75b16769aadb93a2a28111117d43deb5";
//var instanceKey = "dark-snowflake-7198";
//var syncanoChannel = "super-loud";

var syncanoKey = "b52cb72f9b01c614d882bc5712a3f32b97cb9001";
var instanceKey = "todolist";
var syncanoChannel = "todo-list";

var jumplimiter0 = 10;
var jumplimiter1 = 10;

var gameover = false;
var gametime = 0;


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
		console.log(res.payload);
		console.log(res.payload.id,res.payload.iscompleted);
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

resources.load(['../static/bkgrd.png','../static/Cube.bmp']);
resources.onReady(function(){
    document.getElementById("startbutton").addEventListener("click",function(){
	init();
	watch();
	window.requestAnimationFrame(main);
    });
});

function init(){
    background = resources.get('../static/bkgrd.png');
    characters.push({
	pos:[200,360],
	sprite: new Sprite('../static/Cube.bmp',[0,0],[24,28],4,[0,1,2,0]),
        HP:400
    });
    characters.push({
	pos:[1000,360],
	sprite: new Sprite('../static/Cube.bmp',[0,27],[24,28],4,[0,1,2,0]),
        HP:400
    });
    ctx.drawImage(background,0,0,1280,720);
    lastTime = Date.now();
//    main();
    
    document.getElementById("startbutton").style="visibility:hidden";
}

function update(dt){
    handleInput(dt);
    for(var i = 0;i<characters.length;i++){
	characters[i].sprite.update(dt);
        characters[i].pos[1] += playerSpeed[i]/80;
    }
}

function render(){
    ctx.fillRect(0,0,1280,720);
    ctx.drawImage(background,0,0,1280,720);
    for(var i = 0;i<characters.length;i++){
	renderEach(characters[i]);
    }
}

function renderEach(entity){
    ctx.save();
    ctx.translate(entity.pos[0],entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
    console.log(entity.pos);
}

function handleInput(dt){
    console.log("b:",characters[0].pos,characters[1].pos);
    if((input.isDown("UP")||playerAction[0][0])&&jumplimiter0<10){
	characters[0].pos[1] -= playerSpeed[0] * dt * 5;
	jumplimiter0++;
    }
    if(input.isDown("LEFT")||playerAction[0][1])
	characters[0].pos[0] -= playerSpeed[0] * dt;
    if(input.isDown("DOWN")||playerAction[0][2])
	characters[0].pos[1] += playerSpeed[0] * dt;
    if(input.isDown("RIGHT")||playerAction[0][3])
	characters[0].pos[0] += playerSpeed[0] * dt;
    
    if((input.isDown("w")||playerAction[1][0])&&jumplimiter1<10){
	characters[1].pos[1] -= playerSpeed[1] * dt * 5;
	jumplimiter1++;
    }
    if(input.isDown("a")||playerAction[1][1])
	characters[1].pos[0] -= playerSpeed[1] * dt;
    if(input.isDown("s")||playerAction[1][2])
	characters[1].pos[1] += playerSpeed[1] * dt;
    if(input.isDown("d")||playerAction[1][3])
	characters[1].pos[0] += playerSpeed[1] * dt;
    console.log("a:",characters[0].pos,characters[1].pos);
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
    
    if (characters[0].pos[0] > canVas.width - characters[0].sprite.size[0])
	characters[0].pos[0] = canVas.width - characters[0].sprite.size[0];
    
    //character 0 floor and reset jump
    if (characters[0].pos[1] > canVas.height - characters[0].sprite.size[1]) {
        characters[0].pos[1] = canVas.height - characters[0].sprite.size[1];
        if (jumplimiter0 > 0)
	    jumplimiter0 = 0;
    }
    
    //character 1 x coordinates
    if (characters[1].pos[0] < 0)
	characters[1].pos[0] = 0;
    
    if (characters[1].pos[0] > canVas.width - characters[1].sprite.size[0])
	characters[1].pos[0] = canVas.width - characters[1].sprite.size[0];
    
    //character 1 floor and reset jump
    if (characters[1].pos[1] > canVas.height - characters[1].sprite.size[1]) {
        characters[1].pos[1] = canVas.height - characters[1].sprite.size[1];
        if (jumplimiter1 > 0)
	    jumplimiter1 = 0;
    }
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
    if (boxCollides(characters[0].pos, characters[0].sprite.size, characters[1].pos, characters[1].sprite.size)) {
        console.log("collision!");
        
        characters[0].HP--;
        characters[1].HP--;
    }
}

function drawthings() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(Math.floor(gametime),10,50);
    ctx.fillRect(10,80,characters[0].HP,10);
    ctx.fillRect(canVas.width/2,80,characters[1].HP,10);
}

function printgameover() {
    ctx.fillText("GAME OVER", canVas.width/2, canVas.height/2);
    console.log("GAME OVER");
}

function main(){
    var now = Date.now();
    var dt = (now - lastTime)/1000.0;
    
    console.log("before update:",characters[0].pos,characters[1].pos);
    update(dt);
    console.log("after update:",characters[0].pos,characters[1].pos);
    checkCollisions();
    render();
    
    lastTime = Date.now();
    
    if (!gameover) window.requestAnimationFrame(main);
    
    gametime+=dt;
    drawthings();
    if (characters[0].HP <= 0 || characters[1].HP <= 0) {
        gameover = true;
        printgameover();
    }
    if (gametime > 90) {
        gameover = true;
        printgameover();
    }
};




