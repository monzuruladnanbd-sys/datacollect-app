import type { Catalog } from "./catalog.types";

export const CATALOG: Catalog = [
  // FISHERIES MANAGEMENT - PROCESS
  {
    id: "FM-P-001",
    sector: "Fisheries Management",
    level: "process",
    title: "At-sea patrol missions / vessel inspections",
    description: "Number of at-sea patrol missions or vessel inspections conducted by MFMR compliance officers in national waters.",
    unitOptions: ["Count"],
    frequencyOptions: ["Quarterly"],
    responsibleHints: ["Compliance Unit", "PMU M&E Specialist"],
    disaggregationHints: ["Quarter", "EEZ", "Territorial waters"],
    valueType: "number"
  },
  {
    id: "FM-P-002", 
    sector: "Fisheries Management",
    level: "process",
    title: "Fisheries data systems/tools developed/upgraded",
    description: "Count of fisheries data management systems or tools developed or upgraded (e.g. e-reporting system, databases) to improve data availability.",
    unitOptions: ["Count"],
    frequencyOptions: ["Quarterly"],
    responsibleHints: ["MFMR ICT/Data Unit", "PMU M&E Specialist"],
    disaggregationHints: ["Observer", "E-reporting", "Inshore DB"],
    valueType: "number"
  },
  {
    id: "FM-P-003",
    sector: "Fisheries Management", 
    level: "process",
    title: "Stakeholder meetings/workshops held",
    description: "Number of stakeholder meetings, workshops, or coordination sessions held for fisheries policy development or regional collaboration.",
    unitOptions: ["Count"],
    frequencyOptions: ["Quarterly"],
    responsibleHints: ["PMU Policy Specialist", "MFMR Management"],
    disaggregationHints: ["National", "Regional", "By province"],
    valueType: "number"
  },

  // FISHERIES MANAGEMENT - OUTPUT
  {
    id: "FM-O-001",
    sector: "Fisheries Management",
    level: "output", 
    title: "Observers completing training",
    description: "Number of fisheries observers completing training under the Observer Career Development Program.",
    unitOptions: ["Number of persons"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Offshore Division (Observer Program Unit)", "PMU M&E Specialist"],
    disaggregationHints: ["National", "Regional"],
    valueType: "number"
  },
  {
    id: "FM-O-002",
    sector: "Fisheries Management",
    level: "output",
    title: "MCS and compliance officers trained",
    description: "Number of MCS and compliance officers receiving new or refresher training.",
    unitOptions: ["Number of persons"],
    frequencyOptions: ["Annually"],
    responsibleHints: ["MFMR Offshore Division (Compliance Unit)", "PMU M&E Specialist"],
    disaggregationHints: ["Female", "Male", "By province/office"],
    valueType: "number"
  },
  {
    id: "FM-O-003",
    sector: "Fisheries Management",
    level: "output",
    title: "Fishing vessel inspections conducted",
    description: "Number of fishing vessel inspections conducted in Solomon Islands' archipelagic waters or territorial sea per year by compliance officers.",
    unitOptions: ["Number of inspections"],
    frequencyOptions: ["Annually"],
    responsibleHints: ["MFMR Compliance Unit", "PMU M&E Specialist"],
    disaggregationHints: ["Domestic", "Foreign", "Port", "Sea"],
    valueType: "number"
  },
  {
    id: "FM-O-004",
    sector: "Fisheries Management",
    level: "output",
    title: "Provincial Fisheries Ordinances prepared",
    description: "Number of new or revised Provincial Fisheries Ordinances prepared and formally submitted to provincial assemblies for endorsement (cumulative).",
    unitOptions: ["Number of ordinances"],
    frequencyOptions: ["Annually (review)"],
    responsibleHints: ["MFMR Provincial Division", "Provincial Offices", "PMU Legal/Policy Officer"],
    disaggregationHints: ["By province"],
    valueType: "number"
  },
  {
    id: "FM-O-005",
    sector: "Fisheries Management",
    level: "output",
    title: "MFMR structure and functions review completed",
    description: "Completion of the MFMR structure and functions review with a policy note produced.",
    unitOptions: ["Yes", "No"],
    frequencyOptions: ["One-time (by 2024)"],
    responsibleHints: ["MFMR Corporate Services Division", "PMU M&E Specialist"],
    disaggregationHints: ["N/A (milestone)"],
    valueType: "yesno"
  },
  {
    id: "FM-O-006",
    sector: "Fisheries Management",
    level: "output",
    title: "Gender Strategy elements incorporated",
    description: "Whether key elements of the MFMR Gender Strategy are incorporated in the revised organizational structure/functions as part of the institutional review.",
    unitOptions: ["Yes", "No"],
    frequencyOptions: ["One-time (by project end)"],
    responsibleHints: ["MFMR Corporate Services/HR Division", "PMU Gender Specialist"],
    disaggregationHints: ["N/A (qualitative)"],
    valueType: "yesno"
  },
  {
    id: "FM-O-007",
    sector: "Fisheries Management",
    level: "output",
    title: "Sex-disaggregated data fields included",
    description: "Inclusion of sex-disaggregated data fields in the new MFMR central inshore fisheries database (e.g. fields for operator's sex, crew sex-ratio).",
    unitOptions: ["Yes", "No"],
    frequencyOptions: ["One-time (by database deployment)"],
    responsibleHints: ["MFMR Inshore Division (Fisheries Data Management)", "PMU M&E Specialist"],
    disaggregationHints: ["N/A (feature enabled)"],
    valueType: "yesno"
  },

  // FISHERIES MANAGEMENT - OUTCOME
  {
    id: "FM-OC-001",
    sector: "Fisheries Management",
    level: "outcome",
    title: "Observer reports submitted electronically",
    description: "Percentage of observer trip reports submitted electronically (via the e-reporting system) instead of paper. Baseline: 50% (paper-based); Target: 100% electronic.",
    unitOptions: ["Percent %"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Offshore Division (Observer Program)", "PMU M&E Specialist"],
    disaggregationHints: ["Paper", "Electronic"],
    valueType: "percent"
  },
  {
    id: "FM-OC-002",
    sector: "Fisheries Management",
    level: "outcome",
    title: "Vessels reporting via VMS",
    description: "Percentage of licensed tuna fishing vessels regularly reporting their position via the Vessel Monitoring System (VMS) to the Noro MCS Center. Baseline: 0% (new system); End Target: 90%.",
    unitOptions: ["Percent %"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["Noro MCS Center", "MFMR Licensing Unit", "PMU M&E Specialist"],
    disaggregationHints: ["Domestic", "Foreign", "By month/quarter"],
    valueType: "percent"
  },
  {
    id: "FM-OC-003",
    sector: "Fisheries Management",
    level: "outcome",
    title: "Bilateral agreements signed",
    description: "Number of bilateral agreements signed with neighboring countries to facilitate access to electronic monitoring (EM) data (cumulative). Baseline: 0; Target: 2 agreements.",
    unitOptions: ["Count"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Electronic Reporting/Monitoring (ERM) Unit", "PMU Coordinator"],
    disaggregationHints: ["By partner country"],
    valueType: "number"
  },
  {
    id: "FM-OC-004",
    sector: "Fisheries Management",
    level: "outcome",
    title: "Communities adopting climate-informed CFMPs",
    description: "Minimum number of new communities that formally adopt climate-informed Community Fisheries Management Plans (CFMPs) (cumulative).",
    unitOptions: ["Number of communities"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Inshore Division (CBRM Unit)", "Provincial Fisheries Officers", "PMU Community Liaison/M&E"],
    disaggregationHints: ["By province", "By year of adoption"],
    valueType: "number"
  },

  // CLIMATE ADAPTATION - PROCESS
  {
    id: "CA-P-001",
    sector: "Climate Adaptation",
    level: "process",
    title: "Community climate trainings/workshops",
    description: "Number of community-level trainings or awareness workshops conducted on climate change impacts and adaptation in fisheries.",
    unitOptions: ["Count"],
    frequencyOptions: ["Quarterly"],
    responsibleHints: ["MFMR Inshore Division (CBRM/Climate team)", "PMU Community Liaison"],
    disaggregationHints: ["By province", "By participant gender"],
    valueType: "number"
  },
  {
    id: "CA-P-002",
    sector: "Climate Adaptation",
    level: "process",
    title: "Climate vulnerability assessments",
    description: "Number of target communities where a climate vulnerability or risk assessment is carried out to inform local adaptation planning.",
    unitOptions: ["Count"],
    frequencyOptions: ["Quarterly"],
    responsibleHints: ["MFMR CBRM/Climate team", "Provincial Officers", "PMU M&E Specialist"],
    disaggregationHints: ["By province/community"],
    valueType: "number"
  },
  {
    id: "CA-P-003",
    sector: "Climate Adaptation",
    level: "process",
    title: "CBRM committees initiated/mobilized",
    description: "Number of Community-Based Resource Management committees initiated/mobilized to lead CFMP preparation.",
    unitOptions: ["Count"],
    frequencyOptions: ["Quarterly"],
    responsibleHints: ["MFMR Inshore Division (CBRM Unit)", "Provincial Officers", "PMU Community Liaison"],
    disaggregationHints: ["By province", "By community"],
    valueType: "number"
  },

  // CLIMATE ADAPTATION - OUTPUT
  {
    id: "CA-O-001",
    sector: "Climate Adaptation",
    level: "output",
    title: "Climate-informed CFMPs developed",
    description: "Number of community fisheries management plans developed that incorporate climate adaptation measures.",
    unitOptions: ["Number of plans"],
    frequencyOptions: ["Annual (Tracking)"],
    responsibleHints: ["MFMR Inshore Division (CBRM Unit)", "Provincial Fisheries Officers", "PMU Community Liaison"],
    disaggregationHints: ["By province", "By inclusion of specific adaptation measures (Y/N)"],
    valueType: "number"
  },
  {
    id: "CA-O-002",
    sector: "Climate Adaptation",
    level: "output",
    title: "CBRM committees formally established",
    description: "Number of Community-Based Resource Management committees formally established for CFMP implementation (cumulative).",
    unitOptions: ["Number of committees"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Inshore Division (CBRM Unit)", "Provincial Offices", "PMU Community Liaison"],
    disaggregationHints: ["By province", "By community"],
    valueType: "number"
  },
  {
    id: "CA-O-003",
    sector: "Climate Adaptation",
    level: "output",
    title: "CBRM committees with women representatives",
    description: "Percentage of newly established CBRM committees that include at least two women representatives. Target: 100% of new committees include ≥2 women.",
    unitOptions: ["Percent (%)"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Inshore Division (CBRM Unit)", "Provincial Offices", "PMU Gender Specialist"],
    disaggregationHints: ["By province"],
    valueType: "percent"
  },
  {
    id: "CA-O-004",
    sector: "Climate Adaptation",
    level: "output",
    title: "Fish Aggregating Devices deployed",
    description: "Number of nearshore Fish Aggregating Devices deployed in target communities as a climate adaptation measure.",
    unitOptions: ["Number of FAD units"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Inshore/Offshore Division (Tech team)", "PMU Procurement/M&E"],
    disaggregationHints: ["By province", "Nearshore", "Offshore"],
    valueType: "number"
  },
  {
    id: "CA-O-005",
    sector: "Climate Adaptation",
    level: "output",
    title: "Communities connected to external programs",
    description: "Number of project communities that are connected to external climate change adaptation or disaster risk reduction programs (national or donor-funded).",
    unitOptions: ["Number of communities"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["PMU Community Liaison", "National Climate Change Office (coordination)"],
    disaggregationHints: ["By province", "By program type"],
    valueType: "number"
  },

  // CLIMATE ADAPTATION - OUTCOME
  {
    id: "CA-OC-001",
    sector: "Climate Adaptation",
    level: "outcome",
    title: "Communities adopting climate-informed CFMPs",
    description: "Number of new communities that formally adopt climate-informed Community Fisheries Management Plans (cumulative). Baseline: 0; Target: 5 communities by end of project.",
    unitOptions: ["Number of communities"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Inshore Division (CBRM Unit)", "PMU Community Liaison/M&E"],
    disaggregationHints: ["By province", "By year of adoption"],
    valueType: "number"
  },
  {
    id: "CA-OC-002",
    sector: "Climate Adaptation",
    level: "outcome",
    title: "Community members in livelihood activities",
    description: "Number of community members participating in project-supported livelihood diversification and development activities that build climate resilience (cumulative). Target: 200 people (with at least 30% women).",
    unitOptions: ["Number of women"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["MFMR Inshore Division", "PMU M&E/Gender Specialist"],
    disaggregationHints: ["By province/community"],
    valueType: "number"
  },
  {
    id: "CA-OC-003",
    sector: "Climate Adaptation",
    level: "outcome",
    title: "Households with improved resilience",
    description: "Percentage of households reporting improved resilience to climate impacts on fisheries/livelihoods, as per end-of-project survey. Target: 70% households feel more secure.",
    unitOptions: ["Percent (%)"],
    frequencyOptions: ["Baseline & Endline Survey"],
    responsibleHints: ["PMU M&E Specialist (survey team)", "External evaluator"],
    disaggregationHints: ["By province", "By gender of respondent"],
    valueType: "percent"
  },

  // LIVELIHOODS - PROCESS
  {
    id: "L-P-001",
    sector: "Livelihoods",
    level: "process",
    title: "Community meetings for livelihood planning",
    description: "Number of community meetings or participatory planning sessions held to identify and plan livelihood diversification activities.",
    unitOptions: ["Count"],
    frequencyOptions: ["Quarterly"],
    responsibleHints: ["MFMR Inshore/Provincial (Livelihoods/Development Unit)", "PMU Community Liaison"],
    disaggregationHints: ["By province", "By community"],
    valueType: "number"
  },
  {
    id: "L-P-002",
    sector: "Livelihoods",
    level: "process",
    title: "Livelihood skills training workshops",
    description: "Number of training workshops conducted for community members on new livelihood skills (e.g. fish processing, aquaculture techniques, business management).",
    unitOptions: ["Count"],
    frequencyOptions: ["Quarterly"],
    responsibleHints: ["MFMR Inshore/Provincial (Livelihoods/Development Unit)", "PMU Community Liaison"],
    disaggregationHints: ["By topic/type of training", "By gender of participants"],
    valueType: "number"
  },
  {
    id: "L-P-003",
    sector: "Livelihoods",
    level: "process",
    title: "Livelihood feasibility studies completed",
    description: "Number of livelihood feasibility studies or market assessments completed to inform viable enterprise options.",
    unitOptions: ["Count"],
    frequencyOptions: ["Semi-Annual"],
    responsibleHints: ["PMU Livelihoods Specialist", "External TA (if hired)"],
    disaggregationHints: ["Fisheries", "Agriculture", "By province"],
    valueType: "number"
  },

  // LIVELIHOODS - OUTPUT
  {
    id: "L-O-001",
    sector: "Livelihoods",
    level: "output",
    title: "Livelihood diversification initiatives implemented",
    description: "Number of community livelihood diversification initiatives implemented with project support (cumulative).",
    unitOptions: ["Number of initiatives"],
    frequencyOptions: ["Annual (tracked)"],
    responsibleHints: ["MFMR Provincial Division", "PMU Livelihoods Specialist"],
    disaggregationHints: ["By province", "Fishery-based", "Non-fishery"],
    valueType: "number"
  },
  {
    id: "L-O-002",
    sector: "Livelihoods",
    level: "output",
    title: "Community members completing training",
    description: "Number of community members who complete training programs in new or improved livelihood skills (total reach of trainings).",
    unitOptions: ["Number of persons"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["PMU Livelihoods Specialist", "Training providers"],
    disaggregationHints: ["By gender", "Youth", "Adult", "By skill type"],
    valueType: "number"
  },
  {
    id: "L-O-003",
    sector: "Livelihoods",
    level: "output",
    title: "Beneficiaries receiving seed grants/tools",
    description: "Number of community groups or individuals that received seed grants, tools, or inputs for livelihood activities.",
    unitOptions: ["Number of beneficiaries (group or indiv.)"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["PMU Livelihoods/Finance", "MFMR Provincial Offices"],
    disaggregationHints: ["By province", "By gender of recipient"],
    valueType: "number"
  },
  {
    id: "L-O-004",
    sector: "Livelihoods",
    level: "output",
    title: "Market linkages facilitated",
    description: "Number of instances of market linkages or partnerships facilitated (e.g. buyer agreements, cooperative formed, access to microfinance) for community livelihood products.",
    unitOptions: ["Count"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["PMU Livelihoods Specialist", "MFMR Commerce/Industry liaison"],
    disaggregationHints: ["By product type", "By province"],
    valueType: "number"
  },
  {
    id: "L-O-005",
    sector: "Livelihoods",
    level: "output",
    title: "Public awareness campaigns conducted",
    description: "Number of public awareness or extension campaigns conducted (e.g. radio programs, fairs) to promote sustainable livelihood practices and gender inclusion.",
    unitOptions: ["Count"],
    frequencyOptions: ["Annual"],
    responsibleHints: ["PMU Communications", "MFMR Extension Services"],
    disaggregationHints: ["Radio", "Workshop", "Other"],
    valueType: "number"
  },

  // LIVELIHOODS - OUTCOME
  {
    id: "L-OC-001",
    sector: "Livelihoods",
    level: "outcome",
    title: "Community members in livelihood activities",
    description: "Number of community members participating in project-supported livelihood and development activities (cumulative). Target: 200 participants with at least 30% women.",
    unitOptions: ["Number of persons"],
    frequencyOptions: ["Quarterly tracking; Annual reporting"],
    responsibleHints: ["MFMR Provincial Offices", "CBRM/Livelihoods Unit", "PMU M&E Specialist"],
    disaggregationHints: ["Male", "Female", "By community/province"],
    valueType: "number"
  },
  {
    id: "L-OC-002",
    sector: "Livelihoods",
    level: "outcome",
    title: "Households with increased income",
    description: "Percentage of beneficiary households with increased income from new livelihood sources (compared to baseline). Target: 60% of participant households see income rise.",
    unitOptions: ["Percent (%)"],
    frequencyOptions: ["Midline & Endline surveys (Year 3 and 5)"],
    responsibleHints: ["PMU M&E Specialist", "External evaluator (survey)"],
    disaggregationHints: ["By province", "Female-headed", "Male-headed households"],
    valueType: "percent"
  },
  {
    id: "L-OC-003",
    sector: "Livelihoods",
    level: "outcome",
    title: "Households with improved food security",
    description: "Percentage of households in target communities reporting improved food security due to livelihood and fisheries interventions.",
    unitOptions: ["Percent (%)"],
    frequencyOptions: ["Endline survey"],
    responsibleHints: ["PMU M&E Specialist", "External evaluator"],
    disaggregationHints: ["By province", "By household type"],
    valueType: "percent"
  },
  {
    id: "L-OC-004",
    sector: "Livelihoods",
    level: "outcome",
    title: "Sustained livelihood initiatives",
    description: "Percentage of supported livelihood initiatives still active and operational one year after support. Target: 80% of initiatives sustained.",
    unitOptions: ["Percent (%) (of initiatives)"],
    frequencyOptions: ["Annual (from year 3 onward)"],
    responsibleHints: ["PMU Livelihoods Specialist", "Provincial Offices", "M&E"],
    disaggregationHints: ["By province", "By type of initiative"],
    valueType: "percent"
  }
];
