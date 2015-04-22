"strict mode";
var createRandom = function (s) {
    if (s === undefined) s = 7; // random seed
    return {
        seed: s,
        next: function () {
            var increment = 0.7;
            this.seed += increment;
            var x = Math.sin(this.seed) * 10000;
            return x - Math.floor(x);
        }
    };
};

var leafFactory = {};
leafFactory.consts = {};
leafFactory.consts.alphaTest = 0.7;
leafFactory.consts.material = new THREE.MeshLambertMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide
});

// Create leaf geometry
leafFactory.standardLeafGeometry = (function () {
    var leafStandardMatrix = new THREE.Matrix4();
    leafStandardMatrix.makeTranslation(0.20, 0.01, 0);
    leafStandardMatrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI * 3 / 4));
    var leafMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3));
    leafMesh.matrixAutoUpdate = false;
    leafMesh.matrix = leafStandardMatrix;

    var leafGeometry = new THREE.Geometry();
    leafGeometry.merge( leafMesh.geometry, leafMesh.matrix );
    //
    return leafGeometry;
})();
// Create Tree leaf geometry
leafFactory.treeLeafGeometry = (function () {
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
    treeLeafGeometry.merge( lA.geometry, lA.matrix ); // changed
    treeLeafGeometry.merge( lB.geometry, lB.matrix ); // changed
    treeLeafGeometry.merge( lC.geometry, lC.matrix ); // changed
    treeLeafGeometry.merge( lD.geometry, lD.matrix ); // changed

    return treeLeafGeometry;
})();

// Tree
var Tree = function (seed, radius) {
    THREE.Object3D.call(this);

    if (radius === undefined) radius = this.consts.branchRadiusBase;

    var length = (radius / this.consts.branchRadiusBase) * this.consts.branchLengthBase;

    var random = createRandom(seed);

    var branches = [];
    var leaves = [];

    var noise = function () {
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
            var cTh = 2 * Math.PI / childNum * i * noise();
            var cPhi = phi * noise();

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
        branchesGeometry.merge( branches[i].geometry, branches[i].matrix ); // changed
    }
 
    branchesGeometry = new THREE.BufferGeometry().fromGeometry( branchesGeometry ); // changed
 
    var branchesMesh = new THREE.Mesh(branchesGeometry, this.consts.branchMaterial);
    this.add(branchesMesh);
    // combine leaves
    console.log("LEAVES : " + leaves.length);
    var leavesGeometry = new THREE.Geometry();
    for (i = 0; i < leaves.length; i++) {
        leavesGeometry.merge( leaves[i].geometry, leaves[i].matrix ); // changed
    }

    leavesGeometry = new THREE.BufferGeometry().fromGeometry( leavesGeometry ); // changed

    var leavesMesh = new THREE.Mesh(leavesGeometry, leafFactory.consts.material);
    this.add(leavesMesh);
};

Tree.prototype = Object.create(THREE.Object3D.prototype);
Tree.prototype.constructor = Tree;
Tree.prototype.consts = {};
Tree.prototype.consts.branchMaterial = new THREE.MeshLambertMaterial({
    alphaTest: leafFactory.consts.testAlpha,
    color: 0xD2691E
});

Tree.prototype.consts.branchGeometry = new THREE.CylinderGeometry(1 * 0.6, 1, 1);
Tree.prototype.consts.branchRadiusBase = 0.25;
Tree.prototype.consts.branchLengthBase = 2.0;
Tree.prototype.consts.radiusTerminator = 0.01;


/////////////
var clock = new THREE.Clock();
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.up.set(0, 0, 1);
camera.position.set(10, 10, 3);
camera.lookAt(scene.position);
scene.add(camera);

var light = new THREE.AmbientLight(0x999999);
scene.add(light);

var axisHelper = new THREE.AxisHelper(10);
scene.add(axisHelper);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var t = new Tree(Math.random() * 1000);
scene.add(t);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    update(clock.getElapsedTime());
}

function update(t) {
    camera.position.x = 30 * Math.cos(t / 10 * 2 * Math.PI);
    camera.position.y = 30 * Math.sin(t / 10 * 2 * Math.PI);
    camera.position.z = 10;
    camera.lookAt(scene.position);
}

render();
