// ── Scroll reveal ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Today's date ──
function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTodayDisplay() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const w = weekdays[d.getDay()];
  return `${y}.${m}.${day}  ${w}`;
}

document.getElementById('todayDate').textContent = getTodayDisplay();

// ── Elements ──
const generateBtn   = document.getElementById('generateBtn');
const outputSection = document.getElementById('outputSection');
const outputPre     = document.getElementById('outputPre');
const copyBtn       = document.getElementById('copyBtn');
const copyLabel     = document.getElementById('copyLabel');
const outputFlash   = document.getElementById('outputFlash');
const saveBtn             = document.getElementById('saveBtn');
const saveLabel           = document.getElementById('saveLabel');
const saveToast           = document.getElementById('saveToast');
const savedLogsSection    = document.getElementById('savedLogsSection');
const savedLogsList       = document.getElementById('savedLogsList');
const savedLogsCountEl    = document.getElementById('savedLogsCount');
const savedLogsEmpty      = document.getElementById('savedLogsEmpty');
const clearAllBtn         = document.getElementById('clearAllBtn');
const logsCountText       = document.getElementById('logsCountText');
const tagInput            = document.getElementById('tagInput');

// ── Format helpers ──
function textToList(text) {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(l => `- ${l}`)
    .join('\n');
}

// ── Generate ──
generateBtn.addEventListener('click', () => {
  const didVal     = document.getElementById('did').value;
  const learnedVal = document.getElementById('learned').value;
  const nextVal    = document.getElementById('next').value;

  const date        = getToday();
  const didList     = didVal.trim()     ? textToList(didVal)     : '- （記録なし）';
  const learnedList = learnedVal.trim() ? textToList(learnedVal) : '- （記録なし）';
  const nextList    = nextVal.trim()    ? textToList(nextVal)    : '- （記録なし）';

  const markdown =
`# 📝 学習ログ — ${date}

## ✅ 今日やったこと
${didList}

## 💡 学んだこと
${learnedList}

## 🎯 次にやること
${nextList}`;

  outputPre.textContent = markdown;

  // Show and animate output section
  outputSection.style.display = 'block';
  outputSection.classList.remove('output-section--in');
  void outputSection.offsetWidth;
  outputSection.classList.add('output-section--in');

  // Flash overlay
  outputFlash.classList.remove('output-flash--show');
  void outputFlash.offsetWidth;
  outputFlash.classList.add('output-flash--show');
  setTimeout(() => outputFlash.classList.remove('output-flash--show'), 600);

  // Scroll into view
  setTimeout(() => {
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 80);
});

// ── Saved Logs ──
const LOGS_KEY = 'learning_logs';

function loadLogs() {
  try { return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]'); }
  catch { return []; }
}

function saveLogs(logs) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const w = weekdays[d.getDay()];
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}  ${w}  ·  ${h}:${min}`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function displayName(tag) {
  const map = {
    'github':      'GitHub',
    'claude code': 'Claude Code',
  };
  return map[tag.toLowerCase()] || tag;
}

let activeFilter = 'すべて';

function renderLogs() {
  const logs = loadLogs();
  const count = logs.length;

  // 全ログからタグを重複なく収集
  const allTags = [...new Set(logs.flatMap(l => l.tags || []))];

  // 選択中のタグが消えていたらリセット
  if (activeFilter !== 'すべて' && !allTags.includes(activeFilter)) {
    activeFilter = 'すべて';
  }

  // フィルターバーを描画
  const tagFilterBar = document.getElementById('tagFilterBar');
  if (allTags.length > 0) {
    tagFilterBar.innerHTML = ['すべて', ...allTags].map(tag =>
      `<button class="tag-filter-btn${tag === activeFilter ? ' tag-filter-btn--active' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(displayName(tag))}</button>`
    ).join('');
    tagFilterBar.querySelectorAll('.tag-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.tag;
        renderLogs();
      });
    });
    tagFilterBar.style.display = 'flex';
  } else {
    tagFilterBar.innerHTML = '';
    tagFilterBar.style.display = 'none';
  }

  // 選択中タグでログを絞り込む
  const filtered = activeFilter === 'すべて'
    ? logs
    : logs.filter(l => l.tags && l.tags.includes(activeFilter));

  savedLogsCountEl.textContent = count > 0 ? count : '';
  logsCountText.textContent    = count === 0 ? ''
    : activeFilter === 'すべて' ? `保存したログ: ${count}件`
    : `${activeFilter}: ${filtered.length}件 / 全${count}件`;
  clearAllBtn.style.display    = count > 1 ? 'inline-flex' : 'none';

  if (count === 0) {
    savedLogsEmpty.textContent   = '保存されたログはありません';
    savedLogsEmpty.style.display = 'block';
    savedLogsList.innerHTML      = '';
    return;
  }

  if (filtered.length === 0) {
    savedLogsEmpty.textContent   = `「${activeFilter}」のログはありません`;
    savedLogsEmpty.style.display = 'block';
    savedLogsList.innerHTML      = '';
    return;
  }

  savedLogsEmpty.style.display = 'none';

  // newest first
  const sorted = [...filtered].sort((a, b) => b.id - a.id);

  const tagColors = ['purple', 'cyan', 'green', 'pink'];

  savedLogsList.innerHTML = sorted.map(log => {
    const tagsHtml = (log.tags && log.tags.length > 0)
      ? `<div class="log-item__tags">${log.tags.map((t, i) =>
          `<span class="log-tag log-tag--${tagColors[i % tagColors.length]}">${escapeHtml(displayName(t))}</span>`
        ).join('')}</div>`
      : '';

    return `
    <div class="log-item" id="log-item-${log.id}">
      <div class="log-item__header">
        <span class="log-item__date">${formatTimestamp(log.id)}</span>
        <button class="log-item__delete" data-id="${log.id}" aria-label="削除">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          DELETE
        </button>
      </div>
      ${tagsHtml}
      <pre class="log-item__pre">${escapeHtml(log.markdown)}</pre>
    </div>`;
  }).join('');

  savedLogsList.querySelectorAll('.log-item__delete').forEach(btn => {
    btn.addEventListener('click', () => deleteLog(Number(btn.dataset.id)));
  });
}

function deleteLog(id) {
  const item = document.getElementById(`log-item-${id}`);
  if (item) {
    item.classList.add('log-item--removing');
    setTimeout(() => {
      saveLogs(loadLogs().filter(l => l.id !== id));
      renderLogs();
    }, 280);
  }
}

saveBtn.addEventListener('click', () => {
  const markdown = outputPre.textContent;
  if (!markdown) return;

  const tags = tagInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const logs = loadLogs();
  logs.push({ id: Date.now(), markdown, tags });
  saveLogs(logs);
  renderLogs();

  // Button feedback
  saveLabel.textContent = 'SAVED!';
  saveBtn.classList.add('save-btn--done');
  setTimeout(() => {
    saveLabel.textContent = 'SAVE';
    saveBtn.classList.remove('save-btn--done');
  }, 2000);

  // Toast
  saveToast.classList.remove('save-toast--show');
  void saveToast.offsetWidth;
  saveToast.classList.add('save-toast--show');
  setTimeout(() => saveToast.classList.remove('save-toast--show'), 1800);

  // Scroll to saved logs
  setTimeout(() => {
    savedLogsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 150);
});

clearAllBtn.addEventListener('click', () => {
  saveLogs([]);
  renderLogs();
});

// Init
renderLogs();

// ── Copy ──
copyBtn.addEventListener('click', async () => {
  const text = outputPre.textContent;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  copyLabel.textContent = 'COPIED!';
  copyBtn.classList.add('copy-btn--done');
  setTimeout(() => {
    copyLabel.textContent = 'COPY';
    copyBtn.classList.remove('copy-btn--done');
  }, 2000);
});
