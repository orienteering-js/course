import type { Routechoice } from "./routechoice.ts";

/**
 * An orienteering course leg
 */
export type Leg = {
  startControlCode: string;
  finishControlCode: string;
  startLat: number;
  startLon: number;
  finishLat: number;
  finishLon: number;
  routechoices: Routechoice[];
};
