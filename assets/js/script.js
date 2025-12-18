(() => {
  const productsGrid = document.getElementById('productsGrid');
  const featuredProduct = document.getElementById('featuredProduct');
  const emptyState = document.getElementById('emptyState');
  const postsGrid = document.getElementById('postsGrid');
  const postsEmpty = document.getElementById('postsEmpty');
  const videosGrid = document.getElementById('videosGrid');
  const fileInput = document.getElementById('fileInput');
  const year = document.getElementById('year');
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const breadcrumbs = document.getElementById('breadcrumbs');
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.getElementById('primary-navigation');

  // Determine which page we're on
  const isProductsPage = window.location.pathname.includes('products.html');
  const isHomePage = !isProductsPage && (window.location.pathname === '/' || window.location.pathname.includes('index.html'));

  year && (year.textContent = new Date().getFullYear().toString());
  
  // Back to top smooth scroll
  document.querySelectorAll('.to-top').forEach(el => {
    el.addEventListener('click', (e) => {
      if (el.getAttribute('href') === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Floating back-to-top visibility: show after scrolling down
  const floatingBack = document.querySelector('.back-to-top');
  if (floatingBack) {
    // Smooth click
    floatingBack.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const toggleBack = () => {
      if (window.scrollY > 220) floatingBack.classList.add('visible');
      else floatingBack.classList.remove('visible');
    };

    window.addEventListener('scroll', toggleBack, { passive: true });
    // initial state
    toggleBack();
  }

  // Parallax for hero visualization elements (dotted circles and tree) — subtle movement on scroll
  const dot1 = document.querySelector('.dotted-circle-1');
  const dot2 = document.querySelector('.dotted-circle-2');
  const treeGif = document.querySelector('.tree-gif');
  function parallax() {
    const y = window.scrollY || window.pageYOffset;
    if (dot1) dot1.style.transform = `translateY(${y * 0.02}px) rotate(${y * 0.01}deg)`;
    if (dot2) dot2.style.transform = `translateY(${y * -0.015}px) rotate(${y * -0.01}deg)`;
    if (treeGif) treeGif.style.transform = `translateY(${Math.min(40, y * 0.03)}px)`;
  }
  window.addEventListener('scroll', parallax, { passive: true });

  // Single light theme; remove theme handling
  document.documentElement.removeAttribute('data-theme');

  // Hamburger
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close on link click (mobile UX)
    mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      // Also close any open dropdowns
      document.querySelectorAll('.dropdown.active').forEach(dd => {
        dd.classList.remove('active');
        dd.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
      });
    }));
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { mainNav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Dropdown menu toggle (mobile/touch)
  const dropdownButtons = document.querySelectorAll('.nav-link');
  dropdownButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = button.closest('.dropdown');
      if (dropdown) {
        dropdown.classList.toggle('active');
        const isActive = dropdown.classList.contains('active');
        button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    dropdownButtons.forEach(button => {
      const dropdown = button.closest('.dropdown');
      if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // EmailJS init - replace with your own keys in README instructions
  // eslint-disable-next-line no-undef
  if (window.emailjs) {
    // Optional: window.emailjs.init('YOUR_PUBLIC_KEY');
  }

  async function tryAutoLoadLocalFile() {
    // First priority: local products data in assets/data/ (when served via HTTP)
    const candidates = ['assets/data/products.csv', 'assets/data/products.xlsx'];
    for (const path of candidates) {
      try {
        const res = await fetch(path, { cache: 'no-store' });
        if (res.ok) {
          const blob = await res.blob();
          await handleFileBlob(blob, path);
          return; // Stop at first successful load
        }
      } catch (_) { /* ignore */ }
    }
    // Optional fallback: attempt to read site.config.json for GitHub auto-fetch
    try {
      const cfgRes = await fetch('site.config.json', { cache: 'no-store' });
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        const owner = cfg.owner, repo = cfg.repo, branch = cfg.branch || 'main';
        const ghCsv = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/products/products.csv`;
        const ghXlsx = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/products/products.xlsx`;
        for (const url of [ghCsv, ghXlsx]) {
          try {
            const r = await fetch(url, { cache: 'no-store' });
            if (r.ok) { const b = await r.blob(); await handleFileBlob(b, url); return; }
          } catch(_){}
        }
      }
    } catch(_){}
    toggleEmptyState(true);
  }

  function toggleEmptyState(show) {
    if (!emptyState) return;
    emptyState.hidden = !show;
  }

  function clearProducts() {
    productsGrid.innerHTML = '';
  }

  function renderProducts(products) {
    clearProducts();
    if (!products || products.length === 0) {
      toggleEmptyState(true);
      return;
    }
    toggleEmptyState(false);
    // No special featured card to keep uniform grid
    featuredProduct && (featuredProduct.innerHTML = '');
    
    // Task 1: Show 6 random products on homepage, all products on products page
    let productsToShow = products;
    if (isHomePage && products.length > 6) {
      // Randomly select 6 products
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      productsToShow = shuffled.slice(0, 6);
    }
    
    for (let i = 0; i < productsToShow.length; i++) {
      const product = productsToShow[i];
      const card = createProductCard(product);
      productsGrid.appendChild(card);
    }
  }

  function normalizeRow(row) {
    // Accept flexible headers by case-insensitive mapping
    const map = {};
    Object.keys(row || {}).forEach(k => { map[k.trim().toLowerCase()] = row[k]; });
    const name = map['product name'] || map['name'] || map['title'] || '';
    const url = map['product url'] || map['url'] || map['link'] || '';
    const price = map['price'] || map['cost'] || '';
    // Task 2: Extract image column
    const image = map['image'] || map['image url'] || map['img'] || map['thumbnail'] || '';
    return { 
      name: String(name).trim(), 
      url: String(url).trim(), 
      price: String(price).trim(),
      image: String(image).trim()
    };
  }

  function createProductCard(product) {
    const { name, url, price, image } = product;
    const card = document.createElement('article');
    card.className = 'product-card';

    const media = document.createElement('div');
    media.className = 'product-media';
    const img = document.createElement('img');
    img.alt = name || 'Product image';
    img.loading = 'lazy';
    img.decoding = 'async';
    
    // Task 2: Use image column if available, otherwise use placeholder
    if (image) {
      img.src = image;
      img.onerror = () => {
        img.src = placeholderImage(name);
      };
    } else {
      img.src = placeholderImage(name);
    }
    
    media.appendChild(img);

    const body = document.createElement('div');
    body.className = 'product-body';
    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = name || 'Untitled Product';
    const priceEl = document.createElement('div');
    priceEl.className = 'product-price';
    priceEl.textContent = price ? `Price: ${price}` : '';

    const actions = document.createElement('div');
    actions.className = 'product-actions';
    const link = document.createElement('a');
    link.className = 'btn primary';
    
    // Task 3: Wrap product links with redirect page
    if (url) {
      link.href = `redirect.html?url=${encodeURIComponent(url)}`;
    } else {
      link.href = '#';
    }
    
    link.target = '_self';
    link.rel = 'nofollow noopener sponsored';
    link.textContent = 'View Product';
    actions.appendChild(link);

    body.appendChild(title);
    body.appendChild(priceEl);
    body.appendChild(actions);

    card.appendChild(media);
    card.appendChild(body);

    // Make entire card clickable to open product modal
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // ignore clicks on links inside the card
      if (e.target.closest('.product-actions') || e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      openProductModal(product);
    });

    return card;
  }

  // Create and open product modal with details. Attempts to fetch rating/comments from product URL (best-effort).
  function openProductModal(product) {
    // remove existing modal
    document.querySelectorAll('.pg-modal').forEach(n => n.remove());

    const modal = document.createElement('div');
    modal.className = 'pg-modal';
    modal.innerHTML = `
      <div class="pg-modal-backdrop" tabindex="-1"></div>
      <div class="pg-modal-panel">
        <button class="pg-modal-close" aria-label="Close">✕</button>
        <div class="pg-modal-body">
          <div class="pg-media"><img src="${product.image || ''}" alt="${product.name || ''}" onerror="this.src='${placeholderImage(product.name)}'"></div>
          <div class="pg-info">
            <h3 class="pg-title">${product.name || 'Product'}</h3>
            <div class="pg-price">${product.price || ''}</div>
            <div class="pg-rating">Loading rating…</div>
            <div class="pg-comments"><h4>Top comments</h4><div class="pg-comments-list">Loading…</div></div>
            <div class="pg-actions"><a class="btn primary" target="_blank" rel="noopener noreferrer" href="redirect.html?url=${encodeURIComponent(product.url || '#')}">Buy it</a></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('.pg-modal-close').addEventListener('click', close);
    modal.querySelector('.pg-modal-backdrop').addEventListener('click', close);

    // Try fetching product URL to extract JSON-LD aggregateRating or comments (best-effort - may be blocked by CORS)
    (async () => {
      try {
        if (!product.url) throw new Error('no url');
        const res = await fetch(product.url, { method: 'GET' });
        const text = await res.text();
        // look for application/ld+json
        const ldMatches = text.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
        if (ldMatches) {
          for (const m of ldMatches) {
            try {
              const js = m.replace(/<script[^>]*>|<\/script>/gi, '');
              const obj = JSON.parse(js);
              const ar = obj && obj.aggregateRating;
              if (ar && (ar.ratingValue || ar.ratingCount)) {
                const ratingEl = modal.querySelector('.pg-rating');
                ratingEl.textContent = `Rating: ${ar.ratingValue || '—'} (${ar.ratingCount || 0} reviews)`;
                break;
              }
            } catch(_){}
          }
        }

        // naive comments extraction: look for common comment class fragments (best-effort)
        const commentSnippets = [];
        const commentMatches = text.match(/<comment[\s\S]*?>[\s\S]*?<\/comment>/gi) || [];
        for (const c of commentMatches.slice(0,5)) commentSnippets.push(c.replace(/<[^>]+>/g,'').trim());
        const commentsList = modal.querySelector('.pg-comments-list');
        if (commentSnippets.length) {
          commentsList.innerHTML = commentSnippets.map(s => `<div class="pg-comment">${s}</div>`).join('');
        } else {
          commentsList.textContent = 'Comments not available.';
        }
      } catch (err) {
        const ratingEl = modal.querySelector('.pg-rating');
        ratingEl.textContent = 'Rating not available';
        const commentsList = modal.querySelector('.pg-comments-list');
        commentsList.textContent = 'Comments not available (CORS or no data).';
      }
    })();
  }

  function placeholderImage(text) {
    const label = encodeURIComponent((text || 'Product').slice(0, 20));
    return `https://dummyimage.com/640x400/0f141a/ffffff.png&text=${label}`;
  }

  async function handleFileBlob(blob, fileName) {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    if (ext === 'csv') {
      const text = await blob.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      const rows = (parsed.data || []).map(normalizeRow).filter(r => r.name && r.url);
      renderProducts(rows);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const arrayBuffer = await blob.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      const rows = (json || []).map(normalizeRow).filter(r => r.name && r.url);
      renderProducts(rows);
    } else {
      // silent fail: unsupported type
    }
  }

  // Removed manual file input listener: import is fully automated from products/

  // Contact form via EmailJS
  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.textContent = 'Sending...';
    try {
      if (!window.emailjs) throw new Error('EmailJS not loaded');
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      // Replace with your serviceId and templateId in README
      const serviceId = 'service_cs4dvq9';
      const templateId = 'template_33rmq6e';
      const publicKey = 'x31pET_IQ84b00AN-';
      window.emailjs.init(publicKey);
      await window.emailjs.send(serviceId, templateId, { from_name: name, reply_to: email, message });
      formStatus.textContent = 'Thanks! Your message has been sent.';
      contactForm.reset();
    } catch (err) {
      console.error(err);
      formStatus.textContent = 'Sorry, something went wrong. Please try again later.';
    }
  });

  // Kickoff: auto-load local file when possible
  tryAutoLoadLocalFile().catch(() => {});

  // Load posts manifest and render posts
  loadPosts({ limit: 3 });
  // Load featured videos
  loadVideos();

  // Breadcrumbs for mobile: reflect current anchor section on scroll
  initBreadcrumbs();

  async function loadPosts(opts) {
    const limit = opts && typeof opts.limit === 'number' ? opts.limit : undefined;
    if (!postsGrid) return;
    try {
      const res = await fetch('assets/data/index.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('no manifest');
      const manifest = await res.json();
      const posts = Array.isArray(manifest) ? manifest : manifest.posts;
      if (!posts || posts.length === 0) { postsEmpty && (postsEmpty.hidden = false); return; }
      const sliced = typeof limit === 'number' ? posts.slice(0, limit) : posts;
      postsEmpty && (postsEmpty.hidden = true);
      for (const post of sliced) {
        const enriched = await enrichPostWithCover(post);
        const card = await createPostCard(enriched);
        postsGrid.appendChild(card);
      }
    } catch (e) {
      // Fallback: Try GitHub directory listing when config provided
      try {
        const cfgRes = await fetch('site.config.json', { cache: 'no-store' });
        if (!cfgRes.ok) throw new Error('no cfg');
        const cfg = await cfgRes.json();
        const owner = cfg.owner, repo = cfg.repo, branch = cfg.branch || 'main';
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/posts?ref=${branch}`;
        const listRes = await fetch(apiUrl, { cache: 'no-store' });
        if (!listRes.ok) throw new Error('no list');
        const files = await listRes.json();
        const mdFiles = (files || []).filter(f => f && f.name && f.name.endsWith('.md'));
        if (mdFiles.length === 0) { postsEmpty && (postsEmpty.hidden = false); return; }
        postsEmpty && (postsEmpty.hidden = true);
        for (const f of mdFiles) {
          const slug = f.name.replace(/\.md$/,'');
          const post = { slug, title: slug.replace(/[-_]/g,' ').replace(/\b\w/g, c => c.toUpperCase()), excerpt: '' };
          const enriched = await enrichPostWithCover(post);
          const card = await createPostCard(enriched);
          postsGrid.appendChild(card);
        }
      } catch(_) {
        postsEmpty && (postsEmpty.hidden = false);
      }
    }
  }

  async function enrichPostWithCover(post) {
    // Try assets/images/<slug>.png/.jpg else fallback to sequential assets/images/postN.png
    const tryUrls = [`assets/images/${post.slug}.png`, `assets/images/${post.slug}.jpg`];
    // Probe sequential numbers based on index in manifest not always known; try 1..20
    for (let i = 1; i <= 20; i++) {
      tryUrls.push(`assets/images/post${i}.png`);
      tryUrls.push(`assets/images/post${i}.jpg`);
    }
    for (const u of tryUrls) {
      try {
        const r = await fetch(u, { method: 'HEAD' });
        if (r.ok) return { ...post, cover: u };
      } catch(_){}
    }
    return post;
  }

  async function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'product-card post-card';
    const media = document.createElement('div');
    media.className = 'product-media';
    const img = document.createElement('img');
    img.alt = post.title || 'Post cover';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = post.cover || placeholderImage(post.title || 'Post');
    media.appendChild(img);
    const body = document.createElement('div');
    body.className = 'product-body';
    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = post.title || 'Untitled Post';
    const excerpt = document.createElement('div');
    excerpt.className = 'product-price';
    excerpt.textContent = post.excerpt || '';
    const actions = document.createElement('div');
    actions.className = 'product-actions';
    const link = document.createElement('a');
    link.className = 'btn ghost';
    link.href = `post.html?slug=${encodeURIComponent(post.slug)}`;
    link.textContent = 'Read Post';
    link.target = '_self';
    actions.appendChild(link);
    body.appendChild(title);
    body.appendChild(excerpt);
    body.appendChild(actions);
    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  async function loadVideos() {
    if (!videosGrid) return;
  
    // Your actual YouTube video IDs
    const featured = ['FrFZk8MCyI0', '6jtBTaDtaMc', 'U--tJMQeNzc'];
  
    for (const id of featured) {
      const card = document.createElement('article');
      card.className = 'product-card post-card';
  
      const media = document.createElement('div');
      media.className = 'product-media';
  
      // Dynamic thumbnail for each video
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      img.alt = `YouTube thumbnail for video ${id}`;
      img.onerror = () => {
        img.src = `https://img.youtube.com/vi/${id}/0.jpg`;
      };
      media.appendChild(img);
  
      const body = document.createElement('div');
      body.className = 'product-body';
  
      const actions = document.createElement('div');
      actions.className = 'product-actions';
  
      const play = document.createElement('button');
      play.className = 'btn primary';
      play.type = 'button';
      play.textContent = 'Play Now';
  
      // Embed uses the same ID
      play.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.className = 'yt-frame';
        iframe.loading = 'lazy';
        iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
        iframe.title = `YouTube video ${id}`;
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        media.innerHTML = '';
        media.appendChild(iframe);
      });
  
      const view = document.createElement('a');
      view.className = 'btn ghost';
      view.href = `https://www.youtube.com/watch?v=${id}`;
      view.target = '_blank';
      view.rel = 'noopener';
      view.textContent = 'Watch on YouTube';
  
      actions.appendChild(play);
      actions.appendChild(view);
      body.appendChild(actions);
      card.appendChild(media);
      card.appendChild(body);
      videosGrid.appendChild(card);
    }
  }

  function initBreadcrumbs() {
    if (!breadcrumbs) return;
    const navItems = [
      { id: 'products', label: 'Products' },
      { id: 'posts', label: 'Posts' },
      { id: 'youtube', label: 'YouTube' },
      { id: 'contact', label: 'Contact' }
    ];
    const els = navItems.map(n => ({ ...n, el: document.getElementById(n.id) }));
    function currentSection() {
      const scrollY = window.scrollY + 120;
      let cur = null;
      for (const n of els) {
        if (!n.el) continue;
        const rect = n.el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        if (scrollY >= top) cur = n;
      }
      return cur;
    }
    function renderCrumb() {
      const cur = currentSection();
      const home = '<a href="./">Home</a>';
      const trail = cur ? `${home} › ${cur.label}` : home;
      breadcrumbs.innerHTML = `<div class="container">${trail}</div>`;
    }
    renderCrumb();
    window.addEventListener('scroll', () => { renderCrumb(); }, { passive: true });
    window.addEventListener('hashchange', renderCrumb);
  }

  // Comments (home and post) — localStorage only
  const commentForm = document.getElementById('commentForm');
  const commentsList = document.getElementById('commentsList');
  if (commentForm && commentsList) {
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug') || 'home';
    const key = `pg:comments:${slug}`;
    function readComments(){
      try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(_) { return []; }
    }
    function writeComments(list){ localStorage.setItem(key, JSON.stringify(list)); }
    function renderComments(){
      const list = readComments();
      list.sort((a,b) => b.stars - a.stars);
      // Display only top 3 comments
      const topThree = list.slice(0, 3);
      commentsList.innerHTML = '';
      for (const c of topThree) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${escapeHtml(c.name)}</strong> — <span class="stars" aria-label="${c.stars} out of 5">${'★'.repeat(c.stars)}${'☆'.repeat(5-c.stars)}</span><br>${escapeHtml(c.comment)}`;
        commentsList.appendChild(li);
      }
      // Show total comment count
      if (list.length > 3) {
        const moreInfo = document.createElement('li');
        moreInfo.style.fontSize = '0.9rem';
        moreInfo.style.color = '#666';
        moreInfo.textContent = `(Showing 3 of ${list.length} comments)`;
        commentsList.appendChild(moreInfo);
      }
    }
    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m])); }
    // Star rating: clickable stars
    const starsContainer = document.createElement('div');
    starsContainer.className = 'star-picker';
    const select = document.getElementById('cStars');
    const starButtons = [];
    for (let i = 1; i <= 5; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = '★';
      b.setAttribute('aria-label', `${i} star`);
      b.style.fontSize = '24px';
      b.style.color = '#b3b3b3';
      b.addEventListener('click', () => { select.value = String(i); paintStars(i); });
      starButtons.push(b);
      starsContainer.appendChild(b);
    }
    const starsField = select?.parentElement;
    if (starsField) { starsField.appendChild(starsContainer); select.style.display = 'none'; }
    function paintStars(n){ starButtons.forEach((b,idx) => { b.style.color = idx < n ? '#FFD700' : '#b3b3b3'; }); }
    paintStars(parseInt(select?.value || '5',10));

    commentForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('cName').value.trim() || 'Anonymous';
      const stars = parseInt(document.getElementById('cStars').value || '5', 10);
      const comment = document.getElementById('cText').value.trim();
      if (!comment) return;
      const list = readComments();
      list.push({ name, stars: Math.max(1, Math.min(5, stars)), comment, ts: Date.now() });
      writeComments(list);
      commentForm.reset();
      paintStars(5);
      renderComments();
    });
    renderComments();
  }
})();