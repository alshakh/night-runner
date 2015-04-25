var ShowRoom = function(object, R) {

  this.clock = new THREE.Clock();
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  this.light = new THREE.PointLight(0xffffff);
  this.renderer = new THREE.WebGLRenderer();


  // init
  // object
  this.thing = object;
  this.scene.add(this.thing);
  this.camR = R * 2;
  /// camera
  var cam = this.camera;
  cam.up.set(0, 0, 1);
  cam.position.set(0, 0, 0);
  this.scene.add(cam);


  /// light
  this.light.position.set(0, 10, 10);
  this.scene.add(this.light);
  this.scene.add(new THREE.AmbientLight(0x999999));

  /// renderer
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  containerElement.appendChild(this.renderer.domElement);

  /// axis
  this.scene.add(new THREE.AxisHelper(10));
  // stats
  this.stats = new Stats();
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.top = '0px';
  containerElement.appendChild(this.stats.domElement);


  var showRoom = this;

  function render() {

    requestAnimationFrame(render);
    showRoom.renderer.render(showRoom.scene, showRoom.camera);
    showRoom.update(showRoom.clock.getElapsedTime());
    showRoom.stats.update();
  }
  render();
};
ShowRoom.prototype.constructor = ShowRoom;
ShowRoom.prototype.update = function(t) {
  // Running !
  var th = t;
  var phi = t;

  var x = this.camR * Math.cos(th);
  var y = this.camR * Math.sin(th);
  var z = this.camR * (0.5*Math.cos(phi)+0.5);

  this.camera.position.x = x;
  this.camera.position.y = y;
  this.camera.position.z = z;
  this.camera.lookAt(new THREE.Vector3(0,0,0));

  if(typeof this.thing.update === "function") {
    this.thing.update(t);
  }
};
