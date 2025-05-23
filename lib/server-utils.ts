import fs from "fs/promises";
import path from "path";

export const POSTS_DIR = path.join(process.cwd(), 'data', 'blog');

export async function collectPostFiles(dir: string = POSTS_DIR): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectPostFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}
