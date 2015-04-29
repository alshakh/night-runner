var Stage = (function() {
  "use strict";

  function Stage(dimX, dimY, dimZ) {

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
      var t0 = new TallGrass();

      for (var i = 0; i < grassNum; i++) {
        var t = t0.clone();

        t.position.x = RANDOM.probablyZeroRandom() * __this.dimX * 0.6;
        t.position.y = RANDOM.nextDouble() * __this.dimY;
        t.rotation.z = Math.PI * 2 * RANDOM.nextDouble();
        var s = RANDOM.nextDouble()*0.4 + 0.4;

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


    /// flowers
    (function() {

      var flowers = [];
      var flowerNum = 70;
      var t0 = new Flower();

      for (var i = 0; i < flowerNum; i++) {
        var t = t0.clone();

        t.position.x = RANDOM.probablyZeroRandom() * __this.dimX * 0.6;
        t.position.y = RANDOM.nextDouble() * __this.dimY;
        t.rotation.z = Math.PI * 2 * RANDOM.nextDouble();
        var s = RANDOM.noise();

        t.scale.set(s, s, s);
        flowers.push(t);
        __this.add(t);
      }
      __this.fixers.push(function() {
        for (var i = 0; i < flowers.length; i++) {
          // fix trees
          if (flowers[i].position.y < __this.backLimit) {
            flowers[i].position.y += __this.dimY;
            flowers[i].position.x = RANDOM.probablyZeroRandom() * __this.dimX;
          }
        }
      });
    })();

    /// moths
    (function() {
      var moths = [];
      var mothNum = 20;
      var avgDistance = __this.dimY / (mothNum + 1);
      for (var i = 0; i < mothNum; i++) {
        var t = new Moth(RANDOM.nextDouble() * 1000);

        t.position.x = RANDOM.probablyZeroRandom() * __this.dimX;
        t.position.y = (RANDOM.nextDouble()) * __this.dimY;
        t.position.z = 2;
        t.rotation.z = RANDOM.nextDouble()*Math.PI*2;

        var s = RANDOM.noise();
        t.scale.set(s,s,s);
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



    /// floor
    (function() {
      var floorA = new THREE.Mesh(new THREE.PlaneGeometry(__this.dimX, __this.dimY),
        __this.consts.floorMaterial);
      floorA.translateY(__this.dimY / 2);

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
    var tex = THREE.ImageUtils.loadTexture("images/grass.jpg");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
  })();


  Stage.prototype.consts.floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x666666,
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

  return Stage;
})();
