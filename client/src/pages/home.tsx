import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import ServiceComparison from "@/components/service-comparison";
import ProjectGallery from "@/components/project-gallery";
import Testimonials from "@/components/testimonials";
import EstimateCalculator from "@/components/estimate-calculator";
import ContactForm from "@/components/contact-form";
import ClientDashboard from "@/components/client-dashboard";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ServiceComparison />
      <ProjectGallery />
      <Testimonials />
      <EstimateCalculator />
      <ContactForm />
      <ClientDashboard />
      <Footer />
    </div>
  );
}
