var Runner = function(runSpeed) {
  var __this = this; // to be used in clousurs

  if(runSpeed === undefined) runSpeed = 5;
  __this.runSpeed = runSpeed;

  var dimX = 42;
  var dimY = 25;
  var dimZ = 30;


  this.updaters = []; // store update Functions

  var clock = new THREE.Clock();
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer();
  var light = new THREE.SpotLight();

  /// renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  containerElement.appendChild(renderer.domElement);

  /// soft ambient light
  scene.add(new THREE.AmbientLight(0x111111));

  /// stage
  (function() {
    var stage = new Stage(dimX, dimY + 10, dimZ);
    scene.add(stage);

    __this.updaters.push(function(t) {
      stage.update(t, camera.position.y);
    });
  })();


  /// camera
  (function() {
    var cameraZ = 2;
    camera.up.set(0, 0, 1);
    camera.position.set(0, 0, cameraZ);
    light.target.position.set(0, 1, 2);
    camera.lookAt(light.target.position);

    scene.add(camera);

    var lookForward = function() {
      var la = camera.position.clone();
      la.y += 1;
      return la;
    };

    var lookAround = function(t) {
      var la = new THREE.Vector3();
      la.y = 1;
      la.x = 0.2 * Math.cos(1.3 * t);
      la.z = 0.1 * Math.sin(1.7 * t);
      return la;
    };

    __this.updaters.push(function(t) {
      var camPos = camera.position;

      camPos.y = t * __this.runSpeed;

      camPos.x = dimX / 30 * Math.cos(t);
      camPos.z = 0.2 * Math.sin(2 * t) + cameraZ;

      var la = lookAround(t);
      light.position.copy(camera.position);

      la.add(camera.position);
      light.target.position.copy(la);
      camera.lookAt(light.target.position);

    });
  })();


  /// Main light
  (function() {
    scene.add(light.target);
    light.color.setHex(0xffffff);
    light.angle = Math.PI / 5;
    light.intensity = 1;
    light.exponent = 2;
    scene.add(light);
  })();

  /// fog
  scene.fog = new THREE.Fog(0x111111, 0, dimY);

  // stats

    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    containerElement.appendChild(stats.domElement);

    __this.updaters.push(function(t) {
      stats.update();
    });


  // Render function
  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    __this.update(clock.getElapsedTime());
  }
  this.render = render;

};
Runner.prototype.constructor = Runner;
Runner.prototype.update = function(t) {

  this.updaters.forEach(function(updater) {
    updater(t);
  });
};
