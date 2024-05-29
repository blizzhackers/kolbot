/**
 * @author ryancrunchi, theBGuy
 * @description Graph algorithms implementation for rooms exploration.
 */

(function (module) {
  /**
   * Wrapper class for room as vertex
   * @constructor
   * @param {Room} room 
   */
  function Vertex(room) {
    this.id = Vertex._id++;
    this.centerX = room.x * 5 + room.xsize / 2;
    this.centerY = room.y * 5 + room.ysize / 2;
    this.x = room.x;
    this.y = room.y;
    this.xsize = room.xsize;
    this.ysize = room.ysize;
    this.seen = false;
    this.walkableX = this.centerX;
    this.walkableY = this.centerY;
    this.area = room.level;
    // Should the step be lowered?
    let adjusted = Pather.getNearestWalkable(this.centerX, this.centerY, 20, 10);
    if (!adjusted) {
      throw new Error("Vertex is not walkable");
    }
    this.walkableX = adjusted[0];
    this.walkableY = adjusted[1];

    /** @type {Record<any, any>} */
    this.cache = {};
  }

  /** @static */
  Vertex._id = 0;

  /** @this {Vertex} */
  Vertex.prototype.clearCache = function() {
    this.cache = {};
  };

  /**
   * @param {"walk" | "teleport"} mode 
   * @returns {PathNode[]}
   */
  Vertex.prototype.path = function(mode = "walk") {
    const key = mode + "Path";
    if (this.cache[key]) {
      return this.cache[key];
    }
    const x = mode === "walk" ? this.walkableX : this.centerX;
    const y = mode === "walk" ? this.walkableY : this.centerY;
    const rType = mode === "walk" ? 0 : 1;
    const nDist = mode === "walk" ? Pather.walkDistance : Pather.teleDistance;
    let path = getPath(this.area, me.x, me.y, x, y, rType, nDist);
    this.cache[key] = path;
    return path;
  };

  /**
   * @param {"walk" | "teleport"} mode 
   * @returns {number}
   */
  Vertex.prototype.pathDistance = function(mode = "walk") {
    const key = mode + "PathDistance";
    if (this.cache[key]) {
      return this.cache[key];
    }
    let path = this.path(mode);
    if (!path.length) {
      return Infinity;
    }
    let distance = path.reduce(function (acc, v, i, arr) {
      let prev = i ? arr[i - 1] : v;
      return acc + Math.sqrt((prev.x - v.x) * (prev.x - v.x) + (prev.y - v.y) * (prev.y - v.y));
    }, 0);
    this.cache[key] = distance;
    return distance;
  };

  /**
   * @this {Vertex}
   * @param {Vertex} other 
   * @param {"walk" | "teleport"} mode
   * @returns {Array<{x: number, y: number}>}
   */
  Vertex.prototype.pathTo = function(other, mode = "walk") {
    const key = mode + "PathTo";
    if (this.cache[key] && this.cache[key][other.id]) {
      return this.cache[key][other.id];
    }
    const area = this.area;
    const rType = mode === "walk" ? 0 : 1;
    const nDist = mode === "walk" ? Pather.walkDistance : Pather.teleDistance;
    const x = mode === "walk" ? this.walkableX : this.centerX;
    const y = mode === "walk" ? this.walkableY : this.centerY;
    const otherX = mode === "walk" ? other.walkableX : other.centerX;
    const otherY = mode === "walk" ? other.walkableY : other.centerY;

    let path = getPath(area, x, y, otherX, otherY, rType, nDist);
    if (!this.cache[key]) {
      this.cache[key] = {};
    }
    this.cache[key][other.id] = path;
    return path;
  };

  /**
   * @param {Vertex} other 
   * @param {"walk" | "teleport"} mode
   * @returns {number}
   */
  Vertex.prototype.pathDistanceTo = function(other, mode = "walk") {
    const key = mode + "PathDistanceTo";
    if (this.cache[key] && this.cache[key][other.id]) {
      return this.cache[key][other.id];
    }
    let path = this.pathTo(other, mode);
    if (!path.length) {
      return Infinity;
    }
    let distance = path.reduce(function (acc, v, i, arr) {
      let prev = i ? arr[i - 1] : v;
      return acc + Math.sqrt((prev.x - v.x) * (prev.x - v.x) + (prev.y - v.y) * (prev.y - v.y));
    }, 0);
    if (!this.cache[key]) {
      this.cache[key] = {};
    }
    this.cache[key][other.id] = distance;
    return distance;
  };

  /**
   * @description Graph class to handle vertices and search algorithms
   * @constructor
   */
  function Graph() {
    CollMap.removeHooks();
    /** @type {Vertex[]} */
    this.vertices = [];

    // TODO: We should eliminate rooms that are over 80% unwalkable
    let room = getRoom();
    if (room) {
      do {
        try {
          let vertex = new Vertex(room);
          this.vertices.push(vertex);
          CollMap.drawRoom(copyObj(room), "blue");
        } catch (e) {
          CollMap.drawRoom(copyObj(room), "red");
        }
      } while (room.getNext());
    }

    this.vertices.sort(function (a, b) {
      return getDistance(me.x, me.y, a.walkableX, a.walkableY) - getDistance(me.x, me.y, b.walkableX, b.walkableY);
    });

    /**
     * get the graph vertex from room object
     * @param {Room} room 
     */
    this.vertexForRoom = function (room) {
      return this.vertices.find(function (v) {
        return v.x === room.x && v.y === room.y;
      });
    };

    /**
     * get the room the vertex is in
     * @param {Vertex} vertex 
     * @returns {Room}
     */
    this.roomForVertex = function (vertex) {
      return getRoom(vertex.centerX, vertex.centerY);
    };
    
    /**
     * get nearby vertices from vertex (child) by getting neaby rooms.
     * @param {Vertex} vertex 
     * @returns 
     */
    this.nearbyVertices = function (vertex) {
      let room = this.roomForVertex(vertex);
      if (!room) {
        return [];
      }
      const self = this;
      return room.getNearby()
        .compactMap(function (r) {
          return self.vertexForRoom(r);
        });
      //.sort((a, b) => a.adjustedPathDistance - b.adjustedPathDistance);
    };
  }

  // eslint-disable-next-line no-unused-vars
  Graph.customSearch = function(graph, explore) {
    
  };

  /** @param {Vertex} v */
  const filterSeen = function (v) {
    return !v.seen;
  };

  /**
   * @param {Graph} graph 
   * @param {(vertex: Vertex) => any} explore 
   * @param {"walk" | "teleport"} mode
   */
  Graph.nearestNeighbourSearch = function(graph, explore, mode = "walk") {
    let currentVertex = graph.vertices.filter(filterSeen).first();
    while (currentVertex) {
      CollMap.drawRoom(graph.roomForVertex(currentVertex), "green", true);

      explore(currentVertex);
      // currentVertex.seen = true; // not working when it comes from neabies array, it should be referenced from graph.vertices array
      graph.vertices.find(function (v) { return v === currentVertex; }).seen = true;
      CollMap.drawRoom(graph.roomForVertex(currentVertex), "purple", true);
      let nearbies = graph.nearbyVertices(currentVertex)
        .filter(filterSeen)
        .sort(function (a, b) {
          let distanceToA = currentVertex.pathDistanceTo(a, mode);
          let distanceToB = currentVertex.pathDistanceTo(b, mode);
          let distDiff = Math.abs(distanceToA - distanceToB);
          
          // If the difference is less than 5% of the distance to a, sort by number of neighbors
          if (distDiff / distanceToA < 0.05) {
            // First sort by number of neighbors (ascending)
            let diff = graph.nearbyVertices(a).length - graph.nearbyVertices(b).length;
            if (diff !== 0) return diff;
          }
          // If number of neighbors is the same, sort by walkable path distance (ascending)
          return distanceToA - distanceToB;
        });
      nearbies.forEach(function (n) {
        CollMap.drawRoom(graph.roomForVertex(n), "white", true);
      });
      currentVertex = nearbies.first() ||
        // if no neihbors is found, get next nearest vertex in graph
        graph.vertices
          .filter(filterSeen)
          .sort(function (a, b) {
            return a.pathDistance(mode) - b.pathDistance(mode);
          })
          .first();
      for (let vertice of graph.vertices) {
        vertice.clearCache();
      }
    }

    //TODO: sometimes, the bot leaves a small group of vertices alone, and continues to the biggest part of the graph
    // this leads the bot to go to this small group at the end and it is not optimal. It should have gone to this small group before finishing all the rest
    // we need to construct get disconnected parts of graph and go to the nearest smallest part before continuing
  };

  /**
   * DFS implementation
   * exploreFunction is a function called for every explored vertex in the graph that takes a vertex as parameter
   * @param {Graph} graph 
   * @param {(vertex: Vertex) => any} exploreFunction 
   * @param {"walk" | "teleport"} mode
   */
  Graph.depthFirstSearch = function(graph, exploreFunction, mode = "walk") {
    /** @type {Vertex[]} */
    let stack = [];
    let startVertex = graph.vertices.first();
    stack.push(startVertex);

    while (stack.length) {
      let vertex = stack.pop();
      if (vertex.seen) continue;
      exploreFunction(vertex);
      vertex.seen = true;

      CollMap.drawRoom(vertex, "green", true);
      let neighbors = graph.nearbyVertices(vertex).filter(filterSeen);
      for (let i = 0; i < neighbors.length; i++) {
        stack.push(neighbors[i]);
        CollMap.drawRoom(neighbors[i], "purple", true);
      }
      // console.time("sort");
      stack.sort(function (a, b) {
        return b.pathDistance(mode) - a.pathDistance(mode);
      });
      // console.timeEnd("sort");
      // clear cache for all vertices
      for (let vertice of graph.vertices) {
        vertice.clearCache();
      }
    }
  };
  
  /**
   * BFS implementation
   * exploreFunction is a function called for every explored vertex in the graph that takes a vertex as parameter
   * @param {Graph} graph 
   * @param {(vertex: Vertex) => any} exploreFunction 
   */
  Graph.breadthFirstSearch = function(graph, exploreFunction) {
    let queue = [];
    let startVertex = graph.vertices.first();
    queue.push(startVertex);
    while (queue.length) {
      let vertex = queue.shift();
      let neighbors = graph.nearbyVertices(vertex).filter(filterSeen);
      for (let i = 0; i < neighbors.length; i++) {
        queue.push(neighbors[i]);
        neighbors[i].seen = true;
      }
      exploreFunction(vertex);
      vertex.seen = true;
      CollMap.drawRoom(vertex, "green", true);
    }
  };

  module.exports = Graph;
})(module, require);
