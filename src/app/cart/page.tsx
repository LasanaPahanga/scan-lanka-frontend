'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { GuestCartItem } from '@/lib/cart';
import { listAddresses, SavedAddress } from '@/lib/addresses';
import { fetchPostalCodes, PostalCode } from '@/lib/delivery';
import { fetchWhatsApp } from '@/lib/geo';
import { formatLkr } from '@/lib/money';
import {
  DeliveryMethod,
  DeliveryOption,
  DeliveryOptionsResult,
  PaymentChoice,
  PlacedResult,
  QuoteResult,
  fetchDeliveryOptions,
  initiatePayment,
  placeOrder,
  quoteCheckout,
  railLabel,
  railReason,
  submitToPayHere,
  uploadBankSlip,
} from '@/lib/checkout';
import { savePendingOrder } from '@/lib/orders';
import { fetchPaymentMethods, PaymentMethods } from '@/lib/payments';
import { useGeo } from '@/components/GeoProvider';
import { t } from '@/lib/i18n';
import { loadGuestCheckoutDetails, saveGuestCheckoutDetails, clearGuestCheckoutDetails } from '@/lib/guestCheckoutStorage';

type PaymentMethod = 'CARD' | 'BANK';

export default function CartPage() {
  const { lines, priced, loading, setQuantity, remove, clear } = useCart();
  const { user } = useAuth();
  const { geo } = useGeo();
  const items: GuestCartItem[] = useMemo(
    () =>
      lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        name: l.name,
      })),
    [lines],
  );

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  // Lorry only - courier is always COD regardless of this. Reset to ONLINE whenever the rail changes
  // away from COMPANY_LORRY so a stale COD choice never leaks into a later courier/lorry re-selection.
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>('ONLINE');
  const [codDueCents, setCodDueCents] = useState(0);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [slipError, setSlipError] = useState<string | null>(null);
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);
  const [form, setForm] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
  });
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptionsResult | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [placed, setPlaced] = useState<PlacedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showBilling, setShowBilling] = useState(false);
  const [billing, setBilling] = useState({
    name: '',
    taxId: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
  });
  const [methods, setMethods] = useState<PaymentMethods | null>(null);
  // Prevent the auto-save effect from writing empty form state before guest details hydrate
  // from localStorage (otherwise the first paint wipes the user's saved checkout details).
  const [guestHydrated, setGuestHydrated] = useState(false);

  const canUseSaved = user?.role === 'CUSTOMER' && user.emailVerified;
  const isCourier = deliveryMethod === 'COURIER';
  // Courier is always COD, no choice to make. Lorry can be prepaid online or paid cash on delivery -
  // the admin can disable COD globally (methods.deliveryCod); default to online-only until we know.
  const codEligible = deliveryMethod === 'COMPANY_LORRY' && (methods?.deliveryCod ?? true);
  const needsOnlinePayment =
    deliveryMethod === 'COMPANY_LORRY' && paymentChoice === 'ONLINE' && (quote?.onlineTotalCents ?? 0) > 0;

  useEffect(() => {
    fetchPaymentMethods()
      .then((m) => {
        setMethods(m);
        if (m.payhere) setMethod('CARD');
        else if (m.bankTransfer) setMethod('BANK');
      })
      .catch(() => setMethods({ payhere: true, bankTransfer: true, deliveryCod: true }));
  }, []);

  useEffect(() => {
    fetchPostalCodes().then(setPostalCodes).catch(() => setPostalCodes([]));
    fetchWhatsApp(geo.country)
      .then((w) => {
        const num = w.number.replace(/\D/g, '');
        setWhatsappHref(`https://wa.me/94${num.replace(/^0/, '')}?text=${encodeURIComponent(w.prefill)}`);
      })
      .catch(() => setWhatsappHref(null));
  }, [geo.country]);

  useEffect(() => {
    if (!canUseSaved) return;
    listAddresses()
      .then((addrs) => {
        setSavedAddresses(addrs);
        const d = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (d) applyAddress(d);
      })
      .catch(() => setSavedAddresses([]));
  }, [canUseSaved]);

  // Guests only: logged-in customers already get saved addresses above (05 FR-CHECKOUT-23).
  useEffect(() => {
    if (canUseSaved) {
      setGuestHydrated(true);
      return;
    }
    const saved = loadGuestCheckoutDetails();
    if (saved) {
      setForm((f) => ({ ...f, ...saved.contact, ...saved.address }));
      if (saved.billing) {
        setBilling((b) => ({ ...b, ...saved.billing! }));
        setShowBilling(true);
      }
    }
    setGuestHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseSaved]);

  useEffect(() => {
    if (canUseSaved || placed || !guestHydrated) return;
    // Skip writing an all-empty snapshot — that would clear real saved data after "Forget".
    const hasAnything =
      form.contactName.trim() ||
      form.contactPhone.trim() ||
      form.contactEmail.trim() ||
      form.street.trim() ||
      form.city.trim() ||
      form.province.trim() ||
      form.postalCode.trim();
    if (!hasAnything) return;
    saveGuestCheckoutDetails({
      contact: { contactName: form.contactName, contactPhone: form.contactPhone, contactEmail: form.contactEmail },
      address: { street: form.street, city: form.city, province: form.province, postalCode: form.postalCode },
      billing: showBilling ? billing : null,
    });
  }, [canUseSaved, placed, guestHydrated, form, showBilling, billing]);

  useEffect(() => {
    if (items.length === 0 || placed || !form.postalCode.trim()) {
      setDeliveryOptions(null);
      setDeliveryMethod(null);
      return;
    }
    let cancelled = false;
    fetchDeliveryOptions(items, form.postalCode.trim(), form.city.trim() || undefined)
      .then((opts) => {
        if (cancelled) return;
        setDeliveryOptions(opts);
        if (opts.whatsappOnly) {
          setDeliveryMethod(null);
          return;
        }
        const firstAvailable = opts.options.find((o) => o.available);
        setDeliveryMethod((prev) => {
          if (prev && opts.options.some((o) => o.method === prev && o.available)) return prev;
          return firstAvailable?.method ?? null;
        });
      })
      .catch(() => !cancelled && setDeliveryOptions(null));
    return () => {
      cancelled = true;
    };
  }, [items, form.postalCode, form.city, placed]);

  useEffect(() => {
    if (deliveryMethod !== 'COMPANY_LORRY') setPaymentChoice('ONLINE');
  }, [deliveryMethod]);

  useEffect(() => {
    if (items.length === 0 || placed || !deliveryMethod || !form.postalCode.trim()) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    quoteCheckout(items, deliveryMethod, form.postalCode.trim(), form.city.trim() || undefined)
      .then((q) => !cancelled && setQuote(q))
      .catch(() => !cancelled && setQuote(null));
    return () => {
      cancelled = true;
    };
  }, [items, deliveryMethod, form.postalCode, form.city, placed]);

  function applyAddress(a: SavedAddress) {
    setForm((f) => ({
      ...f,
      street: a.street,
      city: a.city,
      province: a.province,
      postalCode: a.postalCode,
      contactPhone: a.phone,
      contactEmail: a.email,
    }));
  }

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function forgetSavedDetails() {
    clearGuestCheckoutDetails();
    setForm({ contactName: '', contactPhone: '', contactEmail: '', street: '', city: '', province: '', postalCode: '' });
    setBilling({ name: '', taxId: '', street: '', city: '', province: '', postalCode: '' });
    setShowBilling(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!deliveryMethod) return;
    setBusy(true);
    setError(null);
    if (deliveryMethod === 'COMPANY_LORRY' && paymentChoice === 'COD') {
      setCodDueCents(quote?.onlineTotalCents ?? 0); // door total: same math as the online total (FR-PAY-16)
    }
    try {
      const result = await placeOrder({
        items,
        deliveryMethod,
        paymentChoice: deliveryMethod === 'COMPANY_LORRY' ? paymentChoice : undefined,
        ship: {
          street: form.street,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
        },
        billing: showBilling
          ? {
              name: billing.name || undefined,
              taxId: billing.taxId || undefined,
              street: billing.street || undefined,
              city: billing.city || undefined,
              province: billing.province || undefined,
              postalCode: billing.postalCode || undefined,
            }
          : null,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
      });
      savePendingOrder(result.orderNumber, form.contactEmail);
      // Persist details for the next guest order on this browser/device.
      if (!canUseSaved) {
        saveGuestCheckoutDetails({
          contact: {
            contactName: form.contactName,
            contactPhone: form.contactPhone,
            contactEmail: form.contactEmail,
          },
          address: {
            street: form.street,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
          },
          billing: showBilling ? billing : null,
        });
      }
      await clear();

      if (needsOnlinePayment && method === 'CARD') {
        const init = await initiatePayment(result.orderNumber).catch(() => null);
        if (init && init.params.merchant_id) {
          submitToPayHere(init, {
            name: form.contactName,
            email: form.contactEmail,
            phone: form.contactPhone,
            address: form.street,
            city: form.city,
          });
          return;
        }
      }
      setPlaced(result);
    } catch {
      setError('We could not place your order. Please check your details and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onUploadSlip() {
    if (!slipFile || !placed) return;
    setSlipError(null);
    try {
      await uploadBankSlip(placed.orderNumber, slipFile);
      setSlipUploaded(true);
    } catch {
      setSlipError('Could not upload the slip. Please try again.');
    }
  }

  if (placed) {
    return (
      <main style={wrap}>
        <h1 style={{ color: 'var(--primary)' }}>Order placed</h1>
        <p>
          Your order number is <strong>{placed.orderNumber}</strong>.
        </p>
        {isCourier && (
          <p style={{ color: 'var(--muted)' }}>
            Pay the courier on delivery (approximate total was shown at checkout). We&apos;ll coordinate
            delivery details with you.
          </p>
        )}
        {!isCourier && (
          <p style={{ color: 'var(--muted)' }}>
            Company-lorry delivery has no fixed date at checkout. Message us about timing from{' '}
            <Link href="/orders/lookup" style={{ color: 'var(--primary)' }}>
              order lookup
            </Link>
            {user ? (
              <>
                {' '}
                or{' '}
                <Link href={`/account/orders/${encodeURIComponent(placed.orderNumber)}`} style={{ color: 'var(--primary)' }}>
                  your order page
                </Link>
              </>
            ) : null}
            .
          </p>
        )}
        {!isCourier && paymentChoice === 'COD' && (
          <p style={{ color: 'var(--muted)' }}>
            Nothing is charged online - pay <strong>{formatLkr(codDueCents)}</strong> in cash to the driver
            when your order arrives.
          </p>
        )}
        {needsOnlinePayment && method === 'BANK' && !slipUploaded && (
          <section style={card}>
            <h3 style={ch3}>Pay by bank transfer</h3>
            <p style={{ color: 'var(--muted)' }}>
              Transfer <strong>{formatLkr(placed.onlineTotalCents)}</strong> to our account, then upload
              your slip below.
            </p>
            <input type="file" accept="image/*" onChange={(e) => setSlipFile(e.target.files?.[0] ?? null)} />
            {slipError && <p style={{ color: 'var(--danger)' }}>{slipError}</p>}
            <button type="button" onClick={onUploadSlip} disabled={!slipFile} style={button}>
              Upload slip
            </button>
          </section>
        )}
        {needsOnlinePayment && method === 'BANK' && slipUploaded && (
          <p style={{ color: 'var(--muted)' }}>Thanks! We&apos;ll confirm your payment and email your receipt.</p>
        )}
        {needsOnlinePayment && method === 'CARD' && placed.onlineTotalCents > 0 && (
          <p style={{ color: 'var(--muted)' }}>We&apos;ll email your receipt once payment is confirmed.</p>
        )}
        <Link href="/orders/lookup" style={{ color: 'var(--primary)', marginRight: '1rem' }}>
          Track this order
        </Link>
        <Link href="/products" style={{ color: 'var(--primary)' }}>
          Continue shopping
        </Link>
      </main>
    );
  }

  if (loading && lines.length === 0) {
    return (
      <main style={wrap}>
        <h1 className="page-title">Your cart</h1>
        <p style={{ color: 'var(--muted)' }}>Loading cart…</p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main style={wrap}>
        <h1 className="page-title">Your cart</h1>
        <p style={{ color: 'var(--muted)' }}>Your cart is empty.</p>
        <Link href="/products" className="btn btn-primary">
          Browse products
        </Link>
      </main>
    );
  }

  const canPlace =
    deliveryMethod &&
    quote?.available &&
    form.postalCode.trim() &&
    (!needsOnlinePayment || (methods && (methods.payhere || methods.bankTransfer)));

  return (
    <main style={wrap}>
      <h1 className="page-title">Your cart</h1>
      <ul className="cart-lines" style={{ listStyle: 'none', padding: 0 }}>
        {lines.map((line) => (
          <li key={line.key} className="cart-line">
            <div className="cart-line-info">
              <div className="cart-line-name">{line.name}</div>
              {line.status === 'CAPPED' && <div className="cart-line-warning">Limited to available stock</div>}
              {line.status === 'OUT_OF_STOCK' && <div className="cart-line-warning">Out of stock</div>}
              {line.status === 'UNAVAILABLE' && <div className="cart-line-warning">No longer available</div>}
            </div>
            <div className="cart-qty" role="group" aria-label={`Quantity for ${line.name}`}>
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={line.quantity <= 1}
                onClick={() => void setQuantity(line, line.quantity - 1)}
              >
                −
              </button>
              <span className="cart-qty-value" aria-live="polite">
                {line.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => void setQuantity(line, line.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="cart-line-total">
              {line.lineTotalCents != null ? formatLkr(line.lineTotalCents) : '-'}
            </div>
            <button type="button" className="cart-remove" onClick={() => void remove(line)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <div className="cart-summary-total">
          <span>Subtotal</span>
          <strong>{priced ? formatLkr(priced.subtotalCents) : '…'}</strong>
        </div>
      </div>
      <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <Link href="/products" className="cart-continue-link">
          ← Continue shopping
        </Link>
      </p>

      {!geo.loading && !geo.canCheckout ? (
        <section style={card}>
          <h3 style={ch3}>Checkout</h3>
          <p style={{ color: 'var(--muted)' }}>{t('geo.noCheckout')}</p>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/quote" style={{ color: 'var(--primary)' }}>
              Request a quote
            </Link>
            {' · '}
            <Link href="/contact" style={{ color: 'var(--primary)' }}>
              Contact us
            </Link>
          </p>
        </section>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <section style={card}>
            <h3 style={ch3}>Contact</h3>
            {!canUseSaved && (
              <p style={savedHint}>
                We keep your contact and delivery details on this device so you don&apos;t have to
                retype them next time. Nothing is stored on our servers until you place an order.
              </p>
            )}
            <input style={input} placeholder="Full name" value={form.contactName}
              onChange={(e) => setField('contactName', e.target.value)} required />
            <input style={input} placeholder="Phone" value={form.contactPhone}
              onChange={(e) => setField('contactPhone', e.target.value)} required />
            <input style={input} type="email" placeholder="Email" value={form.contactEmail}
              onChange={(e) => setField('contactEmail', e.target.value)} required />
            {!canUseSaved && (
              <button type="button" onClick={forgetSavedDetails} style={forgetLink}>
                Forget my saved details
              </button>
            )}
          </section>

          <section style={card}>
            <h3 style={ch3}>Delivery address</h3>
            {canUseSaved && savedAddresses.length > 0 && (
              <select
                style={input}
                defaultValue=""
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const a = savedAddresses.find((x) => x.id === id);
                  if (a) applyAddress(a);
                }}
              >
                <option value="" disabled>
                  Use a saved address…
                </option>
                {savedAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label ?? a.street} - {a.postalCode}
                  </option>
                ))}
              </select>
            )}
            <input style={input} placeholder="Street address" value={form.street}
              onChange={(e) => setField('street', e.target.value)} required />
            <input style={input} placeholder="City" value={form.city}
              onChange={(e) => setField('city', e.target.value)} required />
            <input style={input} placeholder="Province" value={form.province}
              onChange={(e) => setField('province', e.target.value)} required />
            <input
              style={input}
              placeholder="Postal code"
              list="postal-codes"
              value={form.postalCode}
              onChange={(e) => setField('postalCode', e.target.value)}
              required
            />
            <datalist id="postal-codes">
              {postalCodes.map((p) => (
                <option key={p.postalCode} value={p.postalCode}>
                  {p.zoneName}
                </option>
              ))}
            </datalist>
          </section>

          {deliveryOptions?.whatsappOnly && (
            <section style={{ ...card, borderColor: 'var(--primary)' }}>
              <h3 style={ch3}>Contact us to order</h3>
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                Items in your cart must be arranged via WhatsApp or a quote - online checkout is not
                available for them.
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                {whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                    Chat on WhatsApp
                  </a>
                )}
                {' · '}
                <Link href="/quote" style={{ color: 'var(--primary)' }}>
                  Request a quote
                </Link>
              </p>
            </section>
          )}

          {deliveryOptions && !deliveryOptions.whatsappOnly && (
            <section style={card}>
              <h3 style={ch3}>Delivery method</h3>
              {!deliveryOptions.postalServiceable && (
                <p style={{ color: 'var(--danger)' }}>
                  Sorry, we don&apos;t deliver to that postal code.{' '}
                  <Link href="/delivery">See delivery areas</Link> or{' '}
                  <Link href="/contact">contact us</Link>.
                </p>
              )}
              {deliveryOptions.options.map((opt) => (
                <RailCard
                  key={opt.method}
                  opt={opt}
                  selected={deliveryMethod === opt.method}
                  onSelect={() => setDeliveryMethod(opt.method)}
                />
              ))}
              <p style={{ ...mutedNote, marginTop: '0.5rem' }}>
                Questions before ordering?{' '}
                {whatsappHref ? (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                    Ask us on WhatsApp
                  </a>
                ) : (
                  <Link href="/contact" style={{ color: 'var(--primary)' }}>
                    Contact us
                  </Link>
                )}
              </p>
            </section>
          )}

          <section style={card}>
            <h3 style={ch3}>Billing (optional)</h3>
            <label style={{ display: 'block' }}>
              <input type="checkbox" checked={showBilling} onChange={(e) => setShowBilling(e.target.checked)} />
              {' '}Add business / invoice details
            </label>
            {showBilling && (
              <>
                <input style={input} placeholder="Business name" value={billing.name}
                  onChange={(e) => setBilling((b) => ({ ...b, name: e.target.value }))} />
                <input style={input} placeholder="Tax ID" value={billing.taxId}
                  onChange={(e) => setBilling((b) => ({ ...b, taxId: e.target.value }))} />
                <input style={input} placeholder="Billing street" value={billing.street}
                  onChange={(e) => setBilling((b) => ({ ...b, street: e.target.value }))} />
                <input style={input} placeholder="Billing city" value={billing.city}
                  onChange={(e) => setBilling((b) => ({ ...b, city: e.target.value }))} />
              </>
            )}
          </section>

          {deliveryMethod === 'COMPANY_LORRY' && codEligible && (
            <section style={card}>
              <h3 style={ch3}>How would you like to pay?</h3>
              <label style={{ display: 'block' }}>
                <input
                  type="radio"
                  checked={paymentChoice === 'ONLINE'}
                  onChange={() => setPaymentChoice('ONLINE')}
                />{' '}
                Pay online now (card or bank transfer)
              </label>
              <label style={{ display: 'block' }}>
                <input type="radio" checked={paymentChoice === 'COD'} onChange={() => setPaymentChoice('COD')} />{' '}
                Cash on delivery - pay the driver when your order arrives
              </label>
            </section>
          )}

          {needsOnlinePayment && (
            <section style={card}>
              <h3 style={ch3}>Payment method</h3>
              {(methods?.payhere ?? true) && (
                <label style={{ display: 'block' }}>
                  <input type="radio" checked={method === 'CARD'} onChange={() => setMethod('CARD')} /> Card
                  (PayHere)
                </label>
              )}
              {(methods?.bankTransfer ?? true) && (
                <label style={{ display: 'block' }}>
                  <input type="radio" checked={method === 'BANK'} onChange={() => setMethod('BANK')} /> Bank
                  transfer (upload slip)
                </label>
              )}
            </section>
          )}

          <section style={card}>
            <h3 style={ch3}>Summary</h3>
            {quote && quote.available ? (
              <>
                <Row label="Subtotal" value={formatLkr(quote.subtotalCents)} />
                {deliveryMethod === 'COMPANY_LORRY' && (
                  <>
                    <Row
                      label={paymentChoice === 'COD' ? 'Lorry delivery (cash on delivery)' : 'Lorry delivery (pay now)'}
                      value={formatLkr(quote.deliveryCents)}
                    />
                    {quote.someArranged && (
                      <p style={mutedNote}>Some items may need a separate delivery cost - we&apos;ll contact you.</p>
                    )}
                  </>
                )}
                {deliveryMethod === 'COURIER' && (
                  <Row
                    label="Courier fee (approx., pay on delivery)"
                    value={formatLkr(quote.courierEstimateCents)}
                    muted
                  />
                )}
                <Row label="Tax" value={formatLkr(quote.taxCents)} />
                {isCourier ? (
                  <>
                    <Row label="Pay online now" value={formatLkr(0)} />
                    <Row label="Approx. total on delivery" value={formatLkr(quote.approxTotalCents)} bold />
                  </>
                ) : deliveryMethod === 'COMPANY_LORRY' && paymentChoice === 'COD' ? (
                  <>
                    <Row label="Pay online now" value={formatLkr(0)} />
                    <Row label="Cash on delivery" value={formatLkr(quote.onlineTotalCents)} bold />
                  </>
                ) : (
                  <Row label="Pay now" value={formatLkr(quote.onlineTotalCents)} bold />
                )}
              </>
            ) : quote && !quote.available ? (
              <p style={{ color: 'var(--danger)' }}>{railReason(quote.reason)}</p>
            ) : (
              <p style={{ color: 'var(--muted)' }}>Enter your postal code and choose a delivery method…</p>
            )}
          </section>

          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <button type="submit" disabled={busy || !canPlace} style={{ ...button, opacity: busy || !canPlace ? 0.5 : 1 }}>
            {busy
              ? 'Placing order…'
              : isCourier
                ? 'Place order (pay on delivery)'
                : 'Place order'}
          </button>
        </form>
      )}
    </main>
  );
}

function RailCard({
  opt,
  selected,
  onSelect,
}: {
  opt: DeliveryOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const disabled = !opt.available;
  return (
    <label
      style={{
        display: 'block',
        padding: '0.75rem',
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.5rem',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <input
        type="radio"
        name="deliveryMethod"
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
        style={{ marginRight: '0.5rem' }}
      />
      <strong>{railLabel(opt.method)}</strong>
      {opt.method === 'COMPANY_LORRY' && opt.available && (
        <span style={{ color: 'var(--muted)' }}> · Pay product + delivery online (card or bank) or cash on delivery</span>
      )}
      {opt.method === 'COURIER' && opt.available && (
        <span style={{ color: 'var(--muted)' }}>
          {' '}
          · No online payment; Domex collects ~{formatLkr(opt.courierEstimateCents)} + product on delivery
        </span>
      )}
      {disabled && opt.reason && (
        <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          {railReason(opt.reason, opt)}
        </div>
      )}
    </label>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: muted ? 'var(--muted)' : 'inherit' }}>
      <span>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}

const wrap = { maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.25rem 3.5rem' } as const;
const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  padding: '1.25rem 1.5rem',
  display: 'grid',
  gap: '0.65rem',
} as const;
const ch3 = { margin: '0 0 0.35rem', fontSize: '1.02rem', fontWeight: 700, color: 'var(--text)' } as const;
const input = {
  padding: '0.7rem 0.85rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.95rem',
  width: '100%',
  background: '#fff',
} as const;
const button = {
  padding: '0.85rem 1rem',
  background: 'var(--primary)',
  color: 'var(--primary-contrast)',
  border: 'none',
  borderRadius: 'var(--radius)',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
} as const;
const mutedNote = { color: 'var(--muted)', fontSize: '0.85rem', margin: 0 } as const;
const savedHint = {
  color: 'var(--muted)',
  fontSize: '0.85rem',
  margin: '0 0 0.75rem',
  lineHeight: 1.45,
} as const;
const forgetLink = {
  justifySelf: 'start',
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'var(--muted)',
  textDecoration: 'underline',
  fontSize: '0.82rem',
  cursor: 'pointer',
} as const;
