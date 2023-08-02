class Ball {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.radius = 20;
        this.physics = new Physics(10000000);
        this.velocity = { x: 0, y: 0 };
        
        this.airResistence = .98;
        this.friction = .95;
    }

    update(deltaTime) {
        const deltaTimeSeconds = deltaTime / 1000;
        this.applyGravity();
        // this.applyFriction();

        const acceleration = this.physics.acceleration;
        this.velocity.x += ( acceleration.x * deltaTimeSeconds );
        this.velocity.y += acceleration.y * deltaTimeSeconds;

        // this.velocity.y  *= this.airResistence;

        this.y += this.velocity.y * deltaTimeSeconds;

        if (this.y + this.radius >= this.canvas.height) {
            this.y = this.canvas.height - this.radius;
            
            this.velocity.y = (this.velocity.y * -1) * this.friction;
            // if( Math.abs(this.velocity.x) > 30 || Math.abs(this.velocity.y) > 80 ){
            //     this.velocity.x *= this.friction;
            // } 
        }

        if (this.y + this.radius <= 0) {
            this.y = this.radius;

            this.velocity.y = (this.velocity.y * -1) * this.friction;
        }

        if (this.x + this.radius >= this.canvas.width ) {
            this.x = this.canvas.width - this.radius;
            this.velocity.x = (this.velocity.x * -1) * this.friction;
        }

        if ( this.x <= 0 ) {
            this.x = 0 + this.radius;
            this.velocity.x = (this.velocity.x * -1) * this.friction;
        }

        // if (this.x + this.radius >= this.canvas.width || (this.x + this.radius <= 0) ) {
        //     this.x = Math.abs( this.x - this.radius);
        //     this.velocity.x = ( this.velocity.x * -1) * this.friction;
        // }

        // if (this.x - this.radius <= 0 || this.x + this.radius >= this.canvas.width) {
        //     this.velocity.x = -this.velocity.x;
        // }

        // if (this.y - this.radius <= 0 || this.y + this.radius >= this.canvas.height) {
        //     this.velocity.y = -this.velocity.y;
        // }

        // this.cleanForces()
    }

    cleanForces() {
        this.physics.forces = []
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
    }

    applyGravity() {
        this.physics.addForce({ x: 0, y: 9.8 * this.physics.mass });
    }

    applyFriction() {
        this.physics.applyForce({
            x: ( this.velocity.x * -1) * this.friction,
            y: ( this.velocity.y * -1) * this.friction
        });
    }


    resolveCollision(ball2) {
        const xVelocityDiff = this.velocity.x - ball2.velocity.x;
        const yVelocityDiff = this.velocity.y - ball2.velocity.y;

        const xDist = ball2.x - this.x;
        const yDist = ball2.y - this.y;

        // Prevent accidental overlap of balls
        if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
            // Grab angle between the two colliding balls
            const angle = -Math.atan2(ball2.y - this.y, ball2.x - this.x);

            // Store mass in var for better readability in collision equation
            const m1 = this.physics.mass;
            const m2 = ball2.physics.mass;

            // Velocity before equation
            const u1 = this.rotate(this.velocity, angle);
            const u2 = this.rotate(ball2.velocity, angle);

            // Velocity after 1d collision equation
            const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
            const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

            // Final velocity after rotating axis back to original location
            const vFinal1 = this.rotate(v1, -angle);
            const vFinal2 = this.rotate(v2, -angle);

            // Swap ball velocities for realistic bounce effect
            this.velocity.x = vFinal1.x;
            this.velocity.y = vFinal2.y;

            ball2.velocity.x = vFinal2.x;
            ball2.velocity.y = vFinal1.y;
        }
    }

    rotate(velocity, angle) {
        const x = velocity.x;
        const y = velocity.y;

        const dx = (x * Math.cos(angle)) - (y * Math.sin(angle));
        const dy = (y * Math.sin(angle)) + y * Math.cos(angle);
        return {
            x: dx,
            y: dy
        };
    }
}