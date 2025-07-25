import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Pencil, 
  Save, 
  Plus, 
  Activity, 
  Calendar, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Copy,
  RefreshCw,
  ExternalLink,
  Check,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, InsertProject, ProjectLog, Milestone } from "@shared/schema";

export default function AdminPanel() {
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState<InsertProject>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    projectType: "",
    status: "consultation",
    budget: 0,
    progress: 0,
    projectManager: "",
    estimatedCompletion: "",
    tags: [],
    isOverdue: false,
    address: "",
    notes: ""
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [pendingProgress, setPendingProgress] = useState<{projectId: number, value: number} | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{projectId: number, value: string} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: metrics } = useQuery<{
    activeProjects: number;
    completedToday: number;
    overdueProjects: number;
    totalProgress: number;
  }>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: projectLogs } = useQuery<ProjectLog[]>({
    queryKey: ["/api/projects", selectedProject, "logs"],
    enabled: !!selectedProject,
  });

  const { data: milestones } = useQuery<Milestone[]>({
    queryKey: ["/api/projects", selectedProject, "milestones"],
    enabled: !!selectedProject,
  });

  const availableTags = [
    "🔴 Delayed",
    "🟢 On-Time", 
    "🟡 Awaiting Materials",
    "🔵 Design Phase",
    "🟠 Permit Required",
    "🟣 Client Review",
    "⚪ Ready to Start"
  ];

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: number; progress: number }) => {
      const response = await apiRequest("PATCH", `/api/projects/${id}/progress`, { progress });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project progress updated!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update progress", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/projects/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project status updated!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Success", description: "New project created!" });
      setNewProject({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        projectType: "",
        status: "consultation",
        budget: 0,
        progress: 0,
        projectManager: "",
        estimatedCompletion: "",
        tags: [],
        isOverdue: false,
        address: "",
        notes: ""
      });
      setSelectedTags([]);
      setShowCreateForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    },
  });

  const regenerateLinkMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/regenerate-link`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Magic link regenerated!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to regenerate link", variant: "destructive" });
    },
  });

  const progressUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleProgressUpdate = (projectId: number, progress: number[]) => {
    // Set pending progress for confirmation
    setPendingProgress({ projectId, value: progress[0] });
  };

  const confirmProgressUpdate = () => {
    if (pendingProgress) {
      updateProgressMutation.mutate({ id: pendingProgress.projectId, progress: pendingProgress.value });
      setPendingProgress(null);
    }
  };

  const cancelProgressUpdate = () => {
    setPendingProgress(null);
  };

  const handleStatusUpdate = (projectId: number, status: string) => {
    setPendingStatus({ projectId, value: status });
  };

  const confirmStatusUpdate = () => {
    if (pendingStatus) {
      updateStatusMutation.mutate({ id: pendingStatus.projectId, status: pendingStatus.value });
      setPendingStatus(null);
    }
  };

  const cancelStatusUpdate = () => {
    setPendingStatus(null);
  };

  const addTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('🔴')) return 'bg-red-100 text-red-800';
    if (tag.includes('🟢')) return 'bg-green-100 text-green-800';
    if (tag.includes('🟡')) return 'bg-yellow-100 text-yellow-800';
    if (tag.includes('🔵')) return 'bg-blue-100 text-blue-800';
    if (tag.includes('🟠')) return 'bg-orange-100 text-orange-800';
    if (tag.includes('🟣')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const copyTrackingLink = (magicLink: string) => {
    const trackingUrl = `${window.location.origin}/track/${magicLink}`;
    navigator.clipboard.writeText(trackingUrl);
    toast({ title: "Copied!", description: "Tracking link copied to clipboard" });
  };

  const openTrackingLink = (magicLink: string) => {
    const trackingUrl = `${window.location.origin}/track/${magicLink}`;
    window.open(trackingUrl, '_blank');
  };

  if (isLoading) {
    return <div className="p-6">Loading admin panel...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Admin Panel</h1>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-brand-orange hover:bg-orange-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.activeProjects || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalProgress || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.overdueProjects || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.completedToday || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Project Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={newProject.clientName}
                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                    placeholder="Smith Residence"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newProject.clientEmail || ""}
                    onChange={(e) => setNewProject({ ...newProject, clientEmail: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Client Phone</Label>
                  <Input
                    id="clientPhone"
                    value={newProject.clientPhone || ""}
                    onChange={(e) => setNewProject({ ...newProject, clientPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Input
                    id="projectType"
                    value={newProject.projectType}
                    onChange={(e) => setNewProject({ ...newProject, projectType: e.target.value })}
                    placeholder="Kitchen Remodel"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: parseInt(e.target.value) || 0 })}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label htmlFor="projectManager">Project Manager</Label>
                  <Input
                    id="projectManager"
                    value={newProject.projectManager}
                    onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })}
                    placeholder="Mike Rodriguez"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newProject.address || ""}
                    onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
                  <Input
                    id="estimatedCompletion"
                    value={newProject.estimatedCompletion}
                    onChange={(e) => setNewProject({ ...newProject, estimatedCompletion: e.target.value })}
                    placeholder="April 15, 2024"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="notes">Project Notes</Label>
                <Textarea
                  id="notes"
                  value={newProject.notes || ""}
                  onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                  placeholder="Additional project details, requirements, or notes..."
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      className={`${getTagColor(tag)} cursor-pointer`}
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select value={newTag} onValueChange={setNewTag}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addTag} variant="outline">
                    Add Tag
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => createProjectMutation.mutate({...newProject, tags: selectedTags})}
                  disabled={createProjectMutation.isPending}
                  className="bg-brand-orange hover:bg-orange-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <div className="grid gap-6">
          {projects?.map((project) => (
            <Card key={project.id} className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">
                    {project.clientName} - {project.projectType}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {project.tags?.map((tag) => (
                      <Badge key={tag} className={getTagColor(tag)}>
                        {tag}
                      </Badge>
                    ))}
                    {project.isOverdue && (
                      <Badge className="bg-red-100 text-red-800">
                        ⚠️ Overdue
                      </Badge>
                    )}
                  </div>
                </div>
                <TooltipProvider>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTrackingLink(project.magicLink)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Client Tracking Link</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTrackingLink(project.magicLink)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open Client Portal</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regenerateLinkMutation.mutate(project.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Regenerate Security Link</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Activity & Milestones</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProject(editingProject === project.id ? null : project.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Project Details</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Progress</Label>
                    <div className="mt-2">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-brand-orange">
                          {project.progress}%
                        </span>
                        {editingProject === project.id && (
                          <div className="flex-1">
                            <Slider
                              value={pendingProgress?.projectId === project.id ? [pendingProgress.value] : [project.progress]}
                              onValueChange={(value) => handleProgressUpdate(project.id, value)}
                              max={100}
                              step={5}
                              className="w-full transition-all duration-300 ease-in-out"
                            />
                            {pendingProgress?.projectId === project.id && (
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={confirmProgressUpdate}
                                  className="bg-green-600 hover:bg-green-700 text-white h-6 px-2"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelProgressUpdate}
                                  className="h-6 px-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <span className="text-xs text-gray-600">
                                  Confirm {pendingProgress.value}% progress?
                                </span>
                              </div>
                            )}
                            {!pendingProgress && (
                              <div className="text-xs text-gray-500 mt-1">
                                Drag to update progress
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="mt-2">
                      {editingProject === project.id ? (
                        <div>
                          <Select
                            value={pendingStatus?.projectId === project.id ? pendingStatus.value : project.status}
                            onValueChange={(value) => handleStatusUpdate(project.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="consultation">Consultation</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                          {pendingStatus?.projectId === project.id && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={confirmStatusUpdate}
                                className="bg-green-600 hover:bg-green-700 text-white h-6 px-2"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelStatusUpdate}
                                className="h-6 px-2"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <span className="text-xs text-gray-600">
                                Confirm status change to "{pendingStatus.value.replace('-', ' ')}"?
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-lg font-semibold capitalize">
                          {project.status.replace('-', ' ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Budget</Label>
                    <div className="text-lg font-semibold text-green-600 mt-2">
                      ${project.budget.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Project Manager</Label>
                    <div className="text-sm">{project.projectManager}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Estimated Completion</Label>
                    <div className="text-sm">{project.estimatedCompletion}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Client Contact</Label>
                    <div className="flex items-center gap-2 text-sm">
                      {project.clientEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{project.clientEmail}</span>
                        </div>
                      )}
                      {project.clientPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{project.clientPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {project.address && (
                  <div className="mt-2 pt-2 border-t">
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      <span>{project.address}</span>
                    </div>
                  </div>
                )}

                {project.notes && (
                  <div className="mt-2 pt-2 border-t">
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <div className="text-sm text-gray-700">{project.notes}</div>
                  </div>
                )}

                {/* Project Details Tabs */}
                {selectedProject === project.id && (
                  <div className="mt-6 pt-6 border-t">
                    <Tabs defaultValue="logs" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="logs">Activity Log</TabsTrigger>
                        <TabsTrigger value="milestones">Milestones</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="logs" className="mt-4">
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {projectLogs?.length ? (
                            projectLogs.map((log) => (
                              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{log.action}</div>
                                  {log.details && <div className="text-xs text-gray-600">{log.details}</div>}
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-4">No activity logs yet</div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="milestones" className="mt-4">
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {milestones?.length ? (
                            milestones.map((milestone) => (
                              <div key={milestone.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`h-4 w-4 rounded-full mt-0.5 ${
                                  milestone.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{milestone.title}</div>
                                  {milestone.description && (
                                    <div className="text-xs text-gray-600">{milestone.description}</div>
                                  )}
                                  {milestone.dueDate && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-4">No milestones set</div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {projects?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Projects Yet</h3>
              <p className="text-gray-500">Create your first project to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}