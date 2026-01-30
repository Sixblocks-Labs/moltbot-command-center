import path from 'path';
import os from 'os';

export const BRAIN_ROOT =
  process.env.BRAIN_ROOT || path.join(os.homedir(), 'clawdbot-brain');

export const BRAIN_FOLDERS = {
  journal: path.join(BRAIN_ROOT, 'journal'),
  notes: path.join(BRAIN_ROOT, 'notes'),
  ideas: path.join(BRAIN_ROOT, 'ideas'),
  research: path.join(BRAIN_ROOT, 'research'),
  tasks: path.join(BRAIN_ROOT, 'tasks'),
} as const;

export type BrainFolderKey = keyof typeof BRAIN_FOLDERS;

export const DOC_TAGS = [
  'Journal',
  'Ideas',
  'Notes',
  'Content',
  'Technical',
  'Research',
] as const;
export type DocTag = (typeof DOC_TAGS)[number];
