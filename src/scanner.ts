import * as fs from 'fs';
import * as path from 'path';
import { ProjectIndexer } from './indexer';

export class WorkspaceScanner {
  constructor(private indexer: ProjectIndexer) {}

  public scanDirectory(dirPath: string, allowedExtensions: string[] = ['.ts', '.js']) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip common ignored directories to avoid massive noise
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === '.flash') {
          continue;
        }
        this.scanDirectory(fullPath, allowedExtensions);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (allowedExtensions.includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          // Feed the live file content into our Deterministic Graph
          this.indexer.indexFile(fullPath, content);
        }
      }
    }
  }
}