import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  Hammer
} from "lucide-react";
import type { Project } from "@shared/schema";

export default function TrackProject() {
  const { magicLink } = useParams<{ magicLink: string }>();

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["/api/track", magicLink],
    enabled: !!magicLink,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600">
            We couldn't find a project with this tracking link. Please check the URL or contact your project manager.
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'consultation':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'in-progress':
        return <Hammer className="h-5 w-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resilience Solutions</h1>
              <p className="text-sm text-gray-600">Project Tracking Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Project Header */}
        <Card className="mb-8 bg-white shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  {project.clientName} - {project.projectType}
                </CardTitle>
                <div className="flex items-center gap-2 mb-4">
                  {getStatusIcon(project.status)}
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Project Manager</p>
                <p className="text-lg font-semibold text-gray-900">{project.projectManager}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
                <span className="text-2xl font-bold text-brand-orange">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3 mb-2" />
              <p className="text-sm text-gray-600">
                {project.progress < 25 ? "Just getting started!" :
                 project.progress < 50 ? "Making good progress" :
                 project.progress < 75 ? "More than halfway there!" :
                 project.progress < 100 ? "Almost finished!" :
                 "Project completed!"}
              </p>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="space-y-2">
                  {project.clientEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{project.clientEmail}</span>
                    </div>
                  )}
                  {project.clientPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{project.clientPhone}</span>
                    </div>
                  )}
                  {project.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{project.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Project Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Budget: ${project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Est. Completion: {project.estimatedCompletion}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Current Status</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Project Notes */}
            {project.notes && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Project Notes</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{project.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.progress < 100 ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-orange rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-900 font-medium">Your project is currently in progress</p>
                      <p className="text-gray-600 text-sm">
                        We'll keep you updated as we make progress on your {project.projectType.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-900 font-medium">Questions or concerns?</p>
                      <p className="text-gray-600 text-sm">
                        Contact your project manager {project.projectManager} for any updates or questions.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <p className="text-gray-900 font-medium">Project Completed!</p>
                    <p className="text-gray-600 text-sm">
                      Thank you for choosing Resilience Solutions. We hope you love your new {project.projectType.toLowerCase()}!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-16 bg-white border-t">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 Resilience Solutions. Building quality homes and lasting relationships.
          </p>
        </div>
      </div>
    </div>
  );
}