var Sounds = function(render){
    this.render = render;
    //Init all of the sounds 
    this.gunshot = new BABYLON.Sound("gunshot", "sounds/gun_fire.wav", this.render.scene ,null, { volume: 0.1 });
    this.gunshot3D = new BABYLON.Sound("gunshot", "sounds/gun_fire.wav",
    this.render.scene, null, {
       volume: 0.1 ,spatialSound: true, maxDistance : 300
    });
    this.reload = new BABYLON.Sound("gunshot", "sounds/reload2.wav", this.render.scene ,null, { volume: 0.8 });
    this.emptyGun = new BABYLON.Sound("gunshot", "sounds/gun_empty.wav", this.render.scene ,null, { volume: 0.2 });
    this.heartbeat = new BABYLON.Sound("gunshot", "sounds/heart_beat.wav", this.render.scene ,null, { loop: true, volume: 0.4 });
    this.headOff = new BABYLON.Sound("gunshot", "sounds/head_of.wav", this.render.scene ,null, { volume: 0.7 });
    
    this.hitPain1 = new BABYLON.Sound("gunshot", "sounds/pain.wav", this.render.scene ,null, { volume: 0.05 }); //Like a ahhhh sound, not so loud
    this.hitPain2 = new BABYLON.Sound("gunshot", "sounds/grunt.wav", this.render.scene ,null, { volume: 0.05 }); //Grunt sound ... a little ugly i think ^^ 
    
    this.dying = new BABYLON.Sound("gunshot", "sounds/groan.wav", this.render.scene ,null, { volume: 0.3 }); //Like a ahhhh sound, not so loud
}
 
Sounds.prototype.gunFire = function(){
    this.gunshot.play();
} 
Sounds.prototype.gunFireEmpty = function(){
    this.emptyGun.play();
}
//Vec3 => of Type Babylon.Vector3
Sounds.prototype.gunFire3D = function(Vec3){
    this.gunshot3D.setPosition(Vec3);
    this.gunshot3D.play(); 
}

Sounds.prototype.onReload = function(){
    this.reload.play();
}


Sounds.prototype.onDeath = function(){ 
    this.dying.play();
}

Sounds.prototype.onKill = function(){
    this.headOff.play();
}

Sounds.prototype.onHit = function(){
    this.hitPain1.play(); 
} 

//These are not in use, but could be used on low health for example
Sounds.prototype.startHeartBeat = function(){
    this.emptyGun.play();
}
Sounds.prototype.stopHeartBeat = function(){
    this.emptyGun.stop();
}

