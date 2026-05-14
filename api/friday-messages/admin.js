const { escapeHtml, getFridayMessagesConfig, handleCors, html, isAdminRequest } = require("../_lib/fridayMessagesStore");

function renderLocked(response) {
  html(
    response,
    401,
    `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Huzur Cuma Mesajları</title>
  <style>
    body { margin: 0; min-height: 100vh; background: #f6f1e8; color: #231f18; font-family: Inter, system-ui, sans-serif; }
    main { width: min(920px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0; }
    .panel { border: 1px solid #e2d5bf; border-radius: 8px; background: #fffaf1; padding: 24px; line-height: 1.65; }
    h1 { margin: 0 0 18px; font-size: 42px; }
    code { padding: 4px 7px; border-radius: 6px; background: #efe5d5; }
  </style>
</head>
<body>
  <main>
    <p style="color:#0f766e;font-weight:900;letter-spacing:.08em">HUZUR ADMIN</p>
    <h1>Cuma mesajları</h1>
    <div class="panel">
      <strong>Bu alan korumalı.</strong>
      <p>Vercel'de <code>REWARDS_ADMIN_TOKEN</code> ortam değişkenini belirledikten sonra şu şekilde açabilirsin:</p>
      <p><code>/friday-messages/admin?token=SENIN_ADMIN_SIFREN</code></p>
      <strong>Bu linki ve şifreyi kullanıcılarla paylaşma.</strong>
    </div>
  </main>
</body>
</html>`
  );
}

function renderAdmin(response, token, config) {
  const messages = config.messages.length
    ? config.messages
    : [
        {
          id: "cuma-1",
          category: "Cuma Mesajları",
          message: "Hayırlı Cumalar.",
          background: "#075E47",
          accent: "#D7B35A",
          imageUrl: "",
          aspectRatio: 0.5625
        }
      ];

  html(
    response,
    200,
    `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Huzur Cuma Mesajları</title>
  <style>
    :root {
      --bg: #f6f1e8;
      --surface: #fffaf1;
      --white: #ffffff;
      --text: #231f18;
      --muted: #746958;
      --line: #e2d5bf;
      --accent: #0f766e;
      --accent-dark: #075e47;
      --accent-soft: #dff3ee;
      --gold: #b7791f;
      --danger: #9f1239;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at top left, rgba(183,121,31,.14), transparent 34rem), linear-gradient(180deg, #fffaf1 0%, var(--bg) 100%);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main { width: min(1100px, calc(100% - 32px)); margin: 0 auto; padding: 38px 0 56px; }
    .hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 22px; }
    .eyebrow { margin: 0 0 8px; color: var(--accent); font-size: 13px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(30px, 5vw, 48px); line-height: 1.05; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
    button {
      min-height: 42px;
      border-radius: 8px;
      border: 1px solid var(--line);
      padding: 0 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-dark);
      background: rgba(255,255,255,.78);
      font-size: 14px;
      font-weight: 900;
      cursor: pointer;
    }
    button.primary { border-color: var(--accent); background: var(--accent); color: #fff; box-shadow: 0 12px 30px rgba(15,118,110,.22); }
    button.danger { color: var(--danger); }
    button:disabled { cursor: progress; opacity: .68; }
    .panel { border: 1px solid var(--line); border-radius: 8px; background: rgba(255,250,241,.92); box-shadow: 0 18px 50px rgba(71,53,27,.12); overflow: hidden; }
    .toolbar { padding: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line); }
    .hint { margin: 0; color: var(--muted); line-height: 1.5; font-weight: 700; }
    .list { display: grid; gap: 14px; padding: 18px; }
    .item { display: grid; grid-template-columns: 138px 1fr; gap: 16px; border: 1px solid var(--line); border-radius: 8px; background: rgba(255,255,255,.64); padding: 14px; }
    .preview { width: 100%; aspect-ratio: 9 / 16; border-radius: 8px; background: #efe5d5; object-fit: contain; border: 1px solid var(--line); }
    .fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .field { display: grid; gap: 7px; }
    .field.full { grid-column: 1 / -1; }
    label { color: var(--muted); font-size: 13px; font-weight: 900; }
    input, textarea, select {
      width: 100%;
      min-height: 44px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--white);
      color: var(--text);
      padding: 10px 12px;
      font: inherit;
      font-size: 14px;
      font-weight: 700;
    }
    textarea { min-height: 78px; resize: vertical; }
    .row-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .status { margin-top: 14px; min-height: 22px; color: var(--muted); font-weight: 900; }
    .status.ok { color: var(--accent); }
    .status.error { color: var(--danger); }
    @media (max-width: 760px) {
      .hero, .toolbar { align-items: flex-start; flex-direction: column; }
      .item { grid-template-columns: 1fr; }
      .preview { max-width: 220px; }
      .fields { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <div class="hero">
      <div>
        <p class="eyebrow">HUZUR ADMIN</p>
        <h1>Cuma mesajları</h1>
      </div>
      <div class="actions">
        <button type="button" id="add">Yeni görsel</button>
        <button type="button" class="primary" id="save">Kaydet</button>
      </div>
    </div>
    <section class="panel">
      <div class="toolbar">
        <p class="hint">1080x1920 dikey ve 1080x1080 kare görseller desteklenir. Tek dosya, toplu dosya veya direkt görsel linki ekleyebilirsin.</p>
        <input type="hidden" id="admin-token" value="${escapeHtml(token)}" />
      </div>
      <div class="list" id="list"></div>
    </section>
    <div class="status" id="status"></div>
  </main>
  <script>
    let messages = ${JSON.stringify(messages)};
    const listEl = document.getElementById("list");
    const statusEl = document.getElementById("status");

    function escapeAttr(value) {
      return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    }

    function setStatus(message, type) {
      statusEl.textContent = message;
      statusEl.className = "status " + (type || "");
    }

    function render() {
      listEl.innerHTML = messages.map((message, index) => \`
        <article class="item" data-index="\${index}">
          <img class="preview" src="\${escapeAttr(message.imageUrl)}" alt="Cuma mesajı önizleme" />
          <div class="fields">
            <div class="field">
              <label>Başlık / ID</label>
              <input data-field="id" value="\${escapeAttr(message.id)}" />
            </div>
            <div class="field">
              <label>Kategori</label>
              <select data-field="category">
                \${["Cuma Mesajları", "Kandil Mesajları", "Bayram Mesajları"].map((category) => \`<option \${message.category === category ? "selected" : ""}>\${category}</option>\`).join("")}
              </select>
            </div>
            <div class="field full">
              <label>Mesaj</label>
              <textarea data-field="message">\${escapeAttr(message.message)}</textarea>
            </div>
            <div class="field full">
              <label>Görsel linki</label>
              <input data-field="imageUrl" value="\${escapeAttr(message.imageUrl)}" placeholder="https://..." />
            </div>
            <div class="field">
              <label>Görsel oranı</label>
              <select data-field="aspectRatio">
                <option value="0.5625" \${Number(message.aspectRatio) < 0.7 ? "selected" : ""}>1080x1920 dikey</option>
                <option value="1" \${Number(message.aspectRatio) >= 0.7 ? "selected" : ""}>1080x1080 kare</option>
              </select>
            </div>
            <div class="field">
              <label>Dosya yükle</label>
              <input data-upload="\${index}" type="file" accept="image/png,image/jpeg,image/webp" multiple />
            </div>
            <div class="field full row-actions">
              <button type="button" data-move-up="\${index}">Yukarı</button>
              <button type="button" data-move-down="\${index}">Aşağı</button>
              <button type="button" class="danger" data-remove="\${index}">Sil</button>
            </div>
          </div>
        </article>
      \`).join("");
    }

    function readForm() {
      document.querySelectorAll(".item").forEach((item) => {
        const index = Number(item.dataset.index);
        item.querySelectorAll("[data-field]").forEach((input) => {
          const field = input.dataset.field;
          messages[index][field] = field === "aspectRatio" ? Number(input.value) : input.value;
        });
      });
    }

    function toDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function createMessageFromFile(file, category, index) {
      const prefix = category.includes("Kandil") ? "kandil" : category.includes("Bayram") ? "bayram" : "cuma";
      const name = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const message = category.includes("Kandil") ? "Hayırlı Kandiller." : category.includes("Bayram") ? "Hayırlı Bayramlar." : "Hayırlı Cumalar.";
      return { id: name || prefix + "-" + index, category, message, background: "#075E47", accent: "#D7B35A", imageUrl: "", aspectRatio: 0.5625 };
    }

    async function uploadImage(file, token) {
      const imageData = await toDataUrl(file);
      const response = await fetch("/friday-messages/upload?token=" + encodeURIComponent(token), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, imageData })
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || body.detail || "Yükleme başarısız.");
      return body.url;
    }

    listEl.addEventListener("change", async (event) => {
      const uploadIndex = event.target.dataset.upload;
      if (uploadIndex === undefined || !event.target.files?.[0]) return;
      readForm();
      const token = document.getElementById("admin-token").value;
      const files = Array.from(event.target.files);
      const item = event.target.closest(".item");
      const index = Number(uploadIndex);
      const category = messages[index]?.category || "Cuma Mesajları";
      const preview = item?.querySelector(".preview");
      if (preview) preview.src = URL.createObjectURL(files[0]);
      setStatus(files.length + " görsel seçildi, yükleniyor...", "");
      try {
        for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
          const file = files[fileIndex];
          const targetIndex = fileIndex === 0 ? index : messages.length;
          if (!messages[targetIndex]) {
            messages.push(createMessageFromFile(file, category, messages.length + 1));
          }
          const url = await uploadImage(file, token);
          messages[targetIndex] = { ...messages[targetIndex], ...createMessageFromFile(file, category, targetIndex + 1), imageUrl: url };
          setStatus((fileIndex + 1) + " / " + files.length + " görsel yüklendi...", "");
        }
        render();
        setStatus(files.length + " görsel yüklendi. Kaydet butonuna basınca uygulamada yayınlanır.", "ok");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Görsel yüklenemedi.", "error");
      }
    });

    listEl.addEventListener("input", (event) => {
      if (event.target.dataset.field !== "imageUrl") return;
      const item = event.target.closest(".item");
      const index = Number(item?.dataset.index);
      messages[index].imageUrl = event.target.value;
      const preview = item?.querySelector(".preview");
      if (preview) preview.src = event.target.value;
    });

    listEl.addEventListener("click", (event) => {
      const actionButton = event.target.closest("button[data-remove], button[data-move-up], button[data-move-down]");
      if (!actionButton) return;
      const remove = actionButton.dataset.remove;
      const moveUp = actionButton.dataset.moveUp;
      const moveDown = actionButton.dataset.moveDown;
      readForm();
      if (remove !== undefined) messages.splice(Number(remove), 1);
      if (moveUp !== undefined && Number(moveUp) > 0) {
        const index = Number(moveUp);
        [messages[index - 1], messages[index]] = [messages[index], messages[index - 1]];
      }
      if (moveDown !== undefined && Number(moveDown) < messages.length - 1) {
        const index = Number(moveDown);
        [messages[index + 1], messages[index]] = [messages[index], messages[index + 1]];
      }
      render();
    });

    document.getElementById("add").addEventListener("click", () => {
      readForm();
      messages.push({ id: "cuma-" + (messages.length + 1), category: "Cuma Mesajları", message: "Hayırlı Cumalar.", background: "#075E47", accent: "#D7B35A", imageUrl: "", aspectRatio: 0.5625 });
      render();
    });

    document.getElementById("save").addEventListener("click", async () => {
      const token = document.getElementById("admin-token").value;
      readForm();
      setStatus("Kaydediliyor...", "");
      try {
        const response = await fetch("/friday-messages/config?token=" + encodeURIComponent(token), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages })
        });
        const body = await response.json();
        if (!response.ok || !body.ok) throw new Error(body.error || body.detail || "Kaydedilemedi.");
        messages = body.messages;
        render();
        setStatus("Kaydedildi. Uygulama açıldığında güncel listeyi alır.", "ok");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Kaydedilemedi.", "error");
      }
    });

    render();
  </script>
</body>
</html>`
  );
}

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (!isAdminRequest(request)) {
    renderLocked(response);
    return;
  }

  try {
    const config = await getFridayMessagesConfig();
    renderAdmin(response, request.query?.token || request.headers["x-admin-token"], config);
  } catch (error) {
    html(response, 500, `Admin paneli yüklenemedi: ${escapeHtml(error instanceof Error ? error.message : "Bilinmeyen hata")}`);
  }
};
