import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, HelpCircle, Shield, Wrench, Star } from "lucide-react";

const resources = [
  {
    category: "Maintenance Guides",
    icon: <Wrench className="h-6 w-6" />,
    items: [
      {
        title: "Kitchen Care & Maintenance",
        description: "Keep your new kitchen looking pristine with our comprehensive care guide",
        type: "PDF",
        downloadUrl: "#"
      },
      {
        title: "Bathroom Maintenance Tips",
        description: "Essential maintenance tips for your newly remodeled bathroom",
        type: "PDF", 
        downloadUrl: "#"
      },
      {
        title: "Flooring Care Instructions",
        description: "Proper care instructions for different flooring materials",
        type: "PDF",
        downloadUrl: "#"
      }
    ]
  },
  {
    category: "Warranty Information",
    icon: <Shield className="h-6 w-6" />,
    items: [
      {
        title: "Project Warranty Coverage",
        description: "Complete warranty information for your remodeling project",
        type: "PDF",
        downloadUrl: "#"
      },
      {
        title: "Material Warranties",
        description: "Manufacturer warranties for materials used in your project",
        type: "PDF",
        downloadUrl: "#"
      }
    ]
  },
  {
    category: "Project Documentation",
    icon: <FileText className="h-6 w-6" />,
    items: [
      {
        title: "Before & After Photos",
        description: "Professional photos of your completed project",
        type: "ZIP",
        downloadUrl: "#"
      },
      {
        title: "Material Specifications",
        description: "Detailed specifications of all materials used",
        type: "PDF",
        downloadUrl: "#"
      }
    ]
  }
];

const faqs = [
  {
    question: "How long is my project warranty?",
    answer: "We provide a comprehensive 2-year warranty on all labor and a 1-year warranty on installed materials. Manufacturer warranties vary by product."
  },
  {
    question: "What maintenance is required for my new remodel?",
    answer: "Each project includes specific maintenance guidelines. Generally, regular cleaning and annual inspections help maintain your investment."
  },
  {
    question: "Can I request additional work after project completion?",
    answer: "Absolutely! We love working with satisfied clients on additional projects. Contact us for a consultation on any future work."
  },
  {
    question: "How do I report a warranty issue?",
    answer: "Contact us directly via phone or email with photos and a description of the issue. We'll schedule a visit within 48 hours."
  }
];

export default function ClientResourceCenter() {
  const handleDownload = (url: string, filename: string) => {
    // In a real implementation, this would handle the actual download
    console.log(`Downloading: ${filename} from ${url}`);
  };

  return (
    <section id="resources" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold brand-navy mb-6">
            Client <span className="brand-orange">Resource Center</span>
          </h2>
          <p className="text-xl brand-gray max-w-3xl mx-auto">
            Access important documents, maintenance guides, warranty information, 
            and helpful resources for your completed project.
          </p>
        </div>

        {/* Downloadable Resources */}
        <div className="mb-16">
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {resources.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl brand-navy">
                    <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
                      {category.icon}
                    </div>
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-l-4 border-brand-orange/20 pl-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold brand-navy mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(item.downloadUrl, item.title)}
                            className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download {item.type}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl brand-navy">
              <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
                <HelpCircle className="h-6 w-6" />
              </div>
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-semibold brand-navy text-lg">{faq.question}</h4>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <Card className="bg-brand-navy text-white rounded-2xl shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-brand-orange" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Need Additional Support?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Our team is here to help with any questions about your project, 
                maintenance, or future remodeling needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3"
                  onClick={() => {
                    const section = document.getElementById("contact");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-brand-navy px-8 py-3"
                >
                  Schedule Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}