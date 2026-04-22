import * as fs from 'fs';
import * as path from 'path';

export interface ChronoEvent {
  id: string;
  timestamp: number;
  type: 'terminal_command' | 'git_commit';
  payload: any;
  repoSource?: string; // To track where it came from
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
  private localEvents: ChronoEvent[] = [];
  private linkedEvents: ChronoEvent[] = [];
  private storePath: string | null;

  constructor(storePath?: string | null) {
    if (storePath === undefined) {
      const flashDir = path.join(process.cwd(), '.flash');
      this.storePath = path.join(flashDir, 'history.json');
    } else {
      this.storePath = storePath;
    }
    this.loadEvents();
  }

  private loadEvents() {
    this.localEvents = [];
    this.linkedEvents = [];
    
    // Load local events
    if (this.storePath && fs.existsSync(this.storePath)) {
      try {
        const data = fs.readFileSync(this.storePath, 'utf-8');
        this.localEvents = JSON.parse(data);
      } catch (e) {
        this.localEvents = [];
      }
    }

    // Load linked repo events
    const flashDir = this.storePath ? path.dirname(this.storePath) : null;
    if (flashDir) {
      const linksPath = path.join(flashDir, 'links.json');
      if (fs.existsSync(linksPath)) {
        try {
          const links: string[] = JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
          for (const link of links) {
            // Link is expected to be a relative path from current project root
            const linkedStorePath = path.resolve(flashDir, '..', link, '.flash', 'history.json');
            if (fs.existsSync(linkedStorePath)) {
              const data = fs.readFileSync(linkedStorePath, 'utf-8');
              let events: ChronoEvent[] = JSON.parse(data);
              // Tag them with the repo source
              events = events.map(e => ({ ...e, repoSource: link }));
              this.linkedEvents = this.linkedEvents.concat(events);
            }
          }
        } catch (e) {
          console.warn('Failed to load linked repositories:', e);
        }
      }
    }
  }

  private saveEvents() {
    if (!this.storePath) return;
    const flashDir = path.dirname(this.storePath);
    if (!fs.existsSync(flashDir)) {
      fs.mkdirSync(flashDir, { recursive: true });
    }
    fs.writeFileSync(this.storePath, JSON.stringify(this.localEvents, null, 2), 'utf-8');
  }

  logTerminalCommand(command: string, exitCode: number, output: string) {
    this.localEvents.push({
      id: Date.now().toString() + Math.random().toString(),
      timestamp: Date.now(),
      type: 'terminal_command',
      payload: { command, exitCode, output }
    });
    this.saveEvents();
  }

  logGitCommit(hash: string, message: string, filesChanged: string[]) {
    this.localEvents.push({
      id: hash,
      timestamp: Date.now(),
      type: 'git_commit',
      payload: { hash, message, filesChanged }
    });
    this.saveEvents();
  }

  getEvents(): ChronoEvent[] {
    const allEvents = this.localEvents.concat(this.linkedEvents);
    return allEvents.sort((a, b) => a.timestamp - b.timestamp);
  }

  getFailedCommands(): ChronoEvent[] {
    return this.getEvents().filter(e => e.type === 'terminal_command' && e.payload.exitCode !== 0);
  }

  // Correlates a failure to the nearest subsequent commit that might have fixed it (local or linked)
  correlateFixToFailure(failedCommandId: string): ChronoEvent | null {
    const allEvents = this.getEvents();
    const failure = allEvents.find(e => e.id === failedCommandId);
    if (!failure) return null;

    return allEvents.find(e => e.type === 'git_commit' && e.timestamp > failure.timestamp) || null;
  }

  // Correlates a failure to a preceding commit in a linked repo that likely caused it
  findProbableCause(failedCommandId: string): ChronoEvent | null {
    const allEvents = this.getEvents();
    const failure = allEvents.find(e => e.id === failedCommandId);
    if (!failure) return null;

    // Look backward for the most recent linked commit
    const reversedEvents = [...allEvents].reverse();
    return reversedEvents.find(e => e.type === 'git_commit' && e.repoSource && e.timestamp < failure.timestamp) || null;
  }
}