import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * AVN Athletics — Universal Button Component
 *
 * Variants:
 *   primary    -> Red glow CTA (btn-glow-red). Main purchase/submit actions.
 *   inward     -> Dark with red inward glow (btn-cart-inward-glow). Add to Cart.
 *   outline    -> Subtle bordered button. Hover fills with red.
 *   ghost      -> Transparent red text link-style. Subtle/secondary actions.
 *   danger     -> Rose-tinted bordered button. Destructive/sign-out actions.
 *   icon       -> Square bordered icon-only button (back, close, navigation).
 *   tag        -> Small pill-shaped red-tinted badge button. Filters, chips.
 *
 * Sizes:
 *   sm   -> text-[10px], py-2 px-3.5
 *   md   -> text-xs, py-3 px-5    (default)
 *   lg   -> text-sm, py-3.5 px-6
 *   full -> w-full, text-sm, py-4
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon = null,
  iconRight = null,
  className = '',
  onClick,
  type = 'button',
  title,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-heading font-extrabold uppercase tracking-wider transition-all cursor-pointer select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const rounded = 'rounded-xl';

  const sizeMap = {
    sm:   'text-[10px] py-2   px-3.5',
    md:   'text-xs    py-3   px-5',
    lg:   'text-sm    py-3.5 px-6',
    full: 'text-sm    py-4   w-full',
  };
  const sizeClass = fullWidth ? sizeMap.full : (sizeMap[size] || sizeMap.md);

  const variantMap = {
    primary: 'btn-glow-red text-white shadow-md',
    inward:  'btn-cart-inward-glow',
    outline: 'border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-main)] hover:border-[#FF1E27] hover:bg-[#FF1E27]/5',
    ghost:   'text-[#FF1E27] hover:underline underline-offset-4 bg-transparent px-1 py-0.5 font-bold text-xs',
    danger:  'border border-[var(--border-subtle)] text-rose-400 hover:border-rose-500 hover:bg-rose-500/10',
    icon:    'p-2.5 border border-[var(--border-subtle)] hover:border-[#FF1E27] text-[var(--text-main)] hover:bg-[#FF1E27]/5',
    tag:     'px-3 py-1.5 rounded-lg bg-[#FF1E27]/10 hover:bg-[#FF1E27]/20 text-[#FF1E27] border border-[#FF1E27]/30 text-xs font-bold tracking-wider',
  };

  const skipSize = ['icon', 'ghost', 'tag'].includes(variant);
  const variantClass = variantMap[variant] || variantMap.primary;

  const classes = [
    base,
    rounded,
    !skipSize ? sizeClass : '',
    variantClass,
    fullWidth && !skipSize ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      title={title}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
}
