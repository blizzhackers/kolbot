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
   * Marks this vertex's room as explored.
   */
  Vertex.prototype.markAsSeen = function() {
    this.seen = true;
  };

  /**
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  Vertex.prototype.coordsInRoom = function(x, y) {
    return (x >= this.x * 5 && x < this.x * 5 + this.xsize
      && y >= this.y * 5 && y < this.y * 5 + this.ysize
    );
  };

  /**
   * @param {"walk" | "teleport"} mode 
   * @returns {PathNode[]}
   */
  Vertex.prototype.path = function(mode = "walk") {
    const key = mode + "Path";
    if (key in this.cache) {
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
   * Sum of segment distances along a path.
   * @param {PathNode[] | false} path
   * @returns {number} total distance, Infinity if the path is missing/empty
   */
  const pathLength = function (path) {
    if (!path || !path.length) {
      return Infinity;
    }
    return path.reduce(function (acc, v, i, arr) {
      let prev = i ? arr[i - 1] : v;
      return acc + Math.sqrt((prev.x - v.x) * (prev.x - v.x) + (prev.y - v.y) * (prev.y - v.y));
    }, 0);
  };

  /**
   * @param {"walk" | "teleport"} mode
   * @returns {number}
   */
  Vertex.prototype.pathDistance = function(mode = "walk") {
    const key = mode + "PathDistance";
    if (key in this.cache) {
      return this.cache[key];
    }
    let distance = pathLength(this.path(mode));
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
    if (this.cache[key] && other.id in this.cache[key]) {
      return this.cache[key][other.id];
    }
    const inRoom = CollMap.coordsInRoom(me.x, me.y, this);
    const area = this.area;
    const rType = mode === "walk" ? 0 : 1;
    const nDist = mode === "walk" ? Pather.walkDistance : Pather.teleDistance;
    const x = inRoom ? me.x : mode === "walk" ? this.walkableX : this.centerX;
    const y = inRoom ? me.y : mode === "walk" ? this.walkableY : this.centerY;
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
    if (this.cache[key] && other.id in this.cache[key]) {
      return this.cache[key][other.id];
    }
    let distance = pathLength(this.pathTo(other, mode));
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

    this.vertices.sort(Sort.makeComparator(function (a) {
      return getDistance(me.x, me.y, a.walkableX, a.walkableY);
    }));

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
      const nearby = room.getNearby();
      if (!nearby) {
        return [];
      }
      const self = this;
      return nearby
        .compactMap(function (r) {
          return self.vertexForRoom(r);
        });
      //.sort((a, b) => a.adjustedPathDistance - b.adjustedPathDistance);
    };
  }

  /**
   * @todo unimplemented placeholder for a custom exploration strategy
   * @param {Graph} graph
   * @param {(vertex: Vertex) => void} explore
   */
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
      CollMap.drawRoom(currentVertex, "green", true);

      explore(currentVertex);
      currentVertex.markAsSeen();
      CollMap.drawRoom(currentVertex, "purple", true);

      // our explore method could move us to a different room, so we need to get the vertex again
      if (!currentVertex.coordsInRoom(me.x, me.y)) {
        console.debug("Moved to a different room, getting new vertex");
        let _newVertex = graph.vertexForRoom(getRoom(me.x, me.y));
        if (_newVertex) {
          currentVertex = _newVertex;
        } else {
          console.warn("Could not find vertex for my room?");
        }
      }
      
      let nearbies = graph.nearbyVertices(currentVertex)
        .filter(filterSeen)
        .sort(function (a, b) {
          let distanceToA = currentVertex.pathDistanceTo(a, mode);
          let distanceToB = currentVertex.pathDistanceTo(b, mode);
          let distDiff = Math.abs(distanceToA - distanceToB);
          
          // If the difference is less than 5% of the distance to a, sort by number of neighbors
          if (distDiff / distanceToA < 0.05) {
            // sort by number of neighbors (ascending)
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
            let aDist = a.pathDistance(mode);
            let bDist = b.pathDistance(mode);
            let distDiff = Math.abs(aDist - bDist);

            // If the difference is less than 5% of the distance to a, sort by number of neighbors
            if (distDiff / aDist < 0.05) {
              // sort by number of neighbors (ascending)
              let diff = graph.nearbyVertices(a).length - graph.nearbyVertices(b).length;
              if (diff !== 0) return diff;
            }
            
            // return a.pathDistance(mode) - b.pathDistance(mode);
            return aDist - bDist;
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

  /**
   * @typedef {Object} GraphAnalysis
   * @property {number} vertexCount - Total number of vertices
   * @property {number} avgDegree - Average neighbors per vertex
   * @property {number} deadEndRatio - Ratio of dead-ends (degree <= 1) to total vertices
   * @property {number} maxDegree - Maximum neighbors any vertex has
   * @property {number} componentCount - Number of disconnected components
   * @property {"linear" | "maze" | "open" | "hub"} mapType - Inferred map type
   * @property {number} sizeWeight - Recommended size weight for scoring
   * @property {number} distWeight - Recommended distance weight for scoring
   */

  /**
   * Analyze graph structure to determine map characteristics and optimal tuning
   * @param {Graph} graph
   * @returns {GraphAnalysis}
   */
  Graph.analyzeGraph = function(graph) {
    let vertices = graph.vertices;
    let vertexCount = vertices.length;

    if (vertexCount === 0) {
      return {
        vertexCount: 0,
        avgDegree: 0,
        deadEndRatio: 0,
        maxDegree: 0,
        componentCount: 0,
        mapType: "open",
        sizeWeight: 0.33,
        distWeight: 0.7
      };
    }

    // Calculate degree statistics
    let degrees = vertices.map(function(v) {
      return graph.nearbyVertices(v).length;
    });
    let totalDegree = degrees.reduce(function(sum, d) { return sum + d; }, 0);
    let avgDegree = totalDegree / vertexCount;
    let maxDegree = Math.max.apply(null, degrees);
    let deadEnds = degrees.filter(function(d) { return d <= 1; }).length;
    let deadEndRatio = deadEnds / vertexCount;

    // Count connected components
    let visited = new Set();
    let componentCount = 0;
    for (let vertex of vertices) {
      if (visited.has(vertex.id)) continue;
      componentCount++;
      let queue = [vertex];
      visited.add(vertex.id);
      while (queue.length) {
        let current = queue.shift();
        let neighbors = graph.nearbyVertices(current);
        for (let neighbor of neighbors) {
          if (!visited.has(neighbor.id)) {
            visited.add(neighbor.id);
            queue.push(neighbor);
          }
        }
      }
    }

    // Determine map type based on metrics
    let mapType = "open";
    let sizeWeight = 0.33;
    let distWeight = 0.7;

    if (avgDegree <= 1.5 && deadEndRatio < 0.15) {
      // Low connectivity, few dead-ends = linear corridor
      mapType = "linear";
      sizeWeight = 0.2;  // Less important to clear small branches
      distWeight = 0.8;  // Just follow the path
    } else if (deadEndRatio > 0.3) {
      // Many dead-ends = maze-like
      mapType = "maze";
      sizeWeight = 0.5;  // Very important to clear branches
      distWeight = 0.5;  // Balance with distance
    } else if (avgDegree > 3 && maxDegree > 5) {
      // High connectivity = open area
      mapType = "open";
      sizeWeight = 0.25;
      distWeight = 0.75; // Prefer nearest neighbor
    } else if (componentCount > 1 || (maxDegree > 4 && avgDegree < 2.5)) {
      // Multiple components or hub pattern
      mapType = "hub";
      sizeWeight = 0.4;  // Important to clear smaller sections
      distWeight = 0.6;
    }

    return {
      vertexCount: vertexCount,
      avgDegree: avgDegree,
      deadEndRatio: deadEndRatio,
      maxDegree: maxDegree,
      componentCount: componentCount,
      mapType: mapType,
      sizeWeight: sizeWeight,
      distWeight: distWeight
    };
  };

  /**
   * Adaptive search that analyzes the graph and uses optimal algorithm/tuning
   * @param {Graph} graph
   * @param {(vertex: Vertex) => any} explore
   * @param {"walk" | "teleport"} mode
   */
  Graph.adaptiveSearch = function(graph, explore, mode = "walk") {
    let analysis = Graph.analyzeGraph(graph);

    console.log("Graph Analysis: " + JSON.stringify({
      vertices: analysis.vertexCount,
      avgDegree: analysis.avgDegree.toFixed(2),
      deadEndRatio: (analysis.deadEndRatio * 100).toFixed(1) + "%",
      components: analysis.componentCount,
      mapType: analysis.mapType
    }));

    // For linear maps, simple nearest neighbor is often sufficient and faster
    if (analysis.mapType === "linear" && analysis.componentCount === 1) {
      console.log("Using nearestNeighbourSearch for linear map");
      return Graph.nearestNeighbourSearch(graph, explore, mode);
    }

    // For all other types, use cluster-aware with tuned weights
    console.log("Using clusterAwareSearch with weights: size="
      + analysis.sizeWeight + ", dist=" + analysis.distWeight);
    return Graph.clusterAwareSearch(graph, explore, mode, analysis.sizeWeight, analysis.distWeight);
  };

  /**
   * Cluster-aware nearest neighbor search that identifies connected components
   * and prioritizes completing smaller/closer clusters before moving on.
   * This prevents leaving isolated sections unexplored until the end.
   * @param {Graph} graph
   * @param {(vertex: Vertex) => any} explore
   * @param {"walk" | "teleport"} mode
   * @param {number} [sizeWeight=0.33] - Weight for component size in scoring
   * @param {number} [distWeight=0.7] - Weight for distance in scoring
   */
  Graph.clusterAwareSearch = function(graph, explore, mode = "walk", sizeWeight = 0.33, distWeight = 0.7) {
    /**
     * Find all connected components in the remaining unvisited graph
     * @returns {Vertex[][]}
     */
    function findComponents() {
      let unvisited = graph.vertices.filter(filterSeen);
      let components = [];
      let visited = new Set();

      for (let vertex of unvisited) {
        if (visited.has(vertex.id)) continue;

        // BFS to find all vertices in this component
        let component = [];
        let queue = [vertex];
        visited.add(vertex.id);

        while (queue.length) {
          let current = queue.shift();
          component.push(current);

          let neighbors = graph.nearbyVertices(current).filter(function(v) {
            return !v.seen && !visited.has(v.id);
          });

          for (let neighbor of neighbors) {
            visited.add(neighbor.id);
            queue.push(neighbor);
          }
        }

        if (component.length > 0) {
          components.push(component);
        }
      }

      return components;
    }

    /**
     * Find the entry point (closest vertex) into a component from current position
     * @param {Vertex[]} component
     * @returns {Vertex | null}
     */
    function findEntryPoint(component) {
      return component.reduce(function(best, v) {
        v.clearCache();
        let dist = v.pathDistance(mode);
        if (dist < best.dist) {
          return { vertex: v, dist: dist };
        }
        return best;
      }, { vertex: null, dist: Infinity }).vertex;
    }

    /**
     * Score a component for priority (lower = should visit sooner)
     * Factors: size (smaller first), distance to entry point
     * @param {Vertex[]} component
     * @returns {number}
     */
    function scoreComponent(component) {
      let entry = findEntryPoint(component);
      if (!entry) return Infinity;

      let distanceToEntry = entry.pathDistance(mode);
      let size = component.length;

      // Normalize size (1 vertex = 0, larger = higher score)
      let sizeScore = (size - 1) * 50;

      return (sizeScore * sizeWeight) + (distanceToEntry * distWeight);
    }

    /**
     * Calculate the "branch size" reachable from a vertex without backtracking through origin
     * Smaller branches should be cleared first to avoid backtracking
     * @param {Vertex} vertex - The vertex to measure from
     * @param {Vertex} origin - The vertex we came from (don't count paths back through here)
     * @param {Vertex[]} component - The component we're exploring
     * @returns {number} - Number of unvisited vertices reachable
     */
    function getBranchSize(vertex, origin, component) {
      let visited = new Set([origin.id, vertex.id]);
      let queue = [vertex];
      let count = 1;

      while (queue.length) {
        let current = queue.shift();
        let neighbors = graph.nearbyVertices(current).filter(function(v) {
          return !v.seen && component.includes(v) && !visited.has(v.id);
        });

        for (let neighbor of neighbors) {
          visited.add(neighbor.id);
          queue.push(neighbor);
          count++;
        }
      }

      return count;
    }

    /**
     * Explore within a component using nearest-neighbor with dead-end awareness
     * @param {Vertex[]} component
     */
    function exploreComponent(component) {
      let currentVertex = findEntryPoint(component);

      while (currentVertex && !currentVertex.seen) {
        CollMap.drawRoom(currentVertex, "green", true);
        explore(currentVertex);
        currentVertex.markAsSeen();
        CollMap.drawRoom(currentVertex, "purple", true);

        // Handle movement during explore
        if (!currentVertex.coordsInRoom(me.x, me.y)) {
          let _newVertex = graph.vertexForRoom(getRoom(me.x, me.y));
          if (_newVertex && component.includes(_newVertex)) {
            currentVertex = _newVertex;
          }
        }

        // Get unvisited neighbors within this component
        let neighbors = graph.nearbyVertices(currentVertex)
          .filter(function(v) {
            return !v.seen && component.includes(v);
          });

        if (neighbors.length === 0) {
          // No neighbors in component, find nearest unvisited in component
          currentVertex = component
            .filter(filterSeen)
            .reduce(function(best, v) {
              v.clearCache();
              let dist = v.pathDistance(mode);
              if (dist < best.dist) {
                return { vertex: v, dist: dist };
              }
              return best;
            }, { vertex: null, dist: Infinity }).vertex;
        } else {
          // Sort neighbors by branch size (smaller branches first to avoid backtracking)
          neighbors.sort(function(a, b) {
            let aBranchSize = getBranchSize(a, currentVertex, component);
            let bBranchSize = getBranchSize(b, currentVertex, component);

            // Prioritize smaller branches (clear them first)
            if (aBranchSize !== bBranchSize) {
              return aBranchSize - bBranchSize;
            }

            // Tie-breaker: use path distance
            let distA = currentVertex.pathDistanceTo(a, mode);
            let distB = currentVertex.pathDistanceTo(b, mode);
            return distA - distB;
          });

          currentVertex = neighbors[0];
        }

        // Clear caches for next iteration
        for (let v of graph.vertices) {
          v.clearCache();
        }
      }
    }

    // Main loop
    while (graph.vertices.some(function(v) { return !v.seen; })) {
      let components = findComponents();

      if (components.length === 0) break;

      // Sort components by score (lower = higher priority)
      components.sort(function(a, b) {
        return scoreComponent(a) - scoreComponent(b);
      });

      let targetComponent = components[0];

      for (let v of targetComponent) {
        CollMap.drawRoom(v, "white", true);
      }

      exploreComponent(targetComponent);
    }
  };

  module.exports = Graph;
})(module, require);
