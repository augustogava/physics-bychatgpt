class Rectangle extends Shape {
    constructor(position, velocity, mass, width, height, degrees) {
        super(Rectangle, mass, position, velocity, degrees);

        this.width = width;
        this.height = height;
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;

        this.debugData = { normal: -1, distance: -1, massDiff: -1, relativeVelocity: -1, pa: [], pb: [] }
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

                this.velocity.y = (this.velocity.y * -1) * this.physics.friction;
                if (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 1) {
                    this.velocity.x *= this.physics.friction;
                }
            }

            if (this.position.y + this.height < 0) {
                this.position.y = this.height;

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

        // Calculate impulse
        const impulse = 2 * massDiff / totalMass;
        const impulseX = impulse * normal.x;
        const impulseY = impulse * normal.y;

        // Update velocity
        this.velocity.x = this.velocity.x + impulseX;
        this.velocity.y = this.velocity.y + impulseY;
        rect.velocity.x = rect.velocity.x - impulseX;
        rect.velocity.y = rect.velocity.y - impulseY;

       
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
}