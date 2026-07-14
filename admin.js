const cfg = window.IDH_SUPABASE_CONFIG || {};
const supabaseClient = window.supabase?.createClient && cfg.supabaseUrl && cfg.supabaseAnonKey
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const slugify = value => String(value || '').toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const jsonArray = value => String(value || '').split('\n').map(item => item.trim()).filter(Boolean);
const projectCategories = ['Residential Architecture', 'Residential Interior', 'Commercial Architecture', 'Commercial Interior', 'Landscape', 'Others'];
const projectCategorySelect = `select:${projectCategories.join('|')}`;

const fields = {
  projects: [
    ['title','Title','text','required'], ['slug','Slug','text','required'], ['category','Category',projectCategorySelect,'required'], ['location','Location','text','required'],
    ['short_description','Short description','textarea','required'], ['full_description','Full description','textarea',''], ['project_type','Project type','text',''],
    ['year','Year','text',''], ['client_name','Client name','text',''], ['status','Status','select:draft|published',''], ['featured','Featured','checkbox',''],
    ['sort_order','Sort order','number',''], ['cover_image_url','Cover image URL','text','required'], ['gallery_image_urls','Gallery image URLs, one per line','textarea','']
  ],
  careers: [
    ['job_title','Job title','text','required'], ['slug','Slug','text','required'], ['employment_type','Employment type','select:Full-time|Part-time|Internship|Project|Contract','required'],
    ['location','Location','text','required'], ['work_mode','Work mode','select:On-site|Hybrid|Remote',''], ['experience_level','Experience level','text',''],
    ['short_description','Short description','textarea','required'], ['responsibilities','Responsibilities','textarea',''], ['requirements','Requirements','textarea',''],
    ['application_email','Application email','email',''], ['status','Status','select:draft|published|closed',''], ['sort_order','Sort order','number','']
  ],
  insights: [
    ['title','Title','text','required'], ['slug','Slug','text','required'], ['content_type','Content type','select:Announcement|News|Article|Blog','required'],
    ['category_label','Category label','text',''], ['excerpt','Excerpt','textarea','required'], ['body_content','Body content','textarea','required'],
    ['author','Author','text',''], ['published_date','Published date','date',''], ['status','Status','select:draft|published',''], ['featured','Featured','checkbox',''],
    ['sort_order','Sort order','number',''], ['seo_title','SEO title','text',''], ['seo_description','SEO description','textarea',''], ['cover_image_url','Cover image URL','text','']
  ]
};

const titles = { projects: 'Projects Manager', careers: 'Careers Manager', insights: 'Insights Manager' };
const primaryField = { projects: 'title', careers: 'job_title', insights: 'title' };

function requireClient() {
  if (supabaseClient) return true;
  const message = $('[data-admin-message]');
  if (message) message.textContent = 'Supabase config missing. Copy supabase-config.example.js to supabase-config.js.';
  return false;
}

async function protectAdmin() {
  if (!requireClient()) return null;
  const { data } = await supabaseClient.auth.getSession();
  const isLoginPage = location.pathname.includes('/admin/login') || location.pathname.includes('admin-login');
  if (!data.session && !isLoginPage) {
    location.href = '/admin/login';
    return null;
  }
  if (data.session && !isLoginPage) {
    const { data: allowed } = await supabaseClient.rpc('is_admin');
    if (!allowed) {
      await supabaseClient.auth.signOut();
      location.href = '/admin/login';
      return null;
    }
  }
  return data.session;
}

async function handleLogin() {
  const form = $('#adminLoginForm');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = $('[data-admin-message]');
    if (!requireClient()) return;
    message.textContent = 'Signing in...';
    const formData = new FormData(form);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: formData.get('email'),
      password: formData.get('password')
    });
    if (error) {
      message.textContent = 'Unable to sign in. Check the email and password.';
      return;
    }
    location.href = '/admin';
  });
}

function inputFor([name, label, type, required]) {
  if (type === 'checkbox') return `<label><span>${label}</span><input type="checkbox" name="${name}" /></label>`;
  if (type.startsWith('select:')) {
    return `<label>${label}<select name="${name}" ${required}><option value="">Select ${label}</option>${type.slice(7).split('|').map(v => `<option value="${v}">${v}</option>`).join('')}</select></label>`;
  }
  if (type === 'textarea') return `<label class="full">${label}<textarea name="${name}" rows="4" ${required}></textarea></label>`;
  return `<label>${label}<input type="${type}" name="${name}" ${required} /></label>`;
}

function renderManager(table) {
  const node = $(`[data-manager="${table}"]`);
  const filter = table === 'projects' ? `
      <select class="admin-filter-select" data-category-filter>
        <option value="">All categories</option>
        ${projectCategories.map(category => `<option value="${category}">${category}</option>`).join('')}
      </select>` : '';
  node.innerHTML = `
    <div class="manager-head">
      <div><p class="eyebrow">${table}</p><h2>${titles[table]}</h2><p>Manage published and draft content.</p></div>
      <div class="form-actions">${filter}<button class="button button-outline" data-refresh="${table}">Refresh</button></div>
    </div>
    <div class="manager-grid">
      <form class="admin-form" data-form="${table}">
        <input type="hidden" name="id" />
        <div class="form-row">${fields[table].map(inputFor).join('')}</div>
        <label class="full">${table === 'insights' ? 'Upload cover image' : table === 'projects' ? 'Upload cover / gallery images' : 'Upload image'}<input type="file" name="uploads" ${table === 'projects' ? 'multiple' : ''} /></label>
        <div class="form-actions"><button class="button button-gold" type="submit">Save</button><button class="button button-outline" type="button" data-clear="${table}">Clear</button></div>
        <p class="admin-muted" data-note="${table}"></p>
      </form>
      <div class="admin-list" data-list="${table}"></div>
    </div>`;
}

function formValue(form, name) {
  const field = form.elements[name];
  if (!field) return null;
  if (field.type === 'checkbox') return field.checked;
  if (field.type === 'number') return Number(field.value || 0);
  if (name === 'gallery_image_urls') return jsonArray(field.value);
  return field.value || null;
}

async function uploadFiles(table, form, payload) {
  const files = Array.from(form.elements.uploads?.files || []);
  if (!files.length) return payload;
  const bucket = table === 'insights' ? 'insight-images' : 'project-images';
  const urls = [];
  for (const file of files) {
    const path = `${table}/${Date.now()}-${slugify(file.name)}`;
    const { error } = await supabaseClient.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  if (table === 'projects') {
    payload.cover_image_url = payload.cover_image_url || urls[0];
    payload.gallery_image_urls = [...(payload.gallery_image_urls || []), ...urls.slice(payload.cover_image_url === urls[0] ? 1 : 0)];
  } else if (table === 'insights') {
    payload.cover_image_url = payload.cover_image_url || urls[0];
  }
  return payload;
}

async function saveItem(table, form) {
  const note = $(`[data-note="${table}"]`);
  const payload = {};
  fields[table].forEach(([name]) => payload[name] = formValue(form, name));
  payload.slug = payload.slug || slugify(payload[primaryField[table]]);
  if (table === 'careers') payload.application_email = payload.application_email || 'hr@idharchitecture.com';
  await uploadFiles(table, form, payload);
  const id = form.elements.id.value;
  const query = id ? supabaseClient.from(table).update(payload).eq('id', id) : supabaseClient.from(table).insert(payload);
  const { error } = await query;
  note.textContent = error ? 'Unable to save. Check required fields and permissions.' : 'Saved.';
  if (!error) {
    form.reset();
    form.elements.id.value = '';
    await loadList(table);
    await loadStats();
  }
}

function fillForm(table, item) {
  const form = $(`[data-form="${table}"]`);
  form.elements.id.value = item.id;
  fields[table].forEach(([name, , type]) => {
    const field = form.elements[name];
    if (!field) return;
    if (type === 'checkbox') field.checked = Boolean(item[name]);
    else if (name === 'gallery_image_urls') field.value = Array.isArray(item[name]) ? item[name].join('\n') : '';
    else field.value = item[name] ?? '';
  });
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadList(table) {
  const list = $(`[data-list="${table}"]`);
  list.innerHTML = '<p class="admin-muted">Loading...</p>';
  let query = supabaseClient.from(table).select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  const category = table === 'projects' ? $('[data-category-filter]')?.value : '';
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) {
    list.innerHTML = '<p class="admin-muted">Unable to load items.</p>';
    return;
  }
  if (!data.length) {
    list.innerHTML = '<p class="admin-muted">No items available at the moment.</p>';
    return;
  }
  list.innerHTML = data.map(item => `
    <article class="admin-item" data-id="${item.id}">
      <div>
        <h3>${item[primaryField[table]] || item.title}</h3>
        <p><span class="admin-badge">${item.status || 'draft'}</span>${table === 'projects' && item.category ? `${item.category} · ` : ''}${item.slug || ''}</p>
      </div>
      <div class="admin-item-actions">
        <button class="icon-action" data-edit="${table}" data-id="${item.id}">E</button>
        <button class="icon-action" data-delete="${table}" data-id="${item.id}">D</button>
      </div>
    </article>`).join('');
  list._items = data;
}

async function deleteItem(table, id) {
  if (!confirm('Delete this item?')) return;
  const { error } = await supabaseClient.from(table).delete().eq('id', id);
  if (!error) {
    await loadList(table);
    await loadStats();
  }
}

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const startOfMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const startOfDaysAgo = days => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

async function countRows(table, filters = {}) {
  let query = supabaseClient.from(table).select('id', { count: 'exact', head: true });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query = query.eq(key, value);
  });
  const { count, error } = await query;
  return error ? 0 : count || 0;
}

async function countEvents(eventType, since) {
  let query = supabaseClient.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', eventType);
  if (since) query = query.gte('created_at', since);
  const { count, error } = await query;
  return error ? 0 : count || 0;
}

const eventLabel = event => ({
  page_view: 'Page visit',
  project_view: 'Project view',
  insight_view: 'Insight read',
  career_view: 'Career page visit',
  career_apply_click: 'Career apply click'
})[event.event_type] || event.event_type;

const eventTarget = event => event.item_slug || event.page_path || event.item_type || 'Website';

const eventDate = value => value ? new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(value)) : '';

function aggregateEvents(events, eventType) {
  const map = new Map();
  events.filter(event => event.event_type === eventType).forEach(event => {
    const key = event.item_slug || event.page_path || 'unknown';
    const current = map.get(key) || { label: key, count: 0 };
    current.count += 1;
    map.set(key, current);
  });
  return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 8);
}

function tableCard(title, headers, rows, emptyText = 'No activity yet.') {
  const body = rows.length
    ? rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${headers.length}">${emptyText}</td></tr>`;
  return `<article class="admin-table-card"><h3>${title}</h3><table class="admin-table"><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></article>`;
}

async function loadActivityTables(target, since, mode = 'dashboard') {
  const wrap = $(target);
  if (!wrap) return;
  wrap.innerHTML = '<p class="admin-muted">Loading activity...</p>';
  let query = supabaseClient.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(300);
  if (since) query = query.gte('created_at', since);
  const { data, error } = await query;
  if (error) {
    wrap.innerHTML = '<p class="admin-muted">Unable to load analytics.</p>';
    return;
  }
  const events = data || [];
  const projectRows = aggregateEvents(events, 'project_view').map(item => [`<strong>${item.label}</strong>`, item.count]);
  const insightRows = aggregateEvents(events, 'insight_view').map(item => [`<strong>${item.label}</strong>`, item.count]);
  const pageRows = aggregateEvents(events, 'page_view').map(item => [`<strong>${item.label}</strong>`, item.count]);
  const applyRows = aggregateEvents(events, 'career_apply_click').map(item => [`<strong>${item.label}</strong>`, item.count]);
  const recentRows = events.slice(0, 10).map(event => [`<strong>${eventLabel(event)}</strong><small>${eventTarget(event)}</small>`, eventDate(event.created_at)]);
  const cards = mode === 'analytics'
    ? [
      tableCard('Visits by page', ['Page', 'Visits'], pageRows),
      tableCard('Most viewed projects', ['Project', 'Views'], projectRows),
      tableCard('Most read insights', ['Insight', 'Reads'], insightRows),
      tableCard('Career apply clicks', ['Role / Action', 'Clicks'], applyRows),
      tableCard('Recent analytics events', ['Event', 'Time'], recentRows)
    ]
    : [
    tableCard('Most viewed projects', ['Project', 'Views'], projectRows),
    tableCard('Most read insights', ['Insight', 'Reads'], insightRows),
    tableCard('Recent activity', ['Activity', 'Time'], recentRows)
  ];
  wrap.innerHTML = cards.join('');
}

async function loadStats() {
  const wrap = $('[data-admin-stats]');
  if (!wrap) return;
  const [
    websiteVisits,
    todayVisits,
    monthVisits,
    projectViews,
    insightReads,
    careerVisits,
    applyClicks,
    publishedProjects,
    openCareers,
    publishedInsights
  ] = await Promise.all([
    countEvents('page_view'),
    countEvents('page_view', startOfToday()),
    countEvents('page_view', startOfMonth()),
    countEvents('project_view'),
    countEvents('insight_view'),
    countEvents('career_view'),
    countEvents('career_apply_click'),
    countRows('projects', { status: 'published' }),
    countRows('careers', { status: 'published' }),
    countRows('insights', { status: 'published' })
  ]);
  const stats = [
    ['Website Visits', websiteVisits],
    ['Today Visits', todayVisits],
    ['Month Visits', monthVisits],
    ['Project Views', projectViews],
    ['Insight Reads', insightReads],
    ['Career Page Visits', careerVisits],
    ['Apply Clicks', applyClicks],
    ['Published Projects', publishedProjects],
    ['Open Careers', openCareers],
    ['Published Insights', publishedInsights]
  ];
  wrap.innerHTML = stats.map(([label, value]) => `<article class="admin-stat"><strong>${value}</strong><span>${label}</span></article>`).join('');
  await loadActivityTables('[data-dashboard-tables]', startOfDaysAgo(30));
}

async function loadAnalytics(range = 'today') {
  const since = range === 'today' ? startOfToday() : range === '7' ? startOfDaysAgo(7) : range === '30' ? startOfDaysAgo(30) : null;
  await loadActivityTables('[data-analytics-tables]', since, 'analytics');
}

function bindAdminUi() {
  $$('[data-admin-tab]').forEach(button => button.addEventListener('click', () => {
    $$('[data-admin-tab]').forEach(btn => btn.classList.remove('active'));
    $$('.admin-section').forEach(section => section.classList.remove('active'));
    button.classList.add('active');
    $(`#${button.dataset.adminTab}`)?.classList.add('active');
    if (button.dataset.adminTab === 'analytics') {
      history.replaceState(null, '', '/admin/analytics');
      loadAnalytics($('[data-analytics-range] .active')?.dataset.range || 'today');
    } else if (location.pathname.includes('/admin/analytics')) {
      history.replaceState(null, '', '/admin');
    }
  }));

  $('[data-category-filter]')?.addEventListener('change', () => loadList('projects'));

  $$('[data-analytics-range] button').forEach(button => button.addEventListener('click', () => {
    $$('[data-analytics-range] button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    loadAnalytics(button.dataset.range);
  }));

  document.addEventListener('input', event => {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    const source = form.elements[primaryField[form.dataset.form]];
    if (event.target === source && !form.elements.slug.value) form.elements.slug.value = slugify(source.value);
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    event.preventDefault();
    saveItem(form.dataset.form, form);
  });

  document.addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]');
    const del = event.target.closest('[data-delete]');
    const clear = event.target.closest('[data-clear]');
    const refresh = event.target.closest('[data-refresh]');
    if (edit) {
      const list = $(`[data-list="${edit.dataset.edit}"]`);
      const item = list?._items?.find(entry => entry.id === edit.dataset.id);
      if (item) fillForm(edit.dataset.edit, item);
    }
    if (del) deleteItem(del.dataset.delete, del.dataset.id);
    if (clear) {
      const form = $(`[data-form="${clear.dataset.clear}"]`);
      form.reset();
      form.elements.id.value = '';
    }
    if (refresh) loadList(refresh.dataset.refresh);
  });

  $('[data-admin-logout]')?.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    location.href = '/admin/login';
  });
}

async function initAdmin() {
  const session = await protectAdmin();
  if (!session || !$('.admin-page')) return;
  $('[data-admin-user]').textContent = session.user.email;
  ['projects','careers','insights'].forEach(renderManager);
  bindAdminUi();
  if (location.pathname.includes('/admin/analytics')) {
    $('[data-admin-tab="analytics"]')?.click();
  }
  loadStats();
  ['projects','careers','insights'].forEach(loadList);
}

handleLogin();
initAdmin();
