import * as fs from 'fs';
import * as path from 'path';

export class EmailTemplateLoader {
  private static templatesPath = path.join(__dirname, 'templates');

  static loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesPath, `${templateName}.html`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templateName} at ${templatePath}`);
    }
    
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read email template ${templateName}: ${error.message}`);
    }
  }

  static renderTemplate(templateName: string, variables: Record<string, any>): string {
    let template = this.loadTemplate(templateName);
    
    // Replace all {{variable}} placeholders with actual values
    Object.keys(variables).forEach(key => {
      const value = variables[key];
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, String(value));
      }
    });
    
    // Check for any remaining unreplaced placeholders and warn about them
    const unreplacedMatches = template.match(/{{[^}]+}}/g);
    if (unreplacedMatches && unreplacedMatches.length > 0) {
      console.warn(`Warning: Unreplaced placeholders found in template ${templateName}:`, unreplacedMatches);
    }
    
    return template;
  }

  static getAvailableTemplates(): string[] {
    try {
      const files = fs.readdirSync(this.templatesPath);
      return files
        .filter(file => file.endsWith('.html'))
        .map(file => file.replace('.html', ''));
    } catch (error) {
      console.error('Failed to read templates directory:', error);
      return [];
    }
  }
}
