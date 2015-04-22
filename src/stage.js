var Stage = function(dimX, dimY, dimZ, treeNum, shadow, debug) {
  if (shadow === undefined) shadow = false;

  this.dimX = dimX;
  this.dimY = dimY;
  this.dimZ = dimZ;

  if (debug === undefined) debug = false;

  this.debugMode = debug;

  THREE.Object3D.call(this);

  this.backLimit = 0;

  var __this = this; // to use inside fixers and updaters
  this.fixers = []; // functions to fix things
  this.updaters = []; // functions that update things

  /// Trees
  (function(){
    var trees = [];
    var t0 = new Tree(34, undefined, shadow);
    for (var i = 0; i < treeNum; i++) {
      var t = t0.clone();
      t.position.x = RANDOM.probablyZeroRandom()* __this.dimX;
      t.position.y = Math.random() * __this.dimY;
      t.rotation.z = Math.PI * 2 * Math.random();
      var s = RANDOM.noise(0.3);
      t.scale.set(s, s, s);
      trees.push(t);
      __this.add(t);
    }
    __this.fixers.push(function() {
      for (var i = 0; i < trees.length; i++) {
        // fix trees
        if (trees[i].position.y < __this.backLimit) {
          trees[i].position.y += __this.dimY;
          trees[i].position.x = RANDOM.probablyZeroRandom() * __this.dimX;
        }
      }
    });
  })();


  /// grass
  (function(){
    console.warn("No shadow for grass");
    var grasses = [];
    var grassNum = 300;
    for (var i = 0; i < grassNum; i++) {
      var t = tallGrassFactory.mesh.clone();
      t.position.x = RANDOM.probablyZeroRandom() * __this.dimX;
      t.position.y = RANDOM.nextDouble() * __this.dimY;
      t.rotation.z = Math.PI * 2 * RANDOM.nextDouble();
      var s = RANDOM.noise(0.3);
      t.scale.set(s, s, s);
      grasses.push(t);
      __this.add(t);
    }
    __this.fixers.push(function() {
      for (var i = 0; i < grasses.length; i++) {
        // fix trees
        if (grasses[i].position.y < __this.backLimit) {
          grasses[i].position.y += __this.dimY;
          grasses[i].position.x = RANDOM.probablyZeroRandom() * __this.dimX;
        }
      }
    });
  })();


  /// dome
  (function(){
    var domeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.BackSide
    });
    var dome = new THREE.Mesh(new THREE.BoxGeometry(__this.dimX * 4, __this.dimY * 4, __this.dimZ * 4), domeMaterial);
    __this.add(dome);

    __this.fixers.push(function() {
      if (dome.position.y < __this.backLimit) {
        dome.position.y = __this.backLimit - __this.consts.domeYOffset;
      }
    });
  })();


  /// indicator
  (function(){
    if (__this.debugMode) {
      var dimYIndicator = new THREE.Mesh(new THREE.SphereGeometry(1));
      __this.add(dimYIndicator);

      __this.fixers.push(function() {
        if (__this.debugMode) {
          dimYIndicator.position.y = __this.backLimit + __this.dimY;
        }
      });
    }
  })();


  /// floor
  (function(){
    var floorA = new THREE.Mesh(new THREE.PlaneGeometry(__this.dimX, __this.dimY),
    __this.consts.floorMaterial);
    floorA.translateY(__this.dimY / 2);
    var floorB = floorA.clone();
    floorB.translateY(__this.dimY);
    __this.add(floorA);
    __this.add(floorB);
    if (shadow) {
      floorA.receiveShadow = true;
      floorB.receiveShadow = true;
    }
    var fixFloor = function(floor) {
      if (floor.position.y - __this.dimY / 2 + __this.dimY < __this.backLimit) {
        floor.translateY(2 * __this.dimY);
      }
    };
    __this.fixers.push(function() {
      fixFloor(floorA);
      fixFloor(floorB);
    });
  })();


};
Stage.prototype = Object.create(THREE.Object3D.prototype);
Stage.prototype.constructor = Stage;
Stage.prototype.consts = {};
//// floor texture

Stage.prototype.consts.floorTexture = (function(){
  var tex = THREE.ImageUtils.loadTexture("../images/grass.jpg");
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set( 10,10 );
  return tex;
})();


Stage.prototype.consts.floorMaterial = new THREE.MeshLambertMaterial({
  map: Stage.prototype.consts.floorTexture
});
Stage.prototype.update = function(t,runnerDistance) {
  this.backLimit = runnerDistance - 10;
  this.flow();
  for(var i = 0 ; i < this.updaters.length ; i++){
    this.updaters[i](t);
  }
};
// fix things behined backLimit
Stage.prototype.flow = function() {
  for (var i = 0; i < this.fixers.length; i++) {
    this.fixers[i]();
  }
};
