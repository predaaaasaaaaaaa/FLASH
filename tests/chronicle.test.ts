import { ChronologicalEngine } from '../src/chronicle';

describe('ChronologicalEngine', () => {
  it('should log terminal commands and identify failures', () => {
    const engine = new ChronologicalEngine(null);
    
    engine.logTerminalCommand('npm start', 0, 'Server running');
    engine.logTerminalCommand('npm test', 1, 'Error: timeout');
    
    const events = engine.getEvents();
    expect(events).toHaveLength(2);
    
    const failures = engine.getFailedCommands();
    expect(failures).toHaveLength(1);
    expect(failures[0].payload.command).toBe('npm test');
  });

  it('should correlate a subsequent git commit to a previous terminal failure', async () => {
    const engine = new ChronologicalEngine(null);
    
    // Simulate terminal failure
    engine.logTerminalCommand('tsc --build', 1, 'TypeError: cannot find name');
    const failureEvent = engine.getFailedCommands()[0];
    
    // Simulate a bit of time passing
    await new Promise(resolve => setTimeout(resolve, 10));

    // Simulate developer committing a fix
    engine.logGitCommit('abc1234', 'fix(types): resolve missing interface', ['src/types.ts']);
    
    const fixEvent = engine.correlateFixToFailure(failureEvent.id);
    
    expect(fixEvent).not.toBeNull();
    expect(fixEvent?.payload.hash).toBe('abc1234');
    expect(fixEvent?.payload.message).toContain('fix');
  });
});