var Player = function(startX, startY, startZ) {
    if ( !(this instanceof Player) )
        throw new Error("Constructor called as a function (Player.js)");
   
    this._name = "No Name";
    this._x = startX;
    this._y = startY;
    this._z = startZ;
    this._rotX = 0;
    this._rotY = 0;
    this._rotZ = 0;
    this._id;
    this._color; // object{r,g,b}
    this._hitPoints = 100;
    this._isDead = false;
    this._height = 6; 
    
    //Stats
    this._deaths = 0;
    this._kills = 0; 
}; 


// Getter Functions
//=============================================
Player.prototype.getX = function(){
    return this._x;
}
Player.prototype.getY = function(){
    return this._y;
}
Player.prototype.getZ = function(){
    return this._z; 
}
Player.prototype.getXYZ = function(){
    return {x : this._x, y : this._y , z : this._z};
}
Player.prototype.getRotX = function(){
    return this._rotX;
}
Player.prototype.getRotY = function(){
    return this._rotY;
}
Player.prototype.getRotZ = function(){
    return this._rotZ; 
}
Player.prototype.getRotXYZ = function(){
    return {x : this._rotX, y : this._rotY , z : this._rotZ};
}
Player.prototype.getID = function(){
    return this._id;
}
Player.prototype.getColor = function(){
    return this._color; 
} 
Player.prototype.getHitPoints = function(){
    return this._hitPoints;
}
Player.prototype.getName = function(){
    return this._name;
}
Player.prototype.getHeight = function(){
    return this._height;
}
Player.prototype.getKills = function(){
    return this._kills;
}
Player.prototype.getDeaths = function(){
    return this._deaths;
}
Player.prototype.getDiff = function(){
    return (this._kills - this._deaths);
}



// Setter Functions
//===============================================
Player.prototype.setX = function(x){
    this._x = x;
}
Player.prototype.setY = function(y){
    this._y = y;
}
Player.prototype.setZ = function(z){
    this._z = z;
}
Player.prototype.setXYZ = function(x,y,z){
    this._x = x;
    this._y = y;
    this._z = z;
}
Player.prototype.setRotX = function(x){
    this._rotX = x;
}
Player.prototype.setRotY = function(y){
    this._rotY = y;
}
Player.prototype.setRotZ = function(z){
    this._rotZ = z;
}
Player.prototype.setRotXYZ = function(x,y,z){
    this._rotX = x;
    this._rotY = y; 
    this._rotZ = z;
}
Player.prototype.setID = function(id){
    this._id = id;
}
Player.prototype.setColor = function(r,g,b){
    this._color = {r: r, g: g, b: b};
}
Player.prototype.setHitPoints = function(h){
    if(h > 100) h = 100;
    else if (h < 0) h = 0;
    this._hitPoints = h;
}
Player.prototype.setName = function(name){
    this._name = name;
} 
Player.prototype.setDead = function(bool){
    this._isDead = bool;
}

//When the player is hit => lower hitpoints
Player.prototype.hit = function(){
    this._hitPoints -= 19; 
    if(this._hitPoints <= 0) 
        this._isDead = true;
    return this._isDead;
}
Player.prototype.isDead = function(){
    return this._isDead;
} 
Player.prototype.addDeath = function(){
    this._deaths += 1;
}
Player.prototype.addKill = function(){
    this._kills += 1;
}



//Test if it is used client or server side, for node.js the module needs to be exported
if(typeof exports === 'object'){
    exports.Player = Player;
} 
