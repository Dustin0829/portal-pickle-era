import { createOptionalQueue } from "../../queues/queue.js";

export type ExampleCreatedJob = {
  exampleId: string;
};

export const exampleQueue = createOptionalQueue<ExampleCreatedJob>("examples");
