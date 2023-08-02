class Rectangle extends Shape {
    constructor(position, velocity, mass, width, height) {
        super(Rectangle, mass, position, velocity);

        this.width = width;
        this.height = height;
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;

        this.moveDir = "NAN";
        this.rotationDir = "NAN";

        this.vertices = [
            new Vector(this.position.x - this.width / 2, this.position.y - this.height / 2),
            new Vector(this.position.x + this.width / 2, this.position.y - this.height / 2),
            new Vector(this.position.x + this.width / 2, this.position.y + this.height / 2),
            new Vector(this.position.x - this.width / 2, this.position.y + this.height / 2)
        ];

        this.updateAxisEdges(width, height);

        this.angle =  70 * (Math.PI / 180);
    }

    updateAxisEdges() {
        this.axis = [
            new Vector(Math.cos(this.angle), Math.sin(this.angle)),
            new Vector(-Math.sin(this.angle), Math.cos(this.angle))
        ];

        this.edges = [
            this.vertices[1].sub(this.vertices[0]),
            this.vertices[2].sub(this.vertices[1]),
            this.vertices[3].sub(this.vertices[2]),
            this.vertices[0].sub(this.vertices[3])
        ];
    }

    getVertices() {
        const angle = this.angle;
        const vertices = [
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
            if (this.position.y + this.width >= canvas.height) {
                this.position.y = canvas.height - this.width;

                this.velocity.y = (this.velocity.y * -1) * this.physics.friction;
                if (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 1) {
                    this.velocity.x *= this.physics.friction;
                }
            }

            if (this.position.y + this.width <= 0) {
                this.position.y = this.width;

                this.velocity.y = (this.velocity.y * -1) * this.physics.friction;
            }

            if (this.position.x + this.width >= canvas.width) {
                this.position.x = canvas.width - this.width;
                this.velocity.x = (this.velocity.x * -1) * this.physics.friction;
            }

            if (this.position.x <= 0) {
                this.position.x = 0 + this.width;
                this.velocity.x = (this.velocity.x * -1) * this.physics.friction;
            }
        }
    }

    // rorate(rotateAdd) {
    //     // if (this.rotationDir === "RIGHT") {
    //     // this.angle += rotateAdd;
    //     // } else if (this.rotationDir === "LEFT") {
    //     //     this.currRotation -= 1;
    //     // }
    //     // console.log(this.currRotation)


    //     ctx.translate(this.position.x + (this.width / 2), this.position.y + (this.height / 2));
    //     ctx.rotate(this.angle );
    //     // ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    //     ctx.translate(-(this.position.x + (this.width / 2)), -(this.position.y + (this.height / 2)));

    //     if (this.angle > 360 || this.angle < -360) this.angle = 0;
    // }

    draw(ctx) {
        ctx.fillText(this.id, this.position.x + (this.width / 3), this.position.y - this.height / 2);
        ctx.save();
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        ctx.rotate(this.angle);
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
        
        // ctx.restore();
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

    collidesWith(other) {
        if (other instanceof Rectangle) {
            return SAT.resolveRectangleRectangle(this, other);
        } else if (other instanceof Circle) {
            return SAT.resolveCircleRectangle(other, this);
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


    detectCollision(shapeA, shapeB) {
        for (let i = 0; i < shapeA.axis.length + shapeB.axis.length; i++) {
            let axis;
            if (i < shapeA.axis.length) {
                axis = shapeA.axis[i];
            } else {
                axis = shapeB.edges[i - shapeA.axis.length].normalize();
            }

            let projectionA = shapeA.getProjection(axis);
            let projectionB = shapeB.getProjection(axis);

            if (projectionA.max < projectionB.min || projectionB.max < projectionA.min) {
                return false;
            }
        }

        return true;

    }






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