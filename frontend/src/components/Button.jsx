import React from 'react';
import { Loader2 } from 'lucide-react';
/**
 * AVN Athletics - Universal Custom Button Component
 * Supports signature brand variants: primary (glow red), outline, dark, inward-glow, ghost, and danger.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  rightIcon: RightIcon,
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  href,
  className = '',
  ...props
}) {
  // Base classes for all AVN buttons
  const baseClasses = 'inline-flex items-center justify-center font-heading font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none';

  // Size variants
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-[10px] gap-1.5',
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-3 text-xs sm:text-sm gap-2',
    lg: 'px-7 py-3.5 text-sm gap-2.5',
    xl: 'px-8 py-4 text-base gap-3'
  };

  // Style variants matching AVN brand aesthetic
  const variantClasses = {
    primary: 'btn-glow-red text-white shadow-md hover:shadow-md active:scale-[0.98]',
    'glow-red': 'btn-glow-red text-white shadow-md hover:shadow-md active:scale-[0.98]',
    outline: 'border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[#FF1E27] hover:text-[#FF1E27] bg-transparent active:scale-[0.98]',
    'outline-red': 'border border-[#FF1E27] text-[#FF1E27] hover:bg-[#FF1E27] hover:text-white bg-transparent active:scale-[0.98]',
    dark: 'btn-outline-dark text-[var(--text-main)] active:scale-[0.98]',
    'inward-glow': 'btn-cart-inward-glow text-white active:scale-[0.98]',
    ghost: 'bg-transparent text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)]',
    danger: 'bg-red-600/90 text-white hover:bg-red-700 shadow-md active:scale-[0.98]'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const selectedVariant = variantClasses[variant] || variantClasses.primary;

  const combinedClasses = `${baseClasses} ${selectedSize} ${selectedVariant} ${widthClass} ${className}`.trim();

  const buttonContent = (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && RightIcon && (
        <RightIcon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} onClick} className={combinedClasses} {...props}>
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={combinedClasses}
      {...props}
    >
      {buttonContent}
    </button>
  );
}
