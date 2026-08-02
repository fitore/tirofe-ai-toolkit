export const supportedProvinces = ["ON", "BC", "AB", "QC"];
export const allProvinces = [...supportedProvinces, "OTHER"];
const anchors = [
    { age: 55, pct: 0.15 },
    { age: 65, pct: 0.28 },
    { age: 75, pct: 0.42 },
    { age: 85, pct: 0.55 },
];
export function isSupportedProvince(province) {
    return supportedProvinces.includes(province);
}
// This curve is an illustrative placeholder informed by publicly available industry ranges, not a government or lender-published figure - CMHC confirms only the 55% ceiling and the 55+ eligibility floor.
export function pct(age) {
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
export function checkReverseMortgageEligibility(input) {
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
