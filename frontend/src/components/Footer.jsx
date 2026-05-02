import React, { useState } from 'react';
import { Leaf, Mail, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import InfoModal from '@/components/InfoModal';

const Footer = () => {
  const [open, setOpen] = useState(null); // 'about' | 'delivery' | 'pickup' | 'returns' | 'contact' | 'faq' | 'careers'

  return (
    <>
      <footer className="border-t border-[#2d302a] mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-serif text-2xl text-[#f2f0e6]">
              <Leaf className="w-5 h-5 text-[#d69e4b]" />
              Roots<span className="text-[#c36a4e]">&</span>Earth
            </div>
            <p className="text-sm text-[#a8a69c] mt-3 leading-relaxed max-w-sm">
              Farm-direct fresh produce, delivered to your door across South Africa.
              Grown with intention, picked with pride, in your kitchen by sunset.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full border border-[#2d302a] hover:border-[#d69e4b] text-[#a8a69c] hover:text-[#d69e4b] transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-full border border-[#2d302a] hover:border-[#d69e4b] text-[#a8a69c] hover:text-[#d69e4b] transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#75746c] mb-3">Shop</div>
            <ul className="space-y-2 text-sm text-[#a8a69c]">
              <li><a href="#products" className="hover:text-[#f2f0e6]">All produce</a></li>
              <li><a href="#organic" className="hover:text-[#f2f0e6]">Organic picks</a></li>
              <li><a href="#deals" className="hover:text-[#f2f0e6]">This week&apos;s deals</a></li>
              <li><a href="#bestsellers" className="hover:text-[#f2f0e6]">Best sellers</a></li>
              <li><a href="#new" className="hover:text-[#f2f0e6]">New arrivals</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#75746c] mb-3">Help</div>
            <ul className="space-y-2 text-sm text-[#a8a69c]">
              <li><button data-testid="footer-delivery-btn" onClick={() => setOpen('delivery')} className="hover:text-[#f2f0e6] text-left">Delivery info</button></li>
              <li><button data-testid="footer-pickup-btn"   onClick={() => setOpen('pickup')}   className="hover:text-[#f2f0e6] text-left">Pickup locations</button></li>
              <li><button data-testid="footer-returns-btn"  onClick={() => setOpen('returns')}  className="hover:text-[#f2f0e6] text-left">Returns &amp; refunds</button></li>
              <li><button data-testid="footer-faq-btn"      onClick={() => setOpen('faq')}      className="hover:text-[#f2f0e6] text-left">FAQ</button></li>
              <li><button data-testid="footer-contact-btn"  onClick={() => setOpen('contact')}  className="hover:text-[#f2f0e6] text-left">Contact us</button></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#75746c] mb-3">About</div>
            <ul className="space-y-2 text-sm text-[#a8a69c]">
              <li><button data-testid="footer-about-btn"   onClick={() => setOpen('about')}   className="hover:text-[#f2f0e6] text-left">Our story</button></li>
              <li><button data-testid="footer-careers-btn" onClick={() => setOpen('careers')} className="hover:text-[#f2f0e6] text-left">Careers</button></li>
              <li>
                <a href="mailto:hello@rootsandearth.co.za" className="hover:text-[#f2f0e6] inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> hello@rootsandearth.co.za
                </a>
              </li>
              <li className="text-[#75746c] inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> +27 21 555 0143
              </li>
              <li className="text-[#75746c] inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Cape Town, South Africa
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2d302a] py-5 text-center text-xs text-[#75746c]">
          © {new Date().getFullYear()} Roots &amp; Earth · Cape Town, South Africa · Made with love by Njabulo Nkosi
        </div>
      </footer>

      {/* ============================================================== */}
      {/* MODALS                                                          */}
      {/* ============================================================== */}

      <InfoModal open={open === 'about'} onClose={() => setOpen(null)} kicker="Our story" title="Roots, soil, and small farms.">
        <p>
          <strong className="text-[#f2f0e6]">Roots &amp; Earth</strong> was born in Cape Town from a simple frustration:
          the produce in our supermarkets was travelling further than the people eating it.
          We believe food tastes better — and does more good — when it&apos;s grown nearby,
          picked at the right moment, and gets to your kitchen the same week.
        </p>
        <p>
          We&apos;re a tiny team that personally walks every farm we partner with.
          We work with small organic growers across the Western Cape, free-range egg
          farmers in Stellenbosch, jersey-cow dairies in Elgin, and bakers in
          Woodstock who still ferment for 24 hours.
        </p>
        <p>
          Every order is hand-packed the same morning, delivered carbon-neutral, and
          paid for fairly. No middlemen, no waste, no nonsense. Just real food, from
          real people, brought to you with care.
        </p>
        <p className="text-[#d69e4b] italic">
          &ldquo;We grow what we&apos;d feed our own family. Nothing less.&rdquo;
        </p>
      </InfoModal>

      <InfoModal open={open === 'delivery'} onClose={() => setOpen(null)} kicker="Delivery info" title="Fresh, fast, and on time.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card-surface rounded-lg p-4">
            <div className="text-[#d69e4b] text-xs uppercase tracking-widest mb-1">Standard</div>
            <div className="text-[#f2f0e6] font-serif text-xl">R45</div>
            <div className="text-xs">Cape Town metro · ~45 minutes</div>
          </div>
          <div className="card-surface rounded-lg p-4">
            <div className="text-[#4a6741] text-xs uppercase tracking-widest mb-1">Free</div>
            <div className="text-[#f2f0e6] font-serif text-xl">R0</div>
            <div className="text-xs">On orders over R500</div>
          </div>
        </div>
        <ul className="list-disc pl-5 space-y-1 mt-3">
          <li>Order before 6 PM for same-day delivery (Mon&ndash;Sat).</li>
          <li>Sundays we rest — orders go out first thing Monday.</li>
          <li>Live SMS tracking the moment our driver picks up.</li>
          <li>Currently delivering to Cape Town metro. Stellenbosch &amp; Paarl coming soon.</li>
        </ul>
      </InfoModal>

      <InfoModal open={open === 'pickup'} onClose={() => setOpen(null)} kicker="Pickup locations" title="Skip the fee — collect locally.">
        <p>
          Pay just <span className="text-[#f2f0e6]">R20</span> and pick up your basket
          ready in ~20 minutes from any of these spots:
        </p>
        <ul className="space-y-3 mt-2">
          <li className="card-surface rounded-lg p-3">
            <div className="flex items-center gap-2 text-[#f2f0e6]"><MapPin className="w-3.5 h-3.5 text-[#d69e4b]" /> <span className="font-serif">Roots HQ — Woodstock</span></div>
            <div className="text-xs mt-1">Unit 4, 119 Sir Lowry Road · Mon&ndash;Sat 7 AM&ndash;7 PM</div>
          </li>
          <li className="card-surface rounded-lg p-3">
            <div className="flex items-center gap-2 text-[#f2f0e6]"><MapPin className="w-3.5 h-3.5 text-[#d69e4b]" /> <span className="font-serif">Sea Point Market</span></div>
            <div className="text-xs mt-1">Main Road, Sea Point · Mon&ndash;Fri 8 AM&ndash;6 PM</div>
          </li>
          <li className="card-surface rounded-lg p-3">
            <div className="flex items-center gap-2 text-[#f2f0e6]"><MapPin className="w-3.5 h-3.5 text-[#d69e4b]" /> <span className="font-serif">Constantia Hub</span></div>
            <div className="text-xs mt-1">Inside Constantia Village · Mon&ndash;Sun 9 AM&ndash;6 PM</div>
          </li>
        </ul>
      </InfoModal>

      <InfoModal open={open === 'returns'} onClose={() => setOpen(null)} kicker="Returns &amp; refunds" title="Not happy? We&apos;ll make it right.">
        <p>
          Fresh produce is delicate &mdash; and we know it. If anything in your order
          isn&apos;t up to scratch, just send us a photo within{' '}
          <span className="text-[#f2f0e6]">24 hours of delivery</span> and we&apos;ll do one of:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Replace the item on your next order, free.</li>
          <li>Refund the item to your original payment method (3&ndash;5 working days).</li>
          <li>Credit the amount to your account for instant use.</li>
        </ul>
        <p>
          For pantry items (oils, salts, snacks) you have <span className="text-[#f2f0e6]">7 days</span>{' '}
          to return them unopened in their original packaging. We pay the return courier on us.
        </p>
        <p className="text-xs text-[#75746c]">No forms, no fuss &mdash; just email{' '}
          <a className="text-[#d69e4b]" href="mailto:hello@rootsandearth.co.za">hello@rootsandearth.co.za</a>{' '}
          with your order number.
        </p>
      </InfoModal>

      <InfoModal open={open === 'contact'} onClose={() => setOpen(null)} kicker="Contact us" title="We answer every message, fast.">
        <div className="grid gap-3 sm:grid-cols-2">
          <a href="mailto:hello@rootsandearth.co.za" className="card-surface rounded-lg p-4 hover:border-[#d69e4b] transition">
            <Mail className="w-5 h-5 text-[#d69e4b] mb-2" />
            <div className="text-[#f2f0e6] font-serif text-lg">Email</div>
            <div className="text-xs">hello@rootsandearth.co.za</div>
          </a>
          <a href="tel:+27215550143" className="card-surface rounded-lg p-4 hover:border-[#d69e4b] transition">
            <Phone className="w-5 h-5 text-[#d69e4b] mb-2" />
            <div className="text-[#f2f0e6] font-serif text-lg">Phone</div>
            <div className="text-xs">+27 21 555 0143</div>
          </a>
          <a href="https://wa.me/27215550143" target="_blank" rel="noreferrer" className="card-surface rounded-lg p-4 hover:border-[#d69e4b] transition">
            <Phone className="w-5 h-5 text-[#4a6741] mb-2" />
            <div className="text-[#f2f0e6] font-serif text-lg">WhatsApp</div>
            <div className="text-xs">+27 21 555 0143</div>
          </a>
          <div className="card-surface rounded-lg p-4">
            <Clock className="w-5 h-5 text-[#d69e4b] mb-2" />
            <div className="text-[#f2f0e6] font-serif text-lg">Hours</div>
            <div className="text-xs">Mon&ndash;Sat 7 AM&ndash;7 PM<br/>Closed Sundays</div>
          </div>
        </div>
        <p className="text-xs text-[#75746c]">Average reply time: under 30 minutes during shop hours.</p>
      </InfoModal>

      <InfoModal open={open === 'faq'} onClose={() => setOpen(null)} kicker="Frequently asked" title="Quick answers.">
        <div className="space-y-4">
          <div>
            <div className="text-[#f2f0e6] font-serif text-lg">Is everything organic?</div>
            <p>Most of our produce is certified organic, but we also stock a few smaller-farm conventional items (clearly labelled). Tap the green &ldquo;Organic only&rdquo; filter to see only organic stock.</p>
          </div>
          <div>
            <div className="text-[#f2f0e6] font-serif text-lg">How do I pay?</div>
            <p>Right now we use Cash on Delivery / Pickup. Online card payments via Yoco are coming soon.</p>
          </div>
          <div>
            <div className="text-[#f2f0e6] font-serif text-lg">Do you deliver outside Cape Town?</div>
            <p>Not yet &mdash; we want to keep delivery same-day fresh. Stellenbosch and Paarl are coming early next year.</p>
          </div>
          <div>
            <div className="text-[#f2f0e6] font-serif text-lg">Can I supply my produce to Roots?</div>
            <p>Yes please! Email{' '}
              <a className="text-[#d69e4b]" href="mailto:farmers@rootsandearth.co.za">farmers@rootsandearth.co.za</a>{' '}
              with what you grow and where &mdash; we visit every farm we partner with.
            </p>
          </div>
        </div>
      </InfoModal>

      <InfoModal open={open === 'careers'} onClose={() => setOpen(null)} kicker="Careers" title="Grow with us.">
        <p>
          We&apos;re a small, hands-on team that values curiosity, kindness, and a real
          love of food. We hire slowly and care deeply about who joins us.
        </p>
        <p>
          We&apos;re currently looking for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="text-[#f2f0e6]">Delivery driver</span> &mdash; Cape Town metro · Mon&ndash;Sat</li>
          <li><span className="text-[#f2f0e6]">Pack-house assistant</span> &mdash; early shift, Woodstock</li>
          <li><span className="text-[#f2f0e6]">Customer-care superstar</span> &mdash; remote / part-time</li>
        </ul>
        <p className="text-xs text-[#75746c]">Drop your CV and a quick note about you to{' '}
          <a className="text-[#d69e4b]" href="mailto:careers@rootsandearth.co.za">careers@rootsandearth.co.za</a>.
        </p>
      </InfoModal>
    </>
  );
};

export default Footer;
