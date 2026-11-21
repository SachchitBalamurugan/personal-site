const QUESTION = 'why does the electron transport chain stop without oxygen?'
const ANSWER =
  'Oxygen is the last electron acceptor in the chain. Without it, electrons back up at complex IV, so the pumps stop moving protons and ATP synthase runs out of gradient to work with.'

/**
 * A sketch of FschoolAI: the student's own lecture slide on the left, the tutor answering
 * from it on the right. The answer types out as you scroll (`typed` goes 0 to 1).
 */
export default function FschoolMock({ typed }: { typed: number }) {
  const shown = ANSWER.slice(0, Math.round(ANSWER.length * typed))
  return (
    <div className="fs">
      <div className="fs-course">
        <div className="fs-crumbs">
          <span className="fs-chip">BIO 1A</span>
          Week 6 <span aria-hidden="true">›</span> Lecture 12: Cellular respiration.pdf
        </div>
        <div className="fs-slide" data-spot="0">
          <p className="fs-slide-kicker">Lecture 12 · slide 8 of 24</p>
          <h4>The electron transport chain</h4>
          <ul>
            <li>NADH and FADH₂ hand electrons to complexes I and II</li>
            <li>Complexes I, III and IV pump H⁺ into the intermembrane space</li>
            <li>
              <mark>O₂ accepts electrons at complex IV</mark> and becomes H₂O
            </li>
            <li>H⁺ flows back through ATP synthase → ATP</li>
          </ul>
          <div className="fs-chain" aria-hidden="true">
            <i>I</i>
            <i>II</i>
            <i>III</i>
            <i>IV</i>
            <b>O₂</b>
          </div>
        </div>
        <div className="fs-files">
          <span>Lecture 11 slides</span>
          <span>Ch. 9 reading</span>
          <span>Problem set 5</span>
        </div>
      </div>

      <div className="fs-tutor">
        <div className="fs-tutor-head">
          <span className="fs-logo">F</span>
          <div>
            <b>FschoolAI tutor</b>
            <span>Answers from your BIO 1A materials</span>
          </div>
        </div>
        <div className="fs-thread">
          <p className="fs-q">{QUESTION}</p>
          <div className="fs-a">
            <p>
              {shown}
              {typed < 1 && <span className="caret" aria-hidden="true" />}
            </p>
            <span className={typed >= 1 ? 'fs-cite is-on' : 'fs-cite'} data-spot="1">
              [1] Lecture 12, slide 8
            </span>
          </div>
        </div>
        <div className="fs-guarantee" data-spot="2">
          <span className="fs-shield" aria-hidden="true">
            ✓
          </span>
          <div>
            <b>Grade guarantee</b>
            <span>Study with it and still fail? Up to $2,000 back.</span>
          </div>
        </div>
        <div className="fs-input">
          Ask about your course…
          <span className="fs-mic" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  )
}
