import { registerSchema, loginSchema, otpSchema } from "../src/validations/auth";
import { donorProfileSchema } from "../src/validations/donor";
import { createRequestSchema, donorResponseSchema, updateResponseStatusSchema } from "../src/validations/request";

describe("BloodBridge Validation Suite", () => {
  describe("Authentication Validations", () => {
    it("should accept valid Indian phone numbers with +91 prefix", () => {
      const valid = registerSchema.safeParse({
        name: "Rahul Sharma",
        phone: "+919830123456",
        email: "rahul@example.com",
        password: "Password123",
        city: "Kolkata",
        termsAccepted: true,
      });
      expect(valid.success).toBe(true);
    });

    it("should reject invalid phone format without +91", () => {
      const invalid = registerSchema.safeParse({
        name: "Rahul Sharma",
        phone: "9830123456",
        password: "Password123",
        city: "Kolkata",
        termsAccepted: true,
      });
      expect(invalid.success).toBe(false);
    });

    it("should require password with upper, lower, and digit", () => {
      const weakPassword = registerSchema.safeParse({
        name: "Rahul Sharma",
        phone: "+919830123456",
        password: "simplepassword",
        city: "Kolkata",
        termsAccepted: true,
      });
      expect(weakPassword.success).toBe(false);
    });

    it("should validate 6-digit OTP", () => {
      expect(otpSchema.safeParse({ phone: "+919830123456", otp: "123456" }).success).toBe(true);
      expect(otpSchema.safeParse({ phone: "+919830123456", otp: "123" }).success).toBe(false);
      expect(otpSchema.safeParse({ phone: "+919830123456", otp: "abcdef" }).success).toBe(false);
    });
  });

  describe("Donor Profile Validations", () => {
    it("should validate valid blood groups", () => {
      const valid = donorProfileSchema.safeParse({
        bloodGroup: "O_POS",
        city: "Kolkata",
        preferredRadius: 10,
        isAvailable: true,
        whatsappOptIn: true,
        locationConsent: true,
      });
      expect(valid.success).toBe(true);
    });

    it("should reject invalid blood group string", () => {
      const invalid = donorProfileSchema.safeParse({
        bloodGroup: "XYZ",
        city: "Kolkata",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("Blood Request Validations", () => {
    it("should require a future deadline date", () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      const pastReq = createRequestSchema.safeParse({
        bloodGroup: "A_POS",
        unitsRequired: 2,
        hospitalName: "SSKM Hospital",
        hospitalAddress: "244 AJC Bose Road",
        city: "Kolkata",
        requiredBy: pastDate,
        urgency: "URGENT",
      });
      expect(pastReq.success).toBe(false);
    });

    it("should accept valid blood request", () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const validReq = createRequestSchema.safeParse({
        bloodGroup: "B_POS",
        unitsRequired: 3,
        hospitalName: "Apollo Multispeciality",
        hospitalAddress: "Canal Circular Rd, Kadapara",
        city: "Kolkata",
        requiredBy: futureDate,
        urgency: "CRITICAL",
      });
      expect(validReq.success).toBe(true);
    });
  });
});
