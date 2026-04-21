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

  logTerminalCommand(command: string, exitCode: number, output: string) {
    this.events.push({
      id: Date.now().toString() + Math.random().toString(),
      timestamp: Date.now(),
      type: 'terminal_command',
      payload: { command, exitCode, output }
    });
  }

  logGitCommit(hash: string, message: string, filesChanged: string[]) {
    this.events.push({
      id: hash,
      timestamp: Date.now(),
      type: 'git_commit',
      payload: { hash, message, filesChanged }
    });
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