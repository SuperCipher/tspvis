/* eslint-disable no-restricted-globals */
import makeSolver from "../makeSolver";
import { pathCost } from "../cost";

import {
  EVALUATING_PATH_COLOR,
  EVALUATING_SEGMENT_COLOR
} from "../../constants";

const pointLeft = (points, visited) => {
  const set_of_points = new Set(points);
  visited.forEach(point => {
    set_of_points.delete(point);
  });
  return set_of_points;
};

  // Bright yellow
  const HILIGHT_YELLOW_COLOR = [255, 255, 0, 240];

  // Bright pink
  const HILIGHT_PINK_COLOR = [255, 0, 255, 240];

  // Aqua
  const HILIGHT_AQUA_COLOR = [0, 255, 255, 240];

  // White
  const HILIGHT_WHITE_COLOR = [255, 255, 255, 240];

const dfs = async (points, pathStack = [], visited = null, overallBest = null) => {
  // console.log("🚀 ~ dfs ~ points:", points)
  // At the start visite == null
  // At the start pathStack == []
  // At the start overallBest == null
  // point is fixed data throughtout the recursion

  // console.log("🚀 ~ dfs ~ pathStack:", pathStack)
  // console.log("🚀 ~ dfs ~ visited:", visited)

  // Initiate values for the first time
  if (visited === null) {
    // initial call once when point is still an array
    pathStack = [points.shift()];
    points = new Set(points);
    visited = new Set();
  }

  // Visualizing code
  self.setEvaluatingPaths(
    () => ({
      paths: [
        {
          path: pathStack.slice(0, pathStack.length - 1),
          color: HILIGHT_YELLOW_COLOR
        }
        ,
        {
          path: pathStack.slice(pathStack.length - 2, pathStack.length + 1),
          color: HILIGHT_WHITE_COLOR
        }
      ]
    }),
    2
  );
  await self.sleep();

  // figure out what points are left from this point
  const available = pointLeft(points, visited);

  // ending condition
  if (available.size === 0) {
    // this must be a complete pathStack
    const backToStart = [...pathStack, pathStack[0]];

    // calculate the cost of this pathStack
    const cost = pathCost(backToStart);

    // Visualizing a complete tour
    self.setEvaluatingPaths(
      () => ({
        paths: [
          {
            path: backToStart,
            color: HILIGHT_AQUA_COLOR
          }
        ]
      }),
      2
    );

    await self.sleep();

    // return both the cost and the pathStack where we're at
    return [cost, backToStart];
  }

  let [bestCost, bestPath] = [null, null];

  // for every point yet to be visited along this pathStack
  for (const p of available) {
    // go to that point
    visited.add(p);
    pathStack.push(p);

    // RECURSE - go through all the possible points from that point
    const [curCost, curPath] = await dfs(points, pathStack, visited, overallBest);

    // if that pathStack is better, keep it
    if (bestCost === null || curCost < bestCost) {
      [bestCost, bestPath] = [curCost, curPath];

      if (overallBest === null || bestCost < overallBest) {
        // found a new best complete pathStack
        overallBest = bestCost;
        // console.log("🚀 ~ 2 dfs ~ bestCost:", bestCost)
        // console.log("🚀 ~ 2 dfs ~ overallBest:", overallBest)
        self.setBestPath(bestPath, bestCost);
      }
    }

    // go back up and make that point available again
    visited.delete(p);

    // Visualizing code
    self.setEvaluatingPath(
      () => ({
        path: { path: pathStack, color: HILIGHT_PINK_COLOR }
      }),
      2
    );
    await self.sleep();

    pathStack.pop();

    // Visualizing code
    self.setEvaluatingPath(
      () => ({
        path: { path: pathStack, color: HILIGHT_PINK_COLOR }
      }),
      2
    );

    await self.sleep();
  }
  
  return [bestCost, bestPath];
};

makeSolver(dfs);
