class Rectangle extends Shape {
    constructor(position, velocity, mass, width, height, degrees) {
        super(Rectangle, mass, position, velocity, degrees);

        this.width = width;
        this.height = height;
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;

        this.debugData = { normal: -1, distance: -1, massDiff: -1, relativeVelocity: -1, pa: [], pb: [] }
    }

    updateVerticesPoints() {
        const angle = this.angle;
        this.points = [
            new Vector(this.position.x - this.width / 2, this.position.y - this.height / 2),
            new Vector(this.position.x + this.width / 2, this.position.y - this.height / 2),
            new Vector(this.position.x + this.width / 2, this.position.y + this.height / 2),
            new Vector(this.position.x - this.width / 2, this.position.y + this.height / 2)
        ];

        return vertices.map(vertex => {
            const x = vertex.x - this.position.x;
            const y = vertex.y - this.position.y;

            return new Vector(
                x * Math.cos(angle) - y * Math.sin(angle) + this.position.x,
                x * Math.sin(angle) + y * Math.cos(angle) + this.position.y
            );
        });
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

                this.velocity.y = (this.velocity.y * -1) * this.physics.friction;
                if (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 1) {
                    this.velocity.x *= this.physics.friction;
                }
            }

            if (this.position.y + this.width < 0) {
                this.position.y = this.width;

                this.velocity.y = (this.velocity.y * -1) * this.physics.friction;
            }

            if (this.position.x + this.width >= canvas.width) {
                this.position.x = canvas.width - this.width;
                this.velocity.x = (this.velocity.x * -1) * this.physics.friction;
            }

            if (this.position.x < 0) {
                this.position.x = 0 + this.width;
                this.velocity.x = (this.velocity.x * -1) * this.physics.friction;
            }
        }

        this.commonsUpdate(this);
    }

    draw(ctx) {

        ctx.save();

        ctx.fillStyle = this.color;
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        ctx.beginPath();
        ctx.rotate(this.angle);
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.closePath();

        ctx.restore();


        // this.drawPoints();
        this.drawCollisionResolve();
    }

    drawCollisionResolve() {
        // this.debugData = { normal: normal, distance: distance, massDiff: massDiff, relativeVelocity: relativeVelocity, pa: this.getPoints(), pb: rect.getPoints() }

        ctx.save();
        ctx.fillStyle = "white";

        ctx.fillText("normal: " + this.debugData.normal + " distance: " + this.debugData.distance
            + " massDiff: " + this.debugData.massDiff, this.position.x - 80, this.position.y - 15);

        ctx.fillText("RelaVeloX: " + this.debugData.relativeVelocity.x + "RelaVeloY: " + this.debugData.relativeVelocity.y, this.position.x + this.width, this.position.y + this.height / 2);

        this.drawPoints(this.debugData.pa, "orange");
        this.drawPoints(this.debugData.pb, "orangef");
    }

    drawPoints(points, color) {
        ctx.save();
        ctx.fillStyle = color;

        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x + this.width / 2, point.y + this.height / 2, 5, 0, 5 * Math.PI);
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
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        ctx.fillText(this.id, this.position.x + this.width / 2 - 12, this.position.y + this.height / 2 - 5);
        ctx.fillText("x: " + this.positionFixed.x + " y: " + this.positionFixed.y + " W: " + this.width, this.position.x, this.position.y - 40);
        ctx.restore();

        ctx.save();
        ctx.beginPath();

        const velocity = this.velocity.add(this.physics.acceleration.scale(game.debugger.PROJECTION_STEP));
        const nextX = this.position.x + this.velocity.x * game.debugger.PROJECTION_STEP;
        const nextY = this.position.y + this.velocity.y * game.debugger.PROJECTION_STEP;

        ctx.strokeStyle = this.colorProjection;
        ctx.rotate(this.angle);
        ctx.translate(nextX + this.width / 2, nextY + this.height / 2);
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.closePath();
        ctx.restore();

        game.debugger.log({
            id: this.id,
            type: "rectangle",
            timestamp: Date.now(),
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        });

    }

    drawShadow() {
        ctx.strokeStyle = this.colorProjection;

        this.historyShadow.forEach((shadow, index) => {
            ctx.save();

            ctx.beginPath();
            ctx.globalAlpha = .1 - (index * this.SHADOW_HISTORY);
            ctx.rotate(shadow.angle);
            ctx.translate(shadow.x + shadow.width / 2, shadow.y + shadow.height / 2);
            ctx.strokeRect(-shadow.width / 2, -shadow.height / 2, shadow.width, shadow.height);
            ctx.closePath();

            ctx.restore();
        });


        ctx.globalAlpha = 1;
    }

    resolveCollisionNewSAT(rect) {
        const normal = SAT.getCollisionNormal(this, rect);
        const distance = SAT.getCollisionDistance(this.getPoints(), rect.getPoints(), normal);
    
        const totalMass = this.mass + rect.mass;
        const massDiff = this.mass - rect.mass;
        const relativeVelocity = new Vector(
            rect.velocity.x - this.velocity.x,
            rect.velocity.y - this.velocity.y
        );
    
        // Check if the relative velocity is pointing away from the collision normal
        const relativeVelocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;
        if (relativeVelocityAlongNormal > 0) {
            return;
        }

        // // Calculate the impulse
        // const impulseScalar = -(2 * relativeVelocityAlongNormal) / totalMass;
        // const impulse = {
        //     x: normal.x * impulseScalar,
        //     y: normal.y * impulseScalar
        // };
        // this.velocity.x -= impulse.x * rect.mass / totalMass;
        // this.velocity.y -= impulse.y * rect.mass / totalMass;
        // rect.velocity.x += impulse.x * this.mass / totalMass;
        // rect.velocity.y += impulse.y * this.mass / totalMass;


        // Calculate impulse
        const impulse = 2 * massDiff / totalMass;
        const impulseX = impulse * normal.x;
        const impulseY = impulse * normal.y;

        // Update velocity
        this.velocity.x = this.velocity.x + impulseX;
        this.velocity.y = this.velocity.y + impulseY;
        rect.velocity.x = rect.velocity.x - impulseX;
        rect.velocity.y = rect.velocity.y - impulseY;

        // const normal = SAT.getCollisionNormal(this, rect);
        // const distance = SAT.getCollisionDistance(this.getPoints(), rect.getPoints(), normal);

        // const totalMass = this.mass + rect.mass;
        // const massDiff = this.mass - rect.mass;
        // const relativeVelocity = new Vector(
        //     rect.velocity.x - this.velocity.x,
        //     rect.velocity.y - this.velocity.y
        // );


        // this.debugData = { normal: normal, distance: distance, massDiff: massDiff, relativeVelocity: relativeVelocity, pa: this.getPoints(), pb: rect.getPoints() }

        // // Moving the rectangles so they are no longer colliding
        // this.position.x += normal.x * distance.x * massDiff / totalMass;
        // this.position.y += normal.y * distance.y * massDiff / totalMass;
        // rect.position.x -= normal.x * distance.x * 2 * rect.mass / totalMass;
        // rect.position.y -= normal.y * distance.y * 2 * rect.mass / totalMass;

        // // Calculating the new velocity and angular velocity after collision
        // const velocityAlongNormal = relativeVelocity.dot(normal);
        // if (velocityAlongNormal > 0) return;

        // const impulse = 2 * velocityAlongNormal / totalMass;
        // const impulseX = impulse * normal.x;
        // const impulseY = impulse * normal.y;

        // this.velocity.x -= impulseX * rect.mass / totalMass;
        // this.velocity.y -= impulseY * rect.mass / totalMass;

        // rect.velocity.x += impulseX * this.mass / totalMass;
        // rect.velocity.y += impulseY * this.mass / totalMass;
    }

    collidesWith(other) {
        if (other instanceof Rectangle) {
            if (SAT.isColliding(this, other)) {
                this.resolveCollisionNewSAT(other);
            }
        } else if (other instanceof Circle) {
            // return SAT.resolveCircleRectangle(other, this);
        }

        const closestX = Utils.clamp(this.position.x, other.position.x - other.sideLength / 2, other.position.x + other.sideLength / 2);
        const closestY = Utils.clamp(this.position.y, other.position.y - other.sideLength / 2, other.position.y + other.sideLength / 2);
        const distance = Math.sqrt(
            (closestX - this.position.x) * (closestX - this.position.x) + (closestY - this.position.y) * (closestY - this.position.y)
        );

        const minimumDistance = this.width / 2;

        if (distance <= minimumDistance) {
            this.resolveCollision(other);
        }
    }

    resolveCollision(otherObj) {
        const xVelocityDiff = this.velocity.x - otherObj.velocity.x;
        const yVelocityDiff = this.velocity.y - otherObj.velocity.y;

        const xDist = otherObj.position.x - this.position.x;
        const yDist = otherObj.position.y - this.position.y;

        // Prevent accidental overlap of balls
        if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
            // Grab angle between the two colliding balls
            const angle = -Math.atan2(otherObj.position.y - this.position.y, otherObj.position.x - this.position.x);

            // Store mass in var for better readability in collision equation
            const m1 = this.physics.mass;
            const m2 = otherObj.physics.mass;

            // Velocity before equation
            const u1 = this.velocity.rotate(angle);
            const u2 = otherObj.velocity.rotate(angle);

            // Velocity after 1d collision equation
            const v1 = new Vector(u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), u1.y);
            const v2 = new Vector(u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), u2.y);

            // Final velocity after rotating axis back to original location
            const vFinal1 = v1.rotate(-angle);
            const vFinal2 = v2.rotate(-angle);

            // Swap ball velocities for realistic bounce effect
            this.velocity.x = vFinal1.x;
            this.velocity.y = vFinal2.y;

            otherObj.velocity.x = vFinal2.x;
            otherObj.velocity.y = vFinal1.y;
        }
    }

    attract() {
        let otherObj = undefined;
        //findotherbj
        if (!Globals.isAttraction() || !game.getObjects() || (game.getObjects() != undefined && game.getObjects().length == 1)) {
            return;
        }

        const objs = game.getObjects();

        for (let i = 0; i < objs.length; i++) {
            if (this.id != objs[i].id) {
                otherObj = objs[i];

                const direction = this.position.sub(otherObj.position);
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

    getProjection(axis) {
        let projections = this.vertices.map(vertex => vertex.dot(axis));

        return {
            min: Math.min(...projections),
            max: Math.max(...projections)
        };
    }

    // detectCollision(shapeA, shapeB) {
    //     for (let i = 0; i < shapeA.axis.length + shapeB.axis.length; i++) {
    //         let axis;
    //         if (i < shapeA.axis.length) {
    //             axis = shapeA.axis[i];
    //         } else {
    //             axis = shapeB.edges[i - shapeA.axis.length].normalize();
    //         }

    //         let projectionA = shapeA.getProjection(axis);
    //         let projectionB = shapeB.getProjection(axis);

    //         if (projectionA.max < projectionB.min || projectionB.max < projectionA.min) {
    //             return false;
    //         }
    //     }

    //     return true;

    // }

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

    // projectShapeOntoAxis(shape, axis) {
    //     let min = shape.getPoints()[0].dot(axis);
    //     let max = min;

    //     for (let i = 1; i < shape.getPoints().length; i++) {
    //         const projection = shape.getPoints()[i].dot(axis);
    //         if (projection < min) {
    //             min = projection;
    //         } else if (projection > max) {
    //             max = projection;
    //         }
    //     }

    //     return { min, max };
    // }

    // collisionResolve(circle, rectangle) {
    //     const axes = rectangle.getPoints().map((p, i, arr) => {
    //         const p1 = arr[i];
    //         const p2 = arr[(i + 1) % arr.length];
    //         const edge = p2.sub(p1);
    //         return edge.normalize().perpendicular();
    //     });

    //     for (const axis of axes) {
    //         const circleProjection = this.projectShapeOntoAxis(circle, axis);
    //         const rectangleProjection = this.projectShapeOntoAxis(rectangle, axis);

    //         if (circleProjection.max < rectangleProjection.min ||
    //             circleProjection.min > rectangleProjection.max) {
    //             return false;
    //         }
    //     }

    //     return true;
    // }

    // getPoints() {
    //     return [
    //         new Vector(this.position.x, this.position.y),
    //         new Vector(this.position.x + this.width, this.position.y),
    //         new Vector(this.position.x + this.width, this.position.y + this.height),
    //         new Vector(this.position.x, this.position.y + this.height)
    //     ];
    // }


    // getVertices() {
    //     const vertices = [
    //         new Vector(this.position.x, this.position.y),
    //         new Vector(this.position.x + this.width, this.position.y),
    //         new Vector(this.position.x + this.width, this.position.y + this.height),
    //         new Vector(this.position.x, this.position.y + this.height)
    //     ];

    //     // rotate the vertices by the angle
    //     const center = new Vector(this.position.x + this.width / 2, this.position.y + this.height / 2);
    //     for (let i = 0; i < vertices.length; i++) {
    //         const vertex = vertices[i];
    //         const dx = vertex.x - center.x;
    //         const dy = vertex.y - center.y;
    //         vertices[i] = new Vector(
    //             center.x + dx * Math.cos(this.angle) - dy * Math.sin(this.angle),
    //             center.y + dx * Math.sin(this.angle) + dy * Math.cos(this.angle)
    //         );
    //     }

    //     return vertices;
    // }


    //     getCorners() {
    //         const { x, y, } = this.position;
    //         const { width, height, angle } = this;

    //         const topLeft = {
    //             x: x - width / 2,
    //             y: y - height / 2
    //         };
    //         const topRight = {
    //             x: x + width / 2,
    //             y: y - height / 2
    //         };
    //         const bottomLeft = {
    //             x: x - width / 2,
    //             y: y + height / 2
    //         };
    //         const bottomRight = {
    //             x: x + width / 2,
    //             y: y + height / 2
    //         };

    //         const rotation = (a, b) => ({
    //             x: a.x * Math.cos(angle) - a.y * Math.sin(angle) + b.x,
    //             y: a.x * Math.sin(angle) + a.y * Math.cos(angle) + b.y
    //         });

    //         return [
    //             rotation(topLeft, { x, y }),
    //             rotation(topRight, { x, y }),
    //             rotation(bottomRight, { x, y }),
    //             rotation(bottomLeft, { x, y })
    //         ];
    //     }

    //     axis() {
    //         const corners = this.getCorners();
    //         const edges = [];
    //         for (let i = 0; i < corners.length; i++) {
    //             const start = corners[i];
    //             const end = corners[(i + 1) % corners.length];
    //             edges.push({
    //                 x: end.y - start.y,
    //                 y: start.x - end.x
    //             });
    //         }
    //         return edges;
    //     }

    //     projectShapeOntoAxis(shapes, axis) {
    //         let min = shapes[0].x * axis.x + shapes[0].y * axis.y;
    //         let max = min;
    //         for (let i = 1; i < shapes.length; i++) {
    //             const projection = shapes[i].x * axis.x + shapes[i].y * axis.y;
    //             if (projection < min) {
    //                 min = projection;
    //             } else if (projection > max) {
    //                 max = projection;
    //             }
    //         }
    //         return { min, max };
    //     }

    //     detectCollision(rect, circle) {
    //         // Vector axes
    //         const rectAxes = [
    //             { x: rect.width / 2, y: 0 },
    //             { x: 0, y: rect.height / 2 }
    //         ];

    //         let collision = false;

    //         // Project both shapes onto each vector axis
    //         for (let i = 0; i < rectAxes.length; i++) {
    //             const axis = rectAxes[i];

    //             // Project rectangle onto the axis
    //             const rectProjection = this.projectShapeOntoAxis(rect, axis);

    //             // Project circle onto the axis
    //             const circleProjection = this.projectShapeOntoAxis(circle, axis);

    //             // Check for overlap between projections
    //             if (!this.doProjectionsOverlap(rectProjection, circleProjection)) {
    //                 // Shapes do not overlap, therefore there is no collision
    //                 collision = false;
    //                 break;
    //             } else {
    //                 // Shapes overlap, continue checking other axes
    //                 collision = true;
    //             }
    //         }

    //         return collision;
    //     }

}