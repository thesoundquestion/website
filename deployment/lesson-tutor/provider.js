// This model and its allowance are reviewed together. A request cannot select a model.
export const MODEL = '@cf/google/gemma-4-26b-a4b-it';
export const MAX_COMPLETION_TOKENS = 256;
export const MAX_MESSAGE_BYTES = 7_000;

export function workersAIProvider(binding) {
  return async function generate(messages) {
    const response = await binding.run(MODEL, {
      messages,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      n: 1,
      temperature: 0.2,
      stream: false,
      store: false,
    }, { rejectIfBusy: true });
    const choice = response?.choices?.[0];
    if (choice?.finish_reason !== 'stop') return null;
    return typeof choice.message?.content === 'string' ? choice.message.content : null;
  };
}
