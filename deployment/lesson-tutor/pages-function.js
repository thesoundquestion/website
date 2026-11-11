// Copy to functions/api/lesson-tutor.js only when the documented Free setup is ready.
import { handleTutorRequest } from '../../deployment/lesson-tutor/handler.js';

export function onRequest(context) {
  return handleTutorRequest(context.request, context.env, {
    waitUntil: work => context.waitUntil(work),
  });
}
