# Specification

## Summary
**Goal:** Build a crypto portfolio app where users sign in with Internet Identity, manage manual holdings, see live prices, and view performance metrics with a cohesive non-blue/purple theme.

**Planned changes:**
- Add Internet Identity authentication gating so users must sign in to access portfolio features, with persistent sessions and sign-out.
- Implement CRUD for user-entered crypto holdings (asset identifier, quantity, optional cost basis) persisted per authenticated user in a single Motoko actor.
- Fetch live crypto prices from a public external API to compute per-holding current value and total portfolio value, with a clear error state and session-level last-known prices.
- Calculate and display per-asset and total gains/losses (amount and %) for holdings with cost basis; mark and exclude non-cost-basis holdings from gain/loss calculations.
- Add at least one simple performance visualization that updates on holdings changes and price refresh.
- Apply a cohesive, responsive visual theme across screens (avoiding blue/purple as primary palette).
- Add and reference generated static image assets (logo and subtle hero/background) from `frontend/public/assets/generated`.

**User-visible outcome:** Signed-in users can add/edit/delete manual crypto holdings, see live prices and total portfolio value, view gains/losses and a simple chart, and use the app with consistent styling plus a custom logo and background graphic.
