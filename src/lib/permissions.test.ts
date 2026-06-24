import { describe, it, expect } from "vitest";
import { isActive, isAdmin } from "./permissions";

describe("isActive", () => {
  it("false لِـ null/undefined", () => {
    expect(isActive(null)).toBe(false);
    expect(isActive(undefined)).toBe(false);
  });
  it("false إذا الحالة PENDING", () => {
    expect(isActive({ status: "PENDING", accessLevel: "USER" })).toBe(false);
  });
  it("true إذا الحالة ACTIVE", () => {
    expect(isActive({ status: "ACTIVE", accessLevel: "USER" })).toBe(true);
  });
});

describe("isAdmin", () => {
  it("false لِـ null", () => {
    expect(isAdmin(null)).toBe(false);
  });
  it("false إذا ADMIN لكن PENDING", () => {
    expect(isAdmin({ status: "PENDING", accessLevel: "ADMIN" })).toBe(false);
  });
  it("false إذا ACTIVE لكن USER", () => {
    expect(isAdmin({ status: "ACTIVE", accessLevel: "USER" })).toBe(false);
  });
  it("true إذا ACTIVE و ADMIN", () => {
    expect(isAdmin({ status: "ACTIVE", accessLevel: "ADMIN" })).toBe(true);
  });
});
