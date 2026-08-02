export const supportedProvinces = ["ON", "BC", "AB", "QC"] as const;
export const allProvinces = [...supportedProvinces, "OTHER"] as const;

export type SupportedProvince = (typeof supportedProvinces)[number];
export type Province = (typeof allProvinces)[number];

export type EligibilityInput = {
  age: number;
  homeValue: number;
  province: Province;
};

export type IneligibleResult = {
  eligible: false;
  reason: "age" | "location";
};

export type EligibleResult = {
  eligible: true;
  pct: number;
  estimatedAmount: number;
};

export type EligibilityResult = EligibleResult | IneligibleResult;

const anchors = [
  { age: 55, pct: 0.15 },
  { age: 65, pct: 0.28 },
  { age: 75, pct: 0.42 },
  { age: 85, pct: 0.55 },
] as const;

export function isSupportedProvince(province: Province): province is SupportedProvince {
  return supportedProvinces.includes(province as SupportedProvince);
}

// This curve is an illustrative placeholder informed by publicly available industry ranges, not a government or lender-published figure - CMHC confirms only the 55% ceiling and the 55+ eligibility floor.
export function pct(age: number): number {
  if (age >= 85) {
    return 0.55;
  }

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const lower = anchors[index];
    const upper = anchors[index + 1];

    if (age >= lower.age && age <= upper.age) {
      const span = upper.age - lower.age;
      const progress = (age - lower.age) / span;
      return lower.pct + progress * (upper.pct - lower.pct);
    }
  }

  return anchors[0].pct;
}

export function checkReverseMortgageEligibility(input: EligibilityInput): EligibilityResult {
  if (input.age < 55) {
    return { eligible: false, reason: "age" };
  }

  if (!isSupportedProvince(input.province)) {
    return { eligible: false, reason: "location" };
  }

  const percent = pct(input.age);

  return {
    eligible: true,
    pct: percent,
    estimatedAmount: Number((input.homeValue * percent).toFixed(2)),
  };
}
