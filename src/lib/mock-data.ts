/**
 * Fallback emergency blood requests data for Kolkata
 * Used when database server is booting or offline, ensuring sub-second UI response times.
 */

export const MOCK_BLOOD_REQUESTS = [
  {
    id: "req-kol-001",
    bloodGroup: "O_POS",
    unitsRequired: 2,
    unitsFulfilled: 1,
    hospitalName: "SSKM Hospital (IPGMER)",
    hospitalAddress: "244 AJC Bose Road, Main ICU Block",
    city: "Kolkata",
    requiredBy: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
    urgency: "CRITICAL",
    status: "OPEN",
    contactPhone: "+919830012345",
    additionalInformation: "Urgent emergency requirement for cardiac surgery patient.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    requester: {
      id: "usr-001",
      name: "Debashis Mukherjee",
      phone: "+919830012345",
    },
    _count: {
      donorResponses: 2,
    },
    donorResponses: [
      {
        id: "resp-001",
        status: "INTERESTED" as const,
        statusMessage: "I am available and 3km away near Rabindra Sadan.",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        donor: {
          id: "donor-001",
          name: "Subrata Sen",
          phone: "+919830198765",
          donorProfile: {
            bloodGroup: "O_POS",
            city: "Kolkata",
            area: "Bhowanipore",
          },
        },
      },
    ],
  },
  {
    id: "req-kol-002",
    bloodGroup: "A_POS",
    unitsRequired: 3,
    unitsFulfilled: 0,
    hospitalName: "Medical College and Hospital",
    hospitalAddress: "88 College Street, Sealdah",
    city: "Kolkata",
    requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
    urgency: "URGENT",
    status: "OPEN",
    contactPhone: "+919831122334",
    additionalInformation: "Patient admitted in Hematology ward. Replacement needed.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    requester: {
      id: "usr-002",
      name: "Priyanka Roy",
      phone: "+919831122334",
    },
    _count: {
      donorResponses: 1,
    },
    donorResponses: [],
  },
  {
    id: "req-kol-003",
    bloodGroup: "B_POS",
    unitsRequired: 1,
    unitsFulfilled: 0,
    hospitalName: "Apollo Multispeciality Hospitals",
    hospitalAddress: "58 Canal Circular Rd, Kadapara, Phool Bagan",
    city: "Kolkata",
    requiredBy: new Date(Date.now() + 12 * 60 * 60 * 1000),
    urgency: "CRITICAL",
    status: "OPEN",
    contactPhone: "+919832233445",
    additionalInformation: "Dialysis patient urgently needing 1 unit PRBC.",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    requester: {
      id: "usr-003",
      name: "Amitabh Banerjee",
      phone: "+919832233445",
    },
    _count: {
      donorResponses: 3,
    },
    donorResponses: [],
  },
  {
    id: "req-kol-004",
    bloodGroup: "AB_POS",
    unitsRequired: 2,
    unitsFulfilled: 1,
    hospitalName: "AMRI Hospital",
    hospitalAddress: "Block JC-16 & 17, Sector III, Salt Lake",
    city: "Salt Lake",
    requiredBy: new Date(Date.now() + 36 * 60 * 60 * 1000),
    urgency: "NORMAL",
    status: "OPEN",
    contactPhone: "+919833344556",
    additionalInformation: "Scheduled orthopedic surgery requirement.",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    requester: {
      id: "usr-004",
      name: "Sharmila Ghosh",
      phone: "+919833344556",
    },
    _count: {
      donorResponses: 1,
    },
    donorResponses: [],
  },
  {
    id: "req-kol-005",
    bloodGroup: "O_NEG",
    unitsRequired: 1,
    unitsFulfilled: 0,
    hospitalName: "Ruby General Hospital",
    hospitalAddress: "Kasba Golpark, EM Bypass",
    city: "Kolkata",
    requiredBy: new Date(Date.now() + 8 * 60 * 60 * 1000),
    urgency: "CRITICAL",
    status: "OPEN",
    contactPhone: "+919834455667",
    additionalInformation: "Rare O-Negative requirement for pediatric emergency.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    requester: {
      id: "usr-005",
      name: "Tanmoy Das",
      phone: "+919834455667",
    },
    _count: {
      donorResponses: 0,
    },
    donorResponses: [],
  },
];

// Connectivity circuit breaker state
let isDbOnline = true;
let lastDbCheckTimestamp = 0;
const DB_RETRY_COOLDOWN_MS = 20000; // Retry DB probe every 20 seconds when offline

/**
 * High-performance timeout wrapper with connection circuit-breaker.
 * When the local DB is offline, returns fallback data in 0ms without
 * waiting or freezing the route navigation.
 */
export async function withDbTimeout<T>(
  promise: Promise<T>,
  fallbackValue: T,
  timeoutMs = 120
): Promise<T> {
  const now = Date.now();

  // If DB was recently marked offline, don't wait — return fallback instantly!
  if (!isDbOnline && now - lastDbCheckTimestamp < DB_RETRY_COOLDOWN_MS) {
    return fallbackValue;
  }

  let timer: NodeJS.Timeout;
  let hasTimedOut = false;

  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      hasTimedOut = true;
      isDbOnline = false;
      lastDbCheckTimestamp = Date.now();
      resolve(fallbackValue);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    if (!hasTimedOut) {
      isDbOnline = true;
    }
    return result;
  } catch (_error) {
    clearTimeout(timer!);
    isDbOnline = false;
    lastDbCheckTimestamp = Date.now();
    return fallbackValue;
  }
}
