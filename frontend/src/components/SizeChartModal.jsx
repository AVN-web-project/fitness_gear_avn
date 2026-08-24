import React from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';

export default function SizeChartModal({ isOpen, onClose, category }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl text-[var(--text-main)] p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF1E27]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-sans font-black italic uppercase tracking-wide">
                SIZE & FIT GUIDE
              </h3>
              <p className="text-xs text-[var(--text-sub)]">
                Find your perfect gear dimensions for maximum performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg-main)] text-[var(--text-sub)] hover:text-white hover:bg-[#FF1E27] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Size Table */}
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-500/10 text-[#FF1E27] font-heading font-extrabold uppercase border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="p-3">Size Variant</th>
                  <th className="p-3">Length / Circumference</th>
                  <th className="p-3">Recommended Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-medium text-[var(--text-sub)]">
                {category?.includes('KNEE') || category?.includes('ELBOW') ? (
                  <>
                    <tr className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                      <td className="p-3 font-bold text-[var(--text-main)]">Standard (79") / Medium</td>
                      <td className="p-3">Knee: 79" | Elbow: 10"-12"</td>
                      <td className="p-3">Daily heavy training & hyper-mobility</td>
                    </tr>
                    <tr className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                      <td className="p-3 font-bold text-[var(--text-main)]">XL Heavy (90") / Large</td>
                      <td className="p-3">Knee: 90" | Elbow: 12"-14"</td>
                      <td className="p-3">Powerlifting competitions & maximum rebound</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                      <td className="p-3 font-bold text-[var(--text-main)]">18-Inch Competition</td>
                      <td className="p-3">45 cm (18 Inches)</td>
                      <td className="p-3 font-semibold text-[#FF1E27]">IPF Legal Competition Grade</td>
                    </tr>
                    <tr className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                      <td className="p-3 font-bold text-[var(--text-main)]">24-Inch Heavy Duty</td>
                      <td className="p-3">60 cm (24 Inches)</td>
                      <td className="p-3">Maximum wrist locking for 200kg+ Bench</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Measuring Tip */}
          <div className="p-3.5 bg-red-500/5 rounded-xl border border-red-500/20 text-xs text-[var(--text-sub)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#FF1E27] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[var(--text-main)]">Pro Tip:</strong> Measure circumference directly across your joint while flexed. If you are between sizes, choose the larger size for maximum wrapping overlap.
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full btn-cart-inward-glow py-3 rounded-xl font-bold uppercase tracking-wider text-xs"
        >
          GOT IT, CLOSE GUIDE
        </button>

      </div>
    </div>
  );
}
