export type TaskStep = { id: string; title: string; detail: string; status: "pending" | "active" | "done" | "blocked" };

export function makePlan(prompt: string): TaskStep[] {
  const lower = prompt.toLowerCase();
  const steps: TaskStep[] = [
    { id: "understand", title: "Request समझना", detail: "आपके goal और constraints को स्पष्ट करना", status: "active" },
    { id: "plan", title: "Action plan बनाना", detail: "काम को छोटे, verifiable steps में तोड़ना", status: "pending" },
  ];
  if (lower.includes("file") || lower.includes("folder") || lower.includes("फाइल") || lower.includes("फोल्डर")) {
    steps.push({ id: "workspace", title: "Workspace inspect करना", detail: "केवल selected local files की read-only जाँच", status: "pending" });
  } else if (lower.includes("research") || lower.includes("search") || lower.includes("रिसर्च")) {
    steps.push({ id: "research", title: "Research scope तैयार करना", detail: "इस MVP में external browsing से पहले permission माँगी जाएगी", status: "pending" });
  } else {
    steps.push({ id: "execute", title: "Safe execution", detail: "स्थानीय model और अनुमत tools से काम करना", status: "pending" });
  }
  steps.push({ id: "verify", title: "Result verify करना", detail: "जो मिला उसे short summary में दिखाना", status: "pending" });
  return steps;
}

export async function runDemoPlan(steps: TaskStep[], onUpdate: (steps: TaskStep[]) => void) {
  let next = steps.map((step, index) => ({ ...step, status: index === 0 ? "active" : "pending" as TaskStep["status"] }));
  onUpdate(next);
  for (let index = 0; index < next.length; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 420));
    next = next.map((step, i) => ({ ...step, status: i < index + 1 ? "done" : i === index + 1 ? "active" : "pending" }));
    onUpdate(next);
  }
  return next;
}
