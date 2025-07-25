import { db } from "./db";
import { testimonials, projects } from "@shared/schema";
import crypto from "crypto";

async function seedDatabase() {
  console.log("Seeding database...");

  // Insert sample testimonials
  const sampleTestimonials = [
    {
      name: "Sarah Mitchell",
      location: "Homeowner, Chicago",
      rating: 5,
      review: "Resilience Solutions transformed our outdated kitchen into a modern masterpiece. The team was professional, timely, and exceeded our expectations at every turn."
    },
    {
      name: "Michael Johnson", 
      location: "Homeowner, Denver",
      rating: 5,
      review: "From design consultation to final walkthrough, Resilience Solutions delivered exceptional service. Our bathroom renovation is absolutely stunning!"
    },
    {
      name: "Emily Davis",
      location: "Homeowner, Austin", 
      rating: 5,
      review: "Professional, reliable, and incredibly skilled. They completed our entire home painting project ahead of schedule with perfect results."
    }
  ];

  // Insert sample projects
  const sampleProjects = [
    {
      clientName: "Smith Residence",
      clientEmail: "smith@example.com",
      clientPhone: "(555) 123-4567",
      projectType: "Kitchen Remodel",
      status: "in-progress",
      budget: 24500,
      progress: 75,
      projectManager: "Mike Rodriguez",
      estimatedCompletion: "April 15, 2024",
      tags: ["🟢 On-Time"],
      isOverdue: false,
      address: "123 Oak Street",
      notes: "Kitchen renovation with custom cabinets",
      magicLink: crypto.randomUUID()
    }
  ];

  try {
    // Check if data already exists
    const existingTestimonials = await db.select().from(testimonials);
    const existingProjects = await db.select().from(projects);

    if (existingTestimonials.length === 0) {
      await db.insert(testimonials).values(sampleTestimonials);
      console.log("Sample testimonials inserted");
    }

    if (existingProjects.length === 0) {
      await db.insert(projects).values(sampleProjects);
      console.log("Sample projects inserted");
    }

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();