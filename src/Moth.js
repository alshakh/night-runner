var Moth = (function() {
  "use strict";

  var mothWingTex = THREE.ImageUtils.loadTexture("../images/moth-rightWing.png");
  var mothWingMaterial = new THREE.MeshLambertMaterial({
    map: mothWingTex,
    transparent: true,
    alphaTest: 0.7,
    side: THREE.DoubleSide
  });

  var scale = 5;
  var rightWingGeometry = new THREE.PlaneGeometry(0.1*scale, 0.11*scale);
  rightWingGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.05*scale,0,0));

  var leftWingGeometry = rightWingGeometry.clone();
  leftWingGeometry.applyMatrix(new THREE.Matrix4().makeScale(-1,1,1));
  leftWingGeometry.verticesNeedUpdate = true;
  leftWingGeometry.normalsNeedUpdate = true;
  leftWingGeometry.computeBoundingSphere();
  leftWingGeometry.computeFaceNormals();
  leftWingGeometry.computeVertexNormals();
  /**
  * constructor
  */
  function Moth(timeOffset) {
    THREE.Object3D.call(this);

    if(timeOffset === undefined) timeOffset = 0;
    this.timeOffset = timeOffset;

    this.rightWing = new THREE.Mesh(rightWingGeometry, mothWingMaterial);

    this.leftWing = new THREE.Mesh(leftWingGeometry, mothWingMaterial);

    var order = "XZY";
    this.leftWing.rotation.order = order;
    this.rightWing.rotation.order = order;

    this.add(this.rightWing);
    this.add(this.leftWing);
  }
  Moth.prototype = Object.create(THREE.Object3D.prototype);
  Moth.prototype.constructor = Moth;

  var wingSpeed = 0.5; // per second
  var upDownSpeed = 0.1;
  var leftRightSpeed = 0.1;
  var xRange = 1;
  var zRange = 0.5;

  Moth.prototype.update = function(t){
    t += this.timeOffset;

    this.rightWing.rotation.y = Math.sin(wingSpeed*t*(2*Math.PI));
    this.leftWing.rotation.y = -1*this.rightWing.rotation.y;

    // oriantation;
    this.rightWing.rotation.x = Math.sin(upDownSpeed*t*(2*Math.PI));
    this.leftWing.rotation.x = this.rightWing.rotation.x;

    this.rightWing.rotation.z = Math.sin(leftRightSpeed*t*(2*Math.PI));
    this.leftWing.rotation.z = this.rightWing.rotation.z;

    // position
    this.rightWing.position.x = xRange*Math.sin(leftRightSpeed*t*(2*Math.PI));
    this.leftWing.position.x = this.rightWing.position.x;

    this.rightWing.position.z = zRange*Math.sin(upDownSpeed*t*(2*Math.PI));
    this.leftWing.position.z = this.rightWing.position.z;
  };

  return Moth;
})();
