/// <reference path="Controller.js"/>
var controller; //Global Controller Variable
var socket; //global socket variable 
var gameStarted = false;
//Starting point of the application!
$(document).ready(function(){
    initSockets(); 
    //To disable the "Enter username screen":
    // - uncomment the next two lines
    // - comment the lines inside onStartRender() (inside this file, Server.js)
    // - add a "display: none" to #enter_user_name in css/main.css
    //addGameEvents(); 
    //controller = new Controller();
});  

function initSockets(){	 
    //Init socket.io , only allow websockets as transport medium
    //ToDo: Error handling should the Client not support Websockets
	socket = io.connect("http://185.82.21.82:8000/", {transports: ["websocket"]}); 
    
    //Register all Eventhandlers for incomming events
    socket.on("start render", onStartRender);
	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect); 
}

function addGameEvents(){
    socket.on("new player", onNewPlayer);
	socket.on("init game", onInitGame);
	socket.on("move player", onMovePlayer);
	socket.on("remove player", onRemovePlayer);
    socket.on("player dead", onPlayerDead);
    socket.on("update hitpoints", onUpdateHitPoints);
    socket.on("respawn player", onRespawnPlayer);
    socket.on("shot fired", onShotFired);
    socket.on("recived msg", onRecivedMsg);
}

//Close sockets when leaving page, but still... the Interupt error occures in firefox, but it seems to be a firefox bug and will not affect the application
window.onbeforeunload = function (e) {
    if(socket != undefined)
	   socket.close();
};


//Incoming Events from Server
//=================================================================
function onSocketConnected() { 
    console.log("Connected to socket server");
};
function onSocketDisconnect() {
    console.log("Disconnected from socket server");
}; 
//Start actuall game after user entered username
//The controller variable is a global variable from Controller.js 
function onStartRender(){
    if(!gameStarted)
        addGameEvents();
        controller = new Controller();
    
    gameStarted = true; 
}
//Initilizes the Game after the Client Requested it
//data.localPlayer => model player object
//data.remotePlayers => array with model player objects
function onInitGame(data){ 
	controller.setLocalPlayer(data.localPlayer);  
    for (var i = 0; i < data.remotePlayers.length; i++) {
        controller.addRemotePlayer(data.remotePlayers[i]); 
    };
    controller.initPlayersDone();
}
//Add a new remote player   
//data.player => model player object
function onNewPlayer(data) {
    console.log("New player connected");
	//Send Player to Controller
	controller.addRemotePlayer(data.player);
};
//data: object with the field "id"  (of the player to remove)
function onRemovePlayer(data) {
	controller.removeRemotePlayer(data.id);
};
//data.id => id of player to move
//data.pos = {x,y,z} => position to move to
//data.rot = {x,y,z} => rotation to move to
function onMovePlayer(data) { 
    controller.movePlayer(data.id, data.pos, data.rot); 
};
//data.id => id of the player that got killed
//data.killer => id of the player that killed
function onPlayerDead(data){
    controller.playerDied(data.id, data.killer);
}
//data.hitPoints => new hitpoints value
function onUpdateHitPoints(data){
    controller.updateHitPointsLocalPlayer(data.hitPoints);
}
//data.player => player that got respawned
function onRespawnPlayer(data){
    controller.respawnPlayer(data.player);
}
//data.pos => position from where to shot came from
function onShotFired(data){
    controller.shotFired(data.pos);
}
//data.from => Sender of the msg
//data.msg => msg content
function onRecivedMsg(data){
    controller.recivedMsg(data.from, data.msg);
}

//Outgoing Actions to the Server
//===================================================================
//Tells Server to send all Information about the current players of the game and of the local player 
function requestInitGame(){ 
    socket.emit("request init game", {});
}
//Sends a updated position and rotation of the local player to the server
function sendUpdatePosition(position, rotation){    
	socket.emit("update position", {pos: position, rot : rotation});
}  
function sendHitPlayer(id){
    socket.emit("hit player", { id : id});
}
function sendUserName(name){
    socket.emit("set userName", { userName : name});
}
function sendRespawnRequest(){
    socket.emit("request resapwn", {});
}
function sendSuicide(){
    socket.emit("player suicide", {});
}
function sendShotFired(){ 
    socket.emit("player fired shot", {});
}
function sendChatMsg(msg){
    socket.emit("send msg", {msg : msg});
}