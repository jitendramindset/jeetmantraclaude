-- Migration: per-user coupon redemption ledger
-- Purpose: enforce that a coupon can't be reused by the SAME user, and make the
-- max_uses cap reliable. The UNIQUE(coupon_code, user_id) constraint is the
-- enforcement point; the backend inserts a row when a payment is verified and
-- treats a unique-violation as "already redeemed by this user".
--
-- Types are TEXT (not typed FKs) on purpose: jeetmantra_users.id is varchar on
-- the self-hosted instance and coupons are keyed by their code, so TEXT avoids
-- any uuid/varchar mismatch. Idempotent (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code text NOT NULL,
  user_id     text NOT NULL,
  payment_id  text,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coupon_redemptions_code_user_uniq UNIQUE (coupon_code, user_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_code ON coupon_redemptions (coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions (user_id);
