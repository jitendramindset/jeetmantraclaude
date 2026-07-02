-- migration-s15-coupons.sql
-- Coupons table and FK wiring into coupon_redemptions (if it exists).

CREATE TABLE IF NOT EXISTS coupons (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code varchar NOT NULL UNIQUE,
  name varchar,
  description text,
  discount_type varchar NOT NULL CHECK (discount_type IN ('percent','flat')),
  discount_value numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2) DEFAULT 0,
  max_discount_amount numeric(10,2),
  max_uses int,
  used_count int DEFAULT 0,
  per_user_limit int DEFAULT 1,
  applicable_to varchar DEFAULT 'all' CHECK (applicable_to IN ('all','courses','plans')),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_by varchar NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, expires_at);

-- Add FK from coupon_redemptions to coupons if coupon_redemptions exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupon_redemptions') THEN
    -- coupon_redemptions.coupon_code references coupons.code
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_coupon_redemptions_coupon'
    ) THEN
      ALTER TABLE coupon_redemptions ADD CONSTRAINT fk_coupon_redemptions_coupon
        FOREIGN KEY (coupon_code) REFERENCES coupons(code) ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
