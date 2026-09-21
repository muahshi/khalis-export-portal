-- 0005_reconcile_approved_changes.sql
-- Targeted, approved, source-confirmed reconciliation. NOT a full Excel sync.
--
--   1. Insert THE QUEEN   (6290360815008) + link + carton + price
--   2. Insert EZRAH       (6290360817071) + link + price (NO carton: not in source)
--   3. Kirkire            (6290360810737) -> add missing carton row + price row only
--   4. 25 NO STOCK products (exact barcodes) -> status = 'DRAFT' only
--
-- Guarantees: barcode-keyed, additive/update-only, no deletes, no collection
-- rebuild, no slug changes, no blanks over valid data, idempotent (re-run = no-op).
-- Everything runs inside ONE transaction (this single DO block is atomic; apply
-- via the Supabase migration runner / CLI, which wraps it in a transaction).
-- Any failed precondition or assertion RAISES and rolls back ALL writes.
--
-- Names follow the project convention (Title Case; 0 of 613 existing names are
-- upper-case). Notes/inspiration are inserted exactly as in the Excel source.

DO $reconcile$
DECLARE
  c_nostock constant text[] := ARRAY[
    '6290360810232','6290360810355','6290360810461','6290360810577','6290360810645',
    '6290360811772','6290360811802','6290360811819','6290360811833','6290360812632',
    '6290360812700','6290360812717','6290360813165','6290360814223','6290360814261',
    '6290360814278','6290360814285','6290360814292','6290360814308','6290360814322',
    '6299122510113','6299122534164','6299122534171','6299122541667','6299122541773'];
  c_new     constant text[] := ARRAY['6290360815008','6290360817071'];
  c_touch   constant text[] := ARRAY['6290360815008','6290360817071','6290360810737'];

  v_coll_fr uuid; v_coll_ar uuid;
  v_n int; v_pub int; v_new_existing int;
  v_prod_before int; v_carton_before int; v_price_before int; v_links_before int; v_coll_count int;
  h_prod_b text; h_nostock_b text; h_carton_b text; h_price_b text; h_links_b text; h_coll_b text;
  h_prod_a text; h_nostock_a text; h_carton_a text; h_price_a text; h_links_a text; h_coll_a text;
  v_kirkire uuid; v_kir_carton int; v_kir_price int;
  v_inserted int := 0; v_changed int := 0;
BEGIN
  ---------------------------------------------------------------- PRECONDITIONS
  SELECT id INTO v_coll_fr FROM collections WHERE slug = 'new-french-and-arabic-collections';
  SELECT id INTO v_coll_ar FROM collections WHERE slug = 'aria-eternal-collections';
  IF v_coll_fr IS NULL OR v_coll_ar IS NULL THEN
    RAISE EXCEPTION 'PRECONDITION: target collection missing (fr=%, aria=%)', v_coll_fr, v_coll_ar;
  END IF;

  IF EXISTS (SELECT 1 FROM products WHERE barcode IS NOT NULL GROUP BY barcode HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'PRECONDITION: duplicate barcodes already exist';
  END IF;
  IF EXISTS (SELECT 1 FROM products GROUP BY slug HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'PRECONDITION: duplicate slugs already exist';
  END IF;

  -- THE QUEEN / EZRAH: either both absent (insert) or both already present (no-op)
  SELECT count(*) INTO v_new_existing FROM products WHERE barcode = ANY (c_new);
  IF v_new_existing NOT IN (0, 2) THEN
    RAISE EXCEPTION 'PRECONDITION: partial state for new products (% of 2 exist)', v_new_existing;
  END IF;
  IF v_new_existing = 0 AND EXISTS (
       SELECT 1 FROM products WHERE slug IN ('the-queen-6290360815008','ezrah-6290360817071')) THEN
    RAISE EXCEPTION 'PRECONDITION: target slug already used by another product';
  END IF;

  -- 25 NO STOCK: all must exist; either all PUBLISHED (apply) or all DRAFT (already applied)
  SELECT count(*), count(*) FILTER (WHERE status = 'PUBLISHED')
    INTO v_n, v_pub FROM products WHERE barcode = ANY (c_nostock);
  IF v_n <> 25 THEN
    RAISE EXCEPTION 'PRECONDITION: expected 25 NO STOCK products to exist, found %', v_n;
  END IF;
  IF v_pub NOT IN (0, 25) THEN
    RAISE EXCEPTION 'PRECONDITION: expected exactly 25 (or 0) PUBLISHED among NO STOCK set, found %', v_pub;
  END IF;
  IF v_pub = 25 AND EXISTS (   -- must not have collection links (dry-run finding)
       SELECT 1 FROM collections_products cp JOIN products p ON p.id = cp.product_id
       WHERE p.barcode = ANY (c_nostock)) THEN
    RAISE EXCEPTION 'PRECONDITION: a NO STOCK product unexpectedly has a collection link';
  END IF;

  -- Kirkire: product must exist, be identifiable, and carton/price both absent or both present
  SELECT id INTO v_kirkire FROM products WHERE barcode = '6290360810737' AND upper(name) = 'KIRKIRE';
  IF v_kirkire IS NULL THEN
    RAISE EXCEPTION 'PRECONDITION: Kirkire 6290360810737 not found / name mismatch';
  END IF;
  SELECT count(*) INTO v_kir_carton FROM carton_specs WHERE product_id = v_kirkire;
  SELECT count(*) INTO v_kir_price  FROM catalogue_unit_prices WHERE product_id = v_kirkire;

  ---------------------------------------------------------------- BASELINE SNAPSHOTS
  SELECT count(*) INTO v_prod_before   FROM products;
  SELECT count(*) INTO v_carton_before FROM carton_specs;
  SELECT count(*) INTO v_price_before  FROM catalogue_unit_prices;
  SELECT count(*) INTO v_links_before  FROM collections_products;
  SELECT count(*) INTO v_coll_count    FROM collections;

  -- every product except the approved-to-change set, full row incl. updated_at
  SELECT coalesce(md5(string_agg(to_jsonb(p)::text, '|' ORDER BY p.id)), '') INTO h_prod_b
    FROM products p WHERE coalesce(p.barcode, '') <> ALL (c_nostock || c_new);
  -- the 25: every column except status/updated_at
  SELECT coalesce(md5(string_agg((to_jsonb(p) - 'status' - 'updated_at')::text, '|' ORDER BY p.id)), '') INTO h_nostock_b
    FROM products p WHERE p.barcode = ANY (c_nostock);
  SELECT coalesce(md5(string_agg(to_jsonb(c)::text, '|' ORDER BY c.id)), '') INTO h_carton_b
    FROM carton_specs c WHERE c.product_id NOT IN (SELECT id FROM products WHERE barcode = ANY (c_touch));
  SELECT coalesce(md5(string_agg(to_jsonb(u)::text, '|' ORDER BY u.id)), '') INTO h_price_b
    FROM catalogue_unit_prices u WHERE u.product_id NOT IN (SELECT id FROM products WHERE barcode = ANY (c_touch));
  SELECT coalesce(md5(string_agg(cp.collection_id::text || cp.product_id::text, '|' ORDER BY cp.collection_id, cp.product_id)), '') INTO h_links_b
    FROM collections_products cp;
  SELECT coalesce(md5(string_agg(to_jsonb(c)::text, '|' ORDER BY c.id)), '') INTO h_coll_b FROM collections c;

  ---------------------------------------------------------------- WRITES
  -- 1+2) new products (barcode-guarded; existing slugs never touched)
  INSERT INTO products (barcode, slug, name, inspiration, top_notes, middle_notes, base_notes,
                        pack_size, pack_unit, volume_ml, image_status, catalogue_status, status)
  SELECT v.barcode, v.slug, v.name, v.inspiration, v.top, v.mid, v.base,
         100, 'ML', 100, 'PENDING', 'VERIFIED_FROM_CATALOGUE'::verification_status, 'PUBLISHED'::product_status
  FROM (VALUES
    ('6290360815008','the-queen-6290360815008','The Queen','212 SEXY/CAROLINA HERREA',
       'WOODY, AMBERY','MUSKY, AROMATIC','FOUGERE,SANDALWOOD'),
    ('6290360817071','ezrah-6290360817071','Ezrah','ERBA PURA/ SOSPIRO',
       'RED FRUITS','DRY WOODS, VANILLA','MUSK, GOURMAND, ABS.MYRRHE')
  ) AS v(barcode, slug, name, inspiration, top, mid, base)
  WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.barcode = v.barcode);
  GET DIAGNOSTICS v_n = ROW_COUNT; v_inserted := v_n;

  -- collection links (additive; PK prevents duplicates)
  INSERT INTO collections_products (collection_id, product_id)
  SELECT v_coll_fr, id FROM products WHERE barcode = '6290360815008'
  ON CONFLICT (collection_id, product_id) DO NOTHING;
  INSERT INTO collections_products (collection_id, product_id)
  SELECT v_coll_ar, id FROM products WHERE barcode = '6290360817071'
  ON CONFLICT (collection_id, product_id) DO NOTHING;

  -- carton rows: THE QUEEN (complete) and Kirkire (complete). NONE for EZRAH.
  INSERT INTO carton_specs (product_id, units_per_carton, carton_cbm, carton_gross_weight_kg, verification_status)
  SELECT p.id, v.upc, v.cbm, v.gw, 'VERIFIED_FROM_CATALOGUE'::verification_status
  FROM (VALUES ('6290360815008', 48, 0.075, 23.1), ('6290360810737', 96, 0.14, 44.9)) AS v(barcode, upc, cbm, gw)
  JOIN products p ON p.barcode = v.barcode
  WHERE NOT EXISTS (SELECT 1 FROM carton_specs c WHERE c.product_id = p.id);

  -- confidential price rows: THE QUEEN, EZRAH, Kirkire (insert-if-missing only)
  INSERT INTO catalogue_unit_prices (product_id, price_usd, price_aed, source_page, verification_status)
  SELECT p.id, v.usd, v.aed, NULL, 'VERIFIED_FROM_CATALOGUE'::verification_status
  FROM (VALUES ('6290360815008', 6, 22), ('6290360817071', 8, 29), ('6290360810737', 6, 22)) AS v(barcode, usd, aed)
  JOIN products p ON p.barcode = v.barcode
  WHERE NOT EXISTS (SELECT 1 FROM catalogue_unit_prices u WHERE u.product_id = p.id);

  -- 4) NO STOCK -> DRAFT (status only)
  UPDATE products SET status = 'DRAFT', updated_at = now()
  WHERE barcode = ANY (c_nostock) AND status = 'PUBLISHED';
  GET DIAGNOSTICS v_changed = ROW_COUNT;

  ---------------------------------------------------------------- POST-ASSERTIONS
  IF v_pub = 25 AND v_changed <> 25 THEN
    RAISE EXCEPTION 'ASSERT: expected 25 status changes, got %', v_changed;
  END IF;
  IF (SELECT count(*) FROM products WHERE barcode = ANY (c_nostock) AND status = 'DRAFT') <> 25 THEN
    RAISE EXCEPTION 'ASSERT: NO STOCK set is not 25 DRAFT';
  END IF;
  IF (SELECT count(*) FROM products) <> v_prod_before + v_inserted THEN
    RAISE EXCEPTION 'ASSERT: product count mismatch';
  END IF;
  IF v_new_existing = 0 AND v_inserted <> 2 THEN
    RAISE EXCEPTION 'ASSERT: expected 2 inserted products, got %', v_inserted;
  END IF;
  IF (SELECT count(*) FROM collections) <> v_coll_count THEN
    RAISE EXCEPTION 'ASSERT: collections table changed';
  END IF;

  SELECT coalesce(md5(string_agg(to_jsonb(p)::text, '|' ORDER BY p.id)), '') INTO h_prod_a
    FROM products p WHERE coalesce(p.barcode, '') <> ALL (c_nostock || c_new);
  SELECT coalesce(md5(string_agg((to_jsonb(p) - 'status' - 'updated_at')::text, '|' ORDER BY p.id)), '') INTO h_nostock_a
    FROM products p WHERE p.barcode = ANY (c_nostock);
  SELECT coalesce(md5(string_agg(to_jsonb(c)::text, '|' ORDER BY c.id)), '') INTO h_carton_a
    FROM carton_specs c WHERE c.product_id NOT IN (SELECT id FROM products WHERE barcode = ANY (c_touch));
  SELECT coalesce(md5(string_agg(to_jsonb(u)::text, '|' ORDER BY u.id)), '') INTO h_price_a
    FROM catalogue_unit_prices u WHERE u.product_id NOT IN (SELECT id FROM products WHERE barcode = ANY (c_touch));
  SELECT coalesce(md5(string_agg(to_jsonb(c)::text, '|' ORDER BY c.id)), '') INTO h_coll_a FROM collections c;

  IF h_prod_a    <> h_prod_b    THEN RAISE EXCEPTION 'ASSERT: a non-approved product row changed'; END IF;
  IF h_nostock_a <> h_nostock_b THEN RAISE EXCEPTION 'ASSERT: a NO STOCK row changed beyond status'; END IF;
  IF h_carton_a  <> h_carton_b  THEN RAISE EXCEPTION 'ASSERT: a non-approved carton row changed'; END IF;
  IF h_price_a   <> h_price_b   THEN RAISE EXCEPTION 'ASSERT: a non-approved price row changed'; END IF;
  IF h_coll_a    <> h_coll_b    THEN RAISE EXCEPTION 'ASSERT: collections rows changed'; END IF;

  -- original links untouched: same hash over links that existed before (new links belong to new products)
  SELECT coalesce(md5(string_agg(cp.collection_id::text || cp.product_id::text, '|' ORDER BY cp.collection_id, cp.product_id)), '') INTO h_links_a
    FROM collections_products cp WHERE cp.product_id NOT IN (SELECT id FROM products WHERE barcode = ANY (c_new));
  IF h_links_a <> h_links_b THEN RAISE EXCEPTION 'ASSERT: pre-existing collection links changed'; END IF;
  IF (SELECT count(*) FROM collections_products) <> v_links_before + (CASE WHEN v_new_existing = 0 THEN 2 ELSE 0 END) THEN
    RAISE EXCEPTION 'ASSERT: link count mismatch';
  END IF;
  IF (SELECT count(*) FROM carton_specs) <> v_carton_before + (CASE WHEN v_new_existing = 0 THEN 1 ELSE 0 END) + (CASE WHEN v_kir_carton = 0 THEN 1 ELSE 0 END) THEN
    RAISE EXCEPTION 'ASSERT: carton row count mismatch';
  END IF;
  IF (SELECT count(*) FROM catalogue_unit_prices) <> v_price_before + (CASE WHEN v_new_existing = 0 THEN 2 ELSE 0 END) + (CASE WHEN v_kir_price = 0 THEN 1 ELSE 0 END) THEN
    RAISE EXCEPTION 'ASSERT: price row count mismatch';
  END IF;
  IF (SELECT count(*) FROM (SELECT barcode FROM products WHERE barcode IS NOT NULL GROUP BY 1 HAVING count(*) > 1) d) > 0 THEN
    RAISE EXCEPTION 'ASSERT: duplicate barcodes after write';
  END IF;

  RAISE NOTICE 'reconcile OK: inserted=%, status_changed=%', v_inserted, v_changed;
END
$reconcile$;
