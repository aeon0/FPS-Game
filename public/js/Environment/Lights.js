/**
 * Create Lights and Shadows
 */
var Lights = function(scene, shadowFlag) {	  
    this.shadowFlag = shadowFlag;
    
     //Lights 
    this.lightHem = new BABYLON.HemisphericLight("lightHem", new BABYLON.Vector3(0, 100, 0), scene);
    this.lightHem.intensity = 0.4;
	this.lightDir = new BABYLON.DirectionalLight("lightDir", new BABYLON.Vector3(-2, -4, 2), scene);    
	this.lightDir.diffuse = new BABYLON.Color3(1, 1, 1);	
	this.lightDir.specular = new BABYLON.Color3(0, 0, 0);
	this.lightDir.position = new BABYLON.Vector3(250, 400, 0);
    this.lightDir.intensity = 1.8;
    
    //Shadows
    if(shadowFlag){
        this.shadowGenerator = new BABYLON.ShadowGenerator(4192, this.lightDir);
        this.shadowGenerator.useVarianceShadowMap = true; 
    }

}
 
Lights.prototype.addShadowCaster = function(mesh){
    if(this.shadowFlag){ 
        this.shadowGenerator.getShadowMap().renderList.push(mesh);   
    }
} 

Lights.prototype.addShadowReciver = function(mesh){
    if(this.shadowFlag){
        mesh.receiveShadows = true;   
    }
}
