/**
 * PEA 115 kV Material Hub - Application Logic
 * Built for Provincial Electricity Authority (PEA) Transmission Line Construction Manual (115 kV)
 */

(function () {
  'use strict';

  // --- Global Application State ---
  const state = {
    materials: [],
    categories: [],
    currentCategory: null,
    searchQuery: '',
    storageFilter: 'all',
    sortBy: 'page-asc',
    viewMode: 'grid', // 'grid' | 'table'
    bookmarks: JSON.parse(localStorage.getItem('pea_115kv_bookmarks') || '[]'),
    cart: JSON.parse(localStorage.getItem('pea_115kv_cart') || '[]'),
    compareList: [],
    theme: localStorage.getItem('pea_115kv_theme') || 'light',
    
    // HD Modal state
    currentModalItem: null,
    currentModalPage: 6,
    zoomLevel: 1.0,
    panX: 0,
    panY: 0,
    isPanning: false,
    startX: 0,
    startY: 0,

    // Quiz & Flashcard state
    fcIndex: 0,
    quizIndex: 0,
    quizScore: 0,
    quizQuestions: []
  };

  // --- DOM Elements Cache ---
  const DOM = {
    // Theme
    body: document.body,
    btnThemeToggle: document.getElementById('btn-theme-toggle'),

    // Search & Filter
    searchInput: document.getElementById('search-input'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    filterStorage: document.getElementById('filter-storage'),
    sortBy: document.getElementById('sort-by'),
    btnViewGrid: document.getElementById('btn-view-grid'),
    btnViewTable: document.getElementById('btn-view-table'),
    categoryPillsContainer: document.getElementById('category-pills-container'),
    btnClearCat: document.getElementById('btn-clear-cat'),
    visibleCount: document.getElementById('visible-count'),
    filterStatusTag: document.getElementById('filter-status-tag'),
    btnShowBookmarks: document.getElementById('btn-show-bookmarks'),
    bookmarkBadge: document.getElementById('bookmark-badge'),

    // Containers
    catalogGrid: document.getElementById('catalog-grid'),
    catalogTableWrap: document.getElementById('catalog-table-wrap'),
    materialsTableBody: document.getElementById('materials-table-body'),
    emptyState: document.getElementById('empty-state'),
    btnResetFilters: document.getElementById('btn-reset-filters'),

    // Page jump
    inputPageJump: document.getElementById('input-page-jump'),
    btnGoPage: document.getElementById('btn-go-page'),

    // Header Badges & Buttons
    btnCartOpen: document.getElementById('btn-cart-open'),
    cartBadge: document.getElementById('cart-badge'),
    btnCompareOpen: document.getElementById('btn-compare-open'),
    compareBadge: document.getElementById('compare-badge'),
    btnQuickQuiz: document.getElementById('btn-quick-quiz'),

    // Detail Modal Elements
    detailModal: document.getElementById('detail-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnPrevPage: document.getElementById('btn-prev-page'),
    btnNextPage: document.getElementById('btn-next-page'),
    modalPageNum: document.getElementById('modal-page-num'),
    modalCatTag: document.getElementById('modal-cat-tag'),
    modalTitleThai: document.getElementById('modal-title-thai'),
    modalTitleEng: document.getElementById('modal-title-eng'),
    modalFullImg: document.getElementById('modal-full-img'),
    modalThumbImg: document.getElementById('modal-thumb-img'),
    modalSpecTbody: document.getElementById('modal-spec-tbody'),
    modalUsageContent: document.getElementById('modal-usage-content'),
    modalStorageContent: document.getElementById('modal-storage-content'),
    modalBtnAddCart: document.getElementById('modal-btn-add-cart'),
    modalBtnCompare: document.getElementById('modal-btn-compare'),
    modalBtnBookmark: document.getElementById('modal-btn-bookmark'),

    // Viewer pan & zoom
    viewerViewport: document.getElementById('viewer-viewport'),
    zoomContainer: document.getElementById('zoom-container'),
    btnZoomIn: document.getElementById('btn-zoom-in'),
    btnZoomOut: document.getElementById('btn-zoom-out'),
    btnZoomFit: document.getElementById('btn-zoom-fit'),
    btnZoom100: document.getElementById('btn-zoom-100'),
    btnOpenHdTab: document.getElementById('btn-open-hd-tab'),

    // Cart Drawer
    cartDrawerOverlay: document.getElementById('cart-drawer-overlay'),
    btnCloseCart: document.getElementById('btn-close-cart'),
    cartItemsList: document.getElementById('cart-items-list'),
    cartEmptyState: document.getElementById('cart-empty-state'),
    cartSummaryItems: document.getElementById('cart-summary-items'),
    cartSummaryQty: document.getElementById('cart-summary-qty'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnPrintCart: document.getElementById('btn-print-cart'),
    btnClearCart: document.getElementById('btn-clear-cart'),

    // Compare Modal
    compareModal: document.getElementById('compare-modal'),
    btnCloseCompare: document.getElementById('btn-close-compare'),
    btnCloseCompareFooter: document.getElementById('btn-close-compare-footer'),
    btnClearCompare: document.getElementById('btn-clear-compare'),
    compareMatrixContent: document.getElementById('compare-matrix-content'),

    // Quiz Modal
    quizModal: document.getElementById('quiz-modal'),
    btnCloseQuiz: document.getElementById('btn-close-quiz'),
    tabFlashcards: document.getElementById('tab-flashcards'),
    tabQuiz: document.getElementById('tab-quiz'),
    quizViewFlashcards: document.getElementById('quiz-view-flashcards'),
    quizViewTest: document.getElementById('quiz-view-test'),
    
    // Flashcard elements
    flashcardCard: document.getElementById('flashcard-card'),
    fcImg: document.getElementById('fc-img'),
    fcThaiName: document.getElementById('fc-thai-name'),
    fcEngName: document.getElementById('fc-eng-name'),
    fcCat: document.getElementById('fc-cat'),
    fcCodes: document.getElementById('fc-codes'),
    fcStorage: document.getElementById('fc-storage'),
    fcPrev: document.getElementById('fc-prev'),
    fcNext: document.getElementById('fc-next'),
    fcCounter: document.getElementById('fc-counter'),

    // Quiz Test elements
    quizCurrQ: document.getElementById('quiz-curr-q'),
    quizCurrScore: document.getElementById('quiz-curr-score'),
    quizQImg: document.getElementById('quiz-q-img'),
    quizQText: document.getElementById('quiz-q-text'),
    quizOptionsGrid: document.getElementById('quiz-options-grid'),
    quizFeedbackBox: document.getElementById('quiz-feedback-box'),
    btnNextQ: document.getElementById('btn-next-q'),
    btnRestartQuiz: document.getElementById('btn-restart-quiz'),

    // Print Container
    printSheetContainer: document.getElementById('print-sheet-container'),
    printDateText: document.getElementById('print-date-text'),
    printTableBody: document.getElementById('print-table-body'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // =========================================================
  // INITIALIZATION
  // =========================================================
  function init() {
    if (!window.PEA_MATERIALS_DATA) {
      console.error('PEA Materials Data not loaded');
      showToast('เกิดข้อผิดพลาดในการโหลดฐานข้อมูลพัสดุ');
      return;
    }

    state.materials = window.PEA_MATERIALS_DATA.materials || [];
    state.categories = window.PEA_MATERIALS_DATA.categories || [];

    // Apply Saved Theme
    applyTheme(state.theme);

    // Render Initial UI
    renderCategoryPills();
    updateBadges();
    applyFilterAndSort();

    // Event Listeners
    setupEventListeners();
    setupPanAndZoom();

    console.log(`PEA 115 kV Hub initialized: ${state.materials.length} items, ${state.categories.length} categories.`);
  }

  // =========================================================
  // THEME SWITCHER
  // =========================================================
  function applyTheme(theme) {
    state.theme = theme;
    DOM.body.className = `theme-${theme}`;
    localStorage.setItem('pea_115kv_theme', theme);
    DOM.btnThemeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // =========================================================
  // TOAST NOTIFICATIONS
  // =========================================================
  function showToast(message, icon = 'ℹ️') {
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================
  // CATEGORY PILLS RENDERER
  // =========================================================
  function renderCategoryPills() {
    DOM.categoryPillsContainer.innerHTML = '';
    
    state.categories.forEach(cat => {
      const count = state.materials.filter(m => m.catId === cat.id).length;
      const pill = document.createElement('button');
      pill.className = `cat-pill ${state.currentCategory === cat.id ? 'active' : ''}`;
      pill.setAttribute('data-cat-id', cat.id);
      pill.innerHTML = `
        <span class="cat-pill-title">หมวด ${cat.id} ${cat.name.replace('หมวด', '')}</span>
        <span class="cat-pill-count">${count}</span>
      `;
      pill.addEventListener('click', () => {
        if (state.currentCategory === cat.id) {
          state.currentCategory = null;
        } else {
          state.currentCategory = cat.id;
        }
        updateCategoryPillsActiveState();
        applyFilterAndSort();
      });
      DOM.categoryPillsContainer.appendChild(pill);
    });

    DOM.btnClearCat.addEventListener('click', () => {
      state.currentCategory = null;
      updateCategoryPillsActiveState();
      applyFilterAndSort();
    });
  }

  function updateCategoryPillsActiveState() {
    const pills = DOM.categoryPillsContainer.querySelectorAll('.cat-pill');
    pills.forEach(p => {
      const catId = parseInt(p.getAttribute('data-cat-id'), 10);
      if (state.currentCategory === catId) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    if (state.currentCategory === null) {
      DOM.btnClearCat.classList.add('active');
    } else {
      DOM.btnClearCat.classList.remove('active');
    }
  }

  // =========================================================
  // FILTERING & SORTING LOGIC
  // =========================================================
  function getFilteredMaterials() {
    let filtered = [...state.materials];

    // Filter by Category
    if (state.currentCategory !== null) {
      filtered = filtered.filter(m => m.catId === state.currentCategory);
    }

    // Filter by Storage
    if (state.storageFilter !== 'all') {
      filtered = filtered.filter(m => m.storage && m.storage.includes(state.storageFilter));
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(m => {
        const thai = (m.thaiName || '').toLowerCase();
        const eng = (m.engName || '').toLowerCase();
        const usage = (m.usage || '').toLowerCase();
        const storage = (m.storage || '').toLowerCase();
        const pageStr = m.page.toString();
        const tags = (m.tags || []).join(' ').toLowerCase();
        
        // Search inside specTable for material code or dimensions
        const codesAndSizes = (m.specTable || []).map(s => `${s.code || ''} ${s.size || ''} ${s.moment || ''}`).join(' ').toLowerCase();

        return thai.includes(q) || 
               eng.includes(q) || 
               usage.includes(q) || 
               storage.includes(q) || 
               pageStr === q || 
               tags.includes(q) || 
               codesAndSizes.includes(q);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (state.sortBy === 'page-asc') return a.page - b.page;
      if (state.sortBy === 'page-desc') return b.page - a.page;
      if (state.sortBy === 'name-asc') return (a.thaiName || '').localeCompare(b.thaiName || '', 'th');
      if (state.sortBy === 'eng-asc') return (a.engName || '').localeCompare(b.engName || '');
      return 0;
    });

    return filtered;
  }

  function applyFilterAndSort() {
    const items = getFilteredMaterials();
    DOM.visibleCount.textContent = items.length;

    // Update filter status tag
    if (state.currentCategory !== null) {
      const cat = state.categories.find(c => c.id === state.currentCategory);
      DOM.filterStatusTag.textContent = `หมวด ${cat.id}: ${cat.name}`;
      DOM.filterStatusTag.classList.remove('hidden');
    } else {
      DOM.filterStatusTag.classList.add('hidden');
    }

    if (items.length === 0) {
      DOM.catalogGrid.classList.add('hidden');
      DOM.catalogTableWrap.classList.add('hidden');
      DOM.emptyState.classList.remove('hidden');
    } else {
      DOM.emptyState.classList.add('hidden');
      if (state.viewMode === 'grid') {
        DOM.catalogGrid.classList.remove('hidden');
        DOM.catalogTableWrap.classList.add('hidden');
        renderGridView(items);
      } else {
        DOM.catalogGrid.classList.add('hidden');
        DOM.catalogTableWrap.classList.remove('hidden');
        renderTableView(items);
      }
    }
  }

  // =========================================================
  // RENDER GRID VIEW (CARDS)
  // =========================================================
  function renderGridView(items) {
    DOM.catalogGrid.innerHTML = '';

    items.forEach(item => {
      const isBookmarked = state.bookmarks.includes(item.id);
      const isCompared = state.compareList.includes(item.id);

      // Collect sample codes from spec table
      const codes = (item.specTable || [])
        .map(s => s.code)
        .filter(c => c && c !== '-' && c.length > 3)
        .slice(0, 3);

      const card = document.createElement('article');
      card.className = 'material-card';
      card.innerHTML = `
        <div class="card-header-image" data-id="${item.id}" title="คลิกเพื่อดูแผ่นคู่มือฉบับเต็มและสเปก">
          <span class="card-cat-badge">หมวด ${item.catId}</span>
          <span class="card-page-badge">หน้า ${item.page}</span>
          <img src="${item.imageThumb}" alt="${item.thaiName}" loading="lazy" onerror="this.src='${item.fullPageImg}'">
        </div>
        <div class="card-body">
          <h2 class="card-title-thai" title="${item.thaiName}">${item.thaiName}</h2>
          <div class="card-title-eng" title="${item.engName}">${item.engName}</div>

          <div class="card-spec-tags">
            ${codes.length > 0 ? codes.map(c => `<span class="spec-pill highlight">รหัส: ${c}</span>`).join('') : '<span class="spec-pill">ดูรหัสในสเปก</span>'}
            <span class="spec-pill">${(item.specTable || []).length} รายการย่อย</span>
          </div>

          <div class="card-storage-info">
            <span class="storage-badge">📦 ${item.storage || 'ตามระเบียบ'}</span>
            <span class="page-link-hint">📖 หน้า ${item.page}/111</span>
          </div>

          <div class="card-actions">
            <button class="btn-card-view" data-id="${item.id}">
              <span>🔍 ดูสเปก & คู่มือ HD</span>
            </button>
            <button class="btn-card-cart" data-id="${item.id}" title="เพิ่มในใบเบิกพัสดุ">
              <span>➕</span>
            </button>
            <button class="btn-card-comp ${isCompared ? 'active' : ''}" data-id="${item.id}" title="${isCompared ? 'นำออกจากการเปรียบเทียบ' : 'เพิ่มเพื่อเปรียบเทียบ'}">
              <span>⚖️</span>
            </button>
            <button class="btn-card-bm ${isBookmarked ? 'active' : ''}" data-id="${item.id}" title="${isBookmarked ? 'ลบออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}">
              <span>${isBookmarked ? '★' : '☆'}</span>
            </button>
          </div>
        </div>
      `;

      // Event Listeners on Card
      card.querySelector('.card-header-image').addEventListener('click', () => openDetailModal(item));
      card.querySelector('.btn-card-view').addEventListener('click', () => openDetailModal(item));
      card.querySelector('.btn-card-cart').addEventListener('click', () => addItemToCartFromCard(item));
      card.querySelector('.btn-card-comp').addEventListener('click', (e) => toggleCompareItem(item.id, e.currentTarget));
      card.querySelector('.btn-card-bm').addEventListener('click', (e) => toggleBookmark(item.id, e.currentTarget));

      DOM.catalogGrid.appendChild(card);
    });
  }

  // =========================================================
  // RENDER TABLE VIEW
  // =========================================================
  function renderTableView(items) {
    DOM.materialsTableBody.innerHTML = '';

    items.forEach(item => {
      const isBookmarked = state.bookmarks.includes(item.id);
      const isCompared = state.compareList.includes(item.id);
      const codes = (item.specTable || []).map(s => s.code).filter(c => c && c !== '-');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <img src="${item.imageThumb}" alt="${item.thaiName}" class="table-thumb" onerror="this.src='${item.fullPageImg}'">
        </td>
        <td><strong>น.${item.page}</strong></td>
        <td><span class="modal-cat-badge" style="font-size: 0.7rem;">หมวด ${item.catId}</span></td>
        <td>
          <div class="table-title-main">${item.thaiName}</div>
          <div class="table-title-sub">${item.engName}</div>
        </td>
        <td>
          <div>
            ${codes.slice(0, 3).map(c => `<span class="table-codes-pill">${c}</span>`).join('')}
            ${codes.length > 3 ? `<small>+อีก ${codes.length - 3} รหัส</small>` : ''}
          </div>
        </td>
        <td><small>📦 ${item.storage || '-'}</small></td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn-card-view" style="padding: 4px 8px; font-size: 0.78rem;" data-id="${item.id}">ดูแผ่นคู่มือ</button>
            <button class="btn-card-cart" style="width: 30px; height: 30px; font-size: 0.8rem;" data-id="${item.id}" title="เพิ่มในใบเบิก">➕</button>
            <button class="btn-card-bm ${isBookmarked ? 'active' : ''}" style="width: 30px; height: 30px; font-size: 0.8rem;" data-id="${item.id}">${isBookmarked ? '★' : '☆'}</button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-card-view').addEventListener('click', () => openDetailModal(item));
      tr.querySelector('.btn-card-cart').addEventListener('click', () => addItemToCartFromCard(item));
      tr.querySelector('.btn-card-bm').addEventListener('click', (e) => toggleBookmark(item.id, e.currentTarget));

      DOM.materialsTableBody.appendChild(tr);
    });
  }

  // =========================================================
  // MODAL 1: HD MANUAL PAGE VIEWER & DETAILED SPEC SHEET
  // =========================================================
  function openDetailModal(itemOrPage) {
    let item;
    let pageNum;

    if (typeof itemOrPage === 'number') {
      pageNum = itemOrPage;
      item = state.materials.find(m => m.page === pageNum);
    } else {
      item = itemOrPage;
      pageNum = item.page;
    }

    state.currentModalPage = pageNum;
    state.currentModalItem = item;

    // Reset Viewer pan & zoom
    resetViewer();

    // Set Page Numbers
    DOM.modalPageNum.textContent = `หน้า ${pageNum} / 111`;
    DOM.modalFullImg.src = `app_data/pages/page_${String(pageNum).padStart(3, '0')}.jpg`;

    if (item) {
      DOM.modalCatTag.textContent = `หมวด ${item.catId} ${item.categoryName || ''}`;
      DOM.modalTitleThai.textContent = item.thaiName;
      DOM.modalTitleEng.textContent = item.engName;
      DOM.modalThumbImg.src = item.imageThumb;
      DOM.modalThumbImg.classList.remove('hidden');

      // Populate Spec Table
      DOM.modalSpecTbody.innerHTML = '';
      (item.specTable || []).forEach((spec, idx) => {
        const row = document.createElement('tr');
        const code = spec.code || '-';
        row.innerHTML = `
          <td>${spec.item || idx + 1}</td>
          <td>
            <strong>${spec.size || '-'}</strong>
            ${spec.weight ? `<br><small>น้ำหนัก: ${spec.weight}</small>` : ''}
            ${spec.moment ? `<br><small>โมเมนต์ใช้งาน: ${spec.moment}</small>` : ''}
            ${spec.condition ? `<br><small>${spec.condition}</small>` : ''}
            ${spec.drawing ? `<br><small>แบบเลขที่: ${spec.drawing}</small>` : ''}
          </td>
          <td>
            ${code !== '-' ? `
              <span class="sap-code-badge">
                <span>${code}</span>
                <button class="btn-copy-code" data-code="${code}" title="คัดลอกรหัสพัสดุ">📋</button>
              </span>
            ` : '<span style="color: var(--text-muted);">-</span>'}
          </td>
          <td style="text-align: center;">
            <button class="btn-pea btn-spec-add" style="padding: 4px 8px; font-size: 0.75rem;" data-idx="${idx}">
              + เบิก
            </button>
          </td>
        `;

        // Copy button
        const btnCopy = row.querySelector('.btn-copy-code');
        if (btnCopy) {
          btnCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
              showToast(`คัดลอกรหัส ${code} เรียบร้อย`, '📋');
            });
          });
        }

        // Add to cart from spec row
        row.querySelector('.btn-spec-add').addEventListener('click', () => {
          addItemToCart(item, spec);
        });

        DOM.modalSpecTbody.appendChild(row);
      });

      // Usage & Storage Guidelines
      DOM.modalUsageContent.textContent = item.usage || 'ดูรายละเอียดในแบบมาตรฐานที่เกี่ยวข้อง';
      DOM.modalStorageContent.innerHTML = `
        <strong>เงื่อนไขการจัดเก็บ:</strong> ${item.storage || 'ตามมาตรฐานพัสดุ กฟภ.'}
        <br><small style="color: var(--text-muted);">ควรตรวจเช็กสภาพก่อนการเบิกจ่ายและนำไปติดตั้งในระบบสายส่ง</small>
      `;

      // Footer Buttons
      DOM.modalBtnBookmark.classList.toggle('active', state.bookmarks.includes(item.id));
      DOM.modalBtnBookmark.onclick = () => {
        toggleBookmark(item.id, DOM.modalBtnBookmark);
      };

      DOM.modalBtnCompare.onclick = () => {
        toggleCompareItem(item.id, DOM.modalBtnCompare);
      };

      DOM.modalBtnAddCart.onclick = () => {
        addItemToCart(item, item.specTable && item.specTable[0] ? item.specTable[0] : null);
      };

      DOM.modalBtnAddCart.classList.remove('hidden');
      DOM.modalBtnCompare.classList.remove('hidden');
      DOM.modalBtnBookmark.classList.remove('hidden');
    } else {
      // For divider or introductory pages (e.g. Page 1 Cover, Page 4 TOC)
      DOM.modalCatTag.textContent = 'เอกสารมาตรฐาน กฟภ.';
      DOM.modalTitleThai.textContent = pageNum === 1 ? 'หน้าปกคู่มืออุปกรณ์ไฟฟ้า 115 kV' :
                                       pageNum === 4 ? 'สารบัญหมวดหมู่พัสดุ' : `หน้าคู่มือที่ ${pageNum}`;
      DOM.modalTitleEng.textContent = 'PEA 115 KV TRANSMISSION LINE MATERIAL MANUAL';
      DOM.modalThumbImg.classList.add('hidden');
      DOM.modalSpecTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">หน้านี้เป็นส่วนเนื้อหา/สารบัญ/หมวดหมู่ของคู่มือ</td></tr>';
      DOM.modalUsageContent.textContent = 'สามารถเลื่อนดูหน้าถัดไป หรือซูมอ่านเนื้อหาของหน้านี้ได้จากแท่นขยายด้านซ้าย';
      DOM.modalStorageContent.textContent = 'กองมาตรฐานระบบไฟฟ้า (กมฟ.) / กองบริหารและจัดการคลังพัสดุ 4 (กคพ.4)';

      DOM.modalBtnAddCart.classList.add('hidden');
      DOM.modalBtnCompare.classList.add('hidden');
      DOM.modalBtnBookmark.classList.add('hidden');
    }

    DOM.detailModal.classList.remove('hidden');
  }

  function closeDetailModal() {
    DOM.detailModal.classList.add('hidden');
  }

  function stepPage(delta) {
    let next = state.currentModalPage + delta;
    if (next < 1) next = 111;
    if (next > 111) next = 1;
    openDetailModal(next);
  }

  // =========================================================
  // PAN & ZOOM ENGINE FOR HD MANUAL VIEWER
  // =========================================================
  function setupPanAndZoom() {
    const vp = DOM.viewerViewport;

    // Mouse Down (Start Pan)
    vp.addEventListener('mousedown', (e) => {
      state.isPanning = true;
      state.startX = e.clientX - state.panX;
      state.startY = e.clientY - state.panY;
      vp.style.cursor = 'grabbing';
    });

    // Mouse Move (Pan)
    window.addEventListener('mousemove', (e) => {
      if (!state.isPanning) return;
      state.panX = e.clientX - state.startX;
      state.panY = e.clientY - state.startY;
      updateTransform();
    });

    // Mouse Up
    window.addEventListener('mouseup', () => {
      state.isPanning = false;
      vp.style.cursor = 'grab';
    });

    // Mouse Wheel (Scroll to Zoom)
    vp.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = 0.15;
      if (e.deltaY < 0) {
        state.zoomLevel = Math.min(state.zoomLevel + zoomFactor, 3.5);
      } else {
        state.zoomLevel = Math.max(state.zoomLevel - zoomFactor, 0.4);
      }
      updateTransform();
    }, { passive: false });

    // Zoom Buttons
    DOM.btnZoomIn.addEventListener('click', () => {
      state.zoomLevel = Math.min(state.zoomLevel + 0.25, 3.5);
      updateTransform();
    });

    DOM.btnZoomOut.addEventListener('click', () => {
      state.zoomLevel = Math.max(state.zoomLevel - 0.25, 0.4);
      updateTransform();
    });

    DOM.btnZoomFit.addEventListener('click', resetViewer);

    DOM.btnZoom100.addEventListener('click', () => {
      state.zoomLevel = 1.0;
      state.panX = 0;
      state.panY = 0;
      updateTransform();
    });

    DOM.btnOpenHdTab.addEventListener('click', () => {
      window.open(DOM.modalFullImg.src, '_blank');
    });
  }

  function resetViewer() {
    state.zoomLevel = 0.85;
    state.panX = 0;
    state.panY = 0;
    updateTransform();
  }

  function updateTransform() {
    DOM.zoomContainer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoomLevel})`;
  }

  // =========================================================
  // REQUISITION CART (BOM TOOL)
  // =========================================================
  function addItemToCartFromCard(item) {
    const defaultSpec = item.specTable && item.specTable[0] ? item.specTable[0] : null;
    addItemToCart(item, defaultSpec);
  }

  function addItemToCart(item, spec) {
    const code = spec ? (spec.code || '-') : '-';
    const specDesc = spec ? (spec.size || 'ขนาดมาตรฐาน') : 'ขนาดมาตรฐาน';

    const existingIndex = state.cart.findIndex(c => c.itemId === item.id && c.code === code);
    if (existingIndex > -1) {
      state.cart[existingIndex].qty += 1;
    } else {
      state.cart.push({
        itemId: item.id,
        thaiName: item.thaiName,
        engName: item.engName,
        category: item.categoryName || `หมวด ${item.catId}`,
        page: item.page,
        code: code,
        specDesc: specDesc,
        qty: 1,
        unit: 'ชิ้น/ชุด'
      });
    }

    saveCart();
    showToast(`เพิ่ม "${item.thaiName} (${code})" ในใบเบิกแล้ว`, '📋');
  }

  function saveCart() {
    localStorage.setItem('pea_115kv_cart', JSON.stringify(state.cart));
    updateBadges();
    renderCartDrawer();
  }

  function renderCartDrawer() {
    DOM.cartItemsList.innerHTML = '';
    
    if (state.cart.length === 0) {
      DOM.cartEmptyState.classList.remove('hidden');
      DOM.cartSummaryItems.textContent = '0 รายการ';
      DOM.cartSummaryQty.textContent = '0 ชิ้น/ชุด';
      return;
    }

    DOM.cartEmptyState.classList.add('hidden');
    let totalQty = 0;

    state.cart.forEach((item, idx) => {
      totalQty += item.qty;
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <div class="cart-item-top">
          <div>
            <div class="cart-item-title">${item.thaiName}</div>
            <small style="color: var(--text-secondary);">${item.specDesc}</small>
          </div>
          <button class="btn-remove-item" data-idx="${idx}" title="ลบรายการนี้">🗑️</button>
        </div>
        <div class="cart-item-code">รหัส: ${item.code} | น.${item.page}</div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="btn-qty btn-minus" data-idx="${idx}">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="btn-qty btn-plus" data-idx="${idx}">+</button>
            <small style="color: var(--text-muted); margin-left: 4px;">${item.unit}</small>
          </div>
        </div>
      `;

      row.querySelector('.btn-minus').addEventListener('click', () => {
        if (item.qty > 1) {
          item.qty -= 1;
        } else {
          state.cart.splice(idx, 1);
        }
        saveCart();
      });

      row.querySelector('.btn-plus').addEventListener('click', () => {
        item.qty += 1;
        saveCart();
      });

      row.querySelector('.btn-remove-item').addEventListener('click', () => {
        state.cart.splice(idx, 1);
        saveCart();
      });

      DOM.cartItemsList.appendChild(row);
    });

    DOM.cartSummaryItems.textContent = `${state.cart.length} รายการ`;
    DOM.cartSummaryQty.textContent = `${totalQty} ชิ้น/ชุด`;
  }

  function exportCartCSV() {
    if (state.cart.length === 0) {
      showToast('ไม่มีรายการพัสดุในใบเบิก');
      return;
    }

    const headers = ['ลำดับ', 'รหัสพัสดุ (SAP Code)', 'รายการพัสดุอุปกรณ์', 'รายละเอียด/ขนาด', 'หมวดหมู่งาน', 'หน้าคู่มือ', 'จำนวน', 'หน่วย'];
    const rows = state.cart.map((item, idx) => [
      idx + 1,
      `"${item.code}"`,
      `"${item.thaiName.replace(/"/g, '""')}"`,
      `"${item.specDesc.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.page,
      item.qty,
      `"${item.unit}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PEA_115kV_Requisition_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว', '📥');
  }

  function printCartSheet() {
    if (state.cart.length === 0) {
      showToast('ไม่มีรายการพัสดุในใบเบิก');
      return;
    }

    DOM.printDateText.textContent = new Date().toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    DOM.printTableBody.innerHTML = '';
    state.cart.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold;">${item.code}</td>
        <td>${item.thaiName}</td>
        <td>${item.specDesc}</td>
        <td>${item.category}</td>
        <td style="text-align: center;">${item.page}</td>
        <td style="text-align: right; font-weight: bold;">${item.qty}</td>
        <td style="text-align: center;">${item.unit}</td>
      `;
      DOM.printTableBody.appendChild(tr);
    });

    window.print();
  }

  // =========================================================
  // BOOKMARKS & COMPARISON MATRIX
  // =========================================================
  function toggleBookmark(itemId, btnElem) {
    const idx = state.bookmarks.indexOf(itemId);
    if (idx > -1) {
      state.bookmarks.splice(idx, 1);
      showToast('ลบออกจากรายการที่บันทึกแล้ว', '🗑️');
    } else {
      state.bookmarks.push(itemId);
      showToast('บันทึกในรายการโปรดเรียบร้อย', '⭐');
    }
    localStorage.setItem('pea_115kv_bookmarks', JSON.stringify(state.bookmarks));
    updateBadges();
    applyFilterAndSort();
  }

  function toggleCompareItem(itemId, btnElem) {
    const idx = state.compareList.indexOf(itemId);
    if (idx > -1) {
      state.compareList.splice(idx, 1);
      showToast('นำออกจากการเปรียบเทียบแล้ว');
    } else {
      if (state.compareList.length >= 4) {
        showToast('สามารถเปรียบเทียบได้สูงสุด 4 รายการพร้อมกัน', '⚠️');
        return;
      }
      state.compareList.push(itemId);
      showToast('เพิ่มในตารางเปรียบเทียบแล้ว', '⚖️');
    }
    updateBadges();
    applyFilterAndSort();
  }

  function openCompareModal() {
    if (state.compareList.length === 0) {
      showToast('กรุณากดปุ่ม ⚖️ ที่การ์ดพัสดุอย่างน้อย 1 รายการเพื่อเปรียบเทียบ', 'ℹ️');
      return;
    }

    const items = state.compareList.map(id => state.materials.find(m => m.id === id)).filter(Boolean);
    
    let html = '<table class="compare-matrix-table"><thead><tr><th>คุณสมบัติ</th>';
    items.forEach(it => {
      html += `
        <th class="compare-item-header">
          <img src="${it.imageThumb}" class="compare-item-img" onerror="this.src='${it.fullPageImg}'">
          <div style="font-weight: 700;">${it.thaiName}</div>
          <small style="color: var(--text-muted);">${it.engName}</small>
          <br>
          <button class="btn-card-view" style="margin-top: 8px; font-size: 0.75rem;" onclick="window.PEA_APP.openDetailModal('${it.id}')">เปิดแผ่นคู่มือ</button>
        </th>
      `;
    });
    html += '</tr></thead><tbody>';

    // Rows
    html += `<tr><th>หมวดหมู่</th>${items.map(it => `<td>หมวด ${it.catId} ${it.categoryName || ''}</td>`).join('')}</tr>`;
    html += `<tr><th>หน้าคู่มือ</th>${items.map(it => `<td>หน้า ${it.page} / 111</td>`).join('')}</tr>`;
    html += `<tr><th>รหัสพัสดุ (SAP Codes)</th>${items.map(it => `<td>${(it.specTable || []).map(s => `<code>${s.code || '-'}</code> (${s.size || ''})`).join('<br>')}</td>`).join('')}</tr>`;
    html += `<tr><th>การประกอบใช้งาน</th>${items.map(it => `<td style="white-space: pre-line;">${it.usage || '-'}</td>`).join('')}</tr>`;
    html += `<tr><th>สถานที่จัดเก็บ</th>${items.map(it => `<td>📦 ${it.storage || '-'}</td>`).join('')}</tr>`;

    html += '</tbody></table>';

    DOM.compareMatrixContent.innerHTML = html;
    DOM.compareModal.classList.remove('hidden');
  }

  function updateBadges() {
    DOM.cartBadge.textContent = state.cart.length;
    DOM.cartBadge.classList.toggle('hidden', state.cart.length === 0);

    DOM.compareBadge.textContent = state.compareList.length;
    DOM.compareBadge.classList.toggle('hidden', state.compareList.length === 0);

    DOM.bookmarkBadge.textContent = state.bookmarks.length;
  }

  // =========================================================
  // KNOWLEDGE QUIZ & FLASHCARDS
  // =========================================================
  function openQuizModal() {
    state.fcIndex = 0;
    renderFlashcard();
    startQuiz();
    DOM.quizModal.classList.remove('hidden');
  }

  function renderFlashcard() {
    const item = state.materials[state.fcIndex];
    if (!item) return;

    DOM.flashcardCard.classList.remove('flipped');
    DOM.fcImg.src = item.imageThumb;
    DOM.fcThaiName.textContent = item.thaiName;
    DOM.fcEngName.textContent = item.engName;
    DOM.fcCat.textContent = `หมวด ${item.catId}: ${item.categoryName || ''}`;
    
    const codes = (item.specTable || []).map(s => `${s.code || '-'} (${s.size || ''})`).join(' | ');
    DOM.fcCodes.textContent = `รหัสพัสดุ: ${codes}`;
    DOM.fcStorage.textContent = `การจัดเก็บ: 📦 ${item.storage || 'ตามมาตรฐาน'}`;

    DOM.fcCounter.textContent = `${state.fcIndex + 1} / ${state.materials.length}`;
  }

  function startQuiz() {
    state.quizIndex = 0;
    state.quizScore = 0;
    
    // Pick 10 random items
    const shuffled = [...state.materials].sort(() => 0.5 - Math.random());
    state.quizQuestions = shuffled.slice(0, 10);
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (state.quizIndex >= state.quizQuestions.length) {
      // Finished Quiz
      DOM.quizQBox = `
        <h3>🎉 ยินดีด้วย! คุณทำแบบทดสอบเสร็จสิ้น</h3>
        <p style="font-size: 1.2rem; margin: 14px 0;">คะแนนที่ได้: <strong>${state.quizScore} / ${state.quizQuestions.length}</strong> คะแนน</p>
      `;
      DOM.quizOptionsGrid.innerHTML = '';
      DOM.quizFeedbackBox.className = 'quiz-feedback correct';
      DOM.quizFeedbackBox.innerHTML = `เก่งมาก! คุณมีความรู้ความเข้าใจในพัสดุอุปกรณ์สายส่ง 115 เควี ของ กฟภ. เป็นอย่างดี`;
      DOM.quizFeedbackBox.classList.remove('hidden');
      DOM.btnNextQ.classList.add('hidden');
      DOM.btnRestartQuiz.classList.remove('hidden');
      return;
    }

    const currentItem = state.quizQuestions[state.quizIndex];
    DOM.quizCurrQ.textContent = state.quizIndex + 1;
    DOM.quizCurrScore.textContent = state.quizScore;
    DOM.quizQImg.src = currentItem.imageThumb;
    DOM.quizQText.textContent = `ภาพนี้คือพัสดุอุปกรณ์ชนิดใด ในระบบสายส่ง 115 เควี?`;
    DOM.quizFeedbackBox.classList.add('hidden');
    DOM.btnNextQ.classList.add('hidden');
    DOM.btnRestartQuiz.classList.add('hidden');

    // Create 4 choices (1 correct, 3 wrong from other items)
    const wrongChoices = state.materials
      .filter(m => m.id !== currentItem.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const allChoices = [currentItem, ...wrongChoices].sort(() => 0.5 - Math.random());

    DOM.quizOptionsGrid.innerHTML = '';
    allChoices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'btn-quiz-option';
      btn.textContent = choice.thaiName;
      btn.addEventListener('click', () => handleQuizAnswer(choice.id === currentItem.id, btn, currentItem));
      DOM.quizOptionsGrid.appendChild(btn);
    });
  }

  function handleQuizAnswer(isCorrect, clickedBtn, currentItem) {
    const buttons = DOM.quizOptionsGrid.querySelectorAll('.btn-quiz-option');
    buttons.forEach(b => {
      b.disabled = true;
      if (b.textContent === currentItem.thaiName) {
        b.classList.add('correct');
      }
    });

    if (isCorrect) {
      state.quizScore += 1;
      DOM.quizCurrScore.textContent = state.quizScore;
      DOM.quizFeedbackBox.className = 'quiz-feedback correct';
      DOM.quizFeedbackBox.innerHTML = `✅ <strong>ถูกต้อง!</strong> นี่คือ "${currentItem.thaiName}" (${currentItem.engName}) อยู่ในหมวด ${currentItem.catId}`;
    } else {
      clickedBtn.classList.add('incorrect');
      DOM.quizFeedbackBox.className = 'quiz-feedback incorrect';
      DOM.quizFeedbackBox.innerHTML = `❌ <strong>ยังไม่ถูกต้อง</strong> คำตอบที่ถูกคือ "${currentItem.thaiName}" หน้า ${currentItem.page}`;
    }

    DOM.quizFeedbackBox.classList.remove('hidden');
    DOM.btnNextQ.classList.remove('hidden');
  }

  // =========================================================
  // EVENT LISTENERS SETUP
  // =========================================================
  function setupEventListeners() {
    // Theme toggle
    DOM.btnThemeToggle.addEventListener('click', toggleTheme);

    // Search input
    DOM.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      DOM.btnClearSearch.classList.toggle('hidden', state.searchQuery === '');
      applyFilterAndSort();
    });

    DOM.btnClearSearch.addEventListener('click', () => {
      state.searchInput.value = '';
      state.searchQuery = '';
      DOM.btnClearSearch.classList.add('hidden');
      applyFilterAndSort();
    });

    // Storage filter
    DOM.filterStorage.addEventListener('change', (e) => {
      state.storageFilter = e.target.value;
      applyFilterAndSort();
    });

    // Sort by
    DOM.sortBy.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFilterAndSort();
    });

    // View toggles
    DOM.btnViewGrid.addEventListener('click', () => {
      state.viewMode = 'grid';
      DOM.btnViewGrid.classList.add('active');
      DOM.btnViewTable.classList.remove('active');
      applyFilterAndSort();
    });

    DOM.btnViewTable.addEventListener('click', () => {
      state.viewMode = 'table';
      DOM.btnViewTable.classList.add('active');
      DOM.btnViewGrid.classList.remove('active');
      applyFilterAndSort();
    });

    // Bookmarks Filter
    DOM.btnShowBookmarks.addEventListener('click', () => {
      if (state.bookmarks.length === 0) {
        showToast('ยังไม่มีรายการที่บันทึกไว้ กดปุ่ม ☆ ที่การ์ดเพื่อบันทึก');
        return;
      }
      DOM.searchInput.value = '';
      state.searchQuery = '';
      state.currentCategory = null;
      updateCategoryPillsActiveState();
      
      const bMarks = state.materials.filter(m => state.bookmarks.includes(m.id));
      renderGridView(bMarks);
      DOM.visibleCount.textContent = bMarks.length;
      DOM.filterStatusTag.textContent = '★ รายการที่บันทึกไว้';
      DOM.filterStatusTag.classList.remove('hidden');
    });

    // Reset Filters Button
    DOM.btnResetFilters.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.searchInput.value = '';
      state.currentCategory = null;
      state.storageFilter = 'all';
      DOM.filterStorage.value = 'all';
      updateCategoryPillsActiveState();
      applyFilterAndSort();
    });

    // Page Jump
    DOM.btnGoPage.addEventListener('click', () => {
      const p = parseInt(DOM.inputPageJump.value, 10);
      if (p >= 1 && p <= 111) {
        openDetailModal(p);
      } else {
        showToast('ระบุเลขหน้าระหว่าง 1 ถึง 111');
      }
    });

    document.querySelectorAll('.quick-links .link-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.getAttribute('data-page'), 10);
        openDetailModal(p);
      });
    });

    // Detail Modal Stepper & Close
    DOM.btnCloseModal.addEventListener('click', closeDetailModal);
    DOM.btnPrevPage.addEventListener('click', () => stepPage(-1));
    DOM.btnNextPage.addEventListener('click', () => stepPage(1));

    // Cart Drawer Controls
    DOM.btnCartOpen.addEventListener('click', () => {
      renderCartDrawer();
      DOM.cartDrawerOverlay.classList.remove('hidden');
    });
    DOM.btnCloseCart.addEventListener('click', () => {
      DOM.cartDrawerOverlay.classList.add('hidden');
    });
    DOM.btnExportCsv.addEventListener('click', exportCartCSV);
    DOM.btnPrintCart.addEventListener('click', printCartSheet);
    DOM.btnClearCart.addEventListener('click', () => {
      if (confirm('คุณต้องการล้างรายการพัสดุในใบเบิกทั้งหมดใช่หรือไม่?')) {
        state.cart = [];
        saveCart();
        showToast('ล้างรายการพัสดุทั้งหมดแล้ว');
      }
    });

    // Compare Modal Controls
    DOM.btnCompareOpen.addEventListener('click', openCompareModal);
    DOM.btnCloseCompare.addEventListener('click', () => DOM.compareModal.classList.add('hidden'));
    DOM.btnCloseCompareFooter.addEventListener('click', () => DOM.compareModal.classList.add('hidden'));
    DOM.btnClearCompare.addEventListener('click', () => {
      state.compareList = [];
      updateBadges();
      DOM.compareModal.classList.add('hidden');
      applyFilterAndSort();
      showToast('ล้างรายการเปรียบเทียบเรียบร้อย');
    });

    // Quiz & Flashcard Controls
    DOM.btnQuickQuiz.addEventListener('click', openQuizModal);
    DOM.btnCloseQuiz.addEventListener('click', () => DOM.quizModal.classList.add('hidden'));
    
    DOM.tabFlashcards.addEventListener('click', () => {
      DOM.tabFlashcards.classList.add('active');
      DOM.tabQuiz.classList.remove('active');
      DOM.quizViewFlashcards.classList.remove('hidden');
      DOM.quizViewTest.classList.add('hidden');
    });

    DOM.tabQuiz.addEventListener('click', () => {
      DOM.tabQuiz.classList.add('active');
      DOM.tabFlashcards.classList.remove('active');
      DOM.quizViewTest.classList.remove('hidden');
      DOM.quizViewFlashcards.classList.add('hidden');
    });

    DOM.flashcardCard.addEventListener('click', () => {
      DOM.flashcardCard.classList.toggle('flipped');
    });

    DOM.fcPrev.addEventListener('click', () => {
      state.fcIndex = (state.fcIndex - 1 + state.materials.length) % state.materials.length;
      renderFlashcard();
    });

    DOM.fcNext.addEventListener('click', () => {
      state.fcIndex = (state.fcIndex + 1) % state.materials.length;
      renderFlashcard();
    });

    DOM.btnNextQ.addEventListener('click', () => {
      state.quizIndex += 1;
      renderQuizQuestion();
    });

    DOM.btnRestartQuiz.addEventListener('click', startQuiz);

    // Global Keyboard Hotkeys
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== DOM.searchInput) {
        e.preventDefault();
        DOM.searchInput.focus();
        DOM.searchInput.select();
      } else if (e.key === 'Escape') {
        closeDetailModal();
        DOM.cartDrawerOverlay.classList.add('hidden');
        DOM.compareModal.classList.add('hidden');
        DOM.quizModal.classList.add('hidden');
      } else if (e.key === 'ArrowLeft' && !DOM.detailModal.classList.contains('hidden')) {
        stepPage(-1);
      } else if (e.key === 'ArrowRight' && !DOM.detailModal.classList.contains('hidden')) {
        stepPage(1);
      }
    });
  }

  // Expose helpful functions to window for inline onclicks if needed
  window.PEA_APP = {
    openDetailModal,
    state
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
