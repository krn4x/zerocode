#!/usr/bin/env node

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

console.log(`
${colors.green}✅ ZeroCode installed successfully!${colors.reset}

${colors.cyan}🚀 Quick Start:${colors.reset}
  1. Go to your project: ${colors.yellow}cd your-project${colors.reset}
  2. Run: ${colors.yellow}npx zerocode activate${colors.reset}
  3. Your AI is now 10x better!

${colors.cyan}💡 Need help?${colors.reset} Run: ${colors.yellow}npx zerocode --help${colors.reset}

${colors.cyan}🎯 What's next?${colors.reset} Your AI will now write simple, working code instead of overengineered garbage.
`);