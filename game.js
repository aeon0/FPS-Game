var util = require("util");
var	io = require("socket.io")({
		transports : [ "websocket" ]
		
	});
var	Player = require("./public/shared/models/Player").Player;

//Global Variables
var socket; 
var	players;
var spread = 400; //How far away the starting points of the players are

//Init function => will be called at the end of this file
function init() {
	players = [];
	socket = io.listen(8000); 
	setEventHandlers();
} 

var setEventHandlers = function() {
	//Listening to new connections from websockets
    socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
	onClientConnect(client);
	//Add some event listeners 
    client.on("set userName", onSetUserName);
    client.on("disconnect", onClientDisconnect);
    client.on("request init game", onClientRequestInit);
    client.on("update position", onUpdatePosition);
    client.on("hit player", onPlayerHit);
    client.on("player suicide", onPlayerSuicide);
    client.on("request resapwn", onRespawnPlayer);
    client.on("player fired shot", onShotFired);
    client.on("send msg", onClientSentMsg);
};


//Event Functions
//==============================================================================
//Socket client has connected, must created a new player for the connection
function onClientConnect(client){
	util.log("New Player has connected: " + client.id);
    //Create a player for this ID
	//ToDo: Check if position is available for the loaded level
	var newPlayer = new Player((Math.random() - 0.5) * spread , 0 , (Math.random() - 0.5) * spread); 
	newPlayer.setID(client.id);   
	newPlayer.setColor(Math.random(), Math.random(), Math.random()); 
	players.push(newPlayer);
}  
//Before this the user is not loaded
function onSetUserName(data){
    var player = playerById(this.id);
    player.setName(data.userName);
    this.emit("start render", {}); 
} 
//Client requests game information about players
//Send Client all information and Tell all other Players that a new Player has connected
function onClientRequestInit(){
    //Find clients player
    var clientPlayer = playerById(this.id);
    // Player not found
	if (!clientPlayer) {
		util.log("Player not found: "+this.id);
		return;
	};  
    //Get all Infos of the other Players
    var remotePlayer = [];
    //Emitting all players to the new player
	for (var i = 0; i < players.length; i++) {
		if(players[i].getID() != this.id && players[i].getName() != "") 
	       remotePlayer.push(players[i]);	 
	}
    //Send the init information to the Client
    this.emit("init game", {localPlayer: clientPlayer , remotePlayers : remotePlayer });
    //Tell all current players, there is a new player
	this.broadcast.emit("new player", {player: clientPlayer});
}
// Socket client has disconnected => Remove the player and tell all other players
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);
	var removePlayer = playerById(this.id);
	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};
	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);
	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};
//data.pos = { x , y , z} => new position of the player (that sent the request)
//data.rot = { x , y , z} => new rotation of the player (that sent the request)
function onUpdatePosition(data) {
    var movedPlayer = playerById(this.id);
	// Player not found
	if (!movedPlayer) {
		util.log("Player not found (onUpdatePosition): " + this.id);
		return;
	} 
    //Update model player instance on Server 
    movedPlayer.setXYZ(data.pos.x, data.pos.y, data.pos.z); 
    movedPlayer.setRotXYZ(data.rot.x, data.rot.y, data.rot.z);      
    //Broadcast position change to all other players 
    this.broadcast.emit("move player", { id: this.id, rot : data.rot, pos : data.pos}); 
};
//data.id => Id of the player that got hit (While this.id is the id of the player that landed that hit)
function onPlayerHit(data){
    var hitPlayer = playerById(data.id);
    var shooter = playerById(this.id);
    
	// Player not found
	if (!hitPlayer || !shooter) {
		util.log("Player not found (onPlayerHit)");
		return;
	}
    
    //Check if hit player is already dead ... dead people cant die
    //or if the shooter is dead ... because dead people also cant shoot anybody
    if(hitPlayer.isDead() || shooter.isDead())
        return;
        
    var isDead = hitPlayer.hit();
    if(isDead){
        hitPlayer.addDeath();
        shooter.addKill(); 
        //Send all players that this player is dead (plus the sender itself, thast why no broadcast is used)
        socket.emit("player dead", { id : data.id , killer: this.id});
    }
    else{ 
        //Send player his new hitpoints
        socket.to(data.id).emit("update hitpoints", { hitPoints : hitPlayer.getHitPoints() });
    }
}

function onRespawnPlayer(){
    var respawnPlayer = playerById(this.id);
    if(respawnPlayer.isDead()){ 
        respawnPlayer.setDead(false);
        respawnPlayer.setHitPoints(100);
        respawnPlayer.setXYZ(Math.random() * spread , 0 , Math.random() * spread); 
        socket.emit("respawn player", { player : respawnPlayer });
    }
}

function onPlayerSuicide(){
    var suicidePlayer = playerById(this.id);
	if(!suicidePlayer.isDead()){
		suicidePlayer.addDeath();
		suicidePlayer.setDead(true);  
		socket.emit("player dead", { id : this.id , killer: this.id});
	}
}

function onShotFired(){
    var shooter = playerById(this.id);
    var position = shooter.getXYZ(); 
    this.broadcast.emit("shot fired", {pos : position});
}

//Chat
//===================================
//data.msg => msg content
function onClientSentMsg(data){
    //Send this msg to all other clients (including self)
    socket.emit("recived msg", {from: this.id, msg : data.msg});
}

//Helper functions
//====================================================================================================
//Searching player by its ID
function playerById(id) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].getID() == id)
            return players[i];
    };
    return false;
};



init();