"strict mode";
var createRandom = function(s) {
  if (s === undefined) s = 7; // random seed
  return {
    seed: s,
    next: function() {
      var increment = 0.7;
      this.seed += increment;
      var x = Math.sin(this.seed) * 10000;
      return x - Math.floor(x);
    }
  };
};

var leafFactory = {};
leafFactory.consts = {};
leafFactory.consts.texture = THREE.ImageUtils.loadTexture("../images/leaf.png");
leafFactory.consts.alphaTest = 0.7;
leafFactory.consts.material = new THREE.MeshLambertMaterial({
  map: leafFactory.consts.texture,
  transparent: true,
  alphaTest: leafFactory.consts.alphaTest,
  side: THREE.DoubleSide
});

// Create leaf geometry
leafFactory.standardLeafGeometry = (function() {
  var leafStandardMatrix = new THREE.Matrix4();
  leafStandardMatrix.makeTranslation(0.20, 0.01, 0);
  leafStandardMatrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI * 3 / 4));
  var leafMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3));
  leafMesh.matrixAutoUpdate = false;
  leafMesh.matrix = leafStandardMatrix;

  var leafGeometry = new THREE.Geometry();
  THREE.GeometryUtils.merge(leafGeometry, leafMesh);
  //
  return leafGeometry;
})();
// Create Tree leaf geometry
leafFactory.treeLeafGeometry = (function() {
  var l = new THREE.Mesh(leafFactory.standardLeafGeometry);
  l.matrixAutoUpdate = false;

  var lA = l; // no transformations

  var lB = l.clone();
  lB.matrix.multiply(new THREE.Matrix4().makeRotationY(-1 * Math.PI / 2));

  var lC = l.clone();
  lC.matrix.multiply(new THREE.Matrix4().makeRotationZ(1 / 3 * 2 * Math.PI));

  var lD = l.clone();
  lD.matrix.multiply(new THREE.Matrix4().makeRotationZ(2 / 3 * 2 * Math.PI));

  var treeLeafGeometry = new THREE.Geometry();
  THREE.GeometryUtils.merge(treeLeafGeometry, lA);
  THREE.GeometryUtils.merge(treeLeafGeometry, lB);
  THREE.GeometryUtils.merge(treeLeafGeometry, lC);
  THREE.GeometryUtils.merge(treeLeafGeometry, lD);

  return treeLeafGeometry;
})();

var TallGrass = function() {
  //this.random = createRandom(seed);

  THREE.Object3D.call(this);

  var q = new THREE.Mesh(this.consts.geometry, this.consts.material);
  q.rotation.x = Math.PI / 2;
  var q0 = new THREE.Object3D();
  q0.add(q);
  q0.translateZ(0.5 / 2 - 0.5 / 11);
  this.add(q0);

};

TallGrass.prototype = Object.create(THREE.Object3D.prototype);
TallGrass.prototype.constructor = TallGrass;
// Leaf Consts
TallGrass.prototype.consts = {};
TallGrass.prototype.consts.texture = THREE.ImageUtils.loadTexture("../images/tallGrass.png");
TallGrass.prototype.consts.geometry = new THREE.PlaneGeometry(0.5, 0.5);
TallGrass.prototype.consts.material = new THREE.MeshLambertMaterial({
  map: TallGrass.prototype.consts.texture,
  transparent: true,
  alphaTest: leafFactory.consts.alphaTest,
  side: THREE.DoubleSide
});

// Tree
var Tree = function(seed, radius) {
  THREE.Object3D.call(this);

  if (radius === undefined) radius = this.consts.branchRadiusBase;

  var length = (radius / this.consts.branchRadiusBase) * this.consts.branchLengthBase;

  var random = createRandom(seed);

  var branches = [];
  var leaves = [];

  var noise = function() {
    return 0.8 + random.next() * 0.4;
  };

  var __this = this;

  function pushToBranchesAndLeaves(radius, length, parentTransformations) {
    if (parentTransformations === undefined) parentTransformations = new THREE.Matrix4();
    if (radius <= __this.consts.radiusTerminator) {
      // just a leaf and;
      var leaf = new THREE.Mesh(leafFactory.treeLeafGeometry);
      leaf.matrixAutoUpdate = false;
      leaf.matrix = parentTransformations;
      leaves.push(leaf);
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
      var cTh = 2 * Math.PI / childNum * i; // * noise();
      var cPhi = phi; // *noise();

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
    THREE.GeometryUtils.merge(branchesGeometry, branches[i]);
  }
  var branchesMesh = new THREE.Mesh(branchesGeometry, this.consts.branchMaterial);
  this.add(branchesMesh);
  // combine leaves
  console.log("LEAVES : " + leaves.length);
  var leavesGeometry = new THREE.Geometry();
  for (i = 0; i < leaves.length; i++) {
    THREE.GeometryUtils.merge(leavesGeometry, leaves[i]);
  }
  var leavesMesh = new THREE.Mesh(leavesGeometry, leafFactory.consts.material);
  this.add(leavesMesh);
};

Tree.prototype = Object.create(THREE.Object3D.prototype);
Tree.prototype.constructor = Tree;
Tree.prototype.consts = {};
Tree.prototype.consts.texture = THREE.ImageUtils.loadTexture("../images/bark-rough.jpg");
Tree.prototype.consts.branchMaterial = new THREE.MeshLambertMaterial({
  map: Tree.prototype.consts.texture,
  alphaTest: leafFactory.consts.alphaTest
});
Tree.prototype.consts.branchGeometry = new THREE.CylinderGeometry(1 * 0.6, 1, 1);
Tree.prototype.consts.branchRadiusBase = 0.25;
Tree.prototype.consts.branchLengthBase = 2.0;
Tree.prototype.consts.radiusTerminator = 0.01;

//var TreeLeafMesh =
//Tree.prototype.consts.leafMesh =
