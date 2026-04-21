import * as fs from 'fs';
import * as path from 'path';

export interface ChronoEvent {
  id: string;
  timestamp: number;
  type: 'terminal_command' | 'git_commit';
  payload: any;
}

export interface TerminalEventPayload {
  command: string;
  exitCode: number;
  output: string;
}

export interface GitCommitPayload {
  hash: string;
  message: string;
  filesChanged: string[];
}

export class ChronologicalEngine {
  private events: ChronoEvent[] = [];
  private storePath: string;

  constructor() {
    const flashDir = path.join(process.cwd(), '.flash');
    this.storePath = path.join(flashDir, 'history.json');
    this.loadEvents();
  }

  private loadEvents() {
    if (fs.existsSync(this.storePath)) {
      try {
        const data = fs.readFileSync(this.storePath, 'utf-8');
        this.events = JSON.parse(data);
      } catch (e) {
        this.events = [];
      }
    }
  }

  private saveEvents() {
    const flashDir = path.dirname(this.storePath);
    if (!fs.existsSync(flashDir)) {
      fs.mkdirSync(flashDir, { recursive: true });
    }
    fs.writeFileSync(this.storePath, JSON.stringify(this.events, null, 2), 'utf-8');
  }

  logTerminalCommand(command: string, exitCode: number, output: string) {
    this.events.push({
      id: Date.now().toString() + Math.random().toString(),
      timestamp: Date.now(),
      type: 'terminal_command',
      payload: { command, exitCode, output }
    });
    this.saveEvents();
  }

  logGitCommit(hash: string, message: string, filesChanged: string[]) {
    this.events.push({
      id: hash,
      timestamp: Date.now(),
      type: 'git_commit',
      payload: { hash, message, filesChanged }
    });
    this.saveEvents();
  }

  getEvents(): ChronoEvent[] {
    // Return events sorted chronologically
    return this.events.sort((a, b) => a.timestamp - b.timestamp);
  }

  getFailedCommands(): ChronoEvent[] {
    return this.events.filter(e => e.type === 'terminal_command' && e.payload.exitCode !== 0);
  }

  // Correlates a failure to the nearest subsequent commit that might have fixed it
  correlateFixToFailure(failedCommandId: string): ChronoEvent | null {
    const failure = this.events.find(e => e.id === failedCommandId);
    if (!failure) return null;

    // Find the first git commit that happened AFTER this failure
    return this.events.find(e => e.type === 'git_commit' && e.timestamp > failure.timestamp) || null;
  }
}