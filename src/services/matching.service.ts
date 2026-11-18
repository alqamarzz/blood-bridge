import prisma from "@/lib/prisma";
import { DEFAULT_SEARCH_RADII } from "@/lib/constants";
import { formatDistance } from "@/lib/utils";

interface MatchingCriteria {
  bloodGroup: string;
  latitude?: number | null;
  longitude?: number | null;
  city: string;
  requestId: string;
  radiusKm?: number;
}

interface MatchedDonor {
  id: string;
  userId: string;
  bloodGroup: string;
  city: string;
  area: string | null;
  approximateDistance: string;
  distanceKm: number;
  user: {
    id: string;
    name: string;
  };
}

/**
 * Find nearby donors matching a blood request.
 *
 * Uses progressive radius expansion: starts at 5km, then 10km, then 20km.
 * Only returns donors who:
 * - Match the blood group
 * - Are available
 * - Haven't already responded to this request
 * - Are not suspended
 * - Have given location consent (if location-based filtering is used)
 *
 * IMPORTANT: This engine performs exact blood-group matching only.
 * ABO/Rh compatibility for specific blood components must be determined
 * by qualified medical professionals and licensed blood banks.
 */
export async function findNearbyDonors(
  criteria: MatchingCriteria
): Promise<MatchedDonor[]> {
  const { bloodGroup, latitude, longitude, city, requestId, radiusKm } = criteria;

  // Get donors who already responded to this request
  const existingResponses = await prisma.donorResponse.findMany({
    where: { requestId },
    select: { donorId: true },
  });
  const respondedDonorIds = existingResponses.map((r) => r.donorId);

  // If we have coordinates, use distance-based search
  if (latitude != null && longitude != null) {
    return findDonorsByDistance(
      bloodGroup,
      latitude,
      longitude,
      requestId,
      respondedDonorIds,
      radiusKm
    );
  }

  // Fallback: city-based matching when no coordinates are available
  return findDonorsByCity(bloodGroup, city, requestId, respondedDonorIds);
}

/**
 * Find donors using geographic distance.
 *
 * Uses the Haversine formula approximation via SQL since PostGIS
 * raw queries require specific setup. For PostGIS-enabled databases,
 * ST_DWithin provides better performance with spatial indexes.
 */
async function findDonorsByDistance(
  bloodGroup: string,
  latitude: number,
  longitude: number,
  requestId: string,
  excludeDonorIds: string[],
  specificRadius?: number
): Promise<MatchedDonor[]> {
  const radii = specificRadius ? [specificRadius] : [...DEFAULT_SEARCH_RADII];
  let donors: MatchedDonor[] = [];

  for (const radiusKm of radii) {
    // Use Haversine formula for distance calculation
    // This works with standard PostgreSQL. For PostGIS, replace with ST_DWithin.
    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        userId: string;
        bloodGroup: string;
        city: string;
        area: string | null;
        latitude: number;
        longitude: number;
        userName: string;
        distance_km: number;
      }>
    >`
      SELECT
        dp.id,
        dp."userId",
        dp."bloodGroup",
        dp.city,
        dp.area,
        dp.latitude,
        dp.longitude,
        u.name as "userName",
        (
          6371 * acos(
            cos(radians(${latitude}))
            * cos(radians(dp.latitude))
            * cos(radians(dp.longitude) - radians(${longitude}))
            + sin(radians(${latitude}))
            * sin(radians(dp.latitude))
          )
        ) as distance_km
      FROM donor_profiles dp
      JOIN users u ON u.id = dp."userId"
      WHERE dp."bloodGroup" = ${bloodGroup}::"BloodGroup"
        AND dp."isAvailable" = true
        AND dp."locationConsent" = true
        AND dp.latitude IS NOT NULL
        AND dp.longitude IS NOT NULL
        AND u.suspended = false
        AND u."phoneVerified" = true
        ${excludeDonorIds.length > 0
          ? prisma.$queryRaw`AND dp."userId" NOT IN (${prisma.$queryRaw`${excludeDonorIds.join("','")}`})`
          : prisma.$queryRaw``
        }
      HAVING (
        6371 * acos(
          cos(radians(${latitude}))
          * cos(radians(dp.latitude))
          * cos(radians(dp.longitude) - radians(${longitude}))
          + sin(radians(${latitude}))
          * sin(radians(dp.latitude))
        )
      ) <= ${radiusKm}
      ORDER BY distance_km ASC
      LIMIT 50
    `;

    if (results.length > 0) {
      donors = results.map((r) => ({
        id: r.id,
        userId: r.userId,
        bloodGroup: r.bloodGroup,
        city: r.city,
        area: r.area,
        approximateDistance: formatDistance(r.distance_km),
        distanceKm: r.distance_km,
        user: {
          id: r.userId,
          name: r.userName,
        },
      }));
      break; // Found donors in this radius, stop expanding
    }
  }

  return donors;
}

/**
 * Find donors by city when geographic coordinates are not available.
 */
async function findDonorsByCity(
  bloodGroup: string,
  city: string,
  requestId: string,
  excludeDonorIds: string[]
): Promise<MatchedDonor[]> {
  const donors = await prisma.donorProfile.findMany({
    where: {
      bloodGroup: bloodGroup as never,
      isAvailable: true,
      city,
      userId: {
        notIn: excludeDonorIds,
      },
      user: {
        suspended: false,
        phoneVerified: true,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: 50,
  });

  return donors.map((d) => ({
    id: d.id,
    userId: d.userId,
    bloodGroup: d.bloodGroup,
    city: d.city,
    area: d.area,
    approximateDistance: "Same city",
    distanceKm: 0,
    user: d.user,
  }));
}

/**
 * Get nearby active blood requests for a donor.
 */
export async function findNearbyRequests(params: {
  donorId: string;
  bloodGroup: string;
  latitude?: number | null;
  longitude?: number | null;
  city: string;
  radiusKm?: number;
}) {
  const { donorId, bloodGroup, latitude, longitude, city, radiusKm = 10 } = params;

  // Get requests the donor has already responded to
  const existingResponses = await prisma.donorResponse.findMany({
    where: { donorId },
    select: { requestId: true },
  });
  const respondedRequestIds = existingResponses.map((r) => r.requestId);

  const where: Record<string, unknown> = {
    bloodGroup: bloodGroup as never,
    status: { in: ["OPEN", "PARTIALLY_FILLED"] },
    requiredBy: { gt: new Date() },
    id: { notIn: respondedRequestIds },
    requesterId: { not: donorId }, // Don't show own requests
  };

  // If no coordinates, fall back to city
  if (latitude == null || longitude == null) {
    where.city = city;
  }

  const requests = await prisma.bloodRequest.findMany({
    where,
    include: {
      requester: {
        select: { id: true, name: true },
      },
      _count: {
        select: { donorResponses: true },
      },
    },
    orderBy: [
      { urgency: "desc" },
      { createdAt: "desc" },
    ],
    take: 20,
  });

  // If we have coordinates, calculate and add approximate distance
  if (latitude != null && longitude != null) {
    return requests
      .map((req) => {
        let distanceKm = 0;
        if (req.latitude != null && req.longitude != null) {
          distanceKm = haversineDistance(
            latitude,
            longitude,
            req.latitude,
            req.longitude
          );
        }
        return {
          ...req,
          approximateDistance: formatDistance(distanceKm),
          distanceKm,
        };
      })
      .filter((req) => req.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return requests.map((req) => ({
    ...req,
    approximateDistance: "Same city",
    distanceKm: 0,
  }));
}

/**
 * Haversine distance calculation between two points.
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
