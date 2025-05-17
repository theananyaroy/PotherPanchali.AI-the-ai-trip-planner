import React, { useState } from 'react';

const DistanceMatrix = ({ apiKey }) => {
  const [places, setPlaces] = useState([]);
  const [distanceMatrix, setDistanceMatrix] = useState([]);
  const [shortestPaths, setShortestPaths] = useState([]);

  const fetchDistanceMatrix = async () => {
    const origins = places.join('|');
    const destinations = places.join('|');

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const matrix = data.rows.map(row =>
        row.elements.map(el => (el.status === 'OK' ? el.distance.value : Infinity))
      );

      setDistanceMatrix(matrix);

      // Example: Compute shortest paths from the first place
      const shortest = dijkstra(matrix, 0);
      setShortestPaths(shortest);
    } catch (error) {
      console.error("Failed to fetch distance matrix:", error);
    }
  };

  const dijkstra = (graph, startIndex) => {
    const n = graph.length;
    const distances = Array(n).fill(Infinity);
    distances[startIndex] = 0;

    const pq = [[0, startIndex]];

    while (pq.length > 0) {
      const [currentDistance, currentNode] = pq.shift();

      for (let neighbor = 0; neighbor < n; neighbor++) {
        const distance = graph[currentNode][neighbor];
        if (distance < Infinity) {
          const newDistance = currentDistance + distance;
          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance;
            pq.push([newDistance, neighbor]);
          }
        }
      }

      // Sort priority queue (acts like min-heap)
      pq.sort((a, b) => a[0] - b[0]);
    }

    return distances;
  };
}
export default DistanceMatrix;