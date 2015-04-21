"strict mode";
var createRandom = function(s) {
  if(s === undefined) s = 7; // random seed
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

var Leaf = function(seed, radius) {
  //this.random = createRandom(seed);

  THREE.Object3D.call( this );

  var me = this;

  var makeLeaf = function() {
    var l = new THREE.Mesh(me.consts.geometry, me.consts.material);
    l.position.x = 0.20;
    l.position.y = 0.01;
    l.rotation.z = -1 * Math.PI * 3 / 4;
    var q = new THREE.Object3D();
    q.add(l);
    return q;
  };

  l = makeLeaf();
  this.add(l);

  l = makeLeaf();
  l.rotation.z = 2 * Math.PI / 3;
  this.add(l);

  l = makeLeaf();
  l.rotation.z = 2 * Math.PI * 2 / 3;
  this.add(l);

  l = makeLeaf();
  l.rotation.y = -Math.PI / 2;
  this.add(l);
};

Leaf.prototype = Object.create(THREE.Object3D.prototype);
Leaf.prototype.constructor = Leaf;
// Leaf Consts
Leaf.prototype.consts = {};
Leaf.prototype.consts.texture = THREE.ImageUtils.loadTexture("../images/leaf.png");
Leaf.prototype.consts.geometry = new THREE.PlaneGeometry(0.3, 0.3);
Leaf.prototype.consts.testAlpha = 0.7;
Leaf.prototype.consts.material = new THREE.MeshLambertMaterial({
  map: Leaf.prototype.consts.texture,
  transparent: true,
  alphaTest: Leaf.prototype.consts.testAlpha,
  side: THREE.DoubleSide
});

var TallGrass = function() {
  //this.random = createRandom(seed);

  THREE.Object3D.call( this );

  var q = new THREE.Mesh(this.consts.geometry, this.consts.material);
  q.rotation.x = Math.PI/2;
  var q0 = new THREE.Object3D();
  q0.add(q);
  q0.translateZ(0.5/2-0.5/11);
  this.add(q0);

};

TallGrass.prototype = Object.create(THREE.Object3D.prototype);
TallGrass.prototype.constructor = TallGrass;
// Leaf Consts
TallGrass.prototype.consts = {};
TallGrass.prototype.consts.texture = THREE.ImageUtils.loadTexture("../images/tallGrass.png");
TallGrass.prototype.consts.geometry = new THREE.PlaneGeometry(0.5,0.5);
TallGrass.prototype.consts.material = new THREE.MeshLambertMaterial({
  map: TallGrass.prototype.consts.texture,
  transparent: true,
  alphaTest: Leaf.prototype.consts.testAlpha,
  side: THREE.DoubleSide
});

// Tree
var Tree = function(seed, radius) {

  THREE.Object3D.call(this);

  if (radius === undefined) radius = this.consts.branchRadiusBase;

  this.random = createRandom(seed);


  var length = (radius / this.consts.branchRadiusBase) * this.consts.branchLengthBase;

  var me = this;

  this.add(createBranch(radius, length));



  function createBranch(radius, length) {
    var noise = function() {
      return 0.8 + me.random.next() * 0.4;
    };

    if (radius <= me.consts.radiusTerminator) {
      // just a leaf and;
      return me.consts.myLeaf.clone();
    }

    var branch = new THREE.Object3D();

    var myRadius = radius;
    var myLength = length;
    var b = new THREE.Mesh(
      new THREE.CylinderGeometry(myRadius * 0.6, myRadius, myLength), me.consts.material);
    b.position.z = myLength / 2;
    b.rotation.x = Math.PI / 2;
    branch.add(b);

    var q = 0;
    var childNum = 4;
    var phi = Math.PI / 4;
    for (var i = 0; i < childNum; i++) {
      var r = 2 * myRadius / childNum;
      var th = 2 * Math.PI / childNum * i;
      var cb = createBranch(r, myLength / 1.3); // MAYBE : *noise()
      cb.rotation.order = "ZYX";
      cb.rotation.y = phi * noise();
      cb.rotation.z = th * noise();
      cb.position.z = myLength;
      branch.add(cb);
    }
  return branch;
  }
};

Tree.prototype = Object.create(THREE.Object3D.prototype);
Tree.prototype.constructor = Tree;
Tree.prototype.consts = {};
Tree.prototype.consts.texture = THREE.ImageUtils.loadTexture("../images/bark-rough.jpg");
Tree.prototype.consts.material = new THREE.MeshLambertMaterial({
  map: Tree.prototype.consts.texture,
  alphaTest: Leaf.prototype.consts.testAlpha
});
Tree.prototype.consts.branchRadiusBase = 0.25;
Tree.prototype.consts.branchLengthBase = 2.0;
Tree.prototype.consts.radiusTerminator = 0.01;
Tree.prototype.consts.myLeaf = new Leaf();
