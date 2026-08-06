const dialog=document.querySelector('#dialog');const dialogTitle=document.querySelector('#dialogTitle');const dialogText=document.querySelector('#dialogText');function openDialog(title,text){dialogTitle.textContent=title;dialogText.textContent=text;dialog.showModal()}document.querySelectorAll('[data-dialog]').forEach(el=>el.addEventListener('click',()=>{const [title,text]=el.dataset.dialog.split('|');openDialog(title,text)}));document.querySelectorAll('.dialog-x,.dialog-close').forEach(el=>el.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
const menuButton=document.querySelector('#menuButton');const mainNav=document.querySelector('#mainNav');menuButton.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});
function wireSearch(form,input,title){form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();openDialog(title,q?`Prototype results for “${q}” would combine Drupal content, water-right and well data, GIS metadata, forms, and OCR-indexed records.`:'Enter a search term to explore the HYDROS prototype.')})}wireSearch(document.querySelector('#headerSearch'),document.querySelector('#headerQuery'),'Search HYDROS');wireSearch(document.querySelector('#heroSearch'),document.querySelector('#heroQuery'),'Search HYDROS');wireSearch(document.querySelector('#recordSearch'),document.querySelector('#recordQuery'),'Research water records');
document.querySelector('#languageButton').addEventListener('click',()=>openDialog('Spanish language access','The production framework would provide manually translated high-value pages and services, reviewed by qualified editors. This prototype currently displays English content only.'));
const layerLabel=document.querySelector('#layerLabel');document.querySelectorAll('[data-layer]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-layer]').forEach(b=>b.classList.remove('active'));button.classList.add('active');layerLabel.textContent=button.textContent}));
const officeResult=document.querySelector('#officeResult');document.querySelector('#officeSelect').addEventListener('change',e=>{officeResult.innerHTML=e.target.value?`<strong>${e.target.value}</strong><br>Preview: office location, hours, service area, contacts, local forms, notices, and appointment guidance would appear here.`:'Select a region to preview office information.'});
const newsContent={stories:`<article class="lead-story"><div class="story-visual river-visual"><span></span></div><div><p class="meta">FEATURED WATER STORY</p><h3>The Rio Grande as a living system</h3><p>Follow water from mountain snow and tributaries through reservoirs, acequias, cities, farms, habitats, compacts, and water-right records.</p><a href="#data">Explore the river system →</a></div></article><article><p class="meta">COMMUNITY</p><h3>Acequia knowledge and shared stewardship</h3><p>An accessible introduction to local governance, seasonal work, records, and community continuity.</p><button data-dialog="Acequia story|This prototype story is a placeholder for content developed with subject-matter and community review.">Read story</button></article><article><p class="meta">HISTORY</p><h3>Opening 120 years of water records</h3><p>Digitization connects photographs, maps, orders, engineering documents, and legal history.</p><a href="#timeline">Explore timeline</a></article>`,notices:`<article><p class="meta">PUBLIC NOTICE</p><h3>Prototype filing guidance update</h3><p>A future notice center would organize deadlines, rulemaking, closures, emergency notices, and filing changes.</p><button data-dialog="Public notices|Notices would be filterable by program, basin, district, date, and notice type.">View notice</button></article><article><p class="meta">DATA NOTICE</p><h3>Map layer maintenance</h3><p>Dataset status, refresh dates, lineage, and known limitations would be visible beside every public map.</p><button data-dialog="Data status|The production platform would publish dataset metadata and maintenance notices.">View status</button></article><article><p class="meta">ARCHIVE NOTICE</p><h3>New historical collection indexed</h3><p>OCR processing makes a newly digitized legal collection searchable while preserving original images.</p><button data-dialog="Archive update|Search results would link directly to source pages and document metadata.">Explore collection</button></article>`,meetings:`<article><p class="meta">AUGUST 18 • ONLINE</p><h3>Water data modernization listening session</h3><p>Public demonstration and feedback session for search, maps, accessibility, and online services.</p><button data-dialog="Meeting details|Future event pages would include agendas, registration, accessibility requests, recordings, and materials.">Meeting details</button></article><article><p class="meta">AUGUST 24 • SANTA FE</p><h3>Interstate stream commission meeting</h3><p>Agenda, supporting documents, public comment instructions, and post-meeting records in one place.</p><button data-dialog="Meeting details|This is illustrative prototype content, not an official event listing.">Meeting details</button></article><article><p class="meta">SEPTEMBER 3 • HYBRID</p><h3>District office public workshop</h3><p>Plain-language overview of applications, records research, and district services.</p><button data-dialog="Meeting details|This is illustrative prototype content, not an official event listing.">Meeting details</button></article>`};
const newsGrid=document.querySelector('#newsGrid');document.querySelectorAll('[data-news]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-news]').forEach(b=>b.classList.remove('active'));button.classList.add('active');newsGrid.innerHTML=newsContent[button.dataset.news];newsGrid.querySelectorAll('[data-dialog]').forEach(el=>el.addEventListener('click',()=>{const [title,text]=el.dataset.dialog.split('|');openDialog(title,text)}))}));
const eras={1905:['1905 • FOUNDATIONS','Building a durable public record','The State Engineer era establishes a formal administrative foundation for water rights, measurement, engineering, and public records across New Mexico.'],1938:['1938 • COMPACTS','Managing water across boundaries','Interstate agreements and basin-scale engineering deepen the need for transparent accounting, durable records, and coordinated administration.'],1956:['1956 • SCIENCE','Groundwater comes into sharper focus','Hydrogeology, well records, measurement, and expanding communities create new demands for scientific information and consistent administration.'],1972:['1972 • CONNECTIONS','Law, environment, and public information','Growing environmental awareness, adjudications, data collection, and community needs make water management increasingly interconnected.'],2000:['2000 • DIGITAL TRANSITION','Maps and records move online','GIS, digital imaging, databases, and web access begin opening complex water information to a broader public audience.'],2026:['TODAY • HYDROS','One digital front door','HYDROS imagines a unified, accessible public experience for services, maps, records, payments, history, and water stories.']};const eraCard=document.querySelector('#eraCard');document.querySelectorAll('[data-era]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-era]').forEach(b=>b.classList.remove('active'));button.classList.add('active');const [meta,title,text]=eras[button.dataset.era];eraCard.innerHTML=`<p class="meta">${meta}</p><h3>${title}</h3><p>${text}</p><div><span>Historical photographs</span><span>Orders and decisions</span><span>Maps and surveys</span></div>`}));

// HYDROS GEO GIS WORKSPACE
(function(){
  const mapEl=document.querySelector('#waterMap');
  if(!mapEl||!window.maplibregl)return;

  const fc=(features)=>({type:'FeatureCollection',features});
  const line=(name,coords,props={})=>({type:'Feature',properties:{name,...props},geometry:{type:'LineString',coordinates:coords}});
  const point=(name,coord,props={})=>({type:'Feature',properties:{name,...props},geometry:{type:'Point',coordinates:coord}});
  const poly=(name,ring,props={})=>({type:'Feature',properties:{name,...props},geometry:{type:'Polygon',coordinates:[ring]}});

  const rivers=fc([
    line('Rio Grande',[[-106.48,37],[-106.15,36.65],[-106.25,36.2],[-106.13,35.75],[-106.55,35.2],[-106.68,34.72],[-106.85,34.25],[-107.0,33.75],[-107.2,33.15],[-107.0,32.65],[-106.72,32.1],[-106.5,31.78],[-106.38,31.74],[-106.22,31.55],[-105.7,31.2]],{system:'Rio Grande',type:'Interstate / international river'}),
    line('Rio Chama',[[-106.75,36.98],[-106.68,36.72],[-106.73,36.57],[-106.56,36.4],[-106.47,36.2],[-106.15,36.0]],{system:'Rio Grande',type:'Major tributary'}),
    line('San Juan River',[[-109.05,37.0],[-108.7,36.78],[-108.28,36.73],[-107.85,36.72],[-107.4,36.68],[-107.0,36.72]],{system:'Colorado River',type:'Interstate river'}),
    line('Pecos River',[[-105.65,35.92],[-105.75,35.45],[-105.45,35.0],[-104.72,34.45],[-104.38,33.65],[-104.3,32.85],[-104.15,32.2],[-104.1,31.65]],{system:'Pecos',type:'Interstate river'}),
    line('Canadian River',[[-105.2,36.52],[-104.65,36.3],[-104.3,35.9],[-104.35,35.42],[-103.85,35.25],[-103.05,35.2]],{system:'Arkansas',type:'Interstate river'}),
    line('Gila River',[[-108.25,33.05],[-108.05,32.9],[-108.35,32.72],[-108.7,32.72],[-109.05,32.68]],{system:'Colorado River',type:'Interstate river'}),
    line('San Francisco River',[[-108.75,33.75],[-108.62,33.45],[-108.82,33.2],[-109.05,33.05]],{system:'Gila',type:'Major tributary'}),
    line('Rio Puerco',[[-107.35,36.0],[-107.15,35.65],[-106.95,35.25],[-106.9,34.8],[-106.82,34.43]],{system:'Rio Grande',type:'Major tributary'}),
    line('Jemez River',[[-106.73,35.88],[-106.7,35.7],[-106.63,35.53],[-106.55,35.35]],{system:'Rio Grande',type:'Major tributary'}),
    line('Rio Santa Fe',[[-105.9,35.7],[-106.02,35.66],[-106.18,35.59],[-106.32,35.52]],{system:'Rio Grande',type:'Tributary'}),
    line('Rio Salado',[[-106.55,34.38],[-106.68,34.35],[-106.82,34.28],[-106.93,34.25]],{system:'Rio Grande',type:'Tributary'}),
    line('Rio Hondo',[[-105.55,33.35],[-105.35,33.3],[-105.05,33.28],[-104.7,33.35]],{system:'Pecos',type:'Tributary'}),
    line('Mora River',[[-105.45,36.0],[-105.05,35.95],[-104.72,35.85],[-104.55,35.7]],{system:'Canadian',type:'Major tributary'}),
    line('Cimarron River',[[-105.0,36.9],[-104.7,36.72],[-104.35,36.62],[-103.95,36.55]],{system:'Canadian',type:'Major tributary'})
  ]);

  const reservoirs=fc([
    point('Navajo Reservoir',[-107.61,36.82],{river:'San Juan',role:'Storage / compact operations'}),
    point('Heron Lake',[-106.7,36.66],{river:'Rio Chama',role:'San Juan–Chama Project storage'}),
    point('El Vado Reservoir',[-106.75,36.59],{river:'Rio Chama',role:'Storage'}),
    point('Abiquiu Reservoir',[-106.43,36.24],{river:'Rio Chama',role:'Flood control / storage'}),
    point('Cochiti Lake',[-106.32,35.62],{river:'Rio Grande',role:'Flood control / recreation'}),
    point('Elephant Butte Reservoir',[-107.19,33.2],{river:'Rio Grande',role:'Rio Grande Project storage'}),
    point('Caballo Reservoir',[-107.29,32.9],{river:'Rio Grande',role:'Rio Grande Project regulation'}),
    point('Conchas Lake',[-104.18,35.4],{river:'Canadian',role:'Storage / irrigation'}),
    point('Ute Reservoir',[-103.45,35.36],{river:'Canadian',role:'Municipal / storage'}),
    point('Santa Rosa Lake',[-104.69,35.03],{river:'Pecos',role:'Flood control / storage'}),
    point('Sumner Lake',[-104.44,34.61],{river:'Pecos',role:'Irrigation / storage'}),
    point('Brantley Lake',[-104.38,32.55],{river:'Pecos',role:'Irrigation / flood control'})
  ]);

  const conveyances=fc([
    line('San Juan–Chama Project',[[-107.55,37.05],[-107.0,36.85],[-106.72,36.65],[-106.55,36.35],[-106.35,36.05]],{type:'Transbasin diversion',serves:'Rio Grande Basin / Middle Rio Grande'}),
    line('Middle Rio Grande conveyance corridor',[[-106.67,35.25],[-106.73,34.85],[-106.9,34.35],[-107.02,33.9]],{type:'Canals, drains & river conveyance',serves:'Middle Rio Grande Valley'}),
    line('Rio Grande Project — NM/TX/MX',[[-107.2,33.2],[-107.28,32.9],[-106.78,32.35],[-106.5,31.78],[-106.48,31.68]],{type:'Federal reclamation project',serves:'Lower Rio Grande / El Paso / Juárez'}),
    line('Pecos irrigation corridor',[[-104.52,33.85],[-104.35,33.2],[-104.38,32.55],[-104.15,32.15]],{type:'Reservoir and irrigation corridor',serves:'Pecos Valley'}),
    line('San Juan irrigation corridor',[[-108.65,36.75],[-108.2,36.73],[-107.75,36.72]],{type:'Irrigation corridor',serves:'San Juan Basin'}),
    line('Acequia corridor — Upper Rio Grande',[[-106.25,36.2],[-106.08,35.98],[-106.0,35.78],[-106.12,35.58]],{type:'Community irrigation network',serves:'Northern New Mexico valleys'})
  ]);

  const consumers=fc([
    point('Albuquerque / Middle Rio Grande',[-106.65,35.08],{kind:'Metro demand center',population_context:'Largest NM metro'}),
    point('Santa Fe',[-105.94,35.69],{kind:'Municipal / regional demand center'}),
    point('Las Cruces / Mesilla Valley',[-106.76,32.32],{kind:'Municipal + agricultural demand'}),
    point('Farmington / San Juan Basin',[-108.21,36.73],{kind:'Municipal + energy + agricultural demand'}),
    point('Roswell / Pecos Valley',[-104.52,33.39],{kind:'Municipal + agricultural demand'}),
    point('Clovis / High Plains',[-103.2,34.4],{kind:'Municipal + agricultural demand'}),
    point('El Paso, Texas',[-106.49,31.76],{kind:'Downstream metro demand center'}),
    point('Ciudad Juárez, Chihuahua',[-106.48,31.69],{kind:'International downstream demand center'})
  ]);

  const basins=fc([
    poly('Rio Grande Basin',[[-107.35,37],[-105.45,37],[-105.7,36.1],[-106.0,35.5],[-105.9,34.8],[-106.1,34],[-106.35,33.2],[-106.35,31.8],[-108.0,31.8],[-107.65,33.2],[-107.55,34.4],[-107.25,35.5],[-107.35,37]],{huc:'13 / 14',note:'Generalized major-basin context'}),
    poly('Pecos Basin',[[-105.55,36.2],[-103.7,35.6],[-103.9,34.7],[-103.75,33.7],[-103.8,32],[-105.3,32],[-105.2,33.2],[-105.1,34.5],[-105.55,36.2]],{huc:'13',note:'Generalized major-basin context'}),
    poly('Canadian Basin',[[-105.8,37],[-103,37],[-103,34.7],[-104.0,34.8],[-104.7,35.2],[-105.8,36.2],[-105.8,37]],{huc:'11',note:'Generalized major-basin context'}),
    poly('San Juan Basin',[[-109.05,37],[-107.3,37],[-107.3,36],[-108.1,35.8],[-109.05,36],[-109.05,37]],{huc:'14',note:'Colorado River Basin headwaters / generalized'}),
    poly('Gila–San Francisco Basin',[[-109.05,34.2],[-107.4,34.1],[-107.5,32.3],[-109.05,32.2],[-109.05,34.2]],{huc:'15',note:'Colorado River Basin / generalized'}),
    poly('Southwest Closed Basins',[[-107.5,34.1],[-105.9,34],[-106.1,31.8],[-109.05,31.8],[-109.05,32.2],[-107.5,32.3],[-107.5,34.1]],{huc:'13',note:'Mimbres / Tularosa and closed-basin context'})
  ]);

  const districts=fc([
    poly('District 1 • Albuquerque',[[-107.4,36],[-105.7,36],[-105.7,34.25],[-107.6,34.25],[-107.4,36]],{office:'Albuquerque',status:'Generalized web context'}),
    poly('District 2 • Roswell',[[-105.7,34.6],[-103,34.6],[-103,32],[-105.4,32],[-105.7,34.6]],{office:'Roswell',status:'Generalized web context'}),
    poly('District 3 • Deming / Las Cruces',[[-109.05,34.25],[-105.4,34.25],[-105.4,31.78],[-109.05,31.78],[-109.05,34.25]],{office:'Las Cruces / Deming',status:'Generalized web context'}),
    poly('District 4 • Las Vegas',[[-106,36.5],[-103,36.5],[-103,34.6],[-105.7,34.6],[-106,36.5]],{office:'Las Vegas',status:'Generalized web context'}),
    poly('District 5 • Aztec',[[-109.05,37],[-106.8,37],[-106.8,35.8],[-109.05,35.8],[-109.05,37]],{office:'Aztec',status:'Generalized web context'}),
    poly('District 6 • Santa Fe',[[-106.8,37],[-105.3,37],[-105.5,35.45],[-106.8,35.45],[-106.8,37]],{office:'Santa Fe',status:'Generalized web context'}),
    poly('District 7 • Cimarron / Northeast',[[-105.5,37],[-103,37],[-103,36.3],[-105.5,36.3],[-105.5,37]],{office:'Northeast New Mexico',status:'Generalized web context'})
  ]);

  const mexico=fc([
    line('Rio Grande / Río Bravo — Mexico reference',[[-106.5,31.78],[-106.48,31.68],[-106.25,31.55],[-105.95,31.35],[-105.7,31.2],[-105.35,30.9]],{type:'International boundary river',serves:'United States / Mexico'}),
    line('Acequia Madre / Juárez valley reference',[[-106.48,31.7],[-106.42,31.6],[-106.3,31.5]],{type:'Downstream conveyance context',serves:'Valle de Juárez'})
  ]);

  const map=new maplibregl.Map({
    container:'waterMap',
    style:'https://tiles.openfreemap.org/styles/liberty',
    center:[-106.05,34.45],
    zoom:5.35,
    pitch:28,
    bearing:0,
    attributionControl:true
  });
  map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
  map.addControl(new maplibregl.ScaleControl({maxWidth:120,unit:'imperial'}),'bottom-left');

  const layerGroups={
    rivers:['hydros-rivers','hydros-river-labels'],
    reservoirs:['hydros-reservoirs','hydros-reservoir-labels'],
    basins:['hydros-basins-fill','hydros-basins-line','hydros-basin-labels'],
    districts:['hydros-districts-fill','hydros-districts-line','hydros-district-labels'],
    conveyances:['hydros-conveyances','hydros-conveyance-labels'],
    consumers:['hydros-consumers','hydros-consumer-labels'],
    mexico:['hydros-mexico','hydros-mexico-labels']
  };

  map.on('load',()=>{
    map.addSource('hydros-basins',{type:'geojson',data:basins});
    map.addLayer({id:'hydros-basins-fill',type:'fill',source:'hydros-basins',paint:{'fill-color':['match',['get','name'],'Rio Grande Basin','#3a9182','Pecos Basin','#bc895b','Canadian Basin','#8e9d58','San Juan Basin','#6e8bb4','Gila–San Francisco Basin','#8c6c9b','#9d815c'],'fill-opacity':.14}});
    map.addLayer({id:'hydros-basins-line',type:'line',source:'hydros-basins',paint:{'line-color':'#a4b7a8','line-width':1.2,'line-opacity':.55,'line-dasharray':[3,2]}});
    map.addLayer({id:'hydros-basin-labels',type:'symbol',source:'hydros-basins',layout:{'text-field':['get','name'],'text-size':11,'text-transform':'uppercase','text-letter-spacing':.09},paint:{'text-color':'#40564d','text-halo-color':'#f1eee4','text-halo-width':1.5}});

    map.addSource('hydros-districts',{type:'geojson',data:districts});
    map.addLayer({id:'hydros-districts-fill',type:'fill',source:'hydros-districts',paint:{'fill-color':'#d39853','fill-opacity':.035}});
    map.addLayer({id:'hydros-districts-line',type:'line',source:'hydros-districts',paint:{'line-color':'#d9984f','line-width':1.5,'line-opacity':.65,'line-dasharray':[6,3]}});
    map.addLayer({id:'hydros-district-labels',type:'symbol',source:'hydros-districts',minzoom:6,layout:{'text-field':['get','name'],'text-size':10},paint:{'text-color':'#8b5a28','text-halo-color':'#fff','text-halo-width':1.2}});

    map.addSource('hydros-rivers',{type:'geojson',data:rivers});
    map.addLayer({id:'hydros-rivers',type:'line',source:'hydros-rivers',paint:{'line-color':['case',['==',['get','name'],'Rio Grande'],'#16aee4','#46bee1'],'line-width':['case',['==',['get','name'],'Rio Grande'],4.4,2.4],'line-opacity':.92}});
    map.addLayer({id:'hydros-river-labels',type:'symbol',source:'hydros-rivers',layout:{'symbol-placement':'line','text-field':['get','name'],'text-size':11,'text-letter-spacing':.05},paint:{'text-color':'#087ea4','text-halo-color':'#f7f5ee','text-halo-width':1.6}});

    map.addSource('hydros-conveyances',{type:'geojson',data:conveyances});
    map.addLayer({id:'hydros-conveyances',type:'line',source:'hydros-conveyances',paint:{'line-color':'#d89d25','line-width':2.4,'line-opacity':.9,'line-dasharray':[2,1.5]}});
    map.addLayer({id:'hydros-conveyance-labels',type:'symbol',source:'hydros-conveyances',minzoom:6,layout:{'symbol-placement':'line','text-field':['get','name'],'text-size':9},paint:{'text-color':'#8b6516','text-halo-color':'#fff','text-halo-width':1.4}});

    map.addSource('hydros-mexico',{type:'geojson',data:mexico});
    map.addLayer({id:'hydros-mexico',type:'line',source:'hydros-mexico',paint:{'line-color':'#ba5a84','line-width':3,'line-opacity':.9}});
    map.addLayer({id:'hydros-mexico-labels',type:'symbol',source:'hydros-mexico',layout:{'symbol-placement':'line','text-field':['get','name'],'text-size':10},paint:{'text-color':'#913c62','text-halo-color':'#fff','text-halo-width':1.5}});

    map.addSource('hydros-reservoirs',{type:'geojson',data:reservoirs});
    map.addLayer({id:'hydros-reservoirs',type:'circle',source:'hydros-reservoirs',paint:{'circle-radius':['interpolate',['linear'],['zoom'],4,4,8,8],'circle-color':'#35bddd','circle-stroke-color':'#fff','circle-stroke-width':1.5}});
    map.addLayer({id:'hydros-reservoir-labels',type:'symbol',source:'hydros-reservoirs',minzoom:6,layout:{'text-field':['get','name'],'text-offset':[0,1.15],'text-anchor':'top','text-size':10},paint:{'text-color':'#0b5e79','text-halo-color':'#fff','text-halo-width':1.3}});

    map.addSource('hydros-consumers',{type:'geojson',data:consumers});
    map.addLayer({id:'hydros-consumers',type:'circle',source:'hydros-consumers',paint:{'circle-radius':6,'circle-color':'#d96b45','circle-stroke-color':'#fff','circle-stroke-width':2,'circle-opacity':.95}});
    map.addLayer({id:'hydros-consumer-labels',type:'symbol',source:'hydros-consumers',layout:{'text-field':['get','name'],'text-offset':[0,1.2],'text-anchor':'top','text-size':10},paint:{'text-color':'#7b3d28','text-halo-color':'#fff','text-halo-width':1.4}});

    const clickable=['hydros-rivers','hydros-reservoirs','hydros-conveyances','hydros-consumers','hydros-districts-fill','hydros-basins-fill','hydros-mexico'];
    clickable.forEach(id=>{
      map.on('mouseenter',id,()=>map.getCanvas().style.cursor='pointer');
      map.on('mouseleave',id,()=>map.getCanvas().style.cursor='');
      map.on('click',id,e=>{
        const p=e.features&&e.features[0]&&e.features[0].properties;
        if(!p)return;
        const detail=p.type||p.role||p.kind||p.office||p.note||p.system||'HYDROS reference layer';
        const sub=p.serves||p.river||p.status||p.huc||'';
        new maplibregl.Popup({closeButton:true,maxWidth:'280px'}).setLngLat(e.lngLat).setHTML('<div class="map-popup"><strong>'+p.name+'</strong><span>'+detail+'</span>'+(sub?'<p>'+sub+'</p>':'')+'</div>').addTo(map);
      });
    });
  });

  const fit=(bounds,opts={})=>map.fitBounds(bounds,{padding:45,duration:1000,...opts});
  document.querySelector('#fitState')?.addEventListener('click',()=>fit([[-109.2,31.7],[-102.8,37.1]]));
  document.querySelector('#fitRio')?.addEventListener('click',()=>fit([[-107.7,31.65],[-105.3,37.05]],{padding:55}));
  document.querySelector('#fitBorder')?.addEventListener('click',()=>fit([[-107.25,30.75],[-105.2,33.4]],{padding:55}));
  document.querySelector('#tiltMap')?.addEventListener('click',()=>map.easeTo({pitch:map.getPitch()>40?0:58,bearing:map.getBearing()?0:-8,duration:800}));
  map.on('mousemove',e=>{const el=document.querySelector('#coordReadout');if(el)el.textContent=Math.abs(e.lngLat.lng).toFixed(3)+'°W • '+e.lngLat.lat.toFixed(3)+'°N'});

  document.querySelectorAll('[data-gis-layer]').forEach(input=>input.addEventListener('change',()=>{
    const key=input.dataset.gisLayer;
    if(key==='terrain'){map.easeTo({pitch:input.checked?58:20,duration:700});return}
    (layerGroups[key]||[]).forEach(id=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',input.checked?'visible':'none')});
    const count=[...document.querySelectorAll('[data-gis-layer]:checked')].filter(x=>x.dataset.gisLayer!=='terrain').length;
    const status=document.querySelector('#mapStatus');if(status)status.textContent=count+' layer groups visible';
  }));

  const chat=document.querySelector('#scribeChat');
  const addMessage=(kind,html)=>{const d=document.createElement('div');d.className='scribe-message '+kind;d.innerHTML=html;chat.appendChild(d);chat.scrollTop=chat.scrollHeight};
  const showGroup=(key)=>{document.querySelector('[data-gis-layer="'+key+'"]')?.click();const box=document.querySelector('[data-gis-layer="'+key+'"]');if(box&&!box.checked)box.click()};
  function askScribe(q){
    const query=q.trim();if(!query)return;
    addMessage('user',query);
    const t=query.toLowerCase();
    let answer='';
    if((t.includes('rio grande')&&t.includes('mex'))||t.includes('juárez')||t.includes('juarez')){
      showGroup('mexico');showGroup('consumers');showGroup('rivers');fit([[-107.35,30.75],[-105.2,37.05]],{padding:55});
      answer='<strong>Rio Grande → Mexico</strong><br>The mapped system follows the Rio Grande from the Colorado line through the Middle and Lower Rio Grande, Elephant Butte and Caballo, then to El Paso and Ciudad Juárez. The Rio Grande Project is shown as a conveyance corridor so downstream demand stays visible.';
    }else if(t.includes('san juan')||t.includes('chama')){
      showGroup('conveyances');showGroup('reservoirs');fit([[-108.2,35.75],[-105.9,37.15]],{padding:60});
      answer='<strong>San Juan–Chama Project</strong><br>This transbasin system moves Colorado River Basin water through the continental divide into the Rio Chama, then toward the Rio Grande. Heron, El Vado and Abiquiu are mapped in the receiving corridor.';
    }else if(t.includes('reservoir')){
      showGroup('reservoirs');answer='<strong>Major storage on this atlas</strong><br>Rio Grande/Chama: Heron, El Vado, Abiquiu, Cochiti, Elephant Butte and Caballo. San Juan: Navajo. Pecos: Santa Rosa, Sumner and Brantley. Canadian: Conchas and Ute.';
    }else if(t.includes('district')){
      showGroup('districts');fit([[-109.2,31.7],[-102.8,37.1]]);answer='<strong>OSE district context</strong><br>I turned on the seven district planning overlays and statewide view. These prototype boundaries are generalized; production HYDROS should bind the authoritative OSE district service rather than treat these display polygons as legal boundaries.';
    }else if(t.includes('pecos')){
      showGroup('rivers');showGroup('reservoirs');fit([[-105.9,31.7],[-103.6,36.2]],{padding:55});answer='<strong>Pecos system</strong><br>The Pecos runs south through eastern New Mexico into Texas. Santa Rosa, Sumner and Brantley are the major mapped storage points, with Roswell/Pecos Valley demand shown alongside the river corridor.';
    }else if(t.includes('basin')){
      showGroup('basins');answer='<strong>Major basin view</strong><br>HYDROS is showing six generalized basin contexts: Rio Grande, Pecos, Canadian, San Juan, Gila–San Francisco, and Southwest Closed Basins. The production layer should use authoritative USGS WBD HUC boundaries.';
    }else if(t.includes('consumer')||t.includes('demand')||t.includes('city')){
      showGroup('consumers');answer='<strong>Nearest demand centers</strong><br>Mapped demand context includes Albuquerque, Santa Fe, Las Cruces/Mesilla Valley, Farmington, Roswell, Clovis, El Paso and Ciudad Juárez. This is geographic context—not a water-use accounting claim.';
    }else{
      answer='<strong>Water Scribe</strong><br>I can work with the visible water-system layers. Ask me to trace the Rio Grande, explain San Juan–Chama, list reservoirs, focus the Pecos, show basins or OSE districts, or identify downstream demand centers.';
    }
    window.setTimeout(()=>addMessage('ai',answer),180);
  }
  document.querySelectorAll('[data-scribe]').forEach(b=>b.addEventListener('click',()=>askScribe(b.dataset.scribe)));
  document.querySelector('#scribeForm')?.addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#scribeInput');askScribe(input.value);input.value=''});
})();
