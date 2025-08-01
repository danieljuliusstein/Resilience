import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Project {
  id: number;
  clientName: string;
  clientEmail: string | null;
  projectType: string;
  status: string;
  budget: number | null;
  progress: number;
  projectManager: string | null;
  estimatedCompletion: string | null;
}

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  serviceType: string | null;
}

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  review: string;
}

interface Estimate {
  id: number;
  projectType: string;
  roomSize: string | null;
  budget: number | null;
  timeline: string | null;
  contactInfo: string;
  estimatedCost: number | null;
}

export default function DatabaseAdmin() {
  const queryClient = useQueryClient();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Data fetching
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: leads } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const { data: testimonials } = useQuery<Testimonial[]>({ queryKey: ["/api/testimonials"] });
  const { data: estimates } = useQuery<Estimate[]>({ queryKey: ["/api/estimates"] });

  // Delete mutations
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project deleted successfully" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Project> }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditingProject(null);
      toast({ title: "Project updated successfully" });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Lead> }) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setEditingLead(null);
      toast({ title: "Lead updated successfully" });
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Database Administration</h1>
        <p className="text-gray-600 mt-2">Manage your database records directly</p>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects ({projects?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects?.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>{project.id}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell>{project.clientEmail}</TableCell>
                        <TableCell>{project.projectType}</TableCell>
                        <TableCell>{project.status}</TableCell>
                        <TableCell>${project.budget?.toLocaleString()}</TableCell>
                        <TableCell>{project.progress}%</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProject(project)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this project?')) {
                                  deleteProjectMutation.mutate(project.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Edit Project Modal */}
              {editingProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>Edit Project #{editingProject.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Client Name</Label>
                        <Input
                          value={editingProject.clientName}
                          onChange={(e) => setEditingProject({...editingProject, clientName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Client Email</Label>
                        <Input
                          value={editingProject.clientEmail || ''}
                          onChange={(e) => setEditingProject({...editingProject, clientEmail: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Project Type</Label>
                        <Input
                          value={editingProject.projectType}
                          onChange={(e) => setEditingProject({...editingProject, projectType: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Input
                          value={editingProject.status}
                          onChange={(e) => setEditingProject({...editingProject, status: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Budget</Label>
                        <Input
                          type="number"
                          value={editingProject.budget || ''}
                          onChange={(e) => setEditingProject({...editingProject, budget: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Progress (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editingProject.progress}
                          onChange={(e) => setEditingProject({...editingProject, progress: Number(e.target.value)})}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditingProject(null)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            updateProjectMutation.mutate({
                              id: editingProject.id,
                              updates: {
                                clientName: editingProject.clientName,
                                clientEmail: editingProject.clientEmail,
                                projectType: editingProject.projectType,
                                status: editingProject.status,
                                budget: editingProject.budget,
                                progress: editingProject.progress
                              }
                            });
                          }}
                          disabled={updateProjectMutation.isPending}
                        >
                          {updateProjectMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leads ({leads?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads?.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{lead.id}</TableCell>
                        <TableCell>{lead.firstName} {lead.lastName}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.serviceType}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingLead(lead)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testimonials ({testimonials?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {testimonials?.map((testimonial) => (
                  <div key={testimonial.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{testimonial.name} - {testimonial.location}</p>
                        <p className="text-yellow-600">Rating: {testimonial.rating}/5</p>
                        <p className="text-gray-600 mt-2">"{testimonial.review}"</p>
                      </div>
                      <div className="text-sm text-gray-500">ID: {testimonial.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estimates ({estimates?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Room Size</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Estimated Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimates?.map((estimate) => (
                      <TableRow key={estimate.id}>
                        <TableCell>{estimate.id}</TableCell>
                        <TableCell>{estimate.projectType}</TableCell>
                        <TableCell>{estimate.roomSize}</TableCell>
                        <TableCell>{estimate.contactInfo}</TableCell>
                        <TableCell>{estimate.timeline}</TableCell>
                        <TableCell>${estimate.estimatedCost?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}