import type { Leg } from "./models/leg.ts";
import {
  distanceBetweenTwoGPSPoints,
  getLineStringLength,
  getTotalPositiveElevation,
} from "./utils.ts";

/**
 * Parse a Routechoices GPX export from OCAD course setting and attribute routechoices to legs
 *
 * In recent OCAD version, you can generate routechoices from the course and the map
 * and export it in the GPX format
 *
 * @param routechoicesXmlDoc Returned by new DOMParser().parseFromString("...", "text/xml")
 * Works with linkedom's DOMParser in non browser environment, even if Typescript will
 * complain with the returned type.
 * @param legs An array of legs in witch the rouchoices should be injected.
 * @returns An array of legs with routechoices
 */
export function parseGPXRoutechoicesOCADExport(
  routechoicesXmlDoc: XMLDocument,
  legs: Leg[]
): Leg[] {
  if (legs.length === 0) return [];

  const clonedLegs = structuredClone(legs) as Leg[];

  const trackRawRoutechoices: RawRoutechoice[] =
    extractRawRoutechoicesFromXmlDocument(routechoicesXmlDoc, "track");
  const routeRawRoutechoices: RawRoutechoice[] =
    extractRawRoutechoicesFromXmlDocument(routechoicesXmlDoc, "route");
  const rawRoutechoices = [...trackRawRoutechoices, ...routeRawRoutechoices];
  const filteredRawRoutechoices: RawRoutechoice[] = [];

  // Filtering duplicates
  rawRoutechoices.forEach((rc, i) => {
    if (
      rawRoutechoices
        .slice(0, i)
        .every((route) => route.pointsString !== rc.pointsString)
    )
      filteredRawRoutechoices.push(rc);
  });

  filteredRawRoutechoices.forEach((rc) => {
    const elevation = getTotalPositiveElevation(rc.elevations);

    const length = getLineStringLength(rc.rawPoints);
    let attributedLegIndex = 0;

    let distanceStart = distanceBetweenTwoGPSPoints(
      [rc.rawPoints[0][0], rc.rawPoints[0][1]],
      [clonedLegs[0].startLat, clonedLegs[0].startLon]
    );

    const rawPointsLength = rc.rawPoints.length;

    let distanceFinish = distanceBetweenTwoGPSPoints(
      [
        rc.rawPoints[rawPointsLength - 1][0],
        rc.rawPoints[rawPointsLength - 1][1],
      ],
      [clonedLegs[0].finishLat, clonedLegs[0].finishLon]
    );

    clonedLegs.forEach((leg, i) => {
      const newDistanceStart = distanceBetweenTwoGPSPoints(
        [rc.rawPoints[0][0], rc.rawPoints[0][1]],
        [leg.startLat, leg.startLon]
      );

      const newDistanceFinish = distanceBetweenTwoGPSPoints(
        [
          rc.rawPoints[rawPointsLength - 1][0],
          rc.rawPoints[rawPointsLength - 1][1],
        ],
        [leg.finishLat, leg.finishLon]
      );

      if (
        newDistanceStart + newDistanceFinish <
        distanceStart + distanceFinish
      ) {
        distanceStart = newDistanceStart;
        distanceFinish = newDistanceFinish;
        attributedLegIndex = i;
      }
    });

    if (distanceStart > 500)
      console.warn(
        "Routechoice first point is more than 500m away from any control"
      );

    clonedLegs[attributedLegIndex].routechoices.push({
      track: rc.rawPoints,
      length,
      elevation,
    });
  });

  return clonedLegs;
}

function extractRawRoutechoicesFromXmlDocument(
  routechoicesXmlDoc: XMLDocument,
  mode: "track" | "route"
): RawRoutechoice[] {
  return Array.from(
    routechoicesXmlDoc.querySelectorAll(mode === "track" ? "trk" : "rte")
  ).map((trk) => {
    const elevations: (number | null)[] = [];
    const rawPoints: [number, number][] = [];
    const trackPoints = trk.querySelectorAll(
      mode === "track" ? "trkpt" : "rtept"
    );

    for (const trkpt of Array.from(trackPoints)) {
      const latString = trkpt.getAttribute("lat");
      const lonString = trkpt.getAttribute("lon");

      if (latString === null || lonString === null)
        throw new Error("There is no latitude or longitude for this point.");

      const lat = parseFloat(latString);
      const lon = parseFloat(lonString);

      if (isNaN(lat) || isNaN(lon))
        throw new Error(
          "There is a problem with the format of the latitude or the longitude."
        );

      const elevation = getElevationFromTrkpt(trkpt);
      elevations.push(elevation);

      rawPoints.push([lat, lon]);
    }

    const pointsString = rawPoints.flat().join("");

    return {
      rawPoints,
      pointsString,
      elevations,
    };
  });
}

function getElevationFromTrkpt(trkpt: Element): number | null {
  const elevationElement = trkpt.querySelector("ele");
  if (elevationElement === null) return null;
  const rawElevation = elevationElement.textContent;
  if (rawElevation === null) return null;
  const parsedElevation = parseFloat(rawElevation);
  if (isNaN(parsedElevation)) return null;
  return parsedElevation;
}

interface RawRoutechoice {
  rawPoints: [number, number][];
  elevations: (number | null)[];
  pointsString: string;
}
