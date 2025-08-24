import FeaturesHero from "./FeaturesHero";
import FeaturesSection from "./FeaturesSection";

export default function FeaturesPage() {
  return (
    // A main container with a dark background for a cohesive theme
    <main className="bg-neutral-950 text-white">
      <FeaturesHero />
      <FeaturesSection />
      {/* You can add a footer or other sections here */}
    </main>
  );
}