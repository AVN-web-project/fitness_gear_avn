import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingCart,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  RefreshCw,
  Ruler,
  Heart,
  Share2,
  MapPin,
  Maximize2,
  X,
  ThumbsUp,
  MessageSquarePlus,
  PackageCheck,
  Sparkles,
  AlertCircle,
  Layers,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import ProductGraphic from '../components/ProductGraphic';
import SizeChartModal from '../components/SizeChartModal';

export default function ProductDetailPage({
  product,
  allProducts = [],
  onAddToCart,
  onSelectProduct,
  onOpenCart,
  onNavigateCart,
  cartCount = 0,
  theme
}) {
  // All hooks MUST be declared at the top before any conditional returns
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes ? product.sizes[0] : 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState(
    product?.colors ? product.colors[0] : { name: 'Crimson Red', hex: '#FF1E27' }
  );
  const [selectedPack, setSelectedPack] = useState(
    product?.packQuantityOptions ? product.packQuantityOptions[0] : 'Single Pack'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // overview, specs, usage, reviews
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Lightbox & Modal view states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Wishlist & Share
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  // Add to cart animation feedback
  const [added, setAdded] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);

  // Dynamic reviews list (with moderation filter: isApproved !== false)
  const approvedReviews = (product?.reviews || []).filter((r) => r.isApproved !== false);
  const [reviewsList, setReviewsList] = useState(approvedReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    title: '',
    comment: ''
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Reset state & Inject SEO metadata + JSON-LD structured data when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (product) {
      if (product.sizes && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0]);
      if (product.packQuantityOptions && product.packQuantityOptions.length > 0) {
        setSelectedPack(product.packQuantityOptions[0]);
      }
      setQuantity(1);
      setActiveGalleryIndex(0);
      setReviewsList((product.reviews || []).filter((r) => r.isApproved !== false));
      setPincodeResult(null);
      setPincode('');

      // --- SEO & Structured Data (JSON-LD) Injection ---
      const prevTitle = document.title;
      document.title = `${product.name} | AVN FITNESS GEAR`;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = product.description;

      // Inject schema.org Product JSON-LD script
      const existingScript = document.getElementById('pdp-json-ld');
      if (existingScript) existingScript.remove();

      const script = document.createElement('script');
      script.id = 'pdp-json-ld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': product.name,
        'image': [window.location.origin + product.image],
        'description': product.description,
        'sku': product.sku || `AVN-${product.id}`,
        'offers': {
          '@type': 'Offer',
          'url': window.location.href,
          'priceCurrency': 'INR',
          'price': product.price,
          'priceValidUntil': '2027-12-31',
          'itemCondition': 'https://schema.org/NewCondition',
          'availability': product.status === 'Active' && (product.stockQuantity > 0 || product.inStock)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': product.rating || 4.9,
          'reviewCount': product.reviewsCount || 100
        }
      });
      document.head.appendChild(script);

      return () => {
        document.title = prevTitle;
        const scriptToRemove = document.getElementById('pdp-json-ld');
        if (scriptToRemove) scriptToRemove.remove();
      };
    }
  }, [product]);

  // Early exit AFTER hooks if product is null
  if (!product) return null;

  // Stock & Availability Evaluation
  const maxStock = product.stockQuantity || product.stockCount || 10;
  const isProductActive = product.status ? product.status === 'Active' : product.inStock !== false;
  const isPurchasingDisabled = !isProductActive || maxStock <= 0;

  // Gallery items handling
  const galleryItems = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [{ id: 'front', label: 'Front View', image: product.image, imageLight: product.imageLight, type: product.imageType }];

  const currentGalleryItem = galleryItems[activeGalleryIndex] || galleryItems[0];
  const activeImage = currentGalleryItem?.image || product.image;
  const activeImageLight = currentGalleryItem?.imageLight || product.imageLight;

  // Price calculations
  const compareAt = product.compareAtPrice || product.mrp || Math.round(product.price * 1.35);
  const discountPercent = Math.round(((compareAt - product.price) / compareAt) * 100);

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (isPurchasingDisabled) return;
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor: selectedColor.name,
      selectedPack,
      quantity
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  // Handle Buy Now
  const handleBuyNow = () => {
    if (isPurchasingDisabled) return;

    onAddToCart({
      ...product,
      selectedSize,
      selectedColor: selectedColor.name,
      selectedPack,
      quantity
    });

    if (onNavigateCart) {
      onNavigateCart();
    } else if (onOpenCart) {
      onOpenCart();
    }
  };

  // Pincode estimation logic
  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      setPincodeResult({
        success: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      });
      return;
    }
    const days = (parseInt(pincode.slice(-1)) % 3) + 1;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + days);
    const formattedDate = estDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    setPincodeResult({
      success: true,
      deliveryDate: formattedDate,
      freeShipping: true,
      codAvailable: true
    });
  };

  // Handle Share Click
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // Handle Review Submission
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment) return;

    const createdReview = {
      id: `rev-${Date.now()}`,
      author: newReview.author,
      rating: Number(newReview.rating),
      date: new Date().toISOString().split('T')[0],
      verified: true,
      isApproved: true,
      title: newReview.title || 'Great performance gear!',
      comment: newReview.comment,
      helpful: 0
    };

    setReviewsList([createdReview, ...reviewsList]);
    setNewReview({ author: '', rating: 5, title: '', comment: '' });
    setShowReviewForm(false);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3500);
  };

  // Upvote review helpfulness
  const handleHelpfulClick = (reviewId) => {
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      )
    );
  };

  // Frequently bought together companion product
  const companionProduct = allProducts.find(
    (p) =>
      p.id !== product.id &&
      (product.frequentlyBoughtWith?.includes(p.id) || p.category === product.category)
  );

  const bundleTotalPrice = companionProduct
    ? Math.round((product.price + companionProduct.price) * 0.9) // 10% bundle discount
    : 0;

  const handleAddBundle = () => {
    if (isPurchasingDisabled) return;
    onAddToCart({ ...product, quantity: 1 });
    if (companionProduct) onAddToCart({ ...companionProduct, quantity: 1 });
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-fade-in text-[var(--text-main)]">

      {/* Main Split PDP Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Interactive Media Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4 sticky top-24">
          
          {/* Main Visual Frame */}
          <div className="relative w-full aspect-square rounded-3xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-6 sm:p-10 flex items-center justify-center overflow-hidden shadow-2xl group">
            
            {/* Badge Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold tracking-widest text-white uppercase bg-[#FF1E27] px-3 py-1 rounded-full shadow-md">
                {product.badge || 'PREMIUM'}
              </span>
              
            </div>

            {/* Expand / Lightbox Button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[var(--bg-main)]/80 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-white hover:bg-[#FF1E27] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
              title="Expand image view"
              aria-label="Expand product image lightbox view"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Graphic Component */}
            <ProductGraphic
              image={activeImage}
              imageLight={activeImageLight}
              type={currentGalleryItem?.type || product.imageType}
              theme={theme}
              className="w-full h-full"
            />
          </div>

          {/* Gallery Thumbnails Switcher */}
          <div
            className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none"
            role="tablist"
            aria-label="Product Gallery Thumbnails"
          >
            {galleryItems.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => setActiveGalleryIndex(idx)}
                role="tab"
                aria-selected={activeGalleryIndex === idx}
                aria-label={`View ${item.label}`}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all p-2 bg-[var(--bg-main)] flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF1E27] ${
                  activeGalleryIndex === idx
                    ? 'border-[#FF1E27] shadow-md scale-105'
                    : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                }`}
              >
                <ProductGraphic
                  image={item.image || product.image}
                  imageLight={item.imageLight || product.imageLight}
                  type={item.type || product.imageType}
                  theme={theme}
                  className="w-full h-full"
                />
                <span className="text-[9px] font-bold uppercase truncate max-w-full text-[var(--text-sub)]">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Security Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center gap-2 text-[11px] text-[var(--text-sub)]">
              <ShieldCheck className="w-4 h-4 text-[#FF1E27] shrink-0" />
              <span>1 Year Warranty</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center gap-2 text-[11px] text-[var(--text-sub)]">
              <Truck className="w-4 h-4 text-[#FF1E27] shrink-0" />
              <span>Express Delivery</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center gap-2 text-[11px] text-[var(--text-sub)]">
              <RefreshCw className="w-4 h-4 text-[#FF1E27] shrink-0" />
              <span>Easy 7-Day Return</span>
            </div>
          </div>

        </div>

        {/* Right Column: Buying Info & Configuration (6 cols) */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* Header & Title */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#FF1E27] tracking-widest uppercase font-heading bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20">
                {product.category}
              </span>
              <span className="text-[11px] text-[var(--text-sub)] font-semibold font-mono bg-white/5 px-2 py-0.5 rounded">
                SKU: {product.sku || `AVN-${product.id.toUpperCase()}`}
              </span>
              {product.ageGenderTag && (
                <span className="text-[10px] font-bold text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded border border-gray-700">
                  {product.ageGenderTag}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-sans font-black italic tracking-wider uppercase text-[var(--text-main)]">
              {product.name}
            </h1>

            {/* Rating Stars & Jump Link */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-[#FF1E27]" aria-label={`Rating ${product.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs font-bold text-[var(--text-sub)] hover:text-[#FF1E27] underline transition-colors cursor-pointer"
              >
                {product.rating} ({reviewsList.length} Verified Customer Reviews)
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-sub)] leading-relaxed italic">
              "{product.tagline}"
            </p>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-heading text-[var(--text-main)]">
                ₹{product.price}
              </span>
              <span className="text-sm font-semibold text-[var(--text-sub)] line-through">
                M.R.P.: ₹{compareAt}
              </span>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                SAVE {discountPercent}%
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-sub)] font-medium">
              Inclusive of all taxes & GST invoice available
            </p>
          </div>

          {/* Stock & Availability Indicator */}
          {isPurchasingDisabled ? (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold font-heading">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {product.status === 'Discontinued'
                  ? 'ðŸš« THIS ITEM HAS BEEN DISCONTINUED'
                  : '⚠️ï¸ CURRENTLY OUT OF STOCK - ITEM UNAVAILABLE'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#FF1E27]/10 border border-[#FF1E27]/30 text-[#FF1E27] text-xs font-bold font-heading">
              <Zap className="w-4 h-4 fill-current animate-pulse shrink-0" />
              <span>
                ⚡ Hurry! Only {maxStock} units left in stock — order soon for fast dispatch.
              </span>
            </div>
          )}

          {/* Color Variant Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold font-heading text-[var(--text-main)] uppercase tracking-wider flex items-center justify-between">
                <span>COLOR OPTION:</span>
                <span className="text-[#FF1E27] font-sans text-xs">{selectedColor.name}</span>
              </label>
              <div className="flex items-center gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color.name}`}
                    aria-selected={selectedColor.name === color.name}
                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedColor.name === color.name
                        ? 'border-[#FF1E27] bg-[#FF1E27]/10 text-[var(--text-main)] shadow-md'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-sub)] hover:border-gray-500'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Variant Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold font-heading text-[var(--text-main)] uppercase tracking-wider">
                  SELECT SIZE / SPEC:
                </label>
                <button
                  onClick={() => setIsSizeChartOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#FF1E27] hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fit Guide</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    aria-label={`Select size ${size}`}
                    aria-selected={selectedSize === size}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold font-heading uppercase transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-[#FF1E27] bg-[#FF1E27] text-white shadow-md'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:border-gray-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pack Quantity Variant Selector */}
          {product.packQuantityOptions && product.packQuantityOptions.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold font-heading text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#FF1E27]" />
                <span>PACK QUANTITY BUNDLE:</span>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {product.packQuantityOptions.map((pack) => (
                  <button
                    key={pack}
                    onClick={() => setSelectedPack(pack)}
                    aria-label={`Select pack option ${pack}`}
                    aria-selected={selectedPack === pack}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold font-heading transition-all cursor-pointer ${
                      selectedPack === pack
                        ? 'border-[#FF1E27] bg-[#FF1E27]/15 text-[#FF1E27] font-extrabold shadow-md'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-sub)] hover:border-gray-500'
                    }`}
                  >
                    {pack}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Counter */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold font-heading text-[var(--text-main)] uppercase tracking-wider">
              QUANTITY:
            </label>
            <div className="flex items-center w-36 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-main)] p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isPurchasingDisabled}
                className="w-10 h-9 rounded-lg text-lg font-bold text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="flex-1 text-center font-extrabold font-heading text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                disabled={isPurchasingDisabled || quantity >= maxStock}
                className="w-10 h-9 rounded-lg text-lg font-bold text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            
            {/* Added to Cart Quick Toast Banner */}
            {added && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in shadow-md">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Added {product.name} to cart! Total: {cartCount} items</span>
                </span>
                <button
                  onClick={() => (onNavigateCart ? onNavigateCart() : onOpenCart())}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-heading font-extrabold text-[11px] hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>VIEW CART</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isPurchasingDisabled}
                className={`flex-1 py-4 px-6 rounded-xl font-bold font-heading text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isPurchasingDisabled
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    : 'btn-cart-inward-glow cursor-pointer'
                }`}
              >
                {isPurchasingDisabled ? (
                  <span>UNAVAILABLE</span>
                ) : added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>ADDED! ({cartCount})</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={isPurchasingDisabled}
                className={`flex-1 py-4 px-6 rounded-xl font-bold font-heading text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors ${
                  isPurchasingDisabled
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    : 'bg-white hover:bg-gray-100 text-black cursor-pointer'
                }`}
              >
                <Zap className={`w-5 h-5 fill-current ${isPurchasingDisabled ? 'text-gray-500' : 'text-[#FF1E27]'}`} />
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Dedicated Button to Redirect to Cart Page with Live Count Badge */}
            <button
              onClick={() => (onNavigateCart ? onNavigateCart() : onOpenCart())}
              className="w-full py-3.5 px-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] hover:bg-[#FF1E27] hover:text-white text-xs font-bold font-heading uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md group"
              aria-label="View Shopping Cart Page"
            >
              <ShoppingBag className="w-4 h-4 text-[#FF1E27] group-hover:text-white transition-colors" />
              <span>REDIRECT TO CART PAGE</span>
              <span className="bg-[#FF1E27] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono group-hover:bg-white group-hover:text-[#FF1E27] transition-colors">
                {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-auto" />
            </button>

            {/* Utility Buttons: Wishlist & Share */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isWishlisted ? 'text-[#FF1E27] border-red-500/40 bg-red-500/5' : 'text-[var(--text-sub)] hover:text-white'
                }`}
                aria-label="Add product to wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>{isWishlisted ? 'WISHLISTED' : 'ADD TO WISHLIST'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] text-xs font-bold text-[var(--text-sub)] hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                aria-label="Share product details link"
              >
                <Share2 className="w-4 h-4" />
                <span>{shareCopied ? 'LINK COPIED!' : 'SHARE PRODUCT'}</span>
              </button>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3">
            <label className="text-xs font-extrabold font-heading text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF1E27]" />
              <span>CHECK DELIVERY ESTIMATE:</span>
            </label>

            <form onSubmit={handleCheckPincode} className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FF1E27]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#FF1E27] text-white font-bold text-xs uppercase font-heading transition-colors cursor-pointer"
              >
                CHECK
              </button>
            </form>

            {pincodeResult && (
              <div className={`p-3 rounded-xl text-xs space-y-1 ${
                pincodeResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {pincodeResult.success ? (
                  <>
                    <div className="font-bold flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4" />
                      <span>Delivery Available by {pincodeResult.deliveryDate}</span>
                    </div>
                    <p className="text-[11px] opacity-90">
                      ✓ Free Shipping Eligible &nbsp;|&nbsp; ✓ Cash on Delivery Available
                    </p>
                  </>
                ) : (
                  <p className="font-bold">{pincodeResult.message}</p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Frequently Bought Together Bundle Builder */}
      {companionProduct && (
        <div className="p-6 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-4 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF1E27]" />
            <h3 className="text-lg font-sans font-black italic uppercase tracking-wide">
              FREQUENTLY BOUGHT TOGETHER
            </h3>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 ml-auto">
              SAVE 10% BUNDLE DISCOUNT
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 justify-between border-t border-[var(--border-subtle)] pt-4">
            
            {/* Products Pair Visual */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Product 1 */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] max-w-xs">
                <ProductGraphic
                  image={product.image}
                  imageLight={product.imageLight}
                  type={product.imageType}
                  theme={theme}
                  className="w-14 h-14 object-contain"
                />
                <div>
                  <h4 className="text-xs font-sans font-black italic uppercase">{product.name}</h4>
                  <p className="text-xs font-extrabold text-[#FF1E27]">₹{product.price}</p>
                </div>
              </div>

              <span className="text-xl font-extrabold font-heading text-[var(--text-sub)]">+</span>

              {/* Product 2 */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] max-w-xs">
                <ProductGraphic
                  image={companionProduct.image}
                  imageLight={companionProduct.imageLight}
                  type={companionProduct.imageType}
                  theme={theme}
                  className="w-14 h-14 object-contain"
                />
                <div>
                  <h4 className="text-xs font-sans font-black italic uppercase">{companionProduct.name}</h4>
                  <p className="text-xs font-extrabold text-[#FF1E27]">₹{companionProduct.price}</p>
                </div>
              </div>
            </div>

            {/* Bundle Action */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between">
              <div>
                <p className="text-xs text-[var(--text-sub)]">Total Bundle Price:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-heading text-[var(--text-main)]">
                    ₹{bundleTotalPrice}
                  </span>
                  <span className="text-xs text-[var(--text-sub)] line-through">
                    ₹{product.price + companionProduct.price}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddBundle}
                disabled={isPurchasingDisabled}
                className={`py-3 px-6 rounded-xl font-bold font-heading text-xs uppercase tracking-wider flex items-center gap-2 ${
                  isPurchasingDisabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'btn-cart-inward-glow cursor-pointer'
                }`}
              >
                {bundleAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>BUNDLE ADDED!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>ADD BUNDLE TO CART</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tabbed Product Details (Overview, Specs, Usage, Reviews) */}
      <div className="space-y-6">
        
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] overflow-x-auto pb-1 scrollbar-none" role="tablist">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'specs', label: 'TECHNICAL SPECS' },
            { id: 'usage', label: 'USAGE & CARE' },
            { id: 'reviews', label: `VERIFIED REVIEWS (${reviewsList.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`px-5 py-3 rounded-t-xl font-extrabold font-heading text-xs sm:text-sm tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FF1E27] text-white border-b-2 border-white shadow-md'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-left min-h-[250px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xl font-sans font-black italic uppercase text-[var(--text-main)]">
                  ENGINEERED FOR HEAVY ATHLETES
                </h3>
                <p className="text-sm text-[var(--text-sub)] leading-relaxed max-w-3xl">
                  {product.description}
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {product.specs?.map((spec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2 hover:border-[#FF1E27]/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-[#FF1E27] flex items-center justify-center font-bold text-xs">
                      0{i + 1}
                    </div>
                    <p className="text-xs font-bold text-[var(--text-main)] leading-snug">
                      {spec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-sans font-black italic uppercase text-[var(--text-main)]">
                DETAILED TECHNICAL SPECIFICATIONS
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {product.fullSpecs ? (
                      Object.entries(product.fullSpecs).map(([key, val]) => (
                        <tr key={key} className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                          <td className="p-4 font-bold text-[#FF1E27] uppercase font-heading w-1/3 border-r border-[var(--border-subtle)]">
                            {key}
                          </td>
                          <td className="p-4 text-[var(--text-main)] font-medium">
                            {val}
                          </td>
                        </tr>
                      ))
                    ) : (
                      product.specs?.map((spec, idx) => (
                        <tr key={idx}>
                          <td className="p-4 font-bold text-[#FF1E27]">Feature {idx + 1}</td>
                          <td className="p-4 text-[var(--text-main)]">{spec}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USAGE & CARE */}
          {activeTab === 'usage' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-sans font-black italic uppercase text-[var(--text-main)]">
                GEAR CARE & WRAPPING INSTRUCTIONS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* How to use */}
                <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-sm font-sans font-black italic uppercase text-[#FF1E27] flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>BEST WRAPPING PRACTICE</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[var(--text-sub)] list-disc pl-4 leading-relaxed">
                    <li>Start wrapping 2 inches below the joint line under moderate tension.</li>
                    <li>Wrap upward spiraling in an overlapping cross pattern.</li>
                    <li>Lock down the final layer using the heavy-duty hook-and-loop closure.</li>
                    <li>Unwrap immediately between heavy sets to restore full blood circulation.</li>
                  </ul>
                </div>

                {/* Washing Instructions */}
                <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-sm font-sans font-black italic uppercase text-[#FF1E27] flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>WASHING & LONGEVITY</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[var(--text-sub)] pl-4 list-disc leading-relaxed">
                    {product.careInstructions?.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    )) || (
                      <>
                        <li>Hand wash cold with mild detergent.</li>
                        <li>Air dry flat in shade. Do not tumble dry.</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Review Summary Score */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <div className="md:col-span-4 text-center md:border-r border-[var(--border-subtle)] md:pr-6 space-y-1">
                  <div className="text-5xl font-extrabold font-heading text-[var(--text-main)]">
                    {product.rating}
                  </div>
                  <div className="flex justify-center text-[#FF1E27] pt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-sub)]">
                    Based on {reviewsList.length} verified & approved reviews
                  </p>
                </div>

                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-sans font-black italic uppercase">
                      VERIFIED ATHLETE REVIEWS
                    </h4>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF1E27] text-white text-xs font-bold uppercase font-heading hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>{showReviewForm ? 'CANCEL' : 'WRITE A REVIEW'}</span>
                    </button>
                  </div>

                  {reviewSubmitted && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      ✓ Thank you! Your review has been submitted and published.
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Write a Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[#FF1E27]/40 space-y-4 animate-fade-in"
                >
                  <h4 className="text-sm font-sans font-black italic uppercase text-[#FF1E27]">
                    WRITE A VERIFIED REVIEW
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-sub)]">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Sharma"
                        value={newReview.author}
                        onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs p-2.5 rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-sub)]">Rating *</label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs p-2.5 rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Average</option>
                        <option value={2}>2 Stars - Below Average</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-sub)]">Review Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Amazing wrist support for heavy benching!"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs p-2.5 rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-sub)]">Detailed Review *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share details about performance, durability, comfort..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs p-2.5 rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-cart-inward-glow py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider font-heading cursor-pointer"
                  >
                    SUBMIT REVIEW
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[var(--text-main)] font-heading">
                          {rev.author}
                        </span>
                        {rev.verified && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            VERIFIED BUYER
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-sub)]">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-[#FF1E27]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <h5 className="text-xs font-bold text-[var(--text-main)] font-heading">
                        {rev.title}
                      </h5>
                    </div>

                    <p className="text-xs text-[var(--text-sub)] leading-relaxed">
                      {rev.comment}
                    </p>

                    <div className="pt-1 flex items-center gap-3">
                      <button
                        onClick={() => handleHelpfulClick(rev.id)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-sub)] hover:text-[#FF1E27] transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({rev.helpful})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Related Products Grid */}
      <div className="space-y-6 pt-6 border-t border-[var(--border-subtle)] text-left">
        <h3 className="text-xl font-sans font-black italic uppercase text-[var(--text-main)]">
          YOU MIGHT ALSO LIKE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProducts
            .filter((p) => p.id !== product.id)
            .slice(0, 3)
            .map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectProduct(item)}
                className="group relative rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-5 flex flex-col justify-between hover:border-[#FF1E27] transition-all cursor-pointer shadow-md"
              >
                <div className="aspect-square bg-[var(--bg-main)] rounded-xl p-4 flex items-center justify-center overflow-hidden mb-4">
                  <ProductGraphic
                    image={item.image}
                    imageLight={item.imageLight}
                    type={item.imageType}
                    theme={theme}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-[#FF1E27] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-sans font-black italic uppercase text-[var(--text-main)] truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-extrabold font-heading text-[var(--text-main)]">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart({ ...item, quantity: 1 });
                      }}
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#FF1E27] text-white transition-colors cursor-pointer"
                      title="Quick Add to Cart"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in" role="dialog" aria-modal="true">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[#FF1E27] hover:text-white hover:bg-[#FF1E27] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[80vh] w-full p-8 flex items-center justify-center">
            <ProductGraphic
              image={activeImage}
              imageLight={activeImageLight}
              type={currentGalleryItem?.type || product.imageType}
              theme={theme}
              className="max-h-[75vh] w-auto object-contain filter drop-shadow-xl"
            />
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category}
      />

    </div>
  );
}

