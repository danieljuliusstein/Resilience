import type { InsertLead, InsertEstimate, InsertMessage } from "@shared/schema";

// Email service for quote notifications
export class EmailService {
  private readonly adminEmail = "danieljuliusstein@gmail.com";
  private readonly apiKey = process.env.EMAILOCTOPUS_API_KEY;

  async sendQuoteNotification(lead: InsertLead): Promise<boolean> {
    try {
      const emailContent = this.generateQuoteEmail(lead);
      
      if (this.apiKey) {
        return await this.sendEmailViaEmailOctopus(emailContent);
      } else {
        // Fallback to console logging if no API key
        console.log("=== NEW QUOTE REQUEST ===");
        console.log(`To: ${this.adminEmail}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log(`Body:\n${emailContent.body}`);
        console.log("========================");
        return true;
      }
    } catch (error) {
      console.error("Failed to send quote notification:", error);
      return false;
    }
  }

  async sendEstimateNotification(estimate: InsertEstimate & { estimatedCost?: number }): Promise<boolean> {
    try {
      const emailContent = this.generateEstimateEmail(estimate);
      
      if (this.apiKey) {
        return await this.sendEmailViaEmailOctopus(emailContent);
      } else {
        // Fallback to console logging if no API key
        console.log("=== NEW ESTIMATE REQUEST ===");
        console.log(`To: ${this.adminEmail}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log(`Body:\n${emailContent.body}`);
        console.log("============================");
        return true;
      }
    } catch (error) {
      console.error("Failed to send estimate notification:", error);
      return false;
    }
  }

  private generateQuoteEmail(lead: InsertLead) {
    return {
      subject: `New Quote Request from ${lead.firstName} ${lead.lastName}`,
      body: `
New quote request received from your Resilience Solutions website:

Customer Details:
- Name: ${lead.firstName} ${lead.lastName}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Service Type: ${lead.serviceType || "Not specified"}

Project Details:
${lead.projectDetails || "No additional details provided"}

Please contact this customer within 24 hours to provide their personalized quote.

---
Resilience Solutions Website
      `.trim()
    };
  }

  private generateEstimateEmail(estimate: InsertEstimate & { estimatedCost?: number }) {
    return {
      subject: `New Project Estimate Request - ${estimate.projectType}`,
      body: `
New estimate request received from your calculator:

Project Details:
- Type: ${estimate.projectType}
- Room Size: ${estimate.roomSize || "Not specified"}
- Budget Range: ${estimate.budget || "Not specified"}
- Timeline: ${estimate.timeline || "Not specified"}
- Estimated Cost: $${estimate.estimatedCost?.toLocaleString() || "Calculating..."}

Contact Information:
${estimate.contactInfo}

Follow up with this customer to discuss their project in detail.

---
Resilience Solutions Website
      `.trim()
    };
  }

  // EmailOctopus API integration
  private async sendEmailViaEmailOctopus(emailContent: { subject: string; body: string }): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.error("EmailOctopus API key not configured");
        return false;
      }

      // Create a simple text campaign via EmailOctopus API
      const response = await fetch('https://emailoctopus.com/api/1.6/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          name: `Quote Notification - ${new Date().toISOString()}`,
          subject: emailContent.subject,
          content: {
            html: emailContent.body.replace(/\n/g, '<br>'),
            text: emailContent.body
          },
          from: {
            name: 'Resilience Solutions',
            email_address: this.adminEmail
          },
          to: [this.adminEmail]
        })
      });

      if (response.ok) {
        console.log("Email notification sent via EmailOctopus");
        return true;
      } else {
        const error = await response.text();
        console.error("EmailOctopus API error:", error);
        return false;
      }
    } catch (error) {
      console.error("Failed to send email via EmailOctopus:", error);
      return false;
    }
  }

  async sendMessageNotification(message: InsertMessage): Promise<boolean> {
    try {
      const emailContent = this.generateMessageEmail(message);
      
      if (this.apiKey) {
        return await this.sendEmailViaEmailOctopus(emailContent);
      } else {
        console.log("=== NEW MESSAGE FROM CLIENT ===");
        console.log(`To: ${this.adminEmail}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log(`Body:\n${emailContent.body}`);
        console.log("===============================");
        return true;
      }
    } catch (error) {
      console.error("Failed to send message notification:", error);
      return false;
    }
  }

  private generateMessageEmail(message: InsertMessage) {
    return {
      subject: `New Message from ${message.customerName}`,
      body: `
New message received from your client dashboard:

From: ${message.customerName}
Email: ${message.customerEmail}
Project ID: ${message.projectId || "General Inquiry"}

Message:
${message.message}

Please respond to the customer promptly.

---
Resilience Solutions Website
      `.trim()
    };
  }
}

export const emailService = new EmailService();