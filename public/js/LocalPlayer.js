var LocalPlayer = function(render, player) {	  

    //Model player instance for the local player 
    this.player = player;
    this.render = render;
    
    this.isJumping = false;
    //Some camera options
    this.cameraSpeed = 0.6;
    this.jumpHeight = 2.5;
    this.jumpUp = false;
    render.camera.speed = this.cameraSpeed;
    render.camera.keysUp = [87]; // W
	render.camera.keysDown = [83]; // S 
	render.camera.keysLeft = [65]; // A
	render.camera.keysRight = [68]; // D
    
    //Set the Camera coordinates according to the player coordinates 
    this.resetCameraCoordinates();
    
    //Init physics for the local player (the camera)
    render.physics.initLocalPlayer(render.camera);
    
    //Init last positions of the player with the current position (and rotation)
    this.lastPosition = new BABYLON.Vector3(render.camera.position.x, render.camera.position.y , render.camera.position.z);
    this.lastRotation = new BABYLON.Vector3(render.camera.rotation.x, render.camera.rotation.y , render.camera.rotation.z);
    
    var _this = this;
    //Add event listeners for Controlls
    window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false); 
    window.addEventListener('mouseup', function(event) { Key.onKeyup(event); }, false);
    window.addEventListener('mousedown', function(event) { Key.onKeydown(event); }, false);
    
    //Show the Gunpointer in the middle of the screen
    Pannel.showGunPointer();
    
    //Fix cursor to the center of the screen
    this.initPointerLock();
    
    //Create the weapon for the player
    this.weapon = new Weapon(render);
}

//Updates the position of the local Player to all the other Players
LocalPlayer.prototype.updatePosition = function(){
    var xOffset = Math.abs(this.lastPosition.x - this.render.camera.position.x);
    var yOffset = Math.abs(this.lastPosition.y - this.render.camera.position.y);
    var zOffset = Math.abs(this.lastPosition.z - this.render.camera.position.z);
    
    var xRotOffset = Math.abs(this.lastRotation.x - this.render.camera.rotation.x);
    var yRotOffset = Math.abs(this.lastRotation.y - this.render.camera.rotation.y);
    var zRotOffset = Math.abs(this.lastRotation.z - this.render.camera.rotation.z);
    
    var posOffset = xOffset + yOffset + zOffset;
    var rotOffset = yRotOffset + xRotOffset + zRotOffset;

    if(posOffset > 0.1 || rotOffset > 0.01){ 
        this.submitMovment();
    } 
}
//Check if player is falling down somewhere ... kill the player if player fell of the grid
LocalPlayer.prototype.checkFreeFall = function(){
    if(!this.player.isDead() && (this.render.camera.position.y < this.render.terrain.bottomPoint - 10)){ 
        this.render.controller.sendSuicide();
    }
}

//Submit the Movment to the Server
LocalPlayer.prototype.submitMovment = function(){
    this.render.controller.sendLocalPlayerMovment(this.render.camera.position, this.render.camera.rotation);
    this.lastPosition = new BABYLON.Vector3(this.render.camera.position.x , this.render.camera.position.y , this.render.camera.position.z);
    this.lastRotation = new BABYLON.Vector3(this.render.camera.rotation.x , this.render.camera.rotation.y , this.render.camera.rotation.z);
}

//Update Hitpoints of Player
LocalPlayer.prototype.updateHitPoints = function(){
    if(this.player.getHitPoints() != 100)
        this.render.sounds.onHit();
        
    Pannel.updateHealthBar(this.player.getHitPoints());
}

//Update Hitpoints of Player
LocalPlayer.prototype.gotKilled = function(killer){ 
    this.render.sounds.onDeath();
    Pannel.updateHealthBar(0); 
    Pannel.showDeadPannel();
    Pannel.updateKill(this.player.getName() , killer.player.getName());
    this.weapon.mesh.isVisible = false; 
    this.player.setDead(true);
    this.render.camera.speed = 0; 
}

//Respawn the Local player
LocalPlayer.prototype.respawn = function(){ 
    Pannel.updateHealthBar(100); 
    Pannel.hideDeadPannel();

    this.weapon.mesh.isVisible = true; 
    this.player.setDead(false);
    this.render.camera.speed = this.cameraSpeed;
    
    this.resetCameraCoordinates();
}

//Resets the camera coordinates to the player coordinates
LocalPlayer.prototype.resetCameraCoordinates = function(){ 
    //As the Camera is our "Player", only the position needs to be ajusted
    this.render.camera.position.x = this.player.getX();  
    this.render.camera.position.z = this.player.getZ();     
    this.render.camera.position.y = this.render.terrain.calcElevation(this.player.getX(), this.player.getZ()) + this.player.getHeight(); 
    //Send as "movment" to Server because server cant calc the height at that point and needs to send updates to the other players
    this.submitMovment();
}



//Checks for Key presses to trigger actions depending on the key
LocalPlayer.prototype.checkControlls = function(){
    if(Key.isDown(Key.JUMP)){
        if(!this.isJumping)
            this.jump();
    }
    if(Key.isDown(Key.LEFTCLICK)){
        if(!this.player.isDead())
            this.weapon.fire();
    }
    if(Key.isDown(Key.RESPAWN)){
        if(this.player.isDead())
             this.render.controller.requestRespawn();
    } 
    if(Key.isDown(Key.RELOAD)){
        this.weapon.reload(); 
    }
	/*
	if(Key.isDown(Key.STATS)){
		Pannel.toggleStats(this.render.controller.remotePlayers, this.render.controller.localPlayer);
	}
	*/
    if(Key.isDown(Key.CHAT)){
        var bool = Pannel.toggleChatInput();  
        if(bool){
            //Chat opended
            this.render.camera.speed = 0;
        }
        else{
            //Chat closed 
            this.render.camera.speed = this.cameraSpeed;
        }
    } 
    //Check if two or more keys are pressed at the same time to slow down the camera
    //Otherwise the player would run faster when for example pressing "forward" and "right"
    /*
    if(Key.multipleCamControllsPressed()){
        this.render.camera.speed = this.cameraSpeed / 100;
    }
    else{ 
        this.render.camera.speed = this.cameraSpeed;
    }
    */
}

//Determine if Player is still jumping (check if player hit the ground)
LocalPlayer.prototype.checkJump = function(){
    var pos, heightOfTerrain ,diff;
    if(this.isJumping && !this.jumpUp){
        var bias = 0.08; 
        pos = this.render.camera.position;
        heightOfTerrain = this.render.terrain.calcElevation(pos.x, pos.z);
        diff = pos.y - heightOfTerrain -bias;
        if(diff < this.player.getHeight()){
            this.isJumping = false;  
        }
    } 
    else if(!this.isJumping && !this.jumpUp){
        //On low fps, the camera can jump and basicly "ignore" the gravity which means the player can fly
        //To test against that affect this code is here, it checks if a player is off the ground without actually jumping and brings player back down
        pos = this.render.camera.position;
        heightOfTerrain = this.render.terrain.calcElevation(pos.x, pos.z);
        diff = pos.y - heightOfTerrain;
        if(diff > (0.5 + this.player.getHeight())){
            this.render.camera.position.y = heightOfTerrain + this.player.getHeight() + 0.1; 
        }
    }
}

//Let the player Jump
//I did not write this, this is pure copy past from a babylon js playground, i need to look at this later on
LocalPlayer.prototype.jump = function(){
    this.isJumping = true;
    this.jumpUp = true;
    var cam = this.render.scene.cameras[0];

    cam.animations = [];

    var a = new BABYLON.Animation(
        "a",
        "position.y", 3,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    keys.push({ frame: 0, value: cam.position.y });
    keys.push({ frame: 3, value: cam.position.y + this.jumpHeight });
    a.setKeys(keys);

    var easingFunction = new BABYLON.CircleEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    a.setEasingFunction(easingFunction);
 
    cam.animations.push(a);
    var _this = this;

    this.render.scene.beginAnimation(cam, 0, 3, false, 1 , function(){
        _this.jumpUp = false;
    });
}

//Fixes the cursor into the center and moves the camera with cursor movment
//This is pure copy past from this tutorial http://www.pixelcodr.com/tutos/shooter/shooter.html from "Temechon"
LocalPlayer.prototype.initPointerLock = function() {
    var _this = this; 
    // Request pointer lock
    var canvas = this.render.scene.getEngine().getRenderingCanvas();
    // On click event, request pointer lock
    this.render.canvas.addEventListener("click", function(evt) {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }, false);

    // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
    var pointerlockchange = function (event) {
        _this.render.controlEnabled = (
                           document.mozPointerLockElement === canvas
                        || document.webkitPointerLockElement === canvas
                        || document.msPointerLockElement === canvas
                        || document.pointerLockElement === canvas);
        // If the user is alreday locked
        if (!_this.render.controlEnabled) {
            _this.render.camera.detachControl(canvas);
        } else {
            _this.render.camera.attachControl(canvas);
        }
    };

    // Attach events to the document
    document.addEventListener("pointerlockchange", pointerlockchange, false);
    document.addEventListener("mspointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
}
