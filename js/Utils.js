class Utils {
  static randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  static randomBoolean() {
    return Math.random() < 0.5;
  }

  static randomBoolean1orMinus1() {
    return Utils.randomBoolean() ? -1 : 1;
  }

  static clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  static clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  static changeRedSoftness(rgba, newRed) {
    var colorArray = rgba.match(/\d+/g).map(Number);
    return `rgba(${newRed}, ${colorArray[1]}, ${colorArray[2]}, ${colorArray[3]})`;
  }
}