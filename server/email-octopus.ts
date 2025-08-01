export class EmailOctopusService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://emailoctopus.com/api/1.6';
  private readonly adminEmail: string;
  private readonly fromEmail: string;

  constructor(env: any) {
    this.apiKey = env.EMAILOCTOPUS_API_KEY;
    this.adminEmail = env.ADMIN_EMAIL || "danieljuliusstein@gmail.com";
    this.fromEmail = env.FROM_EMAIL || "noreply@resilience-solutions.com";
  }

  // Send transactional email (for notifications)
  async sendTransactionalEmail(emailData: {
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
  }): Promise<boolean> {
    try {
      // EmailOctopus doesn't have direct transactional email API
      // We'll use their campaign API to send individual emails
      const campaignId = await this.createSingleRecipientCampaign(emailData);
      if (campaignId) {
        return await this.sendCampaign(campaignId);
      }
      return false;
    } catch (error) {
      console.error('EmailOctopus send failed:', error);
      return false;
    }
  }

  // Create campaign for single recipient
  private async createSingleRecipientCampaign(emailData: {
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
  }): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          name: `Notification - ${Date.now()}`,
          subject: emailData.subject,
          content: {
            html: emailData.htmlContent,
            text: emailData.textContent || this.htmlToText(emailData.htmlContent)
          },
          from: {
            name: 'Resilience Solutions',
            email_address: this.fromEmail
          }
        })
      });

      if (response.ok) {
        const campaign = await response.json();
        
        // Add the recipient to the campaign
        await this.addRecipientToCampaign(campaign.id, emailData.to);
        
        return campaign.id;
      } else {
        const error = await response.text();
        console.error('Campaign creation failed:', error);
        return null;
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      return null;
    }
  }

  // Add recipient to campaign
  private async addRecipientToCampaign(campaignId: string, email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/campaigns/${campaignId}/recipients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          recipients: [{ email_address: email }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Add recipient failed:', error);
      return false;
    }
  }

  // Send campaign
  private async sendCampaign(campaignId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Campaign send failed:', error);
      return false;
    }
  }

  // Alternative: Use list-based approach (more efficient for multiple emails)
  async addToList(listId: string, subscriberData: {
    email: string;
    firstName?: string;
    lastName?: string;
    fields?: Record<string, string>;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/lists/${listId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          email_address: subscriberData.email,
          fields: {
            FirstName: subscriberData.firstName || '',
            LastName: subscriberData.lastName || '',
            ...subscriberData.fields
          },
          status: 'SUBSCRIBED'
        })
      });

      if (response.ok) {
        console.log(`Added ${subscriberData.email} to EmailOctopus list`);
        return true;
      } else {
        const error = await response.text();
        console.error('List subscription failed:', error);
        return false;
      }
    } catch (error) {
      console.error('List subscription error:', error);
      return false;
    }
  }

  // Send to existing list
  async sendToList(listId: string, emailData: {
    subject: string;
    htmlContent: string;
    textContent?: string;
  }): Promise<boolean> {
    try {
      // Create campaign
      const response = await fetch(`${this.apiUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          name: `Campaign - ${Date.now()}`,
          subject: emailData.subject,
          content: {
            html: emailData.htmlContent,
            text: emailData.textContent || this.htmlToText(emailData.htmlContent)
          },
          from: {
            name: 'Resilience Solutions',
            email_address: this.fromEmail
          },
          to: [listId]
        })
      });

      if (response.ok) {
        const campaign = await response.json();
        return await this.sendCampaign(campaign.id);
      }
      return false;
    } catch (error) {
      console.error('List campaign failed:', error);
      return false;
    }
  }

  // Helper: Convert HTML to plain text
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  // Business-specific email methods
  async sendQuoteNotification(lead: any): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">New Quote Request</h2>
        <p>A new quote request has been submitted:</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1a365d;">Customer Details</h3>
          <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Phone:</strong> ${lead.phone}</p>
          <p><strong>Service Type:</strong> ${lead.serviceType || 'Not specified'}</p>
        </div>
        
        ${lead.projectDetails ? `
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1a365d;">Project Details</h3>
            <p>${lead.projectDetails}</p>
          </div>
        ` : ''}
        
        <p style="color: #718096; font-size: 14px;">
          Please contact this customer within 24 hours to provide their personalized quote.
        </p>
      </div>
    `;

    return await this.sendTransactionalEmail({
      to: this.adminEmail,
      subject: `New Quote Request from ${lead.firstName} ${lead.lastName}`,
      htmlContent
    });
  }

  async sendEstimateNotification(estimate: any): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">New Project Estimate Request</h2>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1a365d;">Project Details</h3>
          <p><strong>Type:</strong> ${estimate.projectType}</p>
          <p><strong>Room Size:</strong> ${estimate.roomSize || 'Not specified'}</p>
          <p><strong>Budget Range:</strong> ${estimate.budget || 'Not specified'}</p>
          <p><strong>Timeline:</strong> ${estimate.timeline || 'Not specified'}</p>
          ${estimate.estimatedCost ? `<p><strong>Estimated Cost:</strong> $${estimate.estimatedCost.toLocaleString()}</p>` : ''}
        </div>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1a365d;">Contact Information</h3>
          <p>${estimate.contactInfo}</p>
        </div>
        
        <p style="color: #718096; font-size: 14px;">
          Follow up with this customer to discuss their project in detail.
        </p>
      </div>
    `;

    return await this.sendTransactionalEmail({
      to: this.adminEmail,
      subject: `New Project Estimate Request - ${estimate.projectType}`,
      htmlContent
    });
  }

  async sendMessageNotification(message: any): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">New Message from Client</h2>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1a365d;">Message Details</h3>
          <p><strong>From:</strong> ${message.customerName}</p>
          <p><strong>Email:</strong> ${message.customerEmail}</p>
          ${message.projectId ? `<p><strong>Project ID:</strong> ${message.projectId}</p>` : '<p><strong>Type:</strong> General Inquiry</p>'}
        </div>
        
        <div style="background: #fff; padding: 20px; border-left: 4px solid #ed8936; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1a365d;">Message</h3>
          <p>${message.message}</p>
        </div>
        
        <p style="color: #718096; font-size: 14px;">
          Please respond to the customer promptly.
        </p>
      </div>
    `;

    return await this.sendTransactionalEmail({
      to: this.adminEmail,
      subject: `New Message from ${message.customerName}`,
      htmlContent
    });
  }
}