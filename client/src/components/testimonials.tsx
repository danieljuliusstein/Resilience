import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Testimonial } from "@shared/schema";

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  if (isLoading) {
    return (
      <section id="testimonials" className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold brand-navy mb-6">
              What Our <span className="brand-orange">Clients Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white rounded-2xl shadow-lg">
                <CardContent className="p-8">
                  <div className="animate-pulse">
                    <div className="flex mb-6">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="ml-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-3 bg-gray-200 rounded w-32" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <section id="testimonials" className="py-20 bg-brand-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold brand-navy mb-6">
            What Our <span className="brand-orange">Clients Say</span>
          </h2>
          <p className="text-xl brand-gray max-w-3xl mx-auto">
            Don't just take our word for it. Hear from homeowners who have
            experienced the Resilience Solutions difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials?.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-white rounded-2xl shadow-lg min-h-[200px]"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="brand-dark text-lg mb-6 leading-relaxed">
                  "{testimonial.review}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(testimonial.name)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold brand-navy">
                      {testimonial.name}
                    </div>
                    <div className="brand-gray text-sm">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
