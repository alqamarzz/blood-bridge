import { PrismaClient, BloodGroup, UrgencyLevel, RequestStatus, ResponseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BloodBridge database seeding...");

  const defaultPassword = await bcrypt.hash("User@1234", 10);
  const adminPassword = await bcrypt.hash("Admin@1234", 10);

  // 1. Create Admin Account
  const admin = await prisma.user.upsert({
    where: { phone: "+919830000001" },
    update: {},
    create: {
      name: "BloodBridge Administrator",
      email: "admin@bloodbridge.org",
      phone: "+919830000001",
      passwordHash: adminPassword,
      role: "ADMIN",
      phoneVerified: true,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email} (Password: Admin@1234)`);

  // 2. Create Requester
  const requester = await prisma.user.upsert({
    where: { phone: "+919830012345" },
    update: {},
    create: {
      name: "Debashis Mukherjee",
      email: "debashis@gmail.com",
      phone: "+919830012345",
      passwordHash: defaultPassword,
      role: "USER",
      phoneVerified: true,
    },
  });
  console.log(`✅ Requester seeded: ${requester.name} (Phone: ${requester.phone})`);

  // 3. Create Sample Donors across Kolkata
  const donorsData = [
    {
      name: "Subrata Sen",
      email: "subrata.sen@example.com",
      phone: "+919830198765",
      bloodGroup: BloodGroup.O_POS,
      city: "Kolkata",
      area: "Bhowanipore",
      latitude: 22.5312,
      longitude: 88.3496,
      preferredRadius: 10,
    },
    {
      name: "Priyanka Roy",
      email: "priyanka.roy@example.com",
      phone: "+919831122334",
      bloodGroup: BloodGroup.A_POS,
      city: "Kolkata",
      area: "Sealdah",
      latitude: 22.5697,
      longitude: 88.3712,
      preferredRadius: 15,
    },
    {
      name: "Amitabh Banerjee",
      email: "amitabh.b@example.com",
      phone: "+919832233445",
      bloodGroup: BloodGroup.B_POS,
      city: "Kolkata",
      area: "Phoolbagan",
      latitude: 22.5726,
      longitude: 88.3985,
      preferredRadius: 10,
    },
    {
      name: "Sharmila Ghosh",
      email: "sharmila.g@example.com",
      phone: "+919833344556",
      bloodGroup: BloodGroup.AB_POS,
      city: "Salt Lake",
      area: "Sector V",
      latitude: 22.5867,
      longitude: 88.4178,
      preferredRadius: 20,
    },
    {
      name: "Tanmoy Das",
      email: "tanmoy.das@example.com",
      phone: "+919834455667",
      bloodGroup: BloodGroup.O_NEG,
      city: "Kolkata",
      area: "Kasba / Ruby",
      latitude: 22.5126,
      longitude: 88.3998,
      preferredRadius: 15,
    },
  ];

  const seededDonors = [];
  for (const d of donorsData) {
    const user = await prisma.user.upsert({
      where: { phone: d.phone },
      update: {},
      create: {
        name: d.name,
        email: d.email,
        phone: d.phone,
        passwordHash: defaultPassword,
        role: "USER",
        phoneVerified: true,
      },
    });

    const profile = await prisma.donorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bloodGroup: d.bloodGroup,
        city: d.city,
        area: d.area,
        latitude: d.latitude,
        longitude: d.longitude,
        preferredRadius: d.preferredRadius,
        isAvailable: true,
        locationConsent: true,
        whatsappOptIn: true,
      },
    });

    seededDonors.push({ user, profile });
  }
  console.log(`✅ Seeded ${seededDonors.length} verified donors across Kolkata.`);

  // 4. Create Active Emergency Blood Requests
  const requestsData = [
    {
      bloodGroup: BloodGroup.O_POS,
      unitsRequired: 2,
      unitsFulfilled: 1,
      hospitalName: "SSKM Hospital (IPGMER)",
      hospitalAddress: "244 AJC Bose Road, Main ICU Block",
      latitude: 22.5396,
      longitude: 88.3433,
      city: "Kolkata",
      requiredBy: new Date(Date.now() + 18 * 60 * 60 * 1000),
      urgency: UrgencyLevel.CRITICAL,
      status: RequestStatus.OPEN,
      contactPhone: "+919830012345",
      additionalInformation: "Urgent emergency requirement for cardiac surgery patient.",
    },
    {
      bloodGroup: BloodGroup.A_POS,
      unitsRequired: 3,
      unitsFulfilled: 0,
      hospitalName: "Medical College and Hospital",
      hospitalAddress: "88 College Street, Sealdah",
      latitude: 22.5726,
      longitude: 88.3639,
      city: "Kolkata",
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
      urgency: UrgencyLevel.URGENT,
      status: RequestStatus.OPEN,
      contactPhone: "+919831122334",
      additionalInformation: "Patient admitted in Hematology ward. Replacement needed.",
    },
    {
      bloodGroup: BloodGroup.B_POS,
      unitsRequired: 1,
      unitsFulfilled: 0,
      hospitalName: "Apollo Multispeciality Hospitals",
      hospitalAddress: "58 Canal Circular Rd, Kadapara, Phool Bagan",
      latitude: 22.5714,
      longitude: 88.4011,
      city: "Kolkata",
      requiredBy: new Date(Date.now() + 12 * 60 * 60 * 1000),
      urgency: UrgencyLevel.CRITICAL,
      status: RequestStatus.OPEN,
      contactPhone: "+919832233445",
      additionalInformation: "Dialysis patient urgently needing 1 unit PRBC.",
    },
    {
      bloodGroup: BloodGroup.AB_POS,
      unitsRequired: 2,
      unitsFulfilled: 1,
      hospitalName: "AMRI Hospital Salt Lake",
      hospitalAddress: "Block JC-16 & 17, Sector III, Salt Lake",
      latitude: 22.5697,
      longitude: 88.4073,
      city: "Salt Lake",
      requiredBy: new Date(Date.now() + 36 * 60 * 60 * 1000),
      urgency: UrgencyLevel.NORMAL,
      status: RequestStatus.OPEN,
      contactPhone: "+919833344556",
      additionalInformation: "Scheduled orthopedic surgery requirement.",
    },
    {
      bloodGroup: BloodGroup.O_NEG,
      unitsRequired: 1,
      unitsFulfilled: 0,
      hospitalName: "Ruby General Hospital",
      hospitalAddress: "Kasba Golpark, EM Bypass",
      latitude: 22.5126,
      longitude: 88.4018,
      city: "Kolkata",
      requiredBy: new Date(Date.now() + 8 * 60 * 60 * 1000),
      urgency: UrgencyLevel.CRITICAL,
      status: RequestStatus.OPEN,
      contactPhone: "+919834455667",
      additionalInformation: "Rare O-Negative requirement for pediatric emergency.",
    },
  ];

  let firstRequest = null;
  for (const req of requestsData) {
    const createdReq = await prisma.bloodRequest.create({
      data: {
        requesterId: requester.id,
        ...req,
      },
    });
    if (!firstRequest) firstRequest = createdReq;
  }
  console.log(`✅ Seeded ${requestsData.length} active emergency blood requests.`);

  // 5. Create a volunteer response for the first request
  if (firstRequest && seededDonors.length > 0) {
    await prisma.donorResponse.create({
      data: {
        requestId: firstRequest.id,
        donorId: seededDonors[0].user.id,
        status: ResponseStatus.INTERESTED,
        statusMessage: "I am available and 3km away near Rabindra Sadan.",
      },
    });
    console.log("✅ Seeded volunteer donor response.");
  }

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
