"use strict";

const gateNames = ["AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR"];
const gateExpressions = {
  AND: "Output = A AND B",
  OR: "Output = A OR B",
  NOT: "Output = NOT A",
  NAND: "Output = NOT (A AND B)",
  NOR: "Output = NOT (A OR B)",
  XOR: "Output = A XOR B",
  XNOR: "Output = NOT (A XOR B)",
};
const gateState = { a: 1, b: 0 };

function showPage(name) {
  const target = document.querySelector(`[data-page-section="${name}"]`);
  if (!target) return;
  document.querySelectorAll("[data-page-section]").forEach((page) => {
    const active = page === target;
    page.hidden = !active;
    page.classList.toggle("active", active);
  });
  document.querySelectorAll(".nav-item").forEach((item) => {
    const active = item.dataset.page === name;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  const nav = document.querySelector(`.nav-item[data-page="${name}"]`);
  document.querySelector("#current-page-name").textContent = nav
    ? nav.textContent.replace(nav.querySelector(".nav-icon").textContent, "").trim()
    : "Dashboard";
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeSidebar() {
  document.querySelector("#sidebar").classList.remove("open");
  document.querySelector("#sidebar-scrim").classList.remove("visible");
  document.querySelector("#mobile-menu").setAttribute("aria-expanded", "false");
  document.querySelector("#mobile-menu").setAttribute("aria-label", "Open navigation");
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});
document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(link.dataset.pageLink);
  });
});
document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.go));
});
document.querySelector("#mobile-menu").addEventListener("click", () => {
  const isOpen = document.querySelector("#sidebar").classList.toggle("open");
  document.querySelector("#sidebar-scrim").classList.toggle("visible", isOpen);
  document.querySelector("#mobile-menu").setAttribute("aria-expanded", String(isOpen));
  document.querySelector("#mobile-menu").setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});
document.querySelector("#sidebar-scrim").addEventListener("click", closeSidebar);

function evaluateGate(name, a, b) {
  switch (name) {
    case "AND": return a & b;
    case "OR": return a | b;
    case "NOT": return 1 - a;
    case "NAND": return 1 - (a & b);
    case "NOR": return 1 - (a | b);
    case "XOR": return a ^ b;
    case "XNOR": return 1 - (a ^ b);
    default: throw new Error(`Unknown gate: ${name}`);
  }
}

function gateRows(name) {
  return name === "NOT" ? [[0, null], [1, null]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
}

function renderTruthTable(container, name, highlight) {
  const rows = gateRows(name);
  const headers = name === "NOT" ? ["A", "Output"] : ["A", "B", "Output"];
  const table = document.createElement("table");
  table.className = "truth-table";
  table.innerHTML = `<thead><tr>${headers.map((header) => `<th scope="col">${header}</th>`).join("")}</tr></thead>`;
  const body = document.createElement("tbody");
  rows.forEach(([a, b]) => {
    const output = evaluateGate(name, a, b ?? 0);
    const row = document.createElement("tr");
    if (highlight && a === highlight.a && (name === "NOT" || b === highlight.b)) row.classList.add("current-row");
    const values = name === "NOT" ? [a, output] : [a, b, output];
    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = String(value);
      row.append(cell);
    });
    body.append(row);
  });
  table.append(body);
  container.replaceChildren(table);
}

function gateSvg(name, a, b, output) {
  const twoInput = name !== "NOT";
  const shape = {
    AND: '<path class="gate-shape" d="M142 49 H190 A51 51 0 0 1 190 151 H142 Z"/>',
    OR: '<path class="gate-shape" d="M140 49 Q179 100 140 151 Q205 151 242 100 Q205 49 140 49 Z"/>',
    NOT: '<path class="gate-shape" d="M155 51 L155 149 L243 100 Z"/><circle class="gate-shape" cx="253" cy="100" r="10"/>',
    NAND: '<path class="gate-shape" d="M142 49 H182 A51 51 0 0 1 182 151 H142 Z"/><circle class="gate-shape" cx="243" cy="100" r="10"/>',
    NOR: '<path class="gate-shape" d="M140 49 Q179 100 140 151 Q196 151 222 100 Q196 49 140 49 Z"/><circle class="gate-shape" cx="233" cy="100" r="10"/>',
    XOR: '<path class="gate-shape" d="M150 49 Q189 100 150 151 Q215 151 252 100 Q215 49 150 49 Z"/><path class="gate-shape" d="M137 49 Q176 100 137 151"/>',
    XNOR: '<path class="gate-shape" d="M143 49 Q182 100 143 151 Q198 151 224 100 Q198 49 143 49 Z"/><path class="gate-shape" d="M130 49 Q169 100 130 151"/><circle class="gate-shape" cx="235" cy="100" r="10"/>',
  }[name];
  const gateEnd = name === "AND" ? 241 : name === "OR" ? 242 : name === "NOT" ? 263 : name === "NAND" ? 253 : name === "NOR" ? 243 : name === "XOR" ? 252 : 245;
  const inputLines = twoInput
    ? `<path class="wire ${a ? "hot" : ""}" d="M27 76 H142"/><path class="wire ${b ? "hot" : ""}" d="M27 124 H142"/><text x="8" y="80">A=${a}</text><text x="8" y="128">B=${b}</text>`
    : `<path class="wire ${a ? "hot" : ""}" d="M27 100 H155"/><text x="8" y="92">A=${a}</text>`;
  return `<svg class="gate-svg" viewBox="0 0 380 200" role="img" aria-label="${name} gate diagram"><path class="wire ${output ? "hot" : ""}" d="M${gateEnd} 100 H345"/><text class="${output ? "output-hot" : ""}" x="350" y="104">Y=${output}</text>${inputLines}${shape}<text x="162" y="187">${name} GATE</text></svg>`;
}

function updateGate() {
  const name = document.querySelector("#gate-select").value;
  const output = evaluateGate(name, gateState.a, gateState.b);
  document.querySelector("#gate-a-value").textContent = String(gateState.a);
  document.querySelector("#gate-b-value").textContent = String(gateState.b);
  document.querySelector("#gate-a").setAttribute("aria-checked", String(gateState.a));
  document.querySelector("#gate-b").setAttribute("aria-checked", String(gateState.b));
  document.querySelector("#gate-b-row").hidden = name === "NOT";
  document.querySelector("#gate-expression").textContent = gateExpressions[name];
  document.querySelector("#gate-diagram-title").textContent = `${name} gate`;
  document.querySelector("#gate-diagram").innerHTML = gateSvg(name, gateState.a, gateState.b, output);
  document.querySelector("#gate-output-label").textContent = String(output);
  const lamp = document.querySelector("#gate-lamp");
  lamp.classList.toggle("is-on", output === 1);
  lamp.setAttribute("aria-label", `Output is ${output}`);
  renderTruthTable(document.querySelector("#gate-truth-table"), name, gateState);
  const truthSelect = document.querySelector("#truth-gate-select");
  truthSelect.value = name;
  updateFullTruthTable();
}

function updateFullTruthTable() {
  const name = document.querySelector("#truth-gate-select").value;
  renderTruthTable(document.querySelector("#truth-table"), name, gateState);
  document.querySelector("#truth-table-hint").textContent = name === "NOT"
    ? "For NOT, the highlighted row matches input A from the Logic Gates page."
    : "The highlighted row matches your current Logic Gates inputs.";
}

document.querySelector("#gate-select").addEventListener("change", updateGate);
document.querySelector("#truth-gate-select").addEventListener("change", (event) => {
  document.querySelector("#gate-select").value = event.target.value;
  updateGate();
});
for (const [id, key] of [["gate-a", "a"], ["gate-b", "b"]]) {
  document.querySelector(`#${id}`).addEventListener("click", () => {
    gateState[key] = 1 - gateState[key];
    updateGate();
  });
}
updateGate();

function validateBinary(value) {
  return /^[01]+$/.test(value);
}

function convertBinary() {
  const input = document.querySelector("#binary-input");
  const error = document.querySelector("#binary-error");
  const binary = input.value.trim();
  if (!validateBinary(binary)) {
    error.textContent = "Please enter a binary number using only 0 and 1.";
    input.setAttribute("aria-invalid", "true");
    for (const id of ["result-decimal", "result-octal", "result-hex", "result-gray"]) {
      document.querySelector(`#${id}`).textContent = "—";
    }
    document.querySelector("#binary-steps").textContent = "Enter a valid binary number to see the conversion steps.";
    return;
  }
  input.removeAttribute("aria-invalid");
  error.textContent = "";
  const value = BigInt(`0b${binary}`);
  const gray = value ^ (value >> 1n);
  const grayText = gray.toString(2).padStart(binary.length, "0");
  document.querySelector("#result-decimal").textContent = value.toString(10);
  document.querySelector("#result-octal").textContent = value.toString(8);
  document.querySelector("#result-hex").textContent = value.toString(16).toUpperCase();
  document.querySelector("#result-gray").textContent = grayText;
  const terms = [...binary].reverse().map((bit, index) => `${bit}×2${index ? `<sup>${index}</sup>` : "<sup>0</sup>"}`);
  document.querySelector("#binary-steps").innerHTML = `${binary}<sub>2</sub> = ${terms.join(" + ")} = ${value.toString(10)}<sub>10</sub>`;
}

function convertDecimal() {
  const input = document.querySelector("#decimal-input");
  const error = document.querySelector("#decimal-error");
  const text = input.value.trim();
  if (!/^\d+$/.test(text)) {
    error.textContent = "Enter a non-negative whole number using decimal digits.";
    input.setAttribute("aria-invalid", "true");
    document.querySelector("#decimal-binary-result").textContent = "—";
    document.querySelector("#decimal-steps").textContent = "Enter a valid decimal integer to see the conversion steps.";
    return;
  }
  input.removeAttribute("aria-invalid");
  error.textContent = "";
  const value = BigInt(text);
  const binary = value.toString(2);
  document.querySelector("#decimal-binary-result").textContent = binary;
  document.querySelector("#decimal-steps").textContent = value === 0n
    ? "0 in decimal is 0 in binary."
    : `${value.toString(10)} ÷ 2 remainders, read upward: ${binary}₂`;
}

document.querySelector("#convert-binary").addEventListener("click", convertBinary);
document.querySelector("#binary-input").addEventListener("input", convertBinary);
document.querySelector("#convert-decimal").addEventListener("click", convertDecimal);
document.querySelector("#decimal-input").addEventListener("input", convertDecimal);
document.querySelector("#send-binary-to-complement").addEventListener("click", () => {
  const binary = document.querySelector("#decimal-binary-result").textContent;
  document.querySelector("#complement-input").value = binary;
  calculateComplement();
  showPage("complement");
});
convertBinary();
convertDecimal();

function calculateComplement() {
  const input = document.querySelector("#complement-input");
  const error = document.querySelector("#complement-error");
  const binary = input.value.trim();
  if (!validateBinary(binary)) {
    error.textContent = "Enter a binary number using only 0 and 1.";
    input.setAttribute("aria-invalid", "true");
    document.querySelector("#complement-original").textContent = "—";
    document.querySelector("#ones-complement").textContent = "—";
    document.querySelector("#twos-complement").textContent = "—";
    return;
  }
  input.removeAttribute("aria-invalid");
  error.textContent = "";
  const ones = [...binary].map((bit) => bit === "0" ? "1" : "0").join("");
  const twos = (BigInt(`0b${ones}`) + 1n).toString(2).padStart(binary.length, "0").slice(-binary.length);
  document.querySelector("#complement-original").textContent = binary;
  document.querySelector("#ones-complement").textContent = ones;
  document.querySelector("#twos-complement").textContent = twos;
}
document.querySelector("#calculate-complement").addEventListener("click", calculateComplement);
document.querySelector("#complement-input").addEventListener("input", calculateComplement);
calculateComplement();

const adderTips = {
  half: "<strong>Half adder:</strong> adds two single bits. It has no carry-in input.",
  full: "<strong>Full adder:</strong> adds two bits and an incoming carry, producing a sum and carry-out.",
  ripple: "<strong>Ripple carry:</strong> each full adder passes its carry to the next bit position.",
  cla: "<strong>Carry look-ahead:</strong> expanded generate/propagate equations calculate carries without waiting for a ripple chain.",
};
let adderMode = "half";

function setAdderMode(mode) {
  adderMode = mode;
  document.querySelectorAll("[data-adder-mode]").forEach((tab) => {
    const active = tab.dataset.adderMode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-adder-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.adderPanel !== mode;
  });
  document.querySelector("#adder-tip").innerHTML = adderTips[mode];
}
document.querySelectorAll("[data-adder-mode]").forEach((tab) => tab.addEventListener("click", () => setAdderMode(tab.dataset.adderMode)));

document.querySelectorAll("[data-bit-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const next = button.getAttribute("aria-pressed") === "1" ? "0" : "1";
    button.setAttribute("aria-pressed", next);
    button.textContent = next;
  });
});
document.querySelector("#calculate-half").addEventListener("click", () => {
  const a = Number(document.querySelector("#half-a").textContent);
  const b = Number(document.querySelector("#half-b").textContent);
  document.querySelector("#half-sum").textContent = String(a ^ b);
  document.querySelector("#half-carry").textContent = String(a & b);
});
document.querySelector("#calculate-full").addEventListener("click", () => {
  const a = Number(document.querySelector("#full-a").textContent);
  const b = Number(document.querySelector("#full-b").textContent);
  const cin = Number(document.querySelector("#full-cin").textContent);
  const total = a + b + cin;
  document.querySelector("#full-sum").textContent = String(total & 1);
  document.querySelector("#full-carry").textContent = String(total >> 1);
});

function calculateRipple() {
  const aText = document.querySelector("#ripple-a").value;
  const bText = document.querySelector("#ripple-b").value;
  const error = document.querySelector("#ripple-error");
  if (!/^[01]{4}$/.test(aText) || !/^[01]{4}$/.test(bText)) {
    error.textContent = "Enter exactly four binary digits (0 or 1) for both A and B.";
    document.querySelector("#ripple-a").setAttribute("aria-invalid", "true");
    document.querySelector("#ripple-b").setAttribute("aria-invalid", "true");
    document.querySelector("#ripple-diagram").replaceChildren();
    document.querySelector("#ripple-sum").textContent = "—";
    document.querySelector("#ripple-carry").textContent = "—";
    document.querySelector("#ripple-decimal").textContent = "—";
    return;
  }
  error.textContent = "";
  document.querySelector("#ripple-a").removeAttribute("aria-invalid");
  document.querySelector("#ripple-b").removeAttribute("aria-invalid");
  const a = [...aText].reverse().map(Number);
  const b = [...bText].reverse().map(Number);
  const carries = [0];
  const sums = [];
  // Each full adder consumes the previous stage's carry, forming the ripple chain.
  for (let i = 0; i < 4; i += 1) {
    const total = a[i] + b[i] + carries[i];
    sums[i] = total & 1;
    carries[i + 1] = total >> 1;
  }
  const binarySum = sums.slice().reverse().join("");
  const diagram = document.querySelector("#ripple-diagram");
  const stages = [];
  for (let i = 0; i < 4; i += 1) {
    stages.push(`<div class="fa-stage"><strong>FA${i}</strong><span>A${i}=${a[i]} · B${i}=${b[i]}</span><span>Cin=${carries[i]} <b class="fa-sum">S=${sums[i]}</b></span><span>Cout=${carries[i + 1]}</span></div>`);
    if (i < 3) stages.push(`<span class="fa-link ${carries[i + 1] ? "active" : ""}">C${i + 1} →</span>`);
  }
  stages.push(`<span class="fa-link ${carries[4] ? "active" : ""}">Cout = ${carries[4]}</span>`);
  diagram.innerHTML = stages.join("");
  document.querySelector("#ripple-sum").textContent = binarySum;
  document.querySelector("#ripple-carry").textContent = String(carries[4]);
  document.querySelector("#ripple-decimal").textContent = String(Number.parseInt(aText, 2) + Number.parseInt(bText, 2));
  document.querySelector("#ripple-explanation").textContent = `Starting with C₀ = 0, carries are C₁=${carries[1]}, C₂=${carries[2]}, C₃=${carries[3]}, and C₄=${carries[4]}. The 4-bit sum is ${binarySum}.`;
}
document.querySelector("#calculate-ripple").addEventListener("click", calculateRipple);
for (const id of ["ripple-a", "ripple-b"]) document.querySelector(`#${id}`).addEventListener("input", calculateRipple);
calculateRipple();

function calculateCla() {
  const aText = document.querySelector("#cla-a").value;
  const bText = document.querySelector("#cla-b").value;
  const cin = Number(document.querySelector("#cla-cin").value);
  const error = document.querySelector("#cla-error");
  if (!/^[01]{4}$/.test(aText) || !/^[01]{4}$/.test(bText)) {
    error.textContent = "Enter exactly four binary digits (0 or 1) for both A and B.";
    document.querySelector("#cla-a").setAttribute("aria-invalid", "true");
    document.querySelector("#cla-b").setAttribute("aria-invalid", "true");
    document.querySelector("#cla-binary").textContent = "—";
    document.querySelector("#cla-decimal").textContent = "—";
    return;
  }
  error.textContent = "";
  document.querySelector("#cla-a").removeAttribute("aria-invalid");
  document.querySelector("#cla-b").removeAttribute("aria-invalid");
  const a = [...aText].reverse().map(Number);
  const b = [...bText].reverse().map(Number);
  const g = a.map((bit, i) => bit & b[i]);
  const p = a.map((bit, i) => bit ^ b[i]);
  const c = [cin];
  // These expanded equations calculate each carry directly from G, P, and C0.
  c[1] = g[0] | (p[0] & c[0]);
  c[2] = g[1] | (p[1] & g[0]) | (p[1] & p[0] & c[0]);
  c[3] = g[2] | (p[2] & g[1]) | (p[2] & p[1] & g[0]) | (p[2] & p[1] & p[0] & c[0]);
  c[4] = g[3] | (p[3] & g[2]) | (p[3] & p[2] & g[1]) | (p[3] & p[2] & p[1] & g[0]) | (p[3] & p[2] & p[1] & p[0] & c[0]);
  const sum = p.map((bit, i) => bit ^ c[i]).reverse().join("");
  const fullResult = `${c[4]}${sum}`;
  document.querySelector("#cla-binary").textContent = fullResult;
  document.querySelector("#cla-decimal").textContent = String(Number.parseInt(aText, 2) + Number.parseInt(bText, 2) + cin);
  document.querySelector("#cla-g").textContent = g.slice().reverse().join("");
  document.querySelector("#cla-p").textContent = p.slice().reverse().join("");
  document.querySelector("#cla-c").textContent = c.slice(1).join(" ");
}
document.querySelector("#calculate-cla").addEventListener("click", calculateCla);
for (const id of ["cla-a", "cla-b"]) document.querySelector(`#${id}`).addEventListener("input", calculateCla);
document.querySelector("#cla-cin").addEventListener("change", calculateCla);
calculateCla();
