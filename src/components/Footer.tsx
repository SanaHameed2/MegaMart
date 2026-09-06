import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#008ECC] text-white pt-12 pb-6 overflow-hidden font-sans">
      {/* Background Decorative Vector Circles (Right Side) */}
      <div className="absolute right-[-100px] top-[-50px] w-[450px] h-[450px] rounded-full border-[40px] border-white/10 pointer-events-none" />
      <div className="absolute right-[-50px] top-[20px] w-[300px] h-[300px] rounded-full border-[30px] border-white/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">
          
          {/* Column 1: Brand Info & Contact & App Downloads */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[32px] font-bold tracking-tight text-white">
              MegaMart
            </h2>

            <div className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-white">Contact Us</h3>
              
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 mt-0.5 shrink-0 text-white" />
                <div className="flex flex-col text-[14px]">
                  <span className="text-white/80">WhatsApp</span>
                  <a href="https://wa.me/12029182132" className="font-semibold hover:underline">
                    +1 202-918-2132
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 shrink-0 text-white" />
                <div className="flex flex-col text-[14px]">
                  <span className="text-white/80">Call Us</span>
                  <a href="tel:+12029182132" className="font-semibold hover:underline">
                    +1 202-918-2132
                  </a>
                </div>
              </div>
            </div>

            {/* App Badges */}
            <div className="flex flex-col gap-3 pt-2">
              <h3 className="text-[16px] font-semibold text-white">Download App</h3>
              <div className="flex items-center gap-3">
                {/* App Store Button */}
                <a href="#app-store" className="hover:opacity-90 transition-opacity">
                  <div className="bg-black text-white px-3 py-2 rounded-xl flex items-center gap-2 border border-white/20 shadow-sm">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.13-1.96.99-3.1-.98.04-2.18.66-2.88 1.48-.63.73-1.18 1.9-.1 3.03 1.1.08 2.22-.58 2.89-1.41z"/>
                    </svg>
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-[9px] uppercase tracking-wider text-gray-300">Download on the</span>
                      <span className="text-[13px] font-semibold mt-0.5">App Store</span>
                    </div>
                  </div>
                </a>

                {/* Google Play Button */}
                <a href="#play-store" className="hover:opacity-90 transition-opacity">
                  <div className="bg-black text-white px-3 py-2 rounded-xl flex items-center gap-2 border border-white/20 shadow-sm">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M3 20.5v-17c0-.55.34-1 .82-1.22l11.5 9.72-11.5 9.72c-.48-.22-.82-.67-.82-1.22zm13.88-9.22l2.97 1.72c.67.39.67 1.03 0 1.42l-2.97 1.72-2.47-2.09 2.47-1.77zm-12.7 10.3l11.13-9.41 2.28 1.93-12.33 7.15c-.32.19-.71.25-1.08.33zm11.13-15.17L3.88 2.42c.37.08.76.14 1.08.33l12.33 7.15-2.28 1.93z"/>
                    </svg>
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-[9px] uppercase tracking-wider text-gray-300">GET IT ON</span>
                      <span className="text-[13px] font-semibold mt-0.5">Google Play</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Most Popular Categories */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[18px] font-semibold border-b-2 border-white/40 pb-2 inline-block w-fit">
              Most Popular Categories
            </h3>
            <ul className="flex flex-col gap-2.5 text-[14px] text-white/90">
              {['Staples', 'Beverages', 'Personal Care', 'Home Care', 'Baby Care', 'Vegetables & Fruits', 'Snacks & Foods', 'Dairy & Bakery'].map((cat) => (
                <li key={cat} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                  <Link to={`/category/${cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="hover:underline">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Services */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[18px] font-semibold border-b-2 border-white/40 pb-2 inline-block w-fit">
              Customer Services
            </h3>
            <ul className="flex flex-col gap-2.5 text-[14px] text-white/90">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Terms & Conditions', path: '/terms' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'E-waste Policy', path: '/e-waste' },
                { name: 'Cancellation & Return Policy', path: '/returns' },
              ].map((service) => (
                <li key={service.name} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                  <Link to={service.path} className="hover:underline">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-white/20 pt-6 text-center text-[13px] text-white/80">
          © 2022 All rights reserved. Reliance Retail Ltd.
        </div>
      </div>
    </footer>
  );
};

export default Footer;