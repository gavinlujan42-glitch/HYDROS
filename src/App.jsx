import React, { useMemo, useState } from 'react'
import { Droplets, Search, FileText, CreditCard, Map, Database, Sun, Building2, Sparkles, ArrowRight, ShieldCheck, Landmark, Waves, Mountain, ExternalLink } from 'lucide-react'

const modes = {
  hydros: { label: 'HYDROS', strap: 'Explore New Mexico water', title: 'One digital source for New Mexico water.', copy: 'Maps, drought, streamflow, water rights, records, planning, offices, and trusted state and federal resources.' },
  auaos: { label: 'AUAOS', strap: 'Assisted water navigation', title: 'Tell us what you need to accomplish.', copy: 'A guided task-first experience that helps residents, professionals, and staff find the right process, office, record, or next step.' },
  aquatech: { label: 'AquaTech', strap: 'Complete service portal', title: 'New Mexico water services in one place.', copy: 'The full operational-style portal for applications, payments, wells, water rights, GIS, records, drought, offices, and public resources.' }
}

const services = [
  ['Applications & Permits','Guided Water Wizard filing pathway','permits.html',FileText],
  ['Payment Center','Fees, orders, secure hosted-payment handoff','payments.html',CreditCard],
  ['Water Rights','Search, ownership, files, locations, records','water-rights.html',Droplets],
  ['Wells','Permits, logs, drillers, groundwater resources','wells.html',Waves],
  ['GIS & Data','Basins, rivers, offices, wells, records, drought','gis.html',Map],
  ['Records & Archive','OCR documents, orders, maps, historic records','records.html',Database],
  ['Drought & Conditions','State and federal drought, streamflow, snowpack','drought.html',Sun],
  ['Field Offices','Seven OSE Water Rights District offices','offices.html',Building2]
]

const resources = [
  ['New Mexico Drought Portal','https://drought.nm.gov/'],
  ['USGS New Mexico Water Data','https://waterdata.usgs.gov/nm/nwis'],
  ['Drought.gov New Mexico','https://www.drought.gov/states/new-mexico'],
  ['Official OSE Website','https://www.ose.nm.gov/'],
  ['50-Year Water Action Plan','50-year-plan.html'],
  ['Water Resource Directory','resources.html']
]

export default function App(){
  const [mode,setMode]=useState('hydros')
  const [query,setQuery]=useState('')
  const [wizardOpen,setWizardOpen]=useState(false)
  const [wizardText,setWizardText]=useState('')
  const m=modes[mode]
  const filtered=useMemo(()=>services.filter(([name,desc])=>(name+' '+desc).toLowerCase().includes(query.toLowerCase())),[query])

  const askWizard=(text)=>{
    setWizardOpen(true)
    setWizardText(text || 'Tell me what you are trying to do and I will route you to the right HYDROS service.')
  }

  return <div className={`app mode-${mode}`}>
    <div className="prototype">HYDROS V2 PUBLIC-SERVICE PROTOTYPE • NOT AN OFFICIAL FILING, PAYMENT, OR LEGAL RECORD SYSTEM</div>
    <div className="modebar" aria-label="Choose HYDROS experience">
      {Object.entries(modes).map(([key,val])=><button key={key} className={mode===key?'active':''} onClick={()=>setMode(key)}>{val.label}<small>{val.strap}</small></button>)}
    </div>

    <header className="masthead">
      <div className="shell mast-grid">
        <a className="brand" href="#top"><span className="seal"><Droplets size={28}/></span><span><strong>HYDROS</strong><small>NEW MEXICO DIGITAL WATER PLATFORM</small></span></a>
        <div className="agency"><Landmark size={18}/> Office of the State Engineer <span>•</span> Interstate Stream Commission</div>
        <form className="search" onSubmit={e=>{e.preventDefault();askWizard(query)}}><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search water services, records, maps…"/><button>Search</button></form>
      </div>
      <nav className="nav"><div className="shell"><a href="#services">Services</a><a href="water-rights.html">Water Rights</a><a href="permits.html">Permits</a><a href="gis.html">GIS & Data</a><a href="drought.html">Drought</a><a href="records.html">Records</a><a href="offices.html">Offices</a><a href="payments.html">Payments</a><button onClick={()=>askWizard('Help me find the right water process.')}>✦ Water Wizard</button></div></nav>
    </header>

    <main id="top">
      <section className="hero"><div className="shell hero-grid"><div><p className="eyebrow">{m.strap}</p><h1>{m.title}</h1><p>{m.copy}</p><div className="hero-actions"><a className="btn primary" href="#services">Find a service <ArrowRight size={17}/></a><button className="btn gold" onClick={()=>askWizard('I am not sure what process I need.')}>Ask Water Wizard <Sparkles size={17}/></button></div></div><aside className="pulse"><div className="pulse-head">NEW MEXICO WATER PULSE <span>LIVE LINKS</span></div>{resources.slice(0,3).map(([label,url])=><a key={label} href={url} target="_blank" rel="noreferrer"><span>{label}</span><ExternalLink size={15}/></a>)}</aside></div><div className="landscape"><span className="sun"></span><span className="mesa"></span><span className="river"></span></div></section>

      <section className="authority"><div className="shell authority-grid"><a href="permits.html"><FileText/>Applications & Permits</a><a href="payments.html"><CreditCard/>Secure Payments</a><a href="gis.html"><Map/>Interactive GIS</a><a href="offices.html"><Building2/>District Offices</a></div></section>

      <section className="section shell" id="services"><div className="section-head"><div><p className="eyebrow">Public services</p><h2>I want to…</h2></div><p>Multiple ways to reach the same authoritative water services.</p></div><div className="service-grid">{filtered.map(([name,desc,url,Icon])=><a className="service" href={url} key={name}><Icon/><h3>{name}</h3><p>{desc}</p><span>Open service <ArrowRight size={15}/></span></a>)}</div></section>

      <section className="section dark"><div className="shell"><div className="section-head light"><div><p className="eyebrow">Current initiatives</p><h2>New Mexico water now.</h2></div><p>Long-range planning, drought resilience, data modernization, wells, compacts, and community stewardship.</p></div><div className="initiative-grid"><a href="50-year-plan.html"><Mountain/><h3>50-Year Water Action Plan</h3><p>Connect statewide resilience goals to programs, milestones, projects, and public data.</p></a><a href="drought.html"><Sun/><h3>Drought & Climate Readiness</h3><p>State and federal drought, snowpack, streamflow, forecasts, and response resources.</p></a><a href="gis.html"><Map/><h3>HYDROS Data Center</h3><p>Maps, live queries, office GIS, downloadable resources, and future ArcGIS integration.</p></a><a href="records.html"><Database/><h3>Digital Records</h3><p>OCR-indexed legal archives, historical images, orders, maps, and record pathways.</p></a></div></div></section>

      <section className="section shell"><div className="split"><div><p className="eyebrow">Trusted water resources</p><h2>One launchpad. Many authoritative sources.</h2><p>HYDROS does not replace authoritative systems. It organizes them into a clearer public experience.</p></div><div className="resource-list">{resources.map(([label,url])=><a key={label} href={url} target={url.startsWith('http')?'_blank':undefined} rel="noreferrer"><span>{label}</span><ArrowRight size={16}/></a>)}</div></div></section>
    </main>

    <footer><div className="shell footer-grid"><div><div className="brand footer-brand"><span className="seal"><Droplets size={24}/></span><span><strong>HYDROS V2</strong><small>NEW MEXICO WATER PUBLIC-SERVICE PROTOTYPE</small></span></div><p>Designed for accessible, transparent navigation of New Mexico water information and services.</p></div><div><h4>Public Access</h4><a href="accessibility.html">ADA & Accessibility</a><a href="privacy.html">Privacy</a><a href="resources.html">Language Access</a><a href="https://www.ose.nm.gov/" target="_blank" rel="noreferrer">Official OSE ↗</a></div><div><h4>Records & Trust</h4><a href="records.html">Records & Archive</a><a href="privacy.html#security">Security Notice</a><a href="privacy.html#disclaimer">Website Disclaimer</a><a href="offices.html">Contact / Offices</a></div><div><h4>Services</h4><a href="permits.html">Applications & Permits</a><a href="payments.html">Payments</a><a href="water-rights.html">Water Rights</a><a href="gis.html">GIS & Data</a></div></div><div className="shell legal"><p><strong>Accessibility:</strong> Prototype targets WCAG 2.2 AA and Section 508-aligned design. Final compliance language and accommodation contacts require agency approval.</p><p><strong>Privacy and legal status:</strong> Do not submit sensitive personal or payment information here. This prototype is not an official filing, water-right determination, legal record, fee schedule, or legal advice.</p></div></footer>

    <button className="wizard-fab" onClick={()=>setWizardOpen(true)}><Droplets size={18}/> Water Wizard</button>
    {wizardOpen && <div className="wizard"><div className="wizard-head"><span><Sparkles/> WATER WIZARD</span><button onClick={()=>setWizardOpen(false)}>×</button></div><div className="wizard-body"><p>{wizardText || 'Tell me what you need to accomplish.'}</p><div className="wizard-links"><a href="permits.html">Permit or application</a><a href="water-rights.html">Water-right research</a><a href="wells.html">Well help</a><a href="offices.html">Find an office</a><a href="drought.html">Drought & conditions</a><a href="payments.html">Payments</a></div><small>General guidance only. Verify deadlines, filing requirements, legal status, fees, and official determinations with OSE.</small></div><form onSubmit={e=>{e.preventDefault();setWizardText(e.currentTarget.q.value || 'Tell me more about what you need.');e.currentTarget.reset()}}><input name="q" placeholder="What are you trying to do?"/><button>Ask</button></form></div>}
  </div>
}
