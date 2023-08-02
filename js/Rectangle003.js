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
      if (this.position.y + this.width >= canvas.height) {
        this.position.y = canvas.height - this.width;

        this.velocity.y = this.velocity.y * -1 * this.physics.friction;
        if (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 1) {
          this.velocity.x *= this.physics.friction;
        }
      }

      if (this.position.y + this.width < 0) {
        this.position.y = this.width;

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

  draw(ctx) {
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

    this.drawArrow(ctx, 100, 100, Math.PI / 4, 50, Math.PI / 7, 10);

    // this.drawPoints();
    // this.drawCollisionResolve();
  }

  drawArrow(ctx, x, y, angle, velocity, theta, headlen) {
    // Calculate the ending position of the arrow
    var toX = x + velocity * Math.cos(angle);
    var toY = y + velocity * Math.sin(angle);

    // Draw the arrow
    drawArrow2(ctx, x, y, toX, toY, theta, headlen);
  }

  drawArrow(ctx, fromX, fromY, toX, toY, theta, headlen) {
    // The angle of the line
    var angle = Math.atan2(toY - fromY, toX - fromX);

    // Starting position of the line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);

    // Ending position of the line
    ctx.lineTo(toX, toY);

    // Draws the triangular arrowhead
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle - theta),
      toY - headlen * Math.sin(angle - theta)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle + theta),
      toY - headlen * Math.sin(angle + theta)
    );

    // Style the arrow
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    // Draw the arrow
    ctx.stroke();
  }

  //   drawArrow(ctx, fromX, fromY, toX, toY, theta, headlen) {
  //     // The angle of the line
  //     var angle = Math.atan2(toY - fromY, toX - fromX);

  //     // Starting position of the line
  //     ctx.beginPath();
  //     ctx.moveTo(fromX, fromY);

  //     // Ending position of the line
  //     ctx.lineTo(toX, toY);

  //     // Draws the triangular arrowhead
  //     ctx.moveTo(toX, toY);
  //     ctx.lineTo(
  //       toX - headlen * Math.cos(angle - theta),
  //       toY - headlen * Math.sin(angle - theta)
  //     );
  //     ctx.moveTo(toX, toY);
  //     ctx.lineTo(
  //       toX - headlen * Math.cos(angle + theta),
  //       toY - headlen * Math.sin(angle + theta)
  //     );

  //     // Style the arrow
  //     ctx.strokeStyle = "black";
  //     ctx.lineWidth = 2;

  //     // Draw the arrow
  //     ctx.stroke();
  //   }

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

    this.drawPoints(this.debugData.pa, "orange");
    this.drawPoints(this.debugData.pb, "orangef");
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

  collidesWith(other) {
    if (other instanceof Rectangle) {
      if (SAT.isColliding(this, other)) {
        this.resolveCollisionNewSAT(other);
      }
    } else if (other instanceof Circle) {
    }

    const closestX = Utils.clamp(
      this.position.x,
      other.position.x - other.sideLength / 2,
      other.position.x + other.sideLength / 2
    );
    const closestY = Utils.clamp(
      this.position.y,
      other.position.y - other.sideLength / 2,
      other.position.y + other.sideLength / 2
    );
    const distance = Math.sqrt(
      (closestX - this.position.x) * (closestX - this.position.x) +
        (closestY - this.position.y) * (closestY - this.position.y)
    );

    const minimumDistance = this.width / 2;

    if (distance <= minimumDistance) {
    }
  }

  resolveCollisionNewSAT(rect) {
    // Generate the axes to check for overlap
    const axes = this.getAxes(rect).concat(rect.getAxes(this));

    // let overlap = Number.MAX_VALUE;
    // let smallestAxis;

    // // Check for overlap on each axis
    // for (let i = 0; i < axes.length; i++) {
    //     const axis = axes[i];
    //     const projection1 = this.project(axis);
    //     const projection2 = rect.project(axis);

    //     // Check if the projections overlap
    //     if (!projection1.getOverlap(projection2)) {
    //         // If there's no overlap, then there's no collision
    //         return;
    //     } else {
    //         // If there's overlap, determine the amount of overlap
    //         const currentOverlap = projection1.getOverlap(projection2);
    //         if (currentOverlap < overlap) {
    //             overlap = currentOverlap;
    //             smallestAxis = axis;
    //         }
    //     }
    // }

    const relativeVelocity = this.velocity.sub(rect.velocity);
    const collisionNormal = SAT.getCollisionNormal(this, rect);
    const impulse = relativeVelocity.projectOnto(collisionNormal);

    const impulseScalar = -(1 + this.physics.restitution) * impulse.magnitude();
    const impulseNormal = collisionNormal.scale(impulseScalar);

    this.velocity = this.velocity.add(
      impulseNormal.scale(rect.mass / (rect.mass + this.mass))
    );
    // rect.velocity = rect.velocity.sub(impulseNormal.scale(this.mass / (rect.mass + this.mass)));

    // Calculate the collision response
    // const normal = smallestAxis.normalize();
    // const massDiff = rect.mass / this.mass;
    // const impulse = normal.multiply(overlap * 2).multiply(massDiff / (1 + massDiff));

    // // Update the velocity of each shape
    // this.velocity = this.velocity.sub(impulse.multiply(1 / this.mass));
    // rect.velocity = rect.velocity.add(impulse.multiply(1 / rect.mass));

    // // Calculate relative velocity for friction calculation
    // const relativeVelocity = rect.velocity.sub(this.velocity);
    // const rvDotNormal = relativeVelocity.dot(normal);

    // // Check if the objects are moving towards each other
    // if (rvDotNormal < 0) {
    //     // Apply friction to their movement
    //     const frictionImpulse = normal.multiply(relativeVelocity.magnitude()).multiply(-this.physics.friction);
    //     this.velocity = this.velocity.add(frictionImpulse.multiply(1 / this.mass));
    //     rect.velocity = rect.velocity.sub(frictionImpulse.multiply(1 / rect.mass));
    // }
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
    const axes = this.getAxes().concat(otherRectangle.getAxes());

    let overlap = Number.MAX_VALUE;
    let smallestAxis = null;

    // For each axis, project both rectangles onto the axis and check for overlap
    for (let i = 0; i < axes.length; i++) {
      const axis = axes[i];
      const projection1 = this.projectOnto(axis);
      const projection2 = otherRectangle.projectOnto(axis);

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
