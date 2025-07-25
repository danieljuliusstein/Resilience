import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, Clock, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertLeadSchema, type InsertLead } from "@shared/schema";

export default function ContactForm() {
  const { toast } = useToast();

  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      serviceType: "",
      projectDetails: "",
      consent: false,
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Sent!",
        description: "We'll contact you within 24 hours with your personalized quote.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertLead) => {
    createLeadMutation.mutate(data);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="contact" className="py-20 bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your{" "}
              <span className="brand-orange">Home?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Get started with a free consultation and personalized quote. Our
              expert team is ready to bring your vision to life.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center">
                  <Phone className="text-white h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Call Us Today</div>
                  <div className="text-gray-300">(555) RESILIENCE</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center">
                  <Mail className="text-white h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Email Us</div>
                  <div className="text-gray-300">hello@resiliencesolutions.com</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center">
                  <Clock className="text-white h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Business Hours</div>
                  <div className="text-gray-300">
                    Mon-Fri: 8AM-6PM, Sat: 9AM-4PM
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-white rounded-3xl text-brand-dark">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold brand-navy mb-6">
                Get Your Free Quote
              </h3>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="brand-gray">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      placeholder="John"
                      className="mt-2"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="brand-gray">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Doe"
                      className="mt-2"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="brand-gray">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="john@example.com"
                    className="mt-2"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="brand-gray">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="(555) 123-4567"
                    className="mt-2"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="serviceType" className="brand-gray">
                    Service Needed
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("serviceType", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a service..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remodeling">Full Remodeling</SelectItem>
                      <SelectItem value="painting">Painting Services</SelectItem>
                      <SelectItem value="drywall">Drywall Repair</SelectItem>
                      <SelectItem value="design">Interior Design</SelectItem>
                      <SelectItem value="consultation">Free Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="projectDetails" className="brand-gray">
                    Project Details
                  </Label>
                  <Textarea
                    id="projectDetails"
                    {...form.register("projectDetails")}
                    rows={4}
                    placeholder="Tell us about your project vision, timeline, and any specific requirements..."
                    className="mt-2"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={form.watch("consent")}
                    onCheckedChange={(checked) =>
                      form.setValue("consent", checked as boolean)
                    }
                  />
                  <Label htmlFor="consent" className="text-sm brand-gray">
                    I agree to receive communications from Resilience Solutions
                    and understand that my information will be used according to
                    the privacy policy.
                  </Label>
                </div>
                {form.formState.errors.consent && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.consent.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={createLeadMutation.isPending}
                  className="w-full bg-brand-orange text-white py-4 hover:bg-orange-600 text-lg"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {createLeadMutation.isPending
                    ? "Sending..."
                    : "Get My Free Quote"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
