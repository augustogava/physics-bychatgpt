class Shape {
    constructor(instance, mass, position, velocity, degrees) {
        this.id = instance.name + '-' + Utils.randomIntFromInterval(1, 50);

        this.color = "rgba(255, 0, 0, 1)";
        this.statePhysics = true;

        this.G = 667.4;
        this.mass = mass;
        this.angle = (degrees)  ? ( degrees * (Math.PI / 180) ) : 0;

        this.position = position;
        this.positionOld = position;
        this.velocity = velocity;

        this.physics = new Physics(mass);
        this.physics.addForce(this.physics.gravity.scale(this.mass));

        this.debugObj = new Debug(this);
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
    
    /*
            xy(x,y){
                this.x = x;
                this.y = y;
            };
            
            //The polygon that is formed from vertices and edges.
            polygon(vertices, edges){
                this.vertex = vertices;
                this.edge = edges;
            };
            
            //The actual Seperate Axis Theorum function
            sat(polygonA, polygonB){
                var perpendicularLine = null;
                var dot = 0;
                var perpendicularStack = [];
                var amin = null;
                var amax = null;
                var bmin = null;
                var bmax = null;
                //Work out all perpendicular vectors on each edge for polygonA
                for(var i = 0; i < polygonA.edge.length; i++){
                    perpendicularLine = new xy(-polygonA.edge[i].y,
                                                polygonA.edge[i].x);
                    perpendicularStack.push(perpendicularLine);
                }
                //Work out all perpendicular vectors on each edge for polygonB
                for(var i = 0; i < polygonB.edge.length; i++){
                    perpendicularLine = new xy(-polygonB.edge[i].y,
                                                polygonB.edge[i].x);
                    perpendicularStack.push(perpendicularLine);
                }
                //Loop through each perpendicular vector for both polygons
                for(var i = 0; i < perpendicularStack.length; i++){
                    //These dot products will return different values each time
                    amin = null;
                    amax = null;
                    bmin = null;
                    bmax = null;
                    for(var j = 0; j < polygonA.vertex.length; j++){
                        dot = polygonA.vertex[j].x *
                                perpendicularStack[i].x +
                                polygonA.vertex[j].y *
                                perpendicularStack[i].y;
                        //Then find the dot products with the highest and lowest values from polygonA.
                        if(amax === null || dot > amax){
                            amax = dot;
                        }
                        if(amin === null || dot < amin){
                            amin = dot;
                        }
                    }
                    
                    
                    for(var j = 0; j < polygonB.vertex.length; j++){
                        dot = polygonB.vertex[j].x *
                                perpendicularStack[i].x +
                                polygonB.vertex[j].y *
                                perpendicularStack[i].y;
                        //Then find the dot products with the highest and lowest values from polygonB.
                        if(bmax === null || dot > bmax){
                            bmax = dot;
                        }
                        if(bmin === null || dot < bmin){
                            bmin = dot;
                        }
                    }
                    //If there is no gap between the dot products projection then we will continue onto evaluating the next perpendicular edge.
                    if((amin < bmax && amin > bmin) ||
                        (bmin < amax && bmin > amin)){
                        continue;
                    }
                    //Otherwise, we know that there is no collision for definite.
                    else {
                        return false;
                    }
                }
                

                return true;
            }
            
            //Detect for a collision between the 2 rectangles
            function detectRectangleCollision(index){
                let thisRect = rectangleStore[index];
                let otherRect = index === 0 ? rectangleStore[1] : rectangleStore[0];
                //Get rotated coordinates for both rectangles
                let tRR = getRotatedSquareCoordinates(thisRect);
                let oRR = getRotatedSquareCoordinates(otherRect);
                //Vertices & Edges are listed in clockwise order. Starting from the top right
                let thisTankVertices = [
                    new xy(tRR.tr.x, tRR.tr.y),
                    new xy(tRR.br.x, tRR.br.y),
                    new xy(tRR.bl.x, tRR.bl.y),
                    new xy(tRR.tl.x, tRR.tl.y),
                ];
                let thisTankEdges = [
                    new xy(tRR.br.x - tRR.tr.x, tRR.br.y - tRR.tr.y),
                    new xy(tRR.bl.x - tRR.br.x, tRR.bl.y - tRR.br.y),
                    new xy(tRR.tl.x - tRR.bl.x, tRR.tl.y - tRR.bl.y),
                    new xy(tRR.tr.x - tRR.tl.x, tRR.tr.y - tRR.tl.y)
                ];
                let otherTankVertices = [
                    new xy(oRR.tr.x, oRR.tr.y),
                    new xy(oRR.br.x, oRR.br.y),
                    new xy(oRR.bl.x, oRR.bl.y),
                    new xy(oRR.tl.x, oRR.tl.y),
                ];
                let otherTankEdges = [
                    new xy(oRR.br.x - oRR.tr.x, oRR.br.y - oRR.tr.y),
                    new xy(oRR.bl.x - oRR.br.x, oRR.bl.y - oRR.br.y),
                    new xy(oRR.tl.x - oRR.bl.x, oRR.tl.y - oRR.bl.y),
                    new xy(oRR.tr.x - oRR.tl.x, oRR.tr.y - oRR.tl.y)
                ];
                let thisRectPolygon = new polygon(thisTankVertices, thisTankEdges);
                let otherRectPolygon = new polygon(otherTankVertices, otherTankEdges);
            
                if(sat(thisRectPolygon, otherRectPolygon)){
                    thisRect.color = "red";
                }else{
                    thisRect.color = "black";
                    //Because we are working with vertices and edges. This algorithm does not cover the normal un-rotated rectangle
                    //algorithm which just deals with sides
                    if(thisRect.currRotation === 0 && otherRect.currRotation === 0){
                        if(!(
                            thisRect.position.x>otherRect.x+otherRect.width || 
                            thisRect.position.x+thisRect.width<otherRect.x || 
                            thisRect.position.y>otherRect.y+otherRect.height || 
                            thisRect.position.y+thisRect.height<otherRect.y
                        )){
                            thisRect.color = "red";
                        }
                    }
                }
            }
    */
}