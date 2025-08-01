import { EmailOctopusService } from './email-octopus';

export async function scheduleEmailDripCampaign(
  subscriberData: {
    email: string;
    firstName?: string;
    lastName?: string;
    subscriptionSource: string;
  },
  env: any
) {
  try {
    const emailService = new EmailOctopusService(env);
    
    // Add to main list for drip campaigns
    const mainListId = env.EMAILOCTOPUS_MAIN_LIST_ID;
    if (!mainListId) {
      console.warn('EMAILOCTOPUS_MAIN_LIST_ID not configured, skipping drip campaign');
      return false;
    }
    
    await emailService.addToList(mainListId, {
      email: subscriberData.email,
      firstName: subscriberData.firstName,
      lastName: subscriberData.lastName,
      fields: {
        SubscriptionSource: subscriberData.subscriptionSource,
        SignupDate: new Date().toISOString()
      }
    });
    
    // EmailOctopus will handle the drip campaign automatically
    // if you set up automation rules in your EmailOctopus dashboard
    
    console.log(`Added ${subscriberData.email} to EmailOctopus drip campaign`);
    return true;
  } catch (error) {
    console.error('Failed to add to drip campaign:', error);
    throw error;
  }
}

// Drip campaign email templates
export const dripCampaignTemplates = {
  welcome: {
    subject: "Welcome to Resilience Solutions!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">Welcome to Resilience Solutions!</h1>
        <p>Hi {{FirstName}},</p>
        <p>Thank you for your interest in our services! We're excited to help you with your project.</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1a365d;">What's Next?</h3>
          <ul>
            <li>We'll review your request within 24 hours</li>
            <li>Our team will prepare a personalized quote</li>
            <li>We'll schedule a consultation at your convenience</li>
          </ul>
        </div>
        
        <p>In the meantime, feel free to browse our <a href="https://resilience-solutions.com/portfolio">portfolio</a> to see our recent work.</p>
        
        <p>Best regards,<br>The Resilience Solutions Team</p>
      </div>
    `
  },
  
  followUp: {
    subject: "Your Project Estimate is Ready",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">Your Project Estimate is Ready!</h1>
        <p>Hi {{FirstName}},</p>
        <p>We've prepared a detailed estimate for your project. Our team has carefully reviewed your requirements and we're ready to bring your vision to life.</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #1a365d;">Ready to Get Started?</h3>
          <a href="https://resilience-solutions.com/contact" style="background: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Schedule Your Consultation</a>
        </div>
        
        <p>Questions? Simply reply to this email or call us at (555) 123-4567.</p>
        
        <p>Best regards,<br>Daniel Julius Stein<br>Resilience Solutions</p>
      </div>
    `
  },
  
  tips: {
    subject: "5 Tips for Your Home Renovation Project",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">5 Tips for Your Home Renovation Project</h1>
        <p>Hi {{FirstName}},</p>
        <p>Planning a renovation can be overwhelming. Here are our top 5 tips to ensure your project goes smoothly:</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <ol>
            <li><strong>Set a realistic budget</strong> - Include a 20% contingency for unexpected costs</li>
            <li><strong>Plan for disruption</strong> - Consider how the work will affect your daily routine</li>
            <li><strong>Choose quality materials</strong> - They'll save you money in the long run</li>
            <li><strong>Communicate clearly</strong> - Regular check-ins prevent misunderstandings</li>
            <li><strong>Be patient</strong> - Quality work takes time, but the results are worth it</li>
          </ol>
        </div>
        
        <p>Ready to start your project? We're here to guide you through every step.</p>
        
        <p>Best regards,<br>The Resilience Solutions Team</p>
      </div>
    `
  }
};

// Utility function to create drip campaigns in EmailOctopus
export async function createDripCampaign(
  campaignName: string,
  listId: string,
  template: typeof dripCampaignTemplates.welcome,
  env: any
): Promise<boolean> {
  try {
    const emailService = new EmailOctopusService(env);
    
    return await emailService.sendToList(listId, {
      subject: template.subject,
      htmlContent: template.htmlContent
    });
  } catch (error) {
    console.error('Failed to create drip campaign:', error);
    return false;
  }
}

// Schedule welcome email (immediate)
export async function sendWelcomeEmail(
  subscriberData: {
    email: string;
    firstName?: string;
    lastName?: string;
  },
  env: any
): Promise<boolean> {
  try {
    const emailService = new EmailOctopusService(env);
    
    const personalizedContent = dripCampaignTemplates.welcome.htmlContent
      .replace(/{{FirstName}}/g, subscriberData.firstName || 'there');
    
    return await emailService.sendTransactionalEmail({
      to: subscriberData.email,
      subject: dripCampaignTemplates.welcome.subject,
      htmlContent: personalizedContent
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

// For Cloudflare Durable Objects (advanced scheduling)
export class EmailScheduler {
  private env: any;
  
  constructor(env: any) {
    this.env = env;
  }
  
  // Schedule email to be sent after delay
  async scheduleEmail(
    subscriberData: {
      email: string;
      firstName?: string;
      lastName?: string;
    },
    template: keyof typeof dripCampaignTemplates,
    delayHours: number = 24
  ): Promise<boolean> {
    try {
      // In a real implementation, you would use Cloudflare Durable Objects
      // or external scheduling service like Cloudflare Workers Cron
      
      // For now, we'll use KV to store scheduled emails
      const scheduleId = crypto.randomUUID();
      const scheduledTime = Date.now() + (delayHours * 60 * 60 * 1000);
      
      const scheduleData = {
        subscriberData,
        template,
        scheduledTime,
        sent: false
      };
      
      await this.env.KV.put(`schedule:${scheduleId}`, JSON.stringify(scheduleData), {
        expirationTtl: delayHours * 60 * 60 + 3600 // Add 1 hour buffer
      });
      
      console.log(`Scheduled ${template} email for ${subscriberData.email} in ${delayHours} hours`);
      return true;
    } catch (error) {
      console.error('Failed to schedule email:', error);
      return false;
    }
  }
  
  // Process scheduled emails (would be called by cron job)
  async processScheduledEmails(): Promise<void> {
    try {
      // This would typically be implemented with Cloudflare Workers Cron Triggers
      // For now, this is a placeholder for the scheduling logic
      console.log('Processing scheduled emails...');
    } catch (error) {
      console.error('Failed to process scheduled emails:', error);
    }
  }
}