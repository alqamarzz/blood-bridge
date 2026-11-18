import {
  formatBloodGroup,
  parseBloodGroup,
  formatDistance,
  maskPhone,
  getUrgencyColor,
  getStatusColor,
} from "../src/lib/utils";
import { sendWhatsApp } from "../src/lib/whatsapp";

describe("Matching & Utility Functions", () => {
  describe("Blood Group Mapping", () => {
    it("should format enum values to clinical display strings", () => {
      expect(formatBloodGroup("A_POS")).toBe("A+");
      expect(formatBloodGroup("O_NEG")).toBe("O-");
      expect(formatBloodGroup("AB_POS")).toBe("AB+");
      expect(formatBloodGroup("B_NEG")).toBe("B-");
    });

    it("should parse display strings back to enum values", () => {
      expect(parseBloodGroup("A+")).toBe("A_POS");
      expect(parseBloodGroup("O-")).toBe("O_NEG");
      expect(parseBloodGroup("AB+")).toBe("AB_POS");
      expect(parseBloodGroup("B-")).toBe("B_NEG");
    });
  });

  describe("Location Privacy Masking", () => {
    it("should mask exact distance into coarse rings", () => {
      expect(formatDistance(0.5)).toBe("Less than 1 km away");
      expect(formatDistance(1.4)).toBe("About 1-2 km away");
      expect(formatDistance(3.7)).toBe("About 2-5 km away");
      expect(formatDistance(8.2)).toBe("About 5-10 km away");
      expect(formatDistance(15.0)).toBe("About 10-20 km away");
      expect(formatDistance(25.0)).toBe("More than 20 km away");
    });

    it("should mask phone numbers for unaccepted states", () => {
      expect(maskPhone("+919830012345")).toBe("+91****2345");
    });
  });

  describe("WhatsApp Dispatch Abstraction", () => {
    it("should dispatch via mock provider when Meta API keys are absent", async () => {
      const res = await sendWhatsApp({
        to: "+919830012345",
        template: "donor_volunteer",
        variables: {
          name: "Suman Dey",
          blood_group: "O+",
          hospital_name: "Medical College Kolkata",
          donor_name: "Arpan Sen",
          secure_link: "https://bloodbridge.org/dashboard/requests/123",
        },
      });

      expect(res.success).toBe(true);
      expect(res.mode).toBe("mock");
      expect(res.providerMessageId).toMatch(/^mock_wa_/);
    });
  });
});
