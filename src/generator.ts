import { readFileSync } from 'fs';
import { join } from 'path';
import { PromptGeneratorConfig, GeneratedPrompt, TemplateSection } from './types';
import { PlatformOptimizer, OptimizationResult } from './platform-optimizer';

export class AdaptivePromptGenerator {
  private corePrompt: string = '';
  private extendedPrompts: Map<string, string> = new Map();
  private examples: Map<string, string> = new Map();
  private platformOptimizer: PlatformOptimizer;

  constructor() {
    this.loadPrompts();
    this.platformOptimizer = new PlatformOptimizer();
  }

  private loadPrompts(): void {
    // Load core prompt - this is ALWAYS included
    this.corePrompt = this.getCorePrompt();
    
    // Load extended rules for different platforms
    this.loadExtendedPrompts();
    
    // Load contextual examples
    this.loadExamples();
  }

  private getCorePrompt(): string {
    return `# ZeroCode Framework - Core Rules

## TRIGGER PATTERNS - When you see these, apply rules:

### Code Architecture Decisions
TRIGGERS: "how should I structure", "best practice", "design pattern"
→ APPLY: Hickey Simple Rule - One concept per component

### Problem Solving  
TRIGGERS: "how to implement", "need to build", "want to create"
→ APPLY: Linus Real Problem Rule - Is this actually needed?

### Code Review
TRIGGERS: "is this good", "review my code", "feedback on"
→ APPLY: Zeus Structure - Analyze systematically

## CONCRETE RULES WITH EXAMPLES

### HICKEY RULE: Detect Complexity
BAD PATTERN (avoid this):
\`\`\`javascript
class UserServiceManagerFactory {  // Multiple concepts
  validateAndSaveAndEmail() {}     // Mixed responsibilities
}
\`\`\`

GOOD PATTERN (do this):
\`\`\`javascript
validateUser(user)    // One concept
saveUser(user)        // One concept
emailUser(user)       // One concept
\`\`\`

### LINUS RULE: Real vs Imaginary
IMAGINARY PROBLEMS (don't solve):
- "What if we have 1 million users" (you have 10)
- "This needs to be infinitely scalable" (it doesn't)
- "We might need this flexibility" (you won't)

REAL PROBLEMS (solve these):
- "This takes 5 seconds to load" (measurable)
- "Users can't reset passwords" (actual issue)
- "Database queries fail randomly" (happening now)

### ZEUS STRUCTURE: Every response must have:
🎯 OBJECTIVE: What we're solving (one sentence)
🔧 IMPLEMENTATION: Simple, working code
⚠️ TRADEOFFS: What we're sacrificing for simplicity
📈 VALIDATION: How to verify it works

CRITICAL: Prefer boring solutions that work over clever solutions that might work.`;
  }

  private loadExtendedPrompts(): void {
    // Cursor-specific extended rules
    this.extendedPrompts.set('cursor', `
## Cursor-Specific Code Generation Rules

When generating code in Cursor:
1. Always provide complete, runnable files
2. Include all imports at the top
3. Use TypeScript when possible for better IntelliSense
4. Add clear comments for complex logic

Example of Cursor-optimized response:
\`\`\`typescript
// Complete file: userService.ts
import { db } from './database';
import { User } from './types';

// Simple function - one responsibility
export async function getUser(id: string): Promise<User | null> {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}
\`\`\`
`);

    // Claude-specific extended rules
    this.extendedPrompts.set('claude', `
## Claude-Specific Interaction Rules

When working with Claude:
1. Break complex tasks into clear steps
2. Ask for clarification before making assumptions
3. Provide reasoning before code
4. Use markdown for better readability

Claude Response Pattern:
1. Understand the problem
2. Propose simple solution
3. Implement with clear code
4. Explain tradeoffs
`);

    // Copilot-specific extended rules
    this.extendedPrompts.set('copilot', `
## GitHub Copilot Optimization Rules

For better Copilot suggestions:
1. Write descriptive function names
2. Add clear comments before functions
3. Use consistent naming patterns
4. Start with test cases when possible

Example:
\`\`\`javascript
// Get user by email address from database
// Returns null if user not found
function getUserByEmail(email) {
  // Copilot will complete this better with clear intent
}
\`\`\`
`);
  }

  private loadExamples(): void {
    // React examples
    this.examples.set('react', `
## React-Specific Examples

HICKEY PRINCIPLE in React:
BAD: Component doing everything
\`\`\`jsx
function UserDashboard() {
  // Fetching, validation, display, state - all mixed
  const [user, setUser] = useState();
  useEffect(() => { /* fetch */ }, []);
  if (!user.email.includes('@')) { /* validation */ }
  return <div>...</div>;
}
\`\`\`

GOOD: Separated concerns
\`\`\`jsx
// Custom hook for data
function useUser(id) { /* fetching logic */ }

// Pure component for display
function UserDisplay({ user }) { /* only display */ }

// Composition
function UserDashboard() {
  const user = useUser(id);
  return <UserDisplay user={user} />;
}
\`\`\`
`);

    // Node.js examples
    this.examples.set('node', `
## Node.js-Specific Examples

LINUS PRINCIPLE in Node.js:
BAD: Overengineered API
\`\`\`javascript
class AbstractRepositoryFactory {
  createRepository(type) {
    return new RepositoryBuilder()
      .withType(type)
      .withCache()
      .withValidation()
      .build();
  }
}
\`\`\`

GOOD: Simple and direct
\`\`\`javascript
const users = require('./users.json');

function getUser(id) {
  return users.find(u => u.id === id);
}
\`\`\`
`);
  }

  public generate(config: PromptGeneratorConfig): GeneratedPrompt {
    const optimization = this.assembleAdaptivePrompt(config);
    
    return {
      systemPrompt: optimization.optimizedPrompt,
      instructions: "Apply ZeroCode principles to all code generation",
      examples: this.getExamplesList(),
      platform: config.platform
    };
  }
  
  private getExamplesList(): string[] {
    return [
      "Use simple functions over complex classes",
      "Solve real problems, not imaginary ones",
      "Provide working code with clear validation"
    ];
  }

  private assembleAdaptivePrompt(config: PromptGeneratorConfig): OptimizationResult {
    const platformLimit = this.platformOptimizer.getPlatformLimit(config.platform);
    let finalPrompt = this.corePrompt;
    let appliedOptimizations: string[] = ['core'];
    let estimatedTokens = this.estimateTokens(this.corePrompt);
    
    // Add extended rules if space available
    const extendedPrompt = this.extendedPrompts.get(config.platform) || 
                          this.extendedPrompts.get('cursor') || '';
    
    if (extendedPrompt && estimatedTokens + this.estimateTokens(extendedPrompt) < platformLimit * 0.7) {
      finalPrompt += '\n\n' + extendedPrompt;
      appliedOptimizations.push('extended');
      estimatedTokens += this.estimateTokens(extendedPrompt);
    }
    
    // Add examples if space available
    const projectType = this.detectProjectType();
    const examples = this.examples.get(projectType) || '';
    
    if (examples && estimatedTokens + this.estimateTokens(examples) < platformLimit * 0.9) {
      finalPrompt += '\n\n' + examples;
      appliedOptimizations.push('examples');
      estimatedTokens += this.estimateTokens(examples);
    }
    
    // Return optimization result with proper structure
    return {
      optimizedPrompt: finalPrompt,
      warnings: [],
      appliedOptimizations
    };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private detectProjectType(): string {
    // Simple project type detection based on package.json or file structure
    try {
      const packageJson = readFileSync(join(process.cwd(), 'package.json'), 'utf-8');
      if (packageJson.includes('react')) return 'react';
      if (packageJson.includes('vue')) return 'vue';
      if (packageJson.includes('angular')) return 'angular';
      if (packageJson.includes('express')) return 'node';
      if (packageJson.includes('fastify')) return 'node';
    } catch {
      // If no package.json, default to node
    }
    return 'node';
  }
}

// Keep backward compatibility
export const PromptGenerator = AdaptivePromptGenerator;

// Export a simple function for easier usage
export function generatePrompt(config: PromptGeneratorConfig): GeneratedPrompt {
  const generator = new AdaptivePromptGenerator();
  return generator.generate(config);
}