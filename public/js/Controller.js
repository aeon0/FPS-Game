/**
 * Controller is the Connection between the IO.Socket calles and events in Server.js and the actual rendering
 */

var Controller = function(){
    Pannel.hideUserInput();
    this.localPlayer;
	this.remotePlayers = [];
	
	this.render = new Render(this);	 
}

//Init Game
//=================================================================
//Request to initilize game => Tells server that Babylon js is ready to create the players
Controller.prototype.requestAllPlayers = function(){
    console.log("Request to load Players");
    requestInitGame();
}
Controller.prototype.initPlayersDone = function(){
    console.log("Initilizing all players ready");
} 

//Remote Players that join or leave after game has been initilized
//===================================================================
//player: object with all fields of the player model
Controller.prototype.setLocalPlayer = function(player){
    console.log("Set Local Player");
    //Save player model instance at the Client
	this.localPlayer = this._clonePlayer(player);   
    //Render the localPlayer to the screen
	this.render.loadLocalPlayer(this.localPlayer);
}
//player: object with all fields of the player model
Controller.prototype.addRemotePlayer = function(player){
    //Create a actual model instance of player
    var remotePlayer = this._clonePlayer(player);
    //Save player model instance at the Client
	this.remotePlayers.push(remotePlayer);
    //Render the Oponent to the screen
	this.render.loadOponent(remotePlayer); 
}
//id: the id a player has
Controller.prototype.removeRemotePlayer = function(id){
	var player = this._findPlayer(id); 
	if (!player) 
		throw new Error("Player not found " + id);
    //Remove oponent from the screen
    this.render.removeOponent(id); 
    //Remove the player model instance from at the Client
	this.remotePlayers.splice(this.remotePlayers.indexOf(player), 1); 
}


//Movement of Players
//===============================================================
//Send Movment to the Server
//pos = { x , y , z} => the new position of the clients player
//rot = { x , y , z} => the new rotation of the clients player
Controller.prototype.sendLocalPlayerMovment = function(pos, rot){
    var position = { x: pos.x, y : pos.y , z : pos.z}; 
    var rotation = { x: rot.x, y : rot.y , z : rot.z};
    //Send new position and rotation to the server
    sendUpdatePosition(position, rotation);     
    //Update the localPlayer model on the Client
    this.localPlayer.setXYZ(pos.x, pos.y, pos.z);
    this.localPlayer.setRotXYZ(rot.x, rot.y, rot.z);
}
//Change position of the player
//id => id of the player
//pos = { x , y , z} => the new position of a remote player
//rot = { x , y , z} => the new rotation of a remote player 
Controller.prototype.movePlayer = function(id, pos, rot){
    //Render new position on the screen 
    this.render.movePlayer(id, pos, rot); 
    var player = this._findPlayer(id); 
    if (!player)
        return;
    //Update remote player model instance on the Client
    player.setXYZ(pos.x, pos.y, pos.z);
    player.setRotXYZ(rot.x, rot.y, rot.z);
} 

//Player Hits & Death
//===================================================================
//player = instance of player model
Controller.prototype.hitPlayer = function(player){
    //Note that Clientside hitpoints dont need to be updated, because if a player is dead or not is only determined by the server
    //Send Hit to Server
    sendHitPlayer(player.getID()); 
}
Controller.prototype.updateHitPointsLocalPlayer = function(hitPoints){
    this.localPlayer.setHitPoints(hitPoints);
    this.render.updateHitPoints(); 
}
//id => id of the player that died
//killer => id of the player that killed
Controller.prototype.playerDied = function(id, killer){
    if(id == this.localPlayer.getID()){
        //Local Player Died :/
        this.render.localPlayerGotKilled(killer);
    }
    else{
        //Some Remote Player Died
        this.render.remotePlayerDied(id, killer);
    }
}
Controller.prototype.requestRespawn = function(){
    //Local player request a respawn
    sendRespawnRequest();
}
Controller.prototype.respawnPlayer = function(player){
    if(this.localPlayer.getID() == player._id){
        //Local Player gets Respawned
        this.localPlayer.setDead(player._isDead);
        this.localPlayer.setHitPoints(player._hitPoints);
        this.localPlayer.setXYZ(player._x , player._y , player._z);
        //Tell the Render to actually respawn the local player onto the screen
        this.render.respawnLocalPlayer();
    } 
    else{
        //remote Player gets Respawned
        var remotePlayer = this._findPlayer(player._id);
        remotePlayer.setDead(player._isDead);
        remotePlayer.setHitPoints(player._hitPoints);
        remotePlayer.setXYZ(player._x , player._y , player._z);
        //Tell the Renderer that this players was respawned
        this.render.respawnRemotePlayer(remotePlayer.getID());
    }
}
//The local player killed himself
Controller.prototype.sendSuicide = function(){
    sendSuicide();
}
//Shot fired to play sound for other players
Controller.prototype.sendShotFired = function(){
    sendShotFired(); 
}
//Tell Babylon to play sound at a position because someone fired from there
Controller.prototype.shotFired = function(pos){
    this.render.shotFired(pos);
}

//Chat 
//================
Controller.prototype.recivedMsg = function(id, msg){
    var sender;
    if(id == this.localPlayer.getID()) sender = this.localPlayer;
    else sender = this._findPlayer(id);
    Pannel.addMsgToChat(sender.getName(), msg);
}
 
//Helper Methods
//===========================================================
//Find a Player inside remotePlayers by id 
Controller.prototype._findPlayer = function(id){
    for (var i = 0; i < this.remotePlayers.length; i++) {
        if (this.remotePlayers[i].getID() == id)
            return this.remotePlayers[i]; 
    };
    return false;
} 
//Creates a Player class out of the object sent by the Server (which is acutally also a Player class)
//But I am not sure how to tell Javascript, that this object is an instance of "Player" ... this solutions seems kinda hacky ... not good 
Controller.prototype._clonePlayer = function(p){
    var player = new Player(p._x, p._y, p._z);
    player.setRotXYZ( p._x , p._y , p._z );
    player.setID(p._id);
    player.setColor(p._color.r , p._color.g , p._color.b);
    player.setHitPoints(p._hitPoints);
    player.setName(p._name);
    player._isDead = p._isDead;
    player._kills = p._kills;
    player._deaths = p._deaths;
    return player;
}