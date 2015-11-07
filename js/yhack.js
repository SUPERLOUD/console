var canVas = document.createElement('canvas');
canVas.id = "gameWindow";
canVas.width = 1280;
canVas.height = 720;
document.body.appendChild(canVas);
var ctx = canVas.getContext("2d");
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

var syncano = new Syncano({
    apiKey: syncanoKey,
    instance: instanceKey,
    userKey: "680405847ef8175e53ee7c834fd9e27ca6312d22"
});


(function watch(){
    syncano.channel(syncanoChannel).poll()
	.then(function(res){
	    if(res==="NO CONTENT"){
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
})();

resources.load(['../static/bkgrd.png','../static/Cube.bmp']);
resources.onReady(init);

function init(){
    console.log("happening..um what!");
    background = resources.get('../static/bkgrd.png');
    characters.push({
	pos:[200,360],
	sprite: new Sprite('../static/Cube.bmp',[0,0],[24,28],4,[0,1,2,0])
    });
    characters.push({
	pos:[1000,360],
	sprite: new Sprite('../static/Cube.bmp',[0,27],[24,28],4,[0,1,2,0])
    });
    ctx.drawImage(background,0,0,1280,720);
    lastTime = Date.now();
    main();
    
}

function update(dt){
    handleInput(dt);
    for(var i = 0;i<characters.length;i++){
	characters[i].sprite.update(dt);
    }
}


function render(){
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
    if(input.isDown("UP")||playerAction[0][0])
	characters[0].pos[1] -= playerSpeed[0] * dt;
    if(input.isDown("LEFT")||playerAction[0][1])
	characters[0].pos[0] -= playerSpeed[0] * dt;
    if(input.isDown("DOWN")||playerAction[0][2])
	characters[0].pos[1] += playerSpeed[0] * dt;
    if(input.isDown("RIGHT")||playerAction[0][3])
	characters[0].pos[0] += playerSpeed[0] * dt;
    if(input.isDown("w")||playerAction[1][0])
	characters[1].pos[1] -= playerSpeed[1] * dt;
    if(input.isDown("a")||playerAction[1][1])
	characters[1].pos[0] -= playerSpeed[1] * dt;
    if(input.isDown("s")||playerAction[1][2])
	characters[1].pos[1] += playerSpeed[1] * dt;
    if(input.isDown("d")||playerAction[1][3])
	characters[1].pos[0] += playerSpeed[1] * dt;

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

function main(){
    var now = Date.now();
    var dt = (now - lastTime)/1000.0;

    update(dt);
    render();
//    console.log(characters[0].pos,characters[1].pos);
    lastTime = Date.now();
    window.requestAnimationFrame(main);
};

window.requestAnimationFrame(main);
console.log("loaded yhack.js");


