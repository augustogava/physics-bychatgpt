class Debug {
    constructor() {
        this.fontSize = 18;
        this.objToDebug = obj;
        this.fontColor = "red";

        this.history = [];
    }

    
      debugRectangle(rectangle) {
        this.history.push({
          type: "rectangle",
          x: rectangle.x,
          y: rectangle.y,
          width: rectangle.width,
          height: rectangle.height,
          color: rectangle.color,
          timestamp: Date.now()
        });
      }
    
      debugBall(ball) {
        this.history.push({
          type: "ball",
          x: ball.x,
          y: ball.y,
          radius: ball.radius,
          color: ball.color,
          timestamp: Date.now()
        });
      }
    
      debugSAT(SAT) {
        this.history.push({
          type: "SAT",
          response: SAT.response,
          timestamp: Date.now()
        });
      }
    
      drawDebugInformation(canvasContext) {
        canvasContext.fillStyle = "black";
        canvasContext.font = "12px Arial";
        canvasContext.textAlign = "left";
        canvasContext.textBaseline = "top";
    
        this.history.forEach((debugInfo, index) => {
          let text = `${debugInfo.timestamp}: `;
          if (debugInfo.type === "rectangle") {
            text += `Rectangle - x: ${debugInfo.x}, y: ${debugInfo.y}, width: ${debugInfo.width}, height: ${debugInfo.height}, color: ${debugInfo.color}`;
          } else if (debugInfo.type === "ball") {
            text += `Ball - x: ${debugInfo.x}, y: ${debugInfo.y}, radius: ${debugInfo.radius}, color: ${debugInfo.color}`;
          } else if (debugInfo.type === "SAT") {
            text += `SAT - response: ${JSON.stringify(debugInfo.response)}`;
          }
    
          canvasContext.fillText(text, canvasContext.canvas.width - 200, index * 20);
        });
      }
}

// class Debug {
//     constructor() {
//       this.debugHistory = [];
//     }
  
//     log(debugInformation) {
//       this.debugHistory.push(debugInformation);
//       console.log(debugInformation);
//     }
  
//     draw(canvas) {
//       // Clear previous debug information
//       canvas.innerHTML = "";
    
//       // Create a div to display the debug information
//       let debugDiv = document.createElement("div");
//       debugDiv.style.position = "absolute";
//       debugDiv.style.top = 0;
//       debugDiv.style.right = 0;
//       debugDiv.style.backgroundColor = "lightgray";
//       debugDiv.style.padding = "10px";
//       canvas.appendChild(debugDiv);
    
//       // Display the debug history
//       for (let i = 0; i < this.debugHistory.length; i++) {
//         let p = document.createElement("p");
//         p.innerHTML = this.debugHistory[i];
//         debugDiv.appendChild(p);
//       }
//     }
//   }