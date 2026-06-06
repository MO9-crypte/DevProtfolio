/* ============================================================
   DevPortfolio Builder — script.js
   Vanilla JS ES6+ — 2025
   ============================================================ */

'use strict';

/* ── Global App State ─────────────────────────────────────── */
const App = {
  currentTemplate: 'minimal',
  previewOpen: false,
  darkMode: true,

  data: {
    name: '',
    title: '',
    about: '',
    location: '',
    avatar: '',
    tagline: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
    email: '',
    phone: '',
    contactMessage: "I'm currently open to new opportunities. Feel free to reach out!",
    availability: 'open',
    skills: [],
    projects: [],
    experience: [],
    education: [],
  },

  theme: {
    accent: '#6366f1',
    font: 'Inter',
    portfolioDark: false,
    sections: {
      about: true,
      skills: true,
      projects: true,
      experience: true,
      education: true,
      contact: true,
    },
  },
};

/* ── Unique ID Generator ──────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);

/* ── DOM Helpers ──────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Toast Notification ───────────────────────────────────── */
function showToast(msg = 'Saved!', type = 'success') {
  const toast = $('#toast');
  const msgEl = $('#toast-message');
  const iconEl = toast.querySelector('i');
  msgEl.textContent = msg;
  iconEl.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  toast.style.borderLeftColor = type === 'error' ? '#ef4444' : '#10b981';
  iconEl.style.color = type === 'error' ? '#ef4444' : '#10b981';
  toast.classList.remove('hide');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
  }, 2800);
}

/* ── Page Navigation ──────────────────────────────────────── */
function showPage(id) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const page = $(`#${id}`);
  if (page) page.classList.add('active');
  window.scrollTo(0, 0);
}

/* ── Navbar Scroll Effect ─────────────────────────────────── */
const navbar = $('#navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ── Mobile Nav Toggle ────────────────────────────────────── */
const navToggle = $('#nav-toggle');
const navLinks = $('.nav-links');
const navActionsEl = $('.nav-actions');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    // simple in-page toggle
    const isOpen = navLinks && navLinks.style.display === 'flex';
    if (navLinks) navLinks.style.display = isOpen ? '' : 'flex';
    if (navActionsEl) navActionsEl.style.display = isOpen ? '' : 'flex';
  });
}

/* ── Smooth Scroll for Anchor Links ──────────────────────── */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.getElementById(a.getAttribute('href').slice(1));
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* ── Landing → Dashboard ─────────────────────────────────── */
function goToDashboard() {
  loadFromLocalStorage();
  showPage('dashboard-page');
  renderAllEditors();
  updatePreview();
}

['nav-cta-btn', 'hero-cta-btn', 'cta-final-btn', 'pricing-free-btn'].forEach(id => {
  const btn = $(`#${id}`);
  if (btn) btn.addEventListener('click', goToDashboard);
});

$('#back-to-landing')?.addEventListener('click', () => showPage('landing-page'));

/* ── Demo Button ─────────────────────────────────────────── */
$('#hero-demo-btn')?.addEventListener('click', () => {
  seedDemoData();
  goToDashboard();
});

/* ── Template Showcase Click (landing) ──────────────────── */
$$('.template-card').forEach(card => {
  card.addEventListener('click', () => {
    $$('.template-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

/* ── Sidebar Toggle ──────────────────────────────────────── */
const sidebar = $('#sidebar');
const sidebarToggle = $('#sidebar-toggle');
const sidebarClose = $('#sidebar-close');

function openSidebar() {
  sidebar?.classList.add('open');
}
function closeSidebar() {
  sidebar?.classList.remove('open');
}

sidebarToggle?.addEventListener('click', () => {
  sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarClose?.addEventListener('click', closeSidebar);

// Close sidebar on outside click (mobile)
document.addEventListener('click', e => {
  if (
    sidebar?.classList.contains('open') &&
    !sidebar.contains(e.target) &&
    e.target !== sidebarToggle
  ) {
    closeSidebar();
  }
});

/* ── Sidebar Panel Navigation ────────────────────────────── */
const panelTitles = {
  profile: 'Profile Editor',
  skills: 'Skills Editor',
  projects: 'Projects Editor',
  experience: 'Experience Editor',
  education: 'Education Editor',
  contact: 'Contact Information',
  theme: 'Theme & Appearance',
  'templates-panel': 'Choose Template',
};

$$('.sidebar-item').forEach(item => {
  item.addEventListener('click', () => {
    const panel = item.dataset.panel;
    if (!panel) return;

    // Update active state
    $$('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Show panel
    $$('.editor-panel').forEach(p => p.classList.remove('active'));
    $(`#panel-${panel}`)?.classList.add('active');

    // Update header title
    const titleEl = $('#panel-title');
    if (titleEl) titleEl.textContent = panelTitles[panel] || 'Editor';

    // Close on mobile
    if (window.innerWidth < 768) closeSidebar();
  });
});

/* ── Dark Mode Toggle (Dashboard) ───────────────────────── */
$('#dark-mode-toggle')?.addEventListener('click', () => {
  App.darkMode = !App.darkMode;
  const icon = $('#dark-mode-toggle i');
  if (icon) icon.className = App.darkMode ? 'fas fa-moon' : 'fas fa-sun';
  // The builder UI is always dark; this toggles the preview
  App.theme.portfolioDark = App.darkMode;
  const toggle = $('#portfolio-dark-toggle');
  if (toggle) toggle.checked = App.darkMode;
  updatePreview();
});

/* ── Live Preview Toggle ─────────────────────────────────── */
const previewPane = $('#preview-pane');
const previewToggleBtn = $('#preview-toggle-btn');
const closePreviewBtn = $('#close-preview');

function togglePreview() {
  App.previewOpen = !App.previewOpen;
  previewPane?.classList.toggle('open', App.previewOpen);
  if (previewToggleBtn) {
    previewToggleBtn.innerHTML = App.previewOpen
      ? '<i class="fas fa-eye-slash"></i> Hide Preview'
      : '<i class="fas fa-eye"></i> Preview';
  }
  if (App.previewOpen) updatePreview();
}

previewToggleBtn?.addEventListener('click', togglePreview);
closePreviewBtn?.addEventListener('click', () => {
  App.previewOpen = false;
  previewPane?.classList.remove('open');
  if (previewToggleBtn) {
    previewToggleBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
  }
});

/* ── Preview Device Toggles ──────────────────────────────── */
$('#preview-desktop')?.addEventListener('click', function () {
  const vp = $('#preview-viewport');
  if (vp) vp.style.maxWidth = '';
  $$('.preview-controls .icon-btn').forEach(b => b.classList.remove('active'));
  this.classList.add('active');
});
$('#preview-mobile-btn')?.addEventListener('click', function () {
  const vp = $('#preview-viewport');
  if (vp) vp.style.maxWidth = '375px';
  $$('.preview-controls .icon-btn').forEach(b => b.classList.remove('active'));
  this.classList.add('active');
});

/* ── Profile Fields Live Binding ─────────────────────────── */
function bindProfileFields() {
  $$('[data-field]').forEach(input => {
    const field = input.dataset.field;
    // Set initial value
    if (App.data[field] !== undefined) {
      input.value = App.data[field];
    }
    input.addEventListener('input', () => {
      App.data[field] = input.value;
      saveToLocalStorage();
      debouncePreview();
    });
  });
}

/* ── Skills Editor ───────────────────────────────────────── */
function renderSkills() {
  const container = $('#skills-list');
  if (!container) return;
  container.innerHTML = '';
  if (App.data.skills.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No skills added yet. Click "Add Skill" to begin.</p>';
    return;
  }
  App.data.skills.forEach(skill => {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      <span>${escapeHtml(skill.name)}</span>
      <span style="font-size:11px;opacity:0.7;margin-right:2px;">${escapeHtml(skill.category)}</span>
      <button class="tag-remove" data-id="${skill.id}" aria-label="Remove ${skill.name}">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(tag);
  });

  $$('.tag-remove', container).forEach(btn => {
    btn.addEventListener('click', () => {
      App.data.skills = App.data.skills.filter(s => s.id !== btn.dataset.id);
      renderSkills();
      saveToLocalStorage();
      debouncePreview();
    });
  });
}

$('#add-skill-btn')?.addEventListener('click', () => {
  $('#add-skill-form')?.classList.remove('hidden');
  $('#skill-name-input')?.focus();
});

$('#cancel-skill-btn')?.addEventListener('click', () => {
  $('#add-skill-form')?.classList.add('hidden');
  clearSkillForm();
});

$('#save-skill-btn')?.addEventListener('click', () => {
  const name = $('#skill-name-input')?.value?.trim();
  const category = $('#skill-category-input')?.value || 'Other';
  const level = parseInt($('#skill-level-input')?.value || '4', 10);
  if (!name) { showToast('Please enter a skill name', 'error'); return; }
  App.data.skills.push({ id: uid(), name, category, level });
  renderSkills();
  saveToLocalStorage();
  debouncePreview();
  clearSkillForm();
  $('#add-skill-form')?.classList.add('hidden');
  showToast(`"${name}" added to skills!`);
});

function clearSkillForm() {
  const nameInput = $('#skill-name-input');
  if (nameInput) nameInput.value = '';
  const levelInput = $('#skill-level-input');
  if (levelInput) levelInput.value = '4';
}

/* ── Projects Editor ─────────────────────────────────────── */
function renderProjects() {
  const list = $('#projects-list');
  if (!list) return;
  list.innerHTML = '';
  if (App.data.projects.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No projects yet. Click "Add Project" to get started.</p>';
    return;
  }
  App.data.projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-icon"><i class="fas fa-folder"></i></div>
      <div class="item-card-content">
        <h4>${escapeHtml(proj.name)}</h4>
        <p>${escapeHtml(proj.tech || '')} · ${escapeHtml(proj.status || '')}</p>
      </div>
      <div class="item-card-actions">
        <button class="icon-btn edit-btn" data-id="${proj.id}" aria-label="Edit ${proj.name}"><i class="fas fa-edit"></i></button>
        <button class="icon-btn delete-btn" data-id="${proj.id}" aria-label="Delete ${proj.name}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    list.appendChild(card);
  });
  bindItemActions('projects');
}

$('#add-project-btn')?.addEventListener('click', () => {
  resetProjectForm();
  $('#project-form-section')?.classList.remove('hidden');
  $('#editing-project-id').value = '';
  const title = $('#project-form-title');
  if (title) title.innerHTML = '<i class="fas fa-plus-circle"></i> New Project';
});

$('#cancel-project-btn')?.addEventListener('click', () => {
  $('#project-form-section')?.classList.add('hidden');
  resetProjectForm();
});

$('#save-project-btn')?.addEventListener('click', () => {
  const name = $('#proj-name')?.value?.trim();
  if (!name) { showToast('Please enter a project name', 'error'); return; }
  const editId = $('#editing-project-id')?.value;
  const proj = {
    id: editId || uid(),
    name,
    desc: $('#proj-desc')?.value?.trim() || '',
    live: $('#proj-live')?.value?.trim() || '',
    github: $('#proj-github')?.value?.trim() || '',
    tech: $('#proj-tech')?.value?.trim() || '',
    image: $('#proj-image')?.value?.trim() || '',
    status: $('#proj-status')?.value || 'Completed',
  };
  if (editId) {
    App.data.projects = App.data.projects.map(p => p.id === editId ? proj : p);
    showToast('Project updated!');
  } else {
    App.data.projects.push(proj);
    showToast(`"${name}" added!`);
  }
  renderProjects();
  saveToLocalStorage();
  debouncePreview();
  $('#project-form-section')?.classList.add('hidden');
  resetProjectForm();
});

function resetProjectForm() {
  ['proj-name', 'proj-desc', 'proj-live', 'proj-github', 'proj-tech', 'proj-image'].forEach(id => {
    const el = $(`#${id}`);
    if (el) el.value = '';
  });
  const statusEl = $('#proj-status');
  if (statusEl) statusEl.value = 'Completed';
}

/* ── Experience Editor ───────────────────────────────────── */
function renderExperience() {
  const list = $('#experience-list');
  if (!list) return;
  list.innerHTML = '';
  if (App.data.experience.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No experience added yet.</p>';
    return;
  }
  App.data.experience.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-icon"><i class="fas fa-briefcase"></i></div>
      <div class="item-card-content">
        <h4>${escapeHtml(exp.title)} · ${escapeHtml(exp.company)}</h4>
        <p>${escapeHtml(exp.start)} – ${escapeHtml(exp.end)}</p>
      </div>
      <div class="item-card-actions">
        <button class="icon-btn edit-btn" data-id="${exp.id}" aria-label="Edit"><i class="fas fa-edit"></i></button>
        <button class="icon-btn delete-btn" data-id="${exp.id}" aria-label="Delete"><i class="fas fa-trash"></i></button>
      </div>
    `;
    list.appendChild(card);
  });
  bindItemActions('experience');
}

$('#add-exp-btn')?.addEventListener('click', () => {
  resetExpForm();
  $('#exp-form-section')?.classList.remove('hidden');
  $('#editing-exp-id').value = '';
  const title = $('#exp-form-title');
  if (title) title.innerHTML = '<i class="fas fa-plus-circle"></i> New Experience';
});

$('#cancel-exp-btn')?.addEventListener('click', () => {
  $('#exp-form-section')?.classList.add('hidden');
  resetExpForm();
});

$('#save-exp-btn')?.addEventListener('click', () => {
  const title = $('#exp-title')?.value?.trim();
  const company = $('#exp-company')?.value?.trim();
  if (!title || !company) { showToast('Title and Company are required', 'error'); return; }
  const editId = $('#editing-exp-id')?.value;
  const exp = {
    id: editId || uid(),
    title,
    company,
    start: $('#exp-start')?.value?.trim() || '',
    end: $('#exp-end')?.value?.trim() || 'Present',
    desc: $('#exp-desc')?.value?.trim() || '',
  };
  if (editId) {
    App.data.experience = App.data.experience.map(e => e.id === editId ? exp : e);
    showToast('Experience updated!');
  } else {
    App.data.experience.push(exp);
    showToast('Experience added!');
  }
  renderExperience();
  saveToLocalStorage();
  debouncePreview();
  $('#exp-form-section')?.classList.add('hidden');
  resetExpForm();
});

function resetExpForm() {
  ['exp-title', 'exp-company', 'exp-start', 'exp-end', 'exp-desc'].forEach(id => {
    const el = $(`#${id}`);
    if (el) el.value = '';
  });
}

/* ── Education Editor ────────────────────────────────────── */
function renderEducation() {
  const list = $('#education-list');
  if (!list) return;
  list.innerHTML = '';
  if (App.data.education.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No education added yet.</p>';
    return;
  }
  App.data.education.forEach(edu => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-icon"><i class="fas fa-graduation-cap"></i></div>
      <div class="item-card-content">
        <h4>${escapeHtml(edu.degree)}</h4>
        <p>${escapeHtml(edu.school)} · ${escapeHtml(edu.start)}–${escapeHtml(edu.end)}</p>
      </div>
      <div class="item-card-actions">
        <button class="icon-btn edit-btn" data-id="${edu.id}" aria-label="Edit"><i class="fas fa-edit"></i></button>
        <button class="icon-btn delete-btn" data-id="${edu.id}" aria-label="Delete"><i class="fas fa-trash"></i></button>
      </div>
    `;
    list.appendChild(card);
  });
  bindItemActions('education');
}

$('#add-edu-btn')?.addEventListener('click', () => {
  resetEduForm();
  $('#edu-form-section')?.classList.remove('hidden');
  $('#editing-edu-id').value = '';
  const title = $('#edu-form-title');
  if (title) title.innerHTML = '<i class="fas fa-plus-circle"></i> New Education';
});

$('#cancel-edu-btn')?.addEventListener('click', () => {
  $('#edu-form-section')?.classList.add('hidden');
  resetEduForm();
});

$('#save-edu-btn')?.addEventListener('click', () => {
  const degree = $('#edu-degree')?.value?.trim();
  const school = $('#edu-school')?.value?.trim();
  if (!degree || !school) { showToast('Degree and School are required', 'error'); return; }
  const editId = $('#editing-edu-id')?.value;
  const edu = {
    id: editId || uid(),
    degree,
    school,
    start: $('#edu-start')?.value?.trim() || '',
    end: $('#edu-end')?.value?.trim() || '',
    desc: $('#edu-desc')?.value?.trim() || '',
  };
  if (editId) {
    App.data.education = App.data.education.map(e => e.id === editId ? edu : e);
    showToast('Education updated!');
  } else {
    App.data.education.push(edu);
    showToast('Education added!');
  }
  renderEducation();
  saveToLocalStorage();
  debouncePreview();
  $('#edu-form-section')?.classList.add('hidden');
  resetEduForm();
});

function resetEduForm() {
  ['edu-degree', 'edu-school', 'edu-start', 'edu-end', 'edu-desc'].forEach(id => {
    const el = $(`#${id}`);
    if (el) el.value = '';
  });
}

/* ── Generic Item Edit/Delete Binding ───────────────────── */
function bindItemActions(type) {
  const listId = `${type}-list`;
  const list = $(`#${listId}`);
  if (!list) return;

  $$('.delete-btn', list).forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this item?')) return;
      App.data[type] = App.data[type].filter(i => i.id !== btn.dataset.id);
      saveToLocalStorage();
      debouncePreview();
      if (type === 'projects') renderProjects();
      if (type === 'experience') renderExperience();
      if (type === 'education') renderEducation();
      showToast('Item deleted');
    });
  });

  $$('.edit-btn', list).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (type === 'projects') openEditProject(id);
      if (type === 'experience') openEditExp(id);
      if (type === 'education') openEditEdu(id);
    });
  });
}

function openEditProject(id) {
  const proj = App.data.projects.find(p => p.id === id);
  if (!proj) return;
  $('#proj-name').value = proj.name;
  $('#proj-desc').value = proj.desc;
  $('#proj-live').value = proj.live;
  $('#proj-github').value = proj.github;
  $('#proj-tech').value = proj.tech;
  $('#proj-image').value = proj.image;
  $('#proj-status').value = proj.status;
  $('#editing-project-id').value = id;
  const title = $('#project-form-title');
  if (title) title.innerHTML = '<i class="fas fa-edit"></i> Edit Project';
  $('#project-form-section')?.classList.remove('hidden');
}

function openEditExp(id) {
  const exp = App.data.experience.find(e => e.id === id);
  if (!exp) return;
  $('#exp-title').value = exp.title;
  $('#exp-company').value = exp.company;
  $('#exp-start').value = exp.start;
  $('#exp-end').value = exp.end;
  $('#exp-desc').value = exp.desc;
  $('#editing-exp-id').value = id;
  const title = $('#exp-form-title');
  if (title) title.innerHTML = '<i class="fas fa-edit"></i> Edit Experience';
  $('#exp-form-section')?.classList.remove('hidden');
}

function openEditEdu(id) {
  const edu = App.data.education.find(e => e.id === id);
  if (!edu) return;
  $('#edu-degree').value = edu.degree;
  $('#edu-school').value = edu.school;
  $('#edu-start').value = edu.start;
  $('#edu-end').value = edu.end;
  $('#edu-desc').value = edu.desc;
  $('#editing-edu-id').value = id;
  const title = $('#edu-form-title');
  if (title) title.innerHTML = '<i class="fas fa-edit"></i> Edit Education';
  $('#edu-form-section')?.classList.remove('hidden');
}

/* ── Theme Controls ──────────────────────────────────────── */
$('#accent-color-picker')?.addEventListener('input', function () {
  App.theme.accent = this.value;
  applyThemeToBuilder();
  saveToLocalStorage();
  debouncePreview();
});

$$('.color-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.dataset.color;
    App.theme.accent = color;
    const picker = $('#accent-color-picker');
    if (picker) picker.value = color;
    $$('.color-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyThemeToBuilder();
    saveToLocalStorage();
    debouncePreview();
  });
});

$('#font-selector')?.addEventListener('change', function () {
  App.theme.font = this.value;
  saveToLocalStorage();
  debouncePreview();
});

$('#portfolio-dark-toggle')?.addEventListener('change', function () {
  App.theme.portfolioDark = this.checked;
  const label = $('#portfolio-dark-label');
  if (label) label.textContent = this.checked ? 'Dark Mode' : 'Light Mode';
  saveToLocalStorage();
  debouncePreview();
});

$$('[data-section]').forEach(cb => {
  cb.addEventListener('change', () => {
    const section = cb.dataset.section;
    App.theme.sections[section] = cb.checked;
    saveToLocalStorage();
    debouncePreview();
  });
});

function applyThemeToBuilder() {
  document.documentElement.style.setProperty('--accent', App.theme.accent);
  // derive light/dark variants
  document.documentElement.style.setProperty('--accent-glow', hexToRgba(App.theme.accent, 0.25));
}

/* ── Template Picker ─────────────────────────────────────── */
$$('.tp-option').forEach(opt => {
  opt.addEventListener('click', () => {
    $$('.tp-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    App.currentTemplate = opt.dataset.tpl;
    saveToLocalStorage();
    debouncePreview();
    showToast(`Template changed to ${opt.dataset.tpl}!`);
  });
});

/* ── Local Storage ───────────────────────────────────────── */
function saveToLocalStorage() {
  try {
    localStorage.setItem('devportfolio_data', JSON.stringify(App.data));
    localStorage.setItem('devportfolio_theme', JSON.stringify(App.theme));
    localStorage.setItem('devportfolio_template', App.currentTemplate);
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('devportfolio_data');
    const theme = localStorage.getItem('devportfolio_theme');
    const tpl = localStorage.getItem('devportfolio_template');
    if (data) App.data = { ...App.data, ...JSON.parse(data) };
    if (theme) App.theme = { ...App.theme, ...JSON.parse(theme) };
    if (tpl) App.currentTemplate = tpl;
  } catch (e) {
    console.warn('LocalStorage load failed:', e);
  }
}

/* ── Render All Editors from State ──────────────────────── */
function renderAllEditors() {
  // Profile fields
  $$('[data-field]').forEach(input => {
    const field = input.dataset.field;
    if (App.data[field] !== undefined) input.value = App.data[field];
  });

  renderSkills();
  renderProjects();
  renderExperience();
  renderEducation();

  // Theme
  applyThemeToBuilder();
  const picker = $('#accent-color-picker');
  if (picker) picker.value = App.theme.accent;
  const fontSel = $('#font-selector');
  if (fontSel) fontSel.value = App.theme.font;
  const darkToggle = $('#portfolio-dark-toggle');
  if (darkToggle) {
    darkToggle.checked = App.theme.portfolioDark;
    const label = $('#portfolio-dark-label');
    if (label) label.textContent = App.theme.portfolioDark ? 'Dark Mode' : 'Light Mode';
  }

  // Section visibility
  $$('[data-section]').forEach(cb => {
    const section = cb.dataset.section;
    if (App.theme.sections[section] !== undefined) {
      cb.checked = App.theme.sections[section];
    }
  });

  // Template picker
  $$('.tp-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.tpl === App.currentTemplate);
  });

  // Color presets
  $$('.color-preset').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === App.theme.accent);
  });
}

/* ── Debounced Preview Update ────────────────────────────── */
let previewTimer = null;
function debouncePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 400);
}

/* ── Portfolio HTML Generator ────────────────────────────── */
function generatePortfolioHTML() {
  const d = App.data;
  const t = App.theme;
  const tpl = App.currentTemplate;
  const isDark = t.portfolioDark;

  const accentColor = t.accent;
  const fontFam = t.font;

  // Sections HTML
  const aboutHTML = t.sections.about ? `
    <section class="port-section" id="port-about">
      <div class="port-container">
        <h2 class="port-section-title">About Me</h2>
        <div class="about-content">
          ${d.avatar ? `<img src="${escapeHtml(d.avatar)}" alt="${escapeHtml(d.name)}" class="about-avatar" />` : ''}
          <div class="about-text">
            <p>${escapeHtml(d.about || 'No description yet.')}</p>
            ${d.location ? `<p class="about-location"><span>📍</span> ${escapeHtml(d.location)}</p>` : ''}
          </div>
        </div>
      </div>
    </section>` : '';

  // Group skills by category
  const skillsByCategory = {};
  (d.skills || []).forEach(s => {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  });
  const skillsHTML = t.sections.skills && d.skills.length > 0 ? `
    <section class="port-section" id="port-skills">
      <div class="port-container">
        <h2 class="port-section-title">Skills</h2>
        <div class="skills-groups">
          ${Object.entries(skillsByCategory).map(([cat, skills]) => `
            <div class="skill-group">
              <h3 class="skill-group-title">${escapeHtml(cat)}</h3>
              <div class="skill-tags">
                ${skills.map(s => `<span class="port-skill-tag">${escapeHtml(s.name)}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>` : '';

  const projectsHTML = t.sections.projects && d.projects.length > 0 ? `
    <section class="port-section" id="port-projects">
      <div class="port-container">
        <h2 class="port-section-title">Projects</h2>
        <div class="projects-grid">
          ${d.projects.map(p => `
            <div class="project-card">
              ${p.image ? `<div class="project-img" style="background-image:url(${escapeHtml(p.image)})"></div>` : `<div class="project-img-placeholder"><span>&#128193;</span></div>`}
              <div class="project-body">
                <div class="project-header">
                  <h3 class="project-name">${escapeHtml(p.name)}</h3>
                  <span class="project-status">${escapeHtml(p.status || '')}</span>
                </div>
                <p class="project-desc">${escapeHtml(p.desc || '')}</p>
                ${p.tech ? `<div class="project-tech">${p.tech.split(',').map(t => `<span>${escapeHtml(t.trim())}</span>`).join('')}</div>` : ''}
                <div class="project-links">
                  ${p.live ? `<a href="${escapeHtml(p.live)}" target="_blank" rel="noopener" class="project-link">Live Demo →</a>` : ''}
                  ${p.github ? `<a href="${escapeHtml(p.github)}" target="_blank" rel="noopener" class="project-link ghost">GitHub</a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>` : '';

  const experienceHTML = t.sections.experience && d.experience.length > 0 ? `
    <section class="port-section" id="port-experience">
      <div class="port-container">
        <h2 class="port-section-title">Experience</h2>
        <div class="timeline">
          ${d.experience.map(e => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h3>${escapeHtml(e.title)}</h3>
                  <span class="timeline-company">${escapeHtml(e.company)}</span>
                </div>
                <span class="timeline-date">${escapeHtml(e.start)} – ${escapeHtml(e.end)}</span>
                <p>${escapeHtml(e.desc || '')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>` : '';

  const educationHTML = t.sections.education && d.education.length > 0 ? `
    <section class="port-section" id="port-education">
      <div class="port-container">
        <h2 class="port-section-title">Education</h2>
        <div class="edu-grid">
          ${d.education.map(e => `
            <div class="edu-card">
              <div class="edu-icon">🎓</div>
              <div>
                <h3>${escapeHtml(e.degree)}</h3>
                <p>${escapeHtml(e.school)}</p>
                <span>${escapeHtml(e.start)}–${escapeHtml(e.end)}</span>
                ${e.desc ? `<p class="edu-desc">${escapeHtml(e.desc)}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>` : '';

  const availabilityMap = {
    open: { label: 'Open to opportunities', color: '#10b981' },
    freelance: { label: 'Available for freelance', color: '#f59e0b' },
    busy: { label: 'Not available right now', color: '#6b7280' },
  };
  const avail = availabilityMap[d.availability] || availabilityMap.open;

  const contactHTML = t.sections.contact ? `
    <section class="port-section" id="port-contact">
      <div class="port-container">
        <h2 class="port-section-title">Contact</h2>
        <div class="contact-card">
          <div class="availability-badge" style="background:${avail.color}22;color:${avail.color};border:1px solid ${avail.color}44;">
            <span class="avail-dot" style="background:${avail.color}"></span>
            ${escapeHtml(avail.label)}
          </div>
          <p class="contact-msg">${escapeHtml(d.contactMessage || '')}</p>
          ${d.email ? `<a href="mailto:${escapeHtml(d.email)}" class="contact-email-btn">Send me an email →</a>` : ''}
          <div class="contact-socials">
            ${d.github ? `<a href="${escapeHtml(d.github)}" target="_blank" rel="noopener">GitHub</a>` : ''}
            ${d.linkedin ? `<a href="${escapeHtml(d.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
            ${d.twitter ? `<a href="${escapeHtml(d.twitter)}" target="_blank" rel="noopener">Twitter</a>` : ''}
            ${d.website ? `<a href="${escapeHtml(d.website)}" target="_blank" rel="noopener">Website</a>` : ''}
          </div>
        </div>
      </div>
    </section>` : '';

  // Navigation items
  const navItems = [
    t.sections.about ? '<a href="#port-about">About</a>' : '',
    t.sections.skills ? '<a href="#port-skills">Skills</a>' : '',
    t.sections.projects ? '<a href="#port-projects">Projects</a>' : '',
    t.sections.experience ? '<a href="#port-experience">Experience</a>' : '',
    t.sections.education ? '<a href="#port-education">Education</a>' : '',
    t.sections.contact ? '<a href="#port-contact">Contact</a>' : '',
  ].filter(Boolean).join('');

  // Template-specific CSS
  const tplCSS = getTemplateCss(tpl, accentColor, isDark, fontFam);

  return `<!DOCTYPE html>
<html lang="en" data-theme="${isDark ? 'dark' : 'light'}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(d.name || 'My Portfolio')} — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFam)}:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>${tplCSS}</style>
</head>
<body>

<nav class="port-nav" id="port-nav">
  <div class="port-nav-inner">
    <a class="port-nav-brand" href="#">${escapeHtml(d.name || 'Portfolio')}</a>
    <div class="port-nav-links">${navItems}</div>
    <button class="port-theme-toggle" id="port-theme-toggle" aria-label="Toggle dark mode">
      <span class="theme-icon">◐</span>
    </button>
  </div>
</nav>

<main>
  <section class="port-hero" id="port-home">
    <div class="port-container">
      <div class="hero-inner">
        ${d.avatar ? `<img src="${escapeHtml(d.avatar)}" alt="${escapeHtml(d.name)}" class="hero-avatar"/>` : ''}
        <div class="hero-text">
          <p class="hero-tagline">${escapeHtml(d.tagline || 'Welcome to my portfolio')}</p>
          <h1 class="hero-name">${escapeHtml(d.name || 'Your Name')}</h1>
          <p class="hero-role">${escapeHtml(d.title || 'Developer')}</p>
          <div class="hero-ctas">
            ${d.email ? `<a href="#port-projects" class="hero-btn primary">View My Work</a>` : ''}
            ${d.email ? `<a href="mailto:${escapeHtml(d.email)}" class="hero-btn secondary">Get In Touch</a>` : ''}
          </div>
          <div class="hero-links">
            ${d.github ? `<a href="${escapeHtml(d.github)}" target="_blank" rel="noopener" class="social-link">GitHub</a>` : ''}
            ${d.linkedin ? `<a href="${escapeHtml(d.linkedin)}" target="_blank" rel="noopener" class="social-link">LinkedIn</a>` : ''}
            ${d.twitter ? `<a href="${escapeHtml(d.twitter)}" target="_blank" rel="noopener" class="social-link">Twitter</a>` : ''}
          </div>
        </div>
      </div>
    </div>
  </section>

  ${aboutHTML}
  ${skillsHTML}
  ${projectsHTML}
  ${experienceHTML}
  ${educationHTML}
  ${contactHTML}
</main>

<footer class="port-footer">
  <div class="port-container">
    <p>© ${new Date().getFullYear()} ${escapeHtml(d.name || 'Portfolio')} · Built with DevPortfolio Builder</p>
  </div>
</footer>

<script>
  const btn = document.getElementById('port-theme-toggle');
  const html = document.documentElement;
  btn && btn.addEventListener('click', () => {
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  });
  // Scroll animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.port-section').forEach(el => observer.observe(el));
<\/script>
</body>
</html>`;
}

/* ── Template CSS Generator ──────────────────────────────── */
function getTemplateCss(tpl, accent, isDark, font) {
  const darkBg = '#0a0a0f';
  const darkBg2 = '#111118';
  const darkCard = '#16161f';
  const darkText = '#f0f0f8';
  const darkMuted = '#9898b8';
  const darkBorder = 'rgba(255,255,255,0.08)';

  const lightBg = '#ffffff';
  const lightBg2 = '#f8fafc';
  const lightCard = '#ffffff';
  const lightText = '#0f172a';
  const lightMuted = '#64748b';
  const lightBorder = '#e2e8f0';

  const base = `
    :root {
      --accent: ${accent};
      --font: '${font}', 'Inter', sans-serif;
    }
    [data-theme='dark'] {
      --bg: ${darkBg}; --bg2: ${darkBg2}; --card: ${darkCard};
      --text: ${darkText}; --muted: ${darkMuted}; --border: ${darkBorder};
    }
    [data-theme='light'] {
      --bg: ${lightBg}; --bg2: ${lightBg2}; --card: ${lightCard};
      --text: ${lightText}; --muted: ${lightMuted}; --border: ${lightBorder};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; transition: background 0.3s, color 0.3s; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; }
    .port-container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
    .port-nav { position: sticky; top: 0; z-index: 100; background: var(--bg); border-bottom: 1px solid var(--border); backdrop-filter: blur(12px); }
    .port-nav-inner { max-width: 900px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; gap: 24px; }
    .port-nav-brand { font-weight: 700; font-size: 16px; }
    .port-nav-links { flex: 1; display: flex; gap: 4px; }
    .port-nav-links a { padding: 6px 12px; border-radius: 6px; font-size: 14px; color: var(--muted); transition: all 0.2s; }
    .port-nav-links a:hover { color: var(--text); background: var(--bg2); }
    .port-theme-toggle { background: var(--bg2); border: 1px solid var(--border); border-radius: 6px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; color: var(--text); transition: all 0.2s; }
    .port-theme-toggle:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
    .port-section { padding: 80px 0; opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .port-section.visible { opacity: 1; transform: translateY(0); }
    .port-section-title { font-size: 28px; font-weight: 700; margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
    .port-section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .about-content { display: flex; gap: 32px; align-items: flex-start; }
    .about-avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 3px solid var(--accent); }
    .about-text p { color: var(--muted); line-height: 1.8; margin-bottom: 12px; }
    .about-location { display: flex; align-items: center; gap: 6px; font-size: 14px; }
    .skills-groups { display: flex; flex-direction: column; gap: 24px; }
    .skill-group-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 12px; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .port-skill-tag { padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 500; background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .project-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
    .project-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
    .project-img { height: 160px; background-size: cover; background-position: center; }
    .project-img-placeholder { height: 160px; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: 40px; }
    .project-body { padding: 20px; }
    .project-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .project-name { font-size: 16px; font-weight: 600; }
    .project-status { font-size: 11px; padding: 3px 8px; border-radius: 100px; background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent); white-space: nowrap; }
    .project-desc { font-size: 13px; color: var(--muted); margin-bottom: 12px; line-height: 1.6; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .project-tech span { font-size: 11px; padding: 3px 8px; background: var(--bg2); border-radius: 4px; color: var(--muted); border: 1px solid var(--border); }
    .project-links { display: flex; gap: 10px; }
    .project-link { font-size: 13px; font-weight: 500; color: var(--accent); transition: opacity 0.2s; }
    .project-link:hover { opacity: 0.7; }
    .project-link.ghost { color: var(--muted); }
    .timeline { position: relative; padding-left: 24px; }
    .timeline::before { content: ''; position: absolute; left: 6px; top: 0; bottom: 0; width: 2px; background: var(--border); }
    .timeline-item { position: relative; margin-bottom: 32px; }
    .timeline-dot { position: absolute; left: -21px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 2px solid var(--bg); }
    .timeline-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
    .timeline-header h3 { font-size: 16px; font-weight: 600; }
    .timeline-company { font-size: 14px; color: var(--accent); font-weight: 500; }
    .timeline-date { font-size: 12px; color: var(--muted); display: block; margin-bottom: 8px; }
    .timeline-item p { font-size: 14px; color: var(--muted); line-height: 1.7; }
    .edu-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
    .edu-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: flex-start; }
    .edu-icon { font-size: 28px; flex-shrink: 0; }
    .edu-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .edu-card p { font-size: 14px; color: var(--muted); margin-bottom: 4px; }
    .edu-card span { font-size: 12px; color: var(--muted); }
    .edu-desc { font-size: 13px; color: var(--muted); margin-top: 8px; }
    .contact-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 40px; text-align: center; }
    .availability-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 20px; }
    .avail-dot { width: 8px; height: 8px; border-radius: 50%; }
    .contact-msg { color: var(--muted); font-size: 16px; margin-bottom: 24px; line-height: 1.7; }
    .contact-email-btn { display: inline-block; padding: 12px 28px; background: var(--accent); color: #fff; border-radius: 8px; font-weight: 600; font-size: 15px; transition: opacity 0.2s; margin-bottom: 24px; }
    .contact-email-btn:hover { opacity: 0.85; }
    .contact-socials { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
    .contact-socials a { font-size: 14px; color: var(--muted); border: 1px solid var(--border); padding: 6px 16px; border-radius: 6px; transition: all 0.2s; }
    .contact-socials a:hover { color: var(--accent); border-color: var(--accent); }
    .port-footer { padding: 32px 0; border-top: 1px solid var(--border); text-align: center; color: var(--muted); font-size: 13px; }
    @media (max-width: 640px) {
      .about-content { flex-direction: column; }
      .port-nav-links { display: none; }
      .port-hero { padding: 60px 0; }
      .hero-inner { flex-direction: column; text-align: center; align-items: center; }
      .hero-links { justify-content: center; }
      .hero-ctas { flex-direction: column; align-items: center; }
    }
  `;

  const heroBase = `
    .port-hero { padding: 80px 0; }
    .hero-inner { display: flex; align-items: center; gap: 40px; }
    .hero-avatar { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .hero-tagline { font-size: 14px; font-weight: 500; color: var(--accent); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .hero-name { font-size: clamp(36px, 6vw, 64px); font-weight: 800; line-height: 1.1; margin-bottom: 12px; letter-spacing: -1px; }
    .hero-role { font-size: 18px; color: var(--muted); margin-bottom: 24px; }
    .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
    .hero-btn { padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; transition: all 0.2s; display: inline-block; }
    .hero-btn.primary { background: var(--accent); color: #fff; }
    .hero-btn.primary:hover { opacity: 0.85; transform: translateY(-1px); }
    .hero-btn.secondary { border: 1px solid var(--border); color: var(--text); background: var(--card); }
    .hero-btn.secondary:hover { border-color: var(--accent); color: var(--accent); }
    .hero-links { display: flex; gap: 12px; flex-wrap: wrap; }
    .social-link { font-size: 13px; color: var(--muted); transition: color 0.2s; }
    .social-link:hover { color: var(--accent); }
  `;

  if (tpl === 'minimal') {
    return base + heroBase + `
      .port-hero { border-bottom: 1px solid var(--border); }
      .hero-avatar { border-radius: 8px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
      .hero-name { font-weight: 700; }
      .port-section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); font-weight: 600; }
      .port-skill-tag { border-radius: 4px; }
    `;
  }

  if (tpl === 'modern') {
    return base + heroBase + `
      body { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
      .port-nav { grid-column: 1 / -1; }
      main { grid-column: 2; }
      body::before {
        content: '';
        position: fixed; top: 60px; left: 0;
        width: 240px; height: calc(100vh - 60px);
        background: var(--bg2);
        border-right: 1px solid var(--border);
        z-index: -1;
      }
      .port-container { max-width: 860px; }
      .hero-name { font-weight: 900; }
      .hero-avatar { border-radius: 12px; border: none; }
      .port-section-title { font-weight: 800; font-size: 30px; }
      .project-card { border-left: 3px solid var(--accent); }
      @media (max-width: 768px) {
        body { grid-template-columns: 1fr; }
        body::before { display: none; }
        main { grid-column: 1; }
      }
    `;
  }

  if (tpl === 'creative') {
    return base + heroBase + `
      .port-hero {
        padding: 80px 0;
        position: relative;
      }
      .port-hero::before {
        content: '';
        position: fixed; top: 0; left: 0;
        width: 4px; height: 100vh;
        background: var(--accent);
        z-index: 99;
      }
      .port-container { padding-left: 32px; }
      .hero-name { font-weight: 900; font-size: clamp(48px, 8vw, 80px); letter-spacing: -3px; }
      .hero-tagline { color: var(--muted); text-transform: none; letter-spacing: 0; font-size: 16px; }
      .hero-avatar { border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; width: 160px; height: 160px; border: none; box-shadow: 8px 8px 0 var(--accent); }
      .port-section-title { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
      .port-section-title::after { display: none; }
      .port-section-title::before { content: '//'; color: var(--accent); margin-right: 8px; font-family: monospace; }
      .project-card { border-radius: 0; border-top: 3px solid var(--accent); }
      .timeline::before { background: var(--accent); }
    `;
  }

  return base + heroBase;
}

/* ── Update Preview Iframe ───────────────────────────────── */
function updatePreview() {
  if (!App.previewOpen) return;
  const iframe = $('#portfolio-preview');
  if (!iframe) return;
  const html = generatePortfolioHTML();
  iframe.srcdoc = html;
}

/* ── Export HTML ─────────────────────────────────────────── */
$('#export-btn')?.addEventListener('click', () => {
  const html = generatePortfolioHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(App.data.name || 'portfolio').toLowerCase().replace(/\s+/g, '-')}-portfolio.html`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Portfolio exported successfully!');
});

/* ── Seed Demo Data ──────────────────────────────────────── */
function seedDemoData() {
  App.data = {
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    about: 'Passionate developer with 5+ years of experience building scalable web applications. I love turning complex problems into elegant, user-friendly solutions.',
    location: 'San Francisco, CA',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Alex',
    tagline: 'Building things for the web. 🚀',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    website: 'https://alexjohnson.dev',
    email: 'alex@example.com',
    phone: '+1 (555) 000-0000',
    contactMessage: "I'm currently open to exciting new opportunities. Whether you have a project in mind or just want to say hi, my inbox is always open!",
    availability: 'open',
    skills: [
      { id: uid(), name: 'React', category: 'Frontend', level: 5 },
      { id: uid(), name: 'TypeScript', category: 'Frontend', level: 5 },
      { id: uid(), name: 'CSS / Tailwind', category: 'Frontend', level: 4 },
      { id: uid(), name: 'Node.js', category: 'Backend', level: 4 },
      { id: uid(), name: 'Express', category: 'Backend', level: 4 },
      { id: uid(), name: 'Python', category: 'Backend', level: 3 },
      { id: uid(), name: 'PostgreSQL', category: 'Database', level: 4 },
      { id: uid(), name: 'MongoDB', category: 'Database', level: 3 },
      { id: uid(), name: 'Docker', category: 'DevOps', level: 3 },
      { id: uid(), name: 'AWS', category: 'DevOps', level: 3 },
    ],
    projects: [
      {
        id: uid(), name: 'E-Commerce Platform',
        desc: 'A full-stack e-commerce solution with real-time inventory, Stripe payments, and an admin dashboard.',
        live: 'https://demo.com', github: 'https://github.com',
        tech: 'React, Node.js, MongoDB, Stripe',
        image: '', status: 'Completed',
      },
      {
        id: uid(), name: 'TaskFlow — Project Manager',
        desc: 'Kanban-style project management tool with drag-and-drop, team collaboration, and analytics.',
        live: 'https://demo.com', github: 'https://github.com',
        tech: 'Vue.js, Express, PostgreSQL',
        image: '', status: 'Open Source',
      },
      {
        id: uid(), name: 'AI Chat Assistant',
        desc: 'An intelligent chat interface powered by OpenAI with context memory and multi-session support.',
        live: 'https://demo.com', github: 'https://github.com',
        tech: 'React, Python, FastAPI, OpenAI',
        image: '', status: 'In Progress',
      },
    ],
    experience: [
      {
        id: uid(), title: 'Senior Frontend Engineer',
        company: 'TechCorp Inc.', start: 'Jan 2022', end: 'Present',
        desc: 'Led the frontend team of 6 engineers. Rebuilt the main product from scratch using React and TypeScript, achieving a 40% improvement in performance.',
      },
      {
        id: uid(), title: 'Full Stack Developer',
        company: 'StartupXYZ', start: 'Jun 2020', end: 'Dec 2021',
        desc: 'Built and shipped 3 major features that drove 25% user growth. Developed RESTful APIs and integrated third-party services.',
      },
      {
        id: uid(), title: 'Junior Web Developer',
        company: 'WebAgency Co.', start: 'Aug 2019', end: 'May 2020',
        desc: 'Created responsive websites for 15+ clients using React and WordPress. Collaborated closely with designers to bring mockups to life.',
      },
    ],
    education: [
      {
        id: uid(), degree: 'B.Sc. Computer Science',
        school: 'University of California, Berkeley',
        start: '2015', end: '2019',
        desc: 'Graduated with Honors. Focus on algorithms, distributed systems, and software engineering.',
      },
    ],
  };
  saveToLocalStorage();
  showToast('Demo data loaded!');
}

/* ── HTML Escape Helper ──────────────────────────────────── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Hex to RGBA Helper ──────────────────────────────────── */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ── Intersection Observer for Landing Animations ───────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  $$('.slide-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

/* ── Init ────────────────────────────────────────────────── */
function init() {
  initScrollAnimations();
  bindProfileFields();
  loadFromLocalStorage();

  // Set initial page
  showPage('landing-page');

  // Bind all profile input fields after any potential DOM population
  $$('[data-field]').forEach(input => {
    input.addEventListener('change', () => {
      saveToLocalStorage();
    });
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}