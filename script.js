/* Cantinho do Desenho: scripts do site */

/*
  Configuração dos links sociais.
  - discordInvite: link do Discord
  - tiktokUrl: URL do perfil do TikTok
  Quando vazio, os botões apenas copiam o nome de usuário
  e o link continua apontando para a seção de contato.
*/
const SOCIAL = {
  discordInvite: "",
  tiktokUrl: ""
};

(() => {
  "use strict";

  const PRICE = { full: 55, half: 45, icon: 25 };
  const MAX_ITEMS = 9;
  const qty = { full: 0, half: 0, icon: 0 };
  const statusEl = document.getElementById("copy-status");

  function formatGreeting() {
    try {
      const now = new Date();
      const hour = now.getHours();
      const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
      const dateText = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(now);

      const ticker = document.getElementById("ticker");
      if (ticker) {
        ticker.innerHTML = `<b>${greeting}!</b> Hoje é ${dateText}.`;
      }
    } catch (error) {
      // Mantém o texto padrão do HTML caso algo falhe.
    }
  }

  function isWebUrl(value) {
    return /^https?:\/\//i.test(value || "");
  }

  function updateSocialLinks() {
    const urls = { discord: SOCIAL.discordInvite, tiktok: SOCIAL.tiktokUrl };

    Object.entries(urls).forEach(([name, url]) => {
      if (!isWebUrl(url)) {
        return;
      }

      document.querySelectorAll(`[data-social="${name}"]`).forEach((anchor) => {
        anchor.setAttribute("href", url);
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
      });

      document.querySelectorAll(`[data-link-for="${name}"]`).forEach((anchor) => {
        anchor.setAttribute("href", url);
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
        anchor.hidden = false;
      });
    });
  }

  function setCopyStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  function fallbackCopy(text, onDone) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();

    let success = false;
    try {
      success = document.execCommand("copy");
    } catch (error) {
      success = false;
    }

    document.body.removeChild(textarea);
    onDone(success);
  }

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => onDone(true),
        () => fallbackCopy(text, onDone)
      );
      return;
    }

    fallbackCopy(text, onDone);
  }

  function bindCopyButtons() {
    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", () => {
        const text = button.getAttribute("data-copy");

        copyText(text, (success) => {
          setCopyStatus(
            success
              ? `Copiado: ${text}`
              : `Não consegui copiar. Selecione e copie manualmente: ${text}`
          );
        });
      });
    });
  }

  function formatCurrency(value) {
    try {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } catch (error) {
      return `R$ ${value}`;
    }
  }

  function renderCalculator() {
    let total = 0;

    Object.keys(PRICE).forEach((key) => {
      const subtotal = PRICE[key] * qty[key];
      total += subtotal;

      const quantityEl = document.getElementById(`q-${key}`);
      const subtotalEl = document.getElementById(`s-${key}`);
      const minusButton = document.querySelector(`[data-k="${key}"][data-d="-1"]`);
      const plusButton = document.querySelector(`[data-k="${key}"][data-d="1"]`);

      if (quantityEl) quantityEl.textContent = qty[key];
      if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
      if (minusButton) minusButton.disabled = qty[key] <= 0;
      if (plusButton) plusButton.disabled = qty[key] >= MAX_ITEMS;
    });

    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.textContent = formatCurrency(total);
  }

  function bindCalculator() {
    document.querySelectorAll(".step button").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.getAttribute("data-k");
        const step = Number(button.getAttribute("data-d"));
        const nextValue = qty[key] + step;

        qty[key] = Math.max(0, Math.min(MAX_ITEMS, nextValue));
        renderCalculator();
      });
    });
  }

  formatGreeting();
  updateSocialLinks();
  bindCopyButtons();
  bindCalculator();
  renderCalculator();
})();
