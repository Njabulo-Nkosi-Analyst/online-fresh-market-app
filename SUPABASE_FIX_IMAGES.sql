-- ============================================
-- Roots & Earth — VERIFIED PRODUCT IMAGES (v2)
-- All URLs visually verified against product names.
-- Run this in Supabase SQL Editor.
-- ============================================

update public.products set image_url = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80' where name = 'Heirloom Tomatoes';
update public.products set image_url = 'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=600&q=80' where name = 'Avocado — Hass';
update public.products set image_url = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80' where name = 'Baby Spinach';
update public.products set image_url = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80' where name = 'Free-range Eggs';
update public.products set image_url = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80' where name = 'Raw Jersey Milk';
update public.products set image_url = 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80' where name = 'Grass-fed Butter';
update public.products set image_url = 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=600' where name = 'Raw Cashews';
update public.products set image_url = 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80' where name = 'Sea-salt Almonds';
update public.products set image_url = 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&q=80' where name = 'Cold-pressed Green Juice';
update public.products set image_url = 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80' where name = 'Beetroot Smoothie';
update public.products set image_url = 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&q=80' where name = 'Organic Blueberries';
update public.products set image_url = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80' where name = 'Bananas — Organic';
update public.products set image_url = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80' where name = 'Rainbow Carrots';
update public.products set image_url = 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80' where name = 'Artisan Sourdough Loaf';
update public.products set image_url = 'https://images.pexels.com/photos/277253/pexels-photo-277253.jpeg?auto=compress&cs=tinysrgb&w=600' where name = 'Kalahari Sea Salt';
update public.products set image_url = 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&q=80' where name = 'Hand-churned Yoghurt';

-- ============================================
-- ALLOW GUEST CHECKOUT (orders without signing in)
-- ============================================
drop policy if exists "orders insert own" on public.orders;
create policy "orders insert own or guest" on public.orders for insert
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "order_items insert via order" on public.order_items;
create policy "order_items insert via order" on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id is null or o.user_id = auth.uid())
    )
  );
