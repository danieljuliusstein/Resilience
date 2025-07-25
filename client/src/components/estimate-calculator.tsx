import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Home, PaintBucket, Wrench, Palette } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertEstimate } from "@shared/schema";

const projectTypes = [
  {
    value: "remodeling",
    icon: Home,
    title: "Full Remodeling",
    description: "Complete room transformation"
  },
  {
    value: "painting", 
    icon: PaintBucket,
    title: "Painting Services",
    description: "Interior & exterior painting"
  },
  {
    value: "drywall",
    icon: Wrench,
    title: "Drywall Repair", 
    description: "Wall restoration & repair"
  },
  {
    value: "design",
    icon: Palette,
    title: "Interior Design",
    description: "Complete design makeover"
  }
];

export default function EstimateCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: "",
    roomSize: "",
    budget: "",
    timeline: "",
    contactInfo: ""
  });
  const { toast } = useToast();

  const createEstimateMutation = useMutation({
    mutationFn: async (data: InsertEstimate) => {
      const response = await apiRequest("POST", "/api/estimates", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Estimate Created!",
        description: `Your estimated cost is $${data.estimatedCost?.toLocaleString()}. We'll contact you soon!`,
      });
      // Reset form
      setFormData({
        projectType: "",
        roomSize: "",
        budget: "",
        timeline: "",
        contactInfo: ""
      });
      setCurrentStep(1);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.projectType || !formData.contactInfo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createEstimateMutation.mutate(formData);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <section id="calculator" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold brand-navy mb-6">
            Get Your <span className="brand-orange">Instant Estimate</span>
          </h2>
          <p className="text-xl brand-gray max-w-3xl mx-auto">
            Use our smart calculator to get a personalized estimate for your home
            renovation project.
          </p>
        </div>

        <Card className="bg-brand-light rounded-3xl shadow-2xl">
          <CardContent className="p-8 md:p-12">
            {/* Step 1: Project Type */}
            {currentStep === 1 && (
              <div className="step-content">
                <h3 className="text-2xl font-bold brand-navy mb-6">
                  What type of project do you have in mind?
                </h3>
                <RadioGroup
                  value={formData.projectType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectType: value })
                  }
                  className="grid md:grid-cols-2 gap-4"
                >
                  {projectTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div key={type.value} className="relative">
                        <RadioGroupItem
                          value={type.value}
                          id={type.value}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={type.value}
                          className="cursor-pointer block"
                        >
                          <div
                            className={`border-2 rounded-xl p-6 text-center hover:border-brand-orange transition-colors ${
                              formData.projectType === type.value
                                ? "border-brand-orange bg-orange-50"
                                : "border-gray-300"
                            }`}
                          >
                            <IconComponent className="h-12 w-12 brand-orange mx-auto mb-4" />
                            <h4 className="text-xl font-semibold brand-navy">
                              {type.title}
                            </h4>
                            <p className="brand-gray mt-2">{type.description}</p>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Room Size */}
            {currentStep === 2 && (
              <div className="step-content">
                <h3 className="text-2xl font-bold brand-navy mb-6">
                  What's the size of the space?
                </h3>
                <RadioGroup
                  value={formData.roomSize}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roomSize: value })
                  }
                  className="space-y-4"
                >
                  {["Small (under 100 sq ft)", "Medium (100-300 sq ft)", "Large (300-500 sq ft)", "Extra Large (500+ sq ft)"].map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem value={size} id={size} />
                      <Label htmlFor={size} className="text-lg brand-dark cursor-pointer">{size}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Budget */}
            {currentStep === 3 && (
              <div className="step-content">
                <h3 className="text-2xl font-bold brand-navy mb-6">
                  What's your budget range?
                </h3>
                <RadioGroup
                  value={formData.budget}
                  onValueChange={(value) =>
                    setFormData({ ...formData, budget: value })
                  }
                  className="space-y-4"
                >
                  {["Under $1,000", "$1,000 - $5,000", "$5,000 - $15,000", "$15,000 - $30,000", "Over $30,000"].map((budget) => (
                    <div key={budget} className="flex items-center space-x-2">
                      <RadioGroupItem value={budget} id={budget} />
                      <Label htmlFor={budget} className="text-lg brand-dark cursor-pointer">{budget}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 4: Contact Info */}
            {currentStep === 4 && (
              <div className="step-content">
                <h3 className="text-2xl font-bold brand-navy mb-6">
                  How can we reach you with your estimate?
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timeline" className="brand-gray">Preferred Timeline</Label>
                    <RadioGroup
                      value={formData.timeline}
                      onValueChange={(value) =>
                        setFormData({ ...formData, timeline: value })
                      }
                      className="mt-2"
                    >
                      {["ASAP", "Within 1 month", "1-3 months", "3+ months", "Just planning"].map((timeline) => (
                        <div key={timeline} className="flex items-center space-x-2">
                          <RadioGroupItem value={timeline} id={timeline} />
                          <Label htmlFor={timeline} className="brand-dark cursor-pointer">{timeline}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="contactInfo" className="brand-gray">Email or Phone *</Label>
                    <Input
                      id="contactInfo"
                      value={formData.contactInfo}
                      onChange={(e) =>
                        setFormData({ ...formData, contactInfo: e.target.value })
                      }
                      placeholder="your.email@example.com or (555) 123-4567"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
                className="px-6 py-3 border-2 border-brand-gray brand-gray hover:border-brand-orange hover:brand-orange"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep ? "bg-brand-orange" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-brand-orange text-white hover:bg-orange-600"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createEstimateMutation.isPending}
                  className="px-6 py-3 bg-brand-orange text-white hover:bg-orange-600"
                >
                  {createEstimateMutation.isPending ? "Creating..." : "Get Estimate"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
