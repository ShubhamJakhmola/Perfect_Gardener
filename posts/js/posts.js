document.addEventListener("DOMContentLoaded", async () => {
    const postsGrid = document.getElementById("postsGrid");
    const postsEmpty = document.getElementById("postsEmpty");
  
    try {
      const res = await fetch("index.json");
      if (!res.ok) throw new Error("Failed to fetch posts JSON");
  
      const data = await res.json();
      const posts = data.posts;
  
      if (!posts || posts.length === 0) {
        postsEmpty.hidden = false;
        return;
      }
  
      postsEmpty.hidden = true;
  
      posts.forEach(post => {
        const card = document.createElement("article");
        card.className = "product-card post-card";
  
        card.innerHTML = `
          <div class="product-media">
            <img src="${post.cover}" alt="${post.title}" />
          </div>
          <div class="product-body">
            <h3 class="product-title">${post.title}</h3>
            <p class="product-excerpt">${post.excerpt}</p>
            <div class="product-actions">
              <a class="btn ghost" href="post.html?slug=${encodeURIComponent(post.slug)}">Read Post</a>
            </div>
          </div>
        `;
  
        postsGrid.appendChild(card);
      });
  
    } catch (err) {
      console.error("Error loading posts:", err);
      postsEmpty.hidden = false;
    }
  });
  