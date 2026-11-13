export const PRICE_REFERENCE_DAYS = 30;
const DAY_MS = 86_400_000;

function calendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0,10) === value ? time : NaN;
}

// Saved regular retail amounts are planning references. Their links remain useful after expiry.
export function retailPriceReference(snapshot, referenceDate = new Date().toISOString().slice(0,10)) {
  if (!snapshot?.components?.length) return {subtotal:null, priceDate:null, priceComponents:[]};
  const age = (calendarDate(referenceDate) - calendarDate(snapshot.date)) / DAY_MS;
  const showAmounts = age >= 0 && age < PRICE_REFERENCE_DAYS &&
    snapshot.components.every(part => Number.isFinite(part.amount) && part.amount > 0);
  const subtotal = showAmounts ? snapshot.components.reduce((sum, part) =>
    sum + Math.round(part.amount * 100) * (part.quantity || 1), 0) / 100 : null;
  return {
    subtotal,
    priceDate: showAmounts ? snapshot.date : null,
    priceComponents: showAmounts ? snapshot.components :
      snapshot.components.map(({amount, ...link}) => link)
  };
}

// Use the visitor's ceiling as a planning signal. Keep every otherwise suitable model eligible.
export function compareBudgetReferences(a, b, request) {
  if (request.budgetStrict === false || !Number.isFinite(request.budget) || request.budget < 0) return 0;
  const earlierReferenceUnderCeiling = amount => Number.isFinite(amount) && amount <= request.budget;
  return Number(earlierReferenceUnderCeiling(b)) - Number(earlierReferenceUnderCeiling(a));
}
