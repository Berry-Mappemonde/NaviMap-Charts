const STORAGE_KEY = "navimap-disclaimer-session";

export function mustAcceptDisclaimer() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== "accepted";
  } catch {
    return true;
  }
}

export function rememberAcceptance() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "accepted");
  } catch {
    /* navigation privée : la modale reviendra au prochain chargement */
  }
}

/**
 * Bloque la carte tant que la case n'est pas cochée.
 * L'acceptation ne dure que la session du navigateur.
 */
export function bindDisclaimer({ dialog, checkbox, button, onAccept }) {
  const gate = () => {
    button.disabled = !checkbox.checked;
  };
  checkbox.addEventListener("change", gate);
  gate();

  if (mustAcceptDisclaimer()) {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  } else {
    onAccept();
  }

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
  });

  dialog.querySelector("form").addEventListener("submit", (event) => {
    if (!checkbox.checked) {
      event.preventDefault();
      return;
    }
    rememberAcceptance();
    onAccept();
  });
}
