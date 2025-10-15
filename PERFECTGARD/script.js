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

  year.textContent = new Date().getFullYear().toString();

  // EmailJS init - replace with your own keys in README instructions
  // eslint-disable-next-line no-undef
  if (window.emailjs) {
    // Optional: window.emailjs.init('YOUR_PUBLIC_KEY');
  }

  async function tryAutoLoadLocalFile() {
    // First priority: local products/ folder (when served via HTTP)
    const candidates = ['products/products.csv', 'products/products.xlsx'];
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
    // Feature the newest (first) on home if container exists
    if (featuredProduct && products.length > 0) {
      const featured = createProductCard(products[0]);
      featuredProduct.innerHTML = '';
      featuredProduct.appendChild(featured);
    }
    const startIndex = featuredProduct ? 1 : 0;
    for (let i = startIndex; i < products.length; i++) {
      const product = products[i];
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
    return { name: String(name).trim(), url: String(url).trim(), price: String(price).trim() };
  }

  function createProductCard(product) {
    const { name, url, price } = product;
    const card = document.createElement('article');
    card.className = 'product-card';

    const media = document.createElement('div');
    media.className = 'product-media';
    const img = document.createElement('img');
    img.alt = name || 'Product image';
    img.loading = 'lazy';
    img.decoding = 'async';
    // Defer image source resolution
    resolveImage(url).then(src => {
      img.src = src;
    }).catch(() => {
      img.src = placeholderImage(name);
    });
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
    link.href = url || '#';
    link.target = '_self';
    link.rel = 'nofollow noopener sponsored';
    link.textContent = 'View Product';
    actions.appendChild(link);

    body.appendChild(title);
    body.appendChild(priceEl);
    body.appendChild(actions);

    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  function placeholderImage(text) {
    const label = encodeURIComponent((text || 'Product').slice(0, 20));
    return `https://dummyimage.com/640x400/0f141a/ffffff.png&text=${label}`;
  }

  async function resolveImage(productUrl) {
    if (!productUrl) throw new Error('No URL');
    const cacheKey = `img:${productUrl}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const u = new URL('https://api.microlink.io/');
      u.searchParams.set('url', productUrl);
      u.searchParams.set('screenshot', 'false');
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const og = data && data.data && data.data.image && (data.data.image.url || data.data.image);
        if (og) { sessionStorage.setItem(cacheKey, og); return og; }
        // Fallback: request a lightweight screenshot thumbnail
        try {
          const s = new URL('https://api.microlink.io/');
          s.searchParams.set('url', productUrl);
          s.searchParams.set('screenshot', 'true');
          s.searchParams.set('meta', 'false');
          s.searchParams.set('embed', 'screenshot.url');
          const sr = await fetch(s.toString());
          if (sr.ok) {
            const sd = await sr.json();
            const shot = sd && sd.data && sd.data.screenshot && sd.data.screenshot.url;
            if (shot) { sessionStorage.setItem(cacheKey, shot); return shot; }
          }
        } catch(_){}
      }
    } catch (_) { /* ignore */ }
    const ph = placeholderImage('Product');
    sessionStorage.setItem(cacheKey, ph);
    return ph;
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
      const serviceId = 'YOUR_SERVICE_ID';
      const templateId = 'YOUR_TEMPLATE_ID';
      const publicKey = 'YOUR_PUBLIC_KEY';
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
      const res = await fetch('posts/index.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('no manifest');
      const manifest = await res.json();
      const posts = Array.isArray(manifest) ? manifest : manifest.posts;
      if (!posts || posts.length === 0) { postsEmpty && (postsEmpty.hidden = false); return; }
      const sliced = typeof limit === 'number' ? posts.slice(0, limit) : posts;
      postsEmpty && (postsEmpty.hidden = true);
      for (const post of sliced) {
        const card = await createPostCard(post);
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
          const card = await createPostCard(post);
          postsGrid.appendChild(card);
        }
      } catch(_) {
        postsEmpty && (postsEmpty.hidden = false);
      }
    }
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
    const featured = ['dQw4w9WgXcQ','M7lc1UVf-VE','ysz5S6PUM-U'];
    for (const id of featured) {
      const card = document.createElement('article');
      card.className = 'product-card post-card';
      const media = document.createElement('div');
      media.className = 'product-media';
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      img.alt = 'YouTube thumbnail';
      media.appendChild(img);
      const body = document.createElement('div');
      body.className = 'product-body';
      const actions = document.createElement('div');
      actions.className = 'product-actions';
      const play = document.createElement('button');
      play.className = 'btn primary';
      play.type = 'button';
      play.textContent = 'Play';
      play.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.className = 'yt-frame';
        iframe.loading = 'lazy';
        iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
        iframe.title = 'YouTube video';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        media.innerHTML = '';
        media.appendChild(iframe);
      });
      actions.appendChild(play);
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
})();


