import React from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';
import Button from './Button';

export default function SizeChartModal({ isOpen, onClose, product }) {
  if (!isOpen) return null;

  const sizeGuide = product?.sizeGuide || {};
  const measurementType = sizeGuide.measurementType === 'shaker' || sizeGuide.measurementType === 'bottle'
    ? 'shaker'
    : 'supportGear';
  const rows = Array.isArray(sizeGuide.rows) ? sizeGuide.rows : [];
  const unit = sizeGuide.unit || 'cm';
  const volumeUnit = sizeGuide.volumeUnit || 'ml';

  const columns = measurementType === 'shaker'
      ? [
          ['height', 'Height'],
          ['diameter', 'Diameter'],
          ['weight', `Weight`],
          ['material', 'Material'],
        ]
      : [
          ['fit', 'Fit / Circumference'],
          ['length', 'Length'],
          ['width', 'Width'],
          ['height', 'Height'],
          ['weight', 'Weight'],
        ];

  const title = measurementType === 'shaker' ? 'SHAKER MEASUREMENTS' : 'SUPPORT GEAR SIZE GUIDE';

  const optionHeading = measurementType === 'shaker' ? 'Volume Option' : 'Size';

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
                {title}
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

        {/* Product measurement table */}
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-500/10 text-[#FF1E27] font-heading font-extrabold uppercase border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="p-3">{optionHeading}</th>
                  {columns.map(([, label]) => <th key={label} className="p-3">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-medium text-[var(--text-sub)]">
                {rows.map((row, index) => (
                  <tr key={`${row.size || row.volume || 'option'}-${index}`} className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                    <td className="p-3 font-bold text-[var(--text-main)]">
                      {measurementType === 'shaker'
                        ? `${row.volume || row.size || '-'} ${row.volumeUnit || volumeUnit}`.trim()
                        : row.size || '-'}
                    </td>
                    {columns.map(([field]) => (
                      <td key={field} className="p-3">
                        {row[field] || '-'}{field !== 'material' && row[field] && field !== 'weight' ? ` ${unit}` : ''}
                        {field === 'weight' && row[field] ? ` ${row.weightUnit || 'g'}` : ''}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-6 text-center">
                      Measurement details are not available for this product yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {sizeGuide.notes && (
            <div className="p-3.5 bg-red-500/5 rounded-xl border border-red-500/20 text-xs text-[var(--text-sub)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#FF1E27] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[var(--text-main)]">Additional details:</strong> {sizeGuide.notes}
            </p>
            </div>
          )}
        </div>

        {/* Action button */}
        <Button
          onClick={onClose}
          variant="inward" fullWidth size="md"
        >
          GOT IT, CLOSE GUIDE
        </Button>

      </div>
    </div>
  );
}
