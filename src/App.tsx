import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowRight, BadgeCheck, BarChart3, BookOpenCheck, Bot, Building2, Check,
  CheckCircle2, ChevronDown, CircleAlert, ClipboardCheck, Clock3, Database, FileCheck2,
  FileText, Filter, Fingerprint, GitCompareArrows, Layers3, LockKeyhole, Menu, Network,
  PanelTop, Scale, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, UserCheck,
  Users, X,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

type Challenge = {
  title: string
  problem: string
  who: string
  effect: string
  response: string
  measures: string[]
}

type QueueCase = {
  id: string
  type: string
  signal: string
  priority: string
  evidence: string
  age: number
  analyst: string
  status: string
  approval: string
  why: string[]
}

const challenges: Challenge[] = [
  {
    title: 'High volumes of information',
    problem: 'Revenue teams may receive more returns, filings, reports, leads, and supporting records than staff can review manually.',
    who: 'Compliance analysts, supervisors, and operations directors',
    effect: 'Older cases may remain in the queue while staff reconcile information across channels.',
    response: 'Organize approved signals into a prioritized queue with visible reasons and supporting sources.',
    measures: ['Cases awaiting review', 'Queue age', 'Cases by signal category', 'Staff capacity'],
  },
  {
    title: 'Disconnected evidence',
    problem: 'A potential compliance issue may involve information held across different systems and documents.',
    who: 'Analysts, auditors, investigators, and data stewards',
    effect: 'Reviewers spend time locating records and confirming where information originated.',
    response: 'Associate each signal with its source, date, legal basis, reliability information, and related evidence.',
    measures: ['Cases with complete provenance', 'Missing-source exceptions', 'Unresolved evidence requests'],
  },
  {
    title: 'Opaque analytical scores',
    problem: 'A score without an explanation gives analysts little basis for review and creates governance concerns.',
    who: 'Analysts, model governance teams, legal reviewers, and executives',
    effect: 'Staff cannot readily assess whether a priority is relevant or defensible.',
    response: 'Show contributing signal categories, model or rule version, confidence, and available evidence.',
    measures: ['Explained scores', 'Analyst overrides', 'Override reasons', 'Cases requiring more evidence'],
  },
  {
    title: 'Inconsistent case handling',
    problem: 'Teams may use different thresholds, disposition categories, approval paths, or documentation practices.',
    who: 'Review teams, supervisors, quality control, and administrators',
    effect: 'Case records and approval paths can vary across programs or offices.',
    response: 'Configure jurisdiction-approved workflows, review requirements, escalation paths, and disposition reasons.',
    measures: ['Workflow exceptions', 'Incomplete case records', 'Disposition patterns', 'Approval turnaround'],
  },
  {
    title: 'Uncontrolled AI-generated content',
    problem: 'Generated summaries or notices may contain statements that are unsupported by case evidence.',
    who: 'Analysts, legal reviewers, responsible AI leaders, and supervisors',
    effect: 'Unsupported language can enter consequential documents without visible controls.',
    response: 'Ground drafts in approved case information, link statements to evidence, and require authorized review before use.',
    measures: ['Draft corrections', 'Rejected drafts', 'Evidence-link completeness', 'Approval history'],
  },
  {
    title: 'Limited analytical feedback',
    problem: 'Programs may not capture whether prioritized leads produced useful reviews or why analysts overrode recommendations.',
    who: 'Analytics leaders, model governance teams, and program executives',
    effect: 'Models and rules may be evaluated without sufficient operational context.',
    response: 'Record analyst decisions, outcome categories, override reasons, and quality findings for governed performance evaluation.',
    measures: ['Analyst agreement', 'Override patterns', 'Case outcomes', 'Model-version performance'],
  },
]

const stages = [
  ['Receive a Lead', 'Create a case from an authorized referral, agency process, approved analytical result, or manual analyst entry.', 'Structured intake and duplicate checks', 'Confirm purpose and intake authority', 'Purpose registry, access record', 'Lead volume, intake exceptions'],
  ['Attach Approved Signals', 'Associate permitted behavioral, filing, financial, or relationship indicators with their source and legal basis.', 'Signal catalog and provenance links', 'Confirm relevance and source quality', 'Source permissions, legal-basis record', 'Provenance completeness, source exceptions'],
  ['Prioritize for Review', 'Apply configured rules or models to support queue ordering and display factors contributing to priority.', 'Explainable queue ordering', 'Treat priority as an aid, not a finding', 'Versioning, validation, monitoring', 'Queue age, overrides by version'],
  ['Examine Evidence', 'Inspect supporting records, compare relevant information, document findings, and request more evidence.', 'Evidence workspace and chronology', 'Assess context and limitations', 'Data masking, audit history', 'Evidence requests, review duration'],
  ['Select a Case Path', 'Recommend no action, monitoring, soft-compliance outreach, audit consideration, or controlled referral where permitted.', 'Permitted paths and rationale prompts', 'Choose a proportionate recommendation', 'Policy rules, required evidence', 'Path mix, incomplete rationales'],
  ['Review and Approve', 'Route consequential recommendations, correspondence, or referrals to personnel with the required authority.', 'Role-based review and approval', 'Approve, return, or decline', 'Authority matrix, segregation of duties', 'Pending approvals, turnaround'],
  ['Record the Outcome', 'Capture final disposition, supporting rationale, approval history, corrections, and analytical feedback.', 'Outcome and feedback capture', 'Record the decision and basis', 'Retention, audit export, quality review', 'Outcomes, corrections, override reasons'],
]

const queueCases: QueueCase[] = [
  { id: 'CASE-A', type: 'Individual', signal: 'Return discrepancy', priority: 'Review first', evidence: '4 of 5 sources', age: 9, analyst: 'A. Rivera', status: 'Evidence review', approval: 'Supervisor', why: ['Reported-information difference', 'Two corroborating approved sources', 'Recent source-quality review'] },
  { id: 'CASE-B', type: 'Self-employed', signal: 'Income pattern', priority: 'Additional information needed', evidence: '2 of 4 sources', age: 14, analyst: 'Unassigned', status: 'Source check', approval: 'Analyst', why: ['Pattern variance requires context', 'Missing supporting document', 'Priority held pending source check'] },
  { id: 'CASE-C', type: 'Business', signal: 'Filing inconsistency', priority: 'Standard review', evidence: '5 of 5 sources', age: 6, analyst: 'M. Chen', status: 'Analyst review', approval: 'Supervisor', why: ['Cross-period filing difference', 'Evidence package complete', 'Configured queue policy'] },
  { id: 'CASE-D', type: 'Business', signal: 'Relationship indicator', priority: 'Monitoring', evidence: '3 of 3 sources', age: 22, analyst: 'S. Patel', status: 'Monitoring', approval: 'None at this stage', why: ['Approved relationship record', 'No consequential action proposed', 'Scheduled monitoring review'] },
  { id: 'CASE-E', type: 'Individual', signal: 'Document mismatch', priority: 'Closed', evidence: '3 of 3 sources', age: 3, analyst: 'J. Morgan', status: 'Closed', approval: 'Completed', why: ['Difference resolved by source correction', 'Analyst rationale recorded', 'Closure approved'] },
]

const scenarios = [
  {
    name: 'Individual return discrepancy',
    profile: 'Fictional individual filer · Synthetic region North',
    status: 'Evidence review',
    version: 'Ruleset REV-2.4 · illustrative',
    confidence: 'Moderate evidence quality',
    legal: 'Demonstration legal-basis field: approved compliance-review purpose',
    chronology: ['Lead received · Day 1', 'Source records attached · Day 2', 'Analyst review started · Day 4'],
    signals: [
      ['Reported-information difference', 'An approved source record differs from a reported category.', 'Agency filing and approved information record', 'Synthetic Day 2', 'The difference may merit contextual review.', 'Source alignment: moderate', 'Timing or classification differences may explain the observation.'],
      ['Cross-period change', 'A reported category changed relative to a prior period.', 'Agency filing history', 'Synthetic Day 2', 'The change may help an analyst frame questions.', 'Record quality: high', 'Changes may reflect ordinary life or reporting events.'],
    ],
  },
  {
    name: 'Self-employed income-pattern review',
    profile: 'Fictional self-employed filer · Synthetic region Central',
    status: 'Additional information needed',
    version: 'Pattern check PAT-1.7 · illustrative',
    confidence: 'Limited pending another source',
    legal: 'Demonstration legal-basis field: authorized filing-integrity review',
    chronology: ['Analytical lead received · Day 1', 'Pattern check recorded · Day 1', 'Evidence request drafted · Day 3'],
    signals: [
      ['Numeric pattern variance', 'Leading-digit frequencies differ from an illustrative reference.', 'Synthetic reported-number set', 'Synthetic Day 1', 'The variance may support another review step when the dataset is suitable.', 'Dataset suitability: under review', 'Numeric patterns do not establish intent, underreporting, or liability.'],
      ['Documentation gap', 'A supporting category is absent from the case record.', 'Case evidence inventory', 'Synthetic Day 3', 'Missing context limits interpretation of the other signal.', 'Inventory status: incomplete', 'The document may not be required or may exist outside this demonstration.'],
    ],
  },
  {
    name: 'Business filing inconsistency',
    profile: 'Fictional small business · Synthetic region Coastal',
    status: 'Analyst review',
    version: 'Ruleset BUS-3.1 · illustrative',
    confidence: 'Higher source completeness',
    legal: 'Demonstration legal-basis field: approved business-filing review',
    chronology: ['Manual referral received · Day 1', 'Five source records linked · Day 2', 'Reviewer assigned · Day 2'],
    signals: [
      ['Cross-filing inconsistency', 'Two filing categories show a difference that requires classification review.', 'Agency filing systems', 'Synthetic Day 2', 'An analyst may determine whether the categories should align.', 'Source completeness: high', 'Different filing definitions or periods may explain the difference.'],
      ['Amendment timing', 'An amendment follows the original filing in the synthetic chronology.', 'Agency filing history', 'Synthetic Day 2', 'Timing may provide useful context for review.', 'Record quality: high', 'An amendment is not evidence of wrongdoing.'],
    ],
  },
]

const paths = [
  ['No further action', 'Explain why available information does not support another step.', 'Reviewed evidence and analyst rationale', 'Analyst or supervisor, based on policy', 'No correspondence', 'Closure record, rationale, reviewer'],
  ['Continue monitoring', 'State the review condition and permitted monitoring period.', 'Source records supporting the monitoring basis', 'Supervisor where policy requires', 'No correspondence by default', 'Monitoring basis, schedule, approval'],
  ['Soft-compliance outreach', 'Describe the information request and proportionate purpose.', 'Evidence-linked discrepancy and approved template', 'Supervisor or designated authority', 'Draft only until approved', 'Draft, edits, evidence links, approval'],
  ['Refer for audit consideration', 'Explain why audit personnel should consider the case.', 'Relevant evidence package and limitations', 'Authorized compliance leader', 'Separate team may correspond', 'Recommendation and receiving-team decision'],
  ['Controlled referral where authorized', 'Document legal basis, scope, and referral purpose.', 'Required evidence package under agency policy', 'Named authorized role', 'Depends on approved process', 'Referral recommendation, approvals, transfer record'],
]

const numericData = [
  { digit: '1', reported: 26, reference: 30.1 }, { digit: '2', reported: 21, reference: 17.6 },
  { digit: '3', reported: 12, reference: 12.5 }, { digit: '4', reported: 11, reference: 9.7 },
  { digit: '5', reported: 8, reference: 7.9 }, { digit: '6', reported: 7, reference: 6.7 },
  { digit: '7', reported: 6, reference: 5.8 }, { digit: '8', reported: 5, reference: 5.1 },
  { digit: '9', reported: 4, reference: 4.6 },
]

const analyticsData = [
  { name: 'Individual', value: 46 }, { name: 'Self-employed', value: 31 }, { name: 'Business', value: 53 },
]

const nav = [
  ['Product', 'product'], ['Challenges', 'challenges'], ['Review Process', 'review-process'],
  ['Capabilities', 'queue'], ['Explainability', 'workspace'], ['Governance', 'governance'],
  ['Architecture', 'architecture'], ['Roadmap', 'roadmap'],
]

function Badge({ children, tone = 'teal' }: { children: React.ReactNode; tone?: 'teal' | 'amber' | 'slate' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  )
}

function Modal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    firstRef.current?.focus()
    const handle = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handle)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handle)
      document.body.style.overflow = ''
      previous?.focus()
    }
  }, [onClose])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (!data.get('name') || !data.get('email') || !data.get('agency')) {
      setError('Enter your name, organization, and work email.')
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="demo-title" ref={dialogRef}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close demonstration request"><X /></button>
        {submitted ? (
          <div className="confirmation" role="status">
            <CheckCircle2 />
            <p className="eyebrow">Prototype confirmation</p>
            <h2 id="demo-title">Your request was demonstrated.</h2>
            <p>This prototype did not send or retain the information you entered.</p>
            <button className="button primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Product demonstration</p>
            <h2 id="demo-title">Explore an agency-focused walkthrough.</h2>
            <p className="muted">Fields marked required support this local interaction. Nothing is sent or retained.</p>
            <form onSubmit={submit} noValidate>
              <div className="form-grid">
                <label>Name *<input ref={firstRef} name="name" autoComplete="name" /></label>
                <label>Agency or organization *<input name="agency" autoComplete="organization" /></label>
                <label>Work email *<input name="email" type="email" autoComplete="email" /></label>
                <label>Role<input name="role" autoComplete="organization-title" /></label>
                <label>Jurisdiction type<select name="jurisdiction"><option>State revenue agency</option><option>Municipal revenue agency</option><option>Tax administration authority</option><option>Audit or integrity program</option><option>Other public organization</option></select></label>
                <label>Current case-management environment<select name="environment"><option>Agency platform</option><option>Commercial platform</option><option>Multiple systems</option><option>Evaluating options</option></select></label>
              </div>
              <label>Primary financial-integrity challenge<textarea name="challenge" rows={2} /></label>
              <label className="check"><input type="checkbox" name="synthetic" /> Interested in a synthetic-data demonstration</label>
              <label>Optional message<textarea name="message" rows={3} /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button primary" type="submit">Request a Product Demonstration <ArrowRight /></button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function Header({ openModal }: { openModal: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="MTX Financial Cybersecurity home"><span>MTX</span><small>Financial Cybersecurity</small></a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-navigation"><Menu /><span>Menu</span></button>
      <nav id="site-navigation" aria-label="Primary navigation" className={open ? 'nav-open' : ''}>
        {nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
        <button className="button small primary" onClick={() => { setOpen(false); openModal() }}>Request a Demo</button>
      </nav>
    </header>
  )
}

function Hero({ openModal }: { openModal: () => void }) {
  return (
    <section className="hero" id="product">
      <div className="hero-copy">
        <p className="eyebrow">MTX Public Revenue Solutions</p>
        <h1>Turn financial signals into explainable compliance leads.</h1>
        <p className="hero-lead">MTX Financial Cybersecurity helps authorized revenue teams organize approved signals, understand supporting evidence, prioritize staff review, and document proportionate actions—while keeping consequential decisions with agency personnel.</p>
        <p className="descriptor">Explainable financial-integrity and tax-compliance decision support for public-revenue agencies—not network or endpoint cybersecurity.</p>
        <div className="button-row">
          <button className="button primary" onClick={openModal}>Request a Product Demonstration <ArrowRight /></button>
          <a className="button secondary" href="#review-process">Explore the Review Process</a>
        </div>
        <div className="trust"><ShieldCheck /><span>Designed for explainability, evidence traceability, and human review.</span></div>
      </div>
      <div className="workspace-preview" aria-label="Synthetic analyst workspace preview">
        <div className="preview-top">
          <div><span className="micro">ANALYST WORKSPACE</span><h2>Prioritized case queue</h2></div>
          <Badge>Synthetic demonstration data</Badge>
        </div>
        <div className="preview-stats">
          <div><span>Awaiting review</span><strong>18</strong></div>
          <div><span>Required review</span><strong>7</strong></div>
          <div><span>Source exceptions</span><strong>3</strong></div>
        </div>
        <div className="preview-row head"><span>Case / type</span><span>Priority</span><span>Evidence</span></div>
        <div className="preview-row"><span><b>CASE-A</b><small>Individual · A. Rivera</small></span><Badge tone="amber">Review first</Badge><span>4 sources<small>Supervisor review</small></span></div>
        <div className="preview-row"><span><b>CASE-B</b><small>Self-employed · Unassigned</small></span><Badge tone="slate">Info needed</Badge><span>2 sources<small>Analyst review</small></span></div>
        <div className="preview-row"><span><b>CASE-C</b><small>Business · M. Chen</small></span><Badge>Standard review</Badge><span>5 sources<small>Supervisor review</small></span></div>
        <p className="notice"><CircleAlert /> Priority indicates review order, not a finding of noncompliance.</p>
      </div>
    </section>
  )
}

function ChallengeSection() {
  const [selected, setSelected] = useState(0)
  const item = challenges[selected]
  return (
    <section className="section" id="challenges">
      <SectionHeading eyebrow="Operational challenges" title="Revenue agencies need better ways to focus limited review capacity." copy="Select a challenge to see where case organization, traceability, and governed workflows can support staff." />
      <div className="challenge-layout">
        <div className="challenge-tabs" role="tablist" aria-label="Public-revenue challenges">
          {challenges.map((challenge, index) => (
            <button key={challenge.title} role="tab" aria-selected={selected === index} aria-controls="challenge-panel" onClick={() => setSelected(index)}>
              <span>0{index + 1}</span>{challenge.title}<ArrowRight />
            </button>
          ))}
        </div>
        <div className="detail-panel" id="challenge-panel" role="tabpanel" tabIndex={0}>
          <Badge tone="slate">Challenge 0{selected + 1}</Badge>
          <h3>{item.title}</h3>
          <dl className="detail-list">
            <div><dt>Operational challenge</dt><dd>{item.problem}</dd></div>
            <div><dt>Who experiences it</dt><dd>{item.who}</dd></div>
            <div><dt>Program effect</dt><dd>{item.effect}</dd></div>
            <div className="response"><dt>Product response</dt><dd>{item.response}</dd></div>
            <div><dt>Suggested management measures</dt><dd>{item.measures.join(' · ')}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function ReviewProcess() {
  const [selected, setSelected] = useState(0)
  const stage = stages[selected]
  const onKey = (event: KeyboardEvent, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') setSelected((index + 1) % stages.length)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') setSelected((index - 1 + stages.length) % stages.length)
  }
  return (
    <section className="section dark-section" id="review-process">
      <SectionHeading eyebrow="Human-led review process" title="From authorized lead to recorded outcome." copy="Each stage pairs product support with a defined human responsibility and governance record." />
      <div className="stepper" role="tablist" aria-label="Case review stages">
        {stages.map((item, index) => <button role="tab" aria-selected={selected === index} key={item[0]} onClick={() => setSelected(index)} onKeyDown={(event) => onKey(event, index)}><span>{index + 1}</span><small>{item[0]}</small></button>)}
      </div>
      <div className="stage-panel" role="tabpanel" tabIndex={0}>
        <div><Badge>Stage {selected + 1}</Badge><h3>{stage[0]}</h3><p>{stage[1]}</p></div>
        <dl>
          <div><dt>Product support</dt><dd>{stage[2]}</dd></div>
          <div><dt>Human responsibility</dt><dd>{stage[3]}</dd></div>
          <div><dt>Governance controls</dt><dd>{stage[4]}</dd></div>
          <div><dt>Suggested measures</dt><dd>{stage[5]}</dd></div>
        </dl>
      </div>
    </section>
  )
}

function AnalystQueue() {
  const [type, setType] = useState('Any')
  const [signal, setSignal] = useState('Any')
  const [status, setStatus] = useState('Any')
  const [sort, setSort] = useState('priority')
  const [opened, setOpened] = useState<QueueCase | null>(null)
  const [compare, setCompare] = useState<string[]>([])
  const priorities: Record<string, number> = { 'Review first': 0, 'Additional information needed': 1, 'Standard review': 2, Monitoring: 3, Closed: 4 }
  const visible = useMemo(() => queueCases
    .filter((item) => type === 'Any' || item.type === type)
    .filter((item) => signal === 'Any' || item.signal === signal)
    .filter((item) => status === 'Any' || item.status === status)
    .sort((a, b) => sort === 'age' ? b.age - a.age : priorities[a.priority] - priorities[b.priority]), [type, signal, status, sort])
  const toggleCompare = (id: string) => setCompare((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length < 2 ? [...items, id] : [items[1], id])
  return (
    <section className="section" id="queue">
      <SectionHeading eyebrow="Interactive analyst queue" title="Prioritize attention without turning priority into a conclusion." copy="Explore fictional cases, compare context, and inspect the reasons behind queue placement." />
      <div className="synthetic-banner"><Database /> Synthetic demonstration data <span>Priority indicates review order, not a finding of noncompliance.</span></div>
      <div className="filters" aria-label="Queue filters">
        <label><Filter /> Taxpayer type<select value={type} onChange={(e) => setType(e.target.value)}><option>Any</option>{['Individual', 'Self-employed', 'Business'].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Signal category<select value={signal} onChange={(e) => setSignal(e.target.value)}><option>Any</option>{[...new Set(queueCases.map((x) => x.signal))].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Review status<select value={status} onChange={(e) => setStatus(e.target.value)}><option>Any</option>{[...new Set(queueCases.map((x) => x.status))].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Sort<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="priority">Priority</option><option value="age">Queue age</option></select></label>
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">Synthetic prioritized analyst case queue</caption>
          <thead><tr><th>Compare</th><th>Case reference</th><th>Taxpayer type</th><th>Signal category</th><th>Priority band</th><th>Evidence</th><th>Age</th><th>Assigned analyst</th><th>Status</th><th>Approval</th><th>Actions</th></tr></thead>
          <tbody>{visible.map((item) => <tr key={item.id}>
            <td><input aria-label={`Compare ${item.id}`} type="checkbox" checked={compare.includes(item.id)} onChange={() => toggleCompare(item.id)} /></td>
            <td><b>{item.id}</b></td><td>{item.type}</td><td>{item.signal}</td>
            <td><Badge tone={item.priority === 'Review first' ? 'amber' : item.priority === 'Standard review' ? 'teal' : 'slate'}>{item.priority}</Badge></td>
            <td>{item.evidence}</td><td>{item.age} days</td><td>{item.analyst}</td><td>{item.status}</td><td>{item.approval}</td>
            <td><button className="text-button" onClick={() => setOpened(item)}>Open case</button></td>
          </tr>)}</tbody>
        </table>
      </div>
      {compare.length === 2 && <div className="compare-panel"><GitCompareArrows /><div><strong>Case comparison</strong><p>{compare.map((id) => queueCases.find((item) => item.id === id)).map((item) => `${item?.id}: ${item?.priority}, ${item?.evidence}`).join(' · ')}</p></div></div>}
      {opened && <div className="why-panel"><button className="icon-button" aria-label="Close case detail" onClick={() => setOpened(null)}><X /></button><Badge>{opened.id}</Badge><h3>Why this case was prioritized</h3><ul>{opened.why.map((reason) => <li key={reason}><Check />{reason}</li>)}</ul><p className="notice"><CircleAlert /> Queue placement supports analyst review. It does not determine a legal or enforcement outcome.</p></div>}
    </section>
  )
}

function CaseWorkspace() {
  const [caseIndex, setCaseIndex] = useState(0)
  const [signalIndex, setSignalIndex] = useState(0)
  const item = scenarios[caseIndex]
  const signal = item.signals[signalIndex]
  const switchCase = (index: number) => { setCaseIndex(index); setSignalIndex(0) }
  return (
    <section className="section blue-section" id="workspace">
      <SectionHeading eyebrow="Explainable case workspace" title="Give reviewers the evidence, context, and limitations behind a lead." copy="Three synthetic scenarios demonstrate how signal provenance and reviewer activity can stay connected." />
      <div className="scenario-tabs" role="tablist">{scenarios.map((scenario, index) => <button role="tab" aria-selected={caseIndex === index} onClick={() => switchCase(index)} key={scenario.name}>{scenario.name}</button>)}</div>
      <div className="case-shell">
        <aside>
          <Badge>Synthetic taxpayer profile</Badge><h3>{item.name}</h3><p>{item.profile}</p>
          <div className="case-meta"><span>Status<strong>{item.status}</strong></span><span>Model or rule version<strong>{item.version}</strong></span><span>Confidence information<strong>{item.confidence}</strong></span></div>
          <h4>Case chronology</h4><ol className="chronology">{item.chronology.map((x) => <li key={x}>{x}</li>)}</ol>
          <h4>Related documents</h4><p className="muted">Synthetic filing extract · Source-quality note · Analyst worksheet</p>
        </aside>
        <main>
          <div className="case-grid">
            <div><span className="micro">LEGAL BASIS</span><p>{item.legal}</p></div>
            <div><span className="micro">REQUIRED APPROVAL</span><p>Supervisor review before a consequential recommendation</p></div>
            <div><span className="micro">ANALYTICAL LIMITATION</span><p>Signals may reflect ordinary reporting, timing, or classification differences.</p></div>
            <div><span className="micro">AUDIT HISTORY</span><p>View created · source linked · reviewer assigned</p></div>
          </div>
          <h3>Signal summary</h3>
          <div className="signal-explorer">
            <div role="tablist">{item.signals.map((entry, index) => <button role="tab" aria-selected={signalIndex === index} onClick={() => setSignalIndex(index)} key={entry[0]}><Activity />{entry[0]}</button>)}</div>
            <dl>
              <div><dt>What was observed</dt><dd>{signal[1]}</dd></div>
              <div><dt>Source category</dt><dd>{signal[2]}</dd></div>
              <div><dt>Observation date</dt><dd>{signal[3]}</dd></div>
              <div><dt>Why it may warrant review</dt><dd>{signal[4]}</dd></div>
              <div><dt>Confidence or quality note</dt><dd>{signal[5]}</dd></div>
              <div><dt>Known limitations</dt><dd>{signal[6]}</dd></div>
              <div><dt>Related evidence</dt><dd>Open synthetic source record and provenance entry</dd></div>
            </dl>
          </div>
          <div className="notice strong"><Scale /> A signal is an indicator for analyst review. It is not a legal finding.</div>
          <label>Analyst notes<textarea rows={3} defaultValue="Review context and source limitations before selecting a case path." /></label>
          <div className="button-row"><button className="button secondary">Save Draft</button><button className="button primary">Prepare Recommendation</button></div>
        </main>
      </div>
    </section>
  )
}

function NumericPattern() {
  const [showNotes, setShowNotes] = useState(false)
  return (
    <section className="section split-section" id="numeric-analysis">
      <div>
        <p className="eyebrow">Educational numeric-pattern demonstration</p>
        <h2>A comparison can prompt a question. It cannot answer the case.</h2>
        <p>This fictional Benford-style view compares leading-digit frequencies with a reference distribution. Suitability depends on how the dataset was produced, its size, and the values it contains.</p>
        <div className="notice strong"><CircleAlert /> Numeric anomalies may support further review but do not establish underreporting, intent, or liability.</div>
        <button className="button secondary" onClick={() => setShowNotes(!showNotes)} aria-expanded={showNotes}>View analyst review notes <ChevronDown /></button>
        {showNotes && <div className="notes"><h3>Analyst review notes</h3><ul><li>Confirm the dataset is suitable for this type of comparison.</li><li>Review data quality, period, and population before interpretation.</li><li>Use underlying evidence and context for any recommendation.</li></ul></div>}
      </div>
      <div className="chart-card">
        <div className="chart-title"><div><span className="micro">SYNTHETIC DISTRIBUTION</span><h3>Leading-digit comparison</h3></div><Badge tone="slate">Illustrative</Badge></div>
        <div className="chart" aria-hidden="true">
          <ResponsiveContainer width="100%" height={300}><BarChart data={numericData}><CartesianGrid strokeDasharray="3 3" stroke="#d9e2e5" /><XAxis dataKey="digit" /><YAxis unit="%" /><Tooltip /><Bar dataKey="reference" name="Reference %" fill="#9db4ba" radius={[3,3,0,0]} /><Bar dataKey="reported" name="Fictional reported %" fill="#12877f" radius={[3,3,0,0]} /></BarChart></ResponsiveContainer>
        </div>
        <p className="chart-summary">Text summary: the largest illustrative differences appear at leading digits 1 and 2. Other digit frequencies are closer to the reference. No operational threshold or rule weight is shown.</p>
      </div>
    </section>
  )
}

function CasePathSelector() {
  const [selected, setSelected] = useState(0)
  const path = paths[selected]
  const [prepared, setPrepared] = useState(false)
  return (
    <section className="section" id="case-path">
      <SectionHeading eyebrow="Case-path selector" title="Support proportionate recommendations without executing them." copy="Select a permitted path to see the rationale, evidence, and authority required." />
      <div className="path-layout">
        <div className="path-options" role="radiogroup" aria-label="Case path">{paths.map((item, index) => <label key={item[0]} className={selected === index ? 'selected' : ''}><input type="radio" name="path" checked={selected === index} onChange={() => { setSelected(index); setPrepared(false) }} /><span><small>Path {index + 1}</small>{item[0]}</span></label>)}</div>
        <div className="detail-panel">
          <Badge tone="slate">Decision support</Badge><h3>{path[0]}</h3>
          <dl className="detail-list"><div><dt>Required rationale</dt><dd>{path[1]}</dd></div><div><dt>Required evidence</dt><dd>{path[2]}</dd></div><div><dt>Approval level</dt><dd>{path[3]}</dd></div><div><dt>Correspondence</dt><dd>{path[4]}</dd></div><div><dt>Case history</dt><dd>{path[5]}</dd></div></dl>
          {prepared && <p className="success" role="status"><CheckCircle2 /> Recommendation draft prepared. No action was executed.</p>}
          <div className="button-row"><button className="button secondary">Save Draft</button><button className="button primary" onClick={() => setPrepared(true)}>Prepare Recommendation</button></div>
        </div>
      </div>
    </section>
  )
}

function AISupport() {
  const capabilities = ['Summarize approved case evidence', 'Prepare a case chronology', 'Explain contributing signals', 'Identify missing documentation', 'Compare related records', 'Draft an analyst rationale', 'Draft correspondence using an approved template', 'Suggest a permitted next step', 'Surface related cases for review', 'Support workload forecasting']
  const controls = ['Evidence grounding', 'Source citations', 'Approved templates', 'Human review', 'Role-based access', 'Model and prompt versioning', 'Confidence indicators', 'Override capture', 'Data minimization', 'Output monitoring']
  return (
    <section className="section dark-section" id="ai-support">
      <SectionHeading eyebrow="Governed analyst assistance" title="AI prepares information. Authorized staff decide what happens." copy="Selectable analytical and AI components can assist with bounded tasks using approved evidence, architecture, and governance controls." />
      <div className="ai-flow" aria-label="Governed AI-assisted process">{['Approved information', 'AI-assisted preparation', 'Evidence-linked draft', 'Analyst review', 'Authorized approval', 'Recorded action'].map((item, index) => <div key={item}><span>{index + 1}</span>{item}{index < 5 && <ArrowRight />}</div>)}</div>
      <div className="two-columns">
        <div className="card"><Bot /><h3>Potential support</h3><ul className="check-list">{capabilities.map((item) => <li key={item}><Check />{item}</li>)}</ul></div>
        <div className="card"><SlidersHorizontal /><h3>Required controls</h3><ul className="check-list">{controls.map((item) => <li key={item}><Check />{item}</li>)}</ul></div>
      </div>
      <p className="notice strong"><UserCheck /> AI does not independently make audit, enforcement, legal, referral, or taxpayer-notice decisions.</p>
    </section>
  )
}

function Correspondence() {
  const original = 'We are reviewing information associated with your fictional filing. Please review the listed category and provide supporting documentation using the approved response method.'
  const [draft, setDraft] = useState('')
  const [flagged, setFlagged] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  return (
    <section className="section" id="correspondence">
      <SectionHeading eyebrow="Correspondence drafting demonstration" title="Evidence-linked drafting with a visible approval boundary." copy="This fictional workflow uses an approved template and keeps delivery outside the prototype." />
      <div className="correspondence-shell">
        <aside>
          <Badge tone="amber">Draft — not approved for delivery</Badge>
          <h3>Template and evidence</h3>
          <dl className="detail-list"><div><dt>Jurisdiction template</dt><dd>Information request · Template v2.1 · illustrative</dd></div><div><dt>Evidence references</dt><dd>Source record SR-A · Filing extract FE-B</dd></div><div><dt>Legal or supervisory review</dt><dd>Required before send-readiness</dd></div><div><dt>Approval history</dt><dd>No approval recorded</dd></div></dl>
          <div className="warning"><CircleAlert /> Unsupported-statement check: {draft ? 'No unsupported sentence detected in this fictional draft.' : 'Generate a draft to run the check.'}</div>
        </aside>
        <main>
          <label>Fictional draft<textarea rows={9} value={draft} onChange={(e) => { setDraft(e.target.value); setSubmitted(false) }} placeholder="Generate or edit a local draft." /></label>
          <div className="button-row wrap">
            <button className="button secondary" onClick={() => setDraft(original)}><Sparkles /> Generate fictional draft</button>
            <button className="button secondary" onClick={() => setFlagged(!flagged)}>Flag a sentence</button>
            <button className="button primary" disabled={!draft} onClick={() => setSubmitted(true)}>Submit for Approval</button>
          </div>
          {flagged && <p className="warning" role="status"><CircleAlert /> Sentence flagged for analyst and legal review. The draft remains editable.</p>}
          {submitted && <p className="success" role="status"><CheckCircle2 /> Submitted to the demonstration approval queue. It cannot be sent from this prototype.</p>}
          <p className="micro">SEND-READINESS STATUS · BLOCKED UNTIL AUTHORIZED APPROVAL</p>
        </main>
      </div>
    </section>
  )
}

const traceStages = [
  ['Source', 'Source system, record identifier, access purpose, retrieval date, quality note'],
  ['Signal', 'Observation, source link, permitted purpose, date, reliability and limitations'],
  ['Rule or Model', 'Version, owner, validation status, approved use, monitoring record'],
  ['Priority', 'Contributing factors, band, timestamp, queue policy, confidence note'],
  ['Analyst Review', 'Evidence viewed, notes, requests, overrides, rationale'],
  ['Approval', 'Required authority, reviewer, decision, comments, timestamp'],
  ['Outcome', 'Disposition, supporting rationale, corrections, feedback, retention class'],
]

function Governance() {
  const [selected, setSelected] = useState(0)
  const controls = ['Approved-purpose registry', 'Data-source inventory', 'Legal-basis record', 'Data minimization', 'Role-based access', 'Model inventory', 'Model and rule versioning', 'Validation history', 'Confidence monitoring', 'Drift monitoring', 'Fairness review', 'Analyst override analysis', 'Correspondence controls', 'Retention configuration', 'Audit history', 'Incident and issue management']
  return (
    <section className="section governance" id="governance">
      <SectionHeading eyebrow="Governance and responsible AI" title="Trace how information informed a human-authorized outcome." copy="Configurable records support oversight and review. They do not automatically establish legal or regulatory compliance." />
      <div className="trace" role="tablist" aria-label="Traceability chain">{traceStages.map((item, index) => <button role="tab" aria-selected={selected === index} onClick={() => setSelected(index)} key={item[0]}>{item[0]}{index < traceStages.length - 1 && <ArrowRight />}</button>)}</div>
      <div className="trace-detail" role="tabpanel"><Fingerprint /><div><span className="micro">RETAINED AT THIS STAGE</span><h3>{traceStages[selected][0]}</h3><p>{traceStages[selected][1]}</p></div></div>
      <div className="control-grid">{controls.map((item) => <div key={item}><ShieldCheck /><span>{item}</span></div>)}</div>
    </section>
  )
}

function OperationalAnalytics() {
  const [metric, setMetric] = useState('Taxpayer type')
  const metrics = ['Taxpayer type', 'Signal category', 'Disposition']
  const data = metric === 'Taxpayer type' ? analyticsData : metric === 'Signal category'
    ? [{ name: 'Discrepancy', value: 42 }, { name: 'Pattern', value: 35 }, { name: 'Documentation', value: 29 }, { name: 'Relationship', value: 24 }]
    : [{ name: 'Review', value: 51 }, { name: 'Monitoring', value: 27 }, { name: 'Closed', value: 39 }, { name: 'Approval', value: 13 }]
  return (
    <section className="section blue-section" id="analytics">
      <SectionHeading eyebrow="Operational analytics" title="Monitor workload, evidence, decisions, and analytical feedback." copy="Fictional interface values demonstrate what leaders could review without claiming agency or MTX outcomes." />
      <div className="synthetic-banner"><BarChart3 /> Synthetic, illustrative analytics — not MTX or agency results.</div>
      <div className="metric-grid">
        {[
          ['Leads received', '130'], ['Awaiting review', '41'], ['Median queue age', '8 days'], ['Evidence complete', '74 of 130'],
          ['Pending approvals', '13'], ['Analyst overrides', '11'], ['Source exceptions', '6'], ['Review turnaround', '12 days'],
        ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong><small>fictional interface value</small></div>)}
      </div>
      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-title"><h3>Cases by {metric.toLowerCase()}</h3><div className="segmented">{metrics.map((item) => <button className={metric === item ? 'active' : ''} key={item} onClick={() => setMetric(item)}>{item}</button>)}</div></div>
          <div className="chart" aria-hidden="true"><ResponsiveContainer width="100%" height={280}><BarChart data={data} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={95} /><Tooltip /><Bar dataKey="value" fill="#12877f" radius={[0,4,4,0]} /></BarChart></ResponsiveContainer></div>
          <p className="chart-summary">Text summary: {data.map((item) => `${item.name}: ${item.value}`).join('; ')}. Values are synthetic.</p>
        </div>
        <div className="chart-card">
          <h3>Analyst workload</h3>
          <div className="chart" aria-hidden="true"><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={[{ name: 'Assigned', value: 84 }, { name: 'Unassigned', value: 28 }, { name: 'Pending approval', value: 18 }]} dataKey="value" innerRadius={58} outerRadius={90}>{['#12877f', '#8da4ab', '#e1a23b'].map((color) => <Cell key={color} fill={color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <p className="chart-summary">Text summary: 84 assigned, 28 unassigned, and 18 pending approval. Additional views could cover outreach, model-version outcomes, evidence completeness, and data-source exceptions.</p>
        </div>
      </div>
    </section>
  )
}

function PlannedCapabilities() {
  const [node, setNode] = useState('Business A')
  const relations: Record<string, string> = {
    'Person A': 'Source: authorized relationship record · Type: representative · Confidence: documented · Date: synthetic Day 2 · Status: reviewed',
    'Business A': 'Source: agency filing record · Type: filer-to-business · Confidence: documented · Date: synthetic Day 1 · Status: under review',
    'Address A': 'Source: approved filing field · Type: shared attribute · Confidence: moderate · Date: synthetic Day 2 · Status: requires context',
    'Filing A': 'Source: agency filing system · Type: business filing · Confidence: high record quality · Date: synthetic Day 1 · Status: reviewed',
    'Person B': 'Source: authorized financial relationship · Type: permitted relationship · Confidence: limited · Date: synthetic Day 3 · Status: source check',
  }
  return (
    <section className="section" id="planned">
      <SectionHeading eyebrow="Planned capabilities" title="Extend the workflow only with agency approval." copy="These concepts are not presented as initial-release production capabilities." />
      <div className="planned-grid">
        <article className="planned-card">
          <Badge tone="amber">Planned · subject to jurisdiction policy</Badge><PanelTop /><h3>Taxpayer correction or response channel</h3>
          <p>A conceptual channel could let a taxpayer review an approved information request, submit a correction, upload supporting documentation, explain a discrepancy, track response status, and receive approved communications.</p>
          <div className="portal-demo"><span>Approved request</span><span>Correction and documents</span><span>Agency-reviewed response</span></div>
          <p className="notice">Internal scores, analyst notes, models, and protected agency information are not shown.</p>
        </article>
        <article className="planned-card">
          <Badge tone="amber">Planned or configurable</Badge><Network /><h3>Relationship analysis</h3>
          <div className="network-view" role="img" aria-label="Synthetic relationship diagram with five selectable nodes">
            <svg viewBox="0 0 500 260" aria-hidden="true"><g stroke="#6d9298" strokeWidth="2"><line x1="250" y1="130" x2="90" y2="55"/><line x1="250" y1="130" x2="410" y2="55"/><line x1="250" y1="130" x2="90" y2="210"/><line x1="250" y1="130" x2="410" y2="210"/></g></svg>
            {Object.keys(relations).map((item, index) => <button className={`node n${index + 1} ${node === item ? 'active' : ''}`} key={item} onClick={() => setNode(item)}>{item}</button>)}
          </div>
          <p className="network-detail">{relations[node]}</p>
          <p className="notice strong">A relationship indicates a potential connection for review. It does not establish coordination or wrongdoing.</p>
          <details><summary>Accessible relationship list</summary><ul>{Object.entries(relations).map(([name, detail]) => <li key={name}><strong>{name}:</strong> {detail}</li>)}</ul></details>
        </article>
      </div>
    </section>
  )
}

const architectureLayers = [
  ['User Experiences', 'Analyst workspace, supervisor dashboard, governance workspace, administration, planned taxpayer channel'],
  ['Case and Workflow Services', 'Case intake, queue management, evidence review, assignments, approvals, correspondence, disposition, audit history'],
  ['Analytics and AI Services', 'Configurable rules, anomaly checks, explainable scoring, summarization, planned relationship analysis, forecasting, model monitoring'],
  ['Integration Layer', 'APIs, events, message queues, secure file exchange, approved middleware, batch processing'],
  ['Agency Data Environment', 'Tax systems, filing systems, payment records, correspondence systems, document repositories, approved third-party data, analytics platforms'],
  ['Governance and Security', 'Identity, access, encryption, data minimization, retention, legal-basis records, model governance, monitoring, audit'],
  ['Deployment Foundation', 'Agency-approved cloud, private environment, sovereign hosting, on-premises, or hybrid infrastructure'],
]

function Architecture() {
  const [selected, setSelected] = useState(0)
  return (
    <section className="section dark-section" id="architecture">
      <SectionHeading eyebrow="Platform-neutral architecture" title="Fit the agency’s approved technology and data environment." copy="Integrate through standard patterns while preserving agency systems as authoritative sources where required." />
      <div className="architecture-layout">
        <div className="architecture-stack" role="tablist" aria-label="Architecture layers">{architectureLayers.map((layer, index) => <button role="tab" aria-selected={selected === index} onClick={() => setSelected(index)} key={layer[0]}><span>{index + 1}</span><div><strong>{layer[0]}</strong><small>{layer[1]}</small></div></button>)}</div>
        <div className="architecture-detail" role="tabpanel"><Layers3 /><Badge>Layer {selected + 1}</Badge><h3>{architectureLayers[selected][0]}</h3><p>{architectureLayers[selected][1]}</p><div className="notice"><LockKeyhole /> Deployment uses agency-approved data sources, models, tools, and infrastructure. Analytical and AI components are selectable or replaceable.</div></div>
      </div>
    </section>
  )
}

const profiles = {
  State: { intake: 'Authorized referral + approved batch result', queue: 'Regional compliance queue', approval: 'Supervisor then designated authority', path: 'No action · outreach · audit consideration', retention: 'Configured state records schedule' },
  Municipal: { intake: 'Manual referral + secure file intake', queue: 'Central revenue review queue', approval: 'Program manager', path: 'No action · information request · monitoring', retention: 'Configured municipal schedule' },
  Inspector: { intake: 'Controlled referral', queue: 'Restricted integrity review queue', approval: 'Legal and authorized executive', path: 'Close · monitor · controlled referral', retention: 'Configured investigative schedule' },
}

function Configuration() {
  const [profile, setProfile] = useState<keyof typeof profiles>('State')
  const item = profiles[profile]
  const settings = ['Case types', 'Signal categories', 'Data-source permissions', 'Legal-basis requirements', 'Rule and model thresholds', 'Priority bands', 'Review queues', 'Analyst assignments', 'Approval authority', 'Disposition options', 'Soft-compliance pathways', 'Correspondence templates', 'Retention policies', 'Dashboard measures', 'Audit exports']
  return (
    <section className="section" id="configuration">
      <SectionHeading eyebrow="Configuration studio" title="Put jurisdiction policy into the workflow." copy="Agency owners control rules, thresholds, data permissions, review paths, templates, and decisions. Sensitive production logic is not displayed." />
      <div className="config-layout">
        <div><div className="segmented profile">{(Object.keys(profiles) as (keyof typeof profiles)[]).map((name) => <button key={name} className={profile === name ? 'active' : ''} onClick={() => setProfile(name)}>{name} profile</button>)}</div><div className="workflow-preview"><div><span>INTAKE</span><strong>{item.intake}</strong></div><ArrowRight /><div><span>QUEUE</span><strong>{item.queue}</strong></div><ArrowRight /><div><span>APPROVAL</span><strong>{item.approval}</strong></div><ArrowRight /><div><span>PERMITTED PATHS</span><strong>{item.path}</strong></div><div className="retention"><Clock3 />{item.retention}</div></div></div>
        <div className="setting-list"><h3>Agency-configurable settings</h3>{settings.map((setting) => <span key={setting}><Settings2 />{setting}</span>)}</div>
      </div>
      <p className="notice"><CircleAlert /> This view omits exact enforcement thresholds, production model weights, and operational detection logic.</p>
    </section>
  )
}

function Security() {
  const controls = ['Least-privilege access', 'Sensitive-data masking', 'Encryption', 'Environment separation', 'Data minimization', 'Purpose limitation', 'Configurable retention', 'Logging', 'Approval controls', 'Secure integrations', 'Model access controls', 'Data-residency configuration', 'Backup and recovery', 'Monitoring']
  return (
    <section className="section security" id="security">
      <div><p className="eyebrow">Security and privacy</p><h2>Controls aligned to agency architecture and policy.</h2><p>The platform provides configurable controls that can support an agency’s security, privacy, records, and governance requirements.</p><p className="notice">Configuration and implementation require agency review. Product controls do not automatically establish compliance with tax-secrecy, federal tax-information, state privacy, or agency requirements.</p></div>
      <div className="security-grid">{controls.map((item) => <div key={item}><LockKeyhole />{item}</div>)}</div>
    </section>
  )
}

const roadmap = [
  ['Phase 1 — Demonstrate Safely', 'Initial release', ['Use synthetic data', 'Configure initial case types', 'Establish governance roles', 'Demonstrate explainability', 'Validate human-review workflows']],
  ['Phase 2 — Validate with Approved Data', 'Subject to agency approval', ['Select authorized data sources', 'Establish legal basis', 'Test data quality', 'Validate analytical methods', 'Complete privacy and security reviews']],
  ['Phase 3 — Introduce Controlled Operations', 'Potential', ['Deploy an initial use case', 'Train analysts', 'Monitor case handling', 'Review overrides', 'Evaluate model and workflow performance']],
  ['Phase 4 — Extend Carefully', 'Planned', ['Add approved data sources', 'Introduce outreach tracking', 'Expand relationship analysis', 'Add taxpayer correction capabilities', 'Refine governance and monitoring']],
]

function Roadmap() {
  const [selected, setSelected] = useState(0)
  return (
    <section className="section blue-section" id="roadmap">
      <SectionHeading eyebrow="Phased adoption roadmap" title="Start with synthetic data. Add scope through governed decisions." copy="Timing and sequence depend on agency authorization, data readiness, legal review, security requirements, and operational capacity." />
      <div className="roadmap-tabs" role="tablist">{roadmap.map((phase, index) => <button role="tab" aria-selected={selected === index} key={phase[0]} onClick={() => setSelected(index)}><span>0{index + 1}</span><strong>{phase[0].split(' — ')[1]}</strong><small>{phase[1]}</small></button>)}</div>
      <div className="roadmap-panel" role="tabpanel"><div><Badge tone={selected === 0 ? 'teal' : 'amber'}>{roadmap[selected][1]}</Badge><h3>{roadmap[selected][0]}</h3></div><ul>{roadmap[selected][2].map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul></div>
    </section>
  )
}

function DeliveryAndWhy() {
  const models = [
    ['Product', 'Reusable case management, signal management, evidence review, explainable prioritization, governance, human approval, audit history, analytics, and configuration.'],
    ['Implementation Services', 'Use-case discovery, policy mapping, data assessment, configuration, approved integrations, analytical validation, testing, training, security preparation, and deployment.'],
    ['Managed Services', 'Production support, release coordination, monitoring, data-quality support, model and rule maintenance, reporting assistance, and workflow refinement.'],
    ['Advisory Services', 'Financial-integrity strategy, use-case prioritization, responsible-AI governance, data readiness, operating-model design, and implementation roadmap.'],
  ]
  const why = [
    ['Evidence-linked signals', 'Keep observations connected to source, date, legal basis, quality, and supporting records.'],
    ['Explainable case prioritization', 'Show the factors, version, confidence, and limitations that informed review order.'],
    ['Human-controlled actions', 'Require authorized personnel to decide consequential case paths and communications.'],
    ['Jurisdiction-owned configuration', 'Let agency owners govern data permissions, rules, workflow, authority, and retention.'],
    ['Synthetic-data-first demonstration', 'Explore workflows and governance before approved production data is connected.'],
    ['Platform and model flexibility', 'Select replaceable components suited to agency architecture and governance.'],
  ]
  return (
    <>
      <section className="section" id="delivery">
        <SectionHeading eyebrow="Product and delivery model" title="Lead with reusable product capabilities, then fit implementation support to agency scope." copy="Product, implementation, managed, and advisory work have distinct roles." />
        <div className="delivery-grid">{models.map((item, index) => <article key={item[0]} className={index === 0 ? 'featured' : ''}>{index === 0 ? <Badge>Core offering</Badge> : <Badge tone="slate">Service</Badge>}<h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div>
      </section>
      <section className="section why-section">
        <SectionHeading eyebrow="Why MTX Financial Cybersecurity" title="Built around accountable public-revenue casework." copy="The product focuses on explainable financial-integrity and tax-compliance review—not network defense, transaction monitoring, credit scoring, or autonomous enforcement." />
        <div className="why-grid">{why.map((item, index) => <article key={item[0]}><span>0{index + 1}</span><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div>
      </section>
    </>
  )
}

function Principles() {
  return <section className="principles" aria-label="Product design principles">{[
    [FileCheck2, 'Evidence before action'], [BookOpenCheck, 'Explainable prioritization'], [UserCheck, 'Human decision authority'], [SlidersHorizontal, 'Jurisdiction-controlled configuration'],
  ].map(([Icon, label]) => { const C = Icon as typeof FileCheck2; return <div key={label as string}><C /><span>Design principle</span><strong>{label as string}</strong></div> })}</section>
}

function FinalCTA({ openModal }: { openModal: () => void }) {
  return (
    <section className="final-cta" id="request-demo">
      <p className="eyebrow">Start with a synthetic-data demonstration</p>
      <h2>Focus compliance resources with evidence, explanation, and human judgment.</h2>
      <p>Explore how MTX Financial Cybersecurity can help revenue teams organize approved signals, prioritize review, document decisions, and govern AI-assisted casework.</p>
      <div className="button-row"><button className="button light" onClick={openModal}>Request a Product Demonstration <ArrowRight /></button><a className="button dark-outline" href="mailto:?subject=Discuss%20a%20Financial-Integrity%20Roadmap">Discuss a Financial-Integrity Roadmap</a></div>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div className="wordmark"><span>MTX</span><small>Financial Cybersecurity</small></div>
      <p>Explainable financial-integrity and tax-compliance decision support for public-revenue agencies.</p>
      <div><a href="#governance">Responsible AI</a><a href="#security">Security &amp; privacy</a><a href="#roadmap">Maturity roadmap</a></div>
      <p className="footer-note">Prototype views use synthetic, illustrative data. No taxpayer data is collected, sent, or retained.</p>
    </footer>
  )
}

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <Header openModal={() => setModalOpen(true)} />
      <main id="main">
        <Hero openModal={() => setModalOpen(true)} />
        <Principles />
        <ChallengeSection />
        <ReviewProcess />
        <AnalystQueue />
        <CaseWorkspace />
        <NumericPattern />
        <CasePathSelector />
        <AISupport />
        <Correspondence />
        <Governance />
        <OperationalAnalytics />
        <PlannedCapabilities />
        <Architecture />
        <Configuration />
        <Security />
        <Roadmap />
        <DeliveryAndWhy />
        <FinalCTA openModal={() => setModalOpen(true)} />
      </main>
      <Footer />
      {modalOpen && <Modal onClose={() => setModalOpen(false)} />}
    </>
  )
}

export default App
