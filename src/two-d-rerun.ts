import {
  CoordinatesConverter,
  type MapCalibrationPoint,
} from "@orienteering-js/map";
import type {
  TwoDRerunCourseExport,
  TwoDRerunTag,
} from "./models/two-d-rerun.ts";
import type { ControlPoint } from "./models/control-point.ts";
import type { Leg } from "./models/leg.ts";
import type { Routechoice } from "./models/routechoice.ts";
import { findRoutechoiceLegIndex } from "./utils.ts";

/**
 * Create a CoordinatesConverter instance from a 2D Rerun json export object
 *
 * @param twoDRerunExport A 2D Rerun json export object
 * @returns A CoordinatesConverter instance
 */
export function getCoordinatesConverterFromTwoDRerunCourseExport(
  twoDRerunExport: TwoDRerunCourseExport
): CoordinatesConverter {
  const allPoints: MapCalibrationPoint[] = twoDRerunExport.tags.flatMap((tag) =>
    tag.points.map((point, pointIndex) => {
      const [lat, lon] = point.split(",").map(parseFloatOrThrow);
      const [x, y] = tag.pointsxy[pointIndex].split(",").map(parseFloatOrThrow);
      return { gps: { lat, lon }, point: { x, y } };
    })
  );

  let top = allPoints[0];
  let bottom = allPoints[0];
  let left = allPoints[0];

  for (const point of allPoints) {
    if (point.point.y < top.point.y) {
      top = point;
      continue;
    }
    if (point.point.y > top.point.y) {
      bottom = point;
      continue;
    }
    if (point.point.x < top.point.x) {
      left = point;
      continue;
    }
  }

  if (top.point.x === bottom.point.x && top.point.y === bottom.point.y) {
    throw new Error("Top and bottom are the same point");
  }
  if (top.point.x === left.point.x && top.point.y === left.point.y) {
    throw new Error("Top and left are the same point");
  }
  if (left.point.x === bottom.point.x && left.point.y === bottom.point.y) {
    throw new Error("Left and bottom are the same point");
  }

  return new CoordinatesConverter([top, left, bottom]);
}

/**
 * Get a List of control points and legs from a 2D Rerun json export object
 *
 * @param twoDRerunExport A 2D Rerun json export object
 * @param coordinatesConverter A CoordinatesConverter instance
 * @returns A tuple containing an array of controls and an array of legs
 */
export function parseTwoDRerunCourseAndRoutechoicesExport(
  twoDRerunExport: TwoDRerunCourseExport,
  coordinatesConverter: CoordinatesConverter
): [ControlPoint[], Leg[]] {
  const constrolsLength = twoDRerunExport.coursecoords.length;

  const controls = twoDRerunExport.coursecoords.map((coord, index) => {
    let code = index.toString();
    if (index === 0) code = "start";
    if (index === constrolsLength - 1) code = "finish";

    const [x, y] = coord.split(",").map((c) => parseFloat(c));

    if (isNaN(x) || isNaN(y))
      throw new Error("Problem with course coordinates.");

    const [lat, lon] = coordinatesConverter.xYToLatLong([x, y]);

    return {
      id: crypto.randomUUID(),
      code,
      lat,
      lon,
    };
  });

  const legs: Leg[] = [];
  if (constrolsLength === 0) return [controls, legs];

  for (let i = 1; i < constrolsLength; i++) {
    legs.push({
      startControlCode: controls[i - 1].code,
      finishControlCode: controls[i].code,
      startLat: controls[i - 1].lat,
      startLon: controls[i - 1].lon,
      finishLat: controls[i].lat,
      finishLon: controls[i].lon,
      routechoices: [],
    });
  }

  const routechoices: Routechoice[] = twoDRerunExport.tags.map((tag) =>
    map2DRerunTagToRoutechoice(tag)
  );

  routechoices.forEach((rc) => {
    const legIndex = findRoutechoiceLegIndex(rc, legs);
    legs[legIndex].routechoices.push(rc);
  });

  return [controls, legs];
}

function map2DRerunTagToRoutechoice(tag: TwoDRerunTag): Routechoice {
  return {
    length: tag.length,
    elevation: null,
    track: tag.points.map((point) => {
      const [lat, lon] = point.split(",").map((c) => parseFloat(c));

      if (isNaN(lat) || isNaN(lon))
        throw new Error("Problem with course coordinates.");

      return [lat, lon];
    }),
  };
}

function parseFloatOrThrow(str: string): number {
  const parsedNum = parseFloat(str);
  if (isNaN(parsedNum)) throw new Error("Not a number");
  return parsedNum;
}
