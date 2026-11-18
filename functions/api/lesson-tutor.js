// Pages Functions entry point for optional Ask TSQ inference.
// Feature remains disabled unless the server bindings and flags are explicitly configured.
import { handleTutorRequest } from '../../deployment/lesson-tutor/handler.js';

export function onRequest(context) {
  return handleTutorRequest(context.request, context.env, {
    waitUntil: work => context.waitUntil(work),
  });
}
