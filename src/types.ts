// Core type definitions for the AI prompt generator

export interface PromptGeneratorConfig {
  platform: 'cursor' | 'claude' | 'ollama' | 'universal';
  complexity: 'basic' | 'advanced' | 'expert';
  language: 'english' | 'hungarian';
  customRules?: string[];
}

export interface GeneratedPrompt {
  systemPrompt: string;
  instructions: string;
  examples: string[];
  platform: string;
}

export interface TemplateSection {
  readonly name: string;
  readonly content: string;
  readonly weight: number;
  readonly required: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}