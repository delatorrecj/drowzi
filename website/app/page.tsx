import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ScienceSection from "@/components/ScienceSection";
import MascotSection from "@/components/MascotSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <ScienceSection />
        <MascotSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
