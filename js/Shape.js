class Shape {
    constructor(instance, mass, position, velocity, degrees) {
        this.id = Utils.randomIntFromInterval(1, 5000);

        this.color = "rgba(250,128,114, 1)";
        this.colorProjection = Utils.changeRedSoftness(this.color, 200);
        this.colorShadow = Utils.changeRedSoftness(this.color, 0);
        this.statePhysics = true;

        this.G = 667.4;
        this.mass = mass;
        this.angle = (degrees)  ? ( degrees * (Math.PI / 180) ) : 0;
        this.angularVelocity = 0;
        this.position = position;
        this.positionOld = position;
        this.velocity = velocity;
        this.acceleration = 0;

        this.positionFixed = position;
        this.positionOldFixed = position;
        this.velocityFixed = velocity;
        this.accelerationFixed = 0;

        this.physics = new Physics(mass);
        this.physics.addForce(this.physics.gravity.scale(this.mass));

        this.SHADOW_HISTORY = 20;
        this.historyShadow = [];
        this.currentTime = Date.now();

        // this.debugObj = new Debug(this);
    }

    debug(){            
                  
    }

    collidesWith(otherShape) {
        return false;
    }

    changePhysicsState(v) {
        if (v == undefined)
            this.statePhysics = true;

        this.statePhysics = !this.statePhysics;;
    }

    updateDegrees(d) {
        this.angle = (d)  ? ( d * (Math.PI / 180) ) : this.angle;
    }

    updatePosition(v) {
        this.position = v;
    }

    commonsUpdate(obj){
        obj.updateToReadbleNumber();
        if (Globals.isAttraction()) {
            obj.attract();
        }

        
        if (!Globals.isDebug()) {
            return ;
        }

               
        var timeDifference = Date.now() - obj.currentTime ;
        if ( (timeDifference > ( .01 * 1000)) ) {
            obj.historyShadow.push({ x: obj.position.x, y: obj.position.y, angle: obj.angle, width: obj.width, height: obj.height });
            obj.currentTime = Date.now();
        }

        
        if (obj.historyShadow.length > this.SHADOW_HISTORY) {
            obj.historyShadow.shift();
        }
    }

    updateToReadbleNumber(){
        if( this.position )
            this.positionFixed = new Vector( this.position.x.toFixed(1), this.position.y.toFixed(1) );      

        if( this.positionOld )
            this.positionOldFixed = new Vector( this.positionOld.x.toFixed(1), this.positionOld.y.toFixed(1) );      

        if( this.velocity )
            this.velocityFixed = new Vector( this.velocity.x.toFixed(1), this.velocity.y.toFixed(1) ); 
    }

    // COLLISION TESTE 2
    workOutNewPoints(cPosition, vPosition, rotatedAngle) { //From a rotated object
        rotatedAngle = rotatedAngle * Math.PI / 180;

        let distance = cPosition.distance(vPosition);

        let dx = vPosition.x - cPosition.x;
        let dy = vPosition.y - cPosition.y;

        let originalAngle = Math.atan2(dy, dx);
        let rotatedX = cPosition.x + distance * Math.cos(originalAngle + rotatedAngle);
        let rotatedY = cPosition.y + distance * Math.sin(originalAngle + rotatedAngle);

        return {
            x: rotatedX,
            y: rotatedY
        }
    }

    getRotatedSquareCoordinates( rectangle ){
        let centerX = rectangle.position.x + (rectangle.width / 2);
        let centerY = rectangle.position.y + (rectangle.height / 2);

        //Work out the new locations
        let topLeft = this.workOutNewPoints(centerX, centerY, rectangle.position.x, rectangle.position.y, rectangle.currRotation);
        let topRight = this.workOutNewPoints(centerX, centerY, rectangle.position.x + rectangle.width, rectangle.position.y, rectangle.currRotation);

        let bottomLeft = this.workOutNewPoints(centerX, centerY, rectangle.position.x, rectangle.position.y + rectangle.height, rectangle.currRotation);

        let bottomRight = this.workOutNewPoints(centerX, centerY, rectangle.position.x + rectangle.width, rectangle.position.y + rectangle.height, rectangle.currRotation);
        
        return{
            tl: topLeft,
            tr: topRight,
            bl: bottomLeft,
            br: bottomRight
        }
    }
}