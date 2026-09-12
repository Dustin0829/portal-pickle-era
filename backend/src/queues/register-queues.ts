/** Import queue modules and register them for Bull Board at API startup. */
import { registerQueueForBoard } from "./queue.js";
import "../modules/examples/examples.queue.js";
import "./activity-logs.queue.js";

registerQueueForBoard("examples");
registerQueueForBoard("activity-logs");
