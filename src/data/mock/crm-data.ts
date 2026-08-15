import {
  Lead,
  Company,
  Contact,
  Customer,
  Activity,
  Task,
  LeadSource,
  LeadStatus,
} from "@/types/crm";

// ==========================================
// 40+ COMPANIES
// ==========================================
export const MOCK_COMPANIES: Company[] = [
  {
    id: "COMP-001",
    companyName: "ABC Electronics Pvt Ltd",
    industry: "Consumer Electronics",
    email: "procurement@abcelectronics.com",
    phone: "+91 22 4900 1200",
    website: "https://abcelectronics.com",
    address: "Plot 42, SEEPZ SEZ, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    taxId: "27AAACA1234H1Z5",
    primaryContactId: "CONT-001",
    primaryContactName: "Rahul Sharma",
    status: "Customer",
    owner: "Dakhani Usman",
    createdAt: "2026-01-15",
  },
  {
    id: "COMP-002",
    companyName: "Nexus Pharmaceuticals Ltd",
    industry: "Pharmaceuticals",
    email: "supplychain@nexuspharma.com",
    phone: "+91 22 2855 9900",
    website: "https://nexuspharma.com",
    address: "Nexus House, BKC G Block",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    taxId: "27AAACN5678J1ZB",
    primaryContactId: "CONT-002",
    primaryContactName: "Dr. Ananya Roy",
    status: "Customer",
    owner: "Dakhani Usman",
    createdAt: "2026-01-20",
  },
  {
    id: "COMP-003",
    companyName: "Global Freight Systems Tech",
    industry: "Industrial Machinery",
    email: "logistics@globalfreightsys.com",
    phone: "+91 11 4150 8820",
    website: "https://globalfreightsys.com",
    address: "Okhla Industrial Area Phase III",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    taxId: "07AAACG9911K1ZC",
    primaryContactId: "CONT-003",
    primaryContactName: "Vikram Malhotra",
    status: "Customer",
    owner: "Priya Nair",
    createdAt: "2026-02-01",
  },
  {
    id: "COMP-004",
    companyName: "Apex Automotive Components",
    industry: "Automotive Parts",
    email: "imports@apexauto.in",
    phone: "+91 44 2625 3300",
    website: "https://apexauto.in",
    address: "Sriperumbudur Auto Hub",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    taxId: "33AAACA4400L1ZD",
    primaryContactId: "CONT-004",
    primaryContactName: "Siddharth Rao",
    status: "Customer",
    owner: "Rohan Varma",
    createdAt: "2026-02-05",
  },
  {
    id: "COMP-005",
    companyName: "SunRise Solar Energy Corp",
    industry: "Renewable Energy",
    email: "shipping@sunrisesolar.com",
    phone: "+91 79 4000 8877",
    website: "https://sunrisesolar.com",
    address: "SG Highway Techno Park",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    taxId: "24AAACS7722M1ZE",
    primaryContactId: "CONT-005",
    primaryContactName: "Meera Patel",
    status: "Active Prospect",
    owner: "Priya Nair",
    createdAt: "2026-02-10",
  },
  {
    id: "COMP-006",
    companyName: "Oceanic Seafood Exporters",
    industry: "Cold Chain & Food",
    email: "exports@oceanicseafood.com",
    phone: "+91 484 221 4500",
    website: "https://oceanicseafood.com",
    address: "Willingdon Island Port Area",
    city: "Kochi",
    state: "Kerala",
    country: "India",
    taxId: "32AAACF1122P1ZF",
    primaryContactId: "CONT-006",
    primaryContactName: "Joseph Fernandez",
    status: "Customer",
    owner: "Rohan Varma",
    createdAt: "2026-02-12",
  },
  {
    id: "COMP-007",
    companyName: "Vanguard Chemical Industries",
    industry: "Specialty Chemicals",
    email: "trade@vanguardchem.com",
    phone: "+91 265 233 4411",
    website: "https://vanguardchem.com",
    address: "GIDC Industrial Estate",
    city: "Vadodara",
    state: "Gujarat",
    country: "India",
    taxId: "24AAACV9988Q1ZG",
    primaryContactId: "CONT-007",
    primaryContactName: "Karan Desai",
    status: "Active Prospect",
    owner: "Dakhani Usman",
    createdAt: "2026-02-15",
  },
  {
    id: "COMP-008",
    companyName: "Titanium Metal Works Ltd",
    industry: "Heavy Engineering",
    email: "procurement@titaniummetal.com",
    phone: "+91 33 2280 5566",
    website: "https://titaniummetal.com",
    address: "Salt Lake Sector V",
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    taxId: "19AAACT3344R1ZH",
    primaryContactId: "CONT-008",
    primaryContactName: "Debashis Banerjee",
    status: "Customer",
    owner: "Priya Nair",
    createdAt: "2026-02-18",
  },
  {
    id: "COMP-009",
    companyName: "Indus Apparel & Textiles",
    industry: "Garments & Textiles",
    email: "logistics@indusapparel.com",
    phone: "+91 421 247 8899",
    website: "https://indusapparel.com",
    address: "Tirupur Textile Zone",
    city: "Tirupur",
    state: "Tamil Nadu",
    country: "India",
    taxId: "33AAACI5566S1ZI",
    primaryContactId: "CONT-009",
    primaryContactName: "K. Subramanian",
    status: "Customer",
    owner: "Rohan Varma",
    createdAt: "2026-02-20",
  },
  {
    id: "COMP-010",
    companyName: "Zenith Consumer Healthcare",
    industry: "FMCG & Wellness",
    email: "shipping@zenithhealth.com",
    phone: "+91 80 4112 7700",
    website: "https://zenithhealth.com",
    address: "Peenya Industrial Area",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    taxId: "29AAACZ7788T1ZJ",
    primaryContactId: "CONT-010",
    primaryContactName: "Neha Kulkarni",
    status: "Customer",
    owner: "Dakhani Usman",
    createdAt: "2026-02-22",
  },
];

// Generate 30 more realistic companies
for (let i = 11; i <= 40; i++) {
  const industries = [
    "Electronics", "Plastics", "Steel & Metals", "Aerospace Parts",
    "Agro Commodities", "Furniture & Decor", "Medical Devices", "Paper & Packaging",
    "Footwear Export", "Solar PV Modules"
  ];
  const cities = ["Pune", "Hyderabad", "Surat", "Jaipur", "Ludhiana", "Noida", "Coimbatore", "Visakhapatnam"];
  const owners = ["Dakhani Usman", "Priya Nair", "Rohan Varma"];
  const ind = industries[i % industries.length];
  const city = cities[i % cities.length];
  const own = owners[i % owners.length];

  MOCK_COMPANIES.push({
    id: `COMP-${i.toString().padStart(3, "0")}`,
    companyName: `Enterprise Trade Hub ${i} Pvt Ltd`,
    industry: ind,
    email: `contact@tradehub${i}.com`,
    phone: `+91 ${city === "Pune" ? "20" : "40"} 4500 ${1000 + i}`,
    website: `https://tradehub${i}.com`,
    address: `Phase ${i % 4 + 1} Industrial Area`,
    city,
    state: "India Region",
    country: "India",
    taxId: `27AAACE${1000 + i}K1Z${i % 9}`,
    primaryContactId: `CONT-${i.toString().padStart(3, "0")}`,
    primaryContactName: `Executive Contact ${i}`,
    status: i % 2 === 0 ? "Customer" : "Active Prospect",
    owner: own,
    createdAt: `2026-03-${(i % 28 + 1).toString().padStart(2, "0")}`,
  });
}

// ==========================================
// 60+ CONTACTS
// ==========================================
export const MOCK_CONTACTS: Contact[] = [
  {
    id: "CONT-001",
    firstName: "Rahul",
    lastName: "Sharma",
    designation: "VP Procurement & Supply Chain",
    email: "rahul.sharma@abcelectronics.com",
    phone: "+91 98200 11223",
    companyId: "COMP-001",
    companyName: "ABC Electronics Pvt Ltd",
    department: "Procurement",
    isPrimary: true,
    notes: "Key decision maker for ocean freight container bookings.",
    createdAt: "2026-01-15",
  },
  {
    id: "CONT-002",
    firstName: "Dr. Ananya",
    lastName: "Roy",
    designation: "Head of Global Logistics",
    email: "ananya.roy@nexuspharma.com",
    phone: "+91 98111 33445",
    companyId: "COMP-002",
    companyName: "Nexus Pharmaceuticals Ltd",
    department: "Global Trade & Compliance",
    isPrimary: true,
    notes: "Requires GDP compliant cold-chain temperature monitoring.",
    createdAt: "2026-01-20",
  },
  {
    id: "CONT-003",
    firstName: "Vikram",
    lastName: "Malhotra",
    designation: "Import Logistics Lead",
    email: "vikram.m@globalfreightsys.com",
    phone: "+91 99300 55667",
    companyId: "COMP-003",
    companyName: "Global Freight Systems Tech",
    department: "Logistics Operations",
    isPrimary: true,
    notes: "Handles air freight shipments from Frankfurt and Shanghai.",
    createdAt: "2026-02-01",
  },
  {
    id: "CONT-004",
    firstName: "Siddharth",
    lastName: "Rao",
    designation: "General Manager - Commercial",
    email: "siddharth.rao@apexauto.in",
    phone: "+91 98400 77889",
    companyId: "COMP-004",
    companyName: "Apex Automotive Components",
    department: "Commercial & Customs",
    isPrimary: true,
    notes: "Focuses on Chennai port customs clearance speed.",
    createdAt: "2026-02-05",
  },
  {
    id: "CONT-005",
    firstName: "Meera",
    lastName: "Patel",
    designation: "Supply Chain Director",
    email: "meera.patel@sunrisesolar.com",
    phone: "+91 97200 99001",
    companyId: "COMP-005",
    companyName: "SunRise Solar Energy Corp",
    department: "Supply Chain Management",
    isPrimary: true,
    notes: "Evaluating ocean freight rates for solar panel shipments from Vietnam.",
    createdAt: "2026-02-10",
  },
];

// Generate 55 more contacts
for (let i = 6; i <= 60; i++) {
  const company = MOCK_COMPANIES[(i - 1) % MOCK_COMPANIES.length];
  const firstNames = ["Amit", "Pooja", "Rajesh", "Sunita", "Deepak", "Kavita", "Sanjay", "Ritu", "Tarun", "Divya"];
  const lastNames = ["Gupta", "Joshi", "Verma", "Mehta", "Singh", "Shah", "Reddy", "Nair", "Chawla", "Bhatia"];
  const designations = [
    "Logistics Manager", "Procurement Specialist", "Customs Documentation Lead",
    "Supply Chain Analyst", "Export Coordinator", "Commercial VP"
  ];
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];

  MOCK_CONTACTS.push({
    id: `CONT-${i.toString().padStart(3, "0")}`,
    firstName: fn,
    lastName: ln,
    designation: designations[i % designations.length],
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.companyName.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    phone: `+91 98${(100 + i).toString().padStart(3, "0")} ${2000 + i}`,
    companyId: company.id,
    companyName: company.companyName,
    department: i % 2 === 0 ? "Logistics" : "Procurement",
    isPrimary: i <= 40 && i === MOCK_COMPANIES.findIndex(c => c.id === company.id) + 1,
    notes: `Contact record for ${fn} ${ln} at ${company.companyName}.`,
    createdAt: `2026-02-${(i % 28 + 1).toString().padStart(2, "0")}`,
  });
}

// ==========================================
// 25+ LEADS
// ==========================================
export const MOCK_LEADS: Lead[] = [
  {
    id: "LEAD-2026-001",
    leadNumber: "LEAD-2026-001",
    companyName: "SunRise Solar Energy Corp",
    contactName: "Meera Patel",
    email: "meera.patel@sunrisesolar.com",
    phone: "+91 97200 99001",
    source: "LinkedIn",
    status: "Proposal",
    owner: "Priya Nair",
    industry: "Renewable Energy",
    location: "Ahmedabad, Gujarat",
    estimatedValue: 4500000, // ₹45 L
    expectedCloseDate: "2026-08-30",
    notes: "Requires 15x40HC containers for solar inverter modules from Ningbo to JNPT Port.",
    createdAt: "2026-07-01",
    updatedAt: "2026-08-10",
  },
  {
    id: "LEAD-2026-002",
    leadNumber: "LEAD-2026-002",
    companyName: "Vanguard Chemical Industries",
    contactName: "Karan Desai",
    email: "trade@vanguardchem.com",
    phone: "+91 265 233 4411",
    source: "Trade Show",
    status: "Qualified",
    owner: "Dakhani Usman",
    industry: "Specialty Chemicals",
    location: "Vadodara, Gujarat",
    estimatedValue: 2800000, // ₹28 L
    expectedCloseDate: "2026-09-15",
    notes: "Hazmat / ISO Tank container shipment inquiries for Rotterdam export.",
    createdAt: "2026-07-05",
    updatedAt: "2026-08-11",
  },
  {
    id: "LEAD-2026-003",
    leadNumber: "LEAD-2026-003",
    companyName: "Titanium Metal Works Ltd",
    contactName: "Debashis Banerjee",
    email: "debashis.b@titaniummetal.com",
    phone: "+91 33 2280 5566",
    source: "Referral",
    status: "Won",
    owner: "Priya Nair",
    industry: "Heavy Engineering",
    location: "Kolkata, West Bengal",
    estimatedValue: 6200000,
    expectedCloseDate: "2026-08-01",
    convertedCustomerId: "CUS-2026-008",
    notes: "Converted to active customer following breakbulk freight agreement.",
    createdAt: "2026-06-15",
    updatedAt: "2026-08-02",
  },
  {
    id: "LEAD-2026-004",
    leadNumber: "LEAD-2026-004",
    companyName: "BioGen Life Sciences",
    contactName: "Dr. Ramesh Iyer",
    email: "ramesh.iyer@biogenlife.com",
    phone: "+91 80 2345 6789",
    source: "Website",
    status: "Contacted",
    owner: "Rohan Varma",
    industry: "Pharmaceuticals",
    location: "Bengaluru, Karnataka",
    estimatedValue: 1800000,
    expectedCloseDate: "2026-09-30",
    notes: "Inquired for air freight temp-controlled pharma shipments to Frankfurt.",
    createdAt: "2026-07-20",
    updatedAt: "2026-08-08",
  },
  {
    id: "LEAD-2026-005",
    leadNumber: "LEAD-2026-005",
    companyName: "Urban Home Crafts Ltd",
    contactName: "Sanjay Singhania",
    email: "sanjay@urbanhomecrafts.in",
    phone: "+91 141 277 8899",
    source: "Email",
    status: "New",
    owner: "Dakhani Usman",
    industry: "Furniture & Handicrafts",
    location: "Jaipur, Rajasthan",
    estimatedValue: 1200000,
    expectedCloseDate: "2026-10-15",
    notes: "Exporting wooden furniture 40ft containers to Long Beach USA.",
    createdAt: "2026-08-10",
    updatedAt: "2026-08-10",
  },
];

// Generate 21 more realistic leads
for (let i = 6; i <= 26; i++) {
  const sources: LeadSource[] = ["Website", "Referral", "Email", "Phone", "LinkedIn", "Advertisement", "Trade Show", "Partner"];
  const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost", "Unqualified"];
  const owners = ["Dakhani Usman", "Priya Nair", "Rohan Varma"];
  const company = MOCK_COMPANIES[(i + 5) % MOCK_COMPANIES.length];

  MOCK_LEADS.push({
    id: `LEAD-2026-${i.toString().padStart(3, "0")}`,
    leadNumber: `LEAD-2026-${i.toString().padStart(3, "0")}`,
    companyName: company.companyName,
    contactName: company.primaryContactName || `Contact Person ${i}`,
    email: company.email,
    phone: company.phone,
    source: sources[i % sources.length],
    status: statuses[i % statuses.length],
    owner: owners[i % owners.length],
    industry: company.industry,
    location: `${company.city}, ${company.state}`,
    estimatedValue: (i * 150000) + 800000,
    expectedCloseDate: `2026-09-${(i % 25 + 1).toString().padStart(2, "0")}`,
    notes: `Lead opportunity for ${company.industry} freight forwarding.`,
    createdAt: `2026-07-${(i % 28 + 1).toString().padStart(2, "0")}`,
    updatedAt: `2026-08-${(i % 12 + 1).toString().padStart(2, "0")}`,
  });
}

// ==========================================
// 25+ CUSTOMERS
// ==========================================
export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "CUS-2026-001",
    customerNumber: "CUS-2026-001",
    companyId: "COMP-001",
    companyName: "ABC Electronics Pvt Ltd",
    industry: "Consumer Electronics",
    status: "Active",
    category: "VIP Enterprise",
    accountOwner: "Dakhani Usman",
    primaryContactName: "Rahul Sharma",
    primaryContactEmail: "rahul.sharma@abcelectronics.com",
    primaryContactPhone: "+91 98200 11223",
    country: "India",
    city: "Mumbai",
    creditLimit: 10000000, // ₹1 Cr
    paymentTerms: "Net 30 Days",
    createdAt: "2026-01-15",
    updatedAt: "2026-08-12",
  },
  {
    id: "CUS-2026-002",
    customerNumber: "CUS-2026-002",
    companyId: "COMP-002",
    companyName: "Nexus Pharmaceuticals Ltd",
    industry: "Pharmaceuticals",
    status: "Active",
    category: "VIP Enterprise",
    accountOwner: "Dakhani Usman",
    primaryContactName: "Dr. Ananya Roy",
    primaryContactEmail: "ananya.roy@nexuspharma.com",
    primaryContactPhone: "+91 98111 33445",
    country: "India",
    city: "Mumbai",
    creditLimit: 15000000, // ₹1.5 Cr
    paymentTerms: "Net 45 Days",
    createdAt: "2026-01-20",
    updatedAt: "2026-08-12",
  },
  {
    id: "CUS-2026-003",
    customerNumber: "CUS-2026-003",
    companyId: "COMP-003",
    companyName: "Global Freight Systems Tech",
    industry: "Industrial Machinery",
    status: "Active",
    category: "Key Account",
    accountOwner: "Priya Nair",
    primaryContactName: "Vikram Malhotra",
    primaryContactEmail: "vikram.m@globalfreightsys.com",
    primaryContactPhone: "+91 99300 55667",
    country: "India",
    city: "New Delhi",
    creditLimit: 7500000,
    paymentTerms: "Net 30 Days",
    createdAt: "2026-02-01",
    updatedAt: "2026-08-10",
  },
  {
    id: "CUS-2026-004",
    customerNumber: "CUS-2026-004",
    companyId: "COMP-004",
    companyName: "Apex Automotive Components",
    industry: "Automotive Parts",
    status: "Active",
    category: "Key Account",
    accountOwner: "Rohan Varma",
    primaryContactName: "Siddharth Rao",
    primaryContactEmail: "siddharth.rao@apexauto.in",
    primaryContactPhone: "+91 98400 77889",
    country: "India",
    city: "Chennai",
    creditLimit: 5000000,
    paymentTerms: "Net 30 Days",
    createdAt: "2026-02-05",
    updatedAt: "2026-08-11",
  },
  {
    id: "CUS-2026-006",
    customerNumber: "CUS-2026-006",
    companyId: "COMP-006",
    companyName: "Oceanic Seafood Exporters",
    industry: "Cold Chain & Food",
    status: "Active",
    category: "Standard",
    accountOwner: "Rohan Varma",
    primaryContactName: "Joseph Fernandez",
    primaryContactEmail: "exports@oceanicseafood.com",
    primaryContactPhone: "+91 484 221 4500",
    country: "India",
    city: "Kochi",
    creditLimit: 4000000,
    paymentTerms: "Net 15 Days",
    createdAt: "2026-02-12",
    updatedAt: "2026-08-05",
  },
];

// Generate 20 more customers
for (let i = 7; i <= 26; i++) {
  const company = MOCK_COMPANIES[(i - 1) % MOCK_COMPANIES.length];
  const categories: Customer["category"][] = ["VIP Enterprise", "Key Account", "Standard"];
  const owners = ["Dakhani Usman", "Priya Nair", "Rohan Varma"];

  MOCK_CUSTOMERS.push({
    id: `CUS-2026-${i.toString().padStart(3, "0")}`,
    customerNumber: `CUS-2026-${i.toString().padStart(3, "0")}`,
    companyId: company.id,
    companyName: company.companyName,
    industry: company.industry,
    status: i % 10 === 0 ? "On Hold" : "Active",
    category: categories[i % categories.length],
    accountOwner: owners[i % owners.length],
    primaryContactName: company.primaryContactName || `Contact ${i}`,
    primaryContactEmail: company.email,
    primaryContactPhone: company.phone,
    country: company.country,
    city: company.city,
    creditLimit: (i * 200000) + 2000000,
    paymentTerms: i % 2 === 0 ? "Net 30 Days" : "Net 45 Days",
    createdAt: `2026-02-${(i % 28 + 1).toString().padStart(2, "0")}`,
    updatedAt: `2026-08-${(i % 12 + 1).toString().padStart(2, "0")}`,
  });
}

// ==========================================
// 100+ ACTIVITIES
// ==========================================
export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "ACT-001",
    type: "Meeting",
    title: "Quarterly Freight Contract Review with ABC Electronics",
    description: "Discussed annual 40HC container allocation and JNPT port drayage SLAs.",
    relatedEntity: "Customer",
    relatedEntityId: "CUS-2026-001",
    relatedEntityName: "ABC Electronics Pvt Ltd",
    assignedTo: "Dakhani Usman",
    dueDate: "2026-08-10",
    completedAt: "2026-08-10 15:30",
    status: "Completed",
    createdAt: "2026-08-08",
  },
  {
    id: "ACT-002",
    type: "Call",
    title: "Cold-chain Pharma Transit Update Call",
    description: "Confirmed GDP temperature compliance loggers for Nexus Pharma air cargo.",
    relatedEntity: "Customer",
    relatedEntityId: "CUS-2026-002",
    relatedEntityName: "Nexus Pharmaceuticals Ltd",
    assignedTo: "Dakhani Usman",
    dueDate: "2026-08-12",
    completedAt: "2026-08-12 11:00",
    status: "Completed",
    createdAt: "2026-08-11",
  },
  {
    id: "ACT-003",
    type: "Note",
    title: "Solar Module Freight Rate Proposal",
    description: "Submitted ocean freight rate quotation for 15x40HC containers from Ningbo.",
    relatedEntity: "Lead",
    relatedEntityId: "LEAD-2026-001",
    relatedEntityName: "SunRise Solar Energy Corp",
    assignedTo: "Priya Nair",
    dueDate: "2026-08-14",
    status: "Upcoming",
    createdAt: "2026-08-09",
  },
  {
    id: "ACT-004",
    type: "Follow-up",
    title: "Hazmat ISO Tank Documentation Clearance",
    description: "Followed up with Vadodara customs agent regarding Vanguard Chemical MSDS clearance.",
    relatedEntity: "Lead",
    relatedEntityId: "LEAD-2026-002",
    relatedEntityName: "Vanguard Chemical Industries",
    assignedTo: "Dakhani Usman",
    dueDate: "2026-08-13",
    status: "In Progress",
    createdAt: "2026-08-11",
  },
];

// Generate 97 more activities
for (let i = 5; i <= 100; i++) {
  const types: Activity["type"][] = ["Call", "Email", "Meeting", "Follow-up", "Note", "Task"];
  const statuses: Activity["status"][] = ["Upcoming", "In Progress", "Completed", "Overdue"];
  const owners = ["Dakhani Usman", "Priya Nair", "Rohan Varma"];
  const lead = MOCK_LEADS[(i - 1) % MOCK_LEADS.length];
  const type = types[i % types.length];

  MOCK_ACTIVITIES.push({
    id: `ACT-${i.toString().padStart(3, "0")}`,
    type,
    title: `${type} with ${lead.companyName}`,
    description: `Logistics communication log regarding ocean/air freight booking requirements and customs clearance.`,
    relatedEntity: i % 2 === 0 ? "Lead" : "Customer",
    relatedEntityId: i % 2 === 0 ? lead.id : `CUS-2026-${((i % 25) + 1).toString().padStart(3, "0")}`,
    relatedEntityName: lead.companyName,
    assignedTo: owners[i % owners.length],
    dueDate: `2026-08-${(i % 28 + 1).toString().padStart(2, "0")}`,
    completedAt: i % 3 === 0 ? `2026-08-${(i % 12 + 1).toString().padStart(2, "0")} 14:00` : undefined,
    status: statuses[i % statuses.length],
    createdAt: `2026-08-01`,
  });
}

// ==========================================
// 50+ TASKS
// ==========================================
export const MOCK_TASKS: Task[] = [
  {
    id: "TASK-001",
    title: "Call Rahul Sharma tomorrow regarding Q3 container forecast",
    description: "Confirm 40HC container requirement for Mumbai to Dubai trade lane.",
    assignee: "Dakhani Usman",
    dueDate: "2026-08-14",
    priority: "High",
    status: "Pending",
    relatedEntity: "Customer",
    relatedEntityId: "CUS-2026-001",
    relatedEntityName: "ABC Electronics Pvt Ltd",
    createdAt: "2026-08-12",
  },
  {
    id: "TASK-002",
    title: "Send ocean freight rate quotation for SunRise Solar",
    description: "Calculate Ningbo → JNPT freight rates + THCs + ICD Dadri drayage.",
    assignee: "Priya Nair",
    dueDate: "2026-08-13",
    priority: "Urgent",
    status: "In Progress",
    relatedEntity: "Lead",
    relatedEntityId: "LEAD-2026-001",
    relatedEntityName: "SunRise Solar Energy Corp",
    createdAt: "2026-08-11",
  },
  {
    id: "TASK-003",
    title: "Verify Hazmat MSDS docs for Vanguard Chemical",
    description: "Check Class 3 flammable liquid transportation approval certificates.",
    assignee: "Dakhani Usman",
    dueDate: "2026-08-15",
    priority: "Medium",
    status: "Pending",
    relatedEntity: "Lead",
    relatedEntityId: "LEAD-2026-002",
    relatedEntityName: "Vanguard Chemical Industries",
    createdAt: "2026-08-10",
  },
  {
    id: "TASK-004",
    title: "Confirm air freight space allocation with Lufthansa Cargo",
    description: "Book 3.5 tons pharma air cargo space for Nexus Pharma BOM-FRA flight.",
    assignee: "Dakhani Usman",
    dueDate: "2026-08-11",
    priority: "High",
    status: "Completed",
    relatedEntity: "Customer",
    relatedEntityId: "CUS-2026-002",
    relatedEntityName: "Nexus Pharmaceuticals Ltd",
    createdAt: "2026-08-09",
  },
];

// Generate 46 more tasks
for (let i = 5; i <= 50; i++) {
  const priorities: Task["priority"][] = ["Low", "Medium", "High", "Urgent"];
  const statuses: Task["status"][] = ["Pending", "In Progress", "Completed", "Overdue"];
  const owners = ["Dakhani Usman", "Priya Nair", "Rohan Varma"];
  const lead = MOCK_LEADS[(i - 1) % MOCK_LEADS.length];

  MOCK_TASKS.push({
    id: `TASK-${i.toString().padStart(3, "0")}`,
    title: `Follow up with ${lead.companyName} on commercial rate agreement`,
    description: `Contact ${lead.contactName} regarding customs documentation and freight schedules.`,
    assignee: owners[i % owners.length],
    dueDate: `2026-08-${(i % 25 + 1).toString().padStart(2, "0")}`,
    priority: priorities[i % priorities.length],
    status: statuses[i % statuses.length],
    relatedEntity: i % 2 === 0 ? "Lead" : "Customer",
    relatedEntityId: i % 2 === 0 ? lead.id : `CUS-2026-${((i % 25) + 1).toString().padStart(3, "0")}`,
    relatedEntityName: lead.companyName,
    createdAt: `2026-08-05`,
  });
}
