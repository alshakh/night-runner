var Stage = function(debug) {
  if (debug === undefined) debug = false;

  this.debugMode = debug;

  THREE.Object3D.call(this);

  this.trees = [];
  var treeNum = 10;
  var t0 = new Tree(34);
  for (var i = 0; i < treeNum; i++) {
    var t = t0.clone();
    t.position.x = (Math.random() - 0.5) * this.consts.dimX;
    t.position.y = Math.random() * this.consts.dimY;
    this.trees.push(t);
    this.add(t);
  }

  // dome
  var domeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    side: THREE.BackSide
  });
  this.dome = new THREE.Mesh(new THREE.BoxGeometry(this.consts.dimX*4, this.consts.dimY*4 + this.consts.domeYOffset, this.consts.dimZ*4), domeMaterial);
  this.add(this.dome);
  /// indicator
  if (this.debugMode) {
    this.dimYIndicator = new THREE.Mesh(new THREE.SphereGeometry(1));
    this.add(this.dimYIndicator);
  }

  //this.dome.translateY(this.consts.domeYOffset);
  //this.dome.translateZ(this.consts.dimZ/2);
  //this.add(this.dome);
  //
  this.backLimit = 0;
};
Stage.prototype = Object.create(THREE.Object3D.prototype);
Stage.prototype.constructor = Stage;
Stage.prototype.consts = {};
Stage.prototype.consts.dimY = 50;
Stage.prototype.consts.dimX = 50;
Stage.prototype.consts.dimZ = 50;
Stage.prototype.consts.domeYOffset = 10;
Stage.prototype.update = function(runnerDistance) {
  this.backLimit = runnerDistance;
  this.flow();
};
// fix things behined backLimit
Stage.prototype.flow = function() {
  for (var i = 0; i < this.trees.length; i++) {
    if (this.trees[i].position.y < this.backLimit) {
      this.trees[i].position.y += this.consts.dimY;
      //this.trees[i].position.x = (Math.random() - 0.5) * this.consts.dimX;
    }
    //
    if (this.dome.position.y < this.backLimit) {
      this.dome.position.y = this.backLimit - this.consts.domeYOffset;
    }

    if(this.debugMode) {
      this.dimYIndicator.position.y = this.backLimit + this.consts.dimY;
    }
  }
};
