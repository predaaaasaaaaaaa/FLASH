import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface FlashConfig {
  provider: 'gemini' | 'openai';
  apiKey: string;
}

export class ConfigManager {
  private configPath = path.join(os.homedir(), '.flash_config.json');

  getConfig(): FlashConfig | null {
    if (fs.existsSync(this.configPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  saveConfig(config: FlashConfig) {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }
}