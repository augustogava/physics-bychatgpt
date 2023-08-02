class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(vector) {
        const dx = vector.x - this.x;
        const dy = vector.y - this.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    scale(vector) {
        return new Vector(this.x * vector, this.y * vector);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const magnitude = this.magnitude();
        return new Vector(this.x / magnitude, this.y / magnitude);
    }

    sub(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }

    angle(vector2) {
        return Math.atan2(this.cross(vector2), this.dot(vector2));
    }

    project(vector2) {
        const scale = this.dot(vector2) / vector2.dot(vector2);
        return vector2.scale(scale);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    perpendicular() {
        return new Vector(-this.y, this.x);
    }
}