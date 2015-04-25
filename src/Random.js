var RANDOM = {
  nextDouble: function() {
    return Math.random();
  },
  nextInt: function(max) {
    if (max !== undefined) max = 1000;

    return Math.round(Math.random() * max);
  },
  // return 1 +- offset randomly
  noise: function(offset) {
    if (offset === undefined) offset = 0.2;
    return (1 - offset) + RANDOM.nextDouble() * 2 * offset;
  },
  centeredNextDouble: function() {
    return RANDOM.nextDouble() - 0.5;
  },
  probablyZeroRandom: function() {
    return (Math.random() + Math.random()) / 2 - 0.5;
  },
  probablyBorderRandom: function() {
    var rand = (Math.random() + Math.random()) / 2 - 0.5;
    if (rand < 0) rand += 1;
    return rand;
  },
  createSeededRandom: function(seed) {
    if (seed === undefined) seed = RANDOM.nextInt();
    return {
      nextDouble: function() {
        var increment = 0.7;
        seed += increment;
        var x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      },
      nextInt: function(max) {
        if (max !== undefined) max = 1000;
        return Math.round(this.nextDouble() * max);
      },
      noise: function() {
        return 0.8 + this.nextDouble() * 0.4;
      }
    };
  },


};
