
var Stage = function() {
  THREE.Object3D.call(this);

  this.trees = [];
  var treeNum = 100;
  for(var i = 0 ; i < treeNum ; i++) {
    var t = new THREE.Mesh(new THREE.SphereGeometry(1),new THREE.MeshBasicMaterial({color:0xff00ff}));
    //var t = new Leaf();
    t.position.x = (Math.random()-0.5)*this.consts.dimX;
    t.position.y = Math.random()*this.consts.dimY;
    this.trees.push(t);
    this.add(t);
  }

  //
  this.backLimit = 0;
};
Stage.prototype = Object.create(THREE.Object3D.prototype);
Stage.prototype.constructor = Stage;
Stage.prototype.consts = {};
Stage.prototype.consts.dimY = 100;
Stage.prototype.consts.dimX = 100;

Stage.prototype.update = function(runnerDistance) {
  this.backLimit = runnerDistance;
  this.flow();
};
// fix things behined backLimit
Stage.prototype.flow = function() {
  for(var i = 0 ; i < this.trees.length ; i++) {
    if(this.trees[i].position.y < this.backLimit) {
      this.trees[i].position.y+=this.consts.dimY;
    }
  }
};

//

var Runner = function(debug) {
  if(debug === undefined) debug = false;

  this.clock = new THREE.Clock();
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  this.light = new THREE.PointLight(0xffffff);
  this.renderer = new THREE.WebGLRenderer();

  this.stage = new Stage();
  this.scene.add(this.stage);
  this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(1),new THREE.MeshBasicMaterial({color:0xff0000})));

  //this.scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1), new THREE.MeshBasicMaterial({color:0xff0000})));
  //this.scene.add(new Tree(54));
  // init
  /// camera
  var cam = this.camera;
  cam.up.set(0,0,1);
  cam.position.set(0,0,2);
  cam.lookAt(new THREE.Vector3(0,1,2));
  this.scene.add(cam);

  /// light
  this.light.position.set(0,10,10);
  this.scene.add(this.light);

  /// renderer
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(this.renderer.domElement);

  /// axis
  if(debug) {
    this.scene.add(new THREE.AxisHelper(10));
  }

  var myRunner = this;
  function render() {
    	requestAnimationFrame(render);
    	myRunner.renderer.render(myRunner.scene, myRunner.camera);
      myRunner.update(myRunner.clock.getElapsedTime());
  }
  render();
};
Runner.prototype.constructor = Runner;

Runner.prototype.consts = {};
Runner.prototype.consts.camera = {
  position : new THREE.Vector3(0,0,2),
  lookForward : function(camera) {
    var la = camera.position.clone();
    la.y +=1;
    camera.lookAt(la);
  },
  lookAround : function(camera,t) {
    var la = camera.position.clone();
    la.y +=1;
    la.x += 0.1*Math.cos(1.3*t);
    la.z += 0.1*Math.sin(1.7*t);
    camera.lookAt(la);
  },
};
Runner.prototype.update = function(t) {
  // Running !
  var y = t*15;
  var x = 10*Math.cos(t) +  this.consts.camera.position.x;
  var z = 1.5*Math.sin(2*t) +this.consts.camera.position.z;

  this.camera.position.set(x,y,z);
  this.consts.camera.lookAround(this.camera,t);

  // update stage
  this.stage.update(this.camera.position.y);
  
  // update light
  this.light.y = this.camera.position.y;
  this.light.x = this.camera.position.x;
  this.light.z = this.camera.position.z;
};
