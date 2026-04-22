import { DependencyGraph } from './graph';

export interface FlashRules {
  boundaries: {
    from: string;    // e.g. "src/ui/*"
    disallow: string[]; // e.g. ["src/db/*"]
  }[];
}

export class RuleEngine {
  constructor(private graph: DependencyGraph, private rules: FlashRules) {}

  verify(): string[] {
    const violations: string[] = [];
    const edges = this.graph.getEdges().filter(e => e.type === 'imports');

    for (const rule of this.rules.boundaries) {
      const fromRegex = this.globToRegex(rule.from);
      const disallowRegexes = rule.disallow.map(d => this.globToRegex(d));

      for (const edge of edges) {
        if (fromRegex.test(edge.sourceId)) {
          for (const disallowRegex of disallowRegexes) {
            if (disallowRegex.test(edge.targetId)) {
              violations.push(`Architectural Violation: '${edge.sourceId}' is not allowed to import '${edge.targetId}'.`);
            }
          }
        }
      }
    }
    return violations;
  }

  private globToRegex(glob: string): RegExp {
    // Simple glob to regex conversion for the prototype (handles *)
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regexStr = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regexStr}`);
  }
}