class MainGame {
    frameCount = 0;
    fps = 60;
    startTime;
    followShape = false;
    fallowShapeIndex = undefined;
    lastShapeUsed = "CIRCLE";
    mousePosition = new Vector(0, 0);

    scalar = 2 * Utils.randomBoolean1orMinus1();

    constructor() {
        Globals.setBoundaries(true);
        Globals.setCollisions(true);
        Globals.setDebug(true);
        // Globals.setCollisions(true);

        // canvas = document.getElementById("gameCanvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.centerX = canvas.width / 2;
        canvas.centerY = canvas.height / 2;

        this.ctx = canvas.getContext("2d");
        this.objs = [];
    }

    init() {
        requestAnimationFrame(this.gameLoop.bind(this));

        this.userInteractions();
    }

    gameLoop(time) {
        this.calculateFPS();

        let deltaTime = (time - this.prevTime) * 10;
        this.prevTime = time;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        for (const ball of this.objs) {
            ball.update(deltaTime);
        }

        this.collisionInit();
    }

    collisionInit() {
        if (Globals.isCollisions()) {
            for (let i = 0; i < this.objs.length; i++) {
                for (let j = i + 1; j < this.objs.length; j++) {
                    this.objs[i].collidesWith(this.objs[j]);
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);

        for (const obj of this.objs) {
            obj.draw(this.ctx);

            if( Globals.isDebug() ){
                obj.debug();
            }
        }

        this.debug()
    }

    userInteractions() {
        canvas.addEventListener("click", event => {
            this.addShape(this.lastShapeUsed);
            this.lastShapeUsed = this.lastShapeUsed == "CIRCLE" ? "SQUARE" : "CIRCLE";
        });

        var that = this;
        document.addEventListener('mousemove', function (mouseMoveEvent) {
            that.mousePosition.x = mouseMoveEvent.pageX;
            that.mousePosition.y = mouseMoveEvent.pageY;

            that.updateFollowObject();
        }, false);


        document.addEventListener('keydown', (event) => {
            if (event.code != 'KeyB' && event.code != 'KeyR' && event.code != 'KeyF') {
                return;
            }

            if (event.code === 'KeyF') {
                this.followShape = !this.followShape;

                if (that.fallowShapeIndex) {
                    this.objs[that.fallowShapeIndex].changePhysicsState(false);
                    that.fallowShapeIndex = undefined;
                } else if (!that.fallowShapeIndex) {
                    this.fallowShapeIndex = Utils.randomIntFromInterval(0, that.objs.length - 1);
                    this.objs[that.fallowShapeIndex].changePhysicsState(true);

                    this.updateFollowObject();
                }

                return;
            }

            this.addShape(this.transformCodeToShapeType(event.code));
        });

    }

    updateFollowObject() {
        if (this.followShape && this.objs && this.objs.length > 0 && this.fallowShapeIndex >= 0) {
            let retObj = this.objs[this.fallowShapeIndex];
            retObj.update(1);
            retObj.updatePosition(new Vector(this.mousePosition.x, this.mousePosition.y));
        }
    }

    transformCodeToShapeType(code) {
        if (code === undefined || code === 'KeyB')
            return "CIRCLE";

        if (code === 'KeyR')
            return "SQUARE";
    }

    addObject(obj) {
        this.objs.push(obj);
    }

    addShape(shapeType) {
        const rect = canvas.getBoundingClientRect();
        const midpoint = canvas.height / 2;

        const x = this.mousePosition.x;
        const y = this.mousePosition.y;

        const normalizedX = x / midpoint;
        const size = Utils.randomIntFromInterval(55, 55);
        const mass = Utils.randomIntFromInterval(10, 10) * size;

        if (shapeType == "CIRCLE") {
            this.lastShapeUsed = "CIRCLE";

            this.addObject(new Circle(new Vector(x, y), new Vector(this.scalar * normalizedX, 0), mass, size));
        } if (shapeType == "SQUARE") {
            this.lastShapeUsed = "SQUARE";

            this.addObject(new Rectangle(new Vector(x, y), new Vector(this.scalar * normalizedX, 0), mass, size, size /*+ 50*/));
        }
    }

    getObjects() {
        return this.objs;
    }

    calculateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        if (this.startTime === undefined) this.startTime = currentTime;
        if (currentTime - this.startTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.startTime = currentTime;
        }
    }

    debug(){
        // this.ctx.fillText("ga", 50, 50);
    }
}