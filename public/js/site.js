(() => {
  const list = document.querySelector("[data-projects]");
  if (list) {
    const cards = [...list.querySelectorAll(".project")];
    const filters = [...document.querySelectorAll(".filter")];
    const empty = document.querySelector("[data-empty]");
    let active = "all";

    const setFilter = tag => {
      active = tag;
      filters.forEach(f => f.setAttribute("aria-pressed", String(f.dataset.tag === tag)));
      let shown = 0;
      cards.forEach(c => {
        const match = tag === "all" || c.dataset.tags.split(" ").includes(tag);
        c.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };

    const toggle = card => {
      const open = card.classList.toggle("open");
      card.querySelector(".row").setAttribute("aria-expanded", String(open));
      card.querySelector(".more-label").textContent = open ? "Less" : "More";
    };

    document.addEventListener("click", e => {
      const tagBtn = e.target.closest("[data-tag]");
      if (tagBtn) {
        const tag = tagBtn.classList.contains("tag") && active === tagBtn.dataset.tag ? "all" : tagBtn.dataset.tag;
        setFilter(tag);
        return;
      }
      if (e.target.closest("a")) return;
      const row = e.target.closest(".row");
      if (row) toggle(row.closest(".project"));
    });

    document.addEventListener("keydown", e => {
      if (e.target.classList?.contains("row") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        toggle(e.target.closest(".project"));
      }
    });
  }

  const copy = document.querySelector("[data-copy-email]");
  if (copy) {
    copy.addEventListener("click", () => {
      const email = document.querySelector("[data-email]");
      navigator.clipboard.writeText(email.textContent.trim()).then(() => {
        copy.textContent = "Copied";
        setTimeout(() => { copy.textContent = "Copy email"; }, 1600);
      }).catch(() => {
        const range = document.createRange();
        range.selectNodeContents(email);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
    });
  }
})();
