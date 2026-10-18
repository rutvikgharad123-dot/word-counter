import { KeywordDensity } from '../types';

const COMMON_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll',
  'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s',
  'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your',
  'yours', 'yourself', 'yourselves'
]);

/**
 * Counts syllables in an English word
 */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 1;
  if (w.length <= 3) return 1;
  
  const clean = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '')
                 .replace(/^y/, '');
  const matched = clean.match(/[aeiouy]{1,2}/g);
  return matched ? Math.max(1, matched.length) : 1;
}

export interface AnalysisResult {
  words: number;
  chars: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  avgWordLength: number;
  wordsPerSentence: number;
  sentencesPerParagraph: number;
  readingMinutes: number;
  speakingMinutes: number;
  fleschScore: number;
  gradeLevel: string;
  gradeNum: number;
  tone: string;
  lexicalDiversity: number;
  topKeywords: KeywordDensity[];
}

export function analyzeText(
  text: string,
  options: { readingWpm?: number; speakingWpm?: number; filterStopWords?: boolean } = {}
): AnalysisResult {
  const readingWpm = options.readingWpm || 200;
  const speakingWpm = options.speakingWpm || 130;
  const filterStop = options.filterStopWords !== false;

  const rawChars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  const trimmed = text.trim();
  const rawWordMatches = trimmed ? trimmed.match(/\b[\w'-]+\b/g) || [] : [];
  const words = rawWordMatches.length;

  // Paragraphs
  const paras = text.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphs = Math.max(paras.length, words > 0 ? 1 : 0);

  // Sentences
  const sentenceMatches = text ? text.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0) : [];
  const sentences = Math.max(sentenceMatches.length, words > 0 ? 1 : 0);

  // Syllables
  let totalSyllables = 0;
  let totalCharsInWords = 0;
  const wordFrequencyMap = new Map<string, number>();

  rawWordMatches.forEach(w => {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!lower) return;
    totalCharsInWords += lower.length;
    totalSyllables += countSyllables(lower);

    if (!filterStop || !COMMON_STOP_WORDS.has(lower)) {
      if (lower.length > 2) {
        wordFrequencyMap.set(lower, (wordFrequencyMap.get(lower) || 0) + 1);
      }
    }
  });

  const avgWordLength = words > 0 ? Number((totalCharsInWords / words).toFixed(1)) : 0;
  const wordsPerSentence = sentences > 0 ? Number((words / sentences).toFixed(1)) : 0;
  const sentencesPerParagraph = paragraphs > 0 ? Number((sentences / paragraphs).toFixed(1)) : 0;

  // Reading & Speaking Time
  const readingMinutes = words > 0 ? Math.max(1, Math.ceil(words / readingWpm)) : 0;
  const speakingMinutes = words > 0 ? Math.max(1, Math.ceil(words / speakingWpm)) : 0;

  // Flesch Reading Ease: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
  let flesch = 100;
  let gradeNum = 1;
  if (words > 0 && sentences > 0) {
    flesch = Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words));
    flesch = Math.max(0, Math.min(100, flesch));

    // Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    const rawGrade = 0.39 * (words / sentences) + 11.8 * (totalSyllables / words) - 15.59;
    gradeNum = Math.max(1, Math.min(18, Number(rawGrade.toFixed(1))));
  }

  const gradeLevel = `Gr. ${Math.round(gradeNum)}`;

  // Tone detection
  let tone = 'Professional / Academic';
  if (gradeNum >= 12) {
    tone = 'Professional / Academic';
  } else if (gradeNum >= 10) {
    tone = 'Formal / Executive';
  } else if (gradeNum >= 7) {
    tone = 'Conversational / Clear';
  } else {
    tone = 'Personal / Accessible';
  }

  // Lexical Diversity
  const uniqueWords = new Set(rawWordMatches.map(w => w.toLowerCase())).size;
  const lexicalDiversity = words > 0 ? Math.min(100, Math.round((uniqueWords / words) * 100)) : 0;

  // Top Keywords
  const sortedKeywords = Array.from(wordFrequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      density: words > 0 ? Number(((count / words) * 100).toFixed(1)) : 0
    }));

  return {
    words,
    chars: rawChars,
    charsNoSpaces,
    sentences,
    paragraphs,
    avgWordLength,
    wordsPerSentence,
    sentencesPerParagraph,
    readingMinutes,
    speakingMinutes,
    fleschScore: flesch,
    gradeLevel,
    gradeNum,
    tone,
    lexicalDiversity,
    topKeywords: sortedKeywords
  };
}

export function generateMarkdownReport(docTitle: string, analysis: AnalysisResult): string {
  return [
    `# CountLab Linguistic Audit: ${docTitle}`,
    `*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*`,
    '',
    '## Overview Metrics',
    `- **Total Words:** ${analysis.words.toLocaleString()}`,
    `- **Total Characters:** ${analysis.chars.toLocaleString()}`,
    `- **Characters (no spaces):** ${analysis.charsNoSpaces.toLocaleString()}`,
    `- **Sentences:** ${analysis.sentences} (~${analysis.wordsPerSentence} words/sentence)`,
    `- **Paragraphs:** ${analysis.paragraphs} (~${analysis.sentencesPerParagraph} sentences/paragraph)`,
    `- **Average Word Length:** ${analysis.avgWordLength} characters`,
    '',
    '## Pacing & Duration',
    `- **Silent Reading Time:** ${analysis.readingMinutes} min (@ 200 WPM)`,
    `- **Speaking Time:** ${analysis.speakingMinutes} min (@ 130 WPM)`,
    '',
    '## Style & Readability',
    `- **Flesch Reading Ease:** ${analysis.fleschScore} / 100`,
    `- **Readability Grade Level:** ${analysis.gradeLevel}`,
    `- **Detected Tone:** ${analysis.tone}`,
    `- **Lexical Diversity:** ${analysis.lexicalDiversity}%`,
    '',
    '## Top Keywords & Density',
    analysis.topKeywords.slice(0, 5).map((k, i) => `${i + 1}. **${k.word}**: ${k.count} occurrences (${k.density}%)`).join('\n')
  ].join('\n');
}

export function generateCSVReport(docTitle: string, analysis: AnalysisResult): string {
  const rows = [
    ['Metric', 'Value'],
    ['Document Title', `"${docTitle.replace(/"/g, '""')}"`],
    ['Total Words', analysis.words],
    ['Total Characters', analysis.chars],
    ['Characters (No Spaces)', analysis.charsNoSpaces],
    ['Sentences', analysis.sentences],
    ['Paragraphs', analysis.paragraphs],
    ['Average Word Length', analysis.avgWordLength],
    ['Words Per Sentence', analysis.wordsPerSentence],
    ['Reading Time (min)', analysis.readingMinutes],
    ['Speaking Time (min)', analysis.speakingMinutes],
    ['Flesch Reading Score', analysis.fleschScore],
    ['Grade Level', analysis.gradeLevel],
    ['Tone', `"${analysis.tone}"`],
    ['Lexical Diversity (%)', analysis.lexicalDiversity]
  ];

  rows.push(['--- Top Keywords ---', '---']);
  analysis.topKeywords.forEach(k => {
    rows.push([k.word, `${k.count} (${k.density}%)`]);
  });

  return rows.map(r => r.join(',')).join('\n');
}
