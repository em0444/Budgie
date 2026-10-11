import { useEffect, useMemo, useState } from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { BarChart3, Calculator as CalculatorIcon, ChartNoAxesCombined, ChevronRight, CircleDollarSign, Leaf, PiggyBank, Plus, RotateCcw, Save, Sparkles, Wallet } from 'lucide-react';
import { supabase, hasSupabase } from './lib/supabase';

Chart.register(ArcElement, Tooltip, Legend);

const CATEGORIES = [
  { key: 'rent', label: 'Rent & housing', icon: '⌂', color: '#4f6b55' },
  { key: 'bills', label: 'Bills', icon: 'ϟ', color: '#8b9b73' },
  { key: 'groceries', label: 'Groceries', icon: '✳', color: '#d2a65a' },
  { key: 'transport', label: 'Transport', icon: '↗', color: '#d88a69' },
  { key: 'subscriptions', label: 'Subscriptions', icon: '▤', color: '#a49ac4' },
  { key: 'leisure', label: 'Fun & leisure', icon: '✧', color: '#d48cb0' },
  { key: 'shopping', label: 'Shopping', icon: '◇', color: '#82aaa3' },
  { key: 'savings', label: 'Savings & investing', icon: '↗', color: '#7195c0' },
  { key: 'miscellaneous', label: 'Miscellaneous', icon: '＋', color: '#a6a9a0' },
];
const money = n => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n) || 0);
const blankExpenses = Object.fromEntries(CATEGORIES.map(c => [c.key, '0']));
const blankPrefs = Object.fromEntries(CATEGORIES.filter(c => c.key !== 'miscellaneous').map(c => [c.key, 5]));

function App() {
  const [page, setPage] = useState('overview');
  const [income, setIncome] = useState('2500');
  const [period, setPeriod] = useState('monthly');
  const [prefs, setPrefs] = useState(blankPrefs);
  const [expenses, setExpenses] = useState({ ...blankExpenses, rent: '750', bills: '180', groceries: '250', transport: '100', subscriptions: '35', leisure: '150', shopping: '100', savings: '400', miscellaneous: '50' });
  const [suggestions, setSuggestions] = useState(null);
  const [toast, setToast] = useState('');
  const [expression, setExpression] = useState('');
  const [savedBudgets, setSavedBudgets] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const totalExpenses = useMemo(() => CATEGORIES.reduce((sum, c) => sum + Math.max(0, Number(expenses[c.key]) || 0), 0), [expenses]);
  const remaining = (Number(income) || 0) - totalExpenses;
  const budgetRows = CATEGORIES.map(c => ({ ...c, amount: Math.max(0, Number(expenses[c.key]) || 0) }));
  const totalPreference = Object.values(prefs).reduce((sum, v) => sum + Number(v || 0), 0);
  const allocation = suggestions || CATEGORIES.filter(c => c.key !== 'miscellaneous').map(c => ({ ...c, amount: totalPreference ? (Number(income || 0) * Number(prefs[c.key] || 0) / totalPreference) : 0, percent: totalPreference ? Number(prefs[c.key] || 0) / totalPreference * 100 : 0 }));

  async function saveBudget() {
    const payload = { income: Number(income), period, expenses: Object.fromEntries(Object.entries(expenses).map(([k,v]) => [k, Number(v)||0])), suggestions: allocation.map(({key,label,amount,percent}) => ({key,label,amount,percent})) };
    if (supabase && user) {
      const { error } = await supabase.from('budgets').insert({ user_id: user.id, income: payload.income, period, expenses: payload.expenses, suggestions: payload.suggestions });
      if (error) { setToast('Could not save to Supabase. Check your database setup.'); return; }
      setToast('Budget saved securely to your account.');
    } else {
      const next = [{ ...payload, id: Date.now(), created_at: new Date().toISOString() }, ...savedBudgets];
      setSavedBudgets(next);
      try { localStorage.setItem('budgie-budgets', JSON.stringify(next)); } catch {}
      setToast(hasSupabase ? 'Sign in to save across devices. Saved in this browser for now.' : 'Saved in this browser. Add Supabase keys to enable cloud storage.');
    }
    window.setTimeout(() => setToast(''), 4500);
  }

  useEffect(() => {
    try { const data = JSON.parse(localStorage.getItem('budgie-budgets') || '[]'); setSavedBudgets(data); } catch {}
  }, []);

  async function signIn() {
    if (!supabase) { setToast('Add your Supabase URL and anon key to enable sign in.'); window.setTimeout(() => setToast(''), 4500); return; }
    const email = window.prompt('Enter your email for a secure magic link:');
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setToast(error ? error.message : 'Check your email for your sign-in link.');
    window.setTimeout(() => setToast(''), 4500);
  }

  function suggest() {
    const incomeNum = Number(income);
    if (!Number.isFinite(incomeNum) || incomeNum <= 0) { setToast('Enter an income greater than £0 first.'); return; }
    if (!totalPreference) { setToast('Give at least one category a preference above zero.'); return; }
    setSuggestions(CATEGORIES.filter(c => c.key !== 'miscellaneous').map(c => ({ ...c, amount: incomeNum * Number(prefs[c.key] || 0) / totalPreference, percent: Number(prefs[c.key] || 0) / totalPreference * 100 })));
    setToast('Your personalised plan is ready.');
    window.setTimeout(() => setToast(''), 3000);
  }

  function calculate() {
    if (!expression.trim() || !/^[0-9+*/().%\s-]+$/.test(expression)) { setExpression(''); setToast('Use numbers and basic arithmetic operators only.'); window.setTimeout(() => setToast(''), 3000); return; }
    try {
      const result = Function('"use strict"; return (' + expression + ')')();
      if (!Number.isFinite(result)) throw new Error();
      setExpression(String(Math.round((result + Number.EPSILON) * 100000000) / 100000000));
    } catch { setToast('That calculation is not valid.'); window.setTimeout(() => setToast(''), 3000); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => setPage('overview')}><span className="brand-mark"><Leaf size={21}/></span><span>budgie<span className="brand-dot">.</span><small>YOUR MONEY, WITH A PLAN</small></span></button>
      <div className="side-label">WORKSPACE</div>
      <nav>
        <NavItem active={page === 'overview'} onClick={() => setPage('overview')} icon={<Wallet size={18}/>} label="Overview"/>
        <NavItem active={page === 'planner'} onClick={() => setPage('planner')} icon={<Sparkles size={18}/>} label="Budget planner"/>
        <NavItem active={page === 'checker'} onClick={() => setPage('checker')} icon={<ChartNoAxesCombined size={18}/>} label="Budget checker"/>
        <NavItem active={page === 'calculator'} onClick={() => setPage('calculator')} icon={<CalculatorIcon size={18}/>} label="Calculator"/>
      </nav>
      <div className="sidebar-bottom"><div className="mini-card"><span className="mini-icon"><PiggyBank size={19}/></span><strong>Small steps add up.</strong><p>A little plan today can give you more freedom tomorrow.</p></div><div className="profile-row"><div className="avatar">{user ? (user.email?.[0] || 'B').toUpperCase() : 'B'}</div><div><strong>{user ? user.email.split('@')[0] : 'Your workspace'}</strong><small>{user ? 'Synced account' : 'Personal finances'}</small></div><button className="icon-button profile-action" title={user ? 'Sign out' : 'Sign in'} onClick={async () => user ? await supabase.auth.signOut() : signIn()}>{user ? <RotateCcw size={16}/> : <ChevronRight size={16}/>}</button></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{({overview:'Overview',planner:'Budget planner',checker:'Budget checker',calculator:'Calculator'})[page]}</strong></div><div className="top-actions"><span className="status-dot"/><span className="status-text">{user ? 'Cloud sync on' : 'Your finances, your pace'}</span><button className="button button-dark button-small" onClick={saveBudget}><Save size={15}/> Save budget</button></div></header>
      {page === 'overview' && <Overview income={income} setIncome={setIncome} period={period} setPeriod={setPeriod} totalExpenses={totalExpenses} remaining={remaining} budgetRows={budgetRows} savedBudgets={savedBudgets} setPage={setPage} saveBudget={saveBudget}/>}
      {page === 'planner' && <section className="page"><PageHeading eyebrow="MADE FOR YOUR PRIORITIES" title="Build a budget that fits your life." subtitle="Tell Budgie what matters to you. We'll turn your priorities into a practical plan for your pay."/><div className="planner-grid"><div className="panel planner-form"><div className="panel-heading"><div><h3>Your take-home pay</h3><p>Use the amount that lands in your account.</p></div><span className="step-number">01</span></div><label className="field-label" htmlFor="income">Income amount (£)</label><div className="money-input"><span>£</span><input id="income" type="number" min="0.01" step="0.01" value={income} onChange={e => setIncome(e.target.value)}/></div><div className="field-label spaced">How often are you paid?</div><div className="segmented">{['weekly','monthly','annually'].map(p => <button key={p} className={period===p?'selected':''} onClick={() => setPeriod(p)}>{p[0].toUpperCase()+p.slice(1)}</button>)}</div><div className="panel-heading preference-heading"><div><h3>What matters most?</h3><p>Rate each category from 0 (not a priority) to 10 (very important).</p></div><span className="step-number">02</span></div>{CATEGORIES.filter(c => c.key !== 'miscellaneous').map(c => <div className="preference-row" key={c.key}><div className="category-icon" style={{'--category':c.color}}>{c.icon}</div><div className="preference-name">{c.label}</div><input aria-label={c.label+' priority'} className="range" type="range" min="0" max="10" value={prefs[c.key]} onChange={e => setPrefs({...prefs,[c.key]:Number(e.target.value)})}/><span className="range-value">{prefs[c.key]}</span></div>)}<button className="button button-green button-wide" onClick={suggest}><Sparkles size={17}/> Generate my budget</button></div><div className="panel result-panel"><div className="result-top"><span className="eyebrow">YOUR ALLOCATION</span><div className="result-illustration"><PiggyBank size={30}/></div><h2>{money(income)}</h2><p>{period} take-home pay</p></div><div className="allocation-list">{allocation.map(c => <div className="allocation-row" key={c.key}><div className="allocation-label"><span className="legend-dot" style={{background:c.color}}/>{c.label}<strong>{money(c.amount)}</strong></div><div className="progress-track"><span style={{width:Math.min(100,c.percent||0)+'%',background:c.color}}/></div><div className="allocation-meta"><span>{(c.percent||0).toFixed(1)}% of income</span><span>Priority {prefs[c.key] ?? 0}/10</span></div></div>)}</div><div className="result-note"><Sparkles size={17}/><p><strong>A guide, not a rule.</strong> These suggestions divide your pay according to your ratings. Make sure essentials are covered and adjust the plan to your real costs.</p></div></div></div></section>}
      {page === 'checker' && <section className="page"><PageHeading eyebrow="SEE THE WHOLE PICTURE" title="Where does your money go?" subtitle="Add what you spend in each category and see how much is left over. All amounts should match your selected pay period."/><div className="checker-grid"><div className="panel"><div className="panel-heading"><div><h3>Monthly money in & out</h3><p>Enter your actual spending below.</p></div><span className="step-number">£</span></div><label className="field-label">Income (£)</label><input className="text-input" type="number" min="0" value={income} onChange={e=>setIncome(e.target.value)}/><div className="expense-fields">{CATEGORIES.map(c=><label key={c.key} className="expense-field"><span>{c.label}</span><div className="compact-money"><span>£</span><input type="number" min="0" step=".01" value={expenses[c.key]} onChange={e=>setExpenses({...expenses,[c.key]:e.target.value})}/></div></label>)}</div><button className="button button-green button-wide" onClick={saveBudget}><Save size={16}/> Save this budget</button></div><div className="panel checker-summary"><span className="eyebrow">YOUR MONEY SNAPSHOT</span><h2>{money(remaining)}</h2><p className="muted">Money left this period</p><div className={'remaining-banner '+(remaining<0?'negative':'')}><span>{remaining<0?'Over budget':'Budget health'}</span><strong>{Number(income)>0?Math.round(remaining/Number(income)*100):0}% left</strong></div><div className="summary-line"><span>Income</span><strong>{money(income)}</strong></div><div className="summary-line"><span>Total spending & saving</span><strong>{money(totalExpenses)}</strong></div><div className="chart-title">Your spending breakdown</div><div className="bar-list">{budgetRows.filter(c=>c.amount>0).sort((a,b)=>b.amount-a.amount).map(c=><div className="bar-item" key={c.key}><div className="bar-label"><span>{c.label}</span><strong>{money(c.amount)}</strong></div><div className="progress-track"><span style={{width:Math.min(100,Number(income)>0?c.amount/Number(income)*100:0)+'%',background:c.color}}/></div></div>)}</div>{remaining<0&&<p className="warning">Your planned outgoings are higher than your income. Try adjusting a category before saving.</p>}</div></div></section>}
      {page === 'calculator' && <section className="page"><PageHeading eyebrow="QUICK MATHS, LESS FUSS" title="Your pocket calculator." subtitle="Work out bills, splits, savings targets or percentages without leaving your budget."/><div className="calculator-wrap panel"><div className="calculator-display"><span>CALCULATION</span><input aria-label="Calculator display" value={expression} onChange={e=>setExpression(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')calculate();if(e.key==='Escape')setExpression('')}} placeholder="0"/></div><div className="calculator-grid">{['C','(',')','÷','7','8','9','×','4','5','6','−','1','2','3','+','±','0','.','='].map((key,i)=><button key={key} className={'calc-key '+(['÷','×','−','+','='].includes(key)?'operator':'')+' '+(key==='='?'equals':'')+' '+(key==='C'?'clear':'')} onClick={()=>{if(key==='C')setExpression('');else if(key==='=')calculate();else if(key==='±')setExpression(v=>v.startsWith('-')?v.slice(1):'-'+v);else setExpression(v=>v+({'÷':'/','×':'*','−':'-'}[key]||key))}}>{key}</button>)}</div><p className="muted calculator-hint">Tip: type an expression using your keyboard and press Enter to calculate.</p></div></section>}
      <footer className="footer"><span>Made with care, for your financial wellbeing.</span><span>Budgie © {new Date().getFullYear()}</span></footer>
    </main>
    {toast && <div className="toast" role="status"><Sparkles size={17}/>{toast}<button onClick={()=>setToast('')} aria-label="Dismiss notification">×</button></div>}
  </div>;
}

function NavItem({active,onClick,icon,label}) { return <button className={'nav-item '+(active?'active':'')} onClick={onClick}>{icon}<span>{label}</span>{active&&<span className="nav-active-mark"/>}</button>; }
function PageHeading({eyebrow,title,subtitle}) { return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>; }
function Overview({income,setIncome,period,setPeriod,totalExpenses,remaining,budgetRows,savedBudgets,setPage,saveBudget}) {
  const spent = Number(income)>0 ? Math.min(100,totalExpenses/Number(income)*100) : 0;
  return <section className="page"><div className="welcome-row"><div><span className="eyebrow">YOUR FINANCIAL HOME</span><h1>A little more clarity.<br/><em>A lot more possibility.</em></h1><p>Make your money work for the life you want.</p></div><div className="welcome-art"><div className="art-sun"/><div className="art-plant">✳</div><div className="art-coin">£</div><div className="art-pot"><Leaf size={42}/></div></div></div><div className="overview-top-grid"><div className="panel income-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR TAKE-HOME PAY</span><h3>Start with what comes in.</h3></div><div className="stat-icon green"><Wallet size={19}/></div></div><div className="money-input overview-income"><span>£</span><input aria-label="Take-home income" type="number" min="0" value={income} onChange={e=>setIncome(e.target.value)}/></div><div className="segmented">{['weekly','monthly','annually'].map(p=><button key={p} className={period===p?'selected':''} onClick={()=>setPeriod(p)}>{p[0].toUpperCase()+p.slice(1)}</button>)}</div><button className="text-link" onClick={()=>setPage('planner')}>Personalise your plan <ChevronRight size={15}/></button></div><div className="stat-card balance-card"><div className="stat-card-top"><span>Left to work with</span><span className="stat-icon light"><CircleDollarSign size={19}/></span></div><h2>{money(remaining)}</h2><p>{remaining>=0?'Room for your next goal.':'Your outgoings are above income.'}</p><div className="balance-track"><span style={{width:Math.max(0,Math.min(100,Number(income)>0?remaining/Number(income)*100:0))+'%'}}/></div><div className="balance-foot"><span>Income {money(income)}</span><span>{Number(income)>0?Math.round(remaining/Number(income)*100):0}% remaining</span></div></div></div><div className="section-heading"><div><span className="eyebrow">THE BREAKDOWN</span><h2>Your money at a glance</h2></div><button className="text-link" onClick={()=>setPage('checker')}>Edit spending <ChevronRight size={15}/></button></div><div className="overview-bottom-grid"><div className="panel spending-panel"><div className="panel-heading"><div><h3>Spending plan</h3><p>What you're allocating across the month.</p></div><div className="stat-icon beige"><BarChart3 size={19}/></div></div><div className="spending-total"><strong>{money(totalExpenses)}</strong><span>of {money(income)}</span></div><div className="progress-track spending-total-track"><span style={{width:spent+'%'}}/></div><div className="category-overview">{budgetRows.filter(c=>c.amount>0).slice(0,6).map(c=><div className="category-overview-row" key={c.key}><span className="legend-dot" style={{background:c.color}}/><span>{c.label}</span><strong>{money(c.amount)}</strong></div>)}</div><button className="button button-outline button-wide" onClick={()=>setPage('checker')}>Review my budget <ChevronRight size={16}/></button></div><div className="panel goal-panel"><div className="goal-decoration"><span>✳</span><div className="goal-ring"><PiggyBank size={37}/></div></div><span className="eyebrow">A GOOD PLACE TO START</span><h3>Give every pound a purpose.</h3><p>Choose your priorities and build a budget around what matters to you, not someone else's rules.</p><button className="button button-green button-wide" onClick={()=>setPage('planner')}><Sparkles size={16}/> Build my budget</button><div className="goal-foot"><span><Plus size={14}/> Personalised to you</span><span>~ 5 min</span></div></div></div><div className="section-heading saved-heading"><div><span className="eyebrow">YOUR PROGRESS</span><h2>Saved budgets</h2></div><button className="text-link" onClick={saveBudget}><Save size={15}/> Save current</button></div>{savedBudgets.length===0?<div className="empty-state"><span className="empty-icon"><PiggyBank size={23}/></span><div><strong>Your first budget starts here.</strong><p>Save a snapshot to keep track of your plans over time.</p></div><button className="button button-outline button-small" onClick={saveBudget}>Save a budget</button></div>:<div className="saved-list">{savedBudgets.slice(0,3).map(b=><div className="saved-item" key={b.id}><div className="saved-icon"><Save size={17}/></div><div><strong>{new Date(b.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} budget</strong><small>{b.period} · {Object.values(b.expenses||{}).reduce((a,v)=>a+(Number(v)||0),0)===0?'Plan created':'Spending recorded'}</small></div><strong>{money(b.income)}</strong></div>)}</div>}</section>;
}

export default App;