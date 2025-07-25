import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, Hammer, MessageCircle } from "lucide-react";
import MessageModal from "./message-modal";
import type { Project } from "@shared/schema";

export default function ClientDashboard() {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Get the first project for demo purposes
  const sampleProject = projects?.[0];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-white" />;
      case "in-progress":
        return <Hammer className="h-5 w-5 text-white" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-brand-orange";
      default:
        return "bg-gray-300";
    }
  };

  const getPhaseStatus = (phase: string, progress: number) => {
    const phases = {
      "Design Consultation": 25,
      "Demolition & Prep": 50,
      "Installation Phase": 75,
      "Final Touches": 100
    };

    const phaseThreshold = phases[phase as keyof typeof phases];
    if (progress >= phaseThreshold) return "completed";
    if (progress >= phaseThreshold - 25) return "in-progress";
    return "pending";
  };

  if (isLoading) {
    return (
      <section id="dashboard" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold brand-navy mb-6">
              Track Your <span className="brand-orange">Project</span>
            </h2>
          </div>
          <Card className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded mb-8" />
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="dashboard" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold brand-navy mb-6">
            Track Your <span className="brand-orange">Project</span>
          </h2>
          <p className="text-xl brand-gray max-w-3xl mx-auto">
            Stay informed every step of the way with our client dashboard.
            Monitor progress, view updates, and communicate with your project
            team.
          </p>
        </div>

        <Card className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-brand-navy text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Project Dashboard</h3>
                <p className="text-gray-300">
                  {sampleProject?.projectType} - {sampleProject?.clientName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold brand-orange">
                  {sampleProject?.progress || 0}%
                </div>
                <div className="text-sm text-gray-300">Complete</div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <CardContent className="p-8">
            {sampleProject ? (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Progress Timeline */}
                <div className="lg:col-span-2">
                  <h4 className="text-xl font-bold brand-navy mb-6">
                    Project Timeline
                  </h4>
                  <div className="space-y-6">
                    {[
                      { phase: "Design Consultation", date: "March 15, 2024" },
                      { phase: "Demolition & Prep", date: "March 22, 2024" },
                      { phase: "Installation Phase", date: "In Progress - 75% Complete" },
                      { phase: "Final Touches", date: "Scheduled for April 10, 2024" }
                    ].map((item, index) => {
                      const status = getPhaseStatus(item.phase, sampleProject.progress);
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(status)}`}
                          >
                            {getStatusIcon(status)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold brand-navy">
                              {item.phase}
                            </div>
                            <div className="text-sm brand-gray">{item.date}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h4 className="text-xl font-bold brand-navy mb-6">
                    Project Details
                  </h4>
                  <div className="space-y-4">
                    <Card className="bg-brand-light">
                      <CardContent className="p-4">
                        <div className="text-sm brand-gray">Total Budget</div>
                        <div className="text-2xl font-bold brand-navy">
                          ${sampleProject.budget.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-brand-light">
                      <CardContent className="p-4">
                        <div className="text-sm brand-gray">Project Manager</div>
                        <div className="font-semibold brand-navy">
                          {sampleProject.projectManager}
                        </div>
                        <div className="text-sm brand-gray">(555) 123-4567</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-brand-light">
                      <CardContent className="p-4">
                        <div className="text-sm brand-gray">
                          Estimated Completion
                        </div>
                        <div className="font-semibold brand-navy">
                          {sampleProject.estimatedCompletion}
                        </div>
                      </CardContent>
                    </Card>

                    <Button 
                      onClick={() => setIsMessageModalOpen(true)}
                      className="w-full bg-brand-orange text-white hover:bg-orange-600"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Message Team
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 brand-gray">
                <h4 className="text-xl font-semibold mb-2">No Active Projects</h4>
                <p>Once you start a project with us, you'll be able to track its progress here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          projectId={sampleProject?.id}
        />
      </div>
    </section>
  );
}
