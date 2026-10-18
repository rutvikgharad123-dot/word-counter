import { DocumentItem } from '../types';
import { analyzeText } from '../utils/analysis';

const draftReportContent = `Recent developments in autonomous machine learning pipelines reveal significant divergence when evaluating multi-modal neural network convergence. In this analysis, we examine deep structural variance across generative transformer tokens, prioritizing latency reduction and attention fidelity.

Our comparative neural benchmark indicates a sustained 23% reduction in perplexity across high-density conversational corpora. Quantitative analysis also underscores structural stability when multi-agent feedback is integrated during initial weight initialization. The underlying system relies heavily on continuous learning and model quantization to maintain performance benchmarks.

Furthermore, machine learning practitioners have consistently observed that modern system architecture demands resilient data ingestion pipelines. When data streaming fails or degrades, downstream model inferences exhibit catastrophic loss of precision. In our experimental trial, empirical data demonstrates that data augmentation coupled with adaptive neural tuning preserves accuracy even under noisy input conditions.

Each iterative cycle of system learning reinforces the internal representations of latent variables. By benchmarking learning dynamics against conventional baseline metrics, our analysis proves that data normalization procedures significantly stabilize model convergence. The overarching system framework provides systematic guarantees for enterprise-grade model deployments.

In summary, the interplay between data processing pipelines, neural model architectures, and distributed system orchestrations determines overall latency and fidelity. Our quantitative analysis serves as a comprehensive roadmap for engineering robust machine learning pipelines in mission-critical applications.`;

const thesisIntroContent = `Recent developments in autonomous machine learning pipelines reveal significant divergence when evaluating multi-modal neural network convergence. In this analysis, we examine deep structural variance across generative transformer tokens, prioritizing latency reduction and attention fidelity.

Our comparative neural benchmark indicates a sustained 23% reduction in perplexity across high-density conversational corpora. Quantitative analysis also underscores structural stability when multi-agent feedback is integrated during initial weight initialization.

Furthermore, dynamic parameter optimization and model quantization achieve unprecedented runtime efficiency without compromising semantic coherence across disparate evaluation domains. The neural learning rate scheduler stabilizes gradient flow across deep transformer layers, ensuring that both training stability and inference throughput remain within acceptable bounds.`;

function createDoc(
  id: string,
  title: string,
  category: DocumentItem['category'],
  content: string,
  fileSizeStr: string,
  updatedAtLabel: string,
  overrides?: Partial<DocumentItem>
): DocumentItem {
  const analysis = analyzeText(content);
  return {
    id,
    title,
    category,
    content,
    words: overrides?.words ?? analysis.words,
    chars: overrides?.chars ?? analysis.chars,
    charsNoSpaces: overrides?.charsNoSpaces ?? analysis.charsNoSpaces,
    sentences: overrides?.sentences ?? analysis.sentences,
    paragraphs: overrides?.paragraphs ?? analysis.paragraphs,
    avgWordLength: overrides?.avgWordLength ?? analysis.avgWordLength,
    readingMinutes: overrides?.readingMinutes ?? analysis.readingMinutes,
    speakingMinutes: overrides?.speakingMinutes ?? analysis.speakingMinutes,
    gradeLevel: overrides?.gradeLevel ?? analysis.gradeLevel,
    fleschScore: overrides?.fleschScore ?? analysis.fleschScore,
    tone: overrides?.tone ?? analysis.tone,
    lexicalDiversity: overrides?.lexicalDiversity ?? analysis.lexicalDiversity,
    fileSizeStr,
    updatedAtLabel,
    timestamp: Date.now() - Math.floor(Math.random() * 86400000 * 3),
    topKeywords: overrides?.topKeywords ?? analysis.topKeywords
  };
}

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  createDoc(
    'doc-1',
    'thesis_intro_draft.docx',
    'docx',
    thesisIntroContent,
    '24 KB',
    'Active',
    {
      words: 1428,
      chars: 8942,
      charsNoSpaces: 7314,
      sentences: 8,
      paragraphs: 3,
      readingMinutes: 7,
      speakingMinutes: 11,
      topKeywords: [
        { word: 'analysis', count: 14, density: 2.8 },
        { word: 'machine', count: 9, density: 1.9 },
        { word: 'neural', count: 8, density: 1.6 },
        { word: 'network', count: 6, density: 1.2 }
      ]
    }
  ),
  createDoc(
    'doc-2',
    'Draft_Report_Q3.md',
    'draft',
    draftReportContent,
    '14 KB',
    'Updated 14 mins ago',
    {
      words: 1428,
      chars: 8942,
      charsNoSpaces: 7514,
      sentences: 78,
      paragraphs: 12,
      avgWordLength: 5.2,
      readingMinutes: 7,
      speakingMinutes: 11,
      fleschScore: 68,
      gradeLevel: 'Gr. 10',
      tone: 'Professional / Academic',
      lexicalDiversity: 64,
      topKeywords: [
        { word: 'analysis', count: 42, density: 2.9 },
        { word: 'system', count: 35, density: 2.4 },
        { word: 'learning', count: 29, density: 2.0 },
        { word: 'data', count: 26, density: 1.8 },
        { word: 'model', count: 22, density: 1.5 }
      ]
    }
  ),
  createDoc(
    'doc-3',
    'AI Ethics Research Paper',
    'docx',
    'This paper examines the ethical governance mechanisms surrounding algorithmic fairness, accountability, and transparency in artificial intelligence systems. Contemporary machine learning systems continue to proliferate across sensitive sectors including criminal justice, credit scoring, healthcare diagnostics, and hiring automation. We conduct a rigorous quantitative audit of institutional fairness metrics and propose a verifiable governance pipeline designed for high-stakes algorithmic accountability.',
    '42 KB',
    'Updated 2h ago',
    {
      words: 3420,
      chars: 21800,
      charsNoSpaces: 18400,
      readingMinutes: 17,
      speakingMinutes: 26,
      gradeLevel: 'Grade 12.4',
      tone: 'Scholarly',
      sentences: 194,
      paragraphs: 28
    }
  ),
  createDoc(
    'doc-4',
    'Product Launch Press Release',
    'txt',
    'FOR IMMEDIATE RELEASE. CountLab announces the public rollout of its next-generation precision linguistic audit suite. Built for authors, digital creators, journalists, and academics, CountLab combines instant local word frequency counting with deep readability analytics, pacing estimates, and multi-format document extraction.',
    '6 KB',
    'Updated Yesterday',
    {
      words: 840,
      chars: 5420,
      charsNoSpaces: 4580,
      readingMinutes: 4,
      speakingMinutes: 6,
      gradeLevel: 'Grade 9.1',
      tone: 'Conversational',
      sentences: 54,
      paragraphs: 8
    }
  ),
  createDoc(
    'doc-5',
    'Q1 Strategic Memo',
    'pdf',
    'To all department leads: During Q1, our core focus remains operational resilience, customer retention, and infrastructural efficiency. Cross-functional initiatives must align directly with key performance indicators established during the annual planning cycle.',
    '1.2 MB',
    'Updated Mar 22',
    {
      words: 1950,
      chars: 12300,
      charsNoSpaces: 10400,
      readingMinutes: 10,
      speakingMinutes: 14,
      gradeLevel: 'Grade 14.1',
      tone: 'Executive',
      sentences: 112,
      paragraphs: 16
    }
  ),
  createDoc(
    'doc-6',
    'Morning Journal Thoughts',
    'draft',
    'Woke up early this morning to clear my thoughts before the week starts. Walking through the neighborhood as the sun came up reminded me why deliberate pacing is so essential in creative work. Sometimes the best way to write clearly is to step away from the keyboard and let subconscious thoughts settle.',
    '3 KB',
    'Updated Mar 20',
    {
      words: 450,
      chars: 2890,
      charsNoSpaces: 2440,
      readingMinutes: 2,
      speakingMinutes: 3,
      gradeLevel: 'Grade 6.2',
      tone: 'Personal',
      sentences: 32,
      paragraphs: 5
    }
  ),
  createDoc(
    'doc-7',
    'quarterly_report_v2.docx',
    'docx',
    'Executive overview of Q2 financial performance and departmental milestones. Net revenue increased 18% quarter-over-quarter driven by product adoption and customer retention.',
    '18 KB',
    'Today 10:45 AM',
    {
      words: 4230,
      chars: 27100,
      charsNoSpaces: 22800,
      readingMinutes: 21,
      speakingMinutes: 32
    }
  ),
  createDoc(
    'doc-8',
    'literature_review.pdf',
    'pdf',
    'A comprehensive survey of cognitive psychology literature regarding typographic legibility, reading comprehension speed, and digital reader fatigue in prolonged editing environments.',
    '1.2 MB',
    'Yesterday',
    {
      words: 12840,
      chars: 82000,
      charsNoSpaces: 69200,
      readingMinutes: 64,
      speakingMinutes: 98
    }
  ),
  createDoc(
    'doc-9',
    'notes_meeting.txt',
    'txt',
    'Action items from sprint planning sync: 1. Deploy client-side text extractor. 2. Finalize Flesch readability formula metrics. 3. Test camera OCR module with document photos.',
    '4 KB',
    'Mar 24',
    {
      words: 620,
      chars: 3950,
      charsNoSpaces: 3330,
      readingMinutes: 3,
      speakingMinutes: 5
    }
  )
];
