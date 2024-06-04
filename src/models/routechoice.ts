/**
 * An orienteering course routechoice
 */
export type Routechoice = {
  track: [number, number][];
  length: number;
  elevation: number | null;
};
