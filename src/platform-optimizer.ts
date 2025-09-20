import { PromptGeneratorConfig } from './types';

export interface PlatformLimits {
  maxCharacters?: number;
  maxLines?: number;
  preferredFormat: 'markdown' | 'plain' | 'structured';
  supportsEmojis: boolean;
  requiresSpecialFormatting?: string[];
}

export interface OptimizationResult {
  optimizedPrompt: string;
  warnings: string[];
  appliedOptimizations: string[];
}

export class PlatformOptimizer {
  private platformLimits: Map<string, PlatformLimits> = new Map();

  constructor() {
    this.initializePlatformLimits();
  }
  
  public getPlatformLimit(platform: string): number {
    const limits = this.platformLimits.get(platform);
    return limits?.maxCharacters || 10000; // Default to 10k tokens
  }

  /**
   * Initialize platform-specific limits and formatting rules
   */
  private initializePlatformLimits(): void {
    // Cursor IDE - optimized for code generation
    this.platformLimits.set('cursor', {
      maxCharacters: 15000, // Increased to allow full templates
      preferredFormat: 'markdown',
      supportsEmojis: true,
      requiresSpecialFormatting: ['code-blocks', 'bullet-points']
    });

    // Claude - optimized for detailed explanations
    this.platformLimits.set('claude', {
      maxCharacters: 20000, // Increased for detailed explanations
      preferredFormat: 'structured',
      supportsEmojis: true,
      requiresSpecialFormatting: ['headers', 'sections', 'examples']
    });

    // Ollama - optimized for local models with limited context
    this.platformLimits.set('ollama', {
      maxCharacters: 8000, // Increased but still conservative
      maxLines: 300,
      preferredFormat: 'plain',
      supportsEmojis: false,
      requiresSpecialFormatting: ['simple-structure']
    });

    // Universal - balanced approach
    this.platformLimits.set('universal', {
      maxCharacters: 12000, // Increased for better compatibility
      preferredFormat: 'markdown',
      supportsEmojis: true,
      requiresSpecialFormatting: ['clear-sections']
    });
  }

  /**
   * Optimize prompt for Cursor IDE
   */
  public optimizeForCursor(prompt: string, config: PromptGeneratorConfig): OptimizationResult {
    const limits = this.platformLimits.get('cursor')!;
    const warnings: string[] = [];
    const appliedOptimizations: string[] = [];

    let optimizedPrompt = prompt;

    // Add Cursor-specific code generation focus
    const cursorPrefix = `
## Cursor IDE Optimization

You are specifically optimized for code generation in Cursor IDE. Focus on:
- Providing complete, runnable code examples
- Using TypeScript when possible
- Including proper imports and exports
- Suggesting file structures and organization
- Optimizing for developer productivity

`;

    optimizedPrompt = this.insertAfterHeader(optimizedPrompt, cursorPrefix);
    appliedOptimizations.push('Added Cursor-specific code generation focus');

    // Enhance code-related sections
    optimizedPrompt = this.enhanceCodeSections(optimizedPrompt);
    appliedOptimizations.push('Enhanced code-related sections');

    // Check character limits
    if (optimizedPrompt.length > limits.maxCharacters!) {
      optimizedPrompt = this.truncatePrompt(optimizedPrompt, limits.maxCharacters!);
      warnings.push(`Prompt truncated to ${limits.maxCharacters} characters for Cursor compatibility`);
    }

    return {
      optimizedPrompt,
      warnings,
      appliedOptimizations
    };
  }

  /**
   * Optimize prompt for Claude
   */
  public optimizeForClaude(prompt: string, config: PromptGeneratorConfig): OptimizationResult {
    const limits = this.platformLimits.get('claude')!;
    const warnings: string[] = [];
    const appliedOptimizations: string[] = [];

    let optimizedPrompt = prompt;

    // Add Claude-specific structured thinking
    const claudePrefix = `
## Claude Optimization

You are optimized for Claude's structured reasoning capabilities. Emphasize:
- Detailed step-by-step explanations
- Multiple perspectives on complex problems
- Comprehensive analysis with pros/cons
- Clear reasoning chains
- Thorough documentation of thought processes

`;

    optimizedPrompt = this.insertAfterHeader(optimizedPrompt, claudePrefix);
    appliedOptimizations.push('Added Claude-specific structured thinking');

    // Enhance structured sections
    optimizedPrompt = this.enhanceStructuredSections(optimizedPrompt);
    appliedOptimizations.push('Enhanced structured sections');

    // Add more detailed examples for Claude
    optimizedPrompt = this.addDetailedExamples(optimizedPrompt);
    appliedOptimizations.push('Added detailed examples');

    // Check character limits (Claude has higher limits)
    if (optimizedPrompt.length > limits.maxCharacters!) {
      warnings.push(`Prompt is ${optimizedPrompt.length} characters (within Claude's ${limits.maxCharacters} limit)`);
    }

    return {
      optimizedPrompt,
      warnings,
      appliedOptimizations
    };
  }

  /**
   * Optimize prompt for Ollama (local models)
   */
  public optimizeForOllama(prompt: string, config: PromptGeneratorConfig): OptimizationResult {
    const limits = this.platformLimits.get('ollama')!;
    const warnings: string[] = [];
    const appliedOptimizations: string[] = [];

    let optimizedPrompt = prompt;

    // Add Ollama-specific local model optimization
    const ollamaPrefix = `
## Ollama Local Model Optimization

You are optimized for local model efficiency. Focus on:
- Concise, direct responses
- Essential information only
- Minimal context switching
- Clear, simple language
- Efficient token usage

`;

    optimizedPrompt = this.insertAfterHeader(optimizedPrompt, ollamaPrefix);
    appliedOptimizations.push('Added Ollama-specific local model optimization');

    // Remove emojis for better local model compatibility
    if (!limits.supportsEmojis) {
      optimizedPrompt = this.removeEmojis(optimizedPrompt);
      appliedOptimizations.push('Removed emojis for local model compatibility');
    }

    // Simplify structure for local models
    optimizedPrompt = this.simplifyStructure(optimizedPrompt);
    appliedOptimizations.push('Simplified structure for local models');

    // Aggressive truncation for local models
    if (optimizedPrompt.length > limits.maxCharacters!) {
      optimizedPrompt = this.truncatePrompt(optimizedPrompt, limits.maxCharacters!);
      warnings.push(`Prompt truncated to ${limits.maxCharacters} characters for Ollama compatibility`);
    }

    // Check line limits
    const lineCount = optimizedPrompt.split('\n').length;
    if (limits.maxLines && lineCount > limits.maxLines) {
      optimizedPrompt = this.truncateByLines(optimizedPrompt, limits.maxLines);
      warnings.push(`Prompt truncated to ${limits.maxLines} lines for Ollama compatibility`);
    }

    return {
      optimizedPrompt,
      warnings,
      appliedOptimizations
    };
  }

  /**
   * Detect platform automatically based on prompt characteristics
   */
  public detectPlatform(prompt: string, config: PromptGeneratorConfig): string {
    // If platform is explicitly set and not universal, use it
    if (config.platform !== 'universal') {
      return config.platform;
    }

    // Simple heuristics for platform detection
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('cursor') || promptLower.includes('vscode') || promptLower.includes('ide')) {
      return 'cursor';
    }
    
    if (promptLower.includes('claude') || promptLower.includes('anthropic')) {
      return 'claude';
    }
    
    if (promptLower.includes('ollama') || promptLower.includes('local') || promptLower.includes('llama')) {
      return 'ollama';
    }

    // Default to universal if no specific platform detected
    return 'universal';
  }

  /**
   * Apply platform-specific optimizations
   */
  public optimize(prompt: string, config: PromptGeneratorConfig): OptimizationResult {
    // Use the configured platform directly, don't auto-detect for universal
    switch (config.platform) {
      case 'cursor':
        return this.optimizeForCursor(prompt, config);
      case 'claude':
        return this.optimizeForClaude(prompt, config);
      case 'ollama':
        return this.optimizeForOllama(prompt, config);
      case 'universal':
      default:
        return this.optimizeForUniversal(prompt, config);
    }
  }

  /**
   * Universal optimization (balanced approach)
   */
  private optimizeForUniversal(prompt: string, config: PromptGeneratorConfig): OptimizationResult {
    const limits = this.platformLimits.get('universal')!;
    const warnings: string[] = [];
    const appliedOptimizations: string[] = [];

    let optimizedPrompt = prompt;

    // Add universal compatibility note
    const universalPrefix = `
## Universal Compatibility

This prompt is optimized for compatibility across multiple AI platforms:
- Works with Cursor, Claude, Ollama, and other AI tools
- Balanced approach between detail and conciseness
- Standard markdown formatting
- Clear structure for easy parsing

`;

    optimizedPrompt = this.insertAfterHeader(optimizedPrompt, universalPrefix);
    appliedOptimizations.push('Added universal compatibility optimization');

    // Check character limits
    if (optimizedPrompt.length > limits.maxCharacters!) {
      optimizedPrompt = this.truncatePrompt(optimizedPrompt, limits.maxCharacters!);
      warnings.push(`Prompt truncated to ${limits.maxCharacters} characters for universal compatibility`);
    }

    return {
      optimizedPrompt,
      warnings,
      appliedOptimizations
    };
  }

  /**
   * Helper method to insert content after the main header
   */
  private insertAfterHeader(prompt: string, content: string): string {
    const headerMatch = prompt.match(/^(# .*?\n\n.*?\n\n)/s);
    if (headerMatch) {
      return prompt.replace(headerMatch[0], headerMatch[0] + content);
    }
    return content + prompt;
  }

  /**
   * Enhance code-related sections for Cursor
   */
  private enhanceCodeSections(prompt: string): string {
    return prompt.replace(
      /## Implementation Guidelines/g,
      '## Code Implementation Guidelines\n\n**For Cursor IDE users:**\n- Always provide complete, runnable code\n- Include proper TypeScript types\n- Suggest file organization\n- Consider IDE integration\n\n## Implementation Guidelines'
    );
  }

  /**
   * Enhance structured sections for Claude
   */
  private enhanceStructuredSections(prompt: string): string {
    // Look for the 🎯 OBJECTIVE pattern and enhance it
    let enhanced = prompt.replace(
      /🎯 OBJECTIVE:/g,
      '🎯 OBJECTIVE:\n*Claude users: Provide comprehensive analysis with multiple perspectives*\n'
    );
    
    // If that didn't work, try other patterns
    if (enhanced === prompt) {
      enhanced = prompt.replace(
        /### 🎯 OBJECTIVE/g,
        '### 🎯 OBJECTIVE\n*Claude users: Provide comprehensive analysis with multiple perspectives*'
      );
    }
    
    return enhanced;
  }

  /**
   * Add detailed examples for Claude
   */
  private addDetailedExamples(prompt: string): string {
    const exampleSection = `

## Detailed Examples for Claude

### Example 1: Code Review Request
**Request:** "Review this React component"
**Response Structure:**
🎯 **OBJECTIVE:** Analyze component for Hickey/Linus/Zeus principles
🔧 **IMPLEMENTATION:** Specific improvements with code examples
⚠️ **CONSIDERATIONS:** Potential issues and trade-offs
📈 **VALIDATION:** Testing strategies and success metrics

### Example 2: Architecture Decision
**Request:** "Should I use Redux or Context API?"
**Response Structure:**
🎯 **OBJECTIVE:** Choose state management based on real needs (Linus)
🔧 **IMPLEMENTATION:** Simple solution first (Hickey), structured comparison (Zeus)
⚠️ **CONSIDERATIONS:** Complexity trade-offs and team familiarity
📈 **VALIDATION:** Measurable criteria for success
`;

    return prompt + exampleSection;
  }

  /**
   * Remove emojis for platforms that don't support them well
   */
  private removeEmojis(prompt: string): string {
    return prompt
      .replace(/🎯/g, '[OBJECTIVE]')
      .replace(/🔧/g, '[IMPLEMENTATION]')
      .replace(/⚠️/g, '[CONSIDERATIONS]')
      .replace(/📈/g, '[VALIDATION]')
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }

  /**
   * Simplify structure for local models
   */
  private simplifyStructure(prompt: string): string {
    return prompt
      .replace(/### /g, '## ')  // Reduce heading levels
      .replace(/#### /g, '### ')
      .replace(/\*\*([^*]+)\*\*/g, '$1:')  // Simplify bold formatting
      .replace(/- \[ \]/g, '-');  // Simplify checkboxes
  }

  /**
   * Truncate prompt to character limit while preserving important sections
   */
  private truncatePrompt(prompt: string, maxChars: number): string {
    if (prompt.length <= maxChars) {
      return prompt;
    }

    const truncationMessage = '\n\n[Truncated for platform compatibility]';
    
    // Try to preserve the footer (Usage Instructions section)
    const footerMatch = prompt.match(/\n\n## Usage Instructions[\s\S]*$/);
    const footerLength = footerMatch ? footerMatch[0].length : 0;
    
    // Reserve space for footer and truncation message
    const availableChars = maxChars - truncationMessage.length - footerLength;
    
    if (availableChars < prompt.length * 0.3) {
      // If we can't preserve a reasonable amount of content, just truncate normally
      const simpleAvailable = maxChars - truncationMessage.length;
      const truncated = prompt.substring(0, simpleAvailable);
      const lastParagraph = truncated.lastIndexOf('\n\n');
      
      if (lastParagraph > simpleAvailable * 0.8) {
        return truncated.substring(0, lastParagraph) + truncationMessage;
      } else {
        return truncated + truncationMessage;
      }
    }

    // Truncate the middle content but preserve header and footer
    const headerMatch = prompt.match(/^(# .*?\n\n.*?\n\n## Core Principles[\s\S]*?\n\n)/);
    const headerLength = headerMatch ? headerMatch[0].length : 0;
    
    const mainContentStart = headerLength;
    const mainContentEnd = prompt.length - footerLength;
    const mainContentAvailable = availableChars - headerLength;
    
    if (mainContentAvailable > 0) {
      const header = prompt.substring(0, headerLength);
      const mainContent = prompt.substring(mainContentStart, mainContentStart + mainContentAvailable);
      const footer = footerMatch ? footerMatch[0] : '';
      
      // Find a good break point in the main content
      const lastParagraph = mainContent.lastIndexOf('\n\n');
      const finalMainContent = lastParagraph > mainContentAvailable * 0.8 
        ? mainContent.substring(0, lastParagraph)
        : mainContent;
      
      return header + finalMainContent + truncationMessage + footer;
    } else {
      // Fallback to simple truncation
      const truncated = prompt.substring(0, maxChars - truncationMessage.length);
      return truncated + truncationMessage;
    }
  }

  /**
   * Truncate prompt to line limit
   */
  private truncateByLines(prompt: string, maxLines: number): string {
    const lines = prompt.split('\n');
    if (lines.length <= maxLines) {
      return prompt;
    }

    const truncationLines = ['', '[Truncated for platform compatibility]'];
    const availableLines = maxLines - truncationLines.length;
    
    return lines.slice(0, availableLines).join('\n') + '\n' + truncationLines.join('\n');
  }

  /**
   * Get platform limits for a specific platform
   */
  public getPlatformLimits(platform: string): PlatformLimits | undefined {
    return this.platformLimits.get(platform);
  }

  /**
   * Get all supported platforms
   */
  public getSupportedPlatforms(): string[] {
    return Array.from(this.platformLimits.keys());
  }
}