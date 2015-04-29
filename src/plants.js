var Leaf = (function() {
  "use strict";
  var texture = THREE.ImageUtils.loadTexture("images/leaf.png");
  var alphaTest = 0.7;
  var leafMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
    alphaTest: alphaTest,
    side: THREE.DoubleSide
  });

  // Create leaf geometry
  var standardLeafGeometry = (function() {
    var leafStandardMatrix = new THREE.Matrix4();
    leafStandardMatrix.makeTranslation(0.20, 0.01, 0);
    leafStandardMatrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI * 3 / 4));
    var leafMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3));
    leafMesh.matrixAutoUpdate = false;
    leafMesh.matrix = leafStandardMatrix;

    var leafGeometry = new THREE.Geometry();
    leafGeometry.merge(leafMesh.geometry, leafMesh.matrix);
    //
    return leafGeometry;
  })();

  var treeLeafGeometry = (function() {
    var l = new THREE.Mesh(standardLeafGeometry);
    l.matrixAutoUpdate = false;

    var lA = l; // no transformations

    var lB = l.clone();
    lB.matrix.multiply(new THREE.Matrix4().makeRotationY(-1 * Math.PI / 2));

    var lC = l.clone();
    lC.matrix.multiply(new THREE.Matrix4().makeRotationZ(1 / 3 * 2 * Math.PI));

    var lD = l.clone();
    lD.matrix.multiply(new THREE.Matrix4().makeRotationZ(2 / 3 * 2 * Math.PI));

    var treeLeafGeometry = new THREE.Geometry();
    treeLeafGeometry.merge(lA.geometry,lA.matrix);
    treeLeafGeometry.merge(lB.geometry,lB.matrix);
    treeLeafGeometry.merge(lC.geometry,lC.matrix);
    treeLeafGeometry.merge(lD.geometry,lD.matrix);

    return treeLeafGeometry;
  })();

  var leafMesh = new THREE.Mesh(treeLeafGeometry, leafMaterial);

  function Leaf() {
    THREE.Object3D.call(this);

    this.add(leafMesh.clone());
  }
  Leaf.prototype = Object.create(THREE.Object3D.prototype);
  Leaf.prototype.constructor = Leaf;
  Leaf.prototype.consts = {
    geometry: treeLeafGeometry,
    material: leafMaterial,
    alphaTest: alphaTest
  };

  return Leaf;
})();


var TallGrass = (function() {
  "use strict";
  var consts = {};
  consts.texture = THREE.ImageUtils.loadTexture("images/tallGrass.png");
  consts.material = new THREE.MeshLambertMaterial({
    map: consts.texture,
    transparent: true,
    alphaTest: Leaf.prototype.consts.alphaTest,
    side: THREE.DoubleSide
  });
  consts.standardTallGrassMesh = (function() {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), consts.material);
    m.matrixAutoUpdate = false;
    m.matrix.multiply(new THREE.Matrix4().makeScale(4, 4, 4));
    m.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.5 / 2 - 0.5 / 11));
    m.matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    return m;
  })();

  var createTriTallGrass = function() {
    var t1 = consts.standardTallGrassMesh.clone();
    var t2 = t1.clone();
    var s;
    t2.matrix =
      new THREE.Matrix4().makeRotationZ(RANDOM.noise() * 1 / 3 * 2 * Math.PI).multiply(t2.matrix);
    s = RANDOM.noise();
    t2.matrix = new THREE.Matrix4().makeScale(s, s, s).multiply(t2.matrix);

    var t3 = t1.clone();
    t3.matrix =
      new THREE.Matrix4().makeRotationZ(RANDOM.noise() * 2 / 3 * 2 * Math.PI).multiply(t3.matrix);
    s = RANDOM.noise();
    t3.matrix = new THREE.Matrix4().makeScale(s, s, s).multiply(t3.matrix);

    var geo = new THREE.Geometry();

    geo.merge(t1.geometry, t1.matrix);
    geo.merge(t2.geometry, t2.matrix);
    geo.merge(t3.geometry, t3.matrix);

    var grassNum = 50;
    var grassRangeX = 20 * 3 / 5;
    var grassRangeY = 10 * 3 / 5;
    var r = 367.59673012420535;
    var random = RANDOM.createSeededRandom(r);
    var geoNew = new THREE.Geometry();
    for (var i = 0; i < grassNum; i++) {
      var g = geo.clone();
      s = random.noise();
      g.applyMatrix(new THREE.Matrix4().makeScale(s, s, s));
      g.applyMatrix(new THREE.Matrix4().makeRotationZ(random.nextDouble() * Math.PI * 2));
      geoNew.merge(g, new THREE.Matrix4().makeTranslation(random.nextDouble() * grassRangeX - grassRangeX / 2,
        random.nextDouble() * grassRangeY - grassRangeY / 2, 0));
    }

    return new THREE.Mesh(geoNew,consts.material);
  };

  var tallGrassMesh = createTriTallGrass();

  function TallGrass() {
    THREE.Object3D.call(this);

    this.add(tallGrassMesh.clone());
  }
  TallGrass.prototype = Object.create(THREE.Object3D.prototype);
  TallGrass.prototype.constructor = TallGrass;
  TallGrass.prototype.consts = consts;

  return TallGrass;
})();

///
/// Tree
///
var Tree = (function() {
  "use strict";

  var redLeavesMaterial = Leaf.prototype.consts.material.clone();
  redLeavesMaterial.color.setHex(0xaa0000);
  function Tree(seed, radius) {
    THREE.Object3D.call(this);

    if (radius === undefined) radius = this.consts.branchRadiusBase;

    var length = (radius / this.consts.branchRadiusBase) * this.consts.branchLengthBase;

    var myRandom = RANDOM.createSeededRandom(seed);

    var branches = [];
    var leaves = [];
    var redLeaves = [];


    var __this = this;

    function pushToBranchesAndLeaves(radius, length, parentTransformations) {
      if (parentTransformations === undefined) parentTransformations = new THREE.Matrix4();
      if (radius <= __this.consts.radiusTerminator) {

        // just a leaf and;
        var leaf = new THREE.Mesh(Leaf.prototype.consts.geometry);
        leaf.matrixAutoUpdate = false;
        leaf.matrix = parentTransformations;

        // red leaves 7% of the time;
        if(myRandom.nextDouble() <= 0.07) {
          redLeaves.push(leaf);
        } else {
          leaves.push(leaf);
        }
        return;
      }

      var branch = new THREE.Mesh(__this.consts.branchGeometry);
      branch.matrixAutoUpdate = false;
      branch.matrix = parentTransformations.clone();
      branch.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, length));
      branch.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.5));
      branch.matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

      branches.push(branch);

      // children

      var q = 0;
      var childNum = 4;
      var phi = Math.PI / 4;
      for (var i = 0; i < childNum; i++) {
        var cRadius = 2 * radius / childNum;
        var cLength = length / 1.3;
        var cTh = 2 * Math.PI / childNum * i * myRandom.noise();
        var cPhi = phi * myRandom.noise();

        var cMatrix = parentTransformations.clone();
        cMatrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, length));
        cMatrix.multiply(new THREE.Matrix4().makeRotationZ(cTh));
        cMatrix.multiply(new THREE.Matrix4().makeRotationY(cPhi));

        pushToBranchesAndLeaves(cRadius, cLength, cMatrix);
      }
    }

    // Create Tree
    pushToBranchesAndLeaves(radius, length);
    // combine branches
    var branchesGeometry = new THREE.Geometry();
    for (var i = 0; i < branches.length; i++) {
      branchesGeometry.merge(branches[i].geometry, branches[i].matrix);
    }
    var branchesMesh = new THREE.Mesh(branchesGeometry, this.consts.branchMaterial);
    this.add(branchesMesh);
    // combine leaves
    var leavesGeometry = new THREE.Geometry();
    for (i = 0; i < leaves.length; i++) {
      leavesGeometry.merge(leaves[i].geometry,leaves[i].matrix);
    }
    var leavesMesh = new THREE.Mesh(leavesGeometry, Leaf.prototype.consts.material);

    this.add(leavesMesh);
    // redLeaves
    var redLeavesGeometry = new THREE.Geometry();
    for (i = 0; i < redLeaves.length; i++) {
      redLeavesGeometry.merge(redLeaves[i].geometry,redLeaves[i].matrix);
    }
    var redLeavesMesh = new THREE.Mesh(redLeavesGeometry, redLeavesMaterial);

    this.add(redLeavesMesh);
  }

  Tree.prototype = Object.create(THREE.Object3D.prototype);
  Tree.prototype.constructor = Tree;
  Tree.prototype.consts = {};
  Tree.prototype.consts.texture = THREE.ImageUtils.loadTexture("images/bark-rough.jpg");
  Tree.prototype.consts.branchMaterial = new THREE.MeshLambertMaterial({
    map: Tree.prototype.consts.texture,
    alphaTest: Leaf.prototype.consts.alphaTest
  });
  Tree.prototype.consts.branchGeometry = new THREE.CylinderGeometry(1 * 0.6, 1, 1);
  Tree.prototype.consts.branchRadiusBase = 0.25;
  Tree.prototype.consts.branchLengthBase = 2.0;
  Tree.prototype.consts.radiusTerminator = 0.01;

  return Tree;
})();




var Flower = (function() {
  "use strict";

  var flowerLeg = (function() {
    var CustomSinCurve = THREE.Curve.create(
      function(scale) { //custom curve constructor
        this.scale = (scale === undefined) ? 1 : scale;
      },

      function(t) { //getPoint: t is between 0-1
        var tx = 0.2 * Math.sin(t * 2 / 3 * Math.PI),
          ty = t,
          tz = 0;

        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
      }
    );

    var path = new CustomSinCurve(1);

    var geometry = new THREE.TubeGeometry(
      path, //path
      10, //segments
      0.01, //radius
      8, //radiusSegments
      false //closed
    );

    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

    return geometry;
  })();

  var leafsGeometry = (function() {
    var geo = new THREE.PlaneGeometry(0.5, 0.5);

    geo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 2 * 3));
    geo.applyMatrix(new THREE.Matrix4().makeTranslation(0.23, 0.23, 0));

    geo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 3));
    geo.applyMatrix(new THREE.Matrix4().makeRotationY(-1 * Math.PI / 3));
    geo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 3));

    var geometry = new THREE.Geometry();
    geometry.merge(geo.clone());

    geo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    geometry.merge(geo.clone());

    geo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    geometry.merge(geo.clone());

    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.2, 0, 0.6));
    return geometry;
  })();

  var patalGeometry = (function() {
    var geom = leafsGeometry.clone();
    geom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, 0.5));
    geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0.7));
    return geom;
  })();

  var flowerMesh = new THREE.Mesh(flowerLeg, Tree.prototype.consts.branchMaterial);
  var leafsMesh = new THREE.Mesh(leafsGeometry, Leaf.prototype.consts.material);

  var patalsMaterial = Leaf.prototype.consts.material.clone();
  patalsMaterial.color.setHex(0xff0000);
  var patalMesh = new THREE.Mesh(patalGeometry, patalsMaterial);

  function Flower() {
    THREE.Object3D.call(this);

    this.add(flowerMesh.clone());
    this.add(patalMesh.clone());
    this.add(leafsMesh.clone());
  }
  Flower.prototype = Object.create(THREE.Object3D.prototype);
  Flower.prototype.constructor = Flower;

  return Flower;
})();
