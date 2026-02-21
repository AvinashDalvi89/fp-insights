'use client';
import { useState } from 'react';

interface Props {
  question: string;
  options: string[];
  correctIndex: number;
  passFeedback: string;
  failFeedback: string;
}

export default function Quiz({ question, options, correctIndex, passFeedback, failFeedback }: Props) {
  const [answered, setAnswered] = useState<number | null>(null);

  const handleAnswer = (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
  };

  const correct = answered === correctIndex;

  return (
    <div className="quiz">
      <div className="quiz-q">{question}</div>
      <div className="quiz-opts">
        {options.map((opt, i) => {
          let cls = 'quiz-opt';
          if (answered !== null) {
            if (i === correctIndex) cls += ' correct';
            else if (i === answered) cls += ' wrong';
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered !== null}>
              {opt}
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <div className={`quiz-fb ${correct ? 'pass' : 'fail'}`}>
          {correct ? '✓ ' : '✗ '}{correct ? passFeedback : failFeedback}
        </div>
      )}
    </div>
  );
}
