import { z } from "zod";

/**
 * A 2D Rerun routechoice
 */
export type TwoDRerunTag = {
  type: string;
  opened_dialog: number;
  ready_for_dialog: number;
  runnername: string;
  points: string[];
  pointsxy: string[];
  currenttime: number;
  currentalt: number;
  totalup: number;
  show: number;
  offsettxt_x: number;
  offsettxt_y: number;
  offsettxt_basex: number;
  offsettxt_basey: number;
  group: number;
  x: number;
  y: number;
  length: number;
  name: string;
  description: string;
  color: string;
};

/**
 * A zod schema for a 2D Rerun routechoice
 */
export const twoDRerunTagSchema: z.ZodType<TwoDRerunTag> = z.object({
  type: z.string(),
  opened_dialog: z.number(),
  ready_for_dialog: z.number(),
  runnername: z.string(),
  points: z.array(z.string()),
  pointsxy: z.array(z.string()),
  currenttime: z.number(),
  currentalt: z.number(),
  totalup: z.number(),
  show: z.number(),
  offsettxt_x: z.number(),
  offsettxt_y: z.number(),
  offsettxt_basex: z.number(),
  offsettxt_basey: z.number(),
  group: z.number(),
  x: z.number(),
  y: z.number(),
  length: z.number(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
});

/**
 * A 2D Rerun json export object
 */
export type TwoDRerunCourseExport = {
  tags: TwoDRerunTag[];
  coursecoords: string[];
  otechinfo: Record<string, any>;
};

/**
 * A zod schema for a 2D Rerun json export object
 */
export const twoDRerunCourseExportSchema: z.ZodType<TwoDRerunCourseExport> =
  z.object({
    tags: z.array(twoDRerunTagSchema),
    coursecoords: z.array(z.string()),
    otechinfo: z.object({}),
  });
