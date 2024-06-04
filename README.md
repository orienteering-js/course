# Course

Parse and manage orienteering courses data with Javascript/Typescript

## Installation

### Deno

```sh
deno add @orienteering-js/course
```

### Npm

```sh
npx jsr add @orienteering-js/course
```

### Yarn

```sh
yarn dlx jsr add @orienteering-js/course
```

### Pnpm

```sh
pnpm dlx jsr add @orienteering-js/course
```

### Bun

```sh
bunx jsr add @orienteering-js/course
```

## Usage

```ts
import {
  parseIOFXML3CourseExport,
  parseGPXRoutechoicesOCADExport,
} from "@orienteering-js/course";
import { readFileSync } from "node:fs";

const courseFile = readFileSync("course.xml");
const routechoicesFile = readFileSync("routechoices.gpx");

const parser = new DOMParser();

const courseDocument = parser.parseFromString(courseFile, "text/xml");
const [controls, legs] = parseIOFXML3CourseExport(courseDocument, 0);

const routechoicesDocument = parser.parseFromString(
  routechoicesFile,
  "text/xml"
);
const legsWithRoutechoices = parseGPXRoutechoicesOCADExport(
  routechoicesDocument,
  legs
);

legsWithRoutechoices.forEach((leg) => {
  console.log(leg.routechoices);
});
```
