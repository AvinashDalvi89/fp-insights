'use client';
import { Concept } from '@/lib/types';
import { ConceptContent } from '@/lib/conceptContent';
import Quiz from '@/components/ui/Quiz';
import ConceptNav from '@/components/ui/ConceptNav';
import SubstitutionDemo from '@/components/demos/SubstitutionDemo';
import RailwayDemo from '@/components/demos/RailwayDemo';
import PipelineDemo from '@/components/demos/PipelineDemo';
import StateStepperDemo from '@/components/demos/StateStepperDemo';
import PBTDemo from '@/components/demos/PBTDemo';
import MonoidDemo from '@/components/demos/MonoidDemo';
import MonadChainDemo from '@/components/demos/MonadChainDemo';
import ApplicativeDemo from '@/components/demos/ApplicativeDemo';

const DEMO_MAP: Record<string, React.ComponentType> = {
  substitution: SubstitutionDemo,
  railway: RailwayDemo,
  pipeline: PipelineDemo,
  state: StateStepperDemo,
  pbt: PBTDemo,
  monoid: MonoidDemo,
  chain: MonadChainDemo,
  applicative: ApplicativeDemo,
};

interface Props {
  concept: Concept;
  content: ConceptContent;
  prev: Concept | null;
  next: Concept | null;
}

export default function ConceptPageClient({ concept, content, prev, next }: Props) {
  const Demo = concept.demoId ? DEMO_MAP[concept.demoId] : null;

  return (
    <article>
      {/* Header */}
      <div className="concept-hdr">
        <div className="concept-num">CONCEPT {concept.num} · {concept.part}</div>
        <h1 className="concept-title">{concept.title}</h1>
        <p className="concept-tagline">{concept.tagline}</p>
        <div className="card-tags" style={{ marginTop: '8px' }}>
          {concept.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>

      {/* Plain English */}
      <div className="plain-box">
        <div className="plain-label">Plain English</div>
        <p className="plain-text">{content.plain}</p>
      </div>

      {/* Analogy */}
      <div className="analogy-box">
        <div className="analogy-label">Analogy</div>
        <p className="analogy-text">{content.analogy}</p>
      </div>

      {/* You already know this */}
      <div className="know-box">
        <div className="know-label">You already know this</div>
        <div className="know-items">
          {content.youKnowThis.map((item, i) => (
            <span key={i} className="know-item">{item}</span>
          ))}
        </div>
      </div>

      {/* Interactive demo */}
      {Demo && (
        <div className="section" style={{ marginTop: '2rem' }}>
          <div className="section-lbl">Interactive Demo</div>
          <Demo />
        </div>
      )}

      {/* Code example */}
      <div className="section" style={{ marginTop: '2rem' }}>
        <div className="section-lbl">Code Example</div>
        <div className="code-wrap">
          <div className="code-hdr">
            <span className="code-lang">{content.code.label}</span>
          </div>
          <div className="code-body">
            <pre>{content.code.snippet}</pre>
          </div>
        </div>
      </div>

      {/* Apply when */}
      <div className="apply-box" style={{ marginTop: '2rem' }}>
        <div className="apply-label">Apply when</div>
        {content.applyWhen.map((item, i) => (
          <div key={i} className="apply-item">
            <span className="apply-arrow">▸</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Quiz */}
      <div className="section" style={{ marginTop: '2rem' }}>
        <div className="section-lbl">Check Your Understanding</div>
        <Quiz
          question={content.quiz.question}
          options={content.quiz.options}
          correctIndex={content.quiz.correctIndex}
          passFeedback={content.quiz.passFeedback}
          failFeedback={content.quiz.failFeedback}
        />
      </div>

      {/* Navigation */}
      <ConceptNav conceptId={concept.id} prev={prev} next={next} />
    </article>
  );
}
