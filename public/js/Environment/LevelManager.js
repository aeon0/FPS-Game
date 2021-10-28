/**
 * Loading all sorts of Mesh , Textures needed for a certain Level
 * As well as deciding the physics for this level and the sky and lightning (basicly the weather)
 */

//Note: All these things like objectLoader, physics, terrain and so on should be created with this.render 
//This is because these are needed in some other classes and i added this class on later stage ... feels not really right, i am not sure
var LevelManager = function(render){
    this.render = render;
    this.currentLevel = "";
    this.render.objectLoader = new ObjectLoader(this.render);
}

//Loading a specific Level
LevelManager.prototype.loadLevel = function(levelName, callback){
    this.currentLevel = levelName;
    if(this.currentLevel == "standard"){
        //init physics
        this.render.physics = new Physics(this.render.scene);     
        //create lights    
        this.render.lights = new Lights(this.render.scene, false); 
        //create sky
        this.render.sky = new Sky(this.render); 
        //load terrain
        this.render.terrain = new Terrain(this.render);
        //load mesh
        this.render.objectLoader.loadBoxes(StandardLevel); 
        this.render.objectLoader.loadTrees(StandardLevel);
        this.render.objectLoader.loadBushes(StandardLevel);
        this.render.objectLoader.loadGun(); 
        this.render.objectLoader.loadSoldire();
    }
    else{
        console.log("unknown Level!");
    }
    
    var _this = this;
    this.render.scene.executeWhenReady(function () {
        _this.postLoad(); 
        callback();
    });
} 

//This should be called when the mesh is done loading
LevelManager.prototype.postLoad = function(){
    this.render.objectLoader.moveBoxes();
    this.render.objectLoader.moveTrees(); 
    this.render.objectLoader.moveBushes();
}