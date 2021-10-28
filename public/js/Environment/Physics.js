
var Physics = function(scene) {	  
     
    //Set gravity for the scene (G force like, on Y-axis)
    scene.gravity = new BABYLON.Vector3(0, -0.04, 0);
    // Enable Collisions 
    scene.collisionsEnabled = true;  
}
 
Physics.prototype.initLocalPlayer = function(camera){
    //ToDo: Take height into account!
    //Then apply collisions and gravity to the active camera
    camera.checkCollisions = true;
    camera.useOctreeForCollisions = true;
    camera.applyGravity = true;
  
    //Set the ellipsoid around the camera (e.g. your player's size)
    //y is the height, x and z need to be this big because of the weapon sticking out infront
    camera.ellipsoid = new BABYLON.Vector3(4.8, 3, 4.8);  
}
 
Physics.prototype.initMesh = function(mesh){ 
    mesh.checkCollisions = true;
}