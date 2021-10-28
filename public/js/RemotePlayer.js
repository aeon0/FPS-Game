var RemotePlayer = function(render, player) {	  
   
    this.render = render;
    this.player = player;
    this.mesh = this.render.objectLoader.cloneSoldire(this.player.getID());

    this.mesh.position.x = player.getX();
    this.mesh.position.y = player.getY() - this.player.getHeight();     
    this.mesh.position.z = player.getZ();     
    
    if(this.player.isDead()){
        console.log("Mesh Not Visible");
        this.mesh.isVisible = false;
    }

    
    //Adding shadows to the mesh
    this.render.lights.addShadowCaster(this.mesh);
    
    //Adding physics to the Mesh
    this.render.physics.initMesh(this.mesh); 
      
    Pannel.updatePlayerJoind(this.player.getName());
}

RemotePlayer.prototype.remove = function(){
    Pannel.updatePlayerLeft(this.player.getName());
    this.mesh.dispose();  
}

RemotePlayer.prototype.move = function(pos, rot){
    this.mesh.position = new BABYLON.Vector3(pos.x, pos.y - this.player.getHeight(), pos.z);
    //oponent.rotation = new BABYLON.Vector3(rot.x, rot.y, rot.z);
    this.mesh.rotation.y = rot.y - Math.PI; 
}
 
RemotePlayer.prototype.gotKilled = function(killer){
    Pannel.updateKill(this.player.getName() , killer.player.getName());
    this.mesh.isVisible = false;
}

RemotePlayer.prototype.respawn = function(){
    this.mesh.position.x = this.player.getX();
    this.mesh.position.y = this.player.getY();     
    this.mesh.position.z = this.player.getZ(); 
    this.mesh.rotation.y = this.player.getRotY();  
    this.mesh.isVisible = true;  
}