const { getRewardConfig, handleCors, isAdminRequest, json } = require("../_lib/rewardsStore");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function html(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.end(`<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Huzur Ödül Yönetimi</title>
  <style>
    :root {
      color-scheme: light;
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
      background:
        radial-gradient(circle at top left, rgba(183, 121, 31, 0.14), transparent 34rem),
        linear-gradient(180deg, #fffaf1 0%, var(--bg) 100%);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(980px, calc(100% - 32px));
      margin: 0 auto;
      padding: 40px 0 56px;
    }
    .hero {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 22px;
    }
    .eyebrow {
      margin: 0 0 10px;
      color: var(--accent);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: clamp(30px, 5vw, 48px);
      line-height: 1.05;
      letter-spacing: 0;
    }
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    a, button {
      min-height: 42px;
      border-radius: 8px;
      border: 1px solid var(--line);
      padding: 0 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-dark);
      background: rgba(255, 255, 255, 0.78);
      font-size: 14px;
      font-weight: 900;
      text-decoration: none;
      cursor: pointer;
    }
    button.primary {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
      box-shadow: 0 12px 30px rgba(15, 118, 110, 0.22);
    }
    button:disabled {
      cursor: progress;
      opacity: 0.68;
    }
    .panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255, 250, 241, 0.9);
      box-shadow: 0 18px 50px rgba(71, 53, 27, 0.12);
      overflow: hidden;
    }
    .notice {
      padding: 24px;
      display: grid;
      gap: 14px;
    }
    .notice h2 {
      margin: 0;
      font-size: 22px;
    }
    .notice p {
      margin: 0;
      max-width: 760px;
      color: var(--muted);
      line-height: 1.65;
    }
    code {
      display: inline-block;
      max-width: 100%;
      padding: 4px 7px;
      border-radius: 6px;
      background: #efe5d5;
      color: #3f3323;
      overflow-wrap: anywhere;
    }
    form {
      display: grid;
      gap: 18px;
      padding: 22px;
    }
    .top-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .field {
      display: grid;
      gap: 8px;
    }
    label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 900;
    }
    input, textarea {
      width: 100%;
      min-height: 46px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--white);
      color: var(--text);
      font: inherit;
      font-size: 15px;
      font-weight: 700;
      padding: 11px 12px;
      outline: none;
    }
    textarea {
      min-height: 82px;
      resize: vertical;
      line-height: 1.5;
    }
    input:focus, textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    }
    .switch-row {
      min-height: 46px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--white);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
    }
    .switch-row span {
      color: var(--text);
      font-weight: 900;
    }
    .switch-row input {
      width: 22px;
      height: 22px;
      min-height: 22px;
      accent-color: var(--accent);
    }
    .prize-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .prize-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.76);
      overflow: hidden;
    }
    .prize-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px;
      background: var(--accent-soft);
      border-bottom: 1px solid rgba(15, 118, 110, 0.14);
    }
    .prize-head h2 {
      margin: 0;
      color: var(--accent-dark);
      font-size: 18px;
    }
    .rank {
      min-width: 34px;
      height: 34px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--gold);
      color: #fff;
      font-weight: 900;
    }
    .prize-body {
      display: grid;
      gap: 12px;
      padding: 14px;
    }
    .preview {
      min-height: 150px;
      border-radius: 8px;
      border: 1px dashed var(--line);
      background: #f8efe0;
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .preview img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
    }
    .preview span {
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
      padding: 12px;
      text-align: center;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border-top: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.64);
      padding: 16px 22px;
    }
    .status {
      min-height: 22px;
      color: var(--muted);
      font-size: 14px;
      font-weight: 800;
    }
    .status.ok { color: var(--accent); }
    .status.error { color: var(--danger); }
    .danger {
      color: var(--danger);
      font-weight: 800;
    }
    @media (max-width: 760px) {
      main { width: min(100% - 20px, 980px); padding-top: 24px; }
      .hero { align-items: flex-start; flex-direction: column; }
      .actions { justify-content: flex-start; }
      .top-grid, .prize-grid { grid-template-columns: 1fr; }
      .footer { align-items: stretch; flex-direction: column; }
      button.primary { width: 100%; }
    }
  </style>
</head>
<body>
  <main>${body}</main>
</body>
</html>`);
}

function renderLockedPage(response) {
  html(
    response,
    401,
    `<section class="hero">
      <div>
        <p class="eyebrow">Huzur Admin</p>
        <h1>Ödül yönetimi</h1>
      </div>
    </section>
    <section class="panel notice">
      <h2>Bu alan korumalı.</h2>
      <p>Ödül adlarını, açıklamalarını, resim linklerini, minimum puanı ve aktif/pasif durumunu buradan değiştirebilirsin.</p>
      <p>Sayfayı admin token ile aç:</p>
      <p><code>/rewards/admin?token=SENIN_ADMIN_SIFREN</code></p>
      <p class="danger">Bu linki ve şifreyi kullanıcılarla paylaşma.</p>
    </section>`
  );
}

function getPrize(config, rank) {
  return config.prizes?.find((item) => Number(item.rank) === rank) || {};
}

function renderAdminPage(response, request, config) {
  const token = escapeHtml(request.query?.token || "");
  const firstPrize = getPrize(config, 1);
  const secondPrize = getPrize(config, 2);
  const claimsUrl = `/rewards/claims?token=${encodeURIComponent(request.query?.token || "")}`;

  html(
    response,
    200,
    `<section class="hero">
      <div>
        <p class="eyebrow">Huzur Admin</p>
        <h1>Ödül yönetimi</h1>
      </div>
      <div class="actions">
        <a href="${escapeHtml(claimsUrl)}">Başvurular</a>
        <a href="/rewards/config" target="_blank" rel="noreferrer">JSON</a>
      </div>
    </section>
    <section class="panel">
      <form id="reward-form">
        <input type="hidden" id="admin-token" value="${token}" />
        <div class="top-grid">
          <div class="field">
            <label for="minimumMonthlyPoints">Minimum aylık puan</label>
            <input id="minimumMonthlyPoints" name="minimumMonthlyPoints" type="number" min="0" step="1" value="${escapeHtml(config.minimumMonthlyPoints)}" />
          </div>
          <div class="field">
            <label>Ödül sistemi</label>
            <div class="switch-row">
              <span>Kullanıcılar ödül kazanabilsin</span>
              <input id="isActive" name="isActive" type="checkbox" ${config.isActive ? "checked" : ""} />
            </div>
          </div>
        </div>

        <div class="prize-grid">
          ${renderPrizeEditor(1, firstPrize)}
          ${renderPrizeEditor(2, secondPrize)}
        </div>
      </form>
      <div class="footer">
        <div id="status" class="status">Değişiklik yaptığında kaydetmen yeterli. Uygulama ayarları uzaktan alır.</div>
        <button class="primary" form="reward-form" type="submit">Ödülleri Kaydet</button>
      </div>
    </section>
    <script>
      const form = document.getElementById("reward-form");
      const statusEl = document.getElementById("status");
      const saveButton = document.querySelector("button.primary");

      function setStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = "status" + (type ? " " + type : "");
      }

      function updatePreview(rank) {
        const input = document.getElementById("prize-" + rank + "-imageUrl");
        const preview = document.getElementById("preview-" + rank);
        const url = input.value.trim();
        preview.innerHTML = url ? '<img src="' + url.replace(/"/g, "&quot;") + '" alt="Ödül görseli" />' : '<span>Resim linki girildiğinde burada önizlenir.</span>';
      }

      [1, 2].forEach((rank) => {
        const input = document.getElementById("prize-" + rank + "-imageUrl");
        input.addEventListener("input", () => updatePreview(rank));
        updatePreview(rank);
      });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        saveButton.disabled = true;
        setStatus("Kaydediliyor...", "");

        const token = document.getElementById("admin-token").value;
        const payload = {
          isActive: document.getElementById("isActive").checked,
          minimumMonthlyPoints: Number(document.getElementById("minimumMonthlyPoints").value || 0),
          prizes: [1, 2].map((rank) => ({
            title: document.getElementById("prize-" + rank + "-title").value,
            description: document.getElementById("prize-" + rank + "-description").value,
            imageUrl: document.getElementById("prize-" + rank + "-imageUrl").value
          }))
        };

        try {
          const response = await fetch("/rewards/config?token=" + encodeURIComponent(token), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json();

          if (!response.ok || !result.ok) {
            throw new Error(result.error || "Ayarlar kaydedilemedi.");
          }

          setStatus("Kaydedildi. Uygulamadaki ödül kartı kısa süre içinde güncel bilgiyi alır.", "ok");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Ayarlar kaydedilemedi.", "error");
        } finally {
          saveButton.disabled = false;
        }
      });
    </script>`
  );
}

function renderPrizeEditor(rank, prize) {
  return `<section class="prize-card">
    <div class="prize-head">
      <h2>${rank}. Ödül</h2>
      <span class="rank">${rank}</span>
    </div>
    <div class="prize-body">
      <div id="preview-${rank}" class="preview"></div>
      <div class="field">
        <label for="prize-${rank}-title">Ödül adı</label>
        <input id="prize-${rank}-title" value="${escapeHtml(prize.title)}" placeholder="${rank === 1 ? "Kur'an-ı Kerim" : "Seccade"}" />
      </div>
      <div class="field">
        <label for="prize-${rank}-description">Açıklama</label>
        <textarea id="prize-${rank}-description" placeholder="Kullanıcıya gösterilecek kısa açıklama">${escapeHtml(prize.description)}</textarea>
      </div>
      <div class="field">
        <label for="prize-${rank}-imageUrl">Resim linki</label>
        <input id="prize-${rank}-imageUrl" value="${escapeHtml(prize.imageUrl)}" placeholder="https://..." />
      </div>
    </div>
  </section>`;
}

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (request.method !== "GET") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  if (!isAdminRequest(request)) {
    renderLockedPage(response);
    return;
  }

  try {
    const config = await getRewardConfig();
    renderAdminPage(response, request, config);
  } catch (error) {
    json(response, 500, { ok: false, error: "Reward admin could not be loaded.", detail: error instanceof Error ? error.message : "Unknown error" });
  }
};
