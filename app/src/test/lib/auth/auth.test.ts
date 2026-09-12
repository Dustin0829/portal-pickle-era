import { beforeEach, describe, expect, it } from "vitest";
import {
  signupAccount,
  loginAccount,
  getSession,
  logoutAccount,
} from "@/lib/auth/auth";

describe("auth stub", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("rejects short passwords on signup", async () => {
    await expect(
      signupAccount({
        name: "Ada",
        email: "ada@example.com",
        password: "short",
      }),
    ).rejects.toThrow(/at least 8/i);
    expect(getSession()).toBeNull();
  });

  it("rejects duplicate email on signup", async () => {
    await signupAccount({
      name: "Ada",
      email: "ada@example.com",
      password: "password1",
    });
    logoutAccount();

    await expect(
      signupAccount({
        name: "Other",
        email: "ada@example.com",
        password: "password2",
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it("signs up and logs in", async () => {
    await signupAccount({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password1",
    });
    expect(getSession()?.email).toBe("ada@example.com");

    logoutAccount();
    expect(getSession()).toBeNull();

    const user = await loginAccount({
      email: "ada@example.com",
      password: "password1",
    });
    expect(user.name).toBe("Ada Lovelace");
  });
});
