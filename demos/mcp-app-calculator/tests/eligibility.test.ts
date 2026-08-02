import { describe, expect, it } from "vitest";
import { checkReverseMortgageEligibility, pct } from "../src/shared/eligibility.js";

describe("pct", () => {
  it("interpolates between anchor points", () => {
    expect(pct(60)).toBeCloseTo(0.215);
    expect(pct(70)).toBeCloseTo(0.35);
    expect(pct(80)).toBeCloseTo(0.485);
  });

  it("caps at 55% for ages above 85", () => {
    expect(pct(85)).toBe(0.55);
    expect(pct(92)).toBe(0.55);
  });
});

describe("checkReverseMortgageEligibility", () => {
  it("returns an eligible estimate", () => {
    expect(checkReverseMortgageEligibility({ age: 65, homeValue: 750000, province: "ON" })).toEqual({
      eligible: true,
      pct: 0.28,
      estimatedAmount: 210000,
    });
  });

  it("returns age as the ineligible reason", () => {
    expect(checkReverseMortgageEligibility({ age: 54, homeValue: 750000, province: "ON" })).toEqual({
      eligible: false,
      reason: "age",
    });
  });

  it("returns location as the ineligible reason", () => {
    expect(checkReverseMortgageEligibility({ age: 65, homeValue: 750000, province: "OTHER" })).toEqual({
      eligible: false,
      reason: "location",
    });
  });

  it("prioritizes age when both age and location fail", () => {
    expect(checkReverseMortgageEligibility({ age: 42, homeValue: 750000, province: "OTHER" })).toEqual({
      eligible: false,
      reason: "age",
    });
  });

  it("serializes to structured JSON text for hosts without UI support", () => {
    const json = JSON.stringify(checkReverseMortgageEligibility({ age: 75, homeValue: 800000, province: "BC" }));
    expect(JSON.parse(json)).toEqual({
      eligible: true,
      pct: 0.42,
      estimatedAmount: 336000,
    });
  });
});
