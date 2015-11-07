var canVas = document.createElement('canvas');
canVas.id = "gameWindow";
canVas.width = 1280;
canVas.height = 720;
document.body.appendChild(canVas);
var ctx = canVas.getContext("2d");
var lastTime; 
var background;
var characters = [];
var playerSpeed = 400;

var jumplimiter0 = 0;
var jumplimiter1 = 0;

var syncano = new Syncano({
	apiKey: "2d2f7c0e75b16769aadb93a2a28111117d43deb5",
	instance: "dark-snowflake-7198",
	userKey: "680405847ef8175e53ee7c834fd9e27ca6312d22"
});


(function watch(){
    syncano.channel("super-loud").poll()
	.then(function(res){
	    if(res==="NO CONTENT"){
		watch();
	    }else if(res.action==="update"){
		console.log(res);
		watch();
	    }
	}).catch(function(err){
	    console.log(err);
	});
})();

resources.load(['../static/bkgrd.png','../static/Cube.bmp']);
resources.onReady(init);

function init(){
    console.log("happening..um what!");
//    background = resources.get('../static/bkgrd.png');
    characters.push({
	pos:[200,360],
	sprite: new Sprite('../static/Cube.bmp',[0,0],[24,28],4,[0,1,2,0])
    });
    characters.push({
	pos:[1000,360],
	sprite: new Sprite('../static/Cube.bmp',[0,27],[24,28],4,[0,1,2,0])
    });
//    ctx.drawImage(background,0,0,1280,720);
    lastTime = Date.now();
    main();
    
}

function update(dt){
    handleInput(dt);
    for(var i = 0;i<characters.length;i++){
	characters[i].sprite.update(dt);
        characters[i].pos[1] += playerSpeed/80;
    }
}


function render(){
    ctx.fillStyle="#FFFFFF";
    ctx.fillRect(0,0,1280,720);
    for(var i = 0;i<characters.length;i++){
	renderEach(characters[i]);
    }
}

function renderEach(entity){
//    console.log(":",characters[0].pos,characters[1].pos);
    ctx.save();
    ctx.translate(entity.pos[0],entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}

function handleInput(dt){
    //if(input.isDown("DOWN"))
	//characters[0].pos[1] += playerSpeed * dt;
    //if(input.isDown("s"))
	//characters[1].pos[1] += playerSpeed * dt;
        
    if(input.isDown("LEFT"))
	characters[0].pos[0] -= playerSpeed * dt;
    if(input.isDown("a"))
	characters[1].pos[0] -= playerSpeed * dt;
    if(input.isDown("RIGHT"))
	characters[0].pos[0] += playerSpeed * dt;
    if(input.isDown("d"))
	characters[1].pos[0] += playerSpeed * dt;
    
    //jump
    if(input.isDown("UP") && jumplimiter0 < 10) {
	characters[0].pos[1] -= playerSpeed * dt * 5;
        jumplimiter0++;
    }
    if(input.isDown("w") && jumplimiter1 < 10) {
	characters[1].pos[1] -= playerSpeed * dt * 5;
        jumplimiter1++;
    }

}

var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function checkPlayerBounds() {
    //character 0 x coordinates
    if (characters[0].pos[0] < 0) characters[0].pos[0] = 0;
    
    if (characters[0].pos[0] > canVas.width - characters[0].sprite.size[0]) characters[0].pos[0] = canVas.width - characters[0].sprite.size[0];
    
    //character 0 floor and reset jump
    if (characters[0].pos[1] > canVas.height - characters[0].sprite.size[1]) {
        characters[0].pos[1] = canVas.height - characters[0].sprite.size[1];
        if (jumplimiter0 > 0) jumplimiter0 = 0;
    }
    
    //character 1 x coordinates
    if (characters[1].pos[0] < 0) characters[1].pos[0] = 0;
    
    if (characters[1].pos[0] > canVas.width - characters[1].sprite.size[0]) characters[1].pos[0] = canVas.width - characters[1].sprite.size[0];
    
    //character 1 floor and reset jump
    if (characters[1].pos[1] > canVas.height - characters[1].sprite.size[1]) {
        characters[1].pos[1] = canVas.height - characters[1].sprite.size[1];
        if (jumplimiter1 > 0) jumplimiter1 = 0;
    }
}

function main(){
    var now = Date.now();
    var dt = (now - lastTime)/1000.0;

    update(dt);
    render();
    checkPlayerBounds();
//    console.log(characters[0].pos,characters[1].pos);
    lastTime = Date.now();
    window.requestAnimationFrame(main);
};

window.requestAnimationFrame(main);
console.log("loaded yhack.js");


