import type { Routechoice } from "./routechoice.ts";

export type Leg = {
  startControlCode: string;
  finishControlCode: string;
  startLat: number;
  startLon: number;
  finishLat: number;
  finishLon: number;
  routechoices: Routechoice[];
};
