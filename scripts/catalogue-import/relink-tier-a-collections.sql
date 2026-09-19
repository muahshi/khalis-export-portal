-- Restores the 36 missing collections_products links for products that are in the
-- current Excel price list with a public collection (Tier A). Inserts links only;
-- no product/price/barcode/status fields are touched. All 36 Excel slugs already
-- equal DB slugs (no slug mapping needed for this subset).
-- NOT included: the 70 PDF-only products, the 25 NO STOCK products and the 5
-- barcode-conflict products.
-- A single DO block is one transaction: the assertion aborts the whole insert.
do $$
declare
  n integer;
begin
  with wanted(barcode, collection_slug) as (values
    ('6290360810737','luxury-collections'),
    ('6290360811956','eternal-new-collections'),
    ('6290360811994','eternal-new-collections'),
    ('6290360812007','eternal-new-collections'),
    ('6290360812021','eternal-new-collections'),
    ('6290360812724','eternal-new-collections'),
    ('6290360812731','eternal-new-collections'),
    ('6290360812748','eternal-new-collections'),
    ('6290360812755','eternal-new-collections'),
    ('6290360812762','eternal-new-collections'),
    ('6290360812779','eternal-new-collections'),
    ('6290360812786','eternal-new-collections'),
    ('6290360812946','eternal-new-collections'),
    ('6290360812953','eternal-new-collections'),
    ('6290360813004','eternal-new-collections'),
    ('6290360813011','eternal-new-collections'),
    ('6290360813028','eternal-new-collections'),
    ('6290360813035','eternal-new-collections'),
    ('6290360813042','eternal-new-collections'),
    ('6290360813059','eternal-new-collections'),
    ('6290360813066','eternal-new-collections'),
    ('6290360813073','eternal-new-collections'),
    ('6290360813080','eternal-new-collections'),
    ('6290360813097','eternal-new-collections'),
    ('6290360813103','eternal-new-collections'),
    ('6290360813110','eternal-new-collections'),
    ('6290360813141','eternal-new-collections'),
    ('6290360813158','eternal-new-collections'),
    ('6290360813202','eternal-new-collections'),
    ('6290360813219','eternal-new-collections'),
    ('6290360813257','eternal-new-collections'),
    ('6290360813264','eternal-new-collections'),
    ('6290360813271','eternal-new-collections'),
    ('6290360813288','eternal-new-collections'),
    ('6290360813295','eternal-new-collections'),
    ('6290360813301','eternal-new-collections')
  )
  insert into collections_products (collection_id, product_id)
  select c.id, p.id
  from wanted w
  join products p on p.barcode = w.barcode
  join collections c on c.slug = w.collection_slug
  on conflict (collection_id, product_id) do nothing;

  get diagnostics n = row_count;
  if n <> 36 then
    raise exception 'Tier A: expected 36 inserted links, got %', n;
  end if;
end $$;
