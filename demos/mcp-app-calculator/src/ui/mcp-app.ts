import { App } from "@modelcontextprotocol/ext-apps";

type Province = "ON" | "BC" | "AB" | "QC" | "OTHER";

type EligibilityInput = {
  age: number;
  homeValue: number;
  province: Province;
};

type EligibilityResult =
  | { eligible: false; reason: "age" | "location" }
  | { eligible: true; pct: number; estimatedAmount: number };

const form = document.querySelector<HTMLFormElement>("#eligibility-form")!;
const ageInput = document.querySelector<HTMLInputElement>("#age")!;
const homeValueInput = document.querySelector<HTMLInputElement>("#homeValue")!;
const provinceInput = document.querySelector<HTMLSelectElement>("#province")!;
const resultEl = document.querySelector<HTMLElement>("#result")!;
const submitButton = document.querySelector<HTMLButtonElement>("#submit")!;

if (!form || !ageInput || !homeValueInput || !provinceInput || !resultEl || !submitButton) {
  throw new Error("Eligibility UI failed to initialize.");
}

const app = new App({ name: "Reverse Mortgage Eligibility Demo", version: "0.1.0" });
app.connect();

app.ontoolresult = (result) => {
  const parsed = parseToolResult(result);
  if (parsed) {
    renderResult(parsed);
  }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = readInput();

  submitButton.disabled = true;
  submitButton.textContent = "Checking...";
  resultEl.className = "result muted";
  resultEl.textContent = "Checking eligibility...";

  try {
    const result = await app.callServerTool({
      name: "check-reverse-mortgage-eligibility",
      arguments: input,
    });
    const parsed = parseToolResult(result);
    if (!parsed) {
      throw new Error("The server returned an unreadable result.");
    }
    renderResult(parsed);
  } catch (error) {
    resultEl.className = "result error";
    resultEl.textContent = error instanceof Error ? error.message : "Something went wrong.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Check eligibility";
  }
});

function readInput(): EligibilityInput {
  return {
    age: Number(ageInput.value),
    homeValue: Number(homeValueInput.value),
    province: provinceInput.value as Province,
  };
}

function parseToolResult(result: unknown): EligibilityResult | null {
  const content = (result as { content?: Array<{ type?: string; text?: string }> }).content ?? [];
  const text = content.find((item) => item.type === "text")?.text;
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as EligibilityResult;
  } catch {
    return null;
  }
}

function renderResult(result: EligibilityResult): void {
  if (!result.eligible) {
    const message =
      result.reason === "age"
        ? "Not eligible: the illustrative demo requires a borrower age of at least 55."
        : "Not eligible: this illustrative demo only supports ON, BC, AB, and QC.";

    resultEl.className = "result not-eligible";
    resultEl.innerHTML = `<strong>Not eligible</strong><p>${message}</p>`;
    return;
  }

  const percent = new Intl.NumberFormat("en-CA", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(result.pct);
  const amount = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(result.estimatedAmount);

  resultEl.className = "result eligible";
  resultEl.innerHTML = `
    <strong>Eligible in this demo</strong>
    <p class="amount">${amount}</p>
    <p class="estimate-line">Illustrative estimate only. Not affiliated with or representative of any real lender's rates.</p>
    <p class="detail">Placeholder percentage: ${percent}</p>
  `;
}

const style = document.createElement("style");
style.textContent = `
  :root {
    color: #1f2933;
    background: #f7f8f6;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  .shell {
    min-height: 100vh;
    padding: 24px;
  }

  .panel {
    max-width: 620px;
    margin: 0 auto;
    padding: 24px;
    border: 1px solid #d9ded7;
    border-radius: 8px;
    background: #ffffff;
  }

  .kicker {
    margin: 0 0 6px;
    color: #59636f;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
  }

  h1 {
    margin: 0 0 22px;
    color: #102032;
    font-size: 28px;
    line-height: 1.15;
  }

  .form {
    display: grid;
    gap: 16px;
  }

  label {
    display: grid;
    gap: 7px;
    font-weight: 650;
  }

  input,
  select {
    width: 100%;
    min-height: 44px;
    border: 1px solid #b8c1bb;
    border-radius: 6px;
    padding: 9px 11px;
    color: #102032;
    background: #ffffff;
    font: inherit;
  }

  button {
    min-height: 44px;
    border: 0;
    border-radius: 6px;
    padding: 10px 14px;
    color: #ffffff;
    background: #1c6b5a;
    font: inherit;
    font-weight: 750;
    cursor: pointer;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  .result {
    margin-top: 18px;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #d7dcd6;
    background: #f9faf8;
  }

  .result:empty {
    display: none;
  }

  .result p {
    margin: 8px 0 0;
  }

  .eligible {
    border-color: #8bb7a7;
    background: #eef8f3;
  }

  .not-eligible,
  .error {
    border-color: #e2b2a8;
    background: #fff4f0;
  }

  .amount {
    color: #0c352c;
    font-size: 34px;
    line-height: 1.1;
    font-weight: 800;
  }

  .estimate-line {
    color: #284b43;
    font-weight: 650;
  }

  .detail,
  .muted {
    color: #59636f;
  }

  @media (max-width: 520px) {
    .shell {
      padding: 14px;
    }

    .panel {
      padding: 18px;
    }

    h1 {
      font-size: 23px;
    }

    .amount {
      font-size: 28px;
    }
  }
`;
document.head.append(style);
