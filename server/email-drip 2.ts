import { storage } from "./storage";
import { sendEmailOctopusEmail } from "./email";
import type { EmailSubscriber } from "@shared/schema";

// Email templates for drip campaign
const EMAIL_TEMPLATES = {
  welcome: {
    subject: "Welcome to Resilience Solutions - Your Remodeling Journey Begins!",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background-color: #1a365d; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Welcome to Resilience Solutions!</h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0;">Quality Remodeling & Finishing</p>
        </header>
        
        <div style="padding: 30px; background-color: #f7fafc;">
          <h2 style="color: #1a365d; margin-bottom: 20px;">Thank you for your interest!</h2>
          
          <p>We're thrilled that you're considering Resilience Solutions for your remodeling project. Our team is committed to transforming your vision into reality with exceptional craftsmanship and attention to detail.</p>
          
          <div style="background-color: white; padding: 20px; border-left: 4px solid #ed8936; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">What happens next?</h3>
            <ol style="color: #4a5568;">
              <li>Our team will review your project details</li>
              <li>We'll prepare a customized proposal for your needs</li>
              <li>Schedule your free consultation within 48 hours</li>
              <li>Begin planning your dream space transformation</li>
            </ol>
          </div>
          
          <p>In the meantime, you'll receive exclusive updates about our latest projects and helpful remodeling tips over the next few days.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:+1234567890" style="background-color: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Call Us: (123) 456-7890
            </a>
          </div>
        </div>
        
        <footer style="background-color: #2d3748; color: #a0aec0; padding: 20px; text-align: center;">
          <p style="margin: 0;">Resilience Solutions - Transforming Homes, Building Dreams</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Visit our website or call us anytime for questions</p>
        </footer>
      </div>
    `
  },
  
  day2_portfolio: {
    subject: "See What We've Built - Resilience Solutions Project Gallery",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background-color: #1a365d; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Our Recent Projects</h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0;">Quality You Can See</p>
        </header>
        
        <div style="padding: 30px; background-color: #f7fafc;">
          <h2 style="color: #1a365d; margin-bottom: 20px;">Transformations That Inspire</h2>
          
          <p>We thought you'd love to see some of our recent work! These projects showcase the quality and attention to detail that Resilience Solutions brings to every remodeling job.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">⭐ Recent Client Review</h3>
            <blockquote style="font-style: italic; color: #4a5568; border-left: 4px solid #ed8936; padding-left: 15px; margin: 15px 0;">
              "The team at Resilience Solutions exceeded our expectations! Our kitchen remodel was completed on time, within budget, and the quality is outstanding. We couldn't be happier!"
            </blockquote>
            <p style="color: #718096; margin: 0;"><strong>- Sarah & Mike Johnson</strong>, Kitchen Remodel</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">🏠 Project Highlights</h3>
            <ul style="color: #4a5568;">
              <li><strong>Modern Kitchen Renovation</strong> - Complete transformation with custom cabinets</li>
              <li><strong>Master Bathroom Remodel</strong> - Luxury finishes and smart storage solutions</li>
              <li><strong>Open Concept Living</strong> - Removed walls to create spacious family areas</li>
              <li><strong>Basement Finishing</strong> - Added valuable living space and entertainment area</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px 10px 0;">
              View Full Gallery
            </a>
            <a href="#" style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px 10px 0;">
              Get Your Quote
            </a>
          </div>
        </div>
        
        <footer style="background-color: #2d3748; color: #a0aec0; padding: 20px; text-align: center;">
          <p style="margin: 0;">Ready to start your project? We're here to help!</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Call (123) 456-7890 | Email: info@resilience-solutions.com</p>
        </footer>
      </div>
    `
  },
  
  day5_consultation: {
    subject: "Ready to Start? Book Your Free Consultation - Resilience Solutions",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background-color: #ed8936; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Your Free Consultation Awaits!</h1>
          <p style="margin: 10px 0 0 0; color: #fed7aa;">Let's Bring Your Vision to Life</p>
        </header>
        
        <div style="padding: 30px; background-color: #f7fafc;">
          <h2 style="color: #1a365d; margin-bottom: 20px;">Ready to Transform Your Space?</h2>
          
          <p>It's been a few days since you first reached out, and we hope you've enjoyed seeing what Resilience Solutions can do for homeowners like you. Now it's time to take the next step!</p>
          
          <div style="background-color: #ed8936; color: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px;">🎯 Special Offer</h3>
            <p style="margin: 0; font-size: 18px;">Book your consultation this week and receive a <strong>FREE 3D design rendering</strong> of your project!</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">*$500 value - Limited time offer</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">What You'll Get In Your Free Consultation:</h3>
            <ul style="color: #4a5568;">
              <li>✅ Detailed project assessment and planning</li>
              <li>✅ Material recommendations and options</li>
              <li>✅ Accurate timeline and budget estimates</li>
              <li>✅ 3D rendering of your finished space (limited time)</li>
              <li>✅ No-obligation proposal tailored to your needs</li>
            </ul>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">📅 Easy Scheduling Options:</h3>
            <p style="color: #4a5568; margin-bottom: 15px;">Choose what works best for you:</p>
            <ul style="color: #4a5568;">
              <li><strong>In-Home Visit:</strong> We come to you (most popular)</li>
              <li><strong>Video Consultation:</strong> Convenient virtual meeting</li>
              <li><strong>Showroom Visit:</strong> See materials and finishes in person</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:+1234567890" style="background-color: #ed8936; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 18px; font-weight: bold; margin: 0 10px 10px 0;">
              📞 Call Now: (123) 456-7890
            </a>
            <br>
            <a href="#" style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 10px 0 0;">
              📧 Email Us
            </a>
            <a href="#" style="border: 2px solid #1a365d; color: #1a365d; padding: 10px 22px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 10px 0 0;">
              🌐 Schedule Online
            </a>
          </div>
          
          <div style="background-color: #fef5e7; border: 1px solid #f6ad55; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #744210; text-align: center;"><strong>⏰ Don't Wait!</strong> Our calendar fills up quickly. The sooner we meet, the sooner you can start enjoying your beautiful new space.</p>
          </div>
        </div>
        
        <footer style="background-color: #2d3748; color: #a0aec0; padding: 20px; text-align: center;">
          <p style="margin: 0;">Resilience Solutions - Your Local Remodeling Experts</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Licensed | Insured | 2-Year Warranty on All Work</p>
        </footer>
      </div>
    `
  }
};

// Schedule email drip campaign
export async function scheduleEmailDripCampaign(subscriberData: {
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionSource: string;
}) {
  try {
    // Add subscriber to database
    const subscriber = await storage.createEmailSubscriber(subscriberData);
    
    // Send immediate welcome email
    await sendDripEmail(subscriber.id, 'welcome');
    
    // Schedule day 2 email (in production, use a proper job queue like BullMQ)
    setTimeout(async () => {
      try {
        await sendDripEmail(subscriber.id, 'day2_portfolio');
      } catch (error) {
        console.error('Failed to send day 2 email:', error);
      }
    }, 2 * 24 * 60 * 60 * 1000); // 2 days in milliseconds
    
    // Schedule day 5 email
    setTimeout(async () => {
      try {
        await sendDripEmail(subscriber.id, 'day5_consultation');
      } catch (error) {
        console.error('Failed to send day 5 email:', error);
      }
    }, 5 * 24 * 60 * 60 * 1000); // 5 days in milliseconds
    
    console.log(`Email drip campaign scheduled for ${subscriberData.email}`);
    return subscriber;
  } catch (error) {
    console.error('Failed to schedule email drip campaign:', error);
    throw error;
  }
}

// Send individual drip email
export async function sendDripEmail(subscriberId: number, campaignType: 'welcome' | 'day2_portfolio' | 'day5_consultation') {
  try {
    // Get subscriber info
    const subscriber = await storage.getEmailSubscriber(subscriberId);
    if (!subscriber || !subscriber.isActive) {
      console.log(`Subscriber ${subscriberId} not found or inactive`);
      return;
    }
    
    // Get email template
    const template = EMAIL_TEMPLATES[campaignType];
    if (!template) {
      throw new Error(`Unknown campaign type: ${campaignType}`);
    }
    
    // Personalize email content
    let personalizedHtml = template.html;
    if (subscriber.firstName) {
      personalizedHtml = personalizedHtml.replace(/Hi there/g, `Hi ${subscriber.firstName}`);
    }
    
    // Send email via EmailOctopus
    const success = await sendEmailOctopusEmail({
      to: subscriber.email,
      subject: template.subject,
      html: personalizedHtml
    });
    
    if (success) {
      // Record the send in database
      await storage.createEmailCampaignSend({
        subscriberId: subscriber.id,
        campaignType,
        emailSubject: template.subject
      });
      
      console.log(`Sent ${campaignType} email to ${subscriber.email}`);
    } else {
      console.error(`Failed to send ${campaignType} email to ${subscriber.email}`);
    }
    
    return success;
  } catch (error) {
    console.error(`Error sending drip email:`, error);
    throw error;
  }
}

// Background job processor (in production, use BullMQ or similar)
export function startEmailDripProcessor() {
  // This is a simple implementation - in production use a proper job queue
  setInterval(async () => {
    try {
      // Check for emails that need to be sent
      // This would be implemented with a proper job queue in production
      console.log('Email drip processor running...');
    } catch (error) {
      console.error('Email drip processor error:', error);
    }
  }, 60000); // Check every minute
}