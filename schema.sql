-- Oriel store schema
-- Run this in the Supabase SQL editor.
--
-- Orders are not readable with the anon key. The storefront calls
-- lookup_order and place_order, which require both the email and the
-- order id, or validate prices against the products table.
--
-- place_order adds a flat 12.00 tracked-shipping contribution.
-- Keep that number aligned with SHIPPING_FLAT in lib/pricing.ts.

create extension if not exists pgcrypto;

create table if not exists products (
  id text primary key,
  title text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  images text[] not null check (cardinality(images) > 0),
  stock_quantity integer not null check (stock_quantity >= 0),
  weight numeric(8, 3) not null check (weight > 0),
  shipping_time_estimate text not null,
  china_supplier_url text not null
);

create table if not exists orders (
  id text primary key,
  customer_name text not null,
  customer_email text not null,
  shipping_address text not null,
  total_price numeric(10, 2) not null check (total_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'arrived')),
  tracking_number text,
  china_order_id text,
  deposit_amount numeric(10, 2) not null default 0 check (deposit_amount >= 0),
  balance_amount numeric(10, 2) not null default 0 check (balance_amount >= 0),
  deposit_paid boolean not null default false,
  balance_paid boolean not null default false,
  deposit_last4 text,
  balance_last4 text
);

alter table orders add column if not exists deposit_amount numeric(10, 2) not null default 0;
alter table orders add column if not exists balance_amount numeric(10, 2) not null default 0;
alter table orders add column if not exists deposit_paid boolean not null default false;
alter table orders add column if not exists balance_paid boolean not null default false;
alter table orders add column if not exists deposit_last4 text;
alter table orders add column if not exists balance_last4 text;
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'processing', 'shipped', 'arrived'));

create table if not exists order_items (
  id text primary key,
  order_id text not null references orders (id) on delete cascade,
  product_id text not null references products (id),
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0)
);

create index if not exists orders_customer_email_idx on orders (lower(customer_email));
create index if not exists order_items_order_id_idx on order_items (order_id);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products"
  on products
  for select
  to anon, authenticated
  using (true);

create or replace function lookup_order(p_email text, p_order_id text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'id', o.id,
    'customer_name', o.customer_name,
    'customer_email', o.customer_email,
    'shipping_address', o.shipping_address,
    'total_price', o.total_price,
    'status', o.status,
    'tracking_number', o.tracking_number,
    'china_order_id', o.china_order_id,
    'deposit_amount', o.deposit_amount,
    'balance_amount', o.balance_amount,
    'deposit_paid', o.deposit_paid,
    'balance_paid', o.balance_paid,
    'deposit_last4', o.deposit_last4,
    'balance_last4', o.balance_last4,
    'items', coalesce((
      select json_agg(json_build_object(
        'id', oi.id,
        'order_id', oi.order_id,
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price
      ) order by oi.id)
      from order_items oi
      where oi.order_id = o.id
    ), '[]'::json)
  )
  into result
  from orders o
  where lower(o.id) = lower(trim(p_order_id))
    and lower(o.customer_email) = lower(trim(p_email));

  return result;
end;
$$;

drop function if exists place_order(text, text, text, text, jsonb);

create or replace function place_order(
  p_id text,
  p_customer_name text,
  p_customer_email text,
  p_shipping_address text,
  p_items jsonb,
  p_deposit_last4 text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_product products%rowtype;
  v_qty integer;
  v_total numeric(10, 2) := 0;
  v_cents integer;
  v_deposit numeric(10, 2);
  v_balance numeric(10, 2);
  v_order_id text := trim(p_id);
begin
  if v_order_id is null or length(v_order_id) < 4 then
    raise exception 'Invalid order id';
  end if;
  if coalesce(p_deposit_last4, '') !~ '^[0-9]{4}$' then
    raise exception 'Deposit payment is required';
  end if;
  if length(trim(p_customer_name)) < 2 then
    raise exception 'Invalid name';
  end if;
  if trim(p_customer_email) !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Invalid email';
  end if;
  if length(trim(p_shipping_address)) < 8 then
    raise exception 'Invalid address';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order has no items';
  end if;

  insert into orders (
    id,
    customer_name,
    customer_email,
    shipping_address,
    total_price,
    status
  ) values (
    v_order_id,
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    trim(p_shipping_address),
    0,
    'pending'
  );

  for item in select value from jsonb_array_elements(p_items)
  loop
    if coalesce(item->>'quantity', '') !~ '^[0-9]+$' then
      raise exception 'Invalid quantity';
    end if;

    v_qty := (item->>'quantity')::integer;
    if v_qty < 1 then
      raise exception 'Invalid quantity';
    end if;

    select *
    into v_product
    from products
    where id = item->>'product_id'
    for update;

    if not found then
      raise exception 'Unknown product %', coalesce(item->>'product_id', '');
    end if;
    if v_product.stock_quantity < v_qty then
      raise exception 'Insufficient stock for %', v_product.title;
    end if;

    v_total := v_total + (v_product.price * v_qty);

    insert into order_items (id, order_id, product_id, quantity, price)
    values (
      'oi-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
      v_order_id,
      v_product.id,
      v_qty,
      v_product.price
    );

    update products
      set stock_quantity = stock_quantity - v_qty
      where id = v_product.id;
  end loop;

  v_total := v_total + 12;
  v_cents := round(v_total * 100)::integer;
  v_deposit := (v_cents / 2) / 100.0;
  v_balance := v_total - v_deposit;

  update orders
    set total_price = v_total,
        deposit_amount = v_deposit,
        balance_amount = v_balance,
        deposit_paid = true,
        balance_paid = false,
        deposit_last4 = p_deposit_last4
    where id = v_order_id;

  return lookup_order(lower(trim(p_customer_email)), v_order_id);
end;
$$;

create or replace function pay_balance(p_email text, p_order_id text, p_last4 text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
begin
  if coalesce(p_last4, '') !~ '^[0-9]{4}$' then
    raise exception 'Enter the last four digits';
  end if;

  select *
  into v_order
  from orders
  where lower(id) = lower(trim(p_order_id))
    and lower(customer_email) = lower(trim(p_email))
  for update;

  if not found then
    raise exception 'Order not found';
  end if;
  if v_order.status <> 'arrived' then
    raise exception 'The balance is due after the shipment arrives';
  end if;
  if not v_order.deposit_paid then
    raise exception 'The deposit has not been paid';
  end if;
  if v_order.balance_paid then
    raise exception 'The balance is already paid';
  end if;

  update orders
    set balance_paid = true,
        balance_last4 = p_last4
    where id = v_order.id;

  return lookup_order(v_order.customer_email, v_order.id);
end;
$$;

revoke all on function lookup_order(text, text) from public;
revoke all on function place_order(text, text, text, text, jsonb, text) from public;
revoke all on function pay_balance(text, text, text) from public;
grant execute on function lookup_order(text, text) to anon, authenticated;
grant execute on function place_order(text, text, text, text, jsonb, text) to anon, authenticated;
grant execute on function pay_balance(text, text, text) to anon, authenticated;

insert into products (
  id, title, description, price, images, stock_quantity, weight, shipping_time_estimate, china_supplier_url
) values
  (
    'studio-cups',
    'Handmade Studio Cups',
    'Four hand-thrown cups from a Jingdezhen workshop. Packed weight includes the pulp tray used for air freight.',
    42.00,
    array['/products/cups-1.jpg', '/products/cups-2.jpg', '/products/cups-3.jpg'],
    36,
    0.920,
    '8–15 business days',
    'https://example.com/suppliers/jingdezhen-kiln'
  ),
  (
    'linen-throw',
    'Washed Linen Throw',
    'One washed linen throw, about 140 × 180 cm open, milled in Nantong. This listing ships in oat.',
    58.00,
    array['/products/linen-1.jpg', '/products/linen-2.jpg', '/products/linen-3.jpg'],
    40,
    0.510,
    '8–15 business days',
    'https://example.com/suppliers/nantong-mill'
  ),
  (
    'arc-floor-lamp',
    'Arc Floor Lamp',
    'A matte steel arc floor lamp from a Zhongshan workshop. The stem does not fold, so the carton is long. Ships in graphite.',
    128.00,
    array['/products/lamp-1.jpg', '/products/lamp-2.jpg'],
    14,
    3.600,
    '8–15 business days',
    'https://example.com/suppliers/zhongshan-lighting'
  ),
  (
    'woven-leather-tote',
    'Woven Leather Tote',
    'A woven leather tote cut and laced in Guangzhou. The weight is the packed weight.',
    88.00,
    array['/products/tote-1.jpg'],
    22,
    0.740,
    '8–15 business days',
    'https://example.com/suppliers/guangzhou-leather'
  )
on conflict (id) do nothing;

insert into orders (
  id, customer_name, customer_email, shipping_address, total_price, status, tracking_number, china_order_id,
  deposit_amount, balance_amount, deposit_paid, balance_paid, deposit_last4, balance_last4
) values
  (
    'OR-10482', 'Ada Chen', 'ada@example.com', '18 Mercer Street, New York, NY 10013',
    158.00, 'shipped', 'YT2531849201CN', 'CN-88421',
    79.00, 79.00, true, false, '4242', null
  ),
  (
    'OR-10490', 'Ada Chen', 'ada@example.com', '90 Abbot Kinney Blvd, Venice, CA 90291',
    140.00, 'processing', null, 'CN-88490',
    70.00, 70.00, true, false, '4242', null
  ),
  (
    'OR-10502', 'Ada Chen', 'ada@example.com', '14 Elm Row, Edinburgh EH7 4AA',
    54.00, 'pending', null, null,
    27.00, 27.00, true, false, '4242', null
  ),
  (
    'OR-10611', 'Ada Chen', 'ada@example.com', '18 Mercer Street, New York, NY 10013',
    70.00, 'arrived', 'YT2531904418CN', 'CN-88611',
    35.00, 35.00, true, false, '4242', null
  )
on conflict (id) do update set
  status = excluded.status,
  deposit_amount = excluded.deposit_amount,
  balance_amount = excluded.balance_amount,
  deposit_paid = excluded.deposit_paid,
  balance_paid = orders.balance_paid,
  deposit_last4 = excluded.deposit_last4,
  tracking_number = excluded.tracking_number,
  china_order_id = excluded.china_order_id;

insert into order_items (id, order_id, product_id, quantity, price) values
  ('oi-10482-linen', 'OR-10482', 'linen-throw', 1, 58.00),
  ('oi-10482-tote', 'OR-10482', 'woven-leather-tote', 1, 88.00),
  ('oi-10490-lamp', 'OR-10490', 'arc-floor-lamp', 1, 128.00),
  ('oi-10502-cups', 'OR-10502', 'studio-cups', 1, 42.00),
  ('oi-10611-linen', 'OR-10611', 'linen-throw', 1, 58.00)
on conflict (id) do nothing;
