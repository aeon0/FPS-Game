/**
 * Create the Ground of the Scene
 */

var Terrain = function(render){
    this.render = render;

    // Terrain options
    this.groundDivs = 64;
	this.tileSize = 1000; 
    this.bottomPoint = -5;
    this.topPoint = 19;  
    
	this.ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/textures/map.jpg", this.tileSize, this.tileSize, this.groundDivs, this.bottomPoint, this.topPoint, this.render.scene, true);   
   
    //I wanted to make play around with multimaterial.. but could not get it to work :(, so i just changed it back to one texture
    var groundMaterial1 = new BABYLON.StandardMaterial("groundMat", this.render.scene);
	groundMaterial1.diffuseTexture = new BABYLON.Texture("assets/textures/gras1.jpg", this.render.scene);
	groundMaterial1.diffuseTexture.uScale = 10.0;
	groundMaterial1.diffuseTexture.vScale = 10.0;
     
    this.ground.material = groundMaterial1;
    
    //Ground should recive shadows and also cast shadows
    this.render.lights.addShadowCaster(this.ground);
    this.render.lights.addShadowReciver(this.ground);

    //Init physics for the ground
    this.render.physics.initMesh(this.ground); 
}
 
//Calculate the elvation of the heightfield at a certain x,z Coordinate
Terrain.prototype.calcElevation = function(x , z){
    var ray = new BABYLON.Ray(new BABYLON.Vector3(0, this.topPoint + 10 , 0), new BABYLON.Vector3(0, this.bottomPoint - 10,0), ((this.topPoint - this.bottomPoint)+20));
	ray.origin.x = x;
	ray.origin.z = z;  
	var i = this.ground.intersects(ray);
    
	if (!i || !i.pickedPoint) {
		return false;
	} 

	return i.pickedPoint.y;

}
