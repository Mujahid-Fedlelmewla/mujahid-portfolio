import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, ArrowRight, BookOpen, Code2, Folder, Globe2, HardDrive, Info, Mail, Maximize2, Menu, Minus, MonitorCog, Network, PanelTop, Search, ShieldCheck, SquareTerminal, TerminalSquare, X } from 'lucide-react'
import './App.css'
import './environments.css'
import { useWindowManager, type AppId, type ManagedWindow } from './hooks/useWindowManager'
import { projects } from './data/projects'
import { profile } from './data/profile'
import { skillGroups } from './data/skills'

type AppDefinition = { id: AppId; name: string; subtitle: string; icon: typeof Info }
type DesktopEnvironment = 'cosmic' | 'openbox' | 'xfce'
const desktopEnvironments: { id: DesktopEnvironment; name: string; label: string; description: string }[] = [
  { id: 'cosmic', name: 'Cosmic Konsole', label: 'Konsole', description: 'Deep-space wallpaper with a focused terminal workspace.' },
  { id: 'openbox', name: 'Openbox Slate', label: 'Openbox', description: 'A calm charcoal workstation with cool mountain tones.' },
  { id: 'xfce', name: 'Xfce Botanical', label: 'Xfce', description: 'A dark botanical desktop with warm, expressive accents.' },
]
const apps: AppDefinition[] = [
  { id: 'about', name: 'About Me', subtitle: 'Profile and professional introduction', icon: Info },
  { id: 'projects', name: 'Projects', subtitle: 'Selected work and technical explorations', icon: Code2 },
  { id: 'security', name: 'Security Center', subtitle: 'Skills and areas of study', icon: ShieldCheck },
  { id: 'writeups', name: 'Research & Writeups', subtitle: 'Technical notes and learning log', icon: BookOpen },
  { id: 'certifications', name: 'Learning', subtitle: 'Courses and verified credentials', icon: MonitorCog },
  { id: 'files', name: 'Dolphin', subtitle: 'Browse the portfolio home directory', icon: Folder },
  { id: 'terminal', name: 'Konsole', subtitle: 'A safe simulated Linux terminal', icon: TerminalSquare },
  { id: 'system', name: 'System Information', subtitle: 'About this portfolio environment', icon: Activity },
  { id: 'contact', name: 'Contact', subtitle: 'Professional links and contact details', icon: Mail },
]
const terminalIntro = [
  '                         ◢█████◣       mujahid@arch',
  '                        ◢██░░░██◣      ─────────────',
  '                       ◢██░░░░░██◣     OS: Arch Linux · simulated',
  '                      ◢██░░░░░░░██◣    DE: KDE Plasma inspired',
  '                     ◢██░░░░░░░░░██◣   Shell: Konsole',
  '                    ◢██░░░░░░░░░░░██◣  Focus: Cybersecurity & systems',
  '',
  '  Portfolio workspace ready. Type help to explore.',
]

function App() {
  const windows = useWindowManager((state) => state.windows)
  const setWindows = useWindowManager((state) => state.setWindows)
  const [top, setTop] = useState(2)
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [environmentOpen, setEnvironmentOpen] = useState(false)
  const [desktopEnvironment, setDesktopEnvironment] = useState<DesktopEnvironment>(() => {
    const saved = window.localStorage.getItem('mujahid-desktop-environment')
    return saved === 'openbox' || saved === 'xfce' || saved === 'cosmic' ? saved : 'cosmic'
  })
  const [query, setQuery] = useState('')
  const [time, setTime] = useState(() => new Date())
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalLines, setTerminalLines] = useState(terminalIntro)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [folder, setFolder] = useState('/home/mujahid')
  const terminalRef = useRef<HTMLInputElement>(null)
  const drag = useRef<{ id: AppId; x: number; y: number } | null>(null)

  useEffect(() => {
    const interval = window.setInterval(() => setTime(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])
  useEffect(() => {
    window.localStorage.setItem('mujahid-desktop-environment', desktopEnvironment)
  }, [desktopEnvironment])
  useEffect(() => {
    setWindows((existing) => existing.length ? existing : [{
      id: 'terminal', z: 2, x: Math.max(20, Math.round((window.innerWidth - 560) / 2)), y: Math.max(62, Math.round((window.innerHeight - 338) / 2) - 14), w: 560, h: 338, minimized: true,
    }])
  }, [setWindows])
  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!drag.current) return
      const activeDrag = drag.current
      setWindows((current) => current.map((item) => item.id === activeDrag.id
        ? { ...item, x: Math.max(0, event.clientX - activeDrag.x), y: Math.max(28, event.clientY - activeDrag.y) }
        : item))
    }
    const stop = () => { drag.current = null }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', stop)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', stop) }
  }, [setWindows])

  const appFor = (id: AppId) => apps.find((app) => app.id === id)!
  const focus = (id: AppId) => {
    setTop((value) => value + 1)
    setWindows((current) => current.map((item) => item.id === id ? { ...item, minimized: false, z: top + 1 } : item))
  }
  const open = (id: AppId) => {
    setLauncherOpen(false)
    if (windows.some((item) => item.id === id)) return focus(id)
    setTop((value) => value + 1)
    const terminal = id === 'terminal'
    const fileWindowWidth = Math.min(1100, window.innerWidth - 52)
    setWindows((current) => [...current, {
      id, z: top + 1,
      x: terminal ? Math.max(20, Math.round((window.innerWidth - 560) / 2)) : id === 'files' ? Math.max(26, Math.round((window.innerWidth - fileWindowWidth) / 2)) : Math.max(42, Math.min(window.innerWidth - 720, 150 + current.length * 26)),
      y: terminal ? Math.max(62, Math.round((window.innerHeight - 338) / 2) - 14) : id === 'files' ? 42 : 82 + current.length * 18,
      w: terminal ? 560 : id === 'files' ? fileWindowWidth : 700,
      h: terminal ? 338 : id === 'files' ? Math.min(680, window.innerHeight - 96) : 500,
    }])
  }
  const close = (id: AppId) => setWindows((current) => current.filter((item) => item.id !== id))
  const minimize = (id: AppId) => setWindows((current) => current.map((item) => item.id === id ? { ...item, minimized: true } : item))
  const maximize = (id: AppId) => setWindows((current) => current.map((item) => item.id === id ? { ...item, maximized: !item.maximized } : item))
  const runTerminal = (value: string) => {
    const command = value.trim().toLowerCase()
    if (!command) return
    const responses: Record<string, string[]> = {
      help: ['Commands: help, whoami, about, skills, projects, education, certifications, contact, clear, neofetch, uname, ls, pwd, date'],
      whoami: ['mujahid — computer science background · cybersecurity learner'],
      about: [profile.introduction],
      skills: ['Linux administration · networking fundamentals · Python · security research', 'Open Security Center for the complete learning map.'],
      projects: ['Project Atlas  |  Linux Workstation Notes  |  Network Lab', 'Examples are marked as placeholders until replaced with real work.'],
      education: [profile.background],
      certifications: ['No verified certifications have been listed yet.'],
      contact: ['Contact details are placeholders until added to src/data/profile.ts.'],
      neofetch: terminalIntro.slice(0, 6),
      uname: ['Linux arch-workspace 6.x x86_64 (simulated)'],
      ls: ['Documents/  Projects/  Research/  Writeups/  Certifications/  About.txt'],
      pwd: ['/home/mujahid'],
      date: [new Date().toString()],
    }
    if (command === 'clear') setTerminalLines([])
    else setTerminalLines((current) => [...current, 'mujahid@arch:~$ ' + value, ...(responses[command] ?? ['zsh: command not found: ' + command])])
    setHistory((current) => [...current, value])
    setHistoryIndex(-1)
    setTerminalInput('')
  }
  const filteredApps = useMemo(() => apps.filter((app) => (app.name + ' ' + app.subtitle).toLowerCase().includes(query.toLowerCase())), [query])
  const currentEnvironment = desktopEnvironments.find((item) => item.id === desktopEnvironment)!

  return <main className={'plasma-desktop environment-' + desktopEnvironment} onClick={() => { if (launcherOpen) setLauncherOpen(false); if (environmentOpen) setEnvironmentOpen(false) }}>
    <div className="wallpaper" aria-hidden="true"><div className="sun" /><div className="mountain mountain-far" /><div className="mountain mountain-near" /><div className="ridge" /><div className="forest forest-left" /><div className="forest forest-right" /><div className="foreground" /></div>
    <header className="plasma-panel">
      <div className="panel-menu"><button className="panel-logo" onClick={() => setLauncherOpen(true)} aria-label="Open applications">A</button><b>{currentEnvironment.label}</b><span>File</span><span>Edit</span><span>View</span><span>Bookmarks</span><span>Settings</span><span>Help</span></div>
      <div className="panel-clock"><b>{time.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</b><i /><b>{time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</b></div>
      <div className="panel-status"><Network size={13} /><span>0.0 b/s</span><span>0.0 b/s</span><span className="volume">◖</span><span className="battery">▰</span><button onClick={() => setLauncherOpen((value) => !value)}><PanelTop size={15} /></button></div>
    </header>
    <div className="desktop-shortcuts"><button onDoubleClick={() => open('files')}><Folder size={27} /><span>Home</span></button><button onDoubleClick={() => open('projects')}><Code2 size={27} /><span>Projects</span></button><button onDoubleClick={() => open('about')}><Info size={27} /><span>About.txt</span></button></div>
    <section className="desktop-welcome"><span>MUJAHID ALI / CYBERSECURITY · LINUX · SYSTEMS</span><h1>Learning by<br /><em>building.</em></h1><p>{profile.introduction}</p><div className="welcome-actions"><button onClick={() => open('projects')}>Explore projects <ArrowRight size={14} /></button><button className="welcome-secondary" onClick={() => open('contact')}><Mail size={14} /> Get in touch</button></div></section>
    {windows.map((item) => {
      const app = appFor(item.id)
      return !item.minimized && <DesktopWindow key={item.id} item={item} app={app} onFocus={() => focus(item.id)} onDragStart={(event) => {
        const rect = event.currentTarget.parentElement!.getBoundingClientRect()
        drag.current = { id: item.id, x: event.clientX - rect.left, y: event.clientY - rect.top }
      }} onClose={() => close(item.id)} onMinimize={() => minimize(item.id)} onMaximize={() => maximize(item.id)}>
        {item.id === 'terminal'
          ? <Terminal lines={terminalLines} value={terminalInput} inputRef={terminalRef} onChange={setTerminalInput} onRun={runTerminal} history={history} historyIndex={historyIndex} onHistory={setHistoryIndex} />
          : <PortfolioApp id={item.id} selectedProject={selectedProject} setSelectedProject={setSelectedProject} folder={folder} setFolder={setFolder} open={open} />}
      </DesktopWindow>
    })}
    {launcherOpen && <section className="application-launcher" onClick={(event) => event.stopPropagation()}><div className="launcher-top"><div><span className="launcher-avatar">M</span><p><b>Mujahid Ali</b><small>Portfolio workspace</small></p></div><button onClick={() => setLauncherOpen(false)} aria-label="Close launcher"><X size={16} /></button></div><label className="launcher-search"><Search size={15} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications…" /></label><div className="launcher-list">{filteredApps.map((app) => { const Icon = app.icon; return <button key={app.id} onClick={() => open(app.id)}><Icon size={18} /><span><b>{app.name}</b><small>{app.subtitle}</small></span><ArrowRight size={14} /></button> })}</div></section>}
    {environmentOpen && <section className="environment-picker" onClick={(event) => event.stopPropagation()}><div className="environment-picker-heading"><div><span>WORKSPACE APPEARANCE</span><h2>Choose a desktop environment</h2></div><button onClick={() => setEnvironmentOpen(false)} aria-label="Close desktop environment selector"><X size={16} /></button></div><div className="environment-options">{desktopEnvironments.map((item) => <button className={'environment-option ' + item.id + (item.id === desktopEnvironment ? ' selected' : '')} key={item.id} onClick={() => { setDesktopEnvironment(item.id); setEnvironmentOpen(false) }}><span className="environment-preview"><i /><i /><i /></span><b>{item.name}</b><small>{item.description}</small><em>{item.id === desktopEnvironment ? 'ACTIVE' : 'APPLY'}</em></button>)}</div></section>}
    <nav className="plasma-dock" aria-label="Open portfolio applications"><button className="dock-launcher" onClick={(event) => { event.stopPropagation(); setLauncherOpen((value) => !value) }} title="Applications"><Menu size={20} /></button><i /><button onClick={() => open('files')} title="Dolphin"><Folder size={21} /></button><button onClick={() => open('projects')} title="Projects"><Code2 size={21} /></button><button onClick={() => open('terminal')} title="Konsole"><SquareTerminal size={21} /></button><button onClick={() => open('security')} title="Security Center"><ShieldCheck size={21} /></button><button onClick={() => open('contact')} title="Contact"><Globe2 size={21} /></button><i /><button className="environment-button" onClick={(event) => { event.stopPropagation(); setEnvironmentOpen((value) => !value) }} title="Change desktop environment"><MonitorCog size={20} /></button></nav>
  </main>
}

function DesktopWindow({ item, app, children, onFocus, onDragStart, onClose, onMinimize, onMaximize }: { item: ManagedWindow; app: AppDefinition; children: React.ReactNode; onFocus: () => void; onDragStart: (event: React.MouseEvent<HTMLDivElement>) => void; onClose: () => void; onMinimize: () => void; onMaximize: () => void }) {
  const Icon = app.icon
  const style = item.maximized ? { zIndex: item.z } : { zIndex: item.z, left: item.x, top: item.y, width: item.w, height: item.h }
  return <article className={'kde-window ' + (item.maximized ? 'maximized ' : '') + (item.id === 'terminal' ? 'konsole-window' : '')} style={style} onMouseDown={onFocus}><div className="kde-titlebar" onMouseDown={(event) => { if ((event.target as HTMLElement).closest('button')) return; onDragStart(event) }}><div className="window-title"><Icon size={14} /><span>{item.id === 'terminal' ? '~ : bash — Konsole' : app.name}</span></div><div className="window-controls"><button onClick={onMinimize} title="Minimize"><Minus size={13} /></button><button onClick={onMaximize} title="Maximize"><Maximize2 size={12} /></button><button onClick={onClose} title="Close"><X size={14} /></button></div></div><div className="window-body">{children}</div></article>
}

function Terminal({ lines, value, inputRef, onChange, onRun, history, historyIndex, onHistory }: { lines: string[]; value: string; inputRef: React.RefObject<HTMLInputElement | null>; onChange: (next: string) => void; onRun: (next: string) => void; history: string[]; historyIndex: number; onHistory: (next: number) => void }) {
  return <div className="konsole" onClick={() => inputRef.current?.focus()}><div className="konsole-output">{lines.map((line, index) => <div key={line + '-' + index} className={line.startsWith('mujahid@') ? 'command-line' : ''}>{line || ' '}</div>)}<label className="konsole-input"><span>mujahid@arch ~]$</span><input ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onRun(value); if (event.key === 'ArrowUp') { event.preventDefault(); const next = Math.max(0, historyIndex === -1 ? history.length - 1 : historyIndex - 1); onHistory(next); onChange(history[next] ?? '') } if (event.key === 'ArrowDown') { event.preventDefault(); const next = Math.min(history.length, historyIndex + 1); onHistory(next); onChange(history[next] ?? '') } }} aria-label="Terminal command" autoFocus /></label></div><footer>SAFE PORTFOLIO SIMULATION <span>Commands do not access a visitor’s computer.</span></footer></div>
}

function PortfolioApp({ id, selectedProject, setSelectedProject, folder, setFolder, open }: { id: AppId; selectedProject: string | null; setSelectedProject: (value: string | null) => void; folder: string; setFolder: (value: string) => void; open: (id: AppId) => void }) {
  if (id === 'about') return <AppPage eyebrow="PROFILE / ABOUT" title={profile.name} subtitle="Computer science · Cybersecurity · Linux"><div className="about-layout"><div><p className="lead">{profile.introduction}</p><p>This portfolio is a practical record of a technical journey: systems explored carefully, skills developed through practice, and work documented with context.</p></div><aside><span>FOCUS</span><b>Security through practice</b><span>WORKSTATION</span><b>Linux & open source</b><span>STATUS</span><b>Learning in public</b></aside></div></AppPage>
  if (id === 'projects') return <AppPage eyebrow="PORTFOLIO / PROJECTS" title="Selected work & ideas." subtitle="Built work is linked directly. Planned projects are labeled clearly as ideas in progress."><div className="project-path">~/portfolio/projects <span>{projects.length.toString().padStart(2, '0')} items</span></div><div className="project-grid">{projects.map((project, index) => <button className={'project-card ' + (selectedProject === project.name ? 'selected' : '')} key={project.name} onClick={() => setSelectedProject(selectedProject === project.name ? null : project.name)}><span>0{index + 1} / {project.status}</span><h3>{project.name}</h3><small>{project.kind}</small><p>{project.desc}</p><div>{project.tags.map((tag) => <i key={tag}>{tag}</i>)}</div></button>)}</div>{selectedProject && (() => { const project = projects.find((item) => item.name === selectedProject); return project?.repository ? <div className="notice"><Info size={15} /><span><b>{project.name}</b> — view the <a href={project.repository} target="_blank" rel="noreferrer">source repository</a>.</span></div> : <div className="notice"><Info size={15} /><span><b>{selectedProject}</b> is a planned idea. Details will be added as the work takes shape.</span></div> })()}</AppPage>
  if (id === 'security') return <AppPage eyebrow="SYSTEM / SECURITY CENTER" title="Skills, in context." subtitle="Topics are shown as current areas of study, not claims of professional proficiency."><div className="skill-grid">{skillGroups.map((group, index) => <section key={group.name}><span>0{index + 1}</span><h3>{group.name}</h3>{group.items.map((skill) => <p key={skill}>• {skill}</p>)}</section>)}</div></AppPage>
  if (id === 'writeups') return <AppPage eyebrow="RESEARCH / WRITEUPS" title="Notes from the lab." subtitle="A library for clear, ethical research notes and lessons learned."><div className="empty-panel"><BookOpen size={28} /><h3>Research library ready.</h3><p>No writeups have been added yet. Example content is intentionally marked as a placeholder until real research is ready to publish.</p></div></AppPage>
  if (id === 'certifications') return <AppPage eyebrow="LEARNING / CREDENTIALS" title="Learning, documented." subtitle="Only verified training and credentials are listed here."><div className="credential-row"><div><span>COMPLETED</span><b>—</b></div><div><span>IN PROGRESS</span><b>—</b></div><div><span>LAST UPDATED</span><b>Not listed</b></div></div><div className="empty-panel compact"><MonitorCog size={25} /><h3>No certifications listed.</h3><p>Add verified courses and certification dates in <code>src/data/certifications.ts</code>.</p></div></AppPage>
  if (id === 'files') return <FileManager folder={folder} setFolder={setFolder} open={open} />
  if (id === 'contact') return <AppPage eyebrow="CONNECTIONS / CONTACT" title="Let's connect." subtitle="Follow my work and get in touch through GitHub."><div className="contact-grid">{profile.github && <a className="contact-link" href={profile.github} target="_blank" rel="noreferrer"><Code2 size={21} /><b>GitHub</b><span>Browse my repositories and current work <ArrowRight size={13} /></span></a>}{profile.linkedin && <a className="contact-link" href={profile.linkedin} target="_blank" rel="noreferrer"><Globe2 size={21} /><b>LinkedIn</b><span>Connect with me professionally <ArrowRight size={13} /></span></a>}{profile.email && <a className="contact-link" href={'mailto:' + profile.email}><Mail size={21} /><b>Email</b><span>{profile.email} <ArrowRight size={13} /></span></a>}</div></AppPage>
  return <AppPage eyebrow="SYSTEM / INFORMATION" title="Arch workspace." subtitle="A portfolio environment inspired by a personalized KDE Plasma desktop."><div className="system-list"><div><span>Operating system</span><b>Arch Linux inspired</b></div><div><span>Desktop environment</span><b>KDE Plasma inspired</b></div><div><span>Session</span><b>Portfolio mode · simulated</b></div><div><span>Focus</span><b>Cybersecurity & systems</b></div></div></AppPage>
}

function AppPage({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) { return <section className="app-page"><header><span>{eyebrow}</span><h2>{title}</h2><p>{subtitle}</p></header>{children}</section> }

function FileManager({ folder, setFolder, open }: { folder: string; setFolder: (folder: string) => void; open: (id: AppId) => void }) {
  const [view, setView] = useState<'overview' | 'files'>('overview')
  const [active, setActive] = useState('Home')
  const contentRef = useRef<HTMLElement>(null)
  useEffect(() => { contentRef.current?.scrollTo({ top: 0 }) }, [view])
  const locations = [
    { label: 'Home  (~)', icon: HardDrive, id: 'home', app: undefined },
    { label: 'Projects', icon: Folder, id: 'projects', app: 'projects' as AppId },
    { label: 'Security Center', icon: ShieldCheck, id: 'security', app: 'security' as AppId },
    { label: 'Research', icon: BookOpen, id: 'research', app: 'writeups' as AppId },
    { label: 'Learning', icon: MonitorCog, id: 'learning', app: 'certifications' as AppId },
    { label: 'About.txt', icon: Info, id: 'about', app: 'about' as AppId },
    { label: 'Contact', icon: Mail, id: 'contact', app: 'contact' as AppId },
  ]
  const files = [
    { name: 'Projects/', type: 'Folder', icon: Folder, action: 'projects' as AppId },
    { name: 'Security Center/', type: 'Folder', icon: ShieldCheck, action: 'security' as AppId },
    { name: 'Research & Writeups/', type: 'Folder', icon: BookOpen, action: 'writeups' as AppId },
    { name: 'Learning/', type: 'Folder', icon: MonitorCog, action: 'certifications' as AppId },
    { name: 'About.txt', type: 'Text document', icon: Info, action: 'about' as AppId },
    { name: 'Contact.md', type: 'Text document', icon: Mail, action: 'contact' as AppId },
  ]
  const selectLocation = (location: typeof locations[number]) => {
    setActive(location.id === 'home' ? 'Home' : location.label)
    if (location.id === 'home') {
      setFolder('/home/mujahid')
      setView('overview')
      return
    }
    setFolder('/home/mujahid/' + location.id)
    if (location.app) open(location.app)
  }
  return <section className="portfolio-explorer">
    <header className="explorer-titlebar"><div><Folder size={16} /><b>Portfolio Explorer — {profile.name}</b></div><div className="explorer-controls"><span /><span /><span /></div></header>
    <div className="explorer-toolbar"><button onClick={() => { setFolder('/home/mujahid'); setView('overview'); setActive('Home') }}>⌂</button><span>home</span><ArrowRight size={12} /><span>mujahid</span><ArrowRight size={12} /><b>{view === 'overview' ? 'Overview' : folder.split('/').at(-1)}</b><div className="explorer-view-actions"><button className={view === 'overview' ? 'selected' : ''} onClick={() => setView('overview')}>Overview</button><button className={view === 'files' ? 'selected' : ''} onClick={() => setView('files')}>Files</button></div></div>
    <div className="explorer-body">
      <aside className="explorer-sidebar"><span>PLACES</span>{locations.map((location) => { const Icon = location.icon; return <button className={active === (location.id === 'home' ? 'Home' : location.label) ? 'selected' : ''} key={location.id} onClick={() => selectLocation(location)}><Icon size={16} />{location.label}</button> })}<span className="explorer-muted">PORTFOLIO</span><button onClick={() => open('terminal')}><TerminalSquare size={16} />Konsole</button><button onClick={() => setView('files')}><Folder size={16} />Workspace files</button></aside>
      <main className="explorer-content" ref={contentRef}>
        {view === 'overview'
          ? <><section className="portfolio-hero"><div className="hero-copy"><div className="availability"><i /> CURRENTLY BUILDING <span>•</span> {profile.background.toUpperCase()}</div><p className="hero-greeting">Hello, I’m</p><h2>{profile.name}</h2><h3>Cybersecurity <i>·</i> Linux <i>·</i> Systems</h3><p>{profile.introduction}</p><div className="hero-actions"><button onClick={() => open('projects')}>View selected projects <ArrowRight size={15} /></button><button onClick={() => setView('files')}><Folder size={15} /> Browse files</button><button onClick={() => open('contact')}><Mail size={15} /> Contact</button></div></div><div className="hero-monogram"><span>M</span><small>~/mujahid</small></div></section>
            <section className="focus-section"><div><span>AT A GLANCE</span><h3>What I am exploring</h3></div><small>profile_summary.md</small></section>
            <section className="focus-cards"><article><ShieldCheck size={21} /><h4>Security foundations</h4><p>Defensive security, network analysis, vulnerability research, and safe lab practice.</p></article><article><HardDrive size={21} /><h4>Linux & systems</h4><p>Arch Linux, administration, Bash, and system hardening as ongoing areas of study.</p></article><article><Code2 size={21} /><h4>Software & scripting</h4><p>Growing practical fluency in Python, JavaScript, TypeScript, Java, and SQL.</p></article></section>
            <button className="classic-view" onClick={() => setView('files')}><span><b>Want the full workspace view?</b><small>Browse the portfolio as files, folders, and safe terminal commands.</small></span>Open file view <ArrowRight size={14} /></button></>
          : <section className="explorer-files"><div className="files-heading"><span>Name</span><span>Type</span><span>Open with</span></div>{files.map((file) => { const Icon = file.icon; return <button key={file.name} onDoubleClick={() => open(file.action)} onClick={() => setActive(file.name)}><span><Icon size={17} />{file.name}</span><small>{file.type}</small><em>Open</em></button> })}<p>Double-click a folder or document to open its portfolio section.</p></section>}
      </main>
    </div>
  </section>
}
export default App
