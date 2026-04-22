/**
 * BBI Simulator -- Enterprise Data Library
 * Consulting-grade competency framework, behavioral DNA, and team dynamic templates.
 * 47 competencies | 8 categories | 20 industries | 8 DNA categories | 6 team dynamic categories
 */

/* ======================================================================
   COMPETENCY LIBRARY
====================================================================== */
export const COMP_LIBRARY: Record<string, any> = {

  /* -- GCC & GLOBAL LEADERSHIP (6) ------------------------------------ */
  crossCultural: {
    id: "crossCultural", label: "Cross-Cultural Collaboration", short: "Cross-Cultural",
    category: "GCC Leadership", icon: "Globe2",
    research: "Earley & Ang (2003): Cultural Intelligence (CQ) directly predicts cross-border team performance. Leaders high in CQ produce 35% better outcomes in globally distributed environments.",
    bos: {
      1: "Displayed no awareness of cultural differences; assumed a single operating norm.",
      2: "Acknowledged the cultural gap but made no meaningful attempt to bridge it.",
      3: "Attempted mediation with partial success; some tension remained unresolved.",
      4: "Rebuilt trust and created a shared operating rhythm that both sides adopted.",
      5: "Built a durable cross-cultural operating model that scaled beyond the immediate team."
    }
  },
  strategicValue: {
    id: "strategicValue", label: "Strategic Value Creation", short: "Strategic Value",
    category: "GCC Leadership", icon: "TrendingUp",
    research: "Deloitte GCC Report (2023): The primary differentiator between cost-centre GCCs and strategic assets is the ability to translate operational execution into a board-level narrative.",
    bos: {
      1: "Operated exclusively in execution mode with no strategic framing.",
      2: "Recognised the strategic gap but produced no narrative or repositioning effort.",
      3: "Created some buy-in from regional leadership; HQ remained unconvinced.",
      4: "Successfully repositioned the team as a strategic partner with measurable impact.",
      5: "Transformed the unit's identity from cost centre to innovation engine, validated by revenue impact."
    }
  },
  ambiguity: {
    id: "ambiguity", label: "Navigating Ambiguity & Autonomy", short: "Ambiguity",
    category: "GCC Leadership", icon: "Compass",
    research: "De Meuse et al. (2010): Change agility -- the ability to act decisively without complete information -- is the strongest single predictor of senior leadership potential.",
    bos: {
      1: "Froze under ambiguity; waited for explicit instruction before any action.",
      2: "Communicated the uncertainty upward but did not attempt resolution.",
      3: "Made some decisions independently; escalated others unnecessarily.",
      4: "Made confident, well-reasoned decisions with clear accountability.",
      5: "Created a decision-making framework for the team to operate autonomously in future uncertainty."
    }
  },
  globalStakeholder: {
    id: "globalStakeholder", label: "Global Stakeholder Influence", short: "Stakeholder Influence",
    category: "GCC Leadership", icon: "Network",
    research: "Spencer Stuart (2022): Senior GCC leaders who master distributed influence -- persuading without positional authority -- outperform peers by 2.3x on strategic initiative delivery.",
    bos: {
      1: "Relied solely on hierarchy; could not influence without formal authority.",
      2: "Attempted influence but was routinely bypassed or overruled.",
      3: "Built some informal credibility; influence was inconsistent across stakeholders.",
      4: "Consistently moved key stakeholders to action through evidence and relationship capital.",
      5: "Became the trusted advisor across multiple geographies, shaping decisions before they were formally made."
    }
  },
  offshoreOnshore: {
    id: "offshoreOnshore", label: "Offshore-Onshore Partnership", short: "Offshore Partnership",
    category: "GCC Leadership", icon: "Link2",
    research: "NASSCOM (2024): The single biggest failure mode in GCC leadership is the inability to build genuine parity between offshore and onshore teams, leading to talent exodus and capability erosion.",
    bos: {
      1: "Treated the offshore team as a vendor, not a partner.",
      2: "Paid lip service to parity without changing structural or behavioural patterns.",
      3: "Improved some collaboration but failed to address underlying power imbalances.",
      4: "Created genuine parity in visibility, ownership, and recognition across locations.",
      5: "Redesigned the operating model so geography became irrelevant to career trajectory or decision-making."
    }
  },
  coeBuild: {
    id: "coeBuild", label: "Centre of Excellence Building", short: "CoE Building",
    category: "GCC Leadership", icon: "Building2",
    research: "Korn Ferry (2023): GCC leaders who successfully establish Centres of Excellence reduce time-to-capability by 60% and attract 40% higher-calibre talent than those operating in siloed structures.",
    bos: {
      1: "Built a functional team but no centre of knowledge or reusable capability.",
      2: "Proposed a CoE structure but failed to get organisational buy-in.",
      3: "Created a functioning CoE with limited scope and incomplete adoption.",
      4: "Delivered a fully operational CoE with clear intake, delivery, and governance processes.",
      5: "Built a CoE that became a competitive differentiator, cited by the business as a primary value driver."
    }
  },

  /* -- PRODUCT & ENGINEERING (7) -------------------------------------- */
  decisiveAction: {
    id: "decisiveAction", label: "Decisive Action Under Pressure", short: "Decisiveness",
    category: "Product & Engineering", icon: "Zap",
    research: "Klein (1999): Expert leaders use recognition-primed decision-making under crisis conditions, acting on pattern recognition rather than exhaustive analysis.",
    bos: {
      1: "Could not make a call; sought escalation or deferred to group consensus.",
      2: "Made a decision with significant delay, by which point options had narrowed.",
      3: "Made a reasonable call under pressure with acceptable but suboptimal outcomes.",
      4: "Made a fast, well-reasoned decision, communicated it clearly, and owned the outcome.",
      5: "Made a courageous, contrarian call that proved correct; took full ownership regardless of outcome."
    }
  },
  customerEmpathy: {
    id: "customerEmpathy", label: "Customer Empathy & Product Passion", short: "Customer Focus",
    category: "Product & Engineering", icon: "Heart",
    research: "Christensen (2016): Understanding the 'job' customers hire a product to do -- rather than demographic or feature preferences -- is the only reliable predictor of product-market fit.",
    bos: {
      1: "Defended output despite clear user evidence to the contrary.",
      2: "Acknowledged the problem but engaged no users to understand the root cause.",
      3: "Made incremental adjustments based on surface-level feedback.",
      4: "Engaged users directly to understand the job-to-be-done and redesigned accordingly.",
      5: "Rebuilt the product hypothesis from first principles based on deep user insight, with measurable outcome improvement."
    }
  },
  technicalScoping: {
    id: "technicalScoping", label: "Complexity & Technical Scoping", short: "Scoping",
    category: "Product & Engineering", icon: "Wrench",
    research: "Brooks (1975): Leaders who understand irreducible complexity -- and distinguish it from accidental complexity -- avoid the catastrophic delivery failures caused by over-optimistic planning.",
    bos: {
      1: "Wildly underestimated complexity; plan was disconnected from technical reality.",
      2: "Recognised the risk but applied no meaningful mitigation to the plan.",
      3: "Added time padding without revisiting scope or architectural decisions.",
      4: "Modularised the problem to reduce coupling and isolate delivery risk.",
      5: "Simplified the original problem to deliver 80% of the value in 50% of the time with a fraction of the risk."
    }
  },
  dataDecision: {
    id: "dataDecision", label: "Data-Driven Decision Making", short: "Data Decisions",
    category: "Product & Engineering", icon: "BarChart3",
    research: "McAfee & Brynjolfsson (2012): Organisations in the top third of data-driven decision making are 5% more productive and 6% more profitable than their competitors.",
    bos: {
      1: "Made decisions based purely on gut or seniority, ignoring available data.",
      2: "Referenced data superficially without interrogating the methodology or sample quality.",
      3: "Used data to confirm a prior hypothesis rather than to genuinely test it.",
      4: "Built a rigorous analytical framework to guide the decision, including confidence intervals and sensitivity analysis.",
      5: "Established a data culture -- defined the right metrics, built infrastructure to capture them, and embedded evidence-based review into team rituals."
    }
  },
  platformThinking: {
    id: "platformThinking", label: "Platform & Architecture Thinking", short: "Platform Thinking",
    category: "Product & Engineering", icon: "Layers",
    research: "Parker, Van Alstyne & Choudary (2016): Platform businesses grow 2x faster than pipeline businesses. Leaders who think in platforms -- not features -- create compounding competitive moats.",
    bos: {
      1: "Built point solutions with no consideration of reusability, extensibility, or ecosystem potential.",
      2: "Recognised the need for a platform approach but did not change architectural decisions.",
      3: "Created some reusable components but failed to design for external consumption.",
      4: "Architected a true internal platform with clear APIs, ownership model, and consumer teams.",
      5: "Built a platform that attracted external developers or partners, creating a genuine ecosystem and network effect."
    }
  },
  aiIntegration: {
    id: "aiIntegration", label: "AI/ML Product Integration", short: "AI Integration",
    category: "Product & Engineering", icon: "Bot",
    research: "McKinsey Global AI Survey (2024): Only 22% of AI pilots reach production. Leaders who fail to bridge the gap between ML experimentation and product integration waste 78% of AI investment.",
    bos: {
      1: "Confused AI capability with AI readiness; the model was never deployable in a real product context.",
      2: "Shipped an AI feature without feedback loops, monitoring, or model decay management.",
      3: "Integrated an AI model with basic performance tracking but no governance or explainability.",
      4: "Shipped a production-grade AI feature with monitoring, fallback logic, and human oversight built in.",
      5: "Designed an end-to-end AI product system -- from data pipeline to deployment to continuous retraining -- that delivered compounding business value over time."
    }
  },
  zeroToOne: {
    id: "zeroToOne", label: "Zero-to-One Product Launch", short: "0 to 1 Launch",
    category: "Product & Engineering", icon: "Rocket",
    research: "Thiel (2014): Zero-to-One creation is fundamentally different from 1-to-N scaling. Most product leaders are trained for the latter; the ability to create from nothing is rare and differentiating.",
    bos: {
      1: "Could not function without existing structure, templates, or processes to follow.",
      2: "Started building without validating core assumptions, leading to a technically correct but market-irrelevant output.",
      3: "Built a functional MVP but without a clear path to retention, monetisation, or scale.",
      4: "Validated the core hypothesis, built an MVP with paying users, and established a credible growth thesis.",
      5: "Launched a product from zero that achieved product-market fit with measurable retention and a self-reinforcing growth loop."
    }
  },

  /* -- BFSI & FINTECH (6) --------------------------------------------- */
  riskFiduciary: {
    id: "riskFiduciary", label: "Fiduciary Risk Ownership", short: "Risk Ownership",
    category: "BFSI & FinTech", icon: "Landmark",
    research: "Basel III Guidelines: Effective risk culture requires Tone at the Top. Leaders who model risk ownership behaviourally -- not just in policy -- reduce credit losses by 15-25%.",
    bos: {
      1: "Ignored or minimised risk signals in pursuit of speed or profit.",
      2: "Recognised the risk but deferred entirely to the risk management process without personal leadership.",
      3: "Followed the letter of the framework but missed the spirit; risk was managed but not owned.",
      4: "Proactively identified and mitigated risk while maintaining a credible growth agenda.",
      5: "Built a durable, risk-first growth model that became a benchmark for the division."
    }
  },
  digitalTrust: {
    id: "digitalTrust", label: "Building Digital Trust", short: "Digital Trust",
    category: "BFSI & FinTech", icon: "Lock",
    research: "Edelman Trust Barometer (2024): Security is the #1 driver of bank loyalty. Leaders who transform technical security into a client confidence narrative outperform peers by 3x on NPS.",
    bos: {
      1: "Compromised security posture for speed of delivery or UX convenience.",
      2: "Failed to translate technical security into language clients could understand or trust.",
      3: "Implemented generic security measures without a client-facing trust narrative.",
      4: "Transformed security into a competitive UX differentiator, actively marketed to clients.",
      5: "Pioneered industry-leading digital trust standards adopted across the organisation or sector."
    }
  },
  regulatoryLeadership: {
    id: "regulatoryLeadership", label: "Regulatory & Compliance Leadership", short: "Regulatory",
    category: "BFSI & FinTech", icon: "FileText",
    research: "PwC RegTech Survey (2024): Leaders who treat compliance as a competitive advantage -- not a cost -- achieve 28% faster product launches and 40% fewer regulatory penalties.",
    bos: {
      1: "Viewed compliance as a blocker; sought workarounds that created downstream risk.",
      2: "Complied reactively after regulatory prompting rather than proactively.",
      3: "Maintained compliance but created no competitive differentiation from it.",
      4: "Used regulatory mastery to accelerate product launches and build regulator relationships.",
      5: "Turned regulatory compliance into a core business asset -- enabling products competitors could not offer."
    }
  },
  capitalAllocation: {
    id: "capitalAllocation", label: "Capital Allocation & ROI Discipline", short: "Capital Discipline",
    category: "BFSI & FinTech", icon: "DollarSign",
    research: "Buffett (1987): Capital allocation is the most critical, and most overlooked, senior leadership skill in financial institutions. The ability to distinguish between good and great investment opportunities determines long-term returns.",
    bos: {
      1: "Made investment decisions based on politics, relationships, or HiPPO (highest paid person's opinion).",
      2: "Applied basic ROI analysis but ignored risk-adjusted returns, time value, or opportunity cost.",
      3: "Made defensible capital decisions but failed to communicate the strategic rationale to stakeholders.",
      4: "Built a rigorous capital allocation framework with clear hurdle rates, portfolio logic, and post-investment review.",
      5: "Created a capital allocation system that became a repeatable competitive advantage, consistently generating superior risk-adjusted returns."
    }
  },
  fraudPrevention: {
    id: "fraudPrevention", label: "Financial Crime & Fraud Prevention", short: "Financial Crime",
    category: "BFSI & FinTech", icon: "ShieldAlert",
    research: "ACFE (2024): Organisations with proactive fraud leadership lose 50% less to fraud than those with reactive systems. The leadership differentiator is cultural, not technological.",
    bos: {
      1: "Treated fraud prevention as a back-office function with no personal leadership ownership.",
      2: "Responded to fraud incidents without building systematic prevention capabilities.",
      3: "Implemented standard controls but failed to build a fraud-aware culture.",
      4: "Built a detection-and-prevention system with cultural accountability at every level.",
      5: "Created a fraud prevention culture so strong it was cited as a model by the regulator."
    }
  },
  openBanking: {
    id: "openBanking", label: "Open Banking & Ecosystem Strategy", short: "Open Banking",
    category: "BFSI & FinTech", icon: "GitBranch",
    research: "McKinsey (2023): Banks that embrace open banking grow API revenue 4x faster and acquire 2.5x more digital-native customers than those treating APIs as compliance obligations.",
    bos: {
      1: "Built APIs purely for regulatory compliance with no ecosystem or monetisation strategy.",
      2: "Recognised the ecosystem opportunity but failed to build the internal capability or partnerships.",
      3: "Launched a basic developer portal but failed to attract meaningful third-party adoption.",
      4: "Built an active developer ecosystem with measurable partner revenue and customer acquisition.",
      5: "Positioned the bank as a platform -- creating a marketplace of financial services that generated compounding network effects."
    }
  },

  /* -- BPO & MID-TO-LARGE ENTERPRISE (5) ------------------------------ */
  operationalExcellence: {
    id: "operationalExcellence", label: "Hyper-Scale Operational Excellence", short: "OpEx",
    category: "BPO & Mid-to-Large Ent.", icon: "Settings2",
    research: "Lean Six Sigma / Toyota Production System: Leaders who master variance reduction achieve 40% higher margin in BPO environments. The defining skill is building systems that improve themselves.",
    bos: {
      1: "Operations were characterised by high variance, fire-fighting, and inconsistent delivery.",
      2: "Managed crises effectively but built no durable improvement mechanisms.",
      3: "Achieved stable delivery with no measurable efficiency improvement over time.",
      4: "Delivered measurable variance reduction with clear process ownership at every level.",
      5: "Re-engineered the entire delivery engine to achieve zero-defect scale -- with the team itself owning continuous improvement."
    }
  },
  emotionalResilience: {
    id: "emotionalResilience", label: "Emotional Resilience & Stamina", short: "Resilience",
    category: "BPO & Mid-to-Large Ent.", icon: "Brain",
    research: "Maslach Burnout Inventory & Dutton (2003): Leaders who model resilience rituals -- not just resilience rhetoric -- prevent secondary trauma contagion in high-volume, high-pressure customer roles.",
    bos: {
      1: "Mirrored customer or team anxiety, amplifying rather than absorbing the stress.",
      2: "Internalised stress and withdrew; team had no leadership anchor in difficult periods.",
      3: "Maintained professional composure but failed to actively support team morale.",
      4: "De-escalated high-pressure situations rapidly and created psychological safety for the team in moments of crisis.",
      5: "Built team 'bounce-back' rituals and cultural norms that made resilience a structural property, not a personal burden."
    }
  },
  processReengineering: {
    id: "processReengineering", label: "Process Re-Engineering & Automation", short: "Process Design",
    category: "BPO & Mid-to-Large Ent.", icon: "RefreshCw",
    research: "Hammer & Champy (1993): The fundamental rethinking and radical redesign of business processes produces dramatic performance improvements. Leaders who do this boldly, not incrementally, create lasting advantage.",
    bos: {
      1: "Optimised within existing process constraints; never questioned the underlying design.",
      2: "Identified re-engineering opportunities but failed to drive adoption against resistance.",
      3: "Successfully automated tactical tasks without redesigning the end-to-end workflow.",
      4: "Re-engineered a core process from first principles, achieving >30% efficiency gain.",
      5: "Created a reusable re-engineering capability -- a team, methodology, and toolset that transformed multiple processes systematically."
    }
  },
  slaGovernance: {
    id: "slaGovernance", label: "SLA Governance & Client Relationship", short: "SLA Governance",
    category: "BPO & Mid-to-Large Ent.", icon: "ClipboardList",
    research: "Accenture (2022): Client retention in BPO is driven 70% by relationship quality and proactive communication, not purely SLA metrics. Leaders who treat SLAs as conversation-starters, not report cards, retain 40% more accounts.",
    bos: {
      1: "Managed SLAs as a reporting obligation rather than a client relationship tool.",
      2: "Met SLA metrics contractually but failed to proactively communicate risk or insight.",
      3: "Managed within SLA with occasional proactive communication.",
      4: "Used SLA governance as a strategic trust-building mechanism -- pre-empting issues and delivering insight beyond the contract.",
      5: "Transformed the client relationship from a vendor model to a strategic partnership -- evidenced by scope expansion and contract renewal with improved terms."
    }
  },
  workforcePlanning: {
    id: "workforcePlanning", label: "Workforce Planning at Scale", short: "Workforce Planning",
    category: "BPO & Mid-to-Large Ent.", icon: "Users",
    research: "SHRM (2023): Leaders who master demand-based workforce planning reduce excess labour cost by 22% and cut attrition by 18% through better role clarity and career architecture.",
    bos: {
      1: "Reactive hiring and firing based on immediate demand signals with no forward planning.",
      2: "Created headcount plans that did not account for skills obsolescence or attrition rates.",
      3: "Maintained a stable workforce but failed to optimise for skill mix or succession depth.",
      4: "Built a dynamic workforce plan linked to business forecasts, with clear skill development roadmaps.",
      5: "Created a workforce planning system that became a business capability -- with predictive models for demand, supply, and attrition used by multiple functions."
    }
  },

  /* -- HEALTHCARE & LIFE SCIENCES (5) --------------------------------- */
  patientSafety: {
    id: "patientSafety", label: "Patient Safety & Clinical Risk Leadership", short: "Patient Safety",
    category: "Healthcare & Life Sciences", icon: "Activity",
    research: "Kohn et al. (1999): 'To Err is Human' -- preventable medical errors cause 44,000-98,000 deaths annually. Safety culture, driven by leadership behaviour, is the only durable prevention mechanism.",
    bos: {
      1: "Treated safety as a compliance function; no personal accountability for near-misses or incidents.",
      2: "Responded to safety incidents reactively without building systemic prevention.",
      3: "Maintained safety standards but failed to create a culture of proactive near-miss reporting.",
      4: "Built a zero-harm culture with psychological safety for reporting, rigorous RCA, and systemic process improvement.",
      5: "Created a patient safety culture that was externally recognised and became a benchmark for peer institutions."
    }
  },
  regulatoryFDA: {
    id: "regulatoryFDA", label: "Regulatory Navigation (FDA / CE / CDSCO)", short: "Regulatory Nav.",
    category: "Healthcare & Life Sciences", icon: "FileCheck",
    research: "Deloitte Life Sciences (2023): Regulatory strategy is the primary determinant of time-to-market. Leaders who build regulatory intelligence early reduce approval timelines by an average of 18 months.",
    bos: {
      1: "Treated regulatory submission as an end-of-development activity; caused major delays.",
      2: "Managed regulatory milestones but lacked a proactive strategy for engaging the agency.",
      3: "Met regulatory requirements on time with a competent but reactive approach.",
      4: "Built a regulatory strategy that engaged the FDA / CE body early, anticipating objections and accelerating review.",
      5: "Established a regulatory excellence function that became a competitive moat -- consistently achieving first-cycle approvals and setting precedent for novel product pathways."
    }
  },
  rdCollaboration: {
    id: "rdCollaboration", label: "Cross-Functional R&D Leadership", short: "R&D Leadership",
    category: "Healthcare & Life Sciences", icon: "Microscope",
    research: "Boston Consulting Group (2022): Pharmaceutical R&D productivity is driven by cross-functional team integration. Leaders who break silos between clinical, regulatory, and commercial functions reduce asset failure rates by 30%.",
    bos: {
      1: "Operated in a functional silo; clinical, regulatory, and commercial teams rarely interacted.",
      2: "Attempted cross-functional coordination but lacked the authority or mandate to sustain it.",
      3: "Created functional working groups but failed to build shared accountability or integrated planning.",
      4: "Led a genuinely cross-functional programme with integrated timelines, shared decision rights, and unified accountability.",
      5: "Redesigned the operating model for R&D cross-functionality -- reducing cycle times and asset attrition through early, integrated decision-making."
    }
  },
  healthOutcomes: {
    id: "healthOutcomes", label: "Value-Based Care & Health Outcomes", short: "Value-Based Care",
    category: "Healthcare & Life Sciences", icon: "Pill",
    research: "Porter & Lee (2013): The strategy that will fix healthcare -- measuring outcomes for every patient to enable value improvement. Leaders who embrace this model deliver 25% better patient outcomes at 20% lower cost.",
    bos: {
      1: "Measured activity (procedures, bed-days) with no connection to patient outcomes.",
      2: "Acknowledged the shift to value-based care but made no operational changes.",
      3: "Began capturing outcome data but failed to use it for care pathway improvement.",
      4: "Redesigned care pathways around measurable patient outcomes, linking clinician incentives to value delivery.",
      5: "Built a value-based care model that demonstrated superior outcomes, attracted payer partnerships, and became replicable at network scale."
    }
  },
  digitalHealth: {
    id: "digitalHealth", label: "Digital Health & MedTech Innovation", short: "Digital Health",
    category: "Healthcare & Life Sciences", icon: "Smartphone",
    research: "Rock Health (2024): Digital health adoption is dependent on clinical buy-in. The single biggest barrier is leadership that cannot bridge the gap between clinical evidence and technological possibility.",
    bos: {
      1: "Implemented digital health tools without clinical workflow integration -- abandoned within 3 months.",
      2: "Secured technology investment but failed to drive clinician adoption.",
      3: "Achieved moderate adoption with limited measurable clinical or efficiency impact.",
      4: "Deployed a digital health solution with strong clinician adoption, measurable outcomes, and an evidence base.",
      5: "Built a digital health innovation capability -- a pipeline of evidence-generating trials, clinician co-design, and scalable deployment across the care network."
    }
  },

  /* -- SALES & COMMERCIAL LEADERSHIP (4) ------------------------------ */
  enterpriseSales: {
    id: "enterpriseSales", label: "Enterprise Sales Strategy & Pipeline", short: "Enterprise Sales",
    category: "Sales & Commercial", icon: "Target",
    research: "Challenger Sale (Dixon & Adamson, 2011): 53% of customer loyalty is driven by the sales experience. The Challenger rep -- who teaches, tailors, and takes control -- outperforms the Relationship Builder by 60%.",
    bos: {
      1: "Pursued opportunities reactively with no portfolio strategy or pipeline discipline.",
      2: "Built a pipeline but lacked qualification rigour -- wasted resources on low-probability opportunities.",
      3: "Managed a healthy pipeline with consistent qualification but lacked a differentiated commercial narrative.",
      4: "Built a strategic pipeline with rigorous qualification, differentiated insight-selling, and predictable close rates.",
      5: "Designed a commercial machine -- territory strategy, sales methodology, cadence, and coaching -- that created a self-reinforcing growth engine."
    }
  },
  revenueGrowth: {
    id: "revenueGrowth", label: "Revenue Growth & Market Expansion", short: "Revenue Growth",
    category: "Sales & Commercial", icon: "LineChart",
    research: "Bain & Company (2023): Companies that consistently grow revenue 10%+ annually do so through three simultaneous engines: core market depth, adjacent market entry, and new-to-world innovation.",
    bos: {
      1: "Grew revenue incrementally by farming existing accounts with no new market strategy.",
      2: "Pursued adjacencies without the market intelligence or organisational capability to win there.",
      3: "Successfully entered one new market segment but at the cost of core market stability.",
      4: "Delivered measurable growth across core and adjacent segments simultaneously.",
      5: "Built a growth architecture -- market intelligence, commercial capability, and portfolio diversification -- that created sustained double-digit revenue growth."
    }
  },
  keyAccount: {
    id: "keyAccount", label: "Key Account Stewardship", short: "Key Accounts",
    category: "Sales & Commercial", icon: "Key",
    research: "SAMA (2023): Strategic Account Management leaders who move from reactive to proactive create 35% higher revenue per account and reduce churn by 47% through co-created value roadmaps.",
    bos: {
      1: "Managed key accounts transactionally -- responded to requests, no proactive value creation.",
      2: "Built strong personal relationships but without a structured account development strategy.",
      3: "Created an account plan but failed to execute it consistently or engage at the executive level.",
      4: "Managed a multi-stakeholder account strategy with measurable NPS improvement and scope expansion.",
      5: "Co-created a multi-year value roadmap with the client -- becoming a strategic advisor embedded in their planning cycle."
    }
  },
  pricingPower: {
    id: "pricingPower", label: "Pricing Power & Value Articulation", short: "Pricing",
    category: "Sales & Commercial", icon: "Gem",
    research: "McKinsey (2022): A 1% improvement in price realisation generates 8-12x more profit than equivalent volume growth. Leaders who build pricing discipline and value articulation create durable margin advantage.",
    bos: {
      1: "Defaulted to discounting as the primary tool to win or retain business.",
      2: "Attempted to hold price but capitulated under mild customer pushback.",
      3: "Maintained pricing discipline in standard situations but struggled against sophisticated procurement.",
      4: "Built a value articulation framework that consistently justified premium pricing against alternatives.",
      5: "Created pricing power as an organisational capability -- methodology, training, tools, and governance -- that improved margin across the entire portfolio."
    }
  },

  /* -- DIGITAL & TECHNOLOGY LEADERSHIP (4) ---------------------------- */
  digitalTransformation: {
    id: "digitalTransformation", label: "Digital Transformation Leadership", short: "Digital Transf.",
    category: "Digital & Technology", icon: "Globe",
    research: "MIT Sloan (2023): 70% of digital transformations fail. The primary cause is leadership -- specifically the inability to simultaneously manage cultural change, technical migration, and business continuity.",
    bos: {
      1: "Launched a digital initiative as a technology project, ignoring the change management dimension.",
      2: "Managed the technology migration but lost the people transformation; adoption collapsed post-launch.",
      3: "Delivered transformation milestones on time but without measurable business outcome improvement.",
      4: "Led a transformation that delivered measurable ROI on both efficiency and revenue dimensions within 12 months.",
      5: "Created a transformation that fundamentally changed the organisation's operating model -- with the capability to self-renew continuously, not just reach a fixed end-state."
    }
  },
  cybersecurity: {
    id: "cybersecurity", label: "Cybersecurity & Resilience Leadership", short: "Cybersecurity",
    category: "Digital & Technology", icon: "ShieldCheck",
    research: "IBM Cost of a Data Breach (2024): The average breach costs $4.88M. Leaders who build security into culture -- not just tooling -- reduce breach probability by 62% and response time by 74%.",
    bos: {
      1: "Treated cybersecurity as an IT function with no personal leadership accountability.",
      2: "Responded to a security incident without building durable prevention or recovery capability.",
      3: "Implemented standard security controls but without a tested incident response plan.",
      4: "Built a security-aware culture with documented and tested incident response -- demonstrated through a simulated breach exercise.",
      5: "Created a security-first organisation where every employee understood their role in cyber resilience -- achieving industry-leading threat detection and sub-hour incident response times."
    }
  },
  dataStrategy: {
    id: "dataStrategy", label: "Enterprise Data Strategy & Governance", short: "Data Strategy",
    category: "Digital & Technology", icon: "Database",
    research: "Gartner (2024): 85% of big data projects fail due to poor data governance. Leaders who treat data as a product -- with ownership, quality SLAs, and a consumer orientation -- generate 3x the analytics ROI.",
    bos: {
      1: "Data was fragmented, inconsistently defined, and ungovernanced -- analytics were distrusted.",
      2: "Built a data warehouse without a governance framework; data quality degraded within months.",
      3: "Implemented data governance policies but without adoption incentives or cultural change.",
      4: "Launched a data-as-a-product model with clear ownership, quality metrics, and consumer feedback loops.",
      5: "Built an enterprise data capability that became a strategic asset -- enabling real-time decision-making, AI readiness, and a data marketplace consumed across all business units."
    }
  },
  cloudStrategy: {
    id: "cloudStrategy", label: "Cloud Strategy & Infrastructure Leadership", short: "Cloud Strategy",
    category: "Digital & Technology", icon: "Cloud",
    research: "Flexera (2024): 32% of cloud spend is wasted. Leaders who move from lift-and-shift to cloud-native architecture achieve 45% cost reduction and 3x faster time-to-market.",
    bos: {
      1: "Executed a lift-and-shift migration with no architectural modernisation -- inheriting all legacy constraints.",
      2: "Adopted cloud but failed to optimise for cost, performance, or architectural fitness.",
      3: "Achieved a functional cloud migration with moderate cost optimisation.",
      4: "Delivered a cloud-native architecture migration with measurable cost reduction and developer velocity improvement.",
      5: "Built a cloud centre of excellence -- methodology, tooling, and talent -- that systematically modernised the entire application portfolio at speed."
    }
  },

  /* -- UNIVERSAL LEADERSHIP (10) -------------------------------------- */
  talentDevelopment: {
    id: "talentDevelopment", label: "Talent Development & Coaching", short: "Coaching",
    category: "Universal", icon: "Sprout",
    research: "Gallup (2016): Manager coaching quality is the strongest single predictor of employee engagement. Engaged employees generate 23% higher profitability.",
    bos: {
      1: "Provided no meaningful coaching or development investment in team members.",
      2: "Had conversations about performance but failed to diagnose root causes or create action plans.",
      3: "Identified the development blocker but lacked the skill or commitment to address it.",
      4: "Created an individualised development plan with clear milestones and consistent follow-through.",
      5: "Transformed the trajectory of a team member -- demonstrated by a measurable step-change in capability, confidence, and output."
    }
  },
  changeLeadership: {
    id: "changeLeadership", label: "Managing Transformational Change", short: "Change",
    category: "Universal", icon: "RefreshCcw",
    research: "Kotter (1996): Leaders who create urgency and safety simultaneously achieve 70% higher change adoption than those who rely on mandate alone.",
    bos: {
      1: "Resisted change or was a passive obstacle to its adoption.",
      2: "Communicated the change without providing leadership, safety, or a transition path.",
      3: "Managed the transition competently but failed to generate genuine buy-in or cultural shift.",
      4: "Led change with a clear narrative, psychological safety, and measurable adoption.",
      5: "Made the change a new team identity -- post-change performance exceeded pre-change baseline by a significant margin."
    }
  },
  ethicalJudgment: {
    id: "ethicalJudgment", label: "Ethical Judgment & Integrity", short: "Ethics",
    category: "Universal", icon: "Scale",
    research: "Trevino (2000): Ethical leadership requires both moral person and moral manager dimensions. Leaders are judged under pressure, not in policy documents.",
    bos: {
      1: "Made no ethical consideration when facing a pressure-test decision.",
      2: "Recognised the ethical dimension but fully deferred without offering a principled perspective.",
      3: "Raised the ethical concern but accepted a compromise that violated the core principle.",
      4: "Stood firm on the principled position under significant organisational or commercial pressure.",
      5: "Set a new ethical precedent that became embedded in how the organisation makes decisions."
    }
  },
  influenceWithoutAuthority: {
    id: "influenceWithoutAuthority", label: "Influencing Without Authority", short: "Influence",
    category: "Universal", icon: "Sparkles",
    research: "Cohen & Bradford (2005): Influence without authority requires a currency model -- understanding what each stakeholder values and building a genuine exchange. Leaders who master this move 3x faster in matrixed organisations.",
    bos: {
      1: "Could not move others to action without formal authority; relied entirely on positional power.",
      2: "Attempted influence through logic and data alone, failing to address political or emotional dimensions.",
      3: "Built some informal credibility but was inconsistently effective across different stakeholders.",
      4: "Consistently moved key stakeholders to action through deep understanding of their motivations and strategic framing.",
      5: "Became the gravitational centre of a cross-functional initiative -- a trusted convener whose influence outlasted any formal role."
    }
  },
  executivePresence: {
    id: "executivePresence", label: "Strategic Storytelling & Executive Presence", short: "Executive Presence",
    category: "Universal", icon: "Mic",
    research: "Hewlett (2014): Executive presence accounts for 26% of promotion decisions. The three dimensions -- communication, gravitas, and appearance -- can all be learned and deliberately improved.",
    bos: {
      1: "Communication was confusing, jargon-heavy, or inconsistent with the audience's level.",
      2: "Delivered content competently but without the gravitas, structure, or narrative that moves people to action.",
      3: "Communicated clearly but lacked the strategic framing to land the 'so what' with senior audiences.",
      4: "Delivered a clear, structured narrative that moved a senior audience from scepticism to alignment.",
      5: "Built a communication style that is consistently cited as a leadership differentiator -- shaping how the organisation understands its own strategy."
    }
  },
  highTrustTeams: {
    id: "highTrustTeams", label: "Building High-Trust Teams", short: "Trust Building",
    category: "Universal", icon: "Users2",
    research: "Lencioni (2002): The absence of trust is the foundational dysfunction from which all other team failures cascade. Leaders who create psychological safety generate 76% higher team engagement.",
    bos: {
      1: "Team was characterised by blame, defensiveness, and information hoarding.",
      2: "Attempted trust-building through social activities without addressing the structural causes of distrust.",
      3: "Improved interpersonal relationships but failed to build professional trust in capability and reliability.",
      4: "Built a team characterised by genuine psychological safety, vulnerability-based trust, and collective accountability.",
      5: "Created a team culture so strong it became self-reinforcing -- attracting talent and retaining it even under competitive external pressure."
    }
  },
  conflictResolution: {
    id: "conflictResolution", label: "Conflict Resolution & Negotiation", short: "Conflict",
    category: "Universal", icon: "Swords",
    research: "Ury & Fisher (1981): Getting to Yes -- principled negotiation produces better outcomes for all parties and builds durable relationships. Leaders who conflate negotiation with winning consistently destroy long-term value.",
    bos: {
      1: "Avoided conflict entirely or escalated it without attempting resolution.",
      2: "Attempted resolution but defaulted to compromise that left all parties dissatisfied.",
      3: "Resolved the surface-level conflict without addressing the underlying interests or structural cause.",
      4: "Facilitated a resolution that addressed both parties' underlying interests and rebuilt the working relationship.",
      5: "Transformed a destructive conflict into a productive creative tension -- the resolution strengthened the relationship and produced a better outcome than either party had originally sought."
    }
  },
  inclusiveLeadership: {
    id: "inclusiveLeadership", label: "Inclusive Leadership & Equity", short: "Inclusion",
    category: "Universal", icon: "HeartHandshake",
    research: "Deloitte (2022): Inclusive teams outperform non-inclusive teams by 80% in business decisions. The differentiator is the leadership behaviour of eliciting, amplifying, and acting on diverse perspectives.",
    bos: {
      1: "Demonstrated exclusionary behaviour -- conscious or unconscious -- that marginalised team members.",
      2: "Intended to be inclusive but failed to adapt behaviour -- defaulted to familiar voices and perspectives.",
      3: "Created surface-level inclusion but failed to build the structural conditions for equity.",
      4: "Actively elicited and acted on diverse perspectives, with measurable impact on team participation and outcomes.",
      5: "Built an inclusion system -- structural, behavioural, and measurement -- that was self-sustaining and created compounding diversity of thought."
    }
  },
  visionStrategy: {
    id: "visionStrategy", label: "Long-Range Vision & Strategy Setting", short: "Vision",
    category: "Universal", icon: "Telescope",
    research: "Collins & Porras (1994): Visionary companies outperform the market by 15x over 100 years. The distinguishing factor is a Big Hairy Audacious Goal backed by a coherent strategy, not a mission statement.",
    bos: {
      1: "Could not articulate a compelling vision beyond the current quarter's targets.",
      2: "Created a vision statement that was inspirational but not connected to a credible strategy.",
      3: "Developed a coherent strategy with a 3-year horizon but failed to create organisational energy around it.",
      4: "Set a compelling, long-range vision with a credible strategic path and measurable milestones that generated genuine organisational alignment.",
      5: "Created a BHAG (Big Hairy Audacious Goal) that became the defining organisational purpose -- visible in hiring decisions, product roadmaps, and daily behaviours across the organisation."
    }
  },
  crisisLeadership: {
    id: "crisisLeadership", label: "Crisis Leadership & Business Continuity", short: "Crisis",
    category: "Universal", icon: "AlertOctagon",
    research: "James & Wooten (2010): The leaders who emerge stronger from crises are those who treat them as signal amplifiers -- using the crisis to accelerate decisions that were already needed.",
    bos: {
      1: "Escalated the crisis without providing direction, safety, or a stabilisation plan.",
      2: "Managed the immediate operational response but failed to communicate, protect the team, or think beyond the crisis horizon.",
      3: "Stabilised the situation competently but missed the opportunity to use the crisis as a transformation catalyst.",
      4: "Led the crisis response with calm authority -- stabilising operations, protecting the team, communicating transparently, and identifying the strategic opportunity within the adversity.",
      5: "Transformed the crisis into an organisational accelerant -- using the momentum of disruption to make bold structural, cultural, or strategic changes that would otherwise have taken years."
    }
  },
};

/* ======================================================================
   CATEGORY METADATA
====================================================================== */
export const CAT_META: Record<string, { accent: string; bg: string; tag: string }> = {
  "GCC Leadership":             { accent: "#4da6ff",  bg: "rgba(77,166,255,0.08)",  tag: "GCC" },
  "BFSI & FinTech":             { accent: "#fbbf24",  bg: "rgba(251,191,36,0.08)",  tag: "BFSI" },
  "Product & Engineering":      { accent: "#4dffaa",  bg: "rgba(77,255,170,0.08)",  tag: "Prod/Eng" },
  "BPO & Mid-to-Large Ent.":    { accent: "#f472b6",  bg: "rgba(244,114,182,0.08)", tag: "Enterprise" },
  "Healthcare & Life Sciences": { accent: "#34d399",  bg: "rgba(52,211,153,0.08)",  tag: "Healthcare" },
  "Sales & Commercial":         { accent: "#fb7185",  bg: "rgba(251,113,133,0.08)", tag: "Sales" },
  "Digital & Technology":       { accent: "#a78bfa",  bg: "rgba(167,139,250,0.08)", tag: "Digital" },
  "Universal":                  { accent: "#ffaa4d",  bg: "rgba(255,170,77,0.08)",  tag: "Universal" },
};

/* ======================================================================
   INDUSTRY SECTORS (20)
====================================================================== */
export const INDUSTRIES = [
  "Technology / SaaS",
  "BFSI -- Banking, Financial Services & Insurance",
  "Healthcare & Life Sciences",
  "Pharmaceuticals & Biotech",
  "BPO & Customer Success",
  "Retail & E-commerce",
  "FMCG & Consumer Goods",
  "Manufacturing & Industrial",
  "Automotive & Electric Vehicles",
  "Energy & Utilities",
  "Telecom & Networks",
  "Media, Entertainment & Gaming",
  "Logistics & Supply Chain",
  "Real Estate & PropTech",
  "Education & EdTech",
  "Infrastructure & Construction",
  "Professional Services (Consulting / Legal / Accounting)",
  "Government & Public Sector",
  "Agriculture & AgroTech",
  "Non-Profit & Social Impact",
];

/* ======================================================================
   BEHAVIORAL DNA -- VISION LAYER 1
   industryTags: ["all"] = always shown | specific tags = shown when industry matches
====================================================================== */
export const DNA_CATEGORIES = [
  {
    id: "execution",
    label: "Execution & Results",
    industryTags: ["all"],
    options: [
      { id: "action_bias",         label: "Bias for Action",                value: "We value speed over perfect consensus. 80% confident is 100% ready to execute. Delay is a cost we consciously choose, not an inevitability we accept." },
      { id: "results_only",        label: "Results-Only Environment",        value: "Output is the only currency. Effort, presence, and enthusiasm are invisible until they translate into measurable outcomes." },
      { id: "extreme_ownership",   label: "Extreme Ownership",               value: "No excuses, no ambiguous accountability. Every leader owns the failure of their team and the success of their neighbours. The buck stops here." },
      { id: "okr_accountability",  label: "OKR-Driven Accountability",       value: "Our quarterly commitments are public contracts with the organisation. We review them weekly, adjust them transparently, and celebrate only when the outcome -- not the activity -- is delivered." },
      { id: "metrics_led",         label: "Metrics-Led Culture",             value: "We operate on a single source of truth. If you cannot define what success looks like in a number before you start, you are not ready to start." },
      { id: "zero_based_thinking", label: "Zero-Based Thinking",             value: "Every quarter, every team must justify its existence from outcomes, not from history. Sacred cows are routinely questioned. Nothing continues by default." },
    ]
  },
  {
    id: "innovation",
    label: "Innovation & Agility",
    industryTags: ["all"],
    options: [
      { id: "customer_obsessed",   label: "Customer Obsession",              value: "Every decision begins with a question about the customer. We do not build what we think is clever. We build what genuinely improves someone's life or work." },
      { id: "fail_forward",        label: "Fail Forward Mindset",            value: "Mistakes are budgeted. Hidden mistakes are a breach of culture. We de-brief every failure with honesty and institutionalise the learning before moving on." },
      { id: "first_principles",    label: "First Principles Thinking",       value: "We challenge every industry standard as a hypothesis, not a fact. We build from the ground up rather than copying what already exists." },
      { id: "continuous_exp",      label: "Continuous Experimentation",      value: "Every significant decision is preceded by a designed experiment with a hypothesis, a success metric, and a kill switch. We never scale what we have not tested." },
      { id: "platform_thinking",   label: "Platform Thinking",               value: "We build for others to build on. Every product decision asks: would another team want to consume this? We design APIs before interfaces." },
      { id: "deep_tech",           label: "Deep Tech Conviction",            value: "We invest in hard technology that takes years of commitment, not weeks of development. Long lead times are a competitive moat, not a liability." },
    ]
  },
  {
    id: "culture",
    label: "Collaboration & Trust",
    industryTags: ["all"],
    options: [
      { id: "radical_candor",      label: "Radical Candor",                  value: "We challenge directly because we care personally. Silence in the face of a bad idea is not politeness -- it is a failure of leadership." },
      { id: "servant_leadership",  label: "Servant Leadership",              value: "Leaders exist to remove obstacles for their teams. Our organisational pyramid is inverted. The most senior leader in the room is the most accountable for enabling everyone else." },
      { id: "psych_safety",        label: "Psychological Safety",            value: "Interpersonal risk-taking is the norm. We celebrate the surfacing of bad news early. Asking a 'stupid' question is a sign of courage, not weakness." },
      { id: "distributed_decision",label: "Distributed Decision-Making",     value: "Decisions are made at the lowest level capable of making them well. We do not escalate for approval -- we escalate for alignment on strategy, not for permission on tactics." },
      { id: "transparent_default", label: "Transparent by Default",          value: "Strategy, metrics, decisions, and mistakes are visible to the whole organisation by default. The default is to share. The exception must be justified." },
      { id: "deep_collab",         label: "Deep Collaboration Culture",      value: "Individual wins do not count if the team lost. Individual metrics are subordinate to shared outcomes. We celebrate collective wins relentlessly." },
    ]
  },
  {
    id: "bfsi_culture",
    label: "BFSI -- Risk & Compliance Culture",
    industryTags: ["BFSI", "FinTech", "Insurance", "Banking", "Financial"],
    options: [
      { id: "risk_adjusted_growth",  label: "Risk-Adjusted Growth",           value: "Every growth opportunity is evaluated through a risk lens before a commercial one. Revenue that creates unacceptable risk is not revenue -- it is liability creation." },
      { id: "compliance_moat",       label: "Compliance as Competitive Moat", value: "Regulatory mastery is a business strategy, not a cost centre. Institutions that lead compliance attract better capital, better clients, and better talent than those that merely follow it." },
      { id: "fiduciary_first",       label: "Fiduciary First",                value: "Client wealth protection is non-negotiable and supersedes short-term revenue targets. Any advice that does not withstand the fiduciary test is not given." },
      { id: "audit_mindset",         label: "Audit Mindset by Default",       value: "Every decision we make should survive scrutiny from a regulator, an auditor, and a client. We write decisions as if they will be read in a tribunal." },
      { id: "capital_roe_discipline",label: "Capital & ROE Discipline",       value: "We measure every investment in terms of risk-adjusted return on equity. Vanity metrics -- headcount, AUM, transaction volume -- are secondary to the economics they generate." },
      { id: "trust_architecture",    label: "Trust Architecture",             value: "Security and transparency are product features, not afterthoughts. We design for trust as explicitly as we design for functionality." },
    ]
  },
  {
    id: "tech_culture",
    label: "Technology / SaaS Culture",
    industryTags: ["Technology", "SaaS", "Software", "AI", "Digital", "Tech", "EdTech", "PropTech", "AgroTech", "MedTech", "FinTech"],
    options: [
      { id: "ship_fast",             label: "Ship Fast, Learn Faster",        value: "We deploy to production multiple times a day. A feature in front of a user for 24 hours teaches us more than a month of internal testing. Latency of learning is the primary cost." },
      { id: "dx_first",              label: "Developer Experience First",     value: "A world-class developer experience is a talent strategy, a productivity strategy, and a product strategy simultaneously. We invest in tooling before features." },
      { id: "api_first",             label: "API-First Architecture",         value: "Everything we build is designed to be consumed programmatically. Every team is simultaneously a product team and a consumer. No closed systems." },
      { id: "data_product_culture",  label: "Data-Driven Product Culture",    value: "Intuition is a starting point; data is the verdict. We define the metric before we build the feature. We never ship without instrumentation." },
      { id: "open_source_mindset",   label: "Open Source Mindset",            value: "We share knowledge aggressively, build on community contributions, and give back generously. What we withhold, we lose the right to benefit from." },
      { id: "security_by_design",    label: "Security by Design",             value: "Security is an architecture decision, not a QA filter. It is designed in at sprint zero, not bolted on before release." },
    ]
  },
  {
    id: "healthcare_culture",
    label: "Healthcare / Pharma Culture",
    industryTags: ["Healthcare", "Pharma", "Biotech", "MedTech", "Life Sciences", "Pharmaceuticals"],
    options: [
      { id: "zero_harm",             label: "Zero Harm Culture",              value: "Every policy, process, and incentive is designed around the principle that a preventable harm is an organisational failure, not a personal accident." },
      { id: "evidence_based",        label: "Evidence-Based Decision Making", value: "Every clinical or operational protocol is backed by peer-reviewed evidence. Expert intuition is a hypothesis until validated in our patient population." },
      { id: "patient_centered",      label: "Patient-Centred Design",         value: "Every pathway, product, and process is co-designed with patients. Their outcomes, not our throughput metrics, define what success looks like." },
      { id: "interdisciplinary",     label: "Interdisciplinary Collaboration",value: "Clinical outcomes require clinical, operational, and analytical disciplines working in genuine integration. Functional silos are dissolved at the pathway level." },
      { id: "data_governance_health",label: "Sacred Data Stewardship",        value: "Patient data is the most sensitive data in existence. We treat every data governance decision as if the patient is in the room when we make it." },
      { id: "innovation_caution",    label: "Innovation with Caution",        value: "We innovate boldly within an evidence framework. Speed to market and 'do no harm' are simultaneously non-negotiable. We never sacrifice safety for first-mover advantage." },
    ]
  },
  {
    id: "enterprise_culture",
    label: "Enterprise / BPO Operational Culture",
    industryTags: ["BPO", "Enterprise", "Manufacturing", "Logistics", "Operations", "Industrial", "Infrastructure", "Construction", "Automotive"],
    options: [
      { id: "process_supremacy",     label: "Process Supremacy",              value: "We trust the process. Deviation from a documented standard operating procedure requires an explicit owner and a written justification. Excellence is repeatability." },
      { id: "sla_sacred",            label: "SLA is Sacred",                  value: "Client commitments are unconditional promises, not aspirational targets. We build buffer into our design, not into our excuses." },
      { id: "cpu_obsession",         label: "Cost-Per-Unit Obsession",        value: "Every process improvement is quantified in unit economics before it is approved. We do not implement efficiency for its own sake -- we implement it for the margin it creates." },
      { id: "quality_at_scale",      label: "Quality at Scale",               value: "Six Sigma thinking is embedded in every delivery team, not just a quality department. Defects are the responsibility of the person closest to the work." },
      { id: "workforce_optimise",    label: "Workforce Optimisation",         value: "The right skill, at the right time, at the right cost. We build demand models 90 days forward and adjust supply continuously to avoid both under and over-resourcing." },
      { id: "continuous_upskill",    label: "Continuous Upskilling Mandate",  value: "Learning hours per employee per quarter are a primary KPI, not a nice-to-have. Skills obsolescence is an existential risk we manage proactively." },
    ]
  },
  {
    id: "consulting_culture",
    label: "Consulting & Professional Services Culture",
    industryTags: ["Consulting", "Legal", "Accounting", "Advisory", "Professional Services", "Government", "Non-Profit"],
    options: [
      { id: "client_impact_first",   label: "Client Impact Above All",        value: "The only metrics that matter are client outcomes. Utilisation, revenue, and margin are consequences of impact -- not independent objectives." },
      { id: "intellectual_honesty",  label: "Intellectual Honesty",           value: "The best idea wins regardless of who presents it. Hierarchy is a governance mechanism, not an intellectual hierarchy. We change our minds when the evidence demands it." },
      { id: "mece_thinking",         label: "Structured Problem Solving",     value: "Every problem is decomposed using MECE principles before a solution is proposed. We diagnose before we prescribe. Structure is not bureaucracy -- it is rigour." },
      { id: "confidentiality",       label: "Confidentiality as Character",   value: "Client trust is sacred and absolute. We treat every piece of client information as if the client is watching how we handle it. Discretion is a professional character trait." },
      { id: "cross_practice",        label: "Cross-Practice Integration",     value: "We bring the full breadth of the firm to every client. Territorial thinking around client relationships is a breach of our professional obligation." },
      { id: "value_based_delivery",  label: "Value-Based Delivery",           value: "We charge for outcomes, not hours. Time-and-materials billing is a last resort. Our incentives are aligned with the client's success." },
    ]
  },
];

/* ======================================================================
   TEAM DYNAMIC TEMPLATES -- VISION LAYER 4 (6 categories)
====================================================================== */
export const TEAM_DYNAMIC_TEMPLATES = [
  {
    id: "stages",
    label: "Team Development Stage",
    options: [
      { id: "forming",     label: "The Forming Foundation",       value: "A newly assembled team in the trust-building phase. Members are cautious, politically careful, and testing boundaries. Conflict is minimal but so is candour. The leader must model vulnerability and create early psychological safety rituals." },
      { id: "storming",    label: "The Storming Startup",         value: "High energy, high friction, ambiguous roles. Passion is real but so is conflict. Communication is reactive. The team has potential but no shared operating rhythm. A leader who can create structure without suffocating energy is essential." },
      { id: "norming",     label: "The Norming High-Performers",  value: "Roles are clarifying, trust is building, and the team is starting to find its rhythm. Interpersonal relationships are improving but the team has not yet hit peak performance. Needs consistent leadership to hold the trajectory." },
      { id: "performing",  label: "The Performing Elite",         value: "Self-managing, driven by shared purpose, requiring minimal directive oversight. The leader's role shifts from manager to enabler. The primary risk is complacency and insufficient external challenge to maintain growth." },
      { id: "adjourning",  label: "The Adjourning Transition",    value: "The team is being restructured, disbanded, or significantly changed. Morale is fragile. Survivors are distracted. Leaders must manage endings with dignity while protecting forward momentum for those who remain." },
    ]
  },
  {
    id: "vibe",
    label: "Team Vibe & Culture",
    options: [
      { id: "autonomy",         label: "The Autonomous Rebels",       value: "Highly skilled, fiercely independent individuals who treat micromanagement as a personal insult. Great for innovation, challenging for top-down alignment or policy compliance. Requires a leader who leads through context, not control." },
      { id: "siloed",           label: "The Siloed Specialists",      value: "Domain experts who are brilliant within their lanes but struggle to see -- or care about -- the broader picture. Value lies in depth, risk lies in integration failure. Needs a leader who can act as a master-translator and systems thinker." },
      { id: "high_pressure",    label: "The High-Pressure Boiler",    value: "Ambitious targets, tight deadlines, and a competitive atmosphere that borders on anxiety-inducing. High performance is real but so is burnout risk. Needs a leader who can maintain the pace while creating sustainable human conditions." },
      { id: "collaborative",    label: "The Collaborative Orchestra", value: "Hyper-collaborative, emotionally intelligent, and genuinely caring of each other. The shadow side is slow decision-making -- consensus is required for everything. A leader who can make space for harmony without losing pace is critical." },
      { id: "loyal_tribe",      label: "The Fiercely Loyal Tribe",    value: "Deep in-group cohesion, cultural pride, and mutual protection. The risk is insularity -- new joiners struggle to integrate, and external challenge is seen as threat rather than input. Needs a leader who can honour the culture while opening it." },
      { id: "quiet_achievers",  label: "The Quiet Achievers",         value: "Low political visibility, high output quality, allergic to corporate theatre. The team delivers consistently but is chronically underrecognised. Needs a leader who will champion their work at the senior level and protect them from organisational politics." },
    ]
  },
  {
    id: "composition",
    label: "Team Composition",
    options: [
      { id: "cross_generational", label: "The Cross-Generational Mix",   value: "Boomers, Gen X, Millennials, and Gen Z navigating fundamentally different assumptions about work, hierarchy, loyalty, and communication. The friction is real but so is the diversity of perspective. Needs a leader fluent in multiple workstyle languages." },
      { id: "all_star",           label: "The All-Star Roster",          value: "A team of high achievers, each with strong personal brands and a history of individual success. The risk is competition for visibility and a winner-takes-all dynamic that undermines team output. Needs a leader who can create genuine collective accountability." },
      { id: "emerging_leaders",   label: "The Emerging Leaders Cohort",  value: "Mid-level talent with high potential who have never had a genuine sponsor or career architect. The capability is there; the self-belief and exposure are not. Needs a leader who sees them before they see themselves." },
      { id: "under_invested",     label: "The Under-Invested Team",      value: "A team that has experienced chronic neglect -- underresourced, underrecognised, and low on morale. Often high on loyalty to each other but low on confidence. Needs urgent trust restoration before performance can be demanded." },
      { id: "diverse_mosaic",     label: "The Diverse Mosaic",           value: "High cognitive, cultural, and demographic diversity with genuine inclusion potential -- but also genuine conflict risk. The team has not yet learned to harness its differences as strengths. Needs a leader with a disciplined inclusion practice." },
    ]
  },
  {
    id: "leadership_gap",
    label: "Leadership Style Required",
    options: [
      { id: "needs_visionary",    label: "Needs a Visionary",           value: "The team has the execution capability but no unifying direction. They are technically proficient but strategically adrift. The incoming leader must answer: where are we going, and why does it matter? Without this, attrition will follow." },
      { id: "needs_coach",        label: "Needs a Coach",               value: "The team is talented but chronically underperforming relative to potential. The root cause is developmental neglect -- no structured feedback, no individualised growth. The leader must be a genuine talent developer, not just a task allocator." },
      { id: "needs_stabiliser",   label: "Needs a Stabiliser",          value: "Post-reorg chaos, unclear ownership, political fragility. The team has lost confidence in leadership and in its own purpose. The incoming leader must create certainty, clarity, and calm before any performance agenda can land." },
      { id: "needs_challenger",   label: "Needs a Challenger",          value: "A comfortable, complacent team that is performing adequately but nowhere near its potential. Too much harmony; not enough edge. The incoming leader must introduce healthy dissatisfaction and aspiration without destroying the existing trust." },
      { id: "needs_connector",    label: "Needs a Connector",           value: "A fragmented team of individuals who do not know or trust each other. The unit is the org chart; the team is not yet real. The incoming leader must build genuine human connection before functional performance can follow." },
    ]
  },
  {
    id: "org_maturity",
    label: "Organisational Maturity",
    options: [
      { id: "pre_pmf",            label: "Pre-PMF Startup",                value: "No product-market fit yet. Extreme uncertainty on direction, model, and viability. The team knows the stakes are existential. Every decision is a bet. Speed of learning and willingness to pivot are survival skills." },
      { id: "growth_scaleup",     label: "Growth-Stage Scale-Up",          value: "50-500 people, growing faster than the processes can handle. Process debt is accumulating. Culture is at risk of dilution. The leader must professionalise without bureaucratising, and scale culture not just headcount." },
      { id: "mid_market",         label: "Mid-Market Professionalisation", value: "500-2,000 people in transition from founder-led agility to professional management. Political complexity is rising. Governance is being built. Leaders must navigate the tension between speed and structure." },
      { id: "enterprise_division",label: "Enterprise Business Unit",       value: "A division inside a large corporation. Resources are available but so are politics, matrix authority, and conflicting strategic agendas. Leaders must master the art of navigating upward as well as building downward." },
      { id: "legacy_institution", label: "Legacy Institution",             value: "Decades of process inertia, risk-aversion baked into DNA, and cultural resistance to change. The assets are significant; the velocity is near-zero. Leadership here requires a rare combination of patience, political skill, and unwillingness to accept the status quo." },
    ]
  },
  {
    id: "remote",
    label: "Remote & Hybrid Dynamics",
    options: [
      { id: "fully_remote",         label: "Fully Distributed Global",        value: "Team members are spread across multiple timezones with no shared office. Async communication is the default. Cultural cohesion is hard-won and fragile. The leader must over-invest in explicit connection rituals and documentation as the connective tissue." },
      { id: "hybrid_flex",          label: "Hybrid Flex (2-3 Days)",           value: "The worst of both worlds if not deliberately managed -- neither the serendipity of co-location nor the discipline of async. Coordination overhead is real. Leaders must design the in-office days intentionally, not just default to individual meetings." },
      { id: "hq_offshore",          label: "Co-located HQ with Offshore Pod", value: "The classic power-distance dynamic. The onshore team makes decisions; the offshore team executes. Cultural translation is required constantly. A leader who does not actively redistribute power and visibility will accelerate the 'us vs. them' dynamic." },
      { id: "remote_first_sprints", label: "Remote-First with Quarterly Sprints", value: "Deep async culture punctuated by intense in-person gatherings. Works well for focused execution; risks disconnection on strategy, trust, and culture. Leaders must make the sprints transformative, not just operational." },
      { id: "rto_resistant",        label: "Return-to-Office Resistant Team", value: "Forced RTO is creating friction, resentment, and active attrition risk. High performers have options and they are exercising them. The incoming leader must navigate a politically charged mandate without losing the talent the business cannot afford to lose." },
    ]
  },
];
