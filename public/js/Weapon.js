/**
 * This class is mainly from that fps tutorial by "Temechon"
 * http://www.pixelcodr.com/tutos/shooter/shooter.html 
 */

var Weapon = function(render, player) {
  
    this.render = render;
    this.player = player;
    
    // The weapon mesh  
    var wp = this.render.objectLoader.gun[0];

    //console.log(wp);    
    wp.isVisible = true; 
    var s = 0.14;  
    wp.scaling = new BABYLON.Vector3(s,s,s);
    wp.rotationQuaternion = null;
    wp.rotation.x = -Math.PI/2;
    wp.rotation.y = Math.PI; 
    wp.parent = this.render.camera;
    wp.position = new BABYLON.Vector3(0.7,-2.8,-0.2); 
    this.mesh = wp;

    // The initial rotation
    this._initialRotation = this.mesh.rotation.clone();
    
    this.amoSize = 14;
    this.currentAmo = this.amoSize;
    Pannel.updateAmo(this.currentAmo);
    
    // The fire rate
    this.fireRate = 250.0;
    this._currentFireRate = this.fireRate;
    this.canFire = true;
    this.reloading = false;
    var _this = this; 
    this.render.scene.registerBeforeRender(function() {
        if (!_this.canFire) {
            _this._currentFireRate -= _this.render.engine.getDeltaTime();
            if (_this._currentFireRate <= 0 && !_this.reloading) {
                _this.canFire = true;
                _this._currentFireRate = _this.fireRate;
            } 
        }
    });
};
 
Weapon.prototype.reload = function(){
    //Animate this for some ms and disable this.canFire for that time
    if(!this.reloading){
        this.canFire = false;
        this.reloading = true;
        this.render.sounds.onReload();
        this.animateReload();
        var _this = this;
        setTimeout(function() {
            _this.currentAmo = _this.amoSize;
            Pannel.updateAmo(_this.currentAmo);
            _this.canFire = true;
            _this.reloading = false;
        }, 800); 


    } 
}

Weapon.prototype.fire = function(){
    if (this.canFire) { 
        if(this.currentAmo != 0){
            //Fire Sound
            this.render.sounds.gunFire();
            //Get pick result
			var width = this.render.engine.getRenderWidth();
			var height = this.render.engine.getRenderHeight(); 
            var pickResult = this.render.scene.pick(width/2, height/2, null, false, this.render.camera);
            //Ceck with all RemotePlayers
            if(pickResult.pickedMesh != null){
                for (var i = 0; i < this.render.remotePlayers.length; i++) {
                    if(pickResult.pickedMesh.name == this.render.remotePlayers[i].player.getID()){
                        this.render.controller.hitPlayer(this.render.remotePlayers[i].player);
                    }
                };
                if(pickResult.pickedMesh.name != "skyBox")
                    this.drawImpact(pickResult.pickedPoint);
            }
            this.render.controller.sendShotFired();
            this.currentAmo -= 1; 
            Pannel.updateAmo(this.currentAmo);
        }
        else{
            this.render.sounds.gunFireEmpty();
        }
        this.animate();

        this.canFire = false;
    } 
}

//position = new BABYLON.Vector3
Weapon.prototype.drawImpact = function(position, rotation){
    // Impact impostor
    //this needs some work, like a decent texture and roation of the plane depending on the normal of the mesh at the point
    
    var impact = BABYLON.Mesh.CreatePlane("impact", 1, this.render.scene);
    impact.rotation.x = Math.PI / 2;
    impact.material = new BABYLON.StandardMaterial("impactMat", this.render.scene);
    impact.material.diffuseTexture = new BABYLON.Texture("assets/textures/impact.png", this.render.scene);
    impact.material.diffuseTexture.hasAlpha = true; 
    impact.position = position;
    
}

Weapon.prototype.animate = function(){

    var start = this._initialRotation.clone();
    var end = start.clone();
 
    end.x += Math.PI/100;

    // Create the Animation object
    var display = new BABYLON.Animation(
        "fire",
        "rotation",
        60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    // Animations keys
    var keys = [{ 
        frame: 0,
        value: start
    },{
        frame: 10,
        value: end
    },{
        frame: 100,
        value: start
    }];

    // Add these keys to the animation
    display.setKeys(keys);

    // Link the animation to the mesh
    this.mesh.animations.push(display);

    this.render.scene.beginAnimation(this.mesh, 0, 100, false, 10, function() {

    });
}

Weapon.prototype.animateReload = function(){

    var start = this._initialRotation.clone();
    var end = start.clone();
 
    end.x += Math.PI/4;
    end.y -= Math.PI/4;

    // Create the Animation object
    var display = new BABYLON.Animation(
        "fire",
        "rotation",
        60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    // Animations keys
    var keys = [{ 
        frame: 0,
        value: start
    },{
        frame: 200,
        value: end
    },{
        frame: 500,
        value: start
    }];

    // Add these keys to the animation
    display.setKeys(keys);

    // Link the animation to the mesh
    this.mesh.animations.push(display);

    this.render.scene.beginAnimation(this.mesh, 0, 500, false, 10, function() {

    });
}