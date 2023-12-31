class SAT {
    
    static getEdges(points) {
        const edges = [];
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = i === points.length - 1 ? points[0] : points[i + 1];
            edges.push({ x: p2.x - p1.x, y: p2.y - p1.y });
        }
        return edges;
    }

    static getCollisionDistance(a, b, axis) {
        const projectionA = SAT.getProjection(a, axis);
        const projectionB = SAT.getProjection(b, axis);
        const distance = SAT.getOverlap(projectionA, projectionB);
        return distance;
    }

    // static getEdges(p1, p2) {
    //     return new Vector(
    //         p2.x - p1.x,
    //         p2.y - p1.y
    //     );
    // }

    static getCollisionNormal(a, b) {
        const pointsA = SAT.getRotatedRectanglePoints(a);
        const pointsB = SAT.getRotatedRectanglePoints(b);
        const edgesA = SAT.getEdges(pointsA);
        const edgesB = SAT.getEdges(pointsB);
        const totalEdges = edgesA.length + edgesB.length;
        let minOverlap = Infinity;
        let collisionNormal = new Vector(0, 0);

        for (let i = 0; i < totalEdges; i++) {
            const edge = i < edgesA.length ? edgesA[i] : edgesB[i - edgesA.length];
            const axis = SAT.getPerpendicular(edge);
            const projectionA = SAT.getProjection(pointsA, axis);
            const projectionB = SAT.getProjection(pointsB, axis);
            const overlap = SAT.getOverlap(projectionA, projectionB);

            if (overlap <= 0) {
                return null;
            } else if (overlap < minOverlap) {
                minOverlap = overlap;
                collisionNormal = axis;
            }
        }

        return collisionNormal;
    }

    // static getCollisionNormal(rectA, rectB) {
    //     const pointsA = SAT.getRotatedRectanglePoints(rectA);
    //     const pointsB = SAT.getRotatedRectanglePoints(rectB);

    //     let smallestOverlap = Number.POSITIVE_INFINITY;
    //     let normal = { x: 0, y: 0 };

    //     // Check for overlap on all the axes of rectA
    //     for (let i = 0; i < pointsA.length; i++) {
    //         const axis = SAT.getPerpendicular(SAT.getEdge(pointsA, i));
    //         const projectionA = SAT.getProjection(pointsA, axis);
    //         const projectionB = SAT.getProjection(pointsB, axis);

    //         if (!SAT.isOverlapping(projectionA, projectionB)) {
    //             return null;
    //         }

    //         const overlap = SAT.getOverlap(projectionA, projectionB);
    //         if (overlap < smallestOverlap) {
    //             smallestOverlap = overlap;
    //             normal = axis;
    //         }
    //     }

    //     // Check for overlap on all the axes of rectB
    //     for (let i = 0; i < pointsB.length; i++) {
    //         const axis = SAT.getPerpendicular(SAT.getEdge(pointsB, i));
    //         const projectionA = SAT.getProjection(pointsA, axis);
    //         const projectionB = SAT.getProjection(pointsB, axis);

    //         if (!SAT.isOverlapping(projectionA, projectionB)) {
    //             return null;
    //         }

    //         const overlap = SAT.getOverlap(projectionA, projectionB);
    //         if (overlap < smallestOverlap) {
    //             smallestOverlap = overlap;
    //             normal = axis;
    //         }
    //     }

    //     return normal;
    // }

    static getPerpendicular(edge) {
        return new Vector(-edge.y, edge.x);
    }

    static getOverlap(projectionA, projectionB) {
        const left = Math.max(projectionA.min, projectionB.min);
        const right = Math.min(projectionA.max, projectionB.max);
        return right - left;
    }

    static getRotatedRectanglePoints(rect) {
        const points = [
            { x: rect.position.x, y: rect.position.y },
            { x: rect.position.x + rect.width, y: rect.position.y },
            { x: rect.position.x + rect.width, y: rect.position.y + rect.height },
            { x: rect.position.x, y: rect.position.y + rect.height }
        ];

        const cos = Math.cos(rect.angle);
        const sin = Math.sin(rect.angle);

        const rotatedPoints = [];
        for (let i = 0; i < points.length; i++) {
            const x = points[i].x - rect.position.x;
            const y = points[i].y - rect.position.y;

            rotatedPoints.push(new Vector(
                x * cos - y * sin + rect.position.x,
                x * sin + y * cos + rect.position.y
            ));
        }

        return rotatedPoints;
    }

    static getProjection(points, axis) {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < points.length; i++) {
            const scalar = points[i].x * axis.x + points[i].y * axis.y;
            if (scalar < min) {
                min = scalar;
            }
            if (scalar > max) {
                max = scalar;
            }
        }

        return { min, max };
    }






    //v2 no angle
    // static isColliding(rectA, rectB) {
    //     const axes = SAT.getAxes(rectA, rectB);
    //     return !axes.some(axis => SAT.isAxisSeparated(rectA, rectB, axis));
    // }

    // static getAxes(rectA, rectB) {
    //     const aPoints = rectA.getPoints();
    //     const bPoints = rectB.getPoints();
    //     const axes = [];

    //     aPoints.forEach((p1, i) => {
    //         const p2 = aPoints[(i + 1) % aPoints.length];
    //         const axis = SAT.normalize({
    //             x: p2.y - p1.y,
    //             y: p1.x - p2.x
    //         });
    //         axes.push(axis);
    //     });

    //     bPoints.forEach((p1, i) => {
    //         const p2 = bPoints[(i + 1) % bPoints.length];
    //         const axis = SAT.normalize({
    //             x: p2.y - p1.y,
    //             y: p1.x - p2.x
    //         });
    //         axes.push(axis);
    //     });

    //     return axes;
    // }

    // static isAxisSeparated(rectA, rectB, axis) {
    //     const aProjections = rectA.getPoints().map(p => SAT.dotProduct(p, axis));
    //     const bProjections = rectB.getPoints().map(p => SAT.dotProduct(p, axis));

    //     const minA = Math.min(...aProjections);
    //     const maxA = Math.max(...aProjections);
    //     const minB = Math.min(...bProjections);
    //     const maxB = Math.max(...bProjections);

    //     return maxA < minB || maxB < minA;
    // }

    // static dotProduct(p1, p2) {
    //     return p1.x * p2.x + p1.y * p2.y;
    // }

    // static normalize(p) {
    //     const length = SAT.distance(p, { x: 0, y: 0 });
    //     return {
    //         x: p.x / length,
    //         y: p.y / length
    //     };
    // }

    // static distance(p1, p2) {
    //     const x = p2.x - p1.x;
    //     const y = p2.y - p1.y;

    //     return Math.sqrt(x * x + y * y);
    // }



    // static resolveRectangleRectangle(a, b) {
    //     const aVertices = a.getVertices();
    //     const bVertices = b.getVertices();
    //     let minOverlap = Infinity;
    //     let minAxis;
    //     let minIndexA;
    //     let minIndexB;

    //     // check overlap on each axis
    //     for (let i = 0; i < aVertices.length; i++) {
    //         const j = (i + 1) % aVertices.length;
    //         let normal = aVertices[j].sub(aVertices[i]).perpendicular().normalize();

    //         // rotate the normal by the first rectangle's angle
    //         const angle = a.angle;
    //         const x = normal.x * Math.cos(angle) - normal.y * Math.sin(angle);
    //         const y = normal.x * Math.sin(angle) + normal.y * Math.cos(angle);
    //         normal = new Vector(x, y);

    //         const projectA = SAT.projectRectangle(aVertices, normal);
    //         const projectB = SAT.projectRectangle(bVertices, normal);

    //         const overlap = SAT.getOverlap(projectA, projectB);
    //         if (overlap === 0) {
    //             return;
    //         } else if (overlap < minOverlap) {
    //             minOverlap = overlap;
    //             minAxis = normal;
    //             minIndexA = i;
    //             minIndexB = j;
    //         }
    //     }

    //     for (let i = 0; i < bVertices.length; i++) {
    //         const j = (i + 1) % bVertices.length;
    //         let normal = bVertices[j].sub(bVertices[i]).perpendicular().normalize();

    //         // rotate the normal by the second rectangle's angle
    //         const angle = b.angle;
    //         const x = normal.x * Math.cos(angle) - normal.y * Math.sin(angle);
    //         const y = normal.x * Math.sin(angle) + normal.y * Math.cos(angle);
    //         normal = new Vector(x, y);

    //         const projectA = SAT.projectRectangle(aVertices, normal);
    //         const projectB = SAT.projectRectangle(bVertices, normal);

    //         // game.printData('Texto', 20, 500);
    //         const overlap = SAT.getOverlap(projectA, projectB);
    //         if (overlap === 0) {
    //             return;
    //         } else if (overlap < minOverlap) {
    //             minOverlap = overlap;
    //             minAxis = normal;
    //             minIndexA = i;
    //             minIndexB = j;
    //         }
    //     }

    //     // move the rectangles out of the way
    //     const sign = Math.sign(minAxis.dot(bVertices[minIndexB].sub(aVertices[minIndexA])));

    //     a.position.x += minAxis.x * minOverlap * sign;
    //     a.position.y += minAxis.y * minOverlap * sign;
    //     b.position.x -= minAxis.x * minOverlap * sign;
    //     b.position.y -= minAxis.y * minOverlap * sign;
    // }

    // static resolveCircleRectangle(circle, rectangle) {
    //     const vertices = rectangle.getVertices();
    //     let minOverlap = Infinity;
    //     let minAxis;
    //     let minIndex;

    //     // check overlap on each axis
    //     for (let i = 0; i < vertices.length; i++) {
    //         const j = (i + 1) % vertices.length;
    //         const edge = vertices[j].sub(vertices[i]);

    //         let normal = edge.perpendicular().normalize();

    //         // rotate the normal by the rectangle's angle
    //         const angle = rectangle.angle;
    //         const x = normal.x * Math.cos(angle) - normal.y * Math.sin(angle);
    //         const y = normal.x * Math.sin(angle) + normal.y * Math.cos(angle);

    //         normal = new Vector(x, y);

    //         const projectCircle = SAT.projectCircle(circle, normal);
    //         const projectRectangle = SAT.projectRectangle(vertices, normal);

    //         const overlap = SAT.getOverlap(projectCircle, projectRectangle);
    //         if (overlap === 0) {
    //             return;
    //         } else if (overlap < minOverlap) {
    //             minOverlap = overlap;
    //             minAxis = normal;
    //             minIndex = i;
    //         }
    //     }

    //     // move the rectangle out of the way
    //     const sign = Math.sign(minAxis.dot(vertices[minIndex].sub(circle.position)));

    //     rectangle.position.x += minAxis.x * minOverlap * sign;
    //     rectangle.position.y += minAxis.y * minOverlap * sign;
    // }

    // static projectCircle(circle, axis) {
    //     const dot = new Vector(circle.position.x, circle.position.y).dot(axis);

    //     return {
    //         min: dot - circle.radius,
    //         max: dot + circle.radius
    //     };
    // }

    // static projectRectangle(vertices, axis) {
    //     let min = Infinity;
    //     let max = -Infinity;

    //     for (const vertex of vertices) {
    //         const dot = vertex.dot(axis);
    //         min = Math.min(dot, min);
    //         max = Math.max(dot, max);
    //     }

    //     return { min, max };
    // }

    // static getOverlap(a, b) {
    //     if (a.min > b.max || b.min > a.max) {
    //         return 0;
    //     }

    //     return Math.min(a.max, b.max) - Math.max(a.min, b.min);
    // }

    // getOverlap(projectA, projectB) {
    //     const left = Math.max(projectA[0], projectB[0]);
    //     const right = Math.min(projectA[1], projectB[1]);
    //     return right - left;
    // }

    // static projectRectangle(vertices, axis) {
    //     let min = axis.dot(vertices[0]);
    //     let max = min;
    //     for (let i = 1; i < vertices.length; i++) {
    //       const projection = axis.dot(vertices[i]);
    //       if (projection < min) {
    //         min = projection;
    //       } else if (projection > max) {
    //         max = projection;
    //       }
    //     }
    //     return [min, max];
    //   }
}
