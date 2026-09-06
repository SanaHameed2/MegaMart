import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#008ECC] text-white pt-12 pb-6 overflow-hidden font-sans">
      {/* Background Vector Circle Image Overlay (Right Side) */}
      <img
        src="/assets/images/footer-ircle.png"
        alt=""
        className="absolute right-0 top-0 h-full w-auto object-cover pointer-events-none opacity-90"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">
          
          {/* Column 1: Brand Logo & Contact & App Downloads */}
          <div className="flex flex-col gap-6">
            <div>
              <img 
                src="/assets/images/MegaMart-footer-logo.png" 
                alt="MegaMart" 
                className="h-[36px] w-auto object-contain"
              />
            </div>

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
                  <img 
                    src="/assets/images/app-store.png" 
                    alt="Download on the App Store" 
                    className="h-[42px] w-auto object-contain"
                  />
                </a>

                {/* Google Play Button */}
                <a href="#play-store" className="hover:opacity-90 transition-opacity">
                  <img 
                    src="/assets/images/google-play.png" 
                    alt="Get it on Google Play" 
                    className="h-[42px] w-auto object-contain"
                  />
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