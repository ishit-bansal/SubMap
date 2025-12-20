const backdrop = document.getElementById("modal-backdrop");
const panel = document.getElementById("modal-panel");
const modalInner = panel ? panel.querySelector("div") : null;

function showModal() {
  if (!backdrop || !panel) return;
  backdrop.classList.remove("hidden");
  panel.classList.remove("hidden");

  requestAnimationFrame(function() {
    backdrop.classList.remove("opacity-0");
    if (modalInner) {
      modalInner.classList.remove("translate-y-full", "sm:scale-95", "opacity-0");
      modalInner.classList.add("translate-y-0", "sm:translate-y-0", "sm:scale-100", "opacity-100");
    }
  });
}

function hideModal() {
  if (!backdrop || !panel) return;
  backdrop.classList.add("opacity-0");

  if (modalInner) {
    modalInner.classList.remove("translate-y-0", "sm:translate-y-0", "sm:scale-100", "opacity-100");
    modalInner.classList.add("translate-y-full", "sm:scale-95", "opacity-0");
  }

  setTimeout(function() {
    backdrop.classList.add("hidden");
    panel.classList.add("hidden");
  }, 300);
}

function openModal() {
  const form = document.getElementById("sub-form");
  if (form) form.reset();
  document.getElementById("entry-id").value = "";
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("cycle").value = "Monthly";
  document.getElementById("url").value = "";
  updateFavicon("");
  pickColor(randColor().id);

  document.getElementById("modal-title").innerText = "Add Subscription";
  document.querySelector("#sub-form button[type='submit']").innerText = "Save";

  showModal();
}

function closeModal() {
  hideModal();
}

function openModalWithPreset(presetIdx) {
  const preset = presets[presetIdx];
  if (!preset) return;

  const form = document.getElementById("sub-form");
  if (form) form.reset();

  document.getElementById("entry-id").value = "";
  document.getElementById("name").value = preset.name;
  document.getElementById("price").value = preset.price;
  document.getElementById("cycle").value = preset.cycle;
  document.getElementById("url").value = preset.domain;

  updateFavicon(preset.domain);
  pickColor(preset.color);

  document.getElementById("modal-title").innerText = "Add Subscription";
  document.querySelector("#sub-form button[type='submit']").innerText = "Save";

  showModal();
}

document.addEventListener("DOMContentLoaded", function() {
  if (backdrop) backdrop.addEventListener("click", closeModal);
  if (panel) {
    panel.addEventListener("click", closeModal);
    if (modalInner) modalInner.addEventListener("click", function(e) { e.stopPropagation(); });
  }
});
