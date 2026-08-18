const GITHUB_USER = "m4neexh";

const fallbackProjects = [
  {name:"NeuroLens", description:"Explainable AI system for Alzheimer’s MRI analysis with deep learning, Grad-CAM visualization and clinical insights.", language:"Python", topics:["AI/ML","Computer Vision","Streamlit"], html_url:"https://github.com/m4neexh"},
  {name:"Pet AI", description:"Intelligent pet-care application combining a modern web interface with AI-assisted veterinary guidance and risk assessment.", language:"JavaScript", topics:["React","Node.js","AI"], html_url:"https://github.com/m4neexh"},
  {name:"Water Conservation Management System", description:"Full-stack platform for water consumption, billing, alerts, conservation methods and administrative analytics.", language:"JavaScript", topics:["React","Express","Oracle"], html_url:"https://github.com/m4neexh"},
  {name:"Cloud Java Monitoring Tool", description:"Cloud-focused monitoring concept for server CPU, RAM, threads and runtime health on AWS infrastructure.", language:"Java", topics:["AWS","Monitoring","Cloud"], html_url:"https://github.com/m4neexh"},
  {name:"ATS Resume Checker", description:"Resume analysis interface for ATS scoring, grammar checks, missing skills and actionable improvement suggestions.", language:"Python", topics:["Streamlit","NLP","AI"], html_url:"https://github.com/m4neexh"},
  {name:"ECG Arrhythmia Classifier", description:"Deep-learning workflow for ECG arrhythmia classification with preprocessing, label encoding and saved inference models.", language:"Python", topics:["TensorFlow","Healthcare","ML"], html_url:"https://github.com/m4neexh"}
];

const projectsGrid = document.getElementById("projectsGrid");
const seeMore = document.getElementById("seeMore");
let projectData = [];
let showingAll = false;

function escapeHTML(value=""){
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function projectCard(repo, index){
  const topics = (repo.topics && repo.topics.length ? repo.topics : [repo.language || "Project","Development"]).slice(0,3);
  return `
    <article class="project-card reveal">
      <div class="project-image"><span>${escapeHTML(repo.language || "SOFTWARE / PROJECT")}</span></div>
      <h3>${escapeHTML(repo.name.replaceAll("-"," "))}</h3>
      <p>${escapeHTML(repo.description || "A software project by Hafil Razak.")}</p>
      <div class="chips">${topics.map(t=>`<span>${escapeHTML(t)}</span>`).join("")}</div>
      <div class="project-bottom">
        <a class="live-link" href="${repo.homepage || repo.html_url}" target="_blank" rel="noopener">GitHub ↗</a>
        <button class="details-btn" data-index="${index}">Details →</button>
      </div>
    </article>`;
}

function renderProjects(){
  const visible = showingAll ? projectData : projectData.slice(0,3);
  projectsGrid.innerHTML = visible.map((r,i)=>projectCard(r,i)).join("");
  seeMore.style.display = projectData.length > 3 ? "flex" : "none";
  seeMore.querySelector("span").textContent = showingAll ? "Show Less" : "See More";
  // give per-project stagger delay
  document.querySelectorAll('.projects-grid .project-card').forEach((card, idx)=>{
    card.style.transitionDelay = `${(idx % 6) * 80}ms`;
  });
  observeReveals();

  // update about stats if present
  const projectsEl = document.querySelector('.stat-box[data-key="projects"] .stat-number');
  if(projectsEl) projectsEl.textContent = projectData.length || '—';
  const techEl = document.querySelector('.stat-box[data-key="tech"] .stat-number');
  if(techEl){
    const techSet = new Set(projectData.flatMap(r=>[r.language, ...(r.topics||[])]).filter(Boolean));
    techEl.textContent = techSet.size || '—';
  }
  const openEl = document.querySelector('.stat-box[data-key="open"] .stat-number');
  if(openEl) openEl.textContent = projectData.filter(r=>!r.private && !r.fork).length || '—';
}

async function loadGithub(){
  try{
    const [profileRes,reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)
    ]);
    if(!profileRes.ok || !reposRes.ok) throw new Error("GitHub unavailable");
    const profile = await profileRes.json();
    const repos = await reposRes.json();
      // GitHub stat cards removed from markup; skip populating counts.
    projectData = repos
      .filter(r=>!r.fork)
      .sort((a,b)=>
        (b.stargazers_count-a.stargazers_count) ||
        (new Date(b.updated_at)-new Date(a.updated_at))
      )
      .slice(0,18);
      // Only show the user-specified projects (normalize names to match various repo naming styles)
      const allowed = ['bitconnect','newmajor','petai','fullstackchatapp','youtubeadfree','net2bot'];
      const normalize = s => (s||'').toString().toLowerCase().replace(/[^a-z0-9]/g,'');
      const filtered = projectData.filter(r=>allowed.includes(normalize(r.name)));
      if(filtered.length) projectData = filtered;
      else {
        // try matching fallback projects names too (in case GitHub fetch failed)
        const fb = fallbackProjects.filter(p=>allowed.includes(normalize(p.name)));
        projectData = fb.length ? fb : projectData;
      }
  }catch(e){
    // On error, prefer fallback entries that match allowed list, otherwise use fallbackProjects
    const allowed = ['bitconnect','newmajor','petai','fullstackchatapp','youtubeadfree','net2bot'];
    const normalize = s => (s||'').toString().toLowerCase().replace(/[^a-z0-9]/g,'');
    const fb = fallbackProjects.filter(p=>allowed.includes(normalize(p.name)));
    projectData = fb.length ? fb : fallbackProjects;
  }
  renderProjects();
}
loadGithub();

seeMore.addEventListener("click",()=>{showingAll=!showingAll;renderProjects();});

const modalBackdrop=document.getElementById("modalBackdrop");
document.addEventListener("click",e=>{
  const btn=e.target.closest(".details-btn");
  if(!btn)return;
  const repo=projectData[Number(btn.dataset.index)];
  document.getElementById("modalTech").textContent=(repo.language||"PROJECT").toUpperCase();
  document.getElementById("modalTitle").textContent=repo.name.replaceAll("-"," ");
  document.getElementById("modalDescription").textContent=repo.description||"Explore this project on GitHub.";
  document.getElementById("modalTags").innerHTML=(repo.topics||[repo.language||"Development"]).map(t=>`<span>${escapeHTML(t)}</span>`).join("");
  document.getElementById("modalLink").href=repo.html_url;
  modalBackdrop.classList.add("open");
  modalBackdrop.setAttribute('aria-hidden','false');
  const close = document.getElementById("modalClose");
  if(close) close.focus();
});

document.getElementById("modalClose").onclick=()=>{
  modalBackdrop.classList.remove("open");
  modalBackdrop.setAttribute('aria-hidden','true');
};
modalBackdrop.addEventListener("click",e=>{if(e.target===modalBackdrop){modalBackdrop.classList.remove("open");modalBackdrop.setAttribute('aria-hidden','true')}});
document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && modalBackdrop.classList.contains('open')){
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden','true');
  }
});

document.querySelectorAll(".tab").forEach(tab=>{
  tab.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("projectsTab").classList.toggle("hidden",tab.dataset.tab!=="projects");
    document.getElementById("techTab").classList.toggle("hidden",tab.dataset.tab!=="tech");
  });
});

// contribution grid removed per user request

const intro=document.getElementById("intro");
if(intro){
  const icons = intro.querySelectorAll('.intro-icons .round-icon');
  const skip = document.getElementById('skipIntro');

  function setIconStagger(){
    icons.forEach((ic, i)=>{
      ic.style.animation = `iconIn 700ms cubic-bezier(.2,.9,.28,1) ${i*120}ms both`;
      ic.style.opacity = 1;
    });
  }

  function startDropSequence(){
    intro.setAttribute('aria-hidden','false');
    // start icons stagger
    setIconStagger();
    // start drop-in for title and icons
    setTimeout(()=>intro.classList.add('drop-in'), 80);
    // hold, then drop out to bottom
    setTimeout(()=>{
      intro.classList.remove('drop-in');
      intro.classList.add('drop-out');
    }, 1400);
    // hide when the intro's drop-out animation ends (applies to whole welcome screen)
    function onIntroAnim(e){
      if(intro.classList.contains('drop-out')){
        intro.classList.add('hide');
        intro.setAttribute('aria-hidden','true');
        intro.removeEventListener('animationend', onIntroAnim);
      }
    }
    intro.addEventListener('animationend', onIntroAnim);
  }

  startDropSequence();
  if(skip){ skip.addEventListener('click', e=>{ e.preventDefault(); intro.classList.remove('drop-in'); intro.classList.add('drop-out'); skip.style.display='none'; // fallback hide in case animationend doesn't fire
      setTimeout(()=>{ if(!intro.classList.contains('hide')){ intro.classList.add('hide'); intro.setAttribute('aria-hidden','true'); } }, 800);
    }); }
}

// Typing animation for hero (cycles through phrases)
(() => {
  const el = document.getElementById('typed');
  if(!el) return;
  const phrases = [
    'Tools & Web Apps _',
    'Happy coding!'
  ];
  let phraseIndex = 0, charIndex = 0, deleting = false;

  const typeSpeed = 60;
  const deleteSpeed = 40;
  const pauseAfter = 900;

  function tick(){
    const current = phrases[phraseIndex];
    if(!deleting){
      el.textContent = current.slice(0, ++charIndex);
      if(charIndex === current.length){
        deleting = true;
        setTimeout(tick, pauseAfter);
        return;
      }
      setTimeout(tick, typeSpeed + Math.random()*40);
    } else {
      el.textContent = current.slice(0, --charIndex);
      if(charIndex === 0){
        deleting = false;
        phraseIndex = (phraseIndex+1) % phrases.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, deleteSpeed + Math.random()*20);
    }
  }
  tick();
})();

const cursorGlow=document.getElementById("cursorGlow");
window.addEventListener("pointermove",e=>{
  cursorGlow.style.left=e.clientX+"px";
  cursorGlow.style.top=e.clientY+"px";
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add("visible");
  });
},{threshold:.12});
function observeReveals(){
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  reveals.forEach((el,i)=>{
    // limit stagger groups so delays don't grow too large
    const delayIndex = i % 10;
    el.style.transitionDelay = `${delayIndex * 70}ms`;
    observer.observe(el);
  });
}
observeReveals();

const navLinks=document.querySelectorAll(".nav-link");
const sections=[...document.querySelectorAll("main section[id]")];
window.addEventListener("scroll",()=>{
  let current="home";
  sections.forEach(sec=>{if(window.scrollY>=sec.offsetTop-220) current=sec.id});
  navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+current));
});
const mobileMenuBtn=document.getElementById("mobileMenu");
const mobileNav=document.querySelector(".nav-shell nav");
mobileMenuBtn.addEventListener("click",()=>{
  const open=mobileNav.classList.toggle("mobile-open");
  mobileMenuBtn.setAttribute("aria-expanded",String(open));
});
mobileNav.querySelectorAll(".nav-link").forEach(link=>{
  link.addEventListener("click",()=>{
    mobileNav.classList.remove("mobile-open");
    mobileMenuBtn.setAttribute("aria-expanded","false");
  });
});

document.getElementById("contactForm").addEventListener("submit",e=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const subject=encodeURIComponent(`Portfolio contact from ${fd.get("name")}`);
  const body=encodeURIComponent(`${fd.get("message")}\n\nReply to: ${fd.get("email")}`);
  window.location.href=`mailto:?subject=${subject}&body=${body}`;
});

const commentsList=document.getElementById("commentsList");
const defaultComments=[
  {id:"pinned-1",name:"Hafil Razak",text:"Thanks for stopping by! Feel free to leave a comment or reach out through the contact section. 🚀",pinned:true,likes:7},
  {id:"seed-1",name:"Visitor",text:"Welcome to Hafil's portfolio. Explore the projects and drop a message!",likes:3}
];

function timeAgo(ts){
  if(!ts) return "";
  const diff=Math.max(0,Date.now()-ts);
  const mins=Math.floor(diff/60000);
  if(mins<1) return "just now";
  if(mins<60) return `${mins}m ago`;
  const hrs=Math.floor(mins/60);
  if(hrs<24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

function getLikedSet(){
  return new Set(JSON.parse(localStorage.getItem("hafil-liked")||"[]"));
}
function toggleLike(id,likeCountEl,btn){
  const stored=JSON.parse(localStorage.getItem("hafil-comments")||"[]");
  const liked=getLikedSet();
  const isDefault=defaultComments.some(c=>c.id===id);
  let entry=isDefault?defaultComments.find(c=>c.id===id):stored.find(c=>c.id===id);
  if(!entry)return;
  if(liked.has(id)){
    liked.delete(id);entry.likes=Math.max(0,(entry.likes||0)-1);
  }else{
    liked.add(id);entry.likes=(entry.likes||0)+1;
  }
  localStorage.setItem("hafil-liked",JSON.stringify([...liked]));
  if(!isDefault) localStorage.setItem("hafil-comments",JSON.stringify(stored));
  likeCountEl.textContent=entry.likes;
  btn.classList.toggle("liked",liked.has(id));
}

function loadComments(){
  const stored=JSON.parse(localStorage.getItem("hafil-comments")||"[]");
  [...defaultComments,...stored].forEach(renderComment);
}

function renderComment(c){
  const liked=getLikedSet().has(c.id);
  const el=document.createElement("div");
  el.className="comment"+(c.pinned?" pinned":"");
  el.innerHTML=`
    <div class="avatar">${escapeHTML(c.name.slice(0,1).toUpperCase())}</div>
    <div class="comment-body">
      <div class="comment-head">${escapeHTML(c.name)} ${c.pinned?'<span class="pin">PINNED</span>':''}</div>
      <p>${escapeHTML(c.text)}</p>
      <div class="comment-foot">
        <button class="like-btn${liked?" liked":""}" type="button">♥ <span>${c.likes||0}</span></button>
        <span class="comment-time">${timeAgo(c.createdAt)}</span>
      </div>
    </div>`;
  const likeBtn=el.querySelector(".like-btn");
  likeBtn.addEventListener("click",()=>toggleLike(c.id,likeBtn.querySelector("span"),likeBtn));
  commentsList.appendChild(el);
}

document.getElementById("commentForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("commentName").value.trim();
  const text=document.getElementById("commentText").value.trim();
  if(!name||!text)return;
  const stored=JSON.parse(localStorage.getItem("hafil-comments")||"[]");
  const comment={id:`c-${Date.now()}`,name,text,likes:0,createdAt:Date.now()};
  stored.push(comment);
  localStorage.setItem("hafil-comments",JSON.stringify(stored));
  renderComment(comment);
  e.target.reset();
});
loadComments();

const githubPortrait = document.querySelector(".github-portrait img");
if (githubPortrait) {
  githubPortrait.addEventListener("error", () => {
    githubPortrait.src = "https://avatars.githubusercontent.com/m4neexh";
  });
}

// Draggable project/id card behavior (click-and-drag to move card), mimic reference micro-interaction
(() => {
  const cardWrap = document.querySelector('.hero-card-wrap');
  const idCard = cardWrap ? cardWrap.querySelector('.id-card') : null;
  if(!cardWrap || !idCard) return;
  let dragging = false;
  let startX = 0, startY = 0, pointerId = null;
  cardWrap.style.touchAction = 'none';

  function onDown(e){
    dragging = true;
    pointerId = e.pointerId;
    startX = e.clientX; startY = e.clientY;
    cardWrap.setPointerCapture(pointerId);
    idCard.style.transition = 'transform 0s';
  }
  function onMove(e){
    if(!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const rot = Math.max(Math.min(dx / 15, 20), -20);
    idCard.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
  }
  function onUp(e){
    if(!dragging) return;
    dragging = false;
    try{ cardWrap.releasePointerCapture(pointerId); }catch(_){ }
    idCard.style.transition = 'transform 600ms cubic-bezier(.22,.9,.35,1)';
    idCard.style.transform = 'translate(0,0) rotate(-2deg)';
  }

  cardWrap.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  cardWrap.addEventListener('pointercancel', onUp);
})();
