export const BRAIN_FOLDERS = {
  journal: 'journal',
  notes: 'notes',
  ideas: 'ideas',
  research: 'research',
  tasks: 'tasks',
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
