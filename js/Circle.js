class Circle extends Shape {
    constructor(position, velocity, mass, radius, degrees) {
        super(Circle, mass, position, velocity, degrees);

        this.radius = radius;
        this.z = 1
    }

    update(deltaTime) {

        if (!this.statePhysics) {
            return;
        }

        const deltaTimeSeconds = deltaTime / 1000;

        this.applyGravity();

        this.positionOld = new Vector(this.position.x, this.position.y);
        const acceleration = this.physics.acceleration;


        this.velocity.x += acceleration.x * deltaTimeSeconds;
        this.velocity.y += acceleration.y * deltaTimeSeconds;

        //Apply air resistence
        this.velocity.y *= this.physics.airResistence;

        this.position.x += this.velocity.x * deltaTimeSeconds;
        this.position.y += this.velocity.y * deltaTimeSeconds;

        if (Globals.getBoundaries()) {


            if (this.position.y + this.radius >= canvas.height) {
                this.position.y = canvas.height - this.radius;

                this.velocity.y = (this.velocity.y * -1) * this.physics.friction;
                if (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 1) {
                    this.velocity.x *= this.physics.friction;
                }
            }

            if (this.position.y + this.radius <= 0) {
                this.position.y = this.radius;

                this.velocity.y = (this.velocity.y * -1) * this.physics.friction;
            }

            if (this.position.x + this.radius >= canvas.width) {
                this.position.x = canvas.width - this.radius;
                this.velocity.x = (this.velocity.x * -1) * this.physics.friction;
            }

            if (this.position.x <= 0) {
                this.position.x = 0 + this.radius;
                this.velocity.x = (this.velocity.x * -1) * this.physics.friction;
            }
        }

        if (Globals.isAttraction()) {
            this.attract();
        }
    }

    rotation() {

    }

    draw(ctx) {
        
        var fv = MathHelper.getLinerInterpolation(this.position.y, 0, -10, canvas.height, 80);
        var fx = MathHelper.getLinerInterpolation(this.position.y, 0, -50, canvas.height, -10);
        var radgrad = ctx.createRadialGradient(this.position.x, this.position.y, this.radius, this.position.x + (fx), this.position.y + ( fv ), this.radius);
    

        radgrad.addColorStop(0, this.color);
        radgrad.addColorStop(0.7, Utils.changeRedSoftness(this.color, 220));
        radgrad.addColorStop(1, Utils.changeRedSoftness(this.color, 200));
      
    
        ctx.fillStyle = radgrad;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

    }

    debug() {
        // ctx.save();
        // ctx.translate(canvas.width - 100 - (  8 * this.debugObj.fontSize), -50);
        // ctx.font = `${this.debugObj.fontSize}px Arial`;
        
        // ctx.fillStyle = this.debugObj.fontColor;

        // ctx.fillText(`Ball X: ${this.position.x.toFixed(2)}`, 0, this.debugObj.fontSize);
        // ctx.fillText(`Ball Y: ${this.position.y.toFixed(2)}`, 0, 2 * this.debugObj.fontSize);
        // ctx.fillText(`Ball VX: ${this.velocity.x.toFixed(2)}`, 0, 3 * this.debugObj.fontSize);
        // ctx.fillText(`Ball VY: ${this.velocity.y.toFixed(2)}`, 0, 4 * this.debugObj.fontSize);

        // ctx.restore();

        // this.debugObj.drawRectangle(rectangle);
        // this.debugObj.drawBall(this);
        // this.debugObj.drawSAT(vertices);
        this.debugObj.displayInformation(this, this, this);
    }

    projectShapeOntoAxis(shape, axis) {
        let min = shape.getPoints()[0].dot(axis);
        let max = min;

        for (let i = 1; i < shape.getPoints().length; i++) {
            const projection = shape.getPoints()[i].dot(axis);
            if (projection < min) {
                min = projection;
            } else if (projection > max) {
                max = projection;
            }
        }

        return { min, max };
    }

    collisionResolve(circle, rectangle) {
        const axes = rectangle.getPoints().map((p, i, arr) => {
            const p1 = arr[i];
            const p2 = arr[(i + 1) % arr.length];
            const edge = p2.sub(p1);
            return edge.normalize().perpendicular();
        });

        for (const axis of axes) {
            const circleProjection = this.projectShapeOntoAxis(circle, axis);
            const rectangleProjection = this.projectShapeOntoAxis(rectangle, axis);

            if (circleProjection.max < rectangleProjection.min ||
                circleProjection.min > rectangleProjection.max) {
                return false;
            }
        }

        return true;
    }

    getPoints() {
        return [new Vector(this.position.x, this.position.y)];
    }

    collidesWith(other) {
        if (other instanceof Rectangle) {
            return SAT.resolveCircleRectangle(this, other);
        }

        const deltaX = this.position.x - other.position.x;
        const deltaY = this.position.y - other.position.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const minimumDistance = this.radius + other.radius + 1;

        if (distance <= minimumDistance) {
            this.resolveCollision(other);
        }
        return false;
    }

    resolveCollision(otherBall) {
        const xVelocityDiff = this.velocity.x - otherBall.velocity.x;
        const yVelocityDiff = this.velocity.y - otherBall.velocity.y;

        const xDist = otherBall.position.x - this.position.x;
        const yDist = otherBall.position.y - this.position.y;

        // console.log(xDist, yDist);
        // Prevent accidental overlap of balls
        if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
            // Grab angle between the two colliding balls
            const angle = -Math.atan2(otherBall.position.y - this.position.y, otherBall.position.x - this.position.x);

            // Store mass in var for better readability in collision equation
            const m1 = this.physics.mass;
            const m2 = otherBall.physics.mass;

            // Velocity before equation
            const u1 = this.velocity.rotate(angle);
            const u2 = otherBall.velocity.rotate(angle);

            // Velocity after 1d collision equation
            const v1 = new Vector(u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), u1.y);
            const v2 = new Vector(u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), u2.y);

            // Final velocity after rotating axis back to original location
            const vFinal1 = v1.rotate(-angle);
            const vFinal2 = v2.rotate(-angle);

            // Swap ball velocities for realistic bounce effect
            this.velocity.x = vFinal1.x;
            this.velocity.y = vFinal2.y;

            otherBall.velocity.x = vFinal2.x;
            otherBall.velocity.y = vFinal1.y;
        }
    }

    resolveContinuousCollision(otherObj, timeStep) {
        // Check if the objects are already intersecting
        const relativePos = otherObj.position.sub(this.position);
        const relativeVel = otherObj.velocity.position(this.velocity);
        const distance = relativePos.length();
        const relativeSpeed = relativeVel.length();
        if (distance <= this.radius + otherObj.radius) {
            // The objects are already intersecting, so resolve the collision normally
            this.resolveCollision(this, otherObj);
            return;
        }

        // Check if the objects will intersect during the time step
        if (relativeSpeed <= 0) {
            // The objects are moving away from each other, so they won't intersect
            return;
        }
        const timeToCollision = (distance - (this.radius + otherObj.radius)) / relativeSpeed;
        if (timeToCollision > timeStep) {
            // The objects won't intersect during the time step
            return;
        }

        // The objects will intersect, so find the exact time of collision
        let collisionTime = 0;
        let step = timeStep;
        while (step > 1e-6) {
            // Check if the objects will intersect during the current step
            const midTime = collisionTime + step / 2;
            const thisPos = this.position.add(this.velocity.scale(midTime));
            const obj2Pos = otherObj.position.add(otherObj.velocity.scale(midTime));
            const midDistance = obj2Pos.position(thisPos).length();
            if (midDistance <= this.radius + otherObj.radius) {
                // The objects will intersect, so move the collision time forward
                collisionTime += step / 2;
            }
            step /= 2;
        }

        // Update the positions and velocities of the objects to exactly the time of collision
        this.position = this.position.add(this.velocity.scale(collisionTime));
        otherObj.position = otherObj.position.add(otherObj.velocity.scale(collisionTime));
        this.velocity = this.velocity.add(this.acceleration.scale(collisionTime));
        otherObj.velocity = otherObj.velocity.add(otherObj.acceleration.scale(collisionTime));

        // Resolve the collision
        this.resolveCollision(this, otherObj);
    }

    attract() {
        let otherObj = undefined;
        //findotherbj
        if (!Globals.isAttraction() || !game.getObjects() || (game.getObjects() != undefined && game.getObjects().length == 1)) {
            return;
        }

        const balls = game.getObjects();

        for (let i = 0; i < balls.length; i++) {
            if (this.id != balls[i].id) {
                otherObj = balls[i];

                const direction = this.position.position(otherObj.position);
                const distance = direction.magnitude();

                const forceMag = this.G * ((this.mass * otherObj.mass) / Math.pow(distance, 2));
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
            x: (this.velocity.x * -1) * this.friction,
            y: (this.velocity.y * -1) * this.friction
        });
    }
}