// Seed the Company prep cards with top Tamil Nadu MBA recruiters.
// Run: node scripts/seedCompanies.js   (replaces existing companies)
// Salary figures are indicative campus ranges — the admin should keep them current.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Company = require('../models/Company');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const companies = [
  {
    name: 'TCS (Tata Consultancy Services)',
    slug: 'tcs',
    sector: 'it_services',
    website: 'https://www.tcs.com',
    headquarters: 'Mumbai (major Chennai campuses)',
    overview:
      "India's largest IT services company and the biggest campus recruiter in Tamil Nadu. Hires MBA graduates into business analysis, pre-sales, HR and delivery-management tracks alongside its massive engineering intake.",
    businessModel:
      'Long-term IT outsourcing and consulting contracts with global enterprises — revenue from time-and-materials and fixed-price projects across BFSI, retail, healthcare and manufacturing verticals. Margins depend on utilization, offshore mix and pyramid ratios.',
    whatTheyLookFor:
      'Consistency over brilliance: steady academics, clear communication, willingness to relocate, and structured answers. HR rounds filter heavily on attitude and long-term intent — attrition is their biggest cost.',
    salaryRange: '₹4 – 7.5 LPA (campus, MBA roles — indicative)',
    roles: ['Business Analyst', 'HR Associate', 'Pre-sales Consultant', 'Project Coordinator'],
    rounds: [
      'Online aptitude + verbal test (TCS NQT platform)',
      'Group discussion (batch-size dependent)',
      'Technical / domain interview — your MBA specialization',
      'HR interview — relocation, bond, career intent',
    ],
    interviewQuestions: [
      { category: 'hr', question: 'Why TCS over a product company or a startup?' },
      { category: 'hr', question: 'Are you open to relocation and rotational shifts?' },
      { category: 'technical', question: 'Explain how an IT services company makes money. What is utilization?' },
      { category: 'case', question: 'A large banking client wants to cut project cost by 20%. What levers would you propose?' },
    ],
    prepTips: [
      'Know the Tata group history and TCS current CEO and revenue scale.',
      'Prepare one crisp story each for teamwork, conflict, and failure — STAR format.',
      'Read about Machine-First Delivery Model and TCS BaNCS to stand out.',
    ],
  },
  {
    name: 'Cognizant (CTS)',
    slug: 'cognizant',
    sector: 'it_services',
    website: 'https://www.cognizant.com',
    headquarters: 'Teaneck, USA (India HQ: Chennai)',
    overview:
      'Chennai is Cognizant\'s largest global delivery hub, making it one of the most accessible major recruiters for TN MBA students. MBA hires go into business analysis, consulting-adjacent and corporate functions.',
    businessModel:
      'IT services and digital transformation for North American clients (majority of revenue), especially healthcare and BFSI. Competes with TCS/Infosys on delivery cost and with Accenture on digital consulting.',
    whatTheyLookFor:
      'Communication first — client-facing polish matters more here than raw academics. Domain awareness in healthcare or banking is a genuine differentiator.',
    salaryRange: '₹4.5 – 8 LPA (campus, MBA roles — indicative)',
    roles: ['Business Analyst', 'Management Trainee', 'HR Executive', 'Domain Consultant'],
    rounds: [
      'Aptitude + communication assessment',
      'Group discussion or JAM round',
      'Domain interview — expect healthcare/BFSI scenarios',
      'HR round',
    ],
    interviewQuestions: [
      { category: 'hr', question: 'Cognizant\'s India headcount is Chennai-heavy. What do you know about our delivery model?' },
      { category: 'technical', question: 'What is the difference between a Business Analyst and a Product Owner?' },
      { category: 'case', question: 'A US healthcare client\'s claims processing is slow. How would you approach diagnosing it?' },
    ],
    prepTips: [
      'Understand US healthcare basics (payer vs provider) — it is their biggest vertical.',
      'Practice a 60-second self-introduction; their HR rounds are brisk.',
    ],
  },
  {
    name: 'Infosys',
    slug: 'infosys',
    sector: 'it_services',
    website: 'https://www.infosys.com',
    headquarters: 'Bengaluru',
    overview:
      'India\'s second-largest IT company with strong TN campus presence. MBA hires typically enter as Business Analysts or through the HR/functional streams; Mysuru training is a well-known rite of passage.',
    businessModel:
      'IT services, consulting and platforms (Finacle for banking). Growing digital revenue share; famous for margin discipline and large-deal wins.',
    whatTheyLookFor:
      'Learnability — their word. Clean aptitude scores, adaptability, and evidence you can absorb new domains fast. Training performance at Mysuru actually determines your posting.',
    salaryRange: '₹4 – 8 LPA (campus, MBA roles — indicative)',
    roles: ['Business Analyst', 'Associate Consultant (domain)', 'HR Associate', 'Operations Executive'],
    rounds: [
      'Online test — aptitude, logical, verbal',
      'Technical/domain interview',
      'HR interview',
    ],
    interviewQuestions: [
      { category: 'hr', question: 'Tell me about a time you had to learn something completely new under a deadline.' },
      { category: 'technical', question: 'What is Finacle and why does it matter to Infosys?' },
      { category: 'guesstimate', question: 'Estimate the number of IT employees working in Chennai.' },
    ],
    prepTips: [
      'Read the latest quarterly results headline numbers — revenue, margin, large-deal TCV.',
      'Have an answer ready for "why services, not product?"',
    ],
  },
  {
    name: 'HDFC Bank',
    slug: 'hdfc-bank',
    sector: 'banking',
    website: 'https://www.hdfcbank.com',
    headquarters: 'Mumbai',
    overview:
      "India's largest private bank and a heavy recruiter of MBA graduates across TN for branch banking, relationship management and credit roles. The classic first step into BFSI careers.",
    businessModel:
      'Retail-led banking: low-cost CASA deposits funding high-yield retail loans (personal, auto, cards). Post-merger with HDFC Ltd, home loans are core. Earns on net interest margin plus fees.',
    whatTheyLookFor:
      'Sales orientation with integrity — most entry roles carry targets. They probe whether you understand that banking is a sales job first, and whether you can handle field pressure.',
    salaryRange: '₹4 – 6.5 LPA (campus, e.g. Future Bankers / MT — indicative)',
    roles: ['Relationship Manager', 'Personal Banker', 'Credit Analyst', 'Branch Sales Officer'],
    rounds: [
      'Aptitude + psychometric test',
      'Group discussion — often a banking/economy topic',
      'Personal interview — banking basics + sales attitude',
    ],
    interviewQuestions: [
      { category: 'technical', question: 'What is CASA and why does it matter to a bank\'s profitability?' },
      { category: 'technical', question: 'Explain repo rate and how RBI changes affect lending rates.' },
      { category: 'hr', question: 'A high-value customer is angry about hidden charges. Walk me through the conversation.' },
      { category: 'case', question: 'Your branch is behind on the credit-card target with one week left. What do you do?' },
    ],
    prepTips: [
      'Know current repo rate, CRR, SLR and the latest RBI policy stance.',
      'Understand the HDFC–HDFC Bank merger in one clean paragraph.',
      'Be honest about sales comfort — faking it fails in the field, and they know it.',
    ],
  },
  {
    name: 'ICICI Bank',
    slug: 'icici-bank',
    sector: 'banking',
    website: 'https://www.icicibank.com',
    headquarters: 'Mumbai',
    overview:
      'Second-largest private bank, known in TN campuses for the iPro/PO programmes that combine classroom training with branch postings. Slightly more tech-forward positioning than peers.',
    businessModel:
      'Universal banking — retail plus corporate lending, with subsidiaries in insurance (ICICI Pru), securities and AMC. iMobile Pay app is central to its digital strategy.',
    whatTheyLookFor:
      'Energy and mobility. They hire in volume and promote fast; they want candidates who will say yes to a posting anywhere in the state and grind through the first two years.',
    salaryRange: '₹4 – 6 LPA (campus PO programmes — indicative)',
    roles: ['Probationary Officer', 'Relationship Manager', 'Credit Manager', 'Privilege Banker'],
    rounds: [
      'Online aptitude test',
      'Group discussion',
      'Personal interview (often panel)',
    ],
    interviewQuestions: [
      { category: 'technical', question: 'What is the difference between NEFT, RTGS, IMPS and UPI?' },
      { category: 'technical', question: 'What is an NPA and how do banks manage them?' },
      { category: 'hr', question: 'Would you accept a posting in a small town branch for your first two years?' },
    ],
    prepTips: [
      'Follow one full RBI monetary policy announcement before the drive.',
      'Read up on UPI economics — zero MDR and what it means for banks.',
    ],
  },
  {
    name: 'Ashok Leyland',
    slug: 'ashok-leyland',
    sector: 'auto',
    website: 'https://www.ashokleyland.com',
    headquarters: 'Chennai',
    overview:
      'The Chennai-headquartered flagship of the Hinduja Group and India\'s #2 commercial vehicle maker. Hires MBAs into supply chain, marketing, sales planning and corporate roles — a TN manufacturing icon.',
    businessModel:
      'Design and manufacture of trucks and buses; revenue cyclically tied to freight demand, infrastructure spending and replacement cycles. Growing electric-bus play through Switch Mobility.',
    whatTheyLookFor:
      'Genuine interest in manufacturing and willingness to work at plants (Ennore, Hosur). Supply-chain fundamentals and comfort with dealer/field ecosystems score highly.',
    salaryRange: '₹5 – 8 LPA (campus, MBA roles — indicative)',
    roles: ['SCM Executive', 'Marketing / Sales Planning', 'Dealer Development', 'Corporate Strategy Associate'],
    rounds: [
      'Aptitude test',
      'Group discussion — often on auto/EV/economy topics',
      'Functional interview (SCM/marketing)',
      'HR interview',
    ],
    interviewQuestions: [
      { category: 'technical', question: 'Explain just-in-time inventory. What breaks it in Indian conditions?' },
      { category: 'case', question: 'Truck sales are down 15% this quarter. How would you diagnose whether it is macro or us?' },
      { category: 'hr', question: 'Why commercial vehicles rather than a consumer-facing industry?' },
    ],
    prepTips: [
      'Know the CV market share order: Tata Motors, Ashok Leyland, then others.',
      'Read one article on Switch Mobility and the e-bus opportunity.',
    ],
  },
  {
    name: 'TVS Motor Company',
    slug: 'tvs-motor',
    sector: 'auto',
    website: 'https://www.tvsmotor.com',
    headquarters: 'Chennai',
    overview:
      'The TVS Group two-wheeler major — Hosur plant, iQube EV push, and Norton acquisition. Recruits MBAs for marketing, sales, supply chain and international business from TN campuses.',
    businessModel:
      'Two- and three-wheeler manufacturing with strong export share; premiumization (Apache, Ronin) and EV (iQube) drive margins beyond the commuter segment.',
    whatTheyLookFor:
      'Market instinct — they love candidates who can talk dealer networks, rural vs urban demand, and brand positioning with real observation, not textbook.',
    salaryRange: '₹5 – 8 LPA (campus, MBA roles — indicative)',
    roles: ['Area Sales Manager (trainee)', 'Marketing Executive', 'SCM Analyst', 'International Business Associate'],
    rounds: [
      'Aptitude + domain test',
      'Group discussion',
      'Functional + HR interviews',
    ],
    interviewQuestions: [
      { category: 'case', question: 'How would you launch iQube in a tier-3 Tamil Nadu town?' },
      { category: 'technical', question: 'What is the role of a distributor vs a dealer in auto retail?' },
      { category: 'guesstimate', question: 'Estimate the monthly two-wheeler sales in Chennai.' },
    ],
    prepTips: [
      'Visit a two-wheeler showroom before the interview — real observations impress.',
      'Know TVS market position vs Hero, Honda, Bajaj and its EV numbers.',
    ],
  },
  {
    name: 'Zoho Corporation',
    slug: 'zoho',
    sector: 'startup',
    website: 'https://www.zoho.com',
    headquarters: 'Chennai',
    overview:
      'Chennai\'s bootstrapped SaaS giant — profitable, private, and famously anti-VC. Hires MBAs into product marketing, sales ops, and customer-facing roles; rural-office culture is a genuine differentiator.',
    businessModel:
      'Subscription SaaS: 55+ business apps (CRM, Books, People) sold globally at aggressive price points. No external investors — growth funded by profits, which shapes a frugal, long-term culture.',
    whatTheyLookFor:
      'Substance over pedigree. They ignore college brands more than any large TN employer — but probe deeply for genuine product thinking, writing ability and low-ego learning attitude.',
    salaryRange: '₹5 – 10 LPA (varies widely by role — indicative)',
    roles: ['Product Marketing Associate', 'Sales Development', 'Customer Success', 'Business Operations'],
    rounds: [
      'Written round — often essay/communication heavy',
      'Multiple functional interviews (product thinking, writing samples)',
      'Culture-fit conversation',
    ],
    interviewQuestions: [
      { category: 'technical', question: 'What is SaaS and how does its unit economics differ from services?' },
      { category: 'case', question: 'Zoho CRM competes with Salesforce at 1/5th the price. How would you pitch it to a mid-size Indian firm?' },
      { category: 'hr', question: 'Why has Zoho refused venture capital, and what does that mean for how we operate?' },
    ],
    prepTips: [
      'Use at least two Zoho products before the interview — they will ask.',
      'Read Sridhar Vembu\'s posts on rural revival and transnational localism.',
    ],
  },
  {
    name: 'Deloitte (India)',
    slug: 'deloitte',
    sector: 'consulting',
    website: 'https://www.deloitte.com',
    headquarters: 'Global (India offices incl. Chennai)',
    overview:
      'Big 4 firm hiring MBAs across consulting, risk advisory, and USI (US-India) delivery. For TN tier-2/3 B-schools the realistic entry is analyst/consultant roles in USI — a strong brand springboard.',
    businessModel:
      'Professional services: audit, tax, consulting and advisory billed by engagement. USI arm delivers offshore analysis for US clients — the volume recruiter for Indian campuses.',
    whatTheyLookFor:
      'Structured thinking under pressure — case and guesstimate performance dominates. Polish in communication and an evidence-backed "why consulting" story.',
    salaryRange: '₹6 – 12 LPA (campus, role-dependent — indicative)',
    roles: ['Analyst (USI Consulting)', 'Risk Advisory Associate', 'Tax Consultant', 'Business Technology Analyst'],
    rounds: [
      'Aptitude/versant test',
      'Group discussion or case group exercise',
      'Case + guesstimate interview',
      'Partner/HR fit round',
    ],
    interviewQuestions: [
      { category: 'guesstimate', question: 'Estimate the annual market for office coffee vending machines in India.' },
      { category: 'case', question: 'A retail client\'s profits fell 10% while revenue grew. Structure your diagnosis.' },
      { category: 'hr', question: 'Consulting means travel and long hours. What makes you sure this is for you?' },
    ],
    prepTips: [
      'Drill profitability and market-entry case frameworks until they are reflex.',
      'Practice 3 guesstimates aloud with a timer — structure beats the number.',
    ],
  },
  {
    name: 'ITC Limited',
    slug: 'itc',
    sector: 'fmcg',
    website: 'https://www.itcportal.com',
    headquarters: 'Kolkata',
    overview:
      'FMCG conglomerate (Aashirvaad, Sunfeast, Classmate, hotels, paper, agri) whose sales roles are a classic MBA proving ground. TN drives typically hire for area sales and trade-marketing tracks.',
    businessModel:
      'Cigarettes fund an aggressive FMCG-others build-out; distribution muscle (millions of retail outlets) is the moat. Agri-sourcing integration feeds its food brands.',
    whatTheyLookFor:
      'Field toughness. Sales roles mean markets, distributors, vans and heat — they filter hard for people who romanticize FMCG without understanding the grind.',
    salaryRange: '₹6 – 12 LPA (campus, sales roles — indicative)',
    roles: ['Area Executive (Sales)', 'Trade Marketing Associate', 'Category Assistant', 'Supply Chain Executive'],
    rounds: [
      'Aptitude test',
      'Group discussion',
      'Sales/functional interview',
      'HR round',
    ],
    interviewQuestions: [
      { category: 'technical', question: 'Explain the FMCG distribution chain from factory to kirana store, with margins at each step.' },
      { category: 'case', question: 'Sunfeast is losing shelf share to Britannia in Chennai kiranas. What would you check first?' },
      { category: 'hr', question: 'Describe a time you convinced someone who had every reason to say no.' },
    ],
    prepTips: [
      'Visit 5 kirana stores and ask what biscuit sells most and why — use it in the interview.',
      'Know numeric vs weighted distribution, and what a beat plan is.',
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for company seeding…');
    await Company.deleteMany({});
    await Company.insertMany(companies);
    console.log(`✅ Seeded ${companies.length} company prep cards.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();
