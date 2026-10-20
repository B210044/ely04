import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 sm:py-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-1.5">
              <span>BobaFlow</span>
              <span className="text-amber-500 font-mono text-sm">12</span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Modern Taiwanese artisanal tea bar and dynamic flow studio. Celebrating 12 master formulas crafted from whole-leaf single estate harvests, slow-braised brown sugar cassava, and freshly whipped cream crowns.
            </p>
            <div className="flex items-center gap-3 text-xs text-stone-500 pt-2">
              <span>Taipei</span>
              <span aria-hidden="true">·</span>
              <span>Kyoto</span>
              <span aria-hidden="true">·</span>
              <span>San Francisco</span>
            </div>
          </div>

          {/* Sourcing & Estate */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Tea Leaf Estates
            </h4>
            <ul className="text-xs text-stone-400 space-y-1.5">
              <li>Highland Nuwara Eliya Ceylon</li>
              <li>Anxi Charcoal Tieguanyin</li>
              <li>Kyoto Uji 1st Harvest Matcha</li>
              <li>Hengxian Scented Jasmine</li>
              <li>Nantou High Mountain Oolong</li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Bar Standards
            </h4>
            <ul className="text-xs text-stone-400 space-y-1.5">
              <li>90-Minute Cassava Braise</li>
              <li>Certified Oatly Barista Organic</li>
              <li>No Powdered Artificial Creamers</li>
              <li>Pure Taiwanese Mesona Herb</li>
              <li>Zero Synthetic Flavor Syrups</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} BobaFlow 12 Artisanal Studios. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Crafted with Single-Estate Tea</span>
            <span aria-hidden="true">·</span>
            <span>Temperature & Sweetness Calibrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
