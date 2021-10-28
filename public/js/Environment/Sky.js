var Sky = function(render){
    this.render = render;
    //Sky
    BABYLON.Engine.ShadersRepository = "shaders/";
    var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, this.render.scene);
    var shader = new BABYLON.ShaderMaterial("gradient", this.render.scene, "gradient", {});
    shader.setFloat("offset", 0);
    shader.setFloat("exponent", 0.6);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    shader.backFaceCulling = false;
    skybox.material = shader; 
    
    //Create Fog  
    this.render.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.render.scene.fogDensity = 0.003;
    this.render.scene.fogColor = new BABYLON.Color3(0.8,0.83,0.8);
}