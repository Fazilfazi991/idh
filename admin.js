const cfg = window.IDH_SUPABASE_CONFIG || {};
const supabaseClient = window.supabase?.createClient && cfg.supabaseUrl && cfg.supabaseAnonKey
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const slugify = value => String(value || '').toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const jsonArray = value => String(value || '').split('\n').map(item => item.trim()).filter(Boolean);

const fields = {
  projects: [
    ['title','Title','text','required'], ['slug','Slug','text','required'], ['category','Category','text','required'], ['location','Location','text','required'],
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
  if (!data.session && !location.pathname.includes('admin-login')) {
    location.href = 'admin-login.html';
    return null;
  }
  if (data.session && !location.pathname.includes('admin-login')) {
    const { data: allowed } = await supabaseClient.rpc('is_admin');
    if (!allowed) {
      await supabaseClient.auth.signOut();
      location.href = 'admin-login.html';
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
    location.href = 'admin.html';
  });
}

function inputFor([name, label, type, required]) {
  if (type === 'checkbox') return `<label><span>${label}</span><input type="checkbox" name="${name}" /></label>`;
  if (type.startsWith('select:')) {
    return `<label>${label}<select name="${name}">${type.slice(7).split('|').map(v => `<option value="${v}">${v}</option>`).join('')}</select></label>`;
  }
  if (type === 'textarea') return `<label class="full">${label}<textarea name="${name}" rows="4" ${required}></textarea></label>`;
  return `<label>${label}<input type="${type}" name="${name}" ${required} /></label>`;
}

function renderManager(table) {
  const node = $(`[data-manager="${table}"]`);
  node.innerHTML = `
    <div class="manager-head">
      <div><p class="eyebrow">${table}</p><h2>${titles[table]}</h2><p>Manage published and draft content.</p></div>
      <button class="button button-outline" data-refresh="${table}">Refresh</button>
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
  if (table === 'careers') payload.application_email = payload.application_email || 'careers@idharchitecture.com';
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
  const { data, error } = await supabaseClient.from(table).select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
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
        <p><span class="admin-badge">${item.status || 'draft'}</span>${item.slug || ''}</p>
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

async function loadStats() {
  const wrap = $('[data-admin-stats]');
  if (!wrap) return;
  const [projects, careers, insights] = await Promise.all([
    supabaseClient.from('projects').select('id,status'),
    supabaseClient.from('careers').select('id,status'),
    supabaseClient.from('insights').select('id,status')
  ]);
  const all = [...(projects.data || []), ...(careers.data || []), ...(insights.data || [])];
  const stats = [
    ['Total projects', projects.data?.length || 0],
    ['Published projects', (projects.data || []).filter(i => i.status === 'published').length],
    ['Open careers', (careers.data || []).filter(i => i.status === 'published').length],
    ['Published insights', (insights.data || []).filter(i => i.status === 'published').length],
    ['Draft items', all.filter(i => i.status === 'draft').length]
  ];
  wrap.innerHTML = stats.map(([label, value]) => `<article class="admin-stat"><strong>${value}</strong><span>${label}</span></article>`).join('');
}

async function initAdmin() {
  const session = await protectAdmin();
  if (!session || !$('.admin-page')) return;
  $('[data-admin-user]').textContent = session.user.email;
  ['projects','careers','insights'].forEach(renderManager);
  await Promise.all(['projects','careers','insights'].map(loadList));
  await loadStats();

  $$('[data-admin-tab]').forEach(button => button.addEventListener('click', () => {
    $$('[data-admin-tab]').forEach(btn => btn.classList.remove('active'));
    $$('.admin-section').forEach(section => section.classList.remove('active'));
    button.classList.add('active');
    $(`#${button.dataset.adminTab}`).classList.add('active');
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
      fillForm(edit.dataset.edit, list._items.find(item => item.id === edit.dataset.id));
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
    location.href = 'admin-login.html';
  });
}

handleLogin();
initAdmin();
