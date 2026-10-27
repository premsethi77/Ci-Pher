import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, GitCompareArrows, Bookmark, BookmarkCheck, Github, Package, Scale,
  ExternalLink, ArrowUpRight, Activity, MessageCircle, BookOpen, Zap, ShieldCheck,
  Star, GitFork, Clock3, ChevronDown, X, LoaderCircle, Check, Plus, SlidersHorizontal
} from 'lucide-react';
import './style.css';

const API = {
  npm: name => `https://registry.npmjs.org/${encodeURIComponent(name)}`,
  github: q => `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=6`,
  bundle: name => `https://bundlephobia.com/api/size?package=${encodeURIComponent(name)}`,
  hn: q => `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=5`,
  dev: q => `https://dev.to/api/articles?tag=${encodeURIComponent(q)}&per_page=5`
};
const pretty = n => n == null ? '—' : Intl.NumberFormat('en', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n);
const bytes = n => n == null ? '—' : n < 1024 ? `${n} B` : n < 1024*1024 ? `${(n/1024).toFixed(1)} kB` : `${(n/1024/1024).toFixed(2)} MB`;
const ago = date => { if (!date) return 'Unknown'; const d = Math.max(0, Date.now()-new Date(date).getTime()); const days=Math.floor(d/86400000); return days<1?'Today':days<30?`${days}d ago`:days<365?`${Math.floor(days/30)}mo ago`:`${Math.floor(days/365)}y ago`; };
const DEMO_PACKAGES = [
  {name:'react', description:'The library for web and native user interfaces', version:'19.2.0', weekly:26000000, license:'MIT', repo:'https://github.com/facebook/react', stars:240000, updated:'2026-10-18T00:00:00Z', keywords:['ui','frontend'], icon:'⚛️', score:96, size:4600, gzip:1900, issues:1200, deps:0, cdnHits:7800000},
  {name:'vite', description:'Next generation frontend tooling', version:'7.1.7', weekly:19000000, license:'MIT', repo:'https://github.com/vitejs/vite', stars:78000, updated:'2026-10-20T00:00:00Z', keywords:['build','frontend'], icon:'⚡', score:94, size:9800, gzip:3900, issues:540, deps:16, cdnHits:2400000},
  {name:'axios', description:'Promise based HTTP client for the browser and node.js', version:'1.12.2', weekly:58000000, license:'MIT', repo:'https://github.com/axios/axios', stars:108000, updated:'2026-10-14T00:00:00Z', keywords:['http','network'], icon:'🌐', score:93, size:34600, gzip:13800, issues:240, deps:0, cdnHits:4100000},
  {name:'lodash', description:'A modern JavaScript utility library delivering modularity, performance, and extras', version:'4.17.21', weekly:55000000, license:'MIT', repo:'https://github.com/lodash/lodash', stars:61000, updated:'2025-10-05T00:00:00Z', keywords:['utilities','javascript'], icon:'🧰', score:88, size:71000, gzip:24800, issues:320, deps:0, cdnHits:3700000},
  {name:'express', description:'Fast, unopinionated, minimalist web framework for Node.js', version:'5.1.0', weekly:32000000, license:'MIT', repo:'https://github.com/expressjs/express', stars:68000, updated:'2026-09-22T00:00:00Z', keywords:['node','backend'], icon:'🚏', score:91, size:21000, gzip:6500, issues:180, deps:30, cdnHits:1800000},
  {name:'zod', description:'TypeScript-first schema validation with static type inference', version:'4.1.12', weekly:27000000, license:'MIT', repo:'https://github.com/colinhacks/zod', stars:42000, updated:'2026-10-21T00:00:00Z', keywords:['typescript','validation'], icon:'🧩', score:95, size:58000, gzip:14500, issues:90, deps:0, cdnHits:1300000},
  {name:'dayjs', description:'2kB immutable date-time library alternative to Moment.js', version:'1.11.18', weekly:13000000, license:'MIT', repo:'https://github.com/iamkun/dayjs', stars:49000, updated:'2026-08-12T00:00:00Z', keywords:['date','time'], icon:'🗓️', score:90, size:7200, gzip:3000, issues:35, deps:0, cdnHits:900000},
  {name:'date-fns', description:'Modern JavaScript date utility library', version:'4.1.0', weekly:16000000, license:'MIT', repo:'https://github.com/date-fns/date-fns', stars:39000, updated:'2026-09-17T00:00:00Z', keywords:['date','time'], icon:'📅', score:92, size:28400, gzip:9800, issues:130, deps:0, cdnHits:1100000},
  {name:'typescript', description:'TypeScript is a language for application-scale JavaScript', version:'5.9.3', weekly:65000000, license:'Apache-2.0', repo:'https://github.com/microsoft/TypeScript', stars:105000, updated:'2026-10-19T00:00:00Z', keywords:['typescript','compiler'], icon:'🔷', score:97, size:0, gzip:0, issues:5600, deps:0, cdnHits:2900000}
];
const fallback = DEMO_PACKAGES;
const DEMO_COMMUNITY = [
  {objectID:'demo-hn-1',title:'Show HN: A tiny tool to understand JavaScript bundle costs',url:'https://news.ycombinator.com/',points:184,num_comments:67},
  {objectID:'demo-hn-2',title:'What I learned building faster frontend applications',url:'https://news.ycombinator.com/',points:126,num_comments:42},
  {objectID:'demo-hn-3',title:'The state of JavaScript tooling and package maintenance',url:'https://news.ycombinator.com/',points:98,num_comments:31},
  {objectID:'demo-hn-4',title:'Choosing dependencies: less is often more',url:'https://news.ycombinator.com/',points:74,num_comments:19}
];
const DEMO_ARTICLES = [
  {id:'demo-dev-1',title:'A practical guide to choosing npm packages',url:'https://dev.to/',reading_time_minutes:6,positive_reactions_count:142},
  {id:'demo-dev-2',title:'How to keep your JavaScript bundle lean',url:'https://dev.to/',reading_time_minutes:8,positive_reactions_count:98},
  {id:'demo-dev-3',title:'Type-safe APIs with modern TypeScript',url:'https://dev.to/',reading_time_minutes:5,positive_reactions_count:76},
  {id:'demo-dev-4',title:'Dependency maintenance: what to check before installing',url:'https://dev.to/',reading_time_minutes:7,positive_reactions_count:121}
];
const demoPackage = name => DEMO_PACKAGES.find(p=>p.name.toLowerCase()===String(name||'').trim().toLowerCase());
const demoNpm = p => p ? {name:p.name,description:p.description,license:p.license,repository:{type:'git',url:p.repo},'dist-tags':{latest:p.version},time:{modified:p.updated},versions:{[p.version]:{dependencies:Object.fromEntries(Array.from({length:p.deps||0},(_,i)=>[`demo-dependency-${i+1}`,'*']))}}} : null;
const demoBundle = p => p ? {size:p.size,gzip:p.gzip} : null;
const demoGithub = p => p ? {name:p.name,full_name:p.repo.replace('https://github.com/',''),html_url:p.repo,stargazers_count:p.stars,open_issues_count:p.issues,updated_at:p.updated} : null;

function App(){
  const [tab,setTab]=useState('Discover');
  const [query,setQuery]=useState('');
  const [results,setResults]=useState(fallback);
  const [busy,setBusy]=useState(false);
  const [demoMode,setDemoMode]=useState(true);
  const [notice,setNotice]=useState('');
  const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem('devscope-saved')||'[]')}catch{return []}});
  const [compare,setCompare]=useState(['date-fns','dayjs']);
  const [compareData,setCompareData]=useState({});
  const [compareBusy,setCompareBusy]=useState(false);
  const [hn,setHn]=useState(DEMO_COMMUNITY);
  const [articles,setArticles]=useState(DEMO_ARTICLES);
  const [activePackage,setActivePackage]=useState(null);
  const [details,setDetails]=useState(null);
  const [detailBusy,setDetailBusy]=useState(false);
  const [filter,setFilter]=useState('All');
  const interestOptions=[['Frontend apps','Layers','react'],['APIs & backend','Workflow','api'],['TypeScript','Braces','typescript'],['Performance','Gauge','performance'],['Testing & quality','ShieldCheck','testing'],['AI tools','Sparkles','ai']];
  const [interests,setInterests]=useState(()=>{try{return JSON.parse(localStorage.getItem('devscope-interests')||'[]')}catch{return []}});
  const [showWelcome,setShowWelcome]=useState(()=>localStorage.getItem('devscope-welcomed')!=='yes');
  useEffect(()=>{localStorage.setItem('devscope-saved',JSON.stringify(saved))},[saved]);
  useEffect(()=>{if(!showWelcome)loadCommunity(interests[0]||'javascript')},[]);
  function finishWelcome(){localStorage.setItem('devscope-welcomed','yes');localStorage.setItem('devscope-interests',JSON.stringify(interests));setShowWelcome(false);const topic=interestOptions.find(([label])=>label===interests[0])?.[2]||'javascript';loadCommunity(topic);if(interests.length){setQuery(topic);}}
  function toggleInterest(value){setInterests(old=>old.includes(value)?old.filter(x=>x!==value):[...old,value])}
  async function loadCommunity(q){
    const [h,d]=await Promise.allSettled([fetch(API.hn(q)).then(r=>r.ok?r.json():Promise.reject()),fetch(API.dev(q)).then(r=>r.ok?r.json():Promise.reject())]);
    if(h.status==='fulfilled'&&(h.value.hits||[]).length)setHn(h.value.hits); else setHn(DEMO_COMMUNITY);
    if(d.status==='fulfilled'&&Array.isArray(d.value)&&d.value.length)setArticles(d.value); else setArticles(DEMO_ARTICLES);
  }
  async function search(e){
    e?.preventDefault(); const q=query.trim(); if(!q)return;
    setBusy(true);setNotice('');
    if(demoMode){
      const normalized=q.toLowerCase();
      const matched=DEMO_PACKAGES.filter(p=>`${p.name} ${p.description} ${p.keywords.join(' ')}`.toLowerCase().includes(normalized));
      setResults(matched.length?matched:DEMO_PACKAGES);
      setNotice(matched.length?`Demo dataset · ${matched.length} matching packages · all insights are populated for presentation`:'No exact demo match; showing the complete demo catalogue. Try react, axios, lodash, vite, express, zod, dayjs, date-fns, or typescript.');
      setBusy(false);return;
    }
    try {
      const [npmRes,ghRes]=await Promise.allSettled([
        fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=12`).then(r=>{if(!r.ok)throw Error('npm search unavailable');return r.json()}),
        fetch(API.github(q)).then(r=>{if(!r.ok)throw Error('GitHub rate limit reached');return r.json()})
      ]);
      let ghItems=ghRes.status==='fulfilled'?(ghRes.value.items||[]):[];
      const ghByName={}; ghItems.forEach(g=>{const n=g.name.toLowerCase();ghByName[n]=g;ghByName[(g.full_name||'').split('/').pop()?.toLowerCase()]=g});
      if(npmRes.status==='fulfilled'){
        const items=(npmRes.value.objects||[]).map(({package:p})=>{
          const g=ghByName[p.name?.toLowerCase()]||ghByName[p.name?.split('/').pop()?.toLowerCase()];
          return {name:p.name,description:p.description||'No description provided',version:p.version,weekly:p.downloads||null,license:p.license||'Unknown',repo:p.links?.repository||g?.html_url||'',stars:g?.stargazers_count||null,updated:p.date||null,keywords:p.keywords||[],icon:'📦'};
        });
        setResults(items.length?items:fallback);setNotice(items.length?`Found ${items.length} packages${ghRes.status==='rejected'?' · repository signals temporarily unavailable':''}`:'No packages found. Showing popular packages.');
      } else { setResults(fallback);setNotice('Live package data is unavailable right now. Showing starter packages instead.'); }
    } catch {setResults(fallback);setNotice('Could not reach the APIs. Check your connection and try again.')}
    finally{setBusy(false)}
  }
  function toggleSaved(name){setSaved(old=>old.includes(name)?old.filter(x=>x!==name):[...old,name])}
  async function openDetails(pkg){
    setActivePackage(pkg);setDetails(null);setDetailBusy(true);
    if(demoMode){const p=demoPackage(pkg.name)||pkg;setDetails({npm:demoNpm(p),bundle:demoBundle(p),cdn:{hits:{total:p.cdnHits}},github:demoGithub(p),demo:true});setDetailBusy(false);return;}
    const repoSlug=(pkg.repo||'').replace(/^git\+|\.git$/g,'').match(/github\.com\/([^/]+\/[^/?#]+)/i)?.[1];
    const tasks=[
      fetch(API.npm(pkg.name)).then(r=>r.ok?r.json():Promise.reject()),
      fetch(API.bundle(pkg.name)).then(r=>r.ok?r.json():Promise.reject()),
      fetch(`https://data.jsdelivr.com/v1/package/npm/${encodeURIComponent(pkg.name)}/stats`).then(r=>r.ok?r.json():Promise.reject()),
      repoSlug?fetch(`https://api.github.com/repos/${repoSlug}`).then(r=>r.ok?r.json():Promise.reject()):Promise.reject()
    ];
    const values=await Promise.allSettled(tasks);
    setDetails({npm:values[0].status==='fulfilled'?values[0].value:null,bundle:values[1].status==='fulfilled'?values[1].value:null,cdn:values[2].status==='fulfilled'?values[2].value:null,github:values[3].status==='fulfilled'?values[3].value:null});
    setDetailBusy(false);
  }
  async function runCompare(){
    setCompareBusy(true);
    const names=compare.map(x=>x.trim()).filter(Boolean).slice(0,2);
    const out={};
    if(demoMode){names.forEach(name=>{const p=demoPackage(name);out[name]={name,npm:demoNpm(p),bundle:demoBundle(p),github:demoGithub(p),demo:true};});setCompareData(out);setCompareBusy(false);return;}
    await Promise.all(names.map(async name=>{
      const [npm,bundle]=await Promise.allSettled([fetch(API.npm(name)).then(r=>{if(!r.ok)throw Error();return r.json()}),fetch(API.bundle(name)).then(r=>{if(!r.ok)throw Error();return r.json()})]);
      let repo=null,gh=null;
      if(npm.status==='fulfilled'){
        const raw=npm.value.repository?.url||'';const slug=raw.replace(/^git\+|\.git$/g,'').match(/github\.com[:/]([^/]+\/[^/?#]+)/i)?.[1];
        if(slug)try{gh=await fetch(`https://api.github.com/repos/${slug}`).then(r=>r.ok?r.json():null)}catch{}
      }
      out[name]={name,npm:npm.status==='fulfilled'?npm.value:null,bundle:bundle.status==='fulfilled'?bundle.value:null,github:gh};
    }));
    setCompareData(out);setCompareBusy(false);
  }
  useEffect(()=>{runCompare()},[demoMode]);
  const visible=useMemo(()=>results.filter(p=>filter==='All'||(filter==='Saved'?saved.includes(p.name):filter==='Frontend'?p.keywords?.some(k=>/react|ui|frontend|css|web|vite/i.test(k)):filter==='TypeScript'?p.keywords?.some(k=>/typescript|type/i.test(k)) : true)),[results,filter,saved]);
  const score=p=>{let s=0;if(p.stars)s+=Math.min(35,Math.log10(p.stars+1)*7);if(p.weekly)s+=Math.min(35,Math.log10(p.weekly+1)*6);if(p.updated&&Date.now()-new Date(p.updated)<180*86400000)s+=20;if(p.license==='MIT'||p.license==='Apache-2.0')s+=10;return Math.min(99,Math.round(s))};
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Scale size={21}/></div><span>dev<span className="brand-light">scope</span></span><span className="beta">BETA</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{[['Discover',Search],['Compare',GitCompareArrows],['Shortlist',Bookmark],['Community',MessageCircle]].map(([name,Icon])=><button key={name} className={`nav-item ${tab===name?'active':''}`} onClick={()=>setTab(name)}><Icon size={17}/><span>{name}</span>{name==='Shortlist'&&saved.length>0&&<span className="nav-count">{saved.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="status-dot"/> <span>Your tool workspace</span><span className="status-label">READY</span><div className="sidebar-note">One place to evaluate the tools you depend on.</div><button className="focus-edit" onClick={()=>setShowWelcome(true)}>Edit your interests ↗</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{tab}</b></div><div className="top-right"><button className={`demo-toggle ${demoMode?'on':''}`} onClick={()=>{setDemoMode(v=>!v);setNotice(demoMode?'Live mode enabled. Package data will be fetched from public services.':'Demo mode enabled. Curated sample data keeps every feature populated for your presentation.')}}><span className="pulse"/>{demoMode?'Demo data ON':'Live data ON'}</button><div className="avatar">DS</div></div></header>
      <div className="content">
      {tab==='Discover'&&<>
        <section className="hero"><div className="eyebrow"><span className="eyebrow-line"/> DEVELOPER INTELLIGENCE</div><h1>Choose tools with<br/><span>confidence, not guesswork.</span></h1><p className="hero-copy">Search the ecosystem. Compare real-world signals. Make a decision you can explain.</p>
          <form className="searchbar" onSubmit={search}><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search packages, tools, or use cases…" aria-label="Search packages"/><kbd>ENTER ↵</kbd><button disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<ArrowUpRight size={17}/>}</button></form>
          <div className="search-hints"><span>TRY</span>{['date utilities','state management','schema validation','http client'].map(q=><button key={q} onClick={()=>{setQuery(q);setTimeout(()=>document.querySelector('.searchbar button')?.click(),0)}}>{q}</button>)}</div>
        </section>
        <section className="workflow-strip"><div><span className="workflow-step">01</span><strong>Find a fit</strong><small>Discover tools for your use case</small></div><ArrowUpRight size={17}/><div><span className="workflow-step">02</span><strong>Check the trade-offs</strong><small>Size, adoption, freshness and licensing</small></div><ArrowUpRight size={17}/><div><span className="workflow-step">03</span><strong>Make your shortlist</strong><small>Compare and keep your best options</small></div></section>
        <section className="section-head"><div><div className="eyebrow muted">THE ECOSYSTEM</div><h2>Popular packages</h2><p>{demoMode?'Presentation-ready examples with populated package signals.':'Explore useful building blocks, backed by available public signals.'}</p></div><button className="text-button" onClick={()=>{setQuery('javascript');setFilter('All');}}>Explore ecosystem <ArrowUpRight size={15}/></button></section>
        {notice&&<div className="notice">{notice}</div>}
        <div className="filter-row"><div className="filter-tabs">{['All','Frontend','TypeScript','Saved'].map(x=><button key={x} onClick={()=>setFilter(x)} className={filter===x?'selected':''}>{x}</button>)}</div><span className="result-count">{busy?'Searching…':`${visible.length} packages`}</span></div>
        <div className="package-grid">{visible.map((p,i)=><article className="package-card" key={p.name}><div className="card-top"><div className="package-icon">{p.icon||'📦'}</div><button className={`save-btn ${saved.includes(p.name)?'saved':''}`} title={saved.includes(p.name)?'Remove from shortlist':'Save to shortlist'} onClick={()=>toggleSaved(p.name)}>{saved.includes(p.name)?<BookmarkCheck size={17}/>:<Bookmark size={17}/>}</button></div><div className="package-title"><h3>{p.name}</h3><span className="version">v{p.version||'latest'}</span></div><p className="package-desc">{p.description}</p><div className="tag-row">{(p.keywords||[]).slice(0,2).map(k=><span className="tag" key={k}>{k}</span>)}<span className="tag license">{p.license||'License n/a'}</span></div><div className="card-metrics"><div><span>Weekly downloads</span><strong>{pretty(p.weekly)}</strong></div><div><span>Repo stars</span><strong>{pretty(p.stars)}</strong></div><div><span>Signal score</span><strong className="score">{score(p)}<small>/100</small></strong></div></div><button className="inspect-btn" onClick={()=>openDetails(p)}>Inspect package <ArrowUpRight size={15}/></button></article>)}</div>
        <section className="bottom-panels"><div className="panel"><div className="panel-heading"><div className="panel-icon orange"><MessageCircle size={17}/></div><div><h3>Developer conversations</h3><p>Fresh discussions from across the developer world</p></div><a href="https://news.ycombinator.com" target="_blank" rel="noreferrer"><ArrowUpRight size={16}/></a></div>{hn.slice(0,3).map((x,i)=><a className="feed-item" key={x.objectID||i} href={x.url||`https://news.ycombinator.com/item?id=${x.objectID}`} target="_blank" rel="noreferrer"><div><strong>{x.title}</strong><span>{pretty(x.points)} points · {x.num_comments||0} comments</span></div><ExternalLink size={14}/></a>)}{hn.length===0&&<div className="empty-small">Community stories will appear when the API responds.</div>}</div><div className="panel"><div className="panel-heading"><div className="panel-icon green"><BookOpen size={17}/></div><div><h3>Learn from the community</h3><p>Practical articles and tutorials</p></div><a href="https://dev.to" target="_blank" rel="noreferrer"><ArrowUpRight size={16}/></a></div>{articles.slice(0,3).map((x,i)=><a className="feed-item" key={x.id||i} href={x.url} target="_blank" rel="noreferrer"><div><strong>{x.title}</strong><span>{x.reading_time_minutes||'—'} min read · {x.positive_reactions_count||0} reactions</span></div><ExternalLink size={14}/></a>)}{articles.length===0&&<div className="empty-small">Articles will appear when the API responds.</div>}</div></section>
      </>}
      {tab==='Compare'&&<section className="page-section"><div className="eyebrow muted">MAKE THE TRADE-OFF VISIBLE</div><h1 className="page-title">Library <span>face-off.</span></h1><p className="page-intro">Compare two npm packages across size, adoption, maintenance signals, and licensing.</p><div className="compare-inputs">{compare.map((v,i)=><div className="compare-input" key={i}><label>PACKAGE {i+1}</label><input value={v} onChange={e=>setCompare(old=>old.map((x,j)=>i===j?e.target.value:x))} placeholder={i===0?'e.g. date-fns':'e.g. dayjs'}/></div>)}<button className="primary-btn" onClick={runCompare} disabled={compareBusy}>{compareBusy?<LoaderCircle className="spin" size={16}/>:<GitCompareArrows size={16}/>} Compare</button></div><div className="comparison-wrap">{compare.map((name,i)=>{const d=compareData[name];return <article className="comparison-card" key={i}><div className="comparison-card-top"><span className="compare-index">0{i+1}</span><span className="tag">{d?.npm?.license||'Package'}</span></div><h2>{name||'Package name'}</h2><p>{d?.npm?.description||'Package details are being gathered.'}</p><div className="compare-stat"><span><Zap size={15}/> Minified + gzip</span><b>{d?.bundle?bytes(d.bundle.gzip):'Unavailable'}</b></div><div className="compare-stat"><span><Package size={15}/> Latest version</span><b>{d?.npm?.['dist-tags']?.latest||'Unavailable'}</b></div><div className="compare-stat"><span><Star size={15}/> Repo stars</span><b>{d?.github?pretty(d.github.stargazers_count):'Unavailable'}</b></div><div className="compare-stat"><span><Activity size={15}/> Last published</span><b>{d?.npm?.time?.modified?ago(d.npm.time.modified):'Unavailable'}</b></div><div className="compare-stat"><span><ShieldCheck size={15}/> License</span><b>{d?.npm?.license||'Unknown'}</b></div><a className="inspect-btn link-btn" href={`https://www.npmjs.com/package/${encodeURIComponent(name)}`} target="_blank" rel="noreferrer">View package <ExternalLink size={14}/></a></article>})}</div><div className="caveat"><ShieldCheck size={18}/><div><strong>Signals, not verdicts.</strong><p>Bundle size and popularity are only part of the decision. Check your use case, compatibility, accessibility, release notes, and security advisories before adopting a dependency.</p></div></div></section>}
      {tab==='Shortlist'&&<section className="page-section"><div className="eyebrow muted">YOUR RESEARCH</div><h1 className="page-title">Saved <span>shortlist.</span></h1><p className="page-intro">A small decision log for packages worth a closer look. Saved locally in this browser.</p>{saved.length===0?<div className="empty-state"><Bookmark size={28}/><h3>No packages saved yet</h3><p>Go to Discover and tap the bookmark on any package to keep it here.</p><button className="primary-btn" onClick={()=>setTab('Discover')}>Discover packages <ArrowUpRight size={15}/></button></div>:<div className="saved-list">{saved.map(name=><div className="saved-row" key={name}><div className="package-icon">📦</div><div><strong>{name}</strong><span>Saved package</span></div><button className="small-btn" onClick={()=>{setCompare(old=>old[0]===name?old:[name,old[1]||'dayjs']);setTab('Compare')}}><GitCompareArrows size={15}/> Compare</button><button className="icon-btn" onClick={()=>toggleSaved(name)} aria-label={`Remove ${name}`}><X size={16}/></button></div>)}</div>}</section>}
      {tab==='Community'&&<section className="page-section"><div className="eyebrow muted">PEOPLE, NOT JUST NUMBERS</div><h1 className="page-title">Community <span>signals.</span></h1><p className="page-intro">A lightweight view of what developers are discussing and teaching.</p><div className="community-grid"><div className="panel"><div className="panel-heading"><div className="panel-icon orange"><MessageCircle size={17}/></div><div><h3>What developers discuss</h3><p>Developer discussions</p></div></div>{hn.map((x,i)=><a className="feed-item" key={x.objectID||i} href={x.url||`https://news.ycombinator.com/item?id=${x.objectID}`} target="_blank" rel="noreferrer"><div><strong>{x.title}</strong><span>{pretty(x.points)} points · {x.num_comments||0} comments</span></div><ExternalLink size={14}/></a>)}</div><div className="panel"><div className="panel-heading"><div className="panel-icon green"><BookOpen size={17}/></div><div><h3>Guides & tutorials</h3><p>Community tutorials</p></div></div>{articles.map((x,i)=><a className="feed-item" key={x.id||i} href={x.url} target="_blank" rel="noreferrer"><div><strong>{x.title}</strong><span>{x.reading_time_minutes||'—'} min read · {x.positive_reactions_count||0} reactions</span></div><ExternalLink size={14}/></a>)}</div></div><button className="secondary-btn" onClick={()=>loadCommunity(query||'javascript')}>Refresh community feeds <Activity size={15}/></button></section>}
      </div>
      <footer><span>DEVSCOPE <span className="footer-dot">·</span> BUILT FOR BETTER TECH DECISIONS</span><span>Public data · Verify before you depend</span></footer>
    </main>
    {showWelcome&&<div className="welcome-backdrop"><section className="welcome-card"><div className="welcome-orbit orbit-one"/><div className="welcome-orbit orbit-two"/><div className="welcome-brand"><div className="brand-mark"><Scale size={20}/></div><span>dev<span className="brand-light">scope</span></span></div><div className="eyebrow"><span className="eyebrow-line"/> YOUR DEVELOPER WORKSPACE</div><h2>What are you<br/><span>building lately?</span></h2><p>Pick a few interests. We'll shape your starting point around the problems you care about—not throw unrelated feeds at you.</p><div className="interest-options">{interestOptions.map(([label,IconName])=><button type="button" key={label} className={`interest-option ${interests.includes(label)?'chosen':''}`} onClick={()=>toggleInterest(label)}><span className="interest-check">{interests.includes(label)?<Check size={14}/>:<Plus size={14}/>}</span><span>{label}</span></button>)}</div><div className="welcome-actions"><button className="primary-btn welcome-submit" onClick={finishWelcome}>Personalize my workspace <ArrowUpRight size={16}/></button><button className="welcome-skip" onClick={()=>{setInterests([]);finishWelcome()}}>Skip for now</button></div><small className="welcome-footnote">You can change your focus any time by reopening this welcome screen.</small></section></div>}
    {activePackage&&<div className="modal-backdrop" onClick={()=>setActivePackage(null)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow muted">PACKAGE INVESTIGATION</span><h2>{activePackage.name}</h2></div><button className="icon-btn" onClick={()=>setActivePackage(null)}><X size={19}/></button></div>{detailBusy?<div className="loading-state"><LoaderCircle className="spin" size={24}/><span>Gathering package signals…</span></div>:<><p className="modal-description">{details?.npm?.description||activePackage.description}</p><div className="detail-grid"><div><span>Latest version</span><strong>{details?.npm?.['dist-tags']?.latest||activePackage.version||'—'}</strong></div><div><span>License</span><strong>{details?.npm?.license||activePackage.license||'Unknown'}</strong></div><div><span>Minified</span><strong>{details?.bundle?bytes(details.bundle.size):'Unavailable'}</strong></div><div><span>Minified + gzip</span><strong>{details?.bundle?bytes(details.bundle.gzip):'Unavailable'}</strong></div><div><span>Repo stars</span><strong>{details?.github?pretty(details.github.stargazers_count):pretty(activePackage.stars)}</strong></div><div><span>Open issues</span><strong>{details?.github?pretty(details.github.open_issues_count):'Unavailable'}</strong></div><div><span>Last release</span><strong>{details?.npm?.time?.modified?ago(details.npm.time.modified):'Unknown'}</strong></div><div><span>Dependencies</span><strong>{details?.npm?.versions?.[details.npm?.['dist-tags']?.latest]?.dependencies?Object.keys(details.npm.versions[details.npm['dist-tags'].latest].dependencies).length:0}</strong></div><div><span>CDN requests (recent)</span><strong>{details?.cdn?.hits?.total!=null?pretty(details.cdn.hits.total):'Unavailable'}</strong></div></div><div className="modal-actions"><a className="primary-btn" href={`https://www.npmjs.com/package/${encodeURIComponent(activePackage.name)}`} target="_blank" rel="noreferrer">Package page <ExternalLink size={15}/></a>{activePackage.repo&&<a className="secondary-btn" href={activePackage.repo} target="_blank" rel="noreferrer">Source repository <Github size={15}/></a>}<button className="secondary-btn" onClick={()=>toggleSaved(activePackage.name)}>{saved.includes(activePackage.name)?<BookmarkCheck size={15}/>:<Bookmark size={15}/>} {saved.includes(activePackage.name)?'Saved':'Save to shortlist'}</button></div><p className="modal-footnote">Some live signals may be unavailable during service limits or outages. Maintenance dates are indicators, not security assessments.</p></>}</div></div>}
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);
