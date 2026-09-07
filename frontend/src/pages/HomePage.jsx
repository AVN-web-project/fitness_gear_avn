import React from 'react';
import Hero from '../components/Hero';
import FeatureBar from '../components/FeatureBar';
import Bestsellers from '../components/Bestsellers';
import WhyChoose from '../components/WhyChoose';

export default function HomePage({
  theme,
  products,
  categories,
  onExploreClick,
  onAddToCart,
  onSelectProduct,
  isMobileView
}) {
  return (
    <>
      <Hero onExploreClick={onExploreClick} theme={theme} isMobileView={isMobileView} />
      <FeatureBar isMobileView={isMobileView} />
      <Bestsellers
        products={products}
        theme={theme}
        categories={categories}
        onAddToCart={onAddToCart}
        onSelectProduct={onSelectProduct}
        onNavigateSearch={onExploreClick}
        isMobileView={isMobileView}
      />
      <WhyChoose isMobileView={isMobileView} />
    </>
  );
}
