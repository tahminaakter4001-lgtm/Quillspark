import { TRPCError } from "@trpc/server";

type UserBucket = {
  requestTimes: number[];
  inFlight: number;
  lastSeenAt: number;
};

/**
 * Process-local guard for expensive AI writing requests.
 *
 * Limits each authenticated user to 5 accepted requests per rolling minute
 * and at most 2 concurrent requests. For horizontally scaled deployments,
 * replace this store with a shared atomic Redis/database implementation.
 */
export class WritingRateLimiter {
  private readonly buckets = new Map<string, UserBucket>();

  constructor(
    private readonly maxRequests = 5,
    private readonly windowMs = 60_000,
    private readonly maxConcurrent = 2,
    private readonly maxUsers = 10_000,
  ) {}

  acquire(userId: string, now = Date.now()): () => void {
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication is required." });
    }

    this.prune(now);
    let bucket = this.buckets.get(userId);
    if (!bucket) {
      if (this.buckets.size >= this.maxUsers) {
        const oldestIdle = [...this.buckets.entries()]
          .filter(([, value]) => value.inFlight === 0)
          .sort((a, b) => a[1].lastSeenAt - b[1].lastSeenAt)[0];
        if (oldestIdle) this.buckets.delete(oldestIdle[0]);
      }
      if (this.buckets.size >= this.maxUsers) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "The writing service is busy. Please try again shortly.",
        });
      }
      bucket = { requestTimes: [], inFlight: 0, lastSeenAt: now };
      this.buckets.set(userId, bucket);
    }

    bucket.requestTimes = bucket.requestTimes.filter((time) => now - time < this.windowMs);
    bucket.lastSeenAt = now;

    if (bucket.inFlight >= this.maxConcurrent) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "You already have multiple writing requests in progress. Wait for one to finish.",
      });
    }

    if (bucket.requestTimes.length >= this.maxRequests) {
      const retryAfterMs = Math.max(1, this.windowMs - (now - bucket.requestTimes[0]));
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Writing request limit reached. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
      });
    }

    bucket.requestTimes.push(now);
    bucket.inFlight += 1;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      bucket!.inFlight = Math.max(0, bucket!.inFlight - 1);
      bucket!.lastSeenAt = Date.now();
    };
  }

  private prune(now: number) {
    for (const [userId, bucket] of this.buckets) {
      bucket.requestTimes = bucket.requestTimes.filter((time) => now - time < this.windowMs);
      if (bucket.inFlight === 0 && bucket.requestTimes.length === 0) {
        this.buckets.delete(userId);
      }
    }
  }
}

export const writingRateLimiter = new WritingRateLimiter();
