const { getRewardClaims, handleCors, isAdminRequest, json } = require("../_lib/rewardsStore");

function wantsHtml(request) {
  return String(request.headers.accept || "").includes("text/html");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Istanbul"
    }).format(new Date(value));
  } catch {
    return value;
  }
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
  <title>Huzur Ödül Başvuruları</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f1e8;
      --surface: #fffaf1;
      --surface-strong: #ffffff;
      --text: #231f18;
      --muted: #776d5e;
      --line: #e4d8c4;
      --accent: #0f766e;
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
      width: min(1120px, calc(100% - 32px));
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
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: clamp(30px, 5vw, 48px);
      line-height: 1.05;
      letter-spacing: 0;
    }
    .period {
      padding: 10px 14px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.7);
      color: var(--muted);
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
    }
    .panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255, 250, 241, 0.84);
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
    .table-wrap { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 900px;
    }
    th, td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      font-size: 14px;
    }
    th {
      background: rgba(223, 243, 238, 0.68);
      color: #35554f;
      font-size: 12px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    tr:last-child td { border-bottom: 0; }
    .rank {
      display: inline-flex;
      min-width: 34px;
      min-height: 34px;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      font-weight: 900;
    }
    .code {
      color: var(--gold);
      font-weight: 900;
    }
    .address {
      max-width: 300px;
      white-space: pre-wrap;
    }
    .empty {
      padding: 30px 24px;
      color: var(--muted);
      line-height: 1.6;
    }
    .danger {
      color: var(--danger);
      font-weight: 800;
    }
    @media (max-width: 700px) {
      main { width: min(100% - 20px, 1120px); padding-top: 24px; }
      .hero { align-items: flex-start; flex-direction: column; }
      .period { white-space: normal; }
    }
  </style>
</head>
<body>
  <main>
    ${body}
  </main>
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
        <h1>Ödül başvuruları</h1>
      </div>
    </section>
    <section class="panel notice">
      <h2>Bu alan korumalı.</h2>
      <p>Ödülünü Al formuna yazılan ad soyad, telefon/e-posta ve teslimat adresi burada görünür. Güvenlik için sayfayı admin token ile açman gerekiyor.</p>
      <p>Vercel'de <code>REWARDS_ADMIN_TOKEN</code> ortam değişkenini belirledikten sonra şu şekilde açabilirsin:</p>
      <p><code>/rewards/claims?token=SENIN_ADMIN_SIFREN</code></p>
      <p class="danger">Bu linki ve şifreyi kullanıcılarla paylaşma.</p>
    </section>`
  );
}

function renderClaimsPage(response, result) {
  const rows = result.claims
    .map(
      (claim) => `<tr>
        <td><span class="rank">${escapeHtml(claim.rank)}</span></td>
        <td><span class="code">${escapeHtml(claim.userCode)}</span></td>
        <td>${escapeHtml(claim.prizeTitle)}</td>
        <td>${escapeHtml(claim.points)}</td>
        <td>${escapeHtml(claim.fullName)}</td>
        <td>${escapeHtml(claim.contact)}</td>
        <td class="address">${escapeHtml(claim.address)}</td>
        <td>${escapeHtml(formatDate(claim.submittedAt))}</td>
      </tr>`
    )
    .join("");

  html(
    response,
    200,
    `<section class="hero">
      <div>
        <p class="eyebrow">Huzur Admin</p>
        <h1>Ödül başvuruları</h1>
      </div>
      <div class="period">Dönem: ${escapeHtml(result.monthKey)}</div>
    </section>
    <section class="panel">
      ${
        rows
          ? `<div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sıra</th>
                    <th>Kod</th>
                    <th>Ödül</th>
                    <th>Puan</th>
                    <th>Ad Soyad</th>
                    <th>Telefon / E-posta</th>
                    <th>Teslimat Adresi</th>
                    <th>Başvuru Tarihi</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`
          : `<div class="empty">Henüz bu ay için ödül başvurusu yok. Kullanıcı uygulamada <strong>Ödülünü Al</strong> formunu gönderdiğinde bilgileri burada görünecek.</div>`
      }
    </section>`
  );
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
    if (wantsHtml(request)) {
      renderLockedPage(response);
      return;
    }

    json(response, 401, { ok: false, error: "Admin token is required." });
    return;
  }

  try {
    const result = await getRewardClaims();
    if (wantsHtml(request)) {
      renderClaimsPage(response, result);
      return;
    }

    json(response, 200, result);
  } catch (error) {
    json(response, 500, { ok: false, error: "Reward claims could not be loaded.", detail: error instanceof Error ? error.message : "Unknown error" });
  }
};
