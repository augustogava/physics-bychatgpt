class Rectangle extends Shape {
  constructor(position, velocity, mass, width, height, degrees) {
    super(Rectangle, mass, position, velocity, degrees);

    this.width = width;
    this.height = height;
    this.halfWidth = width / 2;
    this.halfHeight = height / 2;

    this.debugData = {
      normal: -1,
      distance: -1,
      massDiff: -1,
      relativeVelocity: -1,
      pa: [],
      pb: [],
    };
  }

  update(deltaTime) {
    if (!this.statePhysics) {
      return;
    }
    const deltaTimeSeconds = deltaTime / 1000;

    this.applyGravity();

    this.positionOld = new Vector(this.position.x, this.position.y);
    this.acceleration = this.physics.acceleration;

    this.velocity.x += this.acceleration.x * deltaTimeSeconds;
    this.velocity.y += this.acceleration.y * deltaTimeSeconds;

    //Apply air resistence
    this.velocity.y *= this.physics.airResistence;

    this.position.x += this.velocity.x * deltaTimeSeconds;
    this.position.y += this.velocity.y * deltaTimeSeconds;

    this.angle += this.angularVelocity;

    if (Globals.getBoundaries()) {
      if (this.position.y + this.height >= canvas.height) {
        this.position.y = canvas.height - this.height;

        this.velocity.y = this.velocity.y * -1 * this.physics.friction;
        if (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 1) {
          this.velocity.x *= this.physics.friction;
        }
      }

      if (this.position.y + this.height < 0) {
        this.position.y = this.height;

        this.velocity.y = this.velocity.y * -1 * this.physics.friction;
      }

      if (this.position.x + this.width >= canvas.width) {
        this.position.x = canvas.width - this.width;
        this.velocity.x = this.velocity.x * -1 * this.physics.friction;
      }

      if (this.position.x < 0) {
        this.position.x = 0 + this.width;
        this.velocity.x = this.velocity.x * -1 * this.physics.friction;
      }
    }

    this.commonsUpdate(this);
  }

  draw() {
    ctx.save();

    ctx.fillStyle = this.color;
    ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );

    ctx.beginPath();
    ctx.rotate(this.angle);
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.closePath();
    ctx.restore();

    this.drawArrow();

  }

  drawArrow() {

    const arrowLength = 2 * this.velocity.magnitude();
    const arrowBase = new Vector(this.position.x + this.width / 2, this.position.y + this.height / 2);
    const arrowTip = arrowBase.add(this.velocity.normalize().scale(arrowLength));

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(arrowBase.x, arrowBase.y);
    ctx.lineTo(arrowTip.x, arrowTip.y);
    ctx.stroke();
    ctx.translate(arrowTip.x, arrowTip.y);
    ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawCollisionResolve() {
    // this.debugData = { normal: normal, distance: distance, massDiff: massDiff, relativeVelocity: relativeVelocity, pa: this.getPoints(), pb: rect.getPoints() }

    ctx.save();
    ctx.fillStyle = "white";

    ctx.fillText(
      "normal: " +
      this.debugData.normal +
      " distance: " +
      this.debugData.distance +
      " massDiff: " +
      this.debugData.massDiff,
      this.position.x - 80,
      this.position.y - 15
    );

    ctx.fillText(
      "RelaVeloX: " +
      this.debugData.relativeVelocity.x +
      "RelaVeloY: " +
      this.debugData.relativeVelocity.y,
      this.position.x + this.width,
      this.position.y + this.height / 2
    );

    // this.drawPoints(this.debugData.pa, "orange");
    // this.drawPoints(this.debugData.pb, "orangef");
  }

  drawPoints(points, color) {
    ctx.save();
    ctx.fillStyle = color;

    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(
        point.x + this.width / 2,
        point.y + this.height / 2,
        5,
        0,
        5 * Math.PI
      );
      ctx.fill();
      ctx.closePath();
    });

    ctx.restore();
  }

  drawPoint(x, y) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  debug() {
    ctx.save();

    ctx.fillStyle = "white";
    ctx.font = "13px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillText(
      this.id,
      this.position.x + this.width / 2 - 12,
      this.position.y + this.height / 2 - 5
    );

    ctx.fillText(
      "x: " +
      this.positionFixed.x +
      " y: " +
      this.positionFixed.y +
      " W: " +
      this.width,
      this.position.x,
      this.position.y - 40
    );

    ctx.fillText(
      "vx: " + this.velocityFixed.x + " y: " + this.velocityFixed.y,
      this.position.x,
      this.position.y - 20
    );

    ctx.restore();

    ctx.save();
    ctx.beginPath();

    const velocity = this.velocity.add(
      this.physics.acceleration.scale(game.debugger.PROJECTION_STEP)
    );
    const nextX =
      this.position.x + this.velocity.x * game.debugger.PROJECTION_STEP;
    const nextY =
      this.position.y + this.velocity.y * game.debugger.PROJECTION_STEP;

    ctx.strokeStyle = this.colorProjection;
    ctx.rotate(this.angle);
    // ctx.globalAlpha = .8 ;
    ctx.lineWidth = "2";
    ctx.translate(nextX + 2.5 + this.width / 2, nextY + 2.5 + this.height / 2);
    ctx.strokeRect(
      -this.width / 2,
      -this.height / 2,
      this.width - 5,
      this.height - 5
    );
    ctx.closePath();
    ctx.restore();

    game.debugger.log({
      id: this.id,
      type: "rectangle",
      timestamp: Date.now(),
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    });
  }

  drawShadow() {
    ctx.strokeStyle = this.colorProjection;

    this.historyShadow.forEach((shadow, index) => {
      ctx.save();

      ctx.beginPath();
      ctx.globalAlpha = 0.1 - index * this.SHADOW_HISTORY;
      ctx.rotate(shadow.angle);
      ctx.translate(shadow.x + shadow.width / 2, shadow.y + shadow.height / 2);
      ctx.strokeRect(
        -shadow.width / 2,
        -shadow.height / 2,
        shadow.width,
        shadow.height
      );
      ctx.closePath();

      ctx.restore();
    });

    ctx.globalAlpha = 1;
  }

  attract() {
    let otherObj = undefined;
    //findotherbj
    if (
      !Globals.isAttraction() ||
      !game.getObjects() ||
      (game.getObjects() != undefined && game.getObjects().length == 1)
    ) {
      return;
    }

    const objs = game.getObjects();

    for (let i = 0; i < objs.length; i++) {
      if (this.id != objs[i].id) {
        otherObj = objs[i];

        const direction = this.position.sub(otherObj.position);
        const distance = direction.magnitude();

        const forceMag =
          this.G * ((this.mass * otherObj.mass) / Math.pow(distance, 2));
        const force = direction.normalize().scale(forceMag);

        this.physics.applyForce(force);
      }
    }
  }

  applyGravity() {
    // console.log(this.physics.forces)
  }

  applyFriction() {
    this.physics.applyForce({
      x: this.velocity.x * -1 * this.friction,
      y: this.velocity.y * -1 * this.friction,
    });
  }

  // collidesWith(other) {
  //   if (other instanceof Rectangle) {
  //     if (SAT.isColliding(this, other)) {
  //       this.resolveCollisionNewSAT(other);
  //     }
  //   } else if (other instanceof Circle) {
  //   }

  //   const closestX = Utils.clamp(
  //     this.position.x,
  //     other.position.x - other.sideLength / 2,
  //     other.position.x + other.sideLength / 2
  //   );
  //   const closestY = Utils.clamp(
  //     this.position.y,
  //     other.position.y - other.sideLength / 2,
  //     other.position.y + other.sideLength / 2
  //   );
  //   const distance = Math.sqrt(
  //     (closestX - this.position.x) * (closestX - this.position.x) +
  //     (closestY - this.position.y) * (closestY - this.position.y)
  //   );

  //   const minimumDistance = this.width / 2;

  //   if (distance <= minimumDistance) {
  //   }
  // }

  project(shape, axis) {
    let min = shape[0].dot(axis);
    let max = min;
    for (let i = 1; i < shape.length; i++) {
        let value = shape[i].dot(axis);
        if (value < min) {
            min = value;
        } else if (value > max) {
            max = value;
        }
    }
    return {min: min, max: max};
}

  collidesWith(rect2) {
    if (rect2 instanceof Circle) {
      return ;
    }
        //   if (SAT.isColliding(this, other)) {
        //     this.resolveCollisionNewSAT(other);
        //   }
        // } else if (other instanceof Circle) {
        // }
    let r1 = { x: Math.cos(this.angle) * this.width / 2, y: Math.sin(this.angle) * this.width / 2 };
    
    let r2 = { x: Math.cos(rect2.angle) * rect2.width / 2, y: Math.sin(rect2.angle) * rect2.width / 2 };
    
    let rect1Vertices = [{ x: this.position.x - r1.y, y: this.position.y + r1.x }, { x: this.position.x + r1.y, y: this.position.y - r1.x }, { x: this.position.x + r1.y - r1.x, y: this.position.y - r1.x - r1.y }, { x: this.position.x - r1.y - r1.x, y: this.position.y + r1.x - r1.y }];
    
    let rect2Vertices = [{ x: rect2.position.x - r2.y, y: rect2.position.y + r2.x }, { x: rect2.position.x + r2.y, y: rect2.position.y - r2.x }, { x: rect2.position.x + r2.y - r2.x, y: rect2.position.y - r2.x - r2.y }, { x: rect2.position.x - r2.y - r2.x, y: rect2.position.y + r2.x - r2.y }];
    
    let mtv = { axis: null, overlap: Infinity };
    
    let axes = [{ x: Math.cos(this.angle), y: Math.sin(this.angle) }, { x: Math.cos(this.angle + Math.PI / 2), y: Math.sin(this.angle + Math.PI / 2) }, { x: Math.cos(rect2.angle), y: Math.sin(rect2.angle) }, { x: Math.cos(rect2.angle + Math.PI / 2), y: Math.sin(rect2.angle + Math.PI / 2) }];
    
    for (let i = 0; i < axes.length; i++) {
        let axis = axes[i];
        let rect1Projection = this.project(rect1Vertices, axis);
        let rect2Projection = this.project(rect2Vertices, axis);
        let overlap = Math.min(rect1Projection.max, rect2Projection.max) - Math.max(rect1Projection.min, rect2Projection.min);
        if (overlap < 0) {
            return; // No collision found
        } else if (overlap < mtv.overlap) {
            mtv.overlap = overlap;
            mtv.axis = axis;
            let d = { x: this.position.x - rect2.position.x, y: this.position.y - rect2.position.y };
            if (dotProduct(d, mtv.axis) < 0) {
                mtv.axis = {
                    x: -mtv
                }
            }
        }
    }

    let collisionNormal = { x: mtv.axis.x, y: mtv.axis.y }; //ERROR
    let collisionPoint = { x: 0, y: 0 };
    for (let i = 0; i < rect1Vertices.length; i++) {
        let vertex = rect1Vertices[i];
        let projection = dotProduct(vertex, collisionNormal) / dotProduct(collisionNormal, collisionNormal);
        let point = { x: vertex.x - collisionNormal.x * projection, y: vertex.y - collisionNormal.y * projection };
        collisionPoint.x += point.x;
        collisionPoint.y += point.y;
    }

    for (let i = 0; i < rect2Vertices.length; i++) {
        let vertex = rect2Vertices[i];
        let projection = dotProduct(vertex, collisionNormal) / dotProduct(collisionNormal, collisionNormal);
        let point = { x: vertex.x - collisionNormal.x * projection, y: vertex.y - collisionNormal.y * projection };
        collisionPoint.x += point.x;
        collisionPoint.y += point.y;
    }

    collisionPoint.x /= (rect1Vertices.length + rect2Vertices.length);
    collisionPoint.y /= (rect1Vertices.length + rect2Vertices.length);

    this.resolve(rect2, collisionNormal, collisionPoint);
}

resolve(rect2, collisionNormal, collisionPoint) {
    let relativeVelocity = {
      x: rect2.velocity.x - this.velocity.x - (rect2.angularVelocity * rect2.height / 2) + (this.angularVelocity * this.height / 2),
      y: rect2.velocity.y - this.velocity.y + (rect2.angularVelocity * rect2.width / 2) - (this.angularVelocity * this.width / 2)
    };

    // Calculate relative velocity along collision normal
    let velocityAlongNormal = dotProduct(relativeVelocity, collisionNormal);

    // Calculate impulse scalar
    let impulseScalar = -(1 + this.restitution * rect2.restitution) * velocityAlongNormal /
      (1 / this.mass + 1 / rect2.mass +
        Math.pow(crossProduct(collisionPoint, collisionNormal), 2) / this.momentOfInertia +
        Math.pow(crossProduct(collisionPoint, collisionNormal), 2) / rect2.momentOfInertia);

    // Apply impulse to objects
    this.velocity.x -= impulseScalar * collisionNormal.x / this.mass;
    this.velocity.y -= impulseScalar * collisionNormal.y / this.mass;
    rect2.velocity.x += impulseScalar * collisionNormal.x / rect2.mass;
    rect2.velocity.y += impulseScalar * collisionNormal.y / rect2.mass;

    // Calculate torque scalar
    let torqueScalar1 = crossProduct(collisionPoint, { x: -collisionNormal.y, y: collisionNormal.x });
    let torqueScalar2 = crossProduct(collisionPoint, { x: collisionNormal.y, y: -collisionNormal.x });
    let torqueScalar = (torqueScalar1 / this.momentOfInertia) + (torqueScalar2 / rect2.momentOfInertia);

    // Apply torque to objects
    this.angularVelocity -= impulseScalar * torqueScalar1 / this.momentOfInertia;
    rect2.angularVelocity += impulseScalar * torqueScalar2 / rect2.momentOfInertia;
  }

  getPoints() {
    const x = this.position.x;
    const y = this.position.y;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    const points = [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight }
    ];

    return points.map(point => {
      return {
        x: point.x * Math.cos(this.angle) - point.y * Math.sin(this.angle) + x,
        y: point.x * Math.sin(this.angle) + point.y * Math.cos(this.angle) + y
      };
    });
  }

  projectOnto(vector) {
    const unit = this.velocity.unit();
    return unit.mult(unit.dot(vector));
  }

  // method to get the projection of a vector onto the surface of an object
  project(vector) {
    const surfaceNormal = new Vector(0, 1); // assuming the surface is a horizontal plane
    return this.projectOnto(surfaceNormal.mult(surfaceNormal.dot(vector)));
  }

  getOverlap(otherRectangle) {
    // Calculate the axes of separation for the two rectangles
    const axes = this.getAxes().concat(otherthis.getAxes());

    let overlap = Number.MAX_VALUE;
    let smallestAxis = null;

    // For each axis, project both rectangles onto the axis and check for overlap
    for (let i = 0; i < axes.length; i++) {
      const axis = axes[i];
      const projection1 = this.projectOnto(axis);
      const projection2 = otherthis.projectOnto(axis);

      // If there is no overlap on this axis, the rectangles are not colliding
      if (!projection1.overlaps(projection2)) {
        return { overlap: 0, smallestAxis: null };
      } else {
        // Find the amount of overlap on this axis
        const currentOverlap = projection1.getOverlap(projection2);
        if (currentOverlap < overlap) {
          overlap = currentOverlap;
          smallestAxis = axis;
        }
      }
    }

    return { overlap, smallestAxis };
  }

  getAxes() {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    const topLeft = new Vector(
      this.position.x - halfWidth,
      this.position.y - halfHeight
    );
    const topRight = new Vector(
      this.position.x + halfWidth,
      this.position.y - halfHeight
    );
    const bottomLeft = new Vector(
      this.position.x - halfWidth,
      this.position.y + halfHeight
    );
    const bottomRight = new Vector(
      this.position.x + halfWidth,
      this.position.y + halfHeight
    );

    const angle = this.angle;

    const axes = [];

    const xAxis = topRight.sub(topLeft).normalize();
    const yAxis = bottomLeft.sub(topLeft).normalize();

    axes.push(xAxis);
    axes.push(yAxis);

    return axes;
  }
}
