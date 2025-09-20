#!/usr/bin/env node

import { Command } from "./simple-commander";
import { generatePrompt } from "./generator";
import * as fs from "fs";
import * as path from "path";

const program = new Command();

program
  .name("zerocode")
  .description("ZeroCode - AI development framework")
  .version("1.0.1");

// Generate command
program
  .command("generate")
  .description("Generate AI prompt")
  .option("-p, --platform <platform>", "AI platform", "universal")
  .option("-c, --complexity <level>", "Complexity level", "basic")
  .option("-l, --language <lang>", "Language", "english")
  .option("-o, --output <file>", "Save to file")
  .action((options: any) => {
    const config = {
      platform: options.platform,
      complexity: options.complexity,
      language: options.language,
      customRules: [],
    };

    const result = generatePrompt(config);

    if (options.output) {
      fs.writeFileSync(options.output, result.systemPrompt);
      console.log(`✅ Saved to: ${options.output}`);
    } else {
      console.log(result.systemPrompt);
    }
  });

// Demo command - show the difference ZeroCode makes
program
  .command("demo")
  .description("👀 See the difference ZeroCode makes")
  .action(() => {
    console.log(`
${'\x1b[31m'}❌ WITHOUT ZeroCode, AI gives you:${'\x1b[0m'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class AbstractFactoryManagerSingletonProxy {
  constructor(injector, validator, cache) {
    this.dependencyInjector = injector;
    this.validationStrategy = validator;
    this.cacheManager = cache;
  }
  
  async createUserWithValidationAndCaching(data) {
    // 200 lines of overengineered garbage...
    const validator = this.validationStrategy.getValidator('user');
    const cache = this.cacheManager.getInstance();
    // ... more complexity nobody understands
  }
}

${'\x1b[32m'}✅ WITH ZeroCode, AI gives you:${'\x1b[0m'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getUser(id) {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}

function createUser(email, name) {
  if (!email) throw new Error('Email required');
  return db.query(
    'INSERT INTO users (email, name) VALUES (?, ?)', 
    [email, name]
  );
}

${'\x1b[36m'}💡 See the difference?${'\x1b[0m'}
• Simple functions that do ONE thing
• Code you can understand in 5 seconds
• No unnecessary abstractions
• Actually works!

${'\x1b[33m'}Ready to fix your AI?${'\x1b[0m'} Run: ${'\x1b[32m'}zerocode activate${'\x1b[0m'}
`);
  });

// Activate command
program
  .command("activate")
  .description("🚀 Activate ZeroCode for this project")
  .action(() => {
    const currentDir = process.cwd();
    const projectName = path.basename(currentDir);

    console.log(`🚀 Activating ZeroCode for: ${projectName}`);

    // Create .zerocode directory
    const zerocodeDir = path.join(currentDir, ".zerocode");
    if (!fs.existsSync(zerocodeDir)) {
      fs.mkdirSync(zerocodeDir, { recursive: true });
    }

    // Generate universal prompt
    const config = {
      platform: "universal" as const,
      complexity: "basic" as const,
      language: "english" as const,
      customRules: [],
    };
    const prompt = generatePrompt(config);

    // Save prompt
    const promptPath = path.join(zerocodeDir, "universal-prompt.md");
    fs.writeFileSync(promptPath, prompt.systemPrompt);

    // Create config
    const configPath = path.join(zerocodeDir, "config.json");
    const configData = {
      version: "1.0.1",
      project: projectName,
      initialized: new Date().toISOString(),
      principles: ["hickey", "linus", "zeus"],
    };
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

    console.log("✅ ZeroCode activated!");
    console.log("📁 Created .zerocode directory");
    console.log("🎯 Hickey/Linus/Zeus principles active");
    console.log(
      "\n💡 Next: Copy .zerocode/universal-prompt.md to your AI tool"
    );
  });

// Project analysis command
program
  .command("zinit")
  .description("🔍 Analyze project")
  .action(() => {
    const currentDir = process.cwd();
    const projectName = path.basename(currentDir);

    console.log(`🔍 Analyzing project: ${projectName}`);

    // Simple project analysis
    const technologies = [];
    if (fs.existsSync("package.json"))
      technologies.push("JavaScript/TypeScript");
    if (fs.existsSync("requirements.txt")) technologies.push("Python");
    if (fs.existsSync("Cargo.toml")) technologies.push("Rust");
    if (fs.existsSync("go.mod")) technologies.push("Go");

    console.log(
      `📊 Technologies: ${technologies.join(", ") || "None detected"}`
    );

    // Generate project-specific prompt
    const config = {
      platform: "universal" as const,
      complexity: "basic" as const,
      language: "english" as const,
      customRules: [
        `Project: ${projectName}`,
        `Technologies: ${technologies.join(", ")}`,
      ],
    };

    const prompt = generatePrompt(config);

    // Save Zeus orchestrator
    const zerocodeDir = path.join(currentDir, ".zerocode");
    if (!fs.existsSync(zerocodeDir)) {
      fs.mkdirSync(zerocodeDir, { recursive: true });
    }

    const zeusPath = path.join(zerocodeDir, "zeus-orchestrator.md");
    fs.writeFileSync(zeusPath, prompt.systemPrompt);

    console.log("✅ Project analyzed!");
    console.log("📁 Created zeus-orchestrator.md");
    console.log("🎯 Zeus will orchestrate based on your project");
  });

program.parse();
