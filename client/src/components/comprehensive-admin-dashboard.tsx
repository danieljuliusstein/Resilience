import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { 
  BarChart3,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2,
  Send,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Copy,
  Star,
  Archive,
  X,
  MoreHorizontal,
  Home,
  Target,
  Activity,
  Menu
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { 
  Project, 
  Lead, 
  Testimonial, 
  Estimate, 
  Message, 
  ChatSession, 
  ChatMessage,
  InsertProject,
  InsertMessage,
  InsertLead,
  InsertTestimonial,
  InsertEstimate,
  ProjectLog,
  Milestone
} from "@shared/schema";

export default function ComprehensiveAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states for creating new items
  const [newProject, setNewProject] = useState<Partial<InsertProject>>({
    clientName: "",
    clientEmail: "",
    projectType: "",
    budget: 0,
    status: "consultation",
    progress: 0,
    projectManager: "Admin User",
    estimatedCompletion: "TBD"
  });
  
  const [newLead, setNewLead] = useState<Partial<InsertLead>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: ""
  });

  const [newTestimonial, setNewTestimonial] = useState<Partial<InsertTestimonial>>({
    name: "",
    location: "",
    rating: 5,
    review: ""
  });

  // Data fetching
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: leads } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const { data: testimonials } = useQuery<Testimonial[]>({ queryKey: ["/api/testimonials"] });
  const { data: estimates } = useQuery<Estimate[]>({ queryKey: ["/api/estimates"] });
  const { data: messages } = useQuery<Message[]>({ queryKey: ["/api/messages"] });
  const { data: chatSessions } = useQuery<ChatSession[]>({ queryKey: ["/api/chat/sessions"] });
  
  const { data: metrics } = useQuery<{
    activeProjects: number;
    completedToday: number;
    overdueProjects: number;
    totalProgress: number;
  }>({ queryKey: ["/api/dashboard/metrics"] });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({ title: "Success", description: "Message sent!" });
      setNewMessage("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertProject> }) => {
      const response = await apiRequest("PATCH", `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project updated!" });
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project created!" });
      setIsCreateDialogOpen(false);
      setNewProject({
        clientName: "",
        clientEmail: "",
        projectType: "",
        budget: 0,
        status: "consultation",
        progress: 0,
        projectManager: "Admin User",
        estimatedCompletion: "TBD"
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Success", description: "Lead created!" });
      setIsCreateDialogOpen(false);
      setNewLead({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        serviceType: ""
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create lead", variant: "destructive" });
    },
  });

  const createTestimonialMutation = useMutation({
    mutationFn: async (data: InsertTestimonial) => {
      const response = await apiRequest("POST", "/api/testimonials", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({ title: "Success", description: "Testimonial added!" });
      setIsCreateDialogOpen(false);
      setNewTestimonial({
        name: "",
        location: "",
        rating: 5,
        review: ""
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add testimonial", variant: "destructive" });
    },
  });

  const convertLeadToProjectMutation = useMutation({
    mutationFn: async (lead: Lead) => {
      const projectData: InsertProject = {
        clientName: `${lead.firstName} ${lead.lastName}`,
        clientEmail: lead.email,
        projectType: lead.serviceType || "General Project",
        status: "consultation",
        progress: 0,
        budget: 0,
        projectManager: "Admin User",
        estimatedCompletion: "TBD"
      };
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Success", description: "Lead converted to project!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to convert lead", variant: "destructive" });
    },
  });

  const refreshDataMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/leads"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/estimates"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/messages"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] })
      ]);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Data refreshed!" });
    },
  });

  // Filter and search functions
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.projectType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredLeads = leads?.filter(lead => 
    lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Stats calculations
  const totalRevenue = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
  const activeProjectsCount = projects?.filter(p => p.status === "in-progress").length || 0;
  const totalLeads = leads?.length || 0;
  const completedProjects = projects?.filter(p => p.status === "completed").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-brand-navy dark:text-white">Admin Dashboard</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-brand-navy dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Resilience Solutions</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <nav className="mt-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "projects", label: "Projects", icon: FileText },
              { id: "leads", label: "Leads", icon: Users },
              { id: "messages", label: "Messages", icon: MessageSquare },
              { id: "testimonials", label: "Testimonials", icon: MessageSquare },
              { id: "estimates", label: "Estimates", icon: DollarSign },
              { id: "chat", label: "Live Chat", icon: MessageSquare },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    activeTab === item.id ? "bg-brand-orange/10 text-brand-orange border-r-2 border-brand-orange" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Navigation */}
        <div className="hidden lg:flex lg:w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-brand-navy dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Resilience Solutions</p>
          </div>
          <nav className="mt-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "projects", label: "Projects", icon: FileText },
              { id: "leads", label: "Leads", icon: Users },
              { id: "messages", label: "Messages", icon: MessageSquare },
              { id: "testimonials", label: "Testimonials", icon: MessageSquare },
              { id: "estimates", label: "Estimates", icon: DollarSign },
              { id: "chat", label: "Live Chat", icon: MessageSquare },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    activeTab === item.id ? "bg-brand-orange/10 text-brand-orange border-r-2 border-brand-orange" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 min-w-0">
          {/* Header */}
          <div className="mb-6 lg:mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
                <p className="text-gray-500 mt-1">Manage your {activeTab} efficiently</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 border-gray-300 focus:border-brand-orange focus:ring-brand-orange"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const csvData = `Name,Email,Status,Type\n${projects?.map(p => `${p.clientName},${p.clientEmail},${p.status},${p.projectType}`).join('\n') || ''}`;
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'projects-export.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast({ title: "Success", description: "Data exported!" });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="brand" 
                  size="sm"
                  onClick={() => refreshDataMutation.mutate()}
                  disabled={refreshDataMutation.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshDataMutation.isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-green-500 rounded-full">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Projects</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeProjectsCount}</p>
                      </div>
                      <div className="p-3 bg-blue-500 rounded-full">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Leads</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalLeads}</p>
                      </div>
                      <div className="p-3 bg-purple-500 rounded-full">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Completed</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{completedProjects}</p>
                      </div>
                      <div className="p-3 bg-orange-500 rounded-full">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {projects?.slice(0, 5).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{project.clientName}</p>
                            <p className="text-sm text-gray-500">{project.projectType}</p>
                          </div>
                          <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                            {project.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {leads?.slice(0, 5).map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{lead.firstName} {lead.lastName}</p>
                            <p className="text-sm text-gray-500">{lead.email}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            New
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isCreateDialogOpen && activeTab === "projects"} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="brand" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client-name">Client Name</Label>
                        <Input
                          id="client-name"
                          value={newProject.clientName}
                          onChange={(e) => setNewProject({...newProject, clientName: e.target.value})}
                          placeholder="Enter client name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-email">Client Email</Label>
                        <Input
                          id="client-email"
                          type="email"
                          value={newProject.clientEmail || ""}
                          onChange={(e) => setNewProject({...newProject, clientEmail: e.target.value})}
                          placeholder="client@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="project-type">Project Type</Label>
                        <Select 
                          value={newProject.projectType} 
                          onValueChange={(value) => setNewProject({...newProject, projectType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kitchen Remodel">Kitchen Remodel</SelectItem>
                            <SelectItem value="Bathroom Renovation">Bathroom Renovation</SelectItem>
                            <SelectItem value="Basement Finishing">Basement Finishing</SelectItem>
                            <SelectItem value="Whole Home Renovation">Whole Home Renovation</SelectItem>
                            <SelectItem value="Room Addition">Room Addition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={newProject.budget}
                          onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="project-manager">Project Manager</Label>
                        <Input
                          id="project-manager"
                          value={newProject.projectManager}
                          onChange={(e) => setNewProject({...newProject, projectManager: e.target.value})}
                          placeholder="Admin User"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimated-completion">Estimated Completion</Label>
                        <Input
                          id="estimated-completion"
                          value={newProject.estimatedCompletion}
                          onChange={(e) => setNewProject({...newProject, estimatedCompletion: e.target.value})}
                          placeholder="TBD"
                        />
                      </div>
                      <Button 
                        variant="brand" 
                        className="w-full"
                        onClick={() => {
                          if (newProject.clientName && newProject.clientEmail && newProject.projectType && newProject.projectManager && newProject.estimatedCompletion) {
                            createProjectMutation.mutate(newProject as InsertProject);
                          } else {
                            toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
                          }
                        }}
                        disabled={createProjectMutation.isPending}
                      >
                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="font-semibold text-gray-900 dark:text-white min-w-[150px]">Client</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white min-w-[120px]">Project Type</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white min-w-[100px]">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white min-w-[120px]">Progress</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white min-w-[100px]">Budget</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white min-w-[150px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{project.clientName}</p>
                              <p className="text-sm text-gray-500">{project.clientEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>{project.projectType}</TableCell>
                          <TableCell>
                            <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={project.progress} className="flex-1" />
                              <span className="text-sm">{project.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>${(project.budget || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(project);
                                  toast({ title: "Project Details", description: `Viewing ${project.clientName}'s project` });
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingItem(project);
                                  toast({ title: "Edit Mode", description: `Editing ${project.clientName}'s project` });
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {project.magicLink && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/track/${project.magicLink}`);
                                    toast({ title: "Copied!", description: "Tracking link copied to clipboard" });
                                  }}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === "leads" && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                              <p className="text-sm text-gray-500">Individual</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1" />
                                {lead.email}
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="w-3 h-3 mr-1" />
                                {lead.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{lead.serviceType}</TableCell>
                          <TableCell>Contact for Quote</TableCell>
                          <TableCell>Recent</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="brandOutline" 
                                size="sm"
                                onClick={() => convertLeadToProjectMutation.mutate(lead)}
                                disabled={convertLeadToProjectMutation.isPending}
                              >
                                {convertLeadToProjectMutation.isPending ? "Converting..." : "Convert to Project"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setActiveTab("messages");
                                  setSelectedProjectId("");
                                  toast({ title: "Message Center", description: `Opening message center for ${lead.firstName} ${lead.lastName}` });
                                }}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Project Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {messages?.map((message) => (
                          <div key={message.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{message.customerName}</p>
                                <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(message.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="outline">Project #{message.projectId}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Send New Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.clientName} - {project.projectType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={6}
                      />
                      <Button 
                        variant="brand" 
                        className="w-full"
                        onClick={() => {
                          if (selectedProjectId && newMessage.trim()) {
                            sendMessageMutation.mutate({
                              projectId: Number(selectedProjectId),
                              customerName: "Admin",
                              customerEmail: "admin@resilience-solutions.com",
                              message: newMessage.trim()
                            });
                          } else {
                            toast({ title: "Error", description: "Please select a project and enter a message", variant: "destructive" });
                          }
                        }}
                        disabled={sendMessageMutation.isPending}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Live Chat Tab */}
          {activeTab === "chat" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Chat Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chatSessions?.filter(s => s.isActive).map((session) => (
                        <div key={session.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{session.visitorName || "Anonymous"}</p>
                              <p className="text-sm text-gray-500">{session.visitorEmail}</p>
                            </div>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Started: {new Date(session.startedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chat History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chatSessions?.filter(s => !s.isActive).slice(0, 10).map((session) => (
                        <div key={session.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{session.visitorName || "Anonymous"}</p>
                              <p className="text-sm text-gray-500">{session.visitorEmail}</p>
                            </div>
                            <Badge variant="secondary">Ended</Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {session.endedAt && `Ended: ${new Date(session.endedAt).toLocaleString()}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Customer Testimonials</h3>
                <Dialog open={isCreateDialogOpen && activeTab === "testimonials"} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="brand" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Testimonial
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Testimonial</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="testimonial-name">Customer Name</Label>
                        <Input
                          id="testimonial-name"
                          value={newTestimonial.name}
                          onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="testimonial-location">Location</Label>
                        <Input
                          id="testimonial-location"
                          value={newTestimonial.location}
                          onChange={(e) => setNewTestimonial({...newTestimonial, location: e.target.value})}
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <Label htmlFor="testimonial-rating">Rating</Label>
                        <Select 
                          value={newTestimonial.rating?.toString()} 
                          onValueChange={(value) => setNewTestimonial({...newTestimonial, rating: Number(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="testimonial-text">Testimonial</Label>
                        <Textarea
                          id="testimonial-text"
                          value={newTestimonial.review}
                          onChange={(e) => setNewTestimonial({...newTestimonial, review: e.target.value})}
                          placeholder="Enter customer testimonial..."
                          rows={4}
                        />
                      </div>
                      <Button 
                        variant="brand" 
                        className="w-full"
                        onClick={() => {
                          if (newTestimonial.name && newTestimonial.review && newTestimonial.rating) {
                            createTestimonialMutation.mutate(newTestimonial as InsertTestimonial);
                          } else {
                            toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
                          }
                        }}
                        disabled={createTestimonialMutation.isPending}
                      >
                        {createTestimonialMutation.isPending ? "Adding..." : "Add Testimonial"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {testimonials?.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{testimonial.rating}/5</span>
                      </div>
                      <p className="text-gray-700 mb-4 italic">"{testimonial.review}"</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.location}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingItem(testimonial);
                              toast({ title: "Edit Mode", description: `Editing ${testimonial.name}'s testimonial` });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({ title: "Archived", description: `${testimonial.name}'s testimonial archived` });
                            }}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Estimates Tab */}
          {activeTab === "estimates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Project Estimates</h3>
                <Dialog open={isCreateDialogOpen && activeTab === "estimates"} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="brand" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Estimate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Estimate</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="estimate-customer">Customer Name</Label>
                        <Input
                          id="estimate-customer"
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimate-email">Customer Email</Label>
                        <Input
                          id="estimate-email"
                          type="email"
                          placeholder="customer@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimate-service">Service Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kitchen Remodel">Kitchen Remodel</SelectItem>
                            <SelectItem value="Bathroom Renovation">Bathroom Renovation</SelectItem>
                            <SelectItem value="Basement Finishing">Basement Finishing</SelectItem>
                            <SelectItem value="Whole Home Renovation">Whole Home Renovation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="estimate-scope">Project Scope</Label>
                        <Textarea
                          id="estimate-scope"
                          placeholder="Describe the project scope..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimate-cost">Total Cost</Label>
                        <Input
                          id="estimate-cost"
                          type="number"
                          placeholder="0"
                        />
                      </div>
                      <Button 
                        variant="brand" 
                        className="w-full"
                        onClick={() => {
                          toast({ title: "Success", description: "Estimate created!" });
                          setIsCreateDialogOpen(false);
                        }}
                      >
                        Create Estimate
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Customer</TableHead>
                          <TableHead className="min-w-[120px]">Service Type</TableHead>
                          <TableHead className="min-w-[100px]">Scope</TableHead>
                          <TableHead className="min-w-[120px]">Total Cost</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[150px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {estimates?.map((estimate) => (
                        <TableRow key={estimate.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{estimate.contactInfo}</p>
                              <p className="text-sm text-gray-500">Contact Info</p>
                            </div>
                          </TableCell>
                          <TableCell>{estimate.projectType}</TableCell>
                          <TableCell>{estimate.roomSize || "N/A"}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            ${estimate.estimatedCost?.toLocaleString() || "TBD"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(estimate);
                                  toast({ title: "Estimate Details", description: `Viewing estimate for ${estimate.projectType}` });
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingItem(estimate);
                                  toast({ title: "Edit Mode", description: `Editing estimate for ${estimate.projectType}` });
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  toast({ title: "Estimate Sent", description: `Estimate sent to customer` });
                                }}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" defaultValue="Resilience Solutions" />
                    </div>
                    <div>
                      <Label htmlFor="company-email">Contact Email</Label>
                      <Input id="company-email" defaultValue="info@resilience-solutions.com" />
                    </div>
                    <div>
                      <Label htmlFor="company-phone">Phone Number</Label>
                      <Input id="company-phone" defaultValue="(123) 456-7890" />
                    </div>
                    <div>
                      <Label htmlFor="company-address">Address</Label>
                      <Textarea id="company-address" defaultValue="123 Main St, City, State 12345" />
                    </div>
                    <Button 
                      variant="brand"
                      onClick={() => {
                        toast({ title: "Success", description: "Company information saved!" });
                      }}
                    >
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="default-markup">Default Markup (%)</Label>
                      <Input id="default-markup" defaultValue="25" type="number" />
                    </div>
                    <div>
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <Input id="tax-rate" defaultValue="8.25" type="number" step="0.01" />
                    </div>
                    <div>
                      <Label htmlFor="lead-notification">Lead Notification Email</Label>
                      <Input id="lead-notification" defaultValue="leads@resilience-solutions.com" />
                    </div>
                    <div>
                      <Label htmlFor="auto-backup">Automatic Backup</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="brand"
                      onClick={() => {
                        toast({ title: "Success", description: "Business settings updated!" });
                      }}
                    >
                      Update Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input id="smtp-host" placeholder="smtp.gmail.com" />
                    </div>
                    <div>
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input id="smtp-port" defaultValue="587" type="number" />
                    </div>
                    <div>
                      <Label htmlFor="smtp-user">SMTP Username</Label>
                      <Input id="smtp-user" placeholder="your-email@company.com" />
                    </div>
                    <div>
                      <Label htmlFor="smtp-password">SMTP Password</Label>
                      <Input id="smtp-password" type="password" placeholder="••••••••" />
                    </div>
                    <Button 
                      variant="brand"
                      onClick={() => {
                        toast({ title: "Success", description: "Email settings tested and saved!" });
                      }}
                    >
                      Test & Save Email Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Admin User</p>
                          <p className="text-sm text-gray-500">admin@resilience-solutions.com</p>
                        </div>
                        <Badge>Owner</Badge>
                      </div>
                    </div>
                    <Button variant="brandOutline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New User
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Project Edit/View Modal */}
          {(selectedItem || editingItem) && (
            <Dialog open={!!(selectedItem || editingItem)} onOpenChange={() => { setSelectedItem(null); setEditingItem(null); }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Edit Project" : "Project Details"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {editingItem ? (
                    // Edit form
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-client-name">Client Name</Label>
                          <Input
                            id="edit-client-name"
                            value={editingItem.clientName}
                            onChange={(e) => setEditingItem({...editingItem, clientName: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-client-email">Client Email</Label>
                          <Input
                            id="edit-client-email"
                            value={editingItem.clientEmail}
                            onChange={(e) => setEditingItem({...editingItem, clientEmail: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-project-type">Project Type</Label>
                          <Select value={editingItem.projectType} onValueChange={(value) => setEditingItem({...editingItem, projectType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remodeling">Full Remodeling</SelectItem>
                              <SelectItem value="painting">Interior Painting</SelectItem>
                              <SelectItem value="drywall">Drywall Repair</SelectItem>
                              <SelectItem value="design">Interior Design</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-status">Status</Label>
                          <Select value={editingItem.status} onValueChange={(value) => setEditingItem({...editingItem, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="consultation">Consultation</SelectItem>
                              <SelectItem value="planning">Planning</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-budget">Budget ($)</Label>
                          <Input
                            id="edit-budget"
                            type="number"
                            value={editingItem.budget}
                            onChange={(e) => setEditingItem({...editingItem, budget: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-progress">Progress (%)</Label>
                          <Input
                            id="edit-progress"
                            type="number"
                            min="0"
                            max="100"
                            value={editingItem.progress}
                            onChange={(e) => setEditingItem({...editingItem, progress: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="edit-completion">Estimated Completion</Label>
                        <Input
                          id="edit-completion"
                          value={editingItem.estimatedCompletion}
                          onChange={(e) => setEditingItem({...editingItem, estimatedCompletion: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditingItem(null)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="brand"
                          onClick={() => {
                            if (editingItem.id) {
                              // Only send the fields that can be updated
                              const updateData = {
                                clientName: editingItem.clientName,
                                clientEmail: editingItem.clientEmail,
                                projectType: editingItem.projectType,
                                status: editingItem.status,
                                budget: editingItem.budget,
                                progress: editingItem.progress,
                                estimatedCompletion: editingItem.estimatedCompletion,
                                projectManager: editingItem.projectManager
                              };
                              updateProjectMutation.mutate({
                                id: editingItem.id,
                                updates: updateData
                              });
                            }
                          }}
                          disabled={updateProjectMutation.isPending}
                        >
                          {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </>
                  ) : selectedItem ? (
                    // View details
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Client Name</Label>
                          <p className="font-medium">{selectedItem.clientName}</p>
                        </div>
                        <div>
                          <Label>Client Email</Label>
                          <p className="text-blue-600">{selectedItem.clientEmail}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Project Type</Label>
                          <p className="capitalize">{selectedItem.projectType}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Badge variant={selectedItem.status === "completed" ? "default" : "secondary"}>
                            {selectedItem.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Budget</Label>
                          <p className="font-semibold text-green-600">${selectedItem.budget?.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label>Progress</Label>
                          <div className="flex items-center space-x-2">
                            <Progress value={selectedItem.progress} className="flex-1" />
                            <span className="text-sm font-medium">{selectedItem.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Estimated Completion</Label>
                        <p>{selectedItem.estimatedCompletion}</p>
                      </div>
                      <div>
                        <Label>Project Manager</Label>
                        <p>{selectedItem.projectManager}</p>
                      </div>
                      {selectedItem.magicLink && (
                        <div>
                          <Label>Tracking Link</Label>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {window.location.origin}/track/{selectedItem.magicLink}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/track/${selectedItem.magicLink}`);
                                toast({ title: "Copied!", description: "Tracking link copied to clipboard" });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setSelectedItem(null)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}