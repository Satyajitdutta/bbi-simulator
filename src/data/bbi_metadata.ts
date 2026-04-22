/**
 * BBI Simulator - Industry Metadata Library
 * Contains categorized competencies, behavioral DNA options, and team dynamic templates.
 */

export const COMP_LIBRARY: Record<string, any> = {
  /* --- GCC & GLOBAL LEADERSHIP --- */
  crossCultural: {
    id: "crossCultural", label: "Cross-Cultural Collaboration", short: "Cross-Cultural",
    category: "GCC Leadership", icon: "🌐",
    research: "Earley & Ang (2003): Cultural Intelligence (CQ) directly predicts cross-border team performance. Leaders high in CQ produce 35% better outcomes.",
    bos: { 1: "No cultural awareness.", 2: "Acknowledged gap, didn't bridge it.", 3: "Partial resolution.", 4: "Rebuilt trust, shared rhythm.", 5: "Built durable cross-cultural operating model." }
  },
  strategicValue: {
    id: "strategicValue", label: "Strategic Value Creation", short: "Strategic Value",
    category: "GCC Leadership", icon: "📈",
    research: "Deloitte (2023): Differentiator is translating operational execution into board-level strategic narrative.",
    bos: { 1: "Purely operational focus.", 2: "Recognized gap, no strategy.", 3: "Partial buy-in.", 4: "Successfully repositioned team.", 5: "Transformed unit identity." }
  },
  ambiguity: {
    id: "ambiguity", label: "Navigating Ambiguity & Autonomy", short: "Ambiguity",
    category: "GCC Leadership", icon: "🧭",
    research: "De Meuse et al. (2010): Change agility is the strongest predictor of senior leadership potential.",
    bos: { 1: "Froze or waited.", 2: "Communicated uncertainty.", 3: "Acted on some decisions.", 4: "Confident, defensible decisions.", 5: "Created decision framework." }
  },

  /* --- PRODUCT & ENGINEERING --- */
  decisiveAction: {
    id: "decisiveAction", label: "Decisive Action Under Pressure", short: "Decisiveness",
    category: "Product & Engineering", icon: "⚡",
    research: "Klein (1999): Expert leaders use recognition-primed decision-making under crisis.",
    bos: { 1: "Could not make a call.", 2: "Decided with significant delay.", 3: "Reasonable call.", 4: "Fast, well-reasoned decision.", 5: "Courgeous call, full ownership." }
  },
  customerEmpathy: {
    id: "customerEmpathy", label: "Customer Empathy & Product Passion", short: "Customer Focus",
    category: "Product & Engineering", icon: "💡",
    research: "Christensen (2016): Understanding the 'job' customers hire the product to do.",
    bos: { 1: "Defended output despite evidence.", 2: "Acknowledged problem, no engagement.", 3: "Incremental changes.", 4: "Engaged users directly.", 5: "Redesigned from user perspective." }
  },
  technicalScoping: {
    id: "technicalScoping", label: "Complexity & Technical Scoping", short: "Scoping",
    category: "Product & Engineering", icon: "🛠️",
    research: "Brooks (1975): Mythical Man-Month. Leaders who understand irreducible complexity avoid catastrophic delivery failures.",
    bos: { 1: "Underestimated complexity wildly.", 2: "Recognized risk, no mitigation.", 3: "Added padding, no scoping change.", 4: "Modularized for risk reduction.", 5: "Simplified original problem to deliver 80% value in 50% time." }
  },

  /* --- BFSI (Banking, Financial Services & Insurance) --- */
  riskFiduciary: {
    id: "riskFiduciary", label: "Fiduciary Risk Ownership", short: "Risk Ownership",
    category: "BFSI & FinTech", icon: "🏦",
    research: "Basel III Guidelines: Effective risk culture requires 'Tone at the Top'. Leaders who model risk ownership reduce credit losses by 15%.",
    bos: { 1: "Ignored risk for speed/profit.", 2: "Recognized risk, deferred to process.", 3: "Followed letter of law, missed spirit.", 4: "Proactive mitigation, balanced growth.", 5: "Built durable risk-first growth model." }
  },
  digitalTrust: {
    id: "digitalTrust", label: "Building Digital Trust", short: "Digital Trust",
    category: "BFSI & FinTech", icon: "🔒",
    research: "Edelman Trust Barometer (2024): Security is the #1 driver of bank loyalty. Leaders must bridge technical security and customer confidence.",
    bos: { 1: "Compromised security for UX.", 2: "Failed to articulate safety to users.", 3: "Generic security measures.", 4: "Transformed security into a UX feature.", 5: "Pioneered industry-leading trust standards." }
  },

  /* --- BPO & CUSTOMER SUCCESS --- */
  operationalExcellence: {
    id: "operationalExcellence", label: "Hyper-Scale Operational Excellence", short: "OpEx",
    category: "BPO & Mid-to-Large Ent.", icon: "⚙️",
    research: "Lean Six Sigma: Leaders who master variance reduction achieve 40% higher margin in BPO environments.",
    bos: { 1: "High variance, inconsistent delivery.", 2: "Managed by fire-fighting.", 3: "Stable delivery, no improvement.", 4: "Measurable variance reduction.", 5: "Redesigned engine for 0-defect scale." }
  },
  emotionalResilience: {
    id: "emotionalResilience", label: "Emotional Resilience & Stamina", short: "Resilience",
    category: "BPO & Mid-to-Large Ent.", icon: "🧘",
    research: "Maslach Burnout Inventory: Leaders who model resilience prevent secondary trauma in high-volume customer roles.",
    bos: { 1: "Mirrorred customer anger.", 2: "Internalized stress, withdrew.", 3: "Maintained professional mask.", 4: "De-escalated and recovered rapidly.", 5: "Built team 'bounce-back' rituals." }
  },

  /* --- UNIVERSAL LEADERSHIP --- */
  talentDevelopment: {
    id: "talentDevelopment", label: "Talent Development & Coaching", short: "Coaching",
    category: "Universal", icon: "🌱",
    research: "Gallup (2016): Manager coaching is the strongest predictor of engagement.",
    bos: { 1: "No coaching.", 2: "Had conversation, no diagnosis.", 3: "Identified blocker.", 4: "Individualized plan.", 5: "Transformed trajectory." }
  },
  changeLeadership: {
    id: "changeLeadership", label: "Managing Transformational Change", short: "Change",
    category: "Universal", icon: "🔄",
    research: "Kotter (1996): Leaders achieving 70% higher adoption by balancing urgency and safety.",
    bos: { 1: "Resisted change.", 2: "Communicated, didn't lead.", 3: "Managed transition.", 4: "Adopted fully with narrative.", 5: "Made change a team identity." }
  },
  ethicalJudgment: {
    id: "ethicalJudgment", label: "Ethical Judgment & Integrity", short: "Ethics",
    category: "Universal", icon: "🛡️",
    research: "Treviño (2000): Leaders model behavior under pressure, not just policy.",
    bos: { 1: "No consideration.", 2: "Deferred entirely.", 3: "Accepted compromise.", 4: "Stood firm on principle.", 5: "Set new ethical precedent." }
  }
};

export const CAT_META: Record<string, { accent: string; bg: string; tag: string }> = {
  "GCC Leadership": { accent: "#4da6ff", bg: "rgba(77,166,255,0.08)", tag: "GCC" },
  "BFSI & FinTech": { accent: "#fbbf24", bg: "rgba(251,191,36,0.08)", tag: "BFSI" },
  "Product & Engineering": { accent: "#4dffaa", bg: "rgba(77,255,170,0.08)", tag: "Prod/Eng" },
  "BPO & Mid-to-Large Ent.": { accent: "#f472b6", bg: "rgba(244,114,182,0.08)", tag: "Enterprise" },
  "Universal": { accent: "#ffaa4d", bg: "rgba(255,170,77,0.08)", tag: "Universal" },
};

/* --- BEHAVIORAL DNA (LAYER 1) --- */
export const DNA_CATEGORIES = [
  {
    id: "execution",
    label: "Execution & Results",
    options: [
      { id: "action_bias", label: "Bias for Action", value: "We value speed over perfect consensus. 80% confident is 100% ready to ship." },
      { id: "results_only", label: "Results-Only Environment", value: "Output is the only currency. Face-time and 'effort' are secondary to measurable KPIs." },
      { id: "extreme_ownership", label: "Extreme Ownership", value: "No excuses. Every leader owns the failure of their team and the success of their neighbors." }
    ]
  },
  {
    id: "innovation",
    label: "Innovation & Agility",
    options: [
      { id: "customer_obsessed", label: "Customer Obsession", value: "Every decision starts with the user. If it doesn't move the needle for them, we don't build it." },
      { id: "fail_forward", label: "Fail Forward Mindset", value: "Mistakes are expected. Hidden mistakes are unacceptable. We institutionalize learnings from failure." },
      { id: "first_principles", label: "First Principles Thinking", value: "We challenge every 'Industry Standard'. We build from the ground up, not by analogy." }
    ]
  },
  {
    id: "culture",
    label: "Collaboration & Trust",
    options: [
      { id: "radical_candor", label: "Radical Candor", value: "We challenge directly and care personally. Silence during a bad idea is a breach of duty." },
      { id: "servant_leadership", label: "Servant Leadership", value: "Leaders exist to clear blockers for their teams. The CEO is at the bottom of the pyramid." },
      { id: "psych_safety", label: "Psychological Safety", value: "Interpersonal risk-taking is the norm. No one is punished for asking 'stupid' questions or raising risks." }
    ]
  }
];

/* --- TEAM DYNAMICS (LAYER 4) --- */
export const TEAM_DYNAMIC_TEMPLATES = [
  {
    id: "stages",
    label: "Development Stages",
    options: [
      { id: "storming", label: "The Storming Startup", value: "High passion, high friction. Roles are ambiguous, communication is reactive, and conflict is frequent but authentic." },
      { id: "norming", label: "The Formed Elite", value: "Roles are clear, trust is high, and the team moves in a synchronized rhythm with minimal oversight." },
      { id: "performing", label: "The Scaled Machine", value: "Highly process-driven, low variance, focus on efficiency over experimentation. Extremely stable but slow to pivot." }
    ]
  },
  {
    id: "vibe",
    label: "Team Vibe & Culture",
    options: [
      { id: "autonomy", label: "The Autonomous Rebels", value: "Highly skilled individuals who hate micromanagement. Great for innovation, tough for top-down alignment." },
      { id: "siloed", label: "The Siloed Specialists", value: "Brilliant in their lanes, but struggle to see the big picture. Requires a leader who can act as a master-translator." },
      { id: "high_pressure", label: "The High-Pressure Boiler", value: "Ambitious targets, tight deadlines, competitive atmosphere. Needs a leader who can manage burnout while keeping the pace." }
    ]
  }
];
