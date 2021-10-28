/**
 * Load and store all objects needed
 */

var ObjectLoader = function(render){
    this.render = render;

    this.bushes = [];
    this.trees = [];
    this.boxes = []; 
    this.gun;
}

ObjectLoader.prototype.loadBoxes = function(data){
    //Simple Box
   
    var box = new BABYLON.Mesh.CreateBox("crate", 8, this.render.scene);
    
    box.material = new BABYLON.StandardMaterial("Mat", this.render.scene);
    box.material.diffuseTexture = new BABYLON.Texture("assets/textures/crate.jpg", this.render.scene);
    box.material.diffuseTexture.hasAlpha = true;
    
    box.position = new BABYLON.Vector3(10, 0, 10); 
    this.render.lights.addShadowCaster(box);
    this.render.physics.initMesh(box);
    this.boxes.push(box);
    //this.box.position.y = this.render.terrain.calcElevation(5, 10) + 5;
    
    for (var i = 0; i < data.boxSize; i++) {
        var clone = box.createInstance("box"+i);
        clone.type = 'box';
        clone.position.x = data.boxPosition[i*2]; 
        clone.position.z = data.boxPosition[i*2 + 1];
        clone.rotation.y = data.boxRotation[i];
        clone.checkCollisions = true; 

        //Add Lights and Physics
        this.render.lights.addShadowCaster(clone);
        this.render.physics.initMesh(clone);
        this.boxes.push(clone);
    }

}

ObjectLoader.prototype.moveBoxes = function(){
    //Set Object Height according to height field
    for (var i in this.boxes) {
        this.boxes[i].position.y =  this.render.terrain.calcElevation(this.boxes[i].position.x, this.boxes[i].position.z) + 3; 
    }
}

ObjectLoader.prototype.loadBushes = function(data){
    var _this = this;
	BABYLON.SceneLoader.ImportMesh('', 'assets/bush2/', 'european_cranberry_bush.babylon', this.render.scene, function (meshes) {
		for (var i = 0; i < data.bushSize; i++) { 
			var clone = meshes[0].createInstance('Bush');
			clone.type = 'bush';
            clone.position.x = data.bushesPosition[i*2];
            clone.position.z = data.bushesPosition[i*2 + 1];
			var s = data.bushesScaling[i];
			clone.scaling = new BABYLON.Vector3(s,s,s);
			_this.bushes.push(clone); 
		}

		meshes[0].isVisible = false;
	});
}
ObjectLoader.prototype.moveBushes = function(){
    //Set Object Height according to height field
    for (var i in this.bushes) {
        this.bushes[i].position.y =  this.render.terrain.calcElevation(this.bushes[i].position.x, this.bushes[i].position.z) - 1.2; 
    }
}

//Tree Model is from @Convergence (from HTML5Dev Forum)
//Check out his RPG prototype: http://misc.blicky.net/babylon/
ObjectLoader.prototype.loadTrees = function(data){
    var _this = this;
	BABYLON.SceneLoader.ImportMesh('', 'assets/tree/', 'tree.babylon', this.render.scene, function(meshes) {
		meshes[1].material.subMaterials[1].diffuseTexture.hasAlpha = true;
		for (var i = 0; i < data.treeSize; i++) { 
			var clone = meshes[0].createInstance('Beech Tree');
			clone.type = 'tree';
            clone.position.x = data.treePosition[i*2];
            clone.position.z = data.treePosition[i*2 + 1];
            clone.rotation.y = data.treeRotation[i];
			var s = data.treeScaling[i];
			clone.scaling = new BABYLON.Vector3(s,s,s);
            
            //Add Lights and Physics
            _this.render.lights.addShadowCaster(clone);
            _this.render.physics.initMesh(clone);
			_this.trees.push(clone);
			
			var leaves = meshes[1].createInstance('Beech Tree Leaves');
			leaves.parent = clone; 
		}

		meshes[0].isVisible = false;
        meshes[1].isVisible = false;
	});
}

ObjectLoader.prototype.moveTrees = function(){
    //Set Object Height according to height field
    for (var i in this.trees) {
        this.trees[i].position.y =  this.render.terrain.calcElevation(this.trees[i].position.x, this.trees[i].position.z) - 10; 
    }
}
 
ObjectLoader.prototype.loadGun = function(){
    var _this = this; 
    BABYLON.SceneLoader.ImportMesh('', 'assets/weapon/', 'untitled.babylon', this.render.scene, function(meshes) { 
        _this.gun = meshes;
        _this.gun[0].material = new BABYLON.StandardMaterial("Mat", _this.render.scene);
        _this.gun[0].material.diffuseTexture = new BABYLON.Texture("assets/textures/metal_black.jpg", _this.render.scene);
        _this.gun[0].material.diffuseTexture.hasAlpha = true;  
    });  
}

ObjectLoader.prototype.loadSoldire = function(){
    var _this = this;
    BABYLON.SceneLoader.ImportMesh('', 'assets/soldire/', 'soldire.babylon', this.render.scene, function(meshes, particleSystems, skeletons) {
        _this.soldire = meshes;    
        _this.soldire[0].scaling = new BABYLON.Vector3(0.03 , 0.03 , 0.03);
        _this.soldire[0].isVisible = false; 
    });  
}

ObjectLoader.prototype.cloneSoldire = function(id){
    return this.soldire[0].createInstance(id);
}
