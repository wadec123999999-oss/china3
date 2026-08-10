import { describe, expect, it } from "vitest";
import { CITIES, CITY_DETAILS } from "@/lib/constants";
import { demoExperts } from "@/lib/demo-data";
import { splitFee, usd } from "@/lib/money";

describe("demo config", () => {
  it("includes the first launch cities", () => {
    expect(CITIES).toEqual([
      "Beijing",
      "Jingdezhen",
      "Chongqing",
      "Chengdu",
      "Quanzhou",
    ]);
  });

  it("formats money and splits fees", () => {
    expect(usd(12500)).toBe("$125.00");
    expect(splitFee(10001)).toEqual({
      platform: 2500,
      expert: 7501,
    });
  });

  it("includes a demo expert per launch city mix", () => {
    expect(demoExperts.map((expert) => expert.city)).toEqual([
      "Jingdezhen",
      "Beijing",
      "Chengdu",
      "Chongqing",
      "Quanzhou",
    ]);
  });

  it("defines a city detail route for every launch city", () => {
    expect(CITIES.map((city) => CITY_DETAILS[city].slug)).toEqual([
      "beijing",
      "jingdezhen",
      "chongqing",
      "chengdu",
      "quanzhou",
    ]);
  });

  it("keeps city detail metadata aligned with demo experts", () => {
    expect(new Set(demoExperts.map((expert) => expert.city))).toEqual(new Set(CITIES));
  });
});
