/* ==========================================================================
   مصروفي الذهبي (Masroofi Gold) - Core Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_LANG = 'en';
  const DEFAULT_CURRENCY = 'USD';
  const BUILTIN_CURRENCIES = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'MAD', symbol: 'DH' },
    { code: 'SAR', symbol: 'ر.س' },
    { code: 'AED', symbol: 'د.إ' },
    { code: 'DZD', symbol: 'د.ج' },
    { code: 'EGP', symbol: 'ج.م' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'CNY', symbol: '¥' },
    { code: 'INR', symbol: '₹' },
    { code: 'TRY', symbol: '₺' },
    { code: 'TND', symbol: 'د.ت' },
    { code: 'KWD', symbol: 'د.ك' },
    { code: 'QAR', symbol: 'ر.ق' },
    { code: 'CHF', symbol: 'CHF' },
    { code: 'CAD', symbol: 'CA$' },
    { code: 'AUD', symbol: 'A$' }
  ];

  const WALLET_IDS = ['cash', 'bank', 'crypto', 'gold', 'other', 'blackday'];
  const SPACE_IDS = ['personal', 'business'];
  const COMPANY_TYPES = [
    'construction', 'agriculture', 'trade', 'factory', 'ecommerce', 'services',
    'restaurant', 'logistics', 'realestate', 'healthcare', 'education', 'tech',
    'tourism', 'beauty', 'workshop', 'consulting', 'media', 'energy', 'accounting', 'custom'
  ];
  const BLACK_DAY_MONTH_OPTIONS = [1, 3, 6, 9, 12, 24, 36, 60];
  const ACCENT_PRESETS = {
    gold: '#D4AF37',
    purple: '#A855F7',
    green: '#22C55E',
    pink: '#EC4899',
    blue: '#3B82F6'
  };
  const WALLET_LABELS = {
    cash: 'walletCash',
    bank: 'walletBank',
    crypto: 'walletCrypto',
    gold: 'walletGold',
    other: 'walletOther',
    blackday: 'walletBlackDay'
  };
  const WALLET_PLANS = {
    cash: 'walletPlanCash',
    bank: 'walletPlanBank',
    crypto: 'walletPlanCrypto',
    gold: 'walletPlanGold',
    other: 'walletPlanOther',
    blackday: 'walletPlanBlackDay'
  };
  const WALLET_ICONS = {
    cash: '💵',
    bank: '💳',
    crypto: '🪙',
    gold: '🥇',
    other: '📦',
    blackday: '🛡️'
  };
  const CUSTOM_CAT_COLORS = ['#14B8A6', '#F97316', '#A855F7', '#06B6D4', '#84CC16', '#E11D48', '#6366F1'];
  const PIN_SALT = 'masroofi-gold-pin';

  const categoryColors = {
    food: '#F59E0B', transport: '#3B82F6', bills: '#EF4444', entertainment: '#EC4899',
    health: '#10B981', chronic: '#BE185D', salary: '#8B5CF6', other: '#6B7280'
  };

  const PRODUCT_ICONS = [
    { id: 'phone', emoji: '📱', labelKey: 'iconsPhone' },
    { id: 'laptop', emoji: '💻', labelKey: 'iconsLaptop' },
    { id: 'desktop', emoji: '🖥️', labelKey: 'iconsDesktop' },
    { id: 'house', emoji: '🏠', labelKey: 'iconsHouse' },
    { id: 'car', emoji: '🚗', labelKey: 'iconsCar' },
    { id: 'watch', emoji: '⌚', labelKey: 'iconsWatch' },
    { id: 'headphones', emoji: '🎧', labelKey: 'iconsHeadphones' },
    { id: 'tv', emoji: '📺', labelKey: 'iconsTv' },
    { id: 'clothes', emoji: '👕', labelKey: 'iconsClothes' },
    { id: 'shoes', emoji: '👟', labelKey: 'iconsShoes' },
    { id: 'furniture', emoji: '🛋️', labelKey: 'iconsFurniture' },
    { id: 'jewelry', emoji: '💍', labelKey: 'iconsJewelry' },
    { id: 'game', emoji: '🎮', labelKey: 'iconsGame' },
    { id: 'camera', emoji: '📷', labelKey: 'iconsCamera' },
    { id: 'bike', emoji: '🚲', labelKey: 'iconsBike' },
    { id: 'other', emoji: '🛒', labelKey: 'iconsOther' }
  ];

  const state = {
    lang: resolveStartLang(),
    currency: resolveStartCurrency(),
    activeSpace: normalizeSpace(localStorage.getItem('masroofi_space') || 'personal'),
    initialBalances: loadInitialBalances(),
    transactions: loadJSON('masroofi_txs', []),
    timers: loadJSON('masroofi_timers', []),
    reminders: loadJSON('masroofi_reminders', []),
    notifLog: loadJSON('masroofi_notif_log', []),
    impulseLog: loadJSON('masroofi_impulse', []),
    recurring: loadJSON('masroofi_recurring', []),
    budgets: normalizeBudgets(loadJSON('masroofi_budgets', {})),
    blackDayMonths: normalizeBlackDayMonths(loadNumber('masroofi_blackday_months', 3)),
    customTips: loadJSON('masroofi_custom_tips', []),
    companies: loadCompanies(),
    activeCompanyId: localStorage.getItem('masroofi_active_company') || ''
  };

  const htmlTag = document.documentElement;
  const langSelector = document.getElementById('langSelector');
  const currencySelector = document.getElementById('currencySelector');
  const txModal = document.getElementById('txModal');
  const timerModal = document.getElementById('timerModal');
  const balanceModal = document.getElementById('balanceModal');
  const reminderModal = document.getElementById('reminderModal');
  const currencyModal = document.getElementById('currencyModal');
  const notifPanel = document.getElementById('notifPanel');
  const txForm = document.getElementById('txForm');
  const timerForm = document.getElementById('timerForm');
  const balanceForm = document.getElementById('balanceForm');
  const reminderForm = document.getElementById('reminderForm');
  const currencyForm = document.getElementById('currencyForm');
  const transferForm = document.getElementById('transferForm');
  const recurringForm = document.getElementById('recurringForm');
  const categoryForm = document.getElementById('categoryForm');
  const tipForm = document.getElementById('tipForm');
  const pinForm = document.getElementById('pinForm');
  const companyForm = document.getElementById('companyForm');
  const syncEmailForm = document.getElementById('syncEmailForm');
  const syncCodeForm = document.getElementById('syncCodeForm');
  const timerDelaySelect = document.getElementById('timerDelaySelect');
  const customDateGroup = document.getElementById('customDateGroup');
  const toastEl = document.getElementById('toast');

  let editingTxId = null;
  let editingCompanyId = null;
  let tipShuffleOffset = 0;
  let spendPeriod = localStorage.getItem('masroofi_spend_period') || 'month';
  if (!['week', 'month', 'year'].includes(spendPeriod)) spendPeriod = 'month';
  let toastTimer = null;
  let expiredRendered = new Set();
  let deferredPrompt = null;
  let pendingImage = null;
  let pendingIconId = null;
  let googleAccessToken = '';
  let googleEmail = localStorage.getItem('masroofi_google_email') || '';
  let googleFileId = localStorage.getItem('masroofi_google_file_id') || '';
  if (googleEmail && !localStorage.getItem('masroofi_sync_verified')) {
    try { localStorage.setItem('masroofi_sync_verified', googleEmail.trim().toLowerCase()); } catch (_) {}
  }
  let cloudSyncTimer = null;
  let pendingTimerId = null;
  let lastHiddenAt = 0;
  const DRIVE_BACKUP_NAME = 'masroofi-gold-backup.json';
  let fillingLangSelect = false;

  init();

  function resolveStartLang() {
    const chosen = (localStorage.getItem('masroofi_ui_lang') || '').trim();
    if (chosen && translations[chosen]) return chosen;
    return DEFAULT_LANG;
  }

  function resolveStartCurrency() {
    const chosen = (localStorage.getItem('masroofi_ui_currency') || '').trim();
    if (chosen) return chosen;
    return DEFAULT_CURRENCY;
  }

  function dictFor(lang) {
    const base = translations.en || translations.ar || {};
    const over = translations[lang] || {};
    if (typeof masroofiExtendLang === 'function') return masroofiExtendLang(base, over);
    const out = Object.assign({}, base, over);
    out.categories = Object.assign({}, base.categories || {}, over.categories || {});
    return out;
  }

  function t() {
    return dictFor(state.lang);
  }

  function localeTag() {
    const map = { ar: 'ar', en: 'en', fr: 'fr', zh: 'zh-CN', es: 'es', hi: 'hi', pt: 'pt', ru: 'ru', ja: 'ja', de: 'de' };
    return map[state.lang] || 'en';
  }

  function builtinCatIds() {
    return Object.keys((translations.en || translations.ar || {}).categories || {});
  }

  function customCategories() {
    return loadJSON('masroofi_custom_categories', []);
  }

  function allCategoryIds() {
    return builtinCatIds().concat(customCategories().map((c) => c.id));
  }

  function categoryName(id) {
    const dict = t();
    if (dict.categories && dict.categories[id]) return dict.categories[id];
    const found = customCategories().find((c) => c.id === id);
    return (found && found.name) || id;
  }

  function categoryColor(id) {
    if (categoryColors[id]) return categoryColors[id];
    const idx = Math.abs(String(id).split('').reduce((n, ch) => n + ch.charCodeAt(0), 0));
    return CUSTOM_CAT_COLORS[idx % CUSTOM_CAT_COLORS.length];
  }

  function walletName(id) {
    const key = WALLET_LABELS[id];
    return (key && t()[key]) || id;
  }

  function walletPlan(id) {
    const key = WALLET_PLANS[id];
    return (key && t()[key]) || '';
  }

  function emptyWalletMap() {
    const o = {};
    WALLET_IDS.forEach((id) => { o[id] = 0; });
    return o;
  }

  function capitalMap(amount, primary) {
    const o = emptyWalletMap();
    const key = WALLET_IDS.includes(primary) ? primary : 'cash';
    o[key] = Number(amount) || 0;
    return o;
  }

  function normalizeWalletMap(v) {
    if (typeof v === 'number' && Number.isFinite(v)) return capitalMap(v, 'cash');
    const o = emptyWalletMap();
    if (!v || typeof v !== 'object' || Array.isArray(v)) return o;
    WALLET_IDS.forEach((id) => {
      const n = Number(v[id]);
      if (Number.isFinite(n)) o[id] = n;
    });
    return o;
  }

  function openingTotal(v) {
    const m = normalizeWalletMap(v);
    return WALLET_IDS.reduce((s, id) => s + (Number(m[id]) || 0), 0);
  }

  function openingsFor(key) {
    return normalizeWalletMap(state.initialBalances[key]);
  }

  function walletOpening(id) {
    return Number(openingsFor(balanceKey())[id]) || 0;
  }

  function demoPersonalOpenings() {
    return { cash: 4000, bank: 4000, crypto: 1000, gold: 600, other: 400, blackday: 0 };
  }

  function demoCompanyOpenings() {
    return { cash: 120000, bank: 780000, crypto: 50000, gold: 30000, other: 20000, blackday: 0 };
  }

  function isMoneyTx(tx) {
    return tx && tx.type !== 'transfer';
  }

  function normalizeSpace(id) {
    return id === 'business' ? 'business' : 'personal';
  }

  function normalizeCompanyType(type) {
    return COMPANY_TYPES.includes(type) ? type : 'custom';
  }

  function loadCompanies() {
    return normalizeCompanyList(loadJSON('masroofi_companies', []));
  }

  function normalizeCompanyList(list) {
    if (!Array.isArray(list)) return [];
    return list.filter((c) => c && c.id && String(c.name || '').trim()).map((c) => ({
      id: String(c.id),
      name: String(c.name).trim().slice(0, 60),
      type: normalizeCompanyType(c.type),
      createdAt: Number(c.createdAt) || Date.now()
    }));
  }

  function persistCompanies() {
    try {
      localStorage.setItem('masroofi_companies', JSON.stringify(state.companies || []));
      if (state.activeCompanyId) localStorage.setItem('masroofi_active_company', state.activeCompanyId);
      else localStorage.removeItem('masroofi_active_company');
    } catch (_) {}
  }

  function activeCompanyId() {
    return state.activeCompanyId || '';
  }

  function activeCompany() {
    const id = activeCompanyId();
    return (state.companies || []).find((c) => c.id === id) || null;
  }

  function companyIdOf(item) {
    return item && item.companyId ? String(item.companyId) : '';
  }

  function spaceIdOf(item) {
    return normalizeSpace(item && item.spaceId);
  }

  function inActiveSpace(item) {
    if (spaceIdOf(item) !== state.activeSpace) return false;
    if (state.activeSpace !== 'business') return true;
    const cid = activeCompanyId();
    if (!cid) return false;
    return companyIdOf(item) === cid;
  }

  function spaceTxs() {
    return state.transactions.filter(inActiveSpace);
  }

  function balanceKey() {
    if (state.activeSpace !== 'business') return 'personal';
    return activeCompanyId() || '_none';
  }

  function stampSpaceFields(obj, source) {
    const out = Object.assign({}, obj);
    if (source) {
      out.spaceId = spaceIdOf(source);
      if (out.spaceId === 'business') out.companyId = companyIdOf(source) || activeCompanyId();
      else delete out.companyId;
      return out;
    }
    out.spaceId = state.activeSpace;
    if (state.activeSpace === 'business') {
      const cid = activeCompanyId();
      if (cid) out.companyId = cid;
    }
    return out;
  }

  function activeInitialBalance() {
    return openingTotal(state.initialBalances[balanceKey()]);
  }

  function setActiveInitialBalance(n) {
    state.initialBalances[balanceKey()] = capitalMap(n, 'cash');
    persistInitialBalances();
  }

  function setWalletOpenings(map) {
    state.initialBalances[balanceKey()] = normalizeWalletMap(map);
    persistInitialBalances();
  }

  function persistInitialBalances() {
    try {
      localStorage.setItem('masroofi_initial_balances', JSON.stringify(state.initialBalances));
      localStorage.setItem('masroofi_initial_bal', String(openingTotal(state.initialBalances.personal)));
    } catch (_) {}
  }

  function loadInitialBalances() {
    const stored = loadJSON('masroofi_initial_balances', null);
    if (stored && typeof stored === 'object') {
      const out = {};
      Object.keys(stored).forEach((k) => {
        out[k] = normalizeWalletMap(stored[k]);
      });
      if (!out.personal) out.personal = capitalMap(loadNumber('masroofi_initial_bal', 10000), 'cash');
      return out;
    }
    return {
      personal: capitalMap(loadNumber('masroofi_initial_bal', 10000), 'cash'),
      business: emptyWalletMap()
    };
  }

  function normalizeBudgets(raw) {
    if (!raw || typeof raw !== 'object') return { personal: {} };
    const looksFlat = Object.keys(raw).length && Object.keys(raw).every((k) => typeof raw[k] !== 'object' || raw[k] === null);
    if (!('personal' in raw) && !('business' in raw) && looksFlat) {
      return { personal: Object.assign({}, raw) };
    }
    const out = {};
    Object.keys(raw).forEach((k) => {
      const v = raw[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = v;
    });
    if (!out.personal) out.personal = {};
    return out;
  }

  function activeBudgets() {
    const key = balanceKey();
    if (!state.budgets[key] || typeof state.budgets[key] !== 'object') {
      state.budgets[key] = {};
    }
    return state.budgets[key];
  }

  function companyTypeLabel(type) {
    const dict = t();
    const key = normalizeCompanyType(type);
    return (dict.companyTypes && dict.companyTypes[key]) || key;
  }

  function newCompanyId() {
    return 'co_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function stampUnassignedBusiness(companyId) {
    const mark = (item) => {
      if (spaceIdOf(item) === 'business' && !companyIdOf(item)) item.companyId = companyId;
    };
    state.transactions.forEach(mark);
    state.recurring.forEach(mark);
  }

  function ensureCompaniesMigrated() {
    if (!Array.isArray(state.companies)) state.companies = [];
    let changed = false;
    const unassignedTx = state.transactions.filter((tx) => spaceIdOf(tx) === 'business' && !companyIdOf(tx));
    const unassignedRec = state.recurring.filter((r) => spaceIdOf(r) === 'business' && !companyIdOf(r));
    const bizBal = openingTotal(state.initialBalances.business);
    const bizBudgets = (state.budgets && state.budgets.business && typeof state.budgets.business === 'object')
      ? state.budgets.business
      : {};
    const hasLegacy = unassignedTx.length || unassignedRec.length || bizBal > 0 || Object.keys(bizBudgets).length > 0;

    if (state.companies.length === 0 && hasLegacy) {
      const id = 'co_legacy';
      state.companies.push({
        id,
        name: t().defaultCompanyName || t().spaceBusiness,
        type: 'trade',
        createdAt: Date.now()
      });
      state.activeCompanyId = id;
      if (bizBal > 0) {
        state.initialBalances[id] = normalizeWalletMap(state.initialBalances.business);
        state.initialBalances.business = emptyWalletMap();
      }
      if (Object.keys(bizBudgets).length) {
        state.budgets[id] = Object.assign({}, bizBudgets);
        state.budgets.business = {};
      }
      stampUnassignedBusiness(id);
      changed = true;
    } else if (hasLegacy && state.companies.length) {
      const id = state.activeCompanyId || state.companies[0].id;
      stampUnassignedBusiness(id);
      if (bizBal > 0 && openingTotal(state.initialBalances[id]) <= 0) {
        state.initialBalances[id] = normalizeWalletMap(state.initialBalances.business);
        state.initialBalances.business = emptyWalletMap();
      }
      if (Object.keys(bizBudgets).length && (!state.budgets[id] || !Object.keys(state.budgets[id]).length)) {
        state.budgets[id] = Object.assign({}, bizBudgets);
        state.budgets.business = {};
      }
      changed = true;
    }

    if (state.companies.length && !state.companies.some((c) => c.id === state.activeCompanyId)) {
      state.activeCompanyId = state.companies[0].id;
      changed = true;
    }
    if (changed) {
      persistCompanies();
      persistInitialBalances();
      saveData({ skipCloud: true });
    }
  }

  function personalDemoTransactions(dict, today, prevDate) {
    return [
      { id: 'tx_1', type: 'income', description: dict.demoTx1, amount: 8000, category: 'salary', date: prevDate, walletId: 'bank', spaceId: 'personal' },
      { id: 'tx_2', type: 'expense', description: dict.demoTx2, amount: 2500, category: 'other', date: today, walletId: 'cash', spaceId: 'personal' },
      { id: 'tx_3', type: 'expense', description: dict.demoTx3, amount: 450, category: 'food', date: today, walletId: 'cash', spaceId: 'personal' },
      { id: 'tx_4', type: 'expense', description: dict.demoTx4, amount: 300, category: 'transport', date: prevDate, walletId: 'cash', spaceId: 'personal' },
      { id: 'tx_5', type: 'expense', description: dict.demoTx5, amount: 800, category: 'bills', date: today, walletId: 'bank', spaceId: 'personal' },
      { id: 'tx_6', type: 'expense', description: dict.demoTxChronic, amount: 200, category: 'chronic', date: today, walletId: 'cash', spaceId: 'personal' }
    ];
  }

  function isOldDemoRecurringId(id) {
    return id === 'rec_demo_wifi' || id === 'rec_demo_mobile';
  }

  function demoRecurringSeedKey(id) {
    if (isOldDemoRecurringId(id)) return 'masroofi_demo_recurring';
    if (id === 'rec_demo_rent') return 'masroofi_demo_rent_bill';
    return 'masroofi_demo_home_bills';
  }

  function personalDemoRecurring(dict) {
    const month = monthKey();
    const rec = (id, description, amount, category, day) => ({
      id,
      type: 'expense',
      description,
      amount,
      category,
      walletId: 'bank',
      dayOfMonth: day,
      enabled: true,
      lastPosted: month,
      spaceId: 'personal'
    });
    return [
      rec('rec_demo_wifi', dict.demoRecWifi, 250, 'bills', 1),
      rec('rec_demo_mobile', dict.demoRecMobile, 99, 'bills', 5),
      rec('rec_demo_health', dict.demoRecHealth, 450, 'health', 2),
      rec('rec_demo_water', dict.demoRecWater, 180, 'bills', 8),
      rec('rec_demo_electric', dict.demoRecElectric, 320, 'bills', 10),
      rec('rec_demo_gas', dict.demoRecGas, 150, 'bills', 12),
      rec('rec_demo_maintain', dict.demoRecMaintain, 200, 'bills', 15),
      rec('rec_demo_rent', dict.demoRecRent, 2500, 'bills', 1)
    ];
  }

  function personalDemoRecurringTxs(dict) {
    const month = monthKey();
    const tx = (id, description, amount, category, day) => ({
      id: 'tx_rec_' + id + '_' + month,
      type: 'expense',
      description,
      amount,
      category,
      date: `${month}-${String(day).padStart(2, '0')}`,
      walletId: 'bank',
      recurringId: id,
      spaceId: 'personal'
    });
    return [
      tx('rec_demo_wifi', dict.demoRecWifi, 250, 'bills', 1),
      tx('rec_demo_mobile', dict.demoRecMobile, 99, 'bills', 5),
      tx('rec_demo_health', dict.demoRecHealth, 450, 'health', 2),
      tx('rec_demo_water', dict.demoRecWater, 180, 'bills', 8),
      tx('rec_demo_electric', dict.demoRecElectric, 320, 'bills', 10),
      tx('rec_demo_gas', dict.demoRecGas, 150, 'bills', 12),
      tx('rec_demo_maintain', dict.demoRecMaintain, 200, 'bills', 15),
      tx('rec_demo_rent', dict.demoRecRent, 2500, 'bills', 1)
    ];
  }

  function applyDemoRecurringExamples() {
    const seedKeys = ['masroofi_demo_recurring', 'masroofi_demo_home_bills', 'masroofi_demo_rent_bill'];
    const flags = {};
    try {
      seedKeys.forEach((key) => { flags[key] = localStorage.getItem(key) === '1'; });
    } catch (_) {}
    if (seedKeys.every((key) => flags[key])) return;
    const dict = t();
    let changed = false;
    personalDemoRecurring(dict).forEach((demo) => {
      if (state.recurring.some((item) => item.id === demo.id)) return;
      if (flags[demoRecurringSeedKey(demo.id)]) return;
      state.recurring.push(demo);
      changed = true;
    });
    personalDemoRecurringTxs(dict).forEach((demo) => {
      if (state.transactions.some((tx) => tx.id === demo.id)) return;
      if (flags[demoRecurringSeedKey(demo.recurringId)]) return;
      state.transactions.push(demo);
      changed = true;
    });
    try {
      seedKeys.forEach((key) => localStorage.setItem(key, '1'));
    } catch (_) {}
    if (changed) saveData({ skipCloud: true });
  }

  function applyPersonalCapitalExample() {
    // Keep the personal demo path on 10,000 DH capital (not the old 1,000,000).
    const hasDemoPersonal = state.transactions.some((tx) => /^tx_[1-6]$/.test(tx.id) && spaceIdOf(tx) === 'personal');
    let changed = false;

    const personalTotal = openingTotal(state.initialBalances.personal);
    if (personalTotal === 1000000) {
      state.initialBalances.personal = hasDemoPersonal ? demoPersonalOpenings() : capitalMap(10000, 'cash');
      persistInitialBalances();
      changed = true;
    }

    if (hasDemoPersonal) {
      const dict = t();
      const today = localISODate();
      const prevDate = localISODate(new Date(Date.now() - 86400000 * 3));
      personalDemoTransactions(dict, today, prevDate).forEach((demo) => {
        const idx = state.transactions.findIndex((tx) => tx.id === demo.id);
        if (idx === -1) return;
        const cur = state.transactions[idx];
        if (Number(cur.amount) !== Number(demo.amount) || cur.category !== demo.category || spaceIdOf(cur) !== 'personal') {
          state.transactions[idx] = Object.assign({}, cur, demo);
          changed = true;
        }
      });
    }

    if (changed) saveData({ skipCloud: true });
  }

  function demoTimerSpecs() {
    return {
      timer_demo_1: { price: 480000, days: 30, repeat: 'monthly', iconId: 'house' },
      timer_demo_2: { price: 7500, days: 7, repeat: 'weekly', iconId: 'laptop' }
    };
  }

  function applyDemoTimerExamples() {
    const specs = demoTimerSpecs();
    const oldPrices = { timer_demo_1: [1500000], timer_demo_2: [250000] };
    let changed = false;
    state.timers.forEach((tm) => {
      const spec = specs[tm.id];
      if (!spec) return;
      const price = Number(tm.price) || 0;
      const wasOld = (oldPrices[tm.id] || []).includes(price);
      if (!wasOld && price !== spec.price) return;
      if (price !== spec.price) {
        tm.price = spec.price;
        changed = true;
      }
      if (tm.repeat !== spec.repeat) {
        tm.repeat = spec.repeat;
        changed = true;
      }
      const remaining = Number(tm.targetTimestamp) - Date.now();
      const wanted = spec.days * 86400000;
      if (!tm.decision && (wasOld || remaining > wanted * 1.2 || remaining < wanted * 0.4)) {
        tm.targetTimestamp = Date.now() + wanted;
        changed = true;
      }
    });
    state.reminders.forEach((rem) => {
      const tm = state.timers.find((item) => item.id === rem.sourceId);
      if (!tm || !specs[tm.id]) return;
      if (rem.nextAt !== tm.targetTimestamp) {
        rem.nextAt = tm.targetTimestamp;
        changed = true;
      }
    });
    if (changed) saveData({ skipCloud: true });
  }

  function setActiveSpace(space) {
    state.activeSpace = normalizeSpace(space);
    try { localStorage.setItem('masroofi_space', state.activeSpace); } catch (_) {}
    if (state.activeSpace === 'business') ensureCompaniesMigrated();
    updateSpaceToggle();
    renderAll();
    if (state.activeSpace === 'business' && !(state.companies || []).length) openCompanyModal();
  }

  function requireActiveCompany() {
    if (state.activeSpace !== 'business') return true;
    if (activeCompanyId()) return true;
    showToast(t().noCompanyYet);
    openCompanyModal();
    return false;
  }

  function setActiveCompany(id) {
    if (!state.companies.some((c) => c.id === id)) return;
    state.activeCompanyId = id;
    persistCompanies();
    updateCompanyBar();
    renderAll();
  }

  function businessDemoTransactions(dict, today, prevDate, companyId) {
    const cid = companyId || 'co_demo';
    return [
      { id: 'tx_b1', type: 'income', description: dict.demoBizSale || dict.demoBizIncome, amount: 85000, category: 'salary', date: prevDate, walletId: 'bank', spaceId: 'business', companyId: cid, demoKey: 'demoBizSale' },
      { id: 'tx_b2', type: 'expense', description: dict.demoBizRent || dict.demoBizExpense, amount: 12000, category: 'bills', date: today, walletId: 'bank', spaceId: 'business', companyId: cid, demoKey: 'demoBizRent' },
      { id: 'tx_b3', type: 'expense', description: dict.demoBizPayroll || dict.demoBizExpense, amount: 35000, category: 'other', date: today, walletId: 'bank', spaceId: 'business', companyId: cid, demoKey: 'demoBizPayroll' },
      { id: 'tx_b4', type: 'expense', description: dict.demoBizSupplies || dict.demoBizExpense, amount: 7500, category: 'other', date: today, walletId: 'cash', spaceId: 'business', companyId: cid, demoKey: 'demoBizSupplies' }
    ];
  }

  function templateCapital(type) {
    if (type === 'construction') return 250000;
    if (type === 'factory' || type === 'realestate' || type === 'energy') return 400000;
    if (type === 'ecommerce' || type === 'trade' || type === 'beauty') return 80000;
    return 150000;
  }

  function templateCategories(type) {
    const dict = t();
    const named = (id, key) => ({ id, name: dict[key] || id });
    if (type === 'construction') {
      return [named('co_materials', 'catCoMaterials'), named('co_labor', 'catCoLabor'), named('co_equipment', 'catCoEquipment')];
    }
    if (type === 'agriculture') return [named('co_ops', 'catCoOps'), named('co_inventory', 'catCoInventory')];
    if (type === 'factory') return [named('co_materials', 'catCoMaterials'), named('co_labor', 'catCoLabor')];
    if (type === 'ecommerce' || type === 'trade') return [named('co_inventory', 'catCoInventory'), named('co_ads', 'catCoAds')];
    if (type === 'media' || type === 'consulting') return [named('co_ads', 'catCoAds')];
    return [];
  }

  function ensureTemplateCategories(type) {
    const extras = templateCategories(type);
    if (!extras.length) return;
    const list = customCategories();
    let changed = false;
    extras.forEach((cat) => {
      if (builtinCatIds().includes(cat.id)) return;
      if (!list.some((c) => c.id === cat.id)) {
        list.push({ id: cat.id, name: cat.name });
        changed = true;
      }
    });
    if (changed) {
      try { localStorage.setItem('masroofi_custom_categories', JSON.stringify(list)); } catch (_) {}
      fillCategorySelects();
    }
  }

  function templateDemoTxs(type, companyId) {
    const dict = t();
    const today = localISODate();
    const prev = localISODate(new Date(Date.now() - 86400000 * 3));
    const stamp = { spaceId: 'business', companyId };
    const prefix = 'tx_' + companyId + '_';
    const label = companyTypeLabel(type);
    const fill = (key) => String(dict[key] || '').replace('{type}', label);
    if (type === 'custom') return [];
    if (type === 'construction') {
      return [
        Object.assign({ id: prefix + '1', type: 'income', description: dict.demoCoPay, amount: 180000, category: 'salary', date: prev, walletId: 'bank', demoKey: 'demoCoPay' }, stamp),
        Object.assign({ id: prefix + '2', type: 'expense', description: dict.demoCoMaterials, amount: 62000, category: 'co_materials', date: today, walletId: 'cash', demoKey: 'demoCoMaterials' }, stamp),
        Object.assign({ id: prefix + '3', type: 'expense', description: dict.demoCoLabor, amount: 38000, category: 'co_labor', date: today, walletId: 'bank', demoKey: 'demoCoLabor' }, stamp),
        Object.assign({ id: prefix + '4', type: 'expense', description: dict.demoCoEquipment, amount: 22000, category: 'co_equipment', date: today, walletId: 'cash', demoKey: 'demoCoEquipment' }, stamp)
      ];
    }
    return [
      Object.assign({ id: prefix + '1', type: 'income', description: fill('demoTplIncome'), amount: 45000, category: 'salary', date: prev, walletId: 'bank', demoTpl: 'demoTplIncome', tplType: type }, stamp),
      Object.assign({ id: prefix + '2', type: 'expense', description: fill('demoTplOps'), amount: 12000, category: 'bills', date: today, walletId: 'bank', demoTpl: 'demoTplOps', tplType: type }, stamp),
      Object.assign({ id: prefix + '3', type: 'expense', description: fill('demoTplStock'), amount: 8500, category: 'other', date: today, walletId: 'cash', demoTpl: 'demoTplStock', tplType: type }, stamp)
    ];
  }

  function applyCompanyTemplate(company) {
    if (!company || company.type === 'custom') return;
    ensureTemplateCategories(company.type);
    const hasTx = state.transactions.some((tx) => spaceIdOf(tx) === 'business' && companyIdOf(tx) === company.id);
    if (!hasTx) {
      state.transactions = state.transactions.concat(templateDemoTxs(company.type, company.id));
    }
    if (openingTotal(state.initialBalances[company.id]) <= 0) {
      state.initialBalances[company.id] = capitalMap(templateCapital(company.type), 'bank');
      persistInitialBalances();
    }
  }

  function fillCompanyTypeSelect(selected) {
    const sel = document.getElementById('companyTypeSelect');
    if (!sel) return;
    const current = selected || sel.value || 'construction';
    sel.innerHTML = COMPANY_TYPES.map((type) => {
      const mark = type === current ? ' selected' : '';
      return `<option value="${type}"${mark}>${escapeHtml(companyTypeLabel(type))}</option>`;
    }).join('');
  }

  function syncCompanyTplCheckbox() {
    const type = document.getElementById('companyTypeSelect')?.value || 'custom';
    const box = document.getElementById('companyApplyTpl');
    const row = document.getElementById('companyTplRow');
    const isCustom = type === 'custom';
    if (row) row.hidden = isCustom;
    if (box) {
      box.disabled = isCustom;
      if (isCustom) box.checked = false;
      else if (!editingCompanyId) box.checked = true;
    }
  }

  function updateCompanyBar() {
    const bar = document.getElementById('companyBar');
    const select = document.getElementById('companySelect');
    const hint = document.getElementById('txtCompanyTypeHint');
    if (!bar || !select) return;
    const show = state.activeSpace === 'business';
    bar.hidden = !show;
    if (!show) return;
    const list = state.companies || [];
    bar.classList.toggle('is-empty', list.length === 0);
    select.innerHTML = list.map((c) => {
      const mark = c.id === state.activeCompanyId ? ' selected' : '';
      return `<option value="${escapeHtml(c.id)}"${mark}>${escapeHtml(c.name)}</option>`;
    }).join('');
    if (state.activeCompanyId) select.value = state.activeCompanyId;
    const co = activeCompany();
    if (hint) {
      hint.textContent = list.length === 0
        ? (t().noCompanyYet || '')
        : (co ? companyTypeLabel(co.type) : '');
    }
  }

  function updateSpaceToggle() {
    document.querySelectorAll('#spaceToggle [data-space]').forEach((btn) => {
      const active = btn.dataset.space === state.activeSpace;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const label = document.getElementById('lblActiveSpace');
    if (label) {
      const dict = t();
      const co = state.activeSpace === 'business' ? activeCompany() : null;
      label.textContent = co ? co.name : (state.activeSpace === 'business' ? dict.spaceBusiness : dict.spacePersonal);
    }
    updateCompanyBar();
    const spaceHint = document.getElementById('lblSpaceHint');
    if (spaceHint) spaceHint.hidden = state.activeSpace !== 'business';
  }

  function openCompanyModal(editId) {
    if (!companyForm) return;
    editingCompanyId = editId || null;
    companyForm.reset();
    fillCompanyTypeSelect(editingCompanyId ? (activeCompany()?.type || 'construction') : 'construction');
    const co = editingCompanyId ? state.companies.find((c) => c.id === editingCompanyId) : null;
    document.getElementById('companyNameInput').value = co ? co.name : '';
    if (co) fillCompanyTypeSelect(co.type);
    document.getElementById('modalCompanyTitle').textContent = editingCompanyId ? t().editCompany : t().addCompany;
    const del = document.getElementById('btnDeleteCompany');
    if (del) del.hidden = !editingCompanyId;
    syncCompanyTplCheckbox();
    const tplBox = document.getElementById('companyApplyTpl');
    if (tplBox && editingCompanyId) tplBox.checked = false;
    document.getElementById('companyModal').classList.add('active');
    document.getElementById('companyNameInput').focus();
  }

  function closeCompanyModal() {
    document.getElementById('companyModal').classList.remove('active');
    companyForm.reset();
    editingCompanyId = null;
  }

  function handleCompanySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('companyNameInput').value.trim();
    const type = normalizeCompanyType(document.getElementById('companyTypeSelect').value);
    const applyTpl = document.getElementById('companyApplyTpl').checked && type !== 'custom';
    if (!name) {
      showToast(t().companyNeedName);
      return;
    }
    if (editingCompanyId) {
      const co = state.companies.find((c) => c.id === editingCompanyId);
      if (!co) return;
      co.name = name.slice(0, 60);
      co.type = type;
      if (applyTpl) applyCompanyTemplate(co);
      persistCompanies();
      saveData();
      closeCompanyModal();
      updateSpaceToggle();
      renderAll();
      showToast(t().companyUpdated);
      return;
    }
    const id = newCompanyId();
    const co = { id, name: name.slice(0, 60), type, createdAt: Date.now() };
    state.companies.push(co);
    state.activeCompanyId = id;
    if (applyTpl) applyCompanyTemplate(co);
    else state.initialBalances[id] = normalizeWalletMap(state.initialBalances[id]);
    persistCompanies();
    persistInitialBalances();
    saveData();
    closeCompanyModal();
    updateSpaceToggle();
    renderAll();
    showToast(t().companyAdded);
  }

  function deleteEditingCompany() {
    if (!editingCompanyId) return;
    if (!confirm(t().confirmDeleteCompany || t().confirmDelete)) return;
    const id = editingCompanyId;
    state.companies = state.companies.filter((c) => c.id !== id);
    state.transactions = state.transactions.filter((tx) => !(spaceIdOf(tx) === 'business' && companyIdOf(tx) === id));
    state.recurring = state.recurring.filter((r) => !(spaceIdOf(r) === 'business' && companyIdOf(r) === id));
    delete state.initialBalances[id];
    if (state.budgets) delete state.budgets[id];
    if (state.activeCompanyId === id) {
      state.activeCompanyId = state.companies[0] ? state.companies[0].id : '';
    }
    persistCompanies();
    persistInitialBalances();
    saveData();
    closeCompanyModal();
    updateSpaceToggle();
    renderAll();
    showToast(t().companyDeleted);
  }

  function walletBalance(id) {
    let bal = walletOpening(id);
    spaceTxs().forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'transfer') {
        if (tx.fromWallet === id) bal -= amt;
        if (tx.toWallet === id) bal += amt;
        return;
      }
      const w = tx.walletId || 'cash';
      if (w !== id) return;
      if (tx.type === 'income') bal += amt;
      else bal -= amt;
    });
    return bal;
  }

  function monthKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function txInMonth(tx, key) {
    return String(tx.date || '').slice(0, 7) === key;
  }

  function monthTotals(key) {
    let income = 0;
    let expenses = 0;
    spaceTxs().forEach((tx) => {
      if (!isMoneyTx(tx) || !txInMonth(tx, key)) return;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else expenses += amt;
    });
    return { income, expenses };
  }

  function categorySpentThisMonth(cat) {
    const key = monthKey();
    return spaceTxs().reduce((sum, tx) => {
      if (!isMoneyTx(tx) || tx.type !== 'expense' || tx.category !== cat || !txInMonth(tx, key)) return sum;
      return sum + (Number(tx.amount) || 0);
    }, 0);
  }

  function avgMonthlyExpenses() {
    const now = new Date();
    let total = 0;
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      total += monthTotals(monthKey(d)).expenses;
    }
    return total / 3;
  }

  function normalizeBlackDayMonths(n) {
    const v = Number(n);
    return BLACK_DAY_MONTH_OPTIONS.includes(v) ? v : 3;
  }

  function blackDayOptionLabel(months) {
    const dict = t();
    const m = Number(months) || 0;
    if (m < 12) return (dict.blackDayOptMonths || '{n}').replace('{n}', String(m));
    if (m === 12) return dict.blackDayOptYear || '1y';
    return (dict.blackDayOptYears || '{n}').replace('{n}', String(m / 12));
  }

  function fillBlackDayMonthsSelect() {
    const sel = document.getElementById('blackDayMonths');
    if (!sel) return;
    const current = normalizeBlackDayMonths(state.blackDayMonths);
    sel.innerHTML = BLACK_DAY_MONTH_OPTIONS.map((m) =>
      `<option value="${m}">${escapeHtml(blackDayOptionLabel(m))}</option>`
    ).join('');
    sel.value = String(current);
  }

  function blackDayTarget() {
    const months = normalizeBlackDayMonths(state.blackDayMonths);
    const avg = avgMonthlyExpenses();
    return Math.max(avg * months, 0);
  }

  function hexToRgb(hex) {
    const raw = String(hex || '').replace('#', '');
    const h = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    const n = parseInt(h, 16);
    if (!Number.isFinite(n) || h.length !== 6) return { r: 212, g: 175, b: 55 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
  }

  function mixHexColors(hexes) {
    const list = (hexes || []).map(hexToRgb);
    if (!list.length) return ACCENT_PRESETS.gold;
    return rgbToHex(
      list.reduce((s, c) => s + c.r, 0) / list.length,
      list.reduce((s, c) => s + c.g, 0) / list.length,
      list.reduce((s, c) => s + c.b, 0) / list.length
    );
  }

  function shadeHex(hex, amt) {
    const { r, g, b } = hexToRgb(hex);
    const t = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    return rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
  }

  function hexToRgba(hex, a) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function loadAccentTheme() {
    const raw = loadJSON('masroofi_accent', null);
    if (raw && raw.id === 'custom') {
      return {
        id: 'custom',
        c1: raw.c1 || '#A855F7',
        c2: raw.c2 || '#22C55E',
        c3: raw.c3 || '#3B82F6'
      };
    }
    const id = raw && ACCENT_PRESETS[raw.id] ? raw.id : 'gold';
    return { id };
  }

  function persistAccentTheme(theme) {
    try { localStorage.setItem('masroofi_accent', JSON.stringify(theme)); } catch (_) {}
  }

  function applyAccentTheme(theme) {
    const cfg = theme && theme.id ? theme : loadAccentTheme();
    let mid = ACCENT_PRESETS[cfg.id] || ACCENT_PRESETS.gold;
    let light = shadeHex(mid, 0.45);
    let dark = shadeHex(mid, -0.32);
    let gradient = `linear-gradient(135deg, ${light} 0%, ${mid} 50%, ${dark} 100%)`;
    if (cfg.id === 'custom') {
      const c1 = cfg.c1 || '#A855F7';
      const c2 = cfg.c2 || '#22C55E';
      const c3 = cfg.c3 || '#3B82F6';
      mid = mixHexColors([c1, c2, c3]);
      light = shadeHex(mid, 0.45);
      dark = shadeHex(mid, -0.32);
      gradient = `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
      const m1 = document.getElementById('themeMix1');
      const m2 = document.getElementById('themeMix2');
      const m3 = document.getElementById('themeMix3');
      if (m1) m1.value = c1;
      if (m2) m2.value = c2;
      if (m3) m3.value = c3;
    }
    const root = document.documentElement;
    root.style.setProperty('--gold-primary', mid);
    root.style.setProperty('--gold-light', light);
    root.style.setProperty('--gold-dark', dark);
    root.style.setProperty('--gold-gradient', gradient);
    root.style.setProperty('--gold-glow', hexToRgba(mid, 0.25));
    root.style.setProperty('--text-gold', light);
    root.style.setProperty('--border-gold', hexToRgba(mid, 0.3));
    root.style.setProperty('--shadow-gold', `0 10px 30px -5px ${hexToRgba(mid, 0.15)}`);
    [4, 5, 8, 10, 12, 15, 18, 22, 35].forEach((n) => {
      const key = n < 10 ? '0' + n : String(n);
      root.style.setProperty('--gold-' + key, hexToRgba(mid, n / 100));
    });
    updateThemeMixPreview();
    syncThemeMixActive(cfg.id);
  }

  function updateThemeMixPreview() {
    const c1 = document.getElementById('themeMix1')?.value || '#A855F7';
    const c2 = document.getElementById('themeMix2')?.value || '#22C55E';
    const c3 = document.getElementById('themeMix3')?.value || '#3B82F6';
    const s1 = document.getElementById('themeMixSwatch1');
    const s2 = document.getElementById('themeMixSwatch2');
    const s3 = document.getElementById('themeMixSwatch3');
    const el = document.getElementById('themeMixPreview');
    if (s1) s1.style.background = c1;
    if (s2) s2.style.background = c2;
    if (s3) s3.style.background = c3;
    if (el) el.style.background = `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`;
  }

  function syncThemeMixActive(themeId) {
    const result = document.getElementById('btnThemeMixResult');
    if (!result) return;
    const on = (themeId || loadAccentTheme().id) === 'custom';
    result.classList.toggle('active', on);
    result.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  let themePickSlot = 1;

  function mixPalette() {
    return [
      '#D4AF37', '#A855F7', '#22C55E', '#EC4899', '#3B82F6', '#F97316',
      '#14B8A6', '#EF4444', '#EAB308', '#8B5CF6', '#FFFFFF', '#64748B'
    ];
  }

  function fillThemePalette() {
    const box = document.getElementById('themePalette');
    if (!box) return;
    box.innerHTML = mixPalette().map((hex) =>
      `<button type="button" class="theme-palette-btn" data-hex="${hex}" style="background:${hex}" aria-label="${hex}"></button>`
    ).join('');
  }

  function setThemeRgbSliders(hex) {
    const { r, g, b } = hexToRgb(hex);
    const rr = document.getElementById('themeRgbR');
    const gg = document.getElementById('themeRgbG');
    const bb = document.getElementById('themeRgbB');
    if (rr) rr.value = r;
    if (gg) gg.value = g;
    if (bb) bb.value = b;
    setText('themeRgbRVal', String(r));
    setText('themeRgbGVal', String(g));
    setText('themeRgbBVal', String(b));
  }

  function colorFromThemeRgb() {
    const r = Number(document.getElementById('themeRgbR')?.value || 0);
    const g = Number(document.getElementById('themeRgbG')?.value || 0);
    const b = Number(document.getElementById('themeRgbB')?.value || 0);
    return rgbToHex(r, g, b);
  }

  function setMixSlotColor(slot, hex) {
    const input = document.getElementById('themeMix' + slot);
    if (input) input.value = hex;
    updateThemeMixPreview();
  }

  function openThemePicker(slot) {
    themePickSlot = slot;
    const picker = document.getElementById('themePicker');
    if (!picker) return;
    fillThemePalette();
    const current = document.getElementById('themeMix' + slot)?.value || '#A855F7';
    setThemeRgbSliders(current);
    picker.hidden = false;
    picker.scrollIntoView({ block: 'nearest' });
  }

  function closeThemePicker() {
    const picker = document.getElementById('themePicker');
    if (picker) picker.hidden = true;
  }

  function applyCustomAccentMix() {
    const theme = {
      id: 'custom',
      c1: document.getElementById('themeMix1').value,
      c2: document.getElementById('themeMix2').value,
      c3: document.getElementById('themeMix3').value
    };
    applyAccentTheme(theme);
    persistAccentTheme(theme);
    renderThemeSwatches();
  }

  function renderThemeSwatches() {
    const box = document.getElementById('themeSwatches');
    if (!box) return;
    const current = loadAccentTheme();
    const dict = t();
    const items = [
      { id: 'gold', label: dict.themeGold, mark: '★' },
      { id: 'purple', label: dict.themePurple, mark: '◆' },
      { id: 'green', label: dict.themeGreen, mark: '■' },
      { id: 'pink', label: dict.themePink, mark: '▲' },
      { id: 'blue', label: dict.themeBlue, mark: '●' }
    ];
    box.innerHTML = items.map((item) => {
      const on = current.id === item.id;
      const name = item.label || item.id;
      return `<button type="button" class="theme-choice${on ? ' active' : ''}" data-accent="${item.id}" aria-pressed="${on ? 'true' : 'false'}" aria-label="${escapeHtml(name)}">
        <span class="theme-dot theme-dot-${item.id}" aria-hidden="true">${item.mark}</span>
        <span class="theme-name">${escapeHtml(name)}</span>
      </button>`;
    }).join('');
  }

  function impulseSavedTotal(key) {
    return (state.impulseLog || []).reduce((sum, item) => {
      if (key) {
        const at = new Date(item.at);
        if (monthKey(at) !== key) return sum;
      }
      return sum + (Number(item.amount) || 0);
    }, 0);
  }

  function init() {
    applyAccentTheme(loadAccentTheme());
    state.lang = resolveStartLang();
    state.currency = resolveStartCurrency();
    try {
      localStorage.setItem('masroofi_lang', state.lang);
      localStorage.setItem('masroofi_currency', state.currency);
    } catch (_) {}
    fillLangSelect();
    fillCurrencySelect();
    langSelector.value = state.lang;
    currencySelector.value = state.currency;

    if (state.transactions.length === 0 && state.timers.length === 0 && !localStorage.getItem('masroofi_has_run')) {
      loadDemoData(false);
      localStorage.setItem('masroofi_has_run', 'true');
    }
    ensureInstalledAt();
    applyPersonalCapitalExample();
    applyDemoTimerExamples();
    applyDemoRecurringExamples();
    ensureCompaniesMigrated();

    applyLanguage(state.lang);
    bindEvents();
    updateSpaceToggle();
    showScreen('home');
    postDueRecurring();
    renderAll();
    welcomeTipToast();
    checkDueReminders();
    setInterval(updateTimersCountdown, 1000);
    setInterval(checkDueReminders, 15000);
    setInterval(postDueRecurring, 60000);
    updateOnlineStatus();
    syncRemindersToSW();
    registerBackgroundSync();
    const savedClient = localStorage.getItem('masroofi_google_client_id') || '';
    document.getElementById('googleClientIdInput').value = savedClient;
    document.getElementById('blackDayMonths').value = String(normalizeBlackDayMonths(state.blackDayMonths));
    updateSyncUI();
    updateLockButtons();
    if (pinHash()) lockApp();
  }

  function bindEvents() {
    langSelector.addEventListener('change', (e) => {
      if (fillingLangSelect) return;
      const next = e.target.value;
      if (!translations[next]) {
        fillLangSelect();
        return;
      }
      state.lang = next;
      try {
        localStorage.setItem('masroofi_ui_lang', state.lang);
        localStorage.setItem('masroofi_lang', state.lang);
      } catch (_) {}
      const selected = LANG_OPTIONS.find((l) => l.code === state.lang);
      langSelector.title = selected ? selected.native : state.lang;
      applyLanguage(state.lang);
      renderAll();
    });

    currencySelector.addEventListener('change', (e) => {
      state.currency = e.target.value;
      try {
        localStorage.setItem('masroofi_currency', state.currency);
        localStorage.setItem('masroofi_ui_currency', state.currency);
      } catch (_) {}
      document.getElementById('btnDeleteCurrency').hidden = !customCurrencies().some((c) => c.code === state.currency);
      syncCurrencySymbol();
      renderAll();
    });

    document.getElementById('spaceToggle').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-space]');
      if (!btn) return;
      setActiveSpace(btn.dataset.space);
    });
    document.getElementById('companySelect').addEventListener('change', (e) => {
      setActiveCompany(e.target.value);
    });
    document.getElementById('btnAddCompany').addEventListener('click', () => openCompanyModal());
    document.getElementById('btnEditCompany').addEventListener('click', () => {
      if (activeCompanyId()) openCompanyModal(activeCompanyId());
    });
    document.getElementById('btnCloseCompany').addEventListener('click', closeCompanyModal);
    document.getElementById('btnDeleteCompany').addEventListener('click', deleteEditingCompany);
    companyForm.addEventListener('submit', handleCompanySubmit);
    document.getElementById('companyTypeSelect').addEventListener('change', syncCompanyTplCheckbox);

    tipForm.addEventListener('submit', handleTipSubmit);
    document.getElementById('btnOpenTipModal').addEventListener('click', openTipModal);
    document.getElementById('btnCloseTipModal').addEventListener('click', closeTipModal);
    document.getElementById('btnShuffleTip').addEventListener('click', (e) => {
      e.stopPropagation();
      cycleHomeTip();
    });
    const tipOfDayCard = document.getElementById('tipOfDayCard');
    tipOfDayCard.addEventListener('click', () => cycleHomeTip());
    tipOfDayCard.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      cycleHomeTip();
    });
    document.getElementById('homeTipCard').addEventListener('click', (e) => {
      if (e.target.closest('#btnOpenTipsFromHome')) return;
      cycleHomeTip();
    });
    document.getElementById('homeTipCard').addEventListener('keydown', (e) => {
      if (e.target.closest('#btnOpenTipsFromHome')) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      cycleHomeTip();
    });
    document.getElementById('btnOpenTipsFromHome').addEventListener('click', () => showScreen('tips'));
    document.getElementById('btnToggleHomeTip').addEventListener('click', (e) => {
      e.stopPropagation();
      setHomeTipVisible(!homeTipVisible());
    });
    document.getElementById('customTipsList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="delete-tip"]');
      if (btn) deleteCustomTip(btn.dataset.id);
    });

    document.getElementById('spendPeriodToggle').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-period]');
      if (!btn) return;
      spendPeriod = btn.dataset.period;
      try { localStorage.setItem('masroofi_spend_period', spendPeriod); } catch (_) {}
      updateSpendPeriodToggle();
      renderMoneyGone();
      renderAnalyticsChart();
    });

    document.getElementById('btnEditBalance').addEventListener('click', () => openBalanceModal());
    document.getElementById('btnOpenIncomeModal').addEventListener('click', () => openTxModal('income'));
    document.getElementById('btnOpenExpenseModal').addEventListener('click', () => openTxModal('expense'));
    document.getElementById('btnOpenTimerModal').addEventListener('click', openTimerModal);

    document.getElementById('btnCloseTxModal').addEventListener('click', closeTxModal);
    document.getElementById('btnCloseTimerModal').addEventListener('click', closeTimerModal);
    document.getElementById('btnCloseBalanceModal').addEventListener('click', closeBalanceModal);
    document.getElementById('btnCloseReminderModal').addEventListener('click', closeReminderModal);

    txForm.addEventListener('submit', handleTxSubmit);
    timerForm.addEventListener('submit', handleTimerSubmit);
    balanceForm.addEventListener('submit', handleBalanceSubmit);
    reminderForm.addEventListener('submit', handleReminderSubmit);
    currencyForm.addEventListener('submit', handleCurrencySubmit);
    transferForm.addEventListener('submit', handleTransferSubmit);
    recurringForm.addEventListener('submit', handleRecurringSubmit);
    categoryForm.addEventListener('submit', handleCategorySubmit);
    pinForm.addEventListener('submit', handlePinSubmit);
    document.getElementById('unlockForm').addEventListener('submit', handleUnlock);
    document.getElementById('btnAddCurrency').addEventListener('click', openCurrencyModal);
    document.getElementById('btnCloseCurrencyModal').addEventListener('click', closeCurrencyModal);
    document.getElementById('btnDeleteCurrency').addEventListener('click', deleteCustomCurrency);
    document.getElementById('btnOpenTransfer').addEventListener('click', openTransferModal);
    document.getElementById('walletGrid').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-open-wallet]');
      if (!chip) return;
      openBalanceModal(chip.getAttribute('data-open-wallet'));
    });
    document.getElementById('btnCloseTransfer').addEventListener('click', closeTransferModal);
    document.getElementById('btnOpenRecurring').addEventListener('click', openRecurringModal);
    document.getElementById('btnCloseRecurring').addEventListener('click', closeRecurringModal);
    document.getElementById('btnAddCategory').addEventListener('click', openCategoryModal);
    document.getElementById('btnCloseCategory').addEventListener('click', closeCategoryModal);
    document.getElementById('btnSetPin').addEventListener('click', openPinModal);
    document.getElementById('themeSwatches').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-accent]');
      if (!btn) return;
      const id = btn.getAttribute('data-accent');
      applyAccentTheme({ id });
      persistAccentTheme({ id });
      renderThemeSwatches();
    });
    document.querySelector('.theme-mix-row').addEventListener('click', (e) => {
      if (e.target.closest('#btnThemeMixResult')) {
        closeThemePicker();
        applyCustomAccentMix();
        return;
      }
      const btn = e.target.closest('[data-mix-slot]');
      if (!btn) return;
      openThemePicker(Number(btn.getAttribute('data-mix-slot')) || 1);
    });
    document.getElementById('themePalette').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-hex]');
      if (!btn) return;
      const hex = btn.getAttribute('data-hex');
      setThemeRgbSliders(hex);
      setMixSlotColor(themePickSlot, hex);
    });
    ['themeRgbR', 'themeRgbG', 'themeRgbB'].forEach((id) => {
      document.getElementById(id).addEventListener('input', () => {
        const hex = colorFromThemeRgb();
        setMixSlotColor(themePickSlot, hex);
        const { r, g, b } = hexToRgb(hex);
        setText('themeRgbRVal', String(r));
        setText('themeRgbGVal', String(g));
        setText('themeRgbBVal', String(b));
      });
    });
    document.getElementById('btnCloseThemePicker').addEventListener('click', closeThemePicker);
    document.getElementById('btnApplyThemeMix').addEventListener('click', () => {
      closeThemePicker();
      applyCustomAccentMix();
    });
    document.getElementById('btnClosePin').addEventListener('click', closePinModal);
    document.getElementById('btnRemovePin').addEventListener('click', removePin);
    document.getElementById('btnForgotPin').addEventListener('click', recoverPinViaGmail);
    document.getElementById('btnDecideBought').addEventListener('click', () => decideTimer('bought'));
    document.getElementById('btnDecideSkip').addEventListener('click', () => decideTimer('skipped'));
    document.getElementById('btnDecideWait').addEventListener('click', () => decideTimer('wait'));
    document.getElementById('blackDayMonths').addEventListener('change', (e) => {
      state.blackDayMonths = normalizeBlackDayMonths(e.target.value);
      try { localStorage.setItem('masroofi_blackday_months', String(state.blackDayMonths)); } catch (_) {}
      renderAll();
    });

    timerDelaySelect.addEventListener('change', (e) => {
      customDateGroup.hidden = e.target.value !== 'custom';
    });

    document.getElementById('txRemindCheck').addEventListener('change', (e) => {
      document.getElementById('txRemindGroup').hidden = !e.target.checked;
    });

    document.getElementById('timerBellCheck').addEventListener('change', (e) => {
      document.getElementById('timerRepeatGroup').hidden = !e.target.checked;
    });

    document.getElementById('txSearchInput').addEventListener('input', renderTransactions);
    document.getElementById('txCategoryFilter').addEventListener('change', renderTransactions);

    document.getElementById('btnLoadDemo').addEventListener('click', () => loadDemoData(true));
    document.getElementById('btnResetData').addEventListener('click', resetAllData);
    document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
    document.getElementById('btnConnectGmail').addEventListener('click', openSyncVerifyModal);
    document.getElementById('btnCloseSyncVerify').addEventListener('click', closeSyncVerifyModal);
    syncEmailForm.addEventListener('submit', handleSyncEmailSubmit);
    syncCodeForm.addEventListener('submit', handleSyncCodeSubmit);
    document.getElementById('btnResendSyncCode').addEventListener('click', () => handleSyncEmailSubmit({ preventDefault() {} }));
    document.getElementById('btnDisconnectGmail').addEventListener('click', disconnectGoogle);
    document.getElementById('btnSyncNow').addEventListener('click', () => uploadToDrive(false));
    document.getElementById('btnRestoreCloud').addEventListener('click', restoreFromDrive);
    document.getElementById('btnSendGmail').addEventListener('click', shareBackupToGmail);
    document.getElementById('btnSaveBackup').addEventListener('click', downloadBackup);
    document.getElementById('btnCopyPlan').addEventListener('click', copyPlanToClipboard);
    document.getElementById('btnRestoreFile').addEventListener('click', () => document.getElementById('backupFileInput').click());
    document.getElementById('backupFileInput').addEventListener('change', handleBackupFile);
    document.getElementById('googleClientIdInput').addEventListener('change', (e) => {
      localStorage.setItem('masroofi_google_client_id', e.target.value.trim());
    });
    document.getElementById('btnInstallPwa').addEventListener('click', installPwa);

    document.getElementById('btnBell').addEventListener('click', openNotifPanel);
    document.getElementById('btnCloseNotif').addEventListener('click', closeNotifPanel);
    document.getElementById('btnEnableNotifs').addEventListener('click', requestNotifPermission);
    document.getElementById('btnAddReminder').addEventListener('click', openReminderModal);
    document.getElementById('btnMarkRead').addEventListener('click', markAllRead);

    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeNotifPanel();
        showScreen(btn.dataset.screen);
      });
    });
    const goHome = () => {
      closeNotifPanel();
      setActiveSpace('personal');
      showScreen('home');
    };
    document.getElementById('btnBrandHome').addEventListener('click', goHome);
    document.getElementById('btnBrandHome').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      goHome();
    });

    document.getElementById('transactionList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'edit') editTx(btn.dataset.id);
      if (btn.dataset.action === 'delete') deleteTx(btn.dataset.id);
      if (btn.dataset.action === 'remind-tx') quickRemindTx(btn.dataset.id);
    });

    document.getElementById('timerCardsList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'delete-timer') deleteTimer(btn.dataset.id);
      if (btn.dataset.action === 'snooze-timer') snoozeTimer(btn.dataset.id);
      if (btn.dataset.action === 'decide-timer') openAffordModal(btn.dataset.id);
    });

    document.getElementById('quickAddRow').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-quick]');
      if (chip) quickAddExpense(chip.dataset.quick);
    });

    document.getElementById('recurringList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'delete-recurring') deleteRecurring(btn.dataset.id);
      if (btn.dataset.action === 'toggle-recurring') toggleRecurring(btn.dataset.id);
    });

    document.getElementById('budgetList').addEventListener('change', (e) => {
      const input = e.target.closest('[data-budget]');
      if (!input) return;
      const cat = input.dataset.budget;
      const val = parseFloat(input.value);
      const budgets = activeBudgets();
      if (!Number.isFinite(val) || val < 0) {
        delete budgets[cat];
      } else {
        budgets[cat] = val;
      }
      try { localStorage.setItem('masroofi_budgets', JSON.stringify(state.budgets)); } catch (_) {}
      renderBudgets();
    });

    document.getElementById('notifList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'toggle-reminder') toggleReminder(btn.dataset.id);
      if (btn.dataset.action === 'delete-reminder') deleteReminder(btn.dataset.id);
      if (btn.dataset.action === 'snooze-reminder') snoozeReminder(btn.dataset.id);
    });

    document.getElementById('productIconGrid').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-icon]');
      if (!chip) return;
      selectIcon(chip.dataset.icon);
    });

    document.getElementById('timerImageInput').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) setImageFromFile(file);
      e.target.value = '';
    });

    document.getElementById('btnClearImage').addEventListener('click', clearPendingMedia);
    document.getElementById('imageDropZone').addEventListener('click', () => {
      document.getElementById('imageDropZone').focus();
    });

    document.addEventListener('paste', (e) => {
      if (!timerModal.classList.contains('active') && !reminderModal.classList.contains('active')) return;
      const imageItem = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
      if (imageItem && timerModal.classList.contains('active')) {
        e.preventDefault();
        setImageFromFile(imageItem.getAsFile());
        return;
      }
      const text = e.clipboardData?.getData('text') || '';
      const url = parseBuyUrl(text);
      if (!url) return;
      const target = e.target;
      if (target && (target.id === 'timerBuyUrl' || target.id === 'reminderBuyUrl' || target.id === 'timerItemName')) {
        e.preventDefault();
        if (timerModal.classList.contains('active')) {
          document.getElementById('timerBuyUrl').value = url;
          if (target.id === 'timerItemName' && !document.getElementById('timerItemName').value.trim()) {
            document.getElementById('timerItemName').value = hostFromUrl(url);
          }
        }
        if (reminderModal.classList.contains('active')) {
          document.getElementById('reminderBuyUrl').value = url;
        }
        showToast(t().linkSaved);
      }
    });

    document.getElementById('btnPasteBuyUrl').addEventListener('click', pasteBuyUrlFromClipboard);
    document.getElementById('timerBuyUrl').addEventListener('paste', (e) => {
      const text = e.clipboardData?.getData('text') || '';
      const url = parseBuyUrl(text);
      if (!url) return;
      e.preventDefault();
      document.getElementById('timerBuyUrl').value = url;
    });

    window.addEventListener('online', () => {
      updateOnlineStatus();
      pingSWCheck();
      registerBackgroundSync();
      if (localStorage.getItem('masroofi_pending_cloud') === '1') {
        scheduleCloudSync();
        showToast(t().pendingSyncQueued);
      }
    });
    window.addEventListener('offline', updateOnlineStatus);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const data = event.data || {};
        if (data.type === 'REMINDERS_UPDATED' && Array.isArray(data.reminders)) {
          state.reminders = data.reminders;
          saveData({ skipSync: true });
          renderNotifList();
          updateBellBadge();
        }
        if (data.type === 'OPEN_TIMERS') showScreen('timers');
      });
    }

    const dropZone = document.getElementById('imageDropZone');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) setImageFromFile(file);
    });

    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllModals();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
        closeNotifPanel();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        lastHiddenAt = Date.now();
        return;
      }
      checkDueReminders();
      postDueRecurring();
      if (pinHash() && lastHiddenAt && Date.now() - lastHiddenAt > 120000) lockApp();
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.getElementById('btnInstallPwa').hidden = false;
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      document.getElementById('btnInstallPwa').hidden = true;
      showToast(t().appInstalled);
    });
  }

  function applyLanguage(lang) {
    const dict = dictFor(lang);
    htmlTag.setAttribute('lang', lang);
    htmlTag.setAttribute('dir', (lang === 'ar' || lang === 'ur') ? 'rtl' : 'ltr');

    setText('txtAppName', dict.appName);
    document.title = dict.appName;
    const brandHome = document.getElementById('btnBrandHome');
    if (brandHome) {
      brandHome.setAttribute('aria-label', dict.navHome || dict.appName);
      brandHome.title = dict.navHome || dict.appName;
    }
    setText('txtSlogan', dict.slogan);
    setText('lblTotalBalance', dict.balance);
    setText('lblIncome', dict.income);
    setText('lblExpenses', dict.expenses);
    setText('lblSpacePersonal', dict.spacePersonal);
    setText('lblSpaceBusiness', dict.spaceBusiness);
    setText('lblSpaceHint', dict.spaceHint);
    setText('lblCompanySelect', dict.companyActive);
    setText('txtAddCompany', dict.addCompany);
    setText('txtEditCompany', dict.editCompany);
    setText('lblCompanyName', dict.companyName);
    setText('lblCompanyType', dict.companyType);
    setText('txtCompanyApplyTpl', dict.companyApplyTpl);
    setText('txtCompanyTplHint', dict.companyTplHint);
    setText('btnCloseCompany', dict.cancel);
    setText('txtDeleteCompany', dict.deleteCompany);
    setText('btnSaveCompany', dict.saveShort);
    fillCompanyTypeSelect(document.getElementById('companyTypeSelect')?.value);
    document.getElementById('companyNameInput').placeholder = dict.defaultCompanyName || '';
    setText('lblFinancialHealth', dict.financialHealth);
    setText('lblPurchaseTimers', dict.purchaseTimers);
    setText('btnAddTimer', dict.addTimer);
    setText('btnAddIncome', dict.incomeType);
    setText('btnAddExpense', dict.expense);
    setText('lblAnalytics', dict.analytics);
    setText('lblTxHistory', dict.transactionsHistory);
    applyDataI18n(dict);
    setText('lblWallets', dict.walletTitle);
    setText('txtTransfer', dict.transfer);
    setText('lblBlackDay', dict.blackDayTitle);
    setText('txtBlackDayHint', dict.blackDayHint);
    setText('lblRecurring', dict.recurringTitle);
    setText('txtAddRecurring', dict.addRecurring);
    setText('lblLockTitle', dict.lockTitle);
    setText('txtLockHint', dict.lockHint);
    setText('lblTheme', dict.themeTitle);
    setText('txtThemeHint', dict.themeHint);
    setText('lblThemeMix', dict.themeMix);
    setText('txtApplyThemeMix', dict.themeApplyMix);
    setText('lblThemeMix1', dict.themeMixA);
    setText('lblThemeMix2', dict.themeMixB);
    setText('lblThemeMix3', dict.themeMixC);
    setText('lblThemeMixResult', dict.themeMixResult);
    setText('txtThemePicker', dict.themePicker);
    setText('txtCloseThemePicker', dict.close || dict.cancel);
    const b1 = document.getElementById('btnThemeMix1');
    const b2 = document.getElementById('btnThemeMix2');
    const b3 = document.getElementById('btnThemeMix3');
    if (b1) b1.setAttribute('aria-label', dict.themeMixA);
    if (b2) b2.setAttribute('aria-label', dict.themeMixB);
    if (b3) b3.setAttribute('aria-label', dict.themeMixC);
    const mixResult = document.getElementById('btnThemeMixResult');
    if (mixResult) mixResult.setAttribute('aria-label', dict.themeApplyMix);
    updateThemeMixPreview();
    renderThemeSwatches();
    setText('txtSetPin', pinHash() ? dict.changePin : dict.setPin);
    setText('txtRemovePin', dict.removePin);
    setText('lblRecap', dict.recapTitle);
    setText('lblBudgets', dict.budgets);
    setText('lblMoneyGone', dict.moneyGoneTitle);
    setText('lblPeriodWeek', dict.periodWeek);
    setText('lblPeriodMonth', dict.periodMonth);
    setText('lblPeriodYear', dict.periodYear);
    setText('lblOnTrack', dict.onTrackTitle);
    setText('lblProfitCompare', dict.profitCompareTitle);
    setText('lblJourney', dict.journeyTitle);
    setText('lblDisclaimerTitle', dict.disclaimerTitle);
    setText('txtDisclaimer', dict.disclaimerBody);
    setText('lblFormWallet', dict.wallet);
    setText('lblTimerCategory', dict.category);
    setText('modalAffordTitle', dict.affordTitle);
    setText('btnDecideBought', dict.decideBought);
    setText('btnDecideSkip', dict.decideSkip);
    setText('btnDecideWait', dict.decideWait);
    setText('lblMoveBlackDay', dict.blackDayMove);
    setText('modalTransferTitle', dict.transfer);
    setText('lblTransferFrom', dict.fromWallet);
    setText('lblTransferTo', dict.transferTo);
    setText('lblTransferAmount', dict.amount);
    setText('btnSaveTransfer', dict.transfer);
    setText('btnCloseTransfer', dict.cancel);
    setText('modalRecurringTitle', dict.addRecurring);
    setText('lblRecurringDesc', dict.description);
    setText('lblRecurringAmount', dict.amount);
    setText('lblRecurringType', dict.type);
    setText('lblRecurringCat', dict.category);
    setText('lblRecurringWallet', dict.wallet);
    setText('lblRecurringDay', dict.dayOfMonth);
    setText('btnSaveRecurring', dict.saveShort);
    setText('btnCloseRecurring', dict.cancel);
    setText('modalCategoryTitle', dict.addCategory);
    setText('lblCategoryName', dict.categoryName);
    setText('btnSaveCategory', dict.saveShort);
    setText('btnCloseCategory', dict.cancel);
    setText('modalPinTitle', dict.setPin);
    setText('lblPinNew', dict.pinPlaceholder);
    setText('lblPinConfirm', dict.pinConfirm);
    setText('txtPinRecoveryHint', googleEmail ? dict.pinRecoveryHintReady : dict.pinRecoveryHint);
    setText('btnSavePin', dict.saveShort);
    setText('btnClosePin', dict.cancel);
    setText('txtLockAppName', dict.appName);
    setText('txtUnlockHint', dict.unlockHint || dict.unlock);
    setText('btnUnlock', dict.unlock);
    setText('txtForgotPin', dict.forgotPin);
    ['pinNew', 'pinConfirm', 'unlockPin'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.placeholder = dict.pinPlaceholder || '';
    });
    if (!txModal.classList.contains('active')) setText('modalTxTitle', dict.addTransaction);
    document.getElementById('spaceToggle')?.setAttribute('aria-label', `${dict.spacePersonal} / ${dict.spaceBusiness}`);
    const lockLogo = document.querySelector('.lock-logo');
    if (lockLogo) lockLogo.alt = dict.appName;
    document.getElementById('blackDayMonths').setAttribute('aria-label', dict.blackDayMonths);
    fillBlackDayMonthsSelect();
    document.getElementById('customCategoryName').placeholder = dict.customCategoryPh || '';
    setText('lblInstallApp', dict.installApp);
    setText('txtPwaHint', dict.pwaHint);
    setText('txtPwaInstructions', `${dict.iosInstructions} ${dict.androidInstructions}`);
    setText('lblSyncTitle', dict.syncTitle);
    setText('txtSyncHint', dict.syncHint);
    setText('btnConnectGmail', dict.connectGmail);
    setText('modalSyncVerifyTitle', dict.syncVerifyTitle);
    setText('lblSyncGmail', dict.syncGmailLabel);
    setText('txtSyncGmailHint', dict.syncGmailHint);
    setText('btnSendSyncCode', dict.syncSendCode);
    setText('lblSyncCode', dict.syncCodeLabel);
    setText('txtSyncCodeHint', dict.syncCodeHint);
    setText('btnResendSyncCode', dict.syncResendCode);
    setText('btnConfirmSyncCode', dict.syncConfirmCode);
    setText('btnCloseSyncVerify', dict.cancel);
    document.getElementById('syncGmailInput').placeholder = 'you@gmail.com';
    setText('btnDisconnectGmail', dict.disconnectGmail);
    setText('btnSyncNow', dict.syncNow);
    setText('btnRestoreCloud', dict.restoreCloud);
    setText('btnSendGmail', dict.sendGmail);
    setText('btnSaveBackup', dict.saveBackup);
    setText('btnCopyPlan', dict.copyPlan);
    setText('btnRestoreFile', dict.restoreFile);
    setText('txtPlanFileHint', dict.planFileHint);
    setText('lblGoogleClient', dict.googleClientId);
    setText('txtGoogleClientHint', dict.googleClientHint);
    setText('txtPwaInstructions', `${dict.iosInstructions} ${dict.androidInstructions}`);
    setText('btnTxtDemo', dict.loadDemo);
    setText('btnTxtExport', dict.exportCSV);
    setText('btnTxtReset', dict.resetData);
    setText('btnTxtInstall', dict.installNow);
    setText('lblNavHome', dict.navHome);
    setText('lblNavTimers', dict.navTimers);
    setText('lblNavTips', dict.navTips);
    setText('lblNavAnalytics', dict.navAnalytics);
    setText('lblTipsTitle', dict.tipsTitle);
    setText('txtTipsHint', dict.tipsHint);
    setText('txtAddTip', dict.addTip);
    setText('lblMyTips', dict.myTips);
    setText('lblBuiltinTips', dict.tipsLibrary);
    setText('txtShuffleTip', dict.shuffleTip);
    setText('txtSeeAllTips', dict.seeAllTips);
    const homeTipCard = document.getElementById('homeTipCard');
    if (homeTipCard) homeTipCard.title = dict.shuffleTip || '';
    const tipOfDayCard = document.getElementById('tipOfDayCard');
    if (tipOfDayCard) tipOfDayCard.title = dict.shuffleTip || '';
    updateHomeTipVisibility();
    setText('modalTipTitle', dict.addTip);
    setText('lblTipKind', dict.tipKind);
    setText('lblTipText', dict.tipText);
    setText('optTipMotivation', dict.tipKindMotivation);
    setText('optTipAlert', dict.tipKindAlert);
    setText('optTipIdea', dict.tipKindIdea);
    setText('btnSaveTip', dict.saveShort);
    setText('btnCloseTipModal', dict.cancel);
    document.getElementById('tipTextInput').placeholder = dict.tipPlaceholder || '';
    setText('txtEditBalance', dict.editBalance);
    setText('modalBalanceTitle', dict.startingBalance);
    setText('txtBalanceWalletsHint', dict.startingBalanceHint);
    setText('txtWalletsHint', dict.walletsHint);
    setText('btnSaveBalance', dict.updateBalance);
    setText('btnCloseBalanceModal', dict.cancel);
    setText('modalTimerTitle', dict.addTimer);
    setText('lblTimerName', dict.itemName);
    setText('lblTimerPrice', dict.targetPrice);
    setText('lblTimerDelay', dict.timerDuration);
    setText('opt2Days', dict.in2Days);
    setText('opt1Week', dict.in1Week);
    setText('opt1Month', dict.in1Month);
    setText('optCustom', dict.customDate);
    setText('lblCustomDate', dict.customDateTime);
    setText('lblTimerNotes', dict.notes);
    setText('lblBuyLink', dict.buyLink);
    setText('btnPasteBuyUrl', dict.pasteLink);
    setText('lblReminderLink', dict.buyLink);
    setText('btnSaveTimer', dict.saveTimer);
    setText('btnCloseTimerModal', dict.cancel);
    setText('lblFormDesc', dict.description);
    setText('lblFormAmount', dict.amount);
    setText('lblFormCategory', dict.category);
    setText('lblFormDate', dict.date);
    setText('btnSaveTx', dict.save);
    setText('btnCloseTxModal', dict.cancel);
    setText('lblNotifTitle', dict.notifications);
    setText('btnEnableNotifs', dict.enableNotifs);
    setText('btnAddReminder', '+ ' + dict.addReminder);
    setText('btnMarkRead', dict.markRead);
    setText('lblWaitAdviceTitle', dict.waitAdviceTitle);
    setText('txtWaitAdvice', dict.waitAdvice);
    setText('lblItemImage', dict.itemImage);
    setText('txtItemImageHint', dict.itemImageHint);
    setText('txtPasteImage', dict.pasteImage);
    setText('txtPickImage', dict.pickImage);
    setText('lblTimerBell', dict.enableBell);
    setText('lblTimerRepeat', dict.repeat);
    setText('lblTxRemind', dict.reminderOnTx);
    setText('lblTxRepeat', dict.repeat);
    setText('modalReminderTitle', dict.addReminder);
    setText('lblReminderTitle', dict.reminderTitle);
    setText('lblReminderRepeat', dict.repeat);
    setText('lblReminderWhen', dict.customDateTime);
    setText('btnSaveReminder', dict.saveTimer);
    setText('btnCloseReminderModal', dict.cancel);
    setText('modalCurrencyTitle', dict.addCurrency);
    setText('lblCurrencyCode', dict.currencyCode);
    setText('lblCurrencySymbol', dict.currencySymbol);
    setText('lblCurrencyName', dict.currencyName);
    setText('btnSaveCurrency', dict.saveShort);
    setText('btnCloseCurrencyModal', dict.cancel);
    document.getElementById('btnAddCurrency').title = dict.addCurrency;
    document.getElementById('btnDeleteCurrency').title = dict.deleteCurrency;
    document.getElementById('btnBell').setAttribute('aria-label', dict.notifications);
    document.getElementById('currencySelector').setAttribute('aria-label', dict.currency);
    document.getElementById('langSelector').setAttribute('aria-label', dict.language);
    document.getElementById('btnCloseNotif').setAttribute('aria-label', dict.close);
    document.getElementById('btnClearImage').setAttribute('aria-label', dict.clearImage);
    document.getElementById('btnClearImage').title = dict.clearImage;
    document.querySelector('.bottom-nav')?.setAttribute('aria-label', dict.navMain);
    document.getElementById('svgDonutChart')?.setAttribute('aria-label', dict.analyticsChart);
    const logo = document.querySelector('.brand-logo');
    if (logo) logo.alt = dict.appName;
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitle) appleTitle.setAttribute('content', dict.appName);

    document.getElementById('txSearchInput').placeholder = dict.searchPlaceholder;
    document.getElementById('txDesc').placeholder = dict.descPlaceholder;
    document.getElementById('timerItemName').placeholder = dict.itemPlaceholder;
    document.getElementById('timerNotes').placeholder = dict.notesPlaceholder;
    document.getElementById('timerBuyUrl').placeholder = dict.buyLinkPh;
    document.getElementById('reminderBuyUrl').placeholder = dict.buyLinkPh;
    document.getElementById('reminderTitleInput').placeholder = dict.reminderTitlePh;
    document.getElementById('customCurrencyCode').placeholder = dict.currencyCodePh;
    document.getElementById('customCurrencySymbol').placeholder = dict.currencySymbolPh;
    document.getElementById('customCurrencyName').placeholder = dict.currencyNamePh;
    document.getElementById('btnEditBalance').title = dict.editBalance;

    fillCategorySelects();
    fillWalletSelects();
    if (balanceModal && balanceModal.classList.contains('active')) fillWalletOpeningFields();
    fillingLangSelect = true;
    if ([...langSelector.options].some((o) => o.value === lang)) langSelector.value = lang;
    const langOpt = LANG_OPTIONS.find((l) => l.code === lang);
    if (langOpt) langSelector.title = langOpt.native;
    fillingLangSelect = false;
    fillCurrencySelect();
    fillRepeatSelect('timerRepeatSelect');
    fillRepeatSelect('txRepeatSelect');
    fillRepeatSelect('reminderRepeatSelect');
    renderIconGrid();
    updateNotifStatus();
    updateOnlineStatus();
    updateSyncUI();
    relocalizeDemoContent();
    syncRemindersToSW();
    updateSpaceToggle();
  }

  function applyDataI18n(dict) {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = dict[key];
      if (value) el.textContent = value;
    });
  }

  function allLangDicts() {
    return Object.keys(translations)
      .filter((code) => translations[code] && typeof translations[code] === 'object')
      .map((code) => dictFor(code));
  }

  function relocalizeDemoContent() {
    const dict = t();
    const langs = allLangDicts();
    const valuesOf = (key) => {
      const set = new Set();
      langs.forEach((d) => {
        const v = d[key];
        if (typeof v === 'string' && v) set.add(v);
      });
      return set;
    };
    const waitAdviceSet = valuesOf('waitAdvice');
    [
      'مؤقت الشراء المحدد بعد يومين بسعر 1.5M',
      'مؤقت الشراء المحدد بعد يومين بسعر 250K'
    ].forEach((note) => waitAdviceSet.add(note));

    const txIdMap = {
      tx_1: 'demoTx1',
      tx_2: 'demoTx2',
      tx_3: 'demoTx3',
      tx_4: 'demoTx4',
      tx_5: 'demoTx5',
      tx_6: 'demoTxChronic',
      tx_b1: 'demoBizSale',
      tx_b2: 'demoBizRent',
      tx_b3: 'demoBizPayroll',
      tx_b4: 'demoBizSupplies'
    };
    const recMap = {
      rec_demo_wifi: 'demoRecWifi',
      rec_demo_mobile: 'demoRecMobile',
      rec_demo_health: 'demoRecHealth',
      rec_demo_water: 'demoRecWater',
      rec_demo_electric: 'demoRecElectric',
      rec_demo_gas: 'demoRecGas',
      rec_demo_maintain: 'demoRecMaintain',
      rec_demo_rent: 'demoRecRent'
    };
    const timerMap = { timer_demo_1: 'demoTimerHouse', timer_demo_2: 'demoTimerLaptop' };
    const descKeys = [
      'demoTx1', 'demoTx2', 'demoTx3', 'demoTx4', 'demoTx5', 'demoTxChronic',
      'demoBizSale', 'demoBizRent', 'demoBizPayroll', 'demoBizSupplies',
      'demoBizIncome', 'demoBizExpense',
      'demoCoPay', 'demoCoMaterials', 'demoCoLabor', 'demoCoEquipment',
      'demoRecWifi', 'demoRecMobile', 'demoRecHealth', 'demoRecWater',
      'demoRecElectric', 'demoRecGas', 'demoRecMaintain', 'demoRecRent'
    ];
    const descToKey = new Map();
    descKeys.forEach((key) => valuesOf(key).forEach((v) => descToKey.set(v, key)));
    const houseNames = valuesOf('demoTimerHouse');
    const laptopNames = valuesOf('demoTimerLaptop');
    let changed = false;

    function applyDesc(item, key) {
      if (!key || !dict[key] || item.description === dict[key]) return;
      item.description = dict[key];
      changed = true;
    }

    state.transactions.forEach((tx) => {
      if (tx.demoTpl) {
        const tplKey = dict[tx.demoTpl] ? tx.demoTpl : '';
        if (tplKey) {
          const next = String(dict[tplKey]).replace('{type}', companyTypeLabel(tx.tplType || 'custom'));
          if (tx.description !== next) {
            tx.description = next;
            changed = true;
          }
        }
        return;
      }
      const key = txIdMap[tx.id] || recMap[tx.recurringId] || tx.demoKey || descToKey.get(String(tx.description || ''));
      if (key) applyDesc(tx, key);
      else {
        ['demoTplIncome', 'demoTplOps', 'demoTplStock'].some((tplKey) => {
          const type = tx.tplType || 'custom';
          const matches = langs.some((d) => {
            const sample = String(d[tplKey] || '').replace('{type}', (d.companyTypes && d.companyTypes[type]) || type);
            return sample && sample === tx.description;
          });
          if (!matches || !dict[tplKey]) return false;
          const next = String(dict[tplKey]).replace('{type}', companyTypeLabel(type));
          if (tx.description !== next) {
            tx.description = next;
            changed = true;
          }
          return true;
        });
      }
    });

    state.timers.forEach((tm) => {
      const key = timerMap[tm.id] || (houseNames.has(tm.itemName) ? 'demoTimerHouse' : laptopNames.has(tm.itemName) ? 'demoTimerLaptop' : '');
      if (key && dict[key] && tm.itemName !== dict[key]) {
        tm.itemName = dict[key];
        changed = true;
      }
      if ((key || waitAdviceSet.has(tm.notes)) && dict.waitAdvice && tm.notes !== dict.waitAdvice) {
        tm.notes = dict.waitAdvice;
        changed = true;
      }
    });

    state.recurring.forEach((item) => {
      const key = recMap[item.id] || descToKey.get(String(item.description || ''));
      if (key) applyDesc(item, key);
    });

    state.reminders.forEach((rem) => {
      const src = rem.sourceId || '';
      const key = timerMap[src] || timerMap[String(src).replace(/^rem_/, '')]
        || (houseNames.has(rem.title) ? 'demoTimerHouse' : laptopNames.has(rem.title) ? 'demoTimerLaptop' : '');
      if (key && dict[key] && rem.title !== dict[key]) {
        rem.title = dict[key];
        changed = true;
      }
      if ((key || waitAdviceSet.has(rem.body)) && dict.waitAdvice && rem.body !== dict.waitAdvice) {
        rem.body = dict.waitAdvice;
        changed = true;
      }
    });

    const defaultNames = valuesOf('defaultCompanyName');
    valuesOf('spaceBusiness').forEach((n) => defaultNames.add(n));
    (state.companies || []).forEach((co) => {
      if (!co) return;
      const isDefault = co.id === 'co_demo' || co.id === 'co_legacy' || defaultNames.has(co.name);
      if (!isDefault) return;
      const next = dict.defaultCompanyName || dict.spaceBusiness;
      if (next && co.name !== next) {
        co.name = next;
        changed = true;
      }
    });

    if (changed) {
      persistCompanies();
      saveData({ skipCloud: true });
    }
  }

  function fillLangSelect() {
    const current = translations[state.lang] ? state.lang : DEFAULT_LANG;
    fillingLangSelect = true;
    langSelector.innerHTML = LANG_OPTIONS.map((lang) => {
      const code = String(lang.code || '').toUpperCase();
      return `<option value="${escapeHtml(lang.code)}" title="${escapeHtml(lang.native)}">${escapeHtml(code)}</option>`;
    }).join('');
    if ([...langSelector.options].some((o) => o.value === current)) langSelector.value = current;
    else langSelector.value = DEFAULT_LANG;
    const selected = LANG_OPTIONS.find((l) => l.code === langSelector.value);
    if (selected) langSelector.title = selected.native;
    const langWrap = document.querySelector('.lang-wrap');
    if (langWrap) langWrap.title = selected ? selected.native : (t().language || 'Language');
    setTimeout(() => { fillingLangSelect = false; }, 0);
  }

  function customCurrencies() {
    return loadJSON('masroofi_custom_currencies', []);
  }

  function allCurrencies() {
    return BUILTIN_CURRENCIES.concat(customCurrencies());
  }

  function currencySymbolOf(code) {
    const found = allCurrencies().find((c) => c.code === code);
    return found ? found.symbol : code;
  }

  function fillCurrencySelect() {
    const current = state.currency;
    currencySelector.innerHTML = allCurrencies().map((c) => {
      const label = c.symbol && c.symbol !== c.code ? `${c.symbol} ${c.code}` : c.code;
      const title = c.label ? `${c.label} (${c.code})` : label;
      return `<option value="${escapeHtml(c.code)}" title="${escapeHtml(title)}">${escapeHtml(label)}</option>`;
    }).join('');
    if ([...currencySelector.options].some((o) => o.value === current)) {
      currencySelector.value = current;
    } else {
      state.currency = DEFAULT_CURRENCY;
      currencySelector.value = DEFAULT_CURRENCY;
    }
    const isCustom = customCurrencies().some((c) => c.code === currencySelector.value);
    document.getElementById('btnDeleteCurrency').hidden = !isCustom;
    syncCurrencySymbol();
  }

  function syncCurrencySymbol() {
    const el = document.getElementById('currencySymbolDisplay');
    const code = currencySelector.value || state.currency || DEFAULT_CURRENCY;
    const symbol = currencySymbolOf(code);
    if (el) el.textContent = symbol;
    currencySelector.title = symbol === code ? code : `${symbol} ${code}`;
  }

  function openCurrencyModal() {
    currencyForm.reset();
    currencyModal.classList.add('active');
    requestAnimationFrame(() => document.getElementById('customCurrencyCode').focus());
  }

  function closeCurrencyModal() {
    currencyModal.classList.remove('active');
    currencyForm.reset();
  }

  function handleCurrencySubmit(e) {
    e.preventDefault();
    const code = document.getElementById('customCurrencyCode').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    const symbol = document.getElementById('customCurrencySymbol').value.trim().slice(0, 12);
    const label = document.getElementById('customCurrencyName').value.trim().slice(0, 40);
    if (!code || !symbol) {
      showToast(t().invalidAmount);
      return;
    }
    if (allCurrencies().some((c) => c.code === code)) {
      showToast(t().currencyExists);
      return;
    }
    const list = customCurrencies();
    list.push({ code, symbol, label: label || code });
    localStorage.setItem('masroofi_custom_currencies', JSON.stringify(list));
    state.currency = code;
    localStorage.setItem('masroofi_currency', code);
    try { localStorage.setItem('masroofi_ui_currency', code); } catch (_) {}
    fillCurrencySelect();
    closeCurrencyModal();
    renderAll();
    showToast(t().currencyAdded);
  }

  function deleteCustomCurrency() {
    const code = currencySelector.value;
    const list = customCurrencies();
    if (!list.some((c) => c.code === code)) return;
    if (!confirm(t().confirmDeleteCurrency)) return;
    localStorage.setItem('masroofi_custom_currencies', JSON.stringify(list.filter((c) => c.code !== code)));
    state.currency = DEFAULT_CURRENCY;
    localStorage.setItem('masroofi_currency', DEFAULT_CURRENCY);
    try { localStorage.setItem('masroofi_ui_currency', DEFAULT_CURRENCY); } catch (_) {}
    fillCurrencySelect();
    renderAll();
  }

  function fillRepeatSelect(id) {
    const sel = document.getElementById(id);
    const dict = t();
    const current = sel.value || 'weekly';
    sel.innerHTML = [
      ['once', dict.once],
      ['daily', dict.daily],
      ['weekly', dict.weekly],
      ['monthly', dict.monthly],
      ['yearly', dict.yearly]
    ].map(([v, label]) => `<option value="${v}">${escapeHtml(label)}</option>`).join('');
    sel.value = [...sel.options].some((o) => o.value === current) ? current : 'weekly';
  }

  function fillCategorySelects() {
    const dict = t();
    const cats = allCategoryIds();
    const filter = document.getElementById('txCategoryFilter');
    const selects = ['txCategory', 'timerCategory', 'recurringCategory'].map((id) => document.getElementById(id));
    const filterVal = filter.value || 'all';
    const saved = selects.map((el) => el && el.value);

    filter.innerHTML = `<option value="all">${escapeHtml(dict.allCategories)}</option>` +
      cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(categoryName(c))}</option>`).join('');
    filter.value = [...filter.options].some((o) => o.value === filterVal) ? filterVal : 'all';

    const opts = cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(categoryName(c))}</option>`).join('');
    selects.forEach((el, i) => {
      if (!el) return;
      el.innerHTML = opts;
      const prev = saved[i];
      if (prev && [...el.options].some((o) => o.value === prev)) el.value = prev;
    });
  }

  function fillWalletSelects() {
    const ids = WALLET_IDS;
    ['txWallet', 'transferFrom', 'transferTo', 'recurringWallet'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const current = el.value;
      el.innerHTML = ids.map((w) => `<option value="${w}">${escapeHtml(walletName(w))}</option>`).join('');
      if ([...el.options].some((o) => o.value === current)) el.value = current;
    });
    const typeSel = document.getElementById('recurringType');
    if (typeSel && typeSel.options.length) {
      const dict = t();
      const cur = typeSel.value;
      typeSel.innerHTML = `<option value="expense">${escapeHtml(dict.expense)}</option><option value="income">${escapeHtml(dict.incomeType)}</option>`;
      typeSel.value = cur === 'income' ? 'income' : 'expense';
    }
  }

  function renderIconGrid() {
    const dict = t();
    const grid = document.getElementById('productIconGrid');
    grid.innerHTML = PRODUCT_ICONS.map((icon) => `
      <button type="button" class="icon-chip ${pendingIconId === icon.id ? 'active' : ''}" data-icon="${icon.id}">
        <span class="emo">${icon.emoji}</span>
        <span class="lbl">${escapeHtml(dict[icon.labelKey])}</span>
      </button>
    `).join('');
  }

  function formatCompactNumber(num) {
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (abs >= 1000000) {
      const formatted = (abs / 1000000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
      return `${sign}${formatted}M`;
    }
    if (abs >= 1000) {
      const formatted = (abs / 1000).toFixed(1).replace(/\.0$/, '');
      return `${sign}${formatted}k`;
    }
    return Number(num).toLocaleString(localeTag(), { maximumFractionDigits: 2 });
  }

  function formatCurrency(amount) {
    const sym = currencySymbolOf(state.currency);
    return `${formatCompactNumber(amount)} ${sym}`;
  }

  function formatDate(iso) {
    const raw = String(iso || '');
    const d = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString(localeTag());
  }

  function renderAll() {
    const dict = t();
    setText('lblTxHistory', dict.transactionsHistory);
    setText('lblPurchaseTimers', dict.purchaseTimers);
    applyDataI18n(dict);
    renderBalance();
    renderWallets();
    renderBlackDay();
    renderQuickAdd();
    renderRecurring();
    renderTimers();
    renderTransactions();
    renderAnalyticsChart();
    renderRecap();
    renderBudgets();
    renderMoneyGone();
    renderOnTrack();
    renderProfitCompare();
    renderJourney();
    renderTips();
    renderTipSpotlight();
    renderNotifList();
    updateBellBadge();
    updateLockButtons();
    updateSpendPeriodToggle();
  }

  function tipKindLabel(kind) {
    const dict = t();
    if (kind === 'alert') return dict.tipKindAlert;
    if (kind === 'idea') return dict.tipKindIdea;
    return dict.tipKindMotivation;
  }

  function tipKindIcon(kind) {
    if (kind === 'alert') return '⚠️';
    if (kind === 'idea') return '💡';
    return '✨';
  }

  function builtinTipPool() {
    const list = t().builtinTips;
    return Array.isArray(list) ? list.filter(Boolean) : [];
  }

  function allTipEntries() {
    const builtin = builtinTipPool().map((text, idx) => ({
      id: 'builtin_' + idx,
      text,
      kind: idx % 3 === 0 ? 'idea' : (idx % 3 === 1 ? 'alert' : 'motivation'),
      builtin: true
    }));
    const custom = (state.customTips || []).map((tip) => ({
      id: tip.id,
      text: tip.text,
      kind: tip.kind === 'alert' || tip.kind === 'idea' ? tip.kind : 'motivation',
      builtin: false
    }));
    // Custom tips first so user messages stay visible.
    return custom.concat(builtin);
  }

  function pickTipEntry(offset = 0) {
    const pool = allTipEntries();
    if (!pool.length) return null;
    const day = localISODate();
    let hash = 0;
    for (let i = 0; i < day.length; i++) hash = (hash * 31 + day.charCodeAt(i)) >>> 0;
    const idx = (hash + offset) % pool.length;
    return pool[idx];
  }

  function paintTipBadge(el, kind) {
    if (!el) return;
    el.textContent = `${tipKindIcon(kind)} ${tipKindLabel(kind)}`;
    el.classList.remove('alert', 'idea');
    if (kind === 'alert' || kind === 'idea') el.classList.add(kind);
  }

  function homeTipVisible() {
    return localStorage.getItem('masroofi_home_tip_hidden') !== '1';
  }

  function setHomeTipVisible(visible) {
    try { localStorage.setItem('masroofi_home_tip_hidden', visible ? '0' : '1'); } catch (_) {}
    updateHomeTipVisibility();
  }

  function updateHomeTipVisibility() {
    const show = homeTipVisible();
    const homeCard = document.getElementById('homeTipCard');
    const dayCard = document.getElementById('tipOfDayCard');
    const eye = document.getElementById('btnToggleHomeTip');
    const openIcon = eye?.querySelector('.nav-eye-open');
    const lockedIcon = eye?.querySelector('.nav-eye-locked');
    if (homeCard) homeCard.hidden = !show;
    if (dayCard) dayCard.hidden = !show;
    if (eye) {
      eye.setAttribute('aria-pressed', show ? 'true' : 'false');
      eye.title = show ? (t().hideHomeTip || '') : (t().showHomeTip || '');
      eye.setAttribute('aria-label', eye.title);
    }
    if (openIcon) openIcon.hidden = !show;
    if (lockedIcon) lockedIcon.hidden = show;
  }

  function cycleHomeTip() {
    tipShuffleOffset += 1;
    renderTipSpotlight();
  }

  function renderTipSpotlight() {
    const tip = pickTipEntry(tipShuffleOffset);
    const text = tip ? tip.text : (t().noCustomTips || '');
    const kind = tip ? tip.kind : 'motivation';
    setText('txtHomeTip', text);
    setText('txtTipOfDay', text);
    paintTipBadge(document.getElementById('homeTipKind'), kind);
    paintTipBadge(document.getElementById('tipOfDayKind'), kind);
  }

  function renderTips() {
    const dict = t();
    const customBox = document.getElementById('customTipsList');
    const builtinBox = document.getElementById('builtinTipsList');
    if (!customBox || !builtinBox) return;

    const custom = state.customTips || [];
    if (!custom.length) {
      customBox.innerHTML = `<div class="empty-state">${escapeHtml(dict.noCustomTips)}</div>`;
    } else {
      customBox.innerHTML = custom.slice().reverse().map((tip) => `
        <div class="tip-item">
          <div class="tip-item-body">
            <span class="tip-kind-badge ${tip.kind === 'alert' || tip.kind === 'idea' ? tip.kind : ''}">${tipKindIcon(tip.kind)} ${escapeHtml(tipKindLabel(tip.kind))}</span>
            <p class="tip-item-text">${escapeHtml(tip.text)}</p>
            <div class="tip-item-meta">${escapeHtml(dict.myTips)}</div>
          </div>
          <button type="button" class="btn-icon-del" data-action="delete-tip" data-id="${escapeHtml(tip.id)}" title="${escapeHtml(dict.delete)}">✕</button>
        </div>
      `).join('');
    }

    const builtin = builtinTipPool();
    builtinBox.innerHTML = builtin.map((text, idx) => {
      const kind = idx % 3 === 0 ? 'idea' : (idx % 3 === 1 ? 'alert' : 'motivation');
      return `
        <div class="tip-item">
          <div class="tip-item-body">
            <span class="tip-kind-badge ${kind === 'motivation' ? '' : kind}">${tipKindIcon(kind)} ${escapeHtml(tipKindLabel(kind))}</span>
            <p class="tip-item-text">${escapeHtml(text)}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  function openTipModal() {
    tipForm.reset();
    document.getElementById('tipKindSelect').value = 'motivation';
    document.getElementById('tipModal').classList.add('active');
    requestAnimationFrame(() => document.getElementById('tipTextInput').focus());
  }

  function closeTipModal() {
    document.getElementById('tipModal').classList.remove('active');
    tipForm.reset();
  }

  function handleTipSubmit(e) {
    e.preventDefault();
    const text = document.getElementById('tipTextInput').value.trim();
    const kind = document.getElementById('tipKindSelect').value;
    if (!text) return;
    state.customTips.push({
      id: 'tip_' + Date.now(),
      text: text.slice(0, 280),
      kind: kind === 'alert' || kind === 'idea' ? kind : 'motivation',
      createdAt: Date.now()
    });
    tipShuffleOffset = 0;
    saveData();
    closeTipModal();
    renderTips();
    renderTipSpotlight();
    showToast(t().tipSaved);
  }

  function deleteCustomTip(id) {
    if (!confirm(t().confirmDeleteTip)) return;
    state.customTips = (state.customTips || []).filter((tip) => tip.id !== id);
    saveData();
    renderTips();
    renderTipSpotlight();
  }

  function welcomeTipToast() {
    if (sessionStorage.getItem('masroofi_tip_session')) return;
    const tip = pickTipEntry(0);
    if (!tip) return;
    sessionStorage.setItem('masroofi_tip_session', '1');
    setTimeout(() => showToast(`${tipKindIcon(tip.kind)} ${tip.text}`), 700);
  }

  function renderBalance() {
    let income = 0;
    let expenses = 0;
    spaceTxs().forEach((tx) => {
      if (!isMoneyTx(tx)) return;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else expenses += amt;
    });

    const funds = activeInitialBalance() + income;
    const balance = funds - expenses;
    const dict = t();

    document.getElementById('valTotalBalance').textContent = formatCompactNumber(balance);
    document.getElementById('currSymbol').textContent = currencySymbolOf(state.currency);
    document.getElementById('valTotalIncome').textContent = `+${formatCompactNumber(income)}`;
    document.getElementById('valTotalExpenses').textContent = `-${formatCompactNumber(expenses)}`;

    const sym = currencySymbolOf(state.currency);
    document.getElementById('valTotalBalance').title = `${balance.toLocaleString(localeTag())} ${sym}`;
    document.getElementById('valTotalIncome').title = income.toLocaleString(localeTag());
    document.getElementById('valTotalExpenses').title = expenses.toLocaleString(localeTag());

    const healthFill = document.getElementById('healthBarFill');
    const healthStatus = document.getElementById('txtHealthStatus');

    if (funds === 0 && expenses === 0) {
      healthFill.style.width = '100%';
      healthFill.style.backgroundColor = 'var(--gold-primary)';
      healthStatus.textContent = dict.excellent;
      healthStatus.style.color = 'var(--gold-primary)';
      return;
    }

    const expRatio = funds > 0 ? (expenses / funds) * 100 : 100;
    const healthPct = Math.max(0, Math.min(100, 100 - expRatio));
    healthFill.style.width = `${healthPct}%`;

    if (healthPct >= 50) {
      healthFill.style.backgroundColor = 'var(--success)';
      healthStatus.textContent = dict.excellent;
      healthStatus.style.color = 'var(--success)';
    } else if (healthPct >= 20) {
      healthFill.style.backgroundColor = 'var(--warning)';
      healthStatus.textContent = dict.moderate;
      healthStatus.style.color = 'var(--warning)';
    } else {
      healthFill.style.backgroundColor = 'var(--danger)';
      healthStatus.textContent = dict.warning;
      healthStatus.style.color = 'var(--danger)';
    }
  }

  function renderWallets() {
    const grid = document.getElementById('walletGrid');
    if (!grid) return;
    grid.innerHTML = WALLET_IDS.map((id) => `
      <button type="button" class="wallet-chip" data-open-wallet="${escapeHtml(id)}">
        <div class="w-top">
          <span class="w-icon" aria-hidden="true">${WALLET_ICONS[id] || '💰'}</span>
          <span class="w-name">${escapeHtml(walletName(id))}</span>
        </div>
        <div class="w-bal">${escapeHtml(formatCurrency(walletBalance(id)))}</div>
        <p class="w-plan">${escapeHtml(walletPlan(id))}</p>
      </button>
    `).join('');
  }

  function renderBlackDay() {
    const dict = t();
    const saved = walletBalance('blackday');
    const target = blackDayTarget();
    const pct = target > 0 ? Math.min(100, (saved / target) * 100) : (saved > 0 ? 100 : 0);
    const fill = document.getElementById('blackDayFill');
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.style.backgroundColor = pct >= 100 ? 'var(--success)' : 'var(--gold-primary)';
    }
    setText('txtBlackDayProgress', `${dict.blackDayTarget}: ${formatCurrency(saved)} / ${formatCurrency(target)}`);
    setText('txtImpulseSaved', `${dict.impulseSavedTotal}: ${formatCurrency(impulseSavedTotal())}`);
  }

  function renderQuickAdd() {
    const row = document.getElementById('quickAddRow');
    if (!row) return;
    const dict = t();
    const expenses = spaceTxs().filter((tx) => tx.type === 'expense');
    const last = expenses[expenses.length - 1];
    const chips = [];
    if (last) {
      chips.push(`<button type="button" class="quick-chip" data-quick="last">${escapeHtml(dict.repeatLast)}</button>`);
    }
    const seen = new Set();
    expenses.slice().reverse().forEach((tx) => {
      const key = `${tx.description}|${tx.category}|${tx.amount}`;
      if (seen.has(key) || chips.length >= 4) return;
      seen.add(key);
      if (last && tx.id === last.id) return;
      chips.push(`<button type="button" class="quick-chip" data-quick="${escapeHtml(tx.id)}">${escapeHtml(tx.description)} · ${escapeHtml(formatCompactNumber(tx.amount))}</button>`);
    });
    row.innerHTML = chips.join('');
  }

  function renderRecurring() {
    const list = document.getElementById('recurringList');
    if (!list) return;
    const dict = t();
    const items = state.recurring.filter(inActiveSpace);
    if (!items.length) {
      list.innerHTML = `<div class="empty-state">${escapeHtml(dict.noRecurring)}</div>`;
      return;
    }
    list.innerHTML = items.map((item) => `
      <div class="recurring-item">
        <div class="recurring-head">
          <strong>${escapeHtml(item.description)}</strong>
          <span>${item.type === 'income' ? '+' : '-'}${escapeHtml(formatCurrency(item.amount))}</span>
        </div>
        <div class="recurring-head" style="color:var(--text-muted); font-size:0.75rem;">
          <span>${escapeHtml(categoryName(item.category))} · ${escapeHtml(walletName(item.walletId || 'cash'))} · ${escapeHtml(dict.dayOfMonth)} ${item.dayOfMonth}</span>
          <span>
            <button type="button" class="btn-gold-sm" data-action="toggle-recurring" data-id="${escapeHtml(item.id)}">${item.enabled === false ? '🔕' : '🔔'}</button>
            <button type="button" class="btn-icon-del" data-action="delete-recurring" data-id="${escapeHtml(item.id)}">✕</button>
          </span>
        </div>
      </div>
    `).join('');
  }

  function renderRecap() {
    const dict = t();
    const now = monthKey();
    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prev = monthKey(prevDate);
    const cur = monthTotals(now);
    const last = monthTotals(prev);
    const saved = impulseSavedTotal(now);
    const skipped = (state.impulseLog || []).filter((i) => monthKey(new Date(i.at)) === now).length;
    const diff = last.expenses ? Math.round(((cur.expenses - last.expenses) / last.expenses) * 100) : 0;
    const vs = last.expenses
      ? (diff === 0 ? dict.recapVsLast + ' 0%' : `${dict.recapVsLast} ${diff > 0 ? '+' : ''}${diff}%`)
      : dict.recapVsLast;
    const sentence = (dict.recapSentence || '')
      .replace('{saved}', formatCurrency(saved))
      .replace('{n}', String(skipped));
    setText('txtRecapSentence', sentence);
    const box = document.getElementById('recapStats');
    if (box) {
      box.innerHTML = `
        <div><span>${escapeHtml(dict.recapIncome)}</span><strong>+${escapeHtml(formatCurrency(cur.income))}</strong></div>
        <div><span>${escapeHtml(dict.recapExpense)}</span><strong>-${escapeHtml(formatCurrency(cur.expenses))}</strong></div>
        <div><span>${escapeHtml(dict.impulseSaved)}</span><strong>${escapeHtml(formatCurrency(saved))}</strong></div>
        <div><span>${escapeHtml(vs)}</span><strong>${escapeHtml(formatCurrency(last.expenses))}</strong></div>
      `;
    }
  }

  function renderBudgets() {
    const list = document.getElementById('budgetList');
    if (!list) return;
    const dict = t();
    list.innerHTML = allCategoryIds().filter((id) => id !== 'salary').map((cat) => {
      const limit = Number(activeBudgets()[cat]) || 0;
      const spent = categorySpentThisMonth(cat);
      const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
      const over = limit > 0 && spent > limit;
      const left = limit > 0 ? Math.max(0, limit - spent) : 0;
      const status = !limit ? dict.budgetNone : (over ? dict.budgetOver : `${dict.budgetLeft}: ${formatCurrency(left)}`);
      return `
        <div class="budget-row">
          <div class="budget-head">
            <strong>${escapeHtml(categoryName(cat))}</strong>
            <input type="number" class="budget-input" min="0" step="1" inputmode="decimal" data-budget="${escapeHtml(cat)}" value="${limit || ''}" placeholder="${escapeHtml(dict.limit)}">
          </div>
          <div class="health-bar-track">
            <div class="health-bar-fill" style="width:${pct}%; background:${over ? 'var(--danger)' : 'var(--gold-primary)'}"></div>
          </div>
          <div class="budget-head" style="color:var(--text-muted); font-size:0.75rem;">
            <span>${escapeHtml(dict.spent)}: ${escapeHtml(formatCurrency(spent))}</span>
            <span>${escapeHtml(status)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function mediaThumb(item) {
    if (item.imageData) return `<img src="${item.imageData}" alt="">`;
    const icon = PRODUCT_ICONS.find((i) => i.id === item.iconId);
    return icon ? icon.emoji : '🛒';
  }

  function renderTimers() {
    const list = document.getElementById('timerCardsList');
    const dict = t();

    if (state.timers.length === 0) {
      list.innerHTML = `<div class="empty-state">${escapeHtml(dict.noTimers)}</div>`;
      return;
    }

    list.innerHTML = state.timers.map((timer) => {
      const decided = timer.decision === 'bought' || timer.decision === 'skipped';
      const isExpired = !decided && Date.now() >= Number(timer.targetTimestamp);
      if (isExpired) expiredRendered.add(timer.id);
      const freqLabel = freqText(timer.repeat);
      const decisionLabel = timer.decision === 'bought'
        ? dict.decideBought
        : (timer.decision === 'skipped' ? dict.decideSkip : '');
      return `
        <div class="timer-card ${isExpired ? 'expired' : ''}" data-id="${escapeHtml(timer.id)}">
          <div class="timer-header">
            <div class="timer-title-row">
              <div class="timer-thumb">${mediaThumb(timer)}</div>
              <div>
                <div class="timer-name">${escapeHtml(timer.itemName || dict.unnamedItem)}</div>
                ${timer.notes ? `<div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(timer.notes)}</div>` : ''}
                ${timer.notify && !decided ? `<span class="freq-badge">🔔 ${escapeHtml(freqLabel)}</span>` : ''}
                ${decisionLabel ? `<span class="decision-badge ${timer.decision}">${escapeHtml(decisionLabel)}</span>` : ''}
                ${timer.buyUrl ? `<a class="buy-link" href="${escapeHtml(timer.buyUrl)}" target="_blank" rel="noopener noreferrer">🛒 ${escapeHtml(dict.buyOnline)}</a>` : ''}
              </div>
            </div>
            <div class="timer-price">${escapeHtml(formatCurrency(timer.price))}</div>
          </div>
          <div class="timer-countdown">
            ${decided ? `
              <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(dict.timerResolved || '')}</div>
            ` : isExpired ? `
              <div style="font-weight:800; color:var(--warning); font-size:0.9rem;">${escapeHtml(dict.timerExpired)}</div>
              <div class="timer-decision">
                <button type="button" class="btn-gold-sm" data-action="decide-timer" data-id="${escapeHtml(timer.id)}">${escapeHtml(dict.affordTitle)}</button>
                <button type="button" class="btn-gold-sm" data-action="snooze-timer" data-id="${escapeHtml(timer.id)}">${escapeHtml(dict.snoozeWeek)}</button>
              </div>
            ` : `
              <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(dict.remainingTime)}:</span>
              <div class="countdown-digits" id="cd-${escapeHtml(timer.id)}"></div>
            `}
            <button type="button" class="btn-icon-del" data-action="delete-timer" data-id="${escapeHtml(timer.id)}" title="${escapeHtml(dict.delete)}">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    updateTimersCountdown();
  }

  function updateTimersCountdown() {
    if (!state.timers.length) return;
    const dict = t();
    let needsRerender = false;

    state.timers.forEach((timer) => {
      if (timer.decision === 'bought' || timer.decision === 'skipped') return;
      const diff = Number(timer.targetTimestamp) - Date.now();
      if (diff <= 0) {
        if (!expiredRendered.has(timer.id)) needsRerender = true;
        return;
      }
      const container = document.getElementById(`cd-${timer.id}`);
      if (!container) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      container.innerHTML = `
        <div class="digit-box"><span class="num">${d}</span><span class="lbl">${escapeHtml(dict.days)}</span></div>
        <div class="digit-box"><span class="num">${h}</span><span class="lbl">${escapeHtml(dict.hours)}</span></div>
        <div class="digit-box"><span class="num">${m}</span><span class="lbl">${escapeHtml(dict.minutes)}</span></div>
        <div class="digit-box"><span class="num">${s}</span><span class="lbl">${escapeHtml(dict.seconds)}</span></div>
      `;
    });

    if (needsRerender) renderTimers();
  }

  function renderTransactions() {
    const list = document.getElementById('transactionList');
    const searchVal = document.getElementById('txSearchInput').value.toLowerCase();
    const catVal = document.getElementById('txCategoryFilter').value;
    const dict = t();

    const filtered = spaceTxs().filter((tx) => {
      const matchesSearch = String(tx.description || '').toLowerCase().includes(searchVal);
      const matchesCat = catVal === 'all' || tx.category === catVal || (tx.type === 'transfer' && catVal === 'all');
      if (tx.type === 'transfer') return matchesSearch && catVal === 'all';
      return matchesSearch && matchesCat;
    }).sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.id).localeCompare(String(a.id)));

    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state">${escapeHtml(dict.noTransactions)}</div>`;
      return;
    }

    list.innerHTML = filtered.map((tx) => {
      const catName = tx.type === 'transfer'
        ? `${walletName(tx.fromWallet)} → ${walletName(tx.toWallet)}`
        : categoryName(tx.category);
      const formattedAmount = (tx.type === 'income' || tx.type === 'transfer' ? (tx.type === 'transfer' ? '↕' : '+') : '-') + formatCurrency(tx.amount);
      const hasRemind = state.reminders.some((r) => r.sourceId === tx.id && r.enabled);
      return `
        <div class="tx-item ${tx.type === 'income' ? 'inc' : (tx.type === 'transfer' ? '' : 'exp')}">
          <div class="tx-details">
            <span class="tx-title">${escapeHtml(tx.description)}</span>
            <span class="tx-meta">${escapeHtml(catName)}${tx.walletId && tx.type !== 'transfer' ? ' · ' + escapeHtml(walletName(tx.walletId)) : ''} • ${escapeHtml(formatDate(tx.date))}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;">
            <span class="tx-amount ${tx.type === 'income' ? 'inc' : (tx.type === 'transfer' ? '' : 'exp')}">${escapeHtml(formattedAmount)}</span>
            ${tx.type === 'transfer' ? '' : `<button type="button" class="btn-icon-del" data-action="remind-tx" data-id="${escapeHtml(tx.id)}" title="${escapeHtml(dict.enableBell)}" style="color:${hasRemind ? 'var(--gold-primary)' : 'var(--text-muted)'}">🔔</button>
            <button type="button" class="btn-icon-del" data-action="edit" data-id="${escapeHtml(tx.id)}" title="${escapeHtml(dict.edit)}">✏️</button>`}
            <button type="button" class="btn-icon-del" data-action="delete" data-id="${escapeHtml(tx.id)}" title="${escapeHtml(dict.delete)}">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function ensureInstalledAt() {
    if (!localStorage.getItem('masroofi_installed_at')) {
      try { localStorage.setItem('masroofi_installed_at', new Date().toISOString()); } catch (_) {}
    }
  }

  function installedAtDate() {
    ensureInstalledAt();
    const raw = localStorage.getItem('masroofi_installed_at');
    const d = raw ? new Date(raw) : new Date();
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  function updateSpendPeriodToggle() {
    document.querySelectorAll('#spendPeriodToggle [data-period]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.period === spendPeriod);
    });
    const dict = t();
    const hint = spendPeriod === 'week'
      ? dict.spendHintWeek
      : (spendPeriod === 'year' ? dict.spendHintYear : dict.spendHintMonth);
    setText('txtSpendPeriodHint', hint || '');
  }

  function startOfWeek(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = (x.getDay() + 6) % 7; // Monday start
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function periodRange(period = spendPeriod) {
    const now = new Date();
    if (period === 'week') {
      const start = startOfWeek(now);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end };
    }
    if (period === 'year') {
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1)
      };
    }
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
    };
  }

  function txDateObj(tx) {
    const raw = String(tx.date || '');
    const d = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function txInRange(tx, start, end) {
    const d = txDateObj(tx);
    if (!d) return false;
    return d >= start && d < end;
  }

  function periodTotals(period = spendPeriod) {
    const { start, end } = periodRange(period);
    let income = 0;
    let expenses = 0;
    spaceTxs().forEach((tx) => {
      if (!isMoneyTx(tx) || !txInRange(tx, start, end)) return;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else expenses += amt;
    });
    return { income, expenses, profit: income - expenses, start, end };
  }

  function categorySpendInPeriod(period = spendPeriod) {
    const { start, end } = periodRange(period);
    const map = {};
    let total = 0;
    spaceTxs().forEach((tx) => {
      if (!isMoneyTx(tx) || tx.type !== 'expense' || !txInRange(tx, start, end)) return;
      const amt = Number(tx.amount) || 0;
      map[tx.category] = (map[tx.category] || 0) + amt;
      total += amt;
    });
    const rows = Object.keys(map)
      .map((cat) => ({ cat, amount: map[cat], pct: total > 0 ? (map[cat] / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
    return { rows, total };
  }

  function yearProfitMap() {
    const map = {};
    spaceTxs().forEach((tx) => {
      if (!isMoneyTx(tx)) return;
      const d = txDateObj(tx);
      if (!d) return;
      const y = String(d.getFullYear());
      if (!map[y]) map[y] = { income: 0, expenses: 0 };
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') map[y].income += amt;
      else map[y].expenses += amt;
    });
    return map;
  }

  function renderMoneyGone() {
    updateSpendPeriodToggle();
    const dict = t();
    const totals = periodTotals(spendPeriod);
    const { rows, total } = categorySpendInPeriod(spendPeriod);
    const summary = document.getElementById('spendSummary');
    const list = document.getElementById('moneyGoneList');
    if (summary) {
      summary.innerHTML = `
        <div><span>${escapeHtml(dict.recapIncome)}</span><strong class="inc">+${escapeHtml(formatCurrency(totals.income))}</strong></div>
        <div><span>${escapeHtml(dict.recapExpense)}</span><strong class="exp">-${escapeHtml(formatCurrency(totals.expenses))}</strong></div>
        <div><span>${escapeHtml(dict.netProfit)}</span><strong class="${totals.profit >= 0 ? 'inc' : 'exp'}">${totals.profit >= 0 ? '+' : ''}${escapeHtml(formatCurrency(totals.profit))}</strong></div>
        <div><span>${escapeHtml(dict.topLeak)}</span><strong>${rows[0] ? escapeHtml(categoryName(rows[0].cat)) : '—'}</strong></div>
      `;
    }
    if (!list) return;
    if (!rows.length) {
      list.innerHTML = `<div class="empty-state">${escapeHtml(dict.noTransactions)}</div>`;
      return;
    }
    list.innerHTML = rows.slice(0, 8).map((row) => `
      <div class="money-gone-row">
        <div class="money-gone-name">
          <span class="legend-dot" style="background:${categoryColor(row.cat)}"></span>
          ${escapeHtml(categoryName(row.cat))}
        </div>
        <strong>${escapeHtml(formatCurrency(row.amount))} · ${Math.round(row.pct)}%</strong>
        <div class="money-gone-bar"><i style="width:${Math.max(4, row.pct)}%; background:${categoryColor(row.cat)}"></i></div>
      </div>
    `).join('');
  }

  function renderOnTrack() {
    const dict = t();
    const month = periodTotals('month');
    const saveRate = month.income > 0 ? (month.profit / month.income) * 100 : (month.expenses === 0 ? 100 : 0);
    const blackSaved = walletBalance('blackday');
    const blackTarget = blackDayTarget();
    const blackPct = blackTarget > 0 ? Math.min(100, (blackSaved / blackTarget) * 100) : (blackSaved > 0 ? 100 : 0);
    let level = 'good';
    let verdict = dict.onTrackGood;
    if (month.income === 0 && month.expenses === 0) {
      level = 'warn';
      verdict = dict.onTrackEmpty;
    } else if (saveRate < 0 || (month.income > 0 && month.expenses > month.income * 0.95)) {
      level = 'bad';
      verdict = dict.onTrackBad;
    } else if (saveRate < 15 || blackPct < 30) {
      level = 'warn';
      verdict = dict.onTrackWarn;
    }
    const box = document.getElementById('trackVerdict');
    if (box) {
      box.className = `track-verdict ${level === 'good' ? '' : level}`.trim();
      box.textContent = verdict;
    }
    const stats = document.getElementById('trackStats');
    if (stats) {
      stats.innerHTML = `
        <div><span>${escapeHtml(dict.savingsRate)}</span><strong>${Math.round(saveRate)}%</strong></div>
        <div><span>${escapeHtml(dict.monthProfit)}</span><strong class="${month.profit >= 0 ? 'inc' : 'exp'}">${month.profit >= 0 ? '+' : ''}${escapeHtml(formatCurrency(month.profit))}</strong></div>
        <div><span>${escapeHtml(dict.blackDayProgress)}</span><strong>${Math.round(blackPct)}%</strong></div>
        <div><span>${escapeHtml(dict.impulseSaved)}</span><strong>${escapeHtml(formatCurrency(impulseSavedTotal(monthKey())))}</strong></div>
      `;
    }
  }

  function renderProfitCompare() {
    const dict = t();
    const list = document.getElementById('profitCompareList');
    if (!list) return;
    const map = yearProfitMap();
    const years = Object.keys(map).sort((a, b) => Number(b) - Number(a));
    if (!years.length) {
      list.innerHTML = `<div class="empty-state">${escapeHtml(dict.noTransactions)}</div>`;
      return;
    }
    const thisYear = String(new Date().getFullYear());
    list.innerHTML = years.map((y) => {
      const row = map[y];
      const profit = row.income - row.expenses;
      const prev = map[String(Number(y) - 1)];
      let deltaTxt = dict.profitNoPrev;
      if (prev) {
        const prevProfit = prev.income - prev.expenses;
        const diff = profit - prevProfit;
        const pct = prevProfit !== 0 ? Math.round((diff / Math.abs(prevProfit)) * 100) : 0;
        deltaTxt = `${diff >= 0 ? '+' : ''}${formatCurrency(diff)}${prevProfit !== 0 ? ` (${pct >= 0 ? '+' : ''}${pct}%)` : ''}`;
      }
      return `
        <div class="profit-year-row">
          <div>
            <strong>${escapeHtml(y)}${y === thisYear ? ` · ${escapeHtml(dict.thisYear)}` : ''}</strong>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${escapeHtml(dict.vsPrevYear)}: ${escapeHtml(deltaTxt)}</div>
          </div>
          <strong class="${profit >= 0 ? 'up' : 'down'}">${profit >= 0 ? '+' : ''}${escapeHtml(formatCurrency(profit))}</strong>
        </div>
      `;
    }).join('');
  }

  function renderJourney() {
    const dict = t();
    const installed = installedAtDate();
    const days = Math.max(1, Math.floor((Date.now() - installed.getTime()) / 86400000) + 1);
    setText('txtJourneySince', (dict.journeySince || '').replace('{date}', formatDate(localISODate(installed))).replace('{days}', String(days)));

    let income = 0;
    let expenses = 0;
    let txCount = 0;
    spaceTxs().forEach((tx) => {
      if (!isMoneyTx(tx)) return;
      txCount += 1;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else expenses += amt;
    });
    const profit = income - expenses;
    const skipped = (state.impulseLog || []).length;
    const stats = document.getElementById('journeyStats');
    if (stats) {
      stats.innerHTML = `
        <div><span>${escapeHtml(dict.daysTracked)}</span><strong>${days}</strong></div>
        <div><span>${escapeHtml(dict.txsTracked)}</span><strong>${txCount}</strong></div>
        <div><span>${escapeHtml(dict.netProfit)}</span><strong class="${profit >= 0 ? 'inc' : 'exp'}">${profit >= 0 ? '+' : ''}${escapeHtml(formatCurrency(profit))}</strong></div>
        <div><span>${escapeHtml(dict.impulseSaved)}</span><strong>${escapeHtml(formatCurrency(impulseSavedTotal()))}</strong></div>
      `;
    }

    const month = periodTotals('month');
    const achievements = [
      { id: 'first', earned: txCount > 0, title: dict.achFirstTitle, desc: dict.achFirstDesc },
      { id: 'saver', earned: skipped > 0, title: dict.achSaverTitle, desc: dict.achSaverDesc },
      { id: 'black', earned: walletBalance('blackday') > 0, title: dict.achBlackTitle, desc: dict.achBlackDesc },
      { id: 'goal', earned: blackDayTarget() > 0 && walletBalance('blackday') >= blackDayTarget(), title: dict.achGoalTitle, desc: dict.achGoalDesc },
      { id: 'profit', earned: month.profit > 0, title: dict.achProfitTitle, desc: dict.achProfitDesc },
      { id: 'week', earned: days >= 7, title: dict.achWeekTitle, desc: dict.achWeekDesc },
      { id: 'tips', earned: (state.customTips || []).length > 0, title: dict.achTipsTitle, desc: dict.achTipsDesc },
      { id: 'spaces', earned: state.transactions.some((tx) => spaceIdOf(tx) === 'business'), title: dict.achSpaceTitle, desc: dict.achSpaceDesc }
    ];
    const grid = document.getElementById('achievementsGrid');
    if (grid) {
      grid.innerHTML = achievements.map((a) => `
        <div class="achievement-chip ${a.earned ? 'earned' : ''}">
          <strong>${a.earned ? '🏅 ' : '🔒 '}${escapeHtml(a.title)}</strong>
          ${escapeHtml(a.desc)}
        </div>
      `).join('');
    }
  }

  function renderAnalyticsChart() {
    const svg = document.getElementById('svgDonutChart');
    const legend = document.getElementById('chartLegend');
    const dict = t();
    const { rows, total: totalExpense } = categorySpendInPeriod(spendPeriod);

    if (totalExpense === 0) {
      svg.innerHTML = `<circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3"></circle>`;
      legend.innerHTML = `<div style="grid-column: span 2; text-align:center; font-size:0.8rem; color:var(--text-muted);">${escapeHtml(dict.noTransactions)}</div>`;
      return;
    }

    let strokeOffset = 25;
    let svgContent = `<circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3"></circle>`;
    let legendContent = '';

    rows.forEach((row) => {
      const pct = row.pct;
      const color = categoryColor(row.cat);
      svgContent += `<circle cx="18" cy="18" r="15.915" fill="none" stroke="${color}" stroke-width="3.5"
        stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${strokeOffset}"></circle>`;
      strokeOffset -= pct;
      legendContent += `
        <div class="legend-item">
          <div class="legend-dot" style="background:${color}"></div>
          <span>${escapeHtml(categoryName(row.cat))} (${Math.round(pct)}%)</span>
        </div>`;
    });

    svg.innerHTML = svgContent;
    legend.innerHTML = legendContent;
  }

  function openTxModal(type, txToEdit = null) {
    if (!txToEdit && !requireActiveCompany()) return;
    editingTxId = txToEdit ? txToEdit.id : null;
    const dict = t();
    txForm.reset();
    document.getElementById('txRemindCheck').checked = false;
    document.getElementById('txRemindGroup').hidden = true;
    document.getElementById('txTypeInput').value = txToEdit ? txToEdit.type : type;
    document.getElementById('modalTxTitle').textContent = txToEdit
      ? dict.editTransaction
      : (type === 'income' ? dict.incomeType : dict.expense);

    if (txToEdit) {
      document.getElementById('txDesc').value = txToEdit.description;
      document.getElementById('txAmount').value = txToEdit.amount;
      document.getElementById('txCategory').value = txToEdit.category;
      document.getElementById('txWallet').value = txToEdit.walletId || 'cash';
      document.getElementById('txDate').value = txToEdit.date;
      const existing = state.reminders.find((r) => r.sourceId === txToEdit.id && r.enabled);
      if (existing) {
        document.getElementById('txRemindCheck').checked = true;
        document.getElementById('txRemindGroup').hidden = false;
        document.getElementById('txRepeatSelect').value = existing.freq;
      }
    } else {
      document.getElementById('txDate').value = localISODate();
      document.getElementById('txCategory').value = type === 'income' ? 'salary' : 'food';
      document.getElementById('txWallet').value = 'cash';
    }
    txModal.classList.add('active');
    requestAnimationFrame(() => document.getElementById('txDesc').focus());
  }

  function closeTxModal() {
    txModal.classList.remove('active');
    txForm.reset();
    editingTxId = null;
  }

  function openTimerModal() {
    timerForm.reset();
    customDateGroup.hidden = true;
    document.getElementById('timerDelaySelect').value = '1week';
    document.getElementById('timerBellCheck').checked = true;
    document.getElementById('timerRepeatGroup').hidden = false;
    document.getElementById('timerRepeatSelect').value = 'weekly';
    document.getElementById('timerCategory').value = 'other';
    clearPendingMedia();
    timerModal.classList.add('active');
    requestAnimationFrame(() => document.getElementById('timerItemName').focus());
  }

  function closeTimerModal() {
    timerModal.classList.remove('active');
    timerForm.reset();
    customDateGroup.hidden = true;
    clearPendingMedia();
  }

  function fillWalletOpeningFields(focusId) {
    const wrap = document.getElementById('walletBalanceFields');
    if (!wrap) return;
    const map = openingsFor(balanceKey());
    wrap.innerHTML = WALLET_IDS.map((id) => `
      <div class="form-group wallet-open-row" id="walletOpenRow_${id}">
        <label for="walletOpen_${id}">${WALLET_ICONS[id] || ''} ${escapeHtml(walletName(id))}</label>
        <p class="field-hint">${escapeHtml(walletPlan(id))}</p>
        <input type="number" step="any" min="0" inputmode="decimal" class="form-control wallet-open-input" id="walletOpen_${id}" data-wallet="${id}" value="${map[id] || 0}">
      </div>
    `).join('');
    wrap.querySelectorAll('.wallet-open-input').forEach((inp) => {
      inp.addEventListener('input', updateWalletOpeningsTotal);
    });
    updateWalletOpeningsTotal();
    const focusEl = focusId ? document.getElementById('walletOpen_' + focusId) : wrap.querySelector('.wallet-open-input');
    if (focusEl) {
      requestAnimationFrame(() => {
        focusEl.focus();
        focusEl.select();
        const row = document.getElementById('walletOpenRow_' + (focusId || ''));
        if (row) row.scrollIntoView({ block: 'nearest' });
      });
    }
  }

  function updateWalletOpeningsTotal() {
    const el = document.getElementById('txtWalletOpeningsTotal');
    if (!el) return;
    let sum = 0;
    document.querySelectorAll('.wallet-open-input').forEach((inp) => {
      const n = parseFloat(inp.value);
      if (Number.isFinite(n)) sum += n;
    });
    el.textContent = `${t().walletOpeningsTotal}: ${formatCurrency(sum)}`;
  }

  function openBalanceModal(focusWalletId) {
    fillWalletOpeningFields(WALLET_IDS.includes(focusWalletId) ? focusWalletId : '');
    balanceModal.classList.add('active');
  }

  function closeBalanceModal() {
    balanceModal.classList.remove('active');
  }

  function openReminderModal() {
    reminderForm.reset();
    document.getElementById('reminderRepeatSelect').value = 'weekly';
    const soon = new Date(Date.now() + 7 * 86400000);
    document.getElementById('reminderWhenInput').value = toDateTimeLocal(soon);
    closeNotifPanel();
    reminderModal.classList.add('active');
    requestAnimationFrame(() => document.getElementById('reminderTitleInput').focus());
  }

  function closeReminderModal() {
    reminderModal.classList.remove('active');
    reminderForm.reset();
  }

  function closeAllModals() {
    closeTxModal();
    closeTimerModal();
    closeBalanceModal();
    closeReminderModal();
    closeCurrencyModal();
    closeAffordModal();
    closeTransferModal();
    closeRecurringModal();
    closeCategoryModal();
    closePinModal();
    closeTipModal();
  }

  function handleBalanceSubmit(e) {
    e.preventDefault();
    const map = emptyWalletMap();
    let ok = true;
    document.querySelectorAll('.wallet-open-input').forEach((inp) => {
      const id = inp.getAttribute('data-wallet');
      const n = inp.value === '' ? 0 : parseFloat(inp.value);
      if (!id || !Number.isFinite(n) || n < 0) ok = false;
      else map[id] = n;
    });
    if (!ok) {
      showToast(t().invalidAmount);
      return;
    }
    setWalletOpenings(map);
    closeBalanceModal();
    renderAll();
    showToast(t().toastSaved);
  }

  function handleTxSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('txTypeInput').value;
    const desc = document.getElementById('txDesc').value.trim();
    const amount = parseFloat(document.getElementById('txAmount').value);
    const category = document.getElementById('txCategory').value;
    const date = document.getElementById('txDate').value;
    const walletId = document.getElementById('txWallet').value || 'cash';

    if (!desc || !Number.isFinite(amount) || amount <= 0) {
      showToast(t().invalidAmount);
      return;
    }

    const id = editingTxId || ('tx_' + Date.now());
    const existing = editingTxId ? state.transactions.find((item) => item.id === editingTxId) : null;
    const payload = stampSpaceFields({
      id,
      type,
      description: desc,
      amount,
      category,
      date,
      walletId
    }, existing);

    if (type === 'expense') {
      const limit = Number(activeBudgets()[category]) || 0;
      const spent = categorySpentThisMonth(category) + (editingTxId ? 0 : amount);
      if (limit > 0 && spent > limit) showToast(t().budgetOver);
    }

    if (editingTxId) {
      const idx = state.transactions.findIndex((item) => item.id === editingTxId);
      if (idx !== -1) state.transactions[idx] = payload;
    } else {
      state.transactions.push(payload);
    }

    if (document.getElementById('txRemindCheck').checked) {
      upsertReminder({
        source: 'tx',
        sourceId: id,
        title: desc,
        freq: document.getElementById('txRepeatSelect').value,
        nextAt: Date.now() + 7 * 86400000
      });
    } else {
      state.reminders = state.reminders.filter((r) => r.sourceId !== id);
    }

    saveData();
    closeTxModal();
    renderAll();
    showToast(t().toastSaved);
  }

  function handleTimerSubmit(e) {
    e.preventDefault();
    const dict = t();
    let name = document.getElementById('timerItemName').value.trim();
    const price = parseFloat(document.getElementById('timerPrice').value);
    const delayChoice = timerDelaySelect.value;
    const notes = document.getElementById('timerNotes').value.trim();
    let buyUrl = parseBuyUrl(document.getElementById('timerBuyUrl').value);
    const nameUrl = parseBuyUrl(name);
    if (nameUrl) {
      if (!buyUrl) buyUrl = nameUrl;
      if (!document.getElementById('timerItemName').value.trim() || name === nameUrl) {
        name = hostFromUrl(nameUrl) || dict.unnamedItem;
      }
    }
    if (document.getElementById('timerBuyUrl').value.trim() && !parseBuyUrl(document.getElementById('timerBuyUrl').value) && !nameUrl) {
      showToast(dict.invalidLink);
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      showToast(dict.invalidAmount);
      return;
    }

    if (!name) {
      if (pendingIconId) {
        const icon = PRODUCT_ICONS.find((i) => i.id === pendingIconId);
        name = icon ? dict[icon.labelKey] : dict.unnamedItem;
      } else if (pendingImage) {
        name = dict.unnamedItem;
      } else if (buyUrl) {
        name = hostFromUrl(buyUrl) || dict.unnamedItem;
      } else {
        showToast(dict.needNameOrImage);
        return;
      }
    }

    let targetTimestamp = Date.now();
    if (delayChoice === '2days') targetTimestamp += 2 * 86400000;
    else if (delayChoice === '1week') targetTimestamp += 7 * 86400000;
    else if (delayChoice === '1month') targetTimestamp += 30 * 86400000;
    else if (delayChoice === 'custom') {
      const customVal = document.getElementById('timerCustomDate').value;
      if (!customVal) {
        showToast(dict.pastDate);
        return;
      }
      targetTimestamp = new Date(customVal).getTime();
      if (!Number.isFinite(targetTimestamp) || targetTimestamp <= Date.now()) {
        showToast(dict.pastDate);
        return;
      }
    }

    const notify = document.getElementById('timerBellCheck').checked;
    const repeat = document.getElementById('timerRepeatSelect').value;
    const category = document.getElementById('timerCategory').value || 'other';
    const id = 'timer_' + Date.now();

    state.timers.push({
      id,
      itemName: name,
      price,
      targetTimestamp,
      notes,
      iconId: pendingIconId,
      imageData: pendingImage,
      buyUrl,
      notify,
      category,
      decision: '',
      repeat: notify ? repeat : 'once'
    });

    if (notify) {
      upsertReminder({
        source: 'timer',
        sourceId: id,
        title: name,
        freq: repeat,
        nextAt: targetTimestamp,
        body: dict.waitAdvice,
        buyUrl
      });
      requestNotifPermission(true);
    }

    saveData();
    closeTimerModal();
    showScreen('timers');
    renderAll();
    showToast(dict.reminderSaved);
  }

  function handleReminderSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('reminderTitleInput').value.trim();
    const freq = document.getElementById('reminderRepeatSelect').value;
    const when = new Date(document.getElementById('reminderWhenInput').value).getTime();
    if (!title || !Number.isFinite(when) || when <= Date.now()) {
      showToast(t().pastDate);
      return;
    }
    const buyUrl = parseBuyUrl(document.getElementById('reminderBuyUrl').value);
    if (document.getElementById('reminderBuyUrl').value.trim() && !buyUrl) {
      showToast(t().invalidLink);
      return;
    }
    upsertReminder({
      source: 'custom',
      sourceId: 'custom_' + Date.now(),
      title,
      freq,
      nextAt: when,
      buyUrl
    });
    requestNotifPermission(true);
    saveData();
    closeReminderModal();
    openNotifPanel();
    renderAll();
    showToast(t().reminderSaved);
  }

  function editTx(id) {
    const tx = state.transactions.find((item) => item.id === id);
    if (tx) openTxModal(tx.type, tx);
  }

  function deleteTx(id) {
    if (!confirm(t().confirmDelete)) return;
    state.transactions = state.transactions.filter((tx) => tx.id !== id);
    state.reminders = state.reminders.filter((r) => r.sourceId !== id);
    saveData();
    renderAll();
  }

  function deleteTimer(id) {
    if (!confirm(t().confirmDeleteTimer)) return;
    state.timers = state.timers.filter((tm) => tm.id !== id);
    state.reminders = state.reminders.filter((r) => r.sourceId !== id);
    expiredRendered.delete(id);
    saveData();
    renderAll();
  }

  function snoozeTimer(id) {
    const timer = state.timers.find((tm) => tm.id === id);
    if (!timer) return;
    timer.targetTimestamp = Date.now() + 7 * 86400000;
    expiredRendered.delete(id);
    const rem = state.reminders.find((r) => r.sourceId === id);
    if (rem) {
      rem.nextAt = timer.targetTimestamp;
      rem.enabled = true;
    }
    saveData();
    renderAll();
    showToast(t().reminderSaved);
  }

  function openAffordModal(id) {
    const timer = state.timers.find((tm) => tm.id === id);
    if (!timer || timer.decision === 'bought' || timer.decision === 'skipped') return;
    pendingTimerId = id;
    const dict = t();
    const price = Number(timer.price) || 0;
    const total = WALLET_IDS.reduce((s, w) => s + walletBalance(w), 0);
    const cash = walletBalance('cash');
    const cat = timer.category || 'other';
    const limit = Number(activeBudgets()[cat]) || 0;
    const spent = categorySpentThisMonth(cat);
    const budgetLeft = limit > 0 ? limit - spent : null;
    const afterBlack = walletBalance('blackday');
    const target = blackDayTarget();
    const afterBuyCash = cash - price;
    let verdict = 'ok';
    let verdictText = dict.affordOk;
    if (price > total || afterBuyCash < 0) {
      verdict = 'no';
      verdictText = dict.affordNo;
    } else if ((budgetLeft !== null && budgetLeft < price) || (target > 0 && afterBlack < target * 0.3 && price > cash * 0.2)) {
      verdict = 'tight';
      verdictText = dict.affordTight;
    }
    document.getElementById('affordBody').innerHTML = `
      <div><strong>${escapeHtml(timer.itemName || dict.unnamedItem)}</strong></div>
      <div>${escapeHtml(dict.affordPrice)}: ${escapeHtml(formatCurrency(price))}</div>
      <div>${escapeHtml(dict.affordBalance)}: ${escapeHtml(formatCurrency(total))} · ${escapeHtml(walletName('cash'))}: ${escapeHtml(formatCurrency(cash))}</div>
      <div>${escapeHtml(dict.affordBudgetLeft)} (${escapeHtml(categoryName(cat))}): ${budgetLeft === null ? escapeHtml(dict.budgetNone) : escapeHtml(formatCurrency(budgetLeft))}</div>
      <div>${escapeHtml(dict.affordBlackDay)}: ${escapeHtml(formatCurrency(afterBlack))} / ${escapeHtml(formatCurrency(target))}</div>
      <div class="afford-verdict ${verdict}">${escapeHtml(verdictText)}</div>
    `;
    document.getElementById('moveToBlackDay').checked = true;
    document.getElementById('affordModal').classList.add('active');
  }

  function closeAffordModal() {
    document.getElementById('affordModal').classList.remove('active');
    pendingTimerId = null;
  }

  function decideTimer(choice) {
    const id = pendingTimerId;
    const timer = state.timers.find((tm) => tm.id === id);
    if (!timer) {
      closeAffordModal();
      return;
    }
    const dict = t();
    if (choice === 'wait') {
      closeAffordModal();
      snoozeTimer(id);
      return;
    }
    if (choice === 'bought') {
      state.transactions.push(stampSpaceFields({
        id: 'tx_' + Date.now(),
        type: 'expense',
        description: timer.itemName || dict.unnamedItem,
        amount: Number(timer.price) || 0,
        category: timer.category || 'other',
        date: localISODate(),
        walletId: 'cash'
      }));
      timer.decision = 'bought';
      timer.decidedAt = Date.now();
      const rem = state.reminders.find((r) => r.sourceId === id);
      if (rem) rem.enabled = false;
    }
    if (choice === 'skipped') {
      timer.decision = 'skipped';
      timer.decidedAt = Date.now();
      const amount = Number(timer.price) || 0;
      const move = document.getElementById('moveToBlackDay').checked;
      if (move && amount > 0) {
        if (walletBalance('cash') >= amount) {
          state.transactions.push(stampSpaceFields({
            id: 'tx_tr_' + Date.now(),
            type: 'transfer',
            description: `${dict.blackDayMoved}: ${timer.itemName || ''}`,
            amount,
            date: localISODate(),
            fromWallet: 'cash',
            toWallet: 'blackday'
          }));
        } else {
          showToast(dict.affordNo);
        }
      }
      state.impulseLog.push({
        id: 'imp_' + Date.now(),
        timerId: id,
        amount,
        at: Date.now(),
        moved: move
      });
      const rem = state.reminders.find((r) => r.sourceId === id);
      if (rem) rem.enabled = false;
      showToast(`${dict.impulseSaved}: ${formatCurrency(amount)}`);
    }
    saveData();
    closeAffordModal();
    renderAll();
  }

  function openTransferModal() {
    if (!requireActiveCompany()) return;
    fillWalletSelects();
    document.getElementById('transferFrom').value = 'cash';
    document.getElementById('transferTo').value = 'blackday';
    document.getElementById('transferAmount').value = '';
    document.getElementById('transferModal').classList.add('active');
  }

  function closeTransferModal() {
    document.getElementById('transferModal').classList.remove('active');
    transferForm.reset();
  }

  function handleTransferSubmit(e) {
    e.preventDefault();
    const fromWallet = document.getElementById('transferFrom').value;
    const toWallet = document.getElementById('transferTo').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    if (fromWallet === toWallet || !Number.isFinite(amount) || amount <= 0) {
      showToast(t().invalidAmount);
      return;
    }
    if (walletBalance(fromWallet) < amount) {
      showToast(t().affordNo);
      return;
    }
    state.transactions.push(stampSpaceFields({
      id: 'tx_tr_' + Date.now(),
      type: 'transfer',
      description: `${walletName(fromWallet)} → ${walletName(toWallet)}`,
      amount,
      date: localISODate(),
      fromWallet,
      toWallet
    }));
    saveData();
    closeTransferModal();
    renderAll();
    showToast(t().toastSaved);
  }

  function openRecurringModal() {
    if (!requireActiveCompany()) return;
    recurringForm.reset();
    fillCategorySelects();
    fillWalletSelects();
    document.getElementById('recurringType').value = 'expense';
    document.getElementById('recurringCategory').value = 'bills';
    document.getElementById('recurringWallet').value = 'cash';
    document.getElementById('recurringDay').value = '1';
    document.getElementById('recurringModal').classList.add('active');
  }

  function closeRecurringModal() {
    document.getElementById('recurringModal').classList.remove('active');
    recurringForm.reset();
  }

  function handleRecurringSubmit(e) {
    e.preventDefault();
    const description = document.getElementById('recurringDesc').value.trim();
    const amount = parseFloat(document.getElementById('recurringAmount').value);
    const dayOfMonth = Math.min(28, Math.max(1, parseInt(document.getElementById('recurringDay').value, 10) || 1));
    if (!description || !Number.isFinite(amount) || amount <= 0) {
      showToast(t().invalidAmount);
      return;
    }
    state.recurring.push(stampSpaceFields({
      id: 'rec_' + Date.now(),
      type: document.getElementById('recurringType').value === 'income' ? 'income' : 'expense',
      description,
      amount,
      category: document.getElementById('recurringCategory').value || 'bills',
      walletId: document.getElementById('recurringWallet').value || 'cash',
      dayOfMonth,
      enabled: true,
      lastPosted: ''
    }));
    saveData();
    closeRecurringModal();
    postDueRecurring();
    renderAll();
    showToast(t().toastSaved);
  }

  function deleteRecurring(id) {
    if (!confirm(t().confirmDelete)) return;
    state.recurring = state.recurring.filter((r) => r.id !== id);
    saveData();
    renderAll();
  }

  function toggleRecurring(id) {
    const item = state.recurring.find((r) => r.id === id);
    if (!item) return;
    item.enabled = item.enabled === false;
    saveData();
    renderAll();
  }

  function postDueRecurring() {
    const today = new Date();
    const key = monthKey(today);
    const day = today.getDate();
    let changed = false;
    state.recurring.forEach((item) => {
      if (item.enabled === false) return;
      if (day < Number(item.dayOfMonth)) return;
      if (item.lastPosted === key) return;
      const date = `${key}-${String(item.dayOfMonth).padStart(2, '0')}`;
      const recId = 'tx_rec_' + item.id + '_' + key;
      if (state.transactions.some((tx) => tx.id === recId)) {
        item.lastPosted = key;
        return;
      }
      state.transactions.push(stampSpaceFields({
        id: recId,
        type: item.type,
        description: item.description,
        amount: Number(item.amount) || 0,
        category: item.category,
        date,
        walletId: item.walletId || 'cash',
        recurringId: item.id
      }, item));
      item.lastPosted = key;
      changed = true;
    });
    if (changed) {
      saveData();
      renderAll();
      showToast(t().recurringPosted);
    }
  }

  function openCategoryModal() {
    categoryForm.reset();
    document.getElementById('categoryModal').classList.add('active');
    requestAnimationFrame(() => document.getElementById('customCategoryName').focus());
  }

  function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
    categoryForm.reset();
  }

  function handleCategorySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('customCategoryName').value.trim();
    if (!name) return;
    const list = customCategories();
    const exists = list.some((c) => c.name.toLowerCase() === name.toLowerCase()) ||
      builtinCatIds().some((id) => categoryName(id).toLowerCase() === name.toLowerCase());
    if (exists) {
      showToast(t().categoryExists);
      return;
    }
    const id = 'cat_' + Date.now();
    list.push({ id, name });
    try { localStorage.setItem('masroofi_custom_categories', JSON.stringify(list)); } catch (_) {}
    fillCategorySelects();
    document.getElementById('txCategory').value = id;
    closeCategoryModal();
    showToast(t().categoryAdded);
  }

  function quickAddExpense(ref) {
    const expenses = spaceTxs().filter((tx) => tx.type === 'expense');
    const src = ref === 'last' ? expenses[expenses.length - 1] : expenses.find((tx) => tx.id === ref);
    if (!src) {
      showToast(t().noLastExpense);
      return;
    }
    openTxModal('expense');
    document.getElementById('txDesc').value = src.description;
    document.getElementById('txAmount').value = src.amount;
    document.getElementById('txCategory').value = src.category;
    document.getElementById('txWallet').value = src.walletId || 'cash';
    document.getElementById('txDate').value = localISODate();
  }

  function pinHash() {
    return localStorage.getItem('masroofi_pin_hash') || '';
  }

  function pinRecoveryEmail() {
    return (localStorage.getItem('masroofi_pin_recovery_email') || '').trim().toLowerCase();
  }

  function isValidPin(pin) {
    return /^[0-9]{6}$/.test(pin);
  }

  function updateLockButtons() {
    const has = Boolean(pinHash());
    const rem = document.getElementById('btnRemovePin');
    if (rem) rem.hidden = !has;
    setText('txtSetPin', has ? t().changePin : t().setPin);
  }

  function lockApp() {
    document.getElementById('lockScreen').hidden = false;
    const input = document.getElementById('unlockPin');
    if (input) input.value = '';
  }

  function unlockApp() {
    document.getElementById('lockScreen').hidden = true;
  }

  async function hashPin(pin) {
    const raw = `${PIN_SALT}|${pin}`;
    if (crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 0;
    for (let i = 0; i < raw.length; i++) h = ((h << 5) - h) + raw.charCodeAt(i);
    return String(h);
  }

  function openPinModal() {
    pinForm.reset();
    const dict = t();
    setText('txtPinRecoveryHint', googleEmail ? dict.pinRecoveryHintReady : dict.pinRecoveryHint);
    document.getElementById('pinModal').classList.add('active');
  }

  function closePinModal() {
    document.getElementById('pinModal').classList.remove('active');
    pinForm.reset();
  }

  async function handlePinSubmit(e) {
    e.preventDefault();
    const a = document.getElementById('pinNew').value.trim();
    const b = document.getElementById('pinConfirm').value.trim();
    if (!isValidPin(a)) {
      showToast(t().pinTooShort);
      return;
    }
    if (a !== b) {
      showToast(t().pinMismatch);
      return;
    }
    try {
      localStorage.setItem('masroofi_pin_hash', await hashPin(a));
      if (googleEmail) {
        localStorage.setItem('masroofi_pin_recovery_email', googleEmail.trim().toLowerCase());
      } else {
        localStorage.removeItem('masroofi_pin_recovery_email');
      }
    } catch (_) {}
    closePinModal();
    updateLockButtons();
    showToast(t().pinSet);
  }

  async function handleUnlock(e) {
    e.preventDefault();
    const pin = document.getElementById('unlockPin').value.trim();
    if (!/^[0-9]{4,8}$/.test(pin)) {
      showToast(t().pinWrong);
      return;
    }
    const hashed = await hashPin(pin);
    if (hashed !== pinHash()) {
      showToast(t().pinWrong);
      return;
    }
    unlockApp();
  }

  function removePin() {
    if (!confirm(t().confirmDelete)) return;
    try {
      localStorage.removeItem('masroofi_pin_hash');
      localStorage.removeItem('masroofi_pin_recovery_email');
    } catch (_) {}
    unlockApp();
    updateLockButtons();
    showToast(t().pinRemoved);
  }

  async function recoverPinViaGmail() {
    if (!pinHash()) return;
    const saved = pinRecoveryEmail();
    if (!saved) {
      showToast(t().pinRecoveryNoEmail);
      return;
    }
    const ok = await connectGoogle({ silent: true, skipDrive: true });
    if (!ok) return;
    if ((googleEmail || '').trim().toLowerCase() !== saved) {
      showToast(t().pinRecoveryFail);
      return;
    }
    try {
      localStorage.removeItem('masroofi_pin_hash');
      localStorage.removeItem('masroofi_pin_recovery_email');
    } catch (_) {}
    unlockApp();
    updateLockButtons();
    showToast(t().pinRecovered);
    openPinModal();
  }

  function quickRemindTx(id) {
    const tx = state.transactions.find((item) => item.id === id);
    if (!tx) return;
    const existing = state.reminders.find((r) => r.sourceId === id);
    if (existing && existing.enabled) {
      existing.enabled = false;
    } else {
      upsertReminder({
        source: 'tx',
        sourceId: id,
        title: tx.description,
        freq: 'weekly',
        nextAt: Date.now() + 7 * 86400000
      });
      requestNotifPermission(true);
    }
    saveData();
    renderAll();
    showToast(t().reminderSaved);
  }

  function upsertReminder({ source, sourceId, title, freq, nextAt, body, buyUrl }) {
    const existing = state.reminders.find((r) => r.sourceId === sourceId);
    const payload = {
      id: existing ? existing.id : ('rem_' + Date.now()),
      source,
      sourceId,
      title,
      body: body || t().waitAdvice,
      freq: freq || 'weekly',
      nextAt,
      buyUrl: buyUrl || '',
      enabled: true
    };
    if (existing) Object.assign(existing, payload);
    else state.reminders.push(payload);
  }

  function toggleReminder(id) {
    const rem = state.reminders.find((r) => r.id === id);
    if (!rem) return;
    rem.enabled = !rem.enabled;
    saveData();
    renderNotifList();
  }

  function deleteReminder(id) {
    state.reminders = state.reminders.filter((r) => r.id !== id);
    saveData();
    renderNotifList();
    updateBellBadge();
  }

  function snoozeReminder(id) {
    const rem = state.reminders.find((r) => r.id === id);
    if (!rem) return;
    rem.nextAt = Date.now() + 7 * 86400000;
    rem.enabled = true;
    saveData();
    renderNotifList();
    showToast(t().reminderSaved);
  }

  function checkDueReminders() {
    const now = Date.now();
    let changed = false;
    state.reminders.forEach((rem) => {
      if (!rem.enabled || now < rem.nextAt) return;
      if (rem.lastFiredAt && now - rem.lastFiredAt < 20000) return;
      rem.lastFiredAt = now;
      fireNotification(rem);
      if (rem.freq === 'once') rem.enabled = false;
      else rem.nextAt = nextOccurrence(rem.nextAt, rem.freq);
      changed = true;
    });
    if (changed) {
      saveData();
      renderNotifList();
      updateBellBadge();
    }
    pingSWCheck();
  }

  function nextOccurrence(from, freq) {
    const d = new Date(Math.max(from, Date.now()));
    if (freq === 'daily') d.setDate(d.getDate() + 1);
    else if (freq === 'weekly') d.setDate(d.getDate() + 7);
    else if (freq === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (freq === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else d.setDate(d.getDate() + 7);
    return d.getTime();
  }

  async function fireNotification(rem) {
    const dict = t();
    const title = rem.title || dict.reminderFired;
    const body = rem.body || dict.waitAdvice;
    state.notifLog.unshift({
      id: 'log_' + Date.now(),
      title,
      body,
      at: Date.now(),
      read: false
    });
    state.notifLog = state.notifLog.slice(0, 40);
    try { navigator.vibrate && navigator.vibrate([180, 80, 180]); } catch (_) {}

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        const payload = {
          type: 'NOTIFY',
          id: rem.id,
          title,
          body,
          buyUrl: rem.buyUrl || '',
          buyOnline: dict.buyOnline,
          openApp: dict.openApp,
          appName: dict.appName
        };
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage(payload);
        } else {
          const reg = await navigator.serviceWorker?.ready;
          if (reg?.showNotification) {
            await reg.showNotification(title, {
              body,
              icon: './assets/icon-192.png',
              tag: rem.id,
              renotify: true,
              vibrate: [180, 80, 180],
              data: { buyUrl: rem.buyUrl || '', id: rem.id },
              actions: rem.buyUrl
                ? [{ action: 'buy', title: dict.buyOnline }, { action: 'open', title: dict.openApp }]
                : [{ action: 'open', title: dict.openApp }]
            });
          } else {
            new Notification(title, { body, icon: './assets/icon-192.png' });
          }
        }
      } catch (_) {
        showToast(`${dict.reminderFired}: ${title}`);
      }
    } else {
      showToast(`${dict.reminderFired}: ${title}`);
    }
  }

  async function requestNotifPermission(silent) {
    if (typeof Notification === 'undefined') {
      if (!silent) showToast(t().notifsUnsupported);
      updateNotifStatus();
      return;
    }
    try {
      const result = await Notification.requestPermission();
      if (!silent) {
        showToast(result === 'granted' ? t().notifsOn : t().notifsDenied);
      }
      if (result === 'granted') registerBackgroundSync();
    } catch (_) {
      if (!silent) showToast(t().notifsDenied);
    }
    updateNotifStatus();
  }

  function updateNotifStatus() {
    const el = document.getElementById('txtNotifStatus');
    if (typeof Notification === 'undefined') el.textContent = t().notifsUnsupported;
    else if (Notification.permission === 'granted') el.textContent = t().notifsOn + ' — ' + t().notifsNeedInstall;
    else if (Notification.permission === 'denied') el.textContent = t().notifsDenied;
    else el.textContent = t().enableNotifs + ' — ' + t().notifsNeedInstall;
  }

  function openNotifPanel() {
    notifPanel.hidden = false;
    renderNotifList();
    updateNotifStatus();
  }

  function closeNotifPanel() {
    notifPanel.hidden = true;
  }

  function renderNotifList() {
    const list = document.getElementById('notifList');
    const dict = t();
    const unreadLogs = state.notifLog.filter((n) => !n.read);
    const items = [];

    unreadLogs.forEach((n) => {
      items.push(`
        <div class="notif-item unread">
          <div class="tx-thumb">🔔</div>
          <div class="notif-item-body">
            <div class="notif-item-title">${escapeHtml(n.title)}</div>
            <div class="notif-item-meta">${escapeHtml(n.body)}</div>
          </div>
        </div>`);
    });

    if (state.reminders.length === 0 && unreadLogs.length === 0) {
      list.innerHTML = `<div class="empty-state">${escapeHtml(dict.noReminders)}</div>`;
      return;
    }

    state.reminders.slice().reverse().forEach((rem) => {
      const due = rem.enabled && rem.nextAt <= Date.now();
      const when = due ? dict.dueNow : new Date(rem.nextAt).toLocaleString(localeTag());
      items.push(`
        <div class="notif-item ${due ? 'unread' : ''}">
          <div class="tx-thumb">⏰</div>
          <div class="notif-item-body">
            <div class="notif-item-title">${escapeHtml(rem.title)}</div>
            <div class="notif-item-meta">${escapeHtml(freqText(rem.freq))} • ${escapeHtml(when)}</div>
            ${rem.buyUrl ? `<a class="buy-link" href="${escapeHtml(rem.buyUrl)}" target="_blank" rel="noopener noreferrer">🛒 ${escapeHtml(dict.buyOnline)}</a>` : ''}
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
              <button type="button" class="btn-gold-sm" data-action="toggle-reminder" data-id="${escapeHtml(rem.id)}">${rem.enabled ? '🔔' : '🔕'}</button>
              <button type="button" class="btn-gold-sm btn-demo" data-action="snooze-reminder" data-id="${escapeHtml(rem.id)}">${escapeHtml(dict.snoozeWeek)}</button>
              <button type="button" class="btn-icon-del" data-action="delete-reminder" data-id="${escapeHtml(rem.id)}">🗑️</button>
            </div>
          </div>
        </div>`);
    });

    list.innerHTML = items.join('');
  }

  function markAllRead() {
    state.notifLog.forEach((n) => { n.read = true; });
    saveData();
    renderNotifList();
    updateBellBadge();
  }

  function updateBellBadge() {
    const count = state.notifLog.filter((n) => !n.read).length +
      state.reminders.filter((r) => r.enabled && r.nextAt <= Date.now()).length;
    const badge = document.getElementById('bellBadge');
    badge.hidden = count === 0;
    badge.textContent = String(count);
  }

  function freqText(freq) {
    const dict = t();
    return ({ once: dict.once, daily: dict.daily, weekly: dict.weeklyBadge, monthly: dict.monthly, yearly: dict.yearly }[freq] || dict.weeklyBadge);
  }

  function selectIcon(id) {
    pendingIconId = pendingIconId === id ? null : id;
    if (pendingIconId) pendingImage = null;
    updateImagePreview();
    renderIconGrid();
  }

  function clearPendingMedia() {
    pendingIconId = null;
    pendingImage = null;
    updateImagePreview();
    renderIconGrid();
  }

  function updateImagePreview() {
    const wrap = document.getElementById('imagePreview');
    const img = document.getElementById('imagePreviewImg');
    const hint = document.getElementById('imageDropHint');
    if (pendingImage) {
      img.src = pendingImage;
      wrap.hidden = false;
      hint.hidden = true;
    } else {
      img.removeAttribute('src');
      wrap.hidden = true;
      hint.hidden = false;
    }
  }

  function setImageFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => compressImage(reader.result);
    reader.readAsDataURL(file);
  }

  function compressImage(dataUrl) {
    const img = new Image();
    img.onload = () => {
      const size = 96;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      pendingImage = canvas.toDataURL('image/jpeg', 0.7);
      pendingIconId = null;
      updateImagePreview();
      renderIconGrid();
    };
    img.src = dataUrl;
  }

  function loadDemoData(notify = true) {
    const today = localISODate();
    const prevDate = localISODate(new Date(Date.now() - 86400000 * 3));
    const dict = t();
    const demoCoId = 'co_demo';

    state.companies = [{
      id: demoCoId,
      name: dict.defaultCompanyName || dict.spaceBusiness,
      type: 'trade',
      createdAt: Date.now()
    }];
    state.activeCompanyId = demoCoId;
    persistCompanies();
    state.initialBalances = { personal: demoPersonalOpenings(), [demoCoId]: demoCompanyOpenings() };
    persistInitialBalances();
    state.activeSpace = 'personal';
    try { localStorage.setItem('masroofi_space', 'personal'); } catch (_) {}

    state.transactions = [
      ...personalDemoTransactions(dict, today, prevDate),
      ...personalDemoRecurringTxs(dict),
      ...businessDemoTransactions(dict, today, prevDate, demoCoId)
    ];

    state.recurring = personalDemoRecurring(dict);
    try {
      localStorage.setItem('masroofi_demo_recurring', '1');
      localStorage.setItem('masroofi_demo_home_bills', '1');
      localStorage.setItem('masroofi_demo_rent_bill', '1');
    } catch (_) {}

    state.budgets = { personal: {}, [demoCoId]: {} };
    expiredRendered = new Set();
    state.timers = [
      {
        id: 'timer_demo_1',
        itemName: dict.demoTimerHouse,
        price: 480000,
        targetTimestamp: Date.now() + (30 * 86400000),
        notes: t().waitAdvice,
        iconId: 'house',
        notify: true,
        category: 'other',
        decision: '',
        repeat: 'monthly'
      },
      {
        id: 'timer_demo_2',
        itemName: dict.demoTimerLaptop,
        price: 7500,
        targetTimestamp: Date.now() + (7 * 86400000),
        notes: t().waitAdvice,
        iconId: 'laptop',
        buyUrl: 'https://www.amazon.com/s?k=laptop',
        notify: true,
        category: 'entertainment',
        decision: '',
        repeat: 'weekly'
      }
    ];

    state.reminders = state.timers.map((tm) => ({
      id: 'rem_' + tm.id,
      source: 'timer',
      sourceId: tm.id,
      title: tm.itemName,
      body: t().waitAdvice,
      freq: 'weekly',
      nextAt: tm.targetTimestamp,
      buyUrl: tm.buyUrl || '',
      enabled: true
    }));
    state.notifLog = [];

    saveData();
    updateSpaceToggle();
    renderAll();
    if (notify) showToast(t().demoLoaded);
  }

  function resetAllData() {
    if (!confirm(t().confirmReset)) return;
    state.initialBalances = { personal: emptyWalletMap() };
    persistInitialBalances();
    state.companies = [];
    state.activeCompanyId = '';
    persistCompanies();
    state.transactions = [];
    state.timers = [];
    state.reminders = [];
    state.notifLog = [];
    state.impulseLog = [];
    state.recurring = [];
    state.budgets = { personal: {} };
    state.customTips = [];
    expiredRendered = new Set();
    try {
      localStorage.removeItem('masroofi_impulse');
      localStorage.removeItem('masroofi_recurring');
      localStorage.removeItem('masroofi_budgets');
      localStorage.removeItem('masroofi_custom_categories');
      localStorage.removeItem('masroofi_custom_tips');
      localStorage.removeItem('masroofi_initial_balances');
      localStorage.removeItem('masroofi_companies');
      localStorage.removeItem('masroofi_active_company');
    } catch (_) {}
    saveData();
    updateSpaceToggle();
    renderAll();
  }

  function exportCSV() {
    if (state.transactions.length === 0) {
      showToast(t().noDataExport);
      return;
    }

    const dict = t();
    const rows = [[
      'ID',
      dict.type,
      dict.description,
      dict.amount,
      dict.category,
      dict.date,
      dict.wallet
    ]];
    state.transactions.forEach((tx) => {
      rows.push([
        tx.id,
        tx.type === 'income' ? dict.incomeType : (tx.type === 'transfer' ? dict.transfer : dict.expense),
        csvCell(tx.description),
        tx.amount,
        tx.type === 'transfer' ? dict.transfer : (dict.categories[tx.category] || categoryName(tx.category)),
        tx.date,
        tx.type === 'transfer' ? `${tx.fromWallet || ''}→${tx.toWallet || ''}` : (tx.walletId || 'cash')
      ]);
    });
    const csv = '\uFEFF' + rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `masroofi_transactions_${localISODate()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(t().exported);
  }

  async function installPwa() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('btnInstallPwa').hidden = true;
  }

  function showScreen(name) {
    const screenName = name || 'home';
    document.querySelectorAll('.app-screen').forEach((screen) => {
      const active = screen.dataset.screen === screenName;
      screen.classList.toggle('is-active', active);
      screen.hidden = !active;
      if (active) screen.scrollTop = 0;
    });

    document.querySelectorAll('.nav-item').forEach((btn) => {
      const active = btn.dataset.screen === screenName;
      btn.classList.toggle('active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    if (screenName === 'analytics') {
      renderAnalyticsChart();
      renderMoneyGone();
      renderOnTrack();
      renderProfitCompare();
      renderJourney();
    }
    if (screenName === 'timers') updateTimersCountdown();
    if (screenName === 'tips') {
      renderTips();
      renderTipSpotlight();
    }
  }

  function buildBackup() {
    return {
      app: 'masroofi-gold',
      version: 6,
      savedAt: Date.now(),
      email: googleEmail || '',
      data: {
        lang: state.lang,
        currency: state.currency,
        activeSpace: state.activeSpace,
        companies: state.companies,
        activeCompanyId: state.activeCompanyId,
        initialBalances: state.initialBalances,
        initialBalance: openingTotal(state.initialBalances.personal),
        transactions: state.transactions,
        timers: state.timers,
        reminders: state.reminders,
        notifLog: state.notifLog,
        impulseLog: state.impulseLog,
        recurring: state.recurring,
        budgets: state.budgets,
        blackDayMonths: state.blackDayMonths,
        customCurrencies: customCurrencies(),
        customCategories: customCategories(),
        customTips: state.customTips,
        pinHash: pinHash()
      }
    };
  }

  function applyBackup(payload) {
    if (!payload || payload.app !== 'masroofi-gold' || !payload.data) {
      showToast(t().invalidLink);
      return false;
    }
    const data = payload.data;
    state.currency = data.currency || state.currency;
    state.activeSpace = normalizeSpace(data.activeSpace || 'personal');
    if (data.initialBalances && typeof data.initialBalances === 'object') {
      const out = {};
      Object.keys(data.initialBalances).forEach((k) => {
        out[k] = normalizeWalletMap(data.initialBalances[k]);
      });
      if (!out.personal) out.personal = emptyWalletMap();
      state.initialBalances = out;
    } else {
      const legacy = Number.isFinite(Number(data.initialBalance)) ? Number(data.initialBalance) : 0;
      state.initialBalances = { personal: capitalMap(legacy, 'cash') };
    }
    state.companies = normalizeCompanyList(data.companies);
    state.activeCompanyId = data.activeCompanyId || '';
    state.transactions = Array.isArray(data.transactions) ? data.transactions : [];
    state.timers = Array.isArray(data.timers) ? data.timers : [];
    state.reminders = Array.isArray(data.reminders) ? data.reminders : [];
    state.notifLog = Array.isArray(data.notifLog) ? data.notifLog : [];
    state.impulseLog = Array.isArray(data.impulseLog) ? data.impulseLog : [];
    state.recurring = Array.isArray(data.recurring) ? data.recurring : [];
    state.budgets = normalizeBudgets(data.budgets);
    state.blackDayMonths = normalizeBlackDayMonths(data.blackDayMonths);
    state.customTips = Array.isArray(data.customTips) ? data.customTips : [];
    try {
      if (Array.isArray(data.customCurrencies)) {
        localStorage.setItem('masroofi_custom_currencies', JSON.stringify(data.customCurrencies));
      }
      if (Array.isArray(data.customCategories)) {
        localStorage.setItem('masroofi_custom_categories', JSON.stringify(data.customCategories));
      }
      localStorage.setItem('masroofi_custom_tips', JSON.stringify(state.customTips));
      if (data.pinHash && payload.kind !== 'plan') localStorage.setItem('masroofi_pin_hash', data.pinHash);
      localStorage.setItem('masroofi_lang', state.lang);
      localStorage.setItem('masroofi_currency', state.currency);
      localStorage.setItem('masroofi_space', state.activeSpace);
      persistCompanies();
      persistInitialBalances();
      localStorage.setItem('masroofi_has_run', 'true');
    } catch (_) {}
    langSelector.value = state.lang;
    currencySelector.value = state.currency;
    const monthsSel = document.getElementById('blackDayMonths');
    if (monthsSel) monthsSel.value = String(state.blackDayMonths);
    applyLanguage(state.lang);
    ensureCompaniesMigrated();
    saveData({ skipCloud: true });
    updateSpaceToggle();
    renderAll();
    if (pinHash()) lockApp();
    return true;
  }

  function buildPlanPayload() {
    const payload = buildBackup();
    payload.kind = 'plan';
    payload.email = '';
    if (payload.data) delete payload.data.pinHash;
    return payload;
  }

  function backupFile() {
    const json = JSON.stringify(buildBackup(), null, 2);
    return new File([json], DRIVE_BACKUP_NAME, { type: 'application/json' });
  }

  function planFile() {
    const json = JSON.stringify(buildPlanPayload(), null, 2);
    return new File([json], `amwali-plan-${localISODate()}.json`, { type: 'application/json' });
  }

  function downloadBackup() {
    const file = planFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(t().planSaved || t().exported);
  }

  async function copyPlanToClipboard() {
    const json = JSON.stringify(buildPlanPayload(), null, 2);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(json);
        showToast(t().planCopied);
        return;
      }
    } catch (_) {}
    showToast(t().copyFailed);
    downloadBackup();
  }

  async function shareBackupToGmail() {
    const file = planFile();
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t().saveBackup,
          text: t().syncHint
        });
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
    downloadBackup();
    const subject = encodeURIComponent(t().backupEmailSubject);
    const body = encodeURIComponent(t().shareUnsupported);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank', 'noopener');
    showToast(t().shareUnsupported);
  }

  function handleBackupFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (!confirm(t().restoreOverwrite)) return;
        if (applyBackup(payload)) showToast(payload.kind === 'plan' ? (t().planLoaded || t().syncRestored) : t().syncRestored);
      } catch (_) {
        showToast(t().invalidLink);
      }
    };
    reader.readAsText(file);
  }

  function googleClientId() {
    return (document.getElementById('googleClientIdInput').value || localStorage.getItem('masroofi_google_client_id') || '').trim();
  }

  function loadGoogleSdk() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-gis="1"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.dataset.gis = '1';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function isGmailAddress(email) {
    return /^[^\s@]+@(gmail|googlemail)\.com$/i.test(String(email || '').trim());
  }

  function syncVerifiedEmail() {
    return (localStorage.getItem('masroofi_sync_verified') || '').trim().toLowerCase();
  }

  function isSyncVerified() {
    const email = (googleEmail || '').trim().toLowerCase();
    return Boolean(email && syncVerifiedEmail() === email);
  }

  function randomSyncCode() {
    const n = (crypto.getRandomValues(new Uint32Array(1))[0] % 1000000);
    return String(n).padStart(6, '0');
  }

  function toBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function openSyncVerifyModal() {
    syncEmailForm.reset();
    syncCodeForm.reset();
    syncEmailForm.hidden = false;
    syncCodeForm.hidden = true;
    if (googleEmail) document.getElementById('syncGmailInput').value = googleEmail;
    document.getElementById('syncVerifyModal').classList.add('active');
    document.getElementById('syncGmailInput').focus();
  }

  function closeSyncVerifyModal() {
    document.getElementById('syncVerifyModal').classList.remove('active');
    syncEmailForm.reset();
    syncCodeForm.reset();
  }

  async function handleSyncEmailSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('syncGmailInput').value.trim().toLowerCase();
    if (!isGmailAddress(email)) {
      showToast(t().syncNeedGmail);
      return;
    }
    const ok = await connectGoogle({ silent: true, skipDrive: true, gmailSend: true, expectedEmail: email });
    if (!ok) return;
    const sent = await sendSyncCodeEmail(email);
    if (!sent) {
      showToast(t().syncCodeSendFail);
      return;
    }
    syncEmailForm.hidden = true;
    syncCodeForm.hidden = false;
    document.getElementById('syncCodeInput').value = '';
    document.getElementById('syncCodeInput').focus();
    showToast(t().syncCodeSent);
  }

  async function sendSyncCodeEmail(email) {
    const code = randomSyncCode();
    const hashed = await hashPin(code);
    try {
      localStorage.setItem('masroofi_sync_code_hash', hashed);
      localStorage.setItem('masroofi_sync_code_until', String(Date.now() + 15 * 60 * 1000));
      localStorage.setItem('masroofi_sync_pending_email', email);
    } catch (_) {}
    const dict = t();
    const subject = dict.syncCodeEmailSubject || 'Sync code';
    const body = String(dict.syncCodeEmailBody || '{code}').replace('{code}', code);
    const raw = [
      `To: ${email}`,
      `From: ${email}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      body
    ].join('\r\n');
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { ...driveHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: toBase64Url(raw) })
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  }

  async function handleSyncCodeSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('syncCodeInput').value.trim();
    const until = Number(localStorage.getItem('masroofi_sync_code_until') || 0);
    const pending = (localStorage.getItem('masroofi_sync_pending_email') || '').trim().toLowerCase();
    const stored = localStorage.getItem('masroofi_sync_code_hash') || '';
    if (!until || Date.now() > until) {
      showToast(t().syncCodeExpired);
      return;
    }
    if (!/^[0-9]{6}$/.test(code) || (await hashPin(code)) !== stored) {
      showToast(t().syncCodeWrong);
      return;
    }
    if (pending && (googleEmail || '').trim().toLowerCase() !== pending) {
      showToast(t().syncEmailMismatch);
      return;
    }
    try {
      localStorage.setItem('masroofi_sync_verified', (googleEmail || pending).trim().toLowerCase());
      localStorage.removeItem('masroofi_sync_code_hash');
      localStorage.removeItem('masroofi_sync_code_until');
      localStorage.removeItem('masroofi_sync_pending_email');
    } catch (_) {}
    closeSyncVerifyModal();
    updateSyncUI();
    await ensureDriveFile();
    await uploadToDrive(true);
    showToast(t().syncVerifiedOk);
  }

  async function connectGoogle(opts = {}) {
    const silent = Boolean(opts.silent);
    const skipDrive = Boolean(opts.skipDrive);
    if (!navigator.onLine) {
      showToast(t().syncNeedOnline);
      return false;
    }
    const clientId = googleClientId();
    if (!clientId) {
      document.querySelector('.sync-advanced')?.setAttribute('open', '');
      showToast(t().syncNeedClient);
      return false;
    }
    try {
      await loadGoogleSdk();
      await new Promise((resolve, reject) => {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: opts.gmailSend
            ? 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send'
            : 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email',
          callback: (resp) => {
            if (resp && resp.access_token) {
              googleAccessToken = resp.access_token;
              resolve();
            } else reject(new Error('token'));
          },
          error_callback: () => reject(new Error('auth'))
        });
        tokenClient.requestAccessToken({ prompt: (opts.gmailSend || !googleEmail) ? 'consent' : '' });
      });
      const profile = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: 'Bearer ' + googleAccessToken }
      }).then((r) => r.json());
      googleEmail = profile.email || '';
      if (opts.expectedEmail && googleEmail.trim().toLowerCase() !== String(opts.expectedEmail).trim().toLowerCase()) {
        googleAccessToken = '';
        googleEmail = localStorage.getItem('masroofi_google_email') || '';
        showToast(t().syncEmailMismatch);
        return false;
      }
      localStorage.setItem('masroofi_google_email', googleEmail);
      updateSyncUI();
      if (!skipDrive) {
        await ensureDriveFile();
        await uploadToDrive(true);
      }
      if (!silent) {
        showToast(t().syncOk + (googleEmail ? ' — ' + googleEmail : ''));
      }
      return Boolean(googleEmail);
    } catch (_) {
      showToast(t().syncNeedClient);
      return false;
    }
  }

  function disconnectGoogle() {
    googleAccessToken = '';
    googleEmail = '';
    googleFileId = '';
    localStorage.removeItem('masroofi_google_email');
    localStorage.removeItem('masroofi_google_file_id');
    localStorage.removeItem('masroofi_sync_verified');
    localStorage.removeItem('masroofi_sync_code_hash');
    localStorage.removeItem('masroofi_sync_code_until');
    localStorage.removeItem('masroofi_sync_pending_email');
    updateSyncUI();
  }

  function driveHeaders() {
    return { Authorization: 'Bearer ' + googleAccessToken };
  }

  async function ensureDriveFile() {
    if (!googleAccessToken) return;
    const q = encodeURIComponent(`name='${DRIVE_BACKUP_NAME}'`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&q=${q}`, {
      headers: driveHeaders()
    });
    if (!res.ok) throw new Error('list');
    const json = await res.json();
    if (json.files && json.files[0]) {
      googleFileId = json.files[0].id;
      localStorage.setItem('masroofi_google_file_id', googleFileId);
    }
  }

  async function uploadToDrive(silent) {
    if (!googleEmail || !isSyncVerified()) {
      if (!silent) showToast(t().syncNotConnected);
      return;
    }
    if (!navigator.onLine) {
      if (!silent) showToast(t().syncNeedOnline);
      return;
    }
    try {
      if (!googleAccessToken) await connectGoogle();
      if (!googleAccessToken) return;
      await ensureDriveFile();
      const body = JSON.stringify(buildBackup());
      if (googleFileId) {
        const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${googleFileId}?uploadType=media`, {
          method: 'PATCH',
          headers: { ...driveHeaders(), 'Content-Type': 'application/json' },
          body
        });
        if (!res.ok) throw new Error('patch');
      } else {
        const meta = { name: DRIVE_BACKUP_NAME, parents: ['appDataFolder'] };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
        form.append('file', new Blob([body], { type: 'application/json' }));
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: driveHeaders(),
          body: form
        });
        if (!res.ok) throw new Error('post');
        const created = await res.json();
        googleFileId = created.id;
        localStorage.setItem('masroofi_google_file_id', googleFileId);
      }
      localStorage.setItem('masroofi_last_sync', String(Date.now()));
      try { localStorage.removeItem('masroofi_pending_cloud'); } catch (_) {}
      updateSyncUI();
      if (!silent) showToast(t().syncOk);
    } catch (_) {
      if (!silent) showToast(t().syncNeedOnline);
    }
  }

  async function restoreFromDrive() {
    if (!navigator.onLine) {
      showToast(t().syncNeedOnline);
      return;
    }
    try {
      if (!googleAccessToken) await connectGoogle();
      await ensureDriveFile();
      if (!googleFileId) {
        showToast(t().noDataExport);
        return;
      }
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${googleFileId}?alt=media`, {
        headers: driveHeaders()
      });
      if (!res.ok) throw new Error('get');
      const payload = await res.json();
      if (!confirm(t().syncOverwrite)) return;
        if (applyBackup(payload)) showToast(payload.kind === 'plan' ? (t().planLoaded || t().syncRestored) : t().syncRestored);
    } catch (_) {
      showToast(t().syncNeedOnline);
    }
  }

  function scheduleCloudSync() {
    if (!googleEmail || !isSyncVerified()) return;
    if (!navigator.onLine) {
      try { localStorage.setItem('masroofi_pending_cloud', '1'); } catch (_) {}
      return;
    }
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(() => uploadToDrive(true), 2500);
  }

  function updateSyncUI() {
    const dict = t();
    const connected = isSyncVerified();
    document.getElementById('btnSyncNow').hidden = !connected;
    document.getElementById('btnRestoreCloud').hidden = !connected;
    document.getElementById('btnDisconnectGmail').hidden = !connected;
    document.getElementById('btnConnectGmail').hidden = connected;
    const last = Number(localStorage.getItem('masroofi_last_sync') || 0);
    const lastTxt = last ? new Date(last).toLocaleString(localeTag()) : '—';
    document.getElementById('txtSyncStatus').textContent = connected
      ? `${dict.syncConnected}: ${googleEmail} • ${dict.lastSync}: ${lastTxt}`
      : dict.syncNotConnected;
    setText('txtPinRecoveryHint', connected ? dict.pinRecoveryHintReady : dict.pinRecoveryHint);
  }

  function saveData(opts = {}) {
    try {
      localStorage.setItem('masroofi_txs', JSON.stringify(state.transactions));
      localStorage.setItem('masroofi_timers', JSON.stringify(state.timers));
      localStorage.setItem('masroofi_reminders', JSON.stringify(state.reminders));
      localStorage.setItem('masroofi_notif_log', JSON.stringify(state.notifLog));
      localStorage.setItem('masroofi_impulse', JSON.stringify(state.impulseLog));
      localStorage.setItem('masroofi_recurring', JSON.stringify(state.recurring));
      localStorage.setItem('masroofi_budgets', JSON.stringify(state.budgets));
      localStorage.setItem('masroofi_blackday_months', String(state.blackDayMonths));
      localStorage.setItem('masroofi_space', state.activeSpace);
      localStorage.setItem('masroofi_custom_tips', JSON.stringify(state.customTips || []));
      persistCompanies();
      persistInitialBalances();
    } catch (_) {
      showToast(t().saveFailed);
    }
    if (!opts.skipSync) syncRemindersToSW();
    if (!opts.skipCloud) scheduleCloudSync();
  }

  function swI18n() {
    const dict = t();
    return {
      appName: dict.appName,
      buyOnline: dict.buyOnline,
      openApp: dict.openApp
    };
  }

  function syncRemindersToSW() {
    const payload = { type: 'SYNC_REMINDERS', reminders: state.reminders, i18n: swI18n() };
    if (!navigator.serviceWorker?.controller) {
      navigator.serviceWorker?.ready.then((reg) => {
        reg.active?.postMessage(payload);
      }).catch(() => {});
      return;
    }
    navigator.serviceWorker.controller.postMessage(payload);
  }

  function pingSWCheck() {
    navigator.serviceWorker?.controller?.postMessage({ type: 'CHECK' });
  }

  async function registerBackgroundSync() {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.periodicSync) {
        await reg.periodicSync.register('masroofi-check', { minInterval: 15 * 60 * 1000 });
      }
      if (reg.sync) {
        await reg.sync.register('masroofi-check');
      }
    } catch (_) { /* optional on some browsers */ }
  }

  function updateOnlineStatus() {
    const chip = document.getElementById('offlineChip');
    if (!chip) return;
    const offline = !navigator.onLine;
    chip.textContent = offline ? t().offlineMode : t().onlineMode;
    chip.classList.toggle('is-offline', offline);
  }

  async function pasteBuyUrlFromClipboard() {
    let text = '';
    try {
      text = await navigator.clipboard.readText();
    } catch (_) {
      document.getElementById('timerBuyUrl').focus();
      showToast(t().buyLinkPh);
      return;
    }
    const url = parseBuyUrl(text);
    if (!url) {
      showToast(t().invalidLink);
      return;
    }
    document.getElementById('timerBuyUrl').value = url;
    showToast(t().linkSaved);
  }

  function parseBuyUrl(raw) {
    if (!raw) return '';
    const text = String(raw).trim();
    const match = text.match(/https?:\/\/[^\s<>"']+/i) || text.match(/(?:www\.)[^\s<>"']+/i);
    let candidate = match ? match[0] : text;
    candidate = candidate.replace(/[.,;]+$/, '');
    if (!/^https?:\/\//i.test(candidate)) {
      if (/^[\w.-]+\.[a-z]{2,}/i.test(candidate) || candidate.startsWith('www.')) {
        candidate = 'https://' + candidate;
      } else {
        return '';
      }
    }
    try {
      const url = new URL(candidate);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      return url.href;
    } catch (_) {
      return '';
    }
  }

  function hostFromUrl(href) {
    try { return new URL(href).hostname.replace(/^www\./, ''); } catch (_) { return ''; }
  }

  function showToast(message) {
    if (!message) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function localISODate(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function toDateTimeLocal(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function csvCell(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null || raw === '') return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : (parsed ?? fallback);
    } catch (_) {
      return fallback;
    }
  }

  function loadNumber(key, fallback) {
    const n = parseFloat(localStorage.getItem(key));
    return Number.isFinite(n) ? n : fallback;
  }
});
