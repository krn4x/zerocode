// Simple commander implementation to avoid external dependencies

interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: any;
}

interface CommandAction {
  (options: any): void;
}

export class Command {
  private _name: string = '';
  private _description: string = '';
  private _version: string = '';
  private commands: Map<string, Command> = new Map();
  private options: CommandOption[] = [];
  private _action?: CommandAction;

  name(name: string): Command {
    this._name = name;
    return this;
  }

  description(desc: string): Command {
    this._description = desc;
    return this;
  }

  version(ver: string): Command {
    this._version = ver;
    return this;
  }

  command(name: string): Command {
    const cmd = new Command();
    cmd._name = name;
    this.commands.set(name, cmd);
    return cmd;
  }

  option(flags: string, description: string, defaultValue?: any): Command {
    this.options.push({ flags, description, defaultValue });
    return this;
  }

  action(fn: CommandAction): Command {
    this._action = fn;
    return this;
  }

  parse(argv?: string[]): void {
    const args = argv || process.argv.slice(2);
    
    // Handle global help and version
    if (args.length === 0) {
      this.showHelp();
      return;
    }

    if ((args.includes('-h') || args.includes('--help')) && args.length === 1) {
      this.showHelp();
      return;
    }

    if (args.includes('-v') || args.includes('--version')) {
      console.log(this._version);
      return;
    }

    const commandName = args[0];
    const command = this.commands.get(commandName);

    if (command) {
      // Check for command-specific help
      if (args.slice(1).includes('-h') || args.slice(1).includes('--help')) {
        this.showCommandHelp(command);
        return;
      }

      const options: any = {};
      
      // Parse options
      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('-')) {
          // Skip help flags as they're handled above
          if (arg === '-h' || arg === '--help') {
            continue;
          }

          const option = this.findOption(command, arg);
          if (option) {
            const key = this.getOptionKey(option.flags);
            const nextArg = args[i + 1];
            
            // Check if this is a boolean flag (no value expected)
            if (!option.flags.includes('<') && !option.flags.includes('[')) {
              options[key] = true;
            } else if (nextArg && !nextArg.startsWith('-')) {
              // Handle array options (like --rules)
              if (option.flags.includes('...')) {
                if (!options[key]) options[key] = [];
                options[key].push(nextArg);
                
                // Continue collecting values until we hit a flag or end of args
                let j = i + 2;
                while (j < args.length && !args[j].startsWith('-')) {
                  options[key].push(args[j]);
                  j++;
                }
                i = j - 1; // Set i to the last consumed argument
              } else {
                options[key] = nextArg;
                i++; // Skip next arg as it's the value
              }
            } else {
              // Use default value if available
              if (option.defaultValue !== undefined) {
                options[key] = option.defaultValue;
              }
            }
          } else {
            console.log(`Unknown option: ${arg}`);
            this.showCommandHelp(command);
            return;
          }
        }
      }

      // Set default values for options not provided
      command.options.forEach(opt => {
        const key = this.getOptionKey(opt.flags);
        if (!(key in options) && opt.defaultValue !== undefined) {
          options[key] = opt.defaultValue;
        }
      });

      if (command._action) {
        command._action(options);
      }
    } else {
      console.log(`❌ Unknown command: ${commandName}`);
      console.log('Run "ai-prompt --help" for available commands.\n');
    }
  }

  private findOption(command: Command, flag: string): CommandOption | undefined {
    return command.options.find(opt => {
      const flags = opt.flags.split(',').map(f => f.trim());
      return flags.some(f => {
        if (flag.startsWith('--')) {
          // Match long flags like --platform
          return f.startsWith(flag);
        } else if (flag.startsWith('-')) {
          // Match short flags like -p
          return f.startsWith(flag);
        }
        return false;
      });
    });
  }

  private getOptionKey(flags: string): string {
    const longFlag = flags.split(',').find(f => f.includes('--'));
    if (longFlag) {
      return longFlag.trim().replace(/--(\w+).*/, '$1');
    }
    const shortFlag = flags.split(',').find(f => f.includes('-') && !f.includes('--'));
    if (shortFlag) {
      return shortFlag.trim().replace(/-(\w).*/, '$1');
    }
    return flags.trim();
  }

  private showHelp(): void {
    console.log(`${this._name} - ${this._description}`);
    console.log(`Version: ${this._version}\n`);
    
    console.log('Usage:');
    console.log(`  ${this._name} <command> [options]\n`);
    
    if (this.commands.size > 0) {
      console.log('Commands:');
      this.commands.forEach((cmd, name) => {
        console.log(`  ${name.padEnd(12)} ${cmd._description}`);
      });
      console.log('');
    }

    console.log('Global Options:');
    console.log('  -h, --help     Show help information');
    console.log('  -v, --version  Show version number\n');

    console.log('Examples:');
    console.log(`  ${this._name} generate                    # Generate with defaults`);
    console.log(`  ${this._name} generate -p cursor          # Generate for Cursor`);
    console.log(`  ${this._name} generate -i                 # Interactive mode`);
    console.log(`  ${this._name} examples                    # Show more examples\n`);

    console.log('For more information on a command:');
    console.log(`  ${this._name} <command> --help`);
  }

  private showCommandHelp(command: Command): void {
    console.log(`${this._name} ${command._name} - ${command._description}\n`);
    
    console.log('Usage:');
    console.log(`  ${this._name} ${command._name} [options]\n`);
    
    if (command.options.length > 0) {
      console.log('Options:');
      command.options.forEach(opt => {
        const flags = opt.flags.padEnd(25);
        const desc = opt.description;
        const defaultVal = opt.defaultValue ? ` (default: ${opt.defaultValue})` : '';
        console.log(`  ${flags} ${desc}${defaultVal}`);
      });
    }
  }
}