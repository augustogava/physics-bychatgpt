class SAT {
        static resolveRectangleRectangle(a, b) {
        const aVertices = a.getVertices();
        const bVertices = b.getVertices();
        let minOverlap = Infinity;
        let minAxis;
        let minIndexA;
        let minIndexB;

        // check overlap on each axis
        for (let i = 0; i < aVertices.length; i++) {
            const j = (i + 1) % aVertices.length;
            let normal = aVertices[j].sub(aVertices[i]).perpendicular().normalize();

            // rotate the normal by the first rectangle's angle
            const angle = a.angle;
            const x = normal.x * Math.cos(angle) - normal.y * Math.sin(angle);
            const y = normal.x * Math.sin(angle) + normal.y * Math.cos(angle);
            normal = new Vector(x, y);

            const projectA = SAT.projectRectangle(aVertices, normal);
            const projectB = SAT.projectRectangle(bVertices, normal);

            const overlap = SAT.getOverlap(projectA, projectB);
            if (overlap === 0) {
                return;
            } else if (overlap < minOverlap) {
                minOverlap = overlap;
                minAxis = normal;
                minIndexA = i;
                minIndexB = j;
            }
        }

        for (let i = 0; i < bVertices.length; i++) {
            const j = (i + 1) % bVertices.length;
            let normal = bVertices[j].sub(bVertices[i]).perpendicular().normalize();

            // rotate the normal by the second rectangle's angle
            const angle = b.angle;
            const x = normal.x * Math.cos(angle) - normal.y * Math.sin(angle);
            const y = normal.x * Math.sin(angle) + normal.y * Math.cos(angle);
            normal = new Vector(x, y);

            const projectA = SAT.projectRectangle(aVertices, normal);
            const projectB = SAT.projectRectangle(bVertices, normal);

            // game.printData('Texto', 20, 500);
            const overlap = SAT.getOverlap(projectA, projectB);
            if (overlap === 0) {
                return;
            } else if (overlap < minOverlap) {
                minOverlap = overlap;
                minAxis = normal;
                minIndexA = i;
                minIndexB = j;
            }
        }

        // move the rectangles out of the way
        const sign = Math.sign(minAxis.dot(bVertices[minIndexB].sub(aVertices[minIndexA])));

        a.position.x += minAxis.x * minOverlap * sign;
        a.position.y += minAxis.y * minOverlap * sign;
        b.position.x -= minAxis.x * minOverlap * sign;
        b.position.y -= minAxis.y * minOverlap * sign;
    }

    static resolveCircleRectangle(circle, rectangle) {
        const vertices = rectangle.getVertices();
        let minOverlap = Infinity;
        let minAxis;
        let minIndex;

        // check overlap on each axis
        for (let i = 0; i < vertices.length; i++) {
            const j = (i + 1) % vertices.length;
            const edge = vertices[j].sub(vertices[i]);

            let normal = edge.perpendicular().normalize();

            // rotate the normal by the rectangle's angle
            const angle = rectangle.angle;
            const x = normal.x * Math.cos(angle) - normal.y * Math.sin(angle);
            const y = normal.x * Math.sin(angle) + normal.y * Math.cos(angle);

            normal = new Vector(x, y);

            const projectCircle = SAT.projectCircle(circle, normal);
            const projectRectangle = SAT.projectRectangle(vertices, normal);

            const overlap = SAT.getOverlap(projectCircle, projectRectangle);
            if (overlap === 0) {
                return;
            } else if (overlap < minOverlap) {
                minOverlap = overlap;
                minAxis = normal;
                minIndex = i;
            }
        }

        // move the rectangle out of the way
        const sign = Math.sign(minAxis.dot(vertices[minIndex].sub(circle.position)));

        rectangle.position.x += minAxis.x * minOverlap * sign;
        rectangle.position.y += minAxis.y * minOverlap * sign;
    }

    static projectCircle(circle, axis) {
        const dot = new Vector(circle.position.x, circle.position.y).dot(axis);

        return {
            min: dot - circle.radius,
            max: dot + circle.radius
        };
    }

    static projectRectangle(vertices, axis) {
        let min = Infinity;
        let max = -Infinity;

        for (const vertex of vertices) {
            const dot = vertex.dot(axis);
            min = Math.min(dot, min);
            max = Math.max(dot, max);
        }

        return { min, max };
    }

    static getOverlap(a, b) {
        if (a.min > b.max || b.min > a.max) {
            return 0;
        }

        return Math.min(a.max, b.max) - Math.max(a.min, b.min);
    }

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
