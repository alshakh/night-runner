"strict mode";
var T = {};
T.createRandom = function(s) {
    return {
        seed: s,
        next: function () {
            var increment = 0.7;
            this.seed += increment;
            var x = Math.sin(this.seed) * 10000;
            return x - Math.floor(x);
        }
    };
}

var consts = T.consts = {};
consts.testAlpha = 0.7;
// LEAF
T.Leaf = {};
T.Leaf.consts = {
  texture: THREE.ImageUtils.loadTexture("../images/leaf.png"),
  geometry: new THREE.PlaneGeometry(0.3, 0.3),
};
T.Leaf.consts.material= new THREE.MeshLambertMaterial({
  map: T.Leaf.consts.texture,
  transparent: true,
  alphaTest: T.consts.testAlpha,
  side: THREE.DoubleSide
});
T.Leaf.create = function() {
  var makeLeaf = function() {
    var l = new THREE.Mesh(ct.geometry, ct.material);
    //l.position.set(-1 * 0.3 / 12, -1 * (0.3 / 2 + 0.3 / 8), 0);
    l.position.x = 0.20;
    l.position.y = 0.01;
    l.rotation.z =-1* Math.PI*3/4;
    var q = new THREE.Object3D();
    q.add(l);
    return q;
  }
  var ct = T.Leaf.consts;
  var l;
  var lObject = new THREE.Object3D();
  l = makeLeaf();
  lObject.add(l);

  l = makeLeaf();
  l.rotation.z = 2 * Math.PI / 3;
  lObject.add(l);

  l = makeLeaf();
  l.rotation.z = 2 * Math.PI * 2 / 3;
  lObject.add(l);

  l = makeLeaf();
  l.rotation.y = - Math.PI / 2;
  lObject.add(l);

  return lObject;
};

// Tree
T.Tree= {};
T.Tree.consts = {
  texture: THREE.ImageUtils.loadTexture("../images/bark-rough.jpg"),
  branchRadiusBase : 0.25,
  branchLengthBase : 2.0,
  radiusTerminator : 0.01
}
T.Tree.consts.woodMaterial=  new THREE.MeshLambertMaterial({map: T.Tree.consts.texture, alphaTest: T.consts.testAlpha});
T.Tree.create = function(seed,radius) {
  var treeConst = T.Tree.consts;
  if(radius == undefined) radius = T.Tree.consts.branchRadiusBase;
  var newTree = {};
  newTree.random = T.createRandom(seed);
  var length = (radius/treeConst.branchRadiusBase)*treeConst.branchLengthBase;
  newTree.object3D = createBranch(radius,length);

  function createBranch(radius,length) {
    var noise = function() {
      return 0.8 + newTree.random.next() * 0.4;
    }
    if (radius <= treeConst.radiusTerminator) {
      // just a leaf and;
      return T.Leaf.create();
    }

    var branch = new THREE.Object3D();

    var myRadius = radius;
    var myLength = length;
    var b = new THREE.Mesh(
        new THREE.CylinderGeometry(myRadius*0.6, myRadius, myLength), treeConst.woodMaterial);
    b.position.z = myLength / 2;
    b.rotation.x = Math.PI / 2;
    branch.add(b);

    var childNum = 4;
    var phi = Math.PI / 4;
    for (var i = 0; i < childNum; i++) {
      var r = 2 * myRadius / childNum;
      //
      var th = 2 * Math.PI / childNum * i;
      //
      var cb = createBranch(r, myLength / 1.3); // MAYBE : *noise()
      cb.rotation.order = "ZYX";
      cb.rotation.y = phi * noise();
      cb.rotation.z = th * noise();
      cb.position.z = myLength;
      branch.add(cb);
    }
    return branch;
  }
  var q=  new THREE.Object3D();
  q.add(newTree.object3D);
  return q;
}
