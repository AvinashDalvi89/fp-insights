export interface Concept {
  id: string;
  num: string;
  part: 'FOUNDATIONS' | 'DESIGN' | 'ABSTRACTIONS' | 'EFFECTS & IO';
  title: string;
  tagline: string;
  cardDesc: string;
  tags: string[];
  demoId?: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  passFeedback: string;
  failFeedback: string;
}

export interface GlossaryTerm {
  name: string;
  plain: string;
  example?: string;
}
