import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { WritingRateLimiter } from "./writing-rate-limit";

describe("WritingRateLimiter", () => {
  it("limits each user to five accepted requests per rolling minute", () => {
    const limiter = new WritingRateLimiter();
    const releases = Array.from({ length: 5 }, (_, index) => {
      const release = limiter.acquire("user-1", 1_000 + index);
      release();
      return release;
    });
    expect(() => limiter.acquire("user-1", 1_005)).toThrowError(TRPCError);
    releases.forEach((release) => release());
    expect(() => limiter.acquire("user-1", 61_001)).not.toThrow();
  });

  it("limits concurrent requests and releases capacity", () => {
    const limiter = new WritingRateLimiter();
    const first = limiter.acquire("user-1", 1_000);
    const second = limiter.acquire("user-1", 1_001);
    expect(() => limiter.acquire("user-1", 1_002)).toThrowError(TRPCError);
    first();
    first();
    expect(() => limiter.acquire("user-1", 1_003)).not.toThrow();
    second();
  });

  it("keeps separate users' quotas independent", () => {
    const limiter = new WritingRateLimiter();
    const releases = Array.from({ length: 5 }, (_, index) => {
      const release = limiter.acquire("user-a", 1_000 + index);
      release();
      return release;
    });
    expect(() => limiter.acquire("user-a", 1_006)).toThrowError(TRPCError);
    expect(() => limiter.acquire("user-b", 1_006)).not.toThrow();
    releases.forEach((release) => release());
  });

  it("rejects missing user identifiers", () => {
    const limiter = new WritingRateLimiter();
    expect(() => limiter.acquire("")).toThrowError(TRPCError);
  });
});
