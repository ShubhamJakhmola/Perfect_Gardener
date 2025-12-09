document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("postsGrid");
  const empty = document.getElementById("postsEmpty");

  try {
    const res = await fetch("../assets/data/index.json");
    if (!res.ok) throw new Error("Failed to load index.json");

    const data = await res.json();
    const posts = data.posts;

    if (!posts || posts.length === 0) {
      empty.hidden = false;
      return;
    }

    posts.forEach(post => {
      const card = document.createElement("a");
      card.className = "product-card";
      card.href = `/post.html?slug=${post.slug}`;  // 🔥 ALWAYS absolute path

      card.innerHTML = `
        <div class="product-media">
          <img src="../${post.cover}" alt="${post.title}">
        </div>
        <div class="product-info" style="padding:12px;">
          <h3>${post.title}</h3>
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    empty.hidden = false;
  }
});
