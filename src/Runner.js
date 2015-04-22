var Runner = function(debug) {
  var shadow = false;

  if (debug === undefined) debug = false;
  this.debugMode = debug;

  this.clock = new THREE.Clock();
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);

  this.renderer = new THREE.WebGLRenderer();

  // init

  /// camera
  var cam = this.camera;
  cam.up.set(0, 0, 1);
  cam.position.set(0, 0, 4);
  cam.lookAt(new THREE.Vector3(0, 1, 2));
  this.scene.add(cam);

  /// light
  this.light = new THREE.PointLight(0xffffff);
  this.light.intensity = 0.5;
  this.lightDir = new THREE.DirectionalLight(0xaaaaaa);
  this.lightDir.position.set(0,1,1);
this.scene.add(this.lightDir);
  this.scene.add(this.light);
  if(shadow) {
    console.info("SHADOW is enabled");
  }

  /// renderer
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  containerElement.appendChild(this.renderer.domElement);




  /// stage
  this.stage = new Stage(42,30,30,shadow,this.debugMode);
  this.scene.add(this.stage);

  /// fog
  this.scene.fog = new THREE.Fog(0x333333,0,20);

  /// axis
  if (this.debugMode) {
    this.scene.add(new THREE.AxisHelper(10));
  }

  // stats
 if (this.debugMode) {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    containerElement.appendChild(this.stats.domElement);
  }

  var myRunner = this;

  function render() {
    requestAnimationFrame(render);
    myRunner.renderer.render(myRunner.scene, myRunner.camera);
    myRunner.update(myRunner.clock.getElapsedTime());
    if (myRunner.debugMode) {
      myRunner.stats.update();
    }
  }
  render();
};
Runner.prototype.constructor = Runner;
Runner.prototype.consts = {};
Runner.prototype.consts.camera = {
  position: new THREE.Vector3(0, 0, 2),
  lookForward: function(camera) {
    var la = camera.position.clone();
    la.y += 1;
    camera.lookAt(la);
  },
  lookAround: function(camera, t) {
    var la = camera.position.clone();
    la.y += 1;
    la.x += 0.1 * Math.cos(1.3 * t);
    la.z += 0.1 * Math.sin(1.7 * t);
    return la;
  },
};
Runner.prototype.update = function(t) {
  t = t/2;
  // Running !
  var y = t *10;
  var x = this.stage.dimX/10 * Math.cos(t) + this.consts.camera.position.x;
  var z = 0.5 * Math.sin(2 * t) + this.consts.camera.position.z;

  this.camera.position.set(x, y, z);

  var la = this.consts.camera.lookAround(this.camera, t);

  this.camera.lookAt(la);
  /*this.light.target.position.x = la.x;
  this.light.target.position.y = la.y;
  this.light.target.position.z = la.z;*/

  // update stage
  this.stage.update(t,this.camera.position.y);

  // update light
  this.light.x = this.camera.position.x;
  this.light.y = this.camera.position.y;
  this.light.z = this.camera.position.z;
};
