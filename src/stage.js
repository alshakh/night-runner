var Stage = function(dimX, dimY, dimZ, parameters) {

  if (parameters === undefined) parameters = {};

  this.dimX = dimX;
  this.dimY = dimY;
  this.dimZ = dimZ;

  THREE.Object3D.call(this);

  this.backLimit = 0;

  var __this = this; // to use inside fixers and updaters
  this.fixers = []; // functions to fix things
  this.updaters = []; // functions that update things

  var enableShadow = function(o) {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  };

  /// Trees
  (function() {
    var treeNum = 20;
    var trees = [];
    var t0 = new Tree(34);

    if (parameters.shadow) t0.traverse(enableShadow);

    for (var i = 0; i < treeNum; i++) {
      var t = t0.clone();
      t.position.x = RANDOM.probablyZeroRandom() * __this.dimX;
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
  (function() {

    var grasses = [];
    var grassNum = 300;
    var t0 = tallGrassFactory.mesh.clone();
    if (parameters.shadow) t0.traverse(enableShadow);
    for (var i = 0; i < grassNum; i++) {
      var t = t0.clone();

      t.position.x = RANDOM.probablyZeroRandom() * __this.dimX * 0.6;
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

  /// moths
  (function() {
    var moths = [];
    var mothNum = 10;
    var avgDistance = __this.dimY / (mothNum + 1);
    for (var i = 0; i < mothNum; i++) {
      var t = new Moth(RANDOM.nextDouble() * 1000);
      if (parameters.shadow) t.traverse(enableShadow);
      t.position.x = RANDOM.probablyZeroRandom() * __this.dimX;
      t.position.y = (RANDOM.nextDouble()) * __this.dimY;
      t.position.z = 2;
      t.rotation.z = RANDOM.nextDouble()*Math.PI*2;

      moths.push(t);
      __this.add(t);
    }
    __this.fixers.push(function() {
      for (var i = 0; i < moths.length; i++) {
        if (moths[i].position.y < __this.backLimit) {
          moths[i].position.y += __this.dimY;
          moths[i].position.x = RANDOM.probablyZeroRandom() * __this.dimX;
        }
      }
    });

    __this.updaters.push(function(t) {
      for (var i = 0; i < moths.length; i++) {
        moths[i].update(t);
      }
    });
  })();

  /// dome
  (function() {
    var domeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.BackSide
    });
    var dome = new THREE.Mesh(new THREE.BoxGeometry(__this.dimX * 4, __this.dimY * 4, __this.dimZ * 4), domeMaterial);
    __this.add(dome);

    __this.fixers.push(function() {
      dome.position.y = __this.backLimit;
    });
  })();


  /// indicator
  (function() {
    if (parameters.debugMode) {
      var dimYIndicator = new THREE.Mesh(new THREE.SphereGeometry(1));
      __this.add(dimYIndicator);

      __this.fixers.push(function() {
        dimYIndicator.position.y = __this.backLimit + __this.dimY;
      });
    }
  })();


  /// floor
  (function() {
    var floorA = new THREE.Mesh(new THREE.PlaneGeometry(__this.dimX, __this.dimY),
      __this.consts.floorMaterial);
    floorA.translateY(__this.dimY / 2);

    if (parameters.shadow) floorA.receiveShadow = true;

    var floorB = floorA.clone();
    floorB.translateY(__this.dimY);
    __this.add(floorA);
    __this.add(floorB);
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

Stage.prototype.consts.floorTexture = (function() {
  var tex = THREE.ImageUtils.loadTexture("../images/grass.jpg");
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
})();


Stage.prototype.consts.floorMaterial = new THREE.MeshLambertMaterial({
  color: 0x333333,
  map: Stage.prototype.consts.floorTexture
});
Stage.prototype.update = function(t, runnerDistance) {
  if(runnerDistance === undefined) runnerDistance = 0;
  this.backLimit = runnerDistance - 10;
  this.flow();
  for (var i = 0; i < this.updaters.length; i++) {
    this.updaters[i](t);
  }
};
// fix things behined backLimit
Stage.prototype.flow = function() {
  for (var i = 0; i < this.fixers.length; i++) {
    this.fixers[i]();
  }
};
