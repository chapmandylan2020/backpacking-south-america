(() => {
  const checklist = document.querySelector('[data-packing-checklist]');
  if (!checklist) return;

  const progress = checklist.querySelector('[data-packing-progress]');
  const total = checklist.querySelector('[data-packing-total]');
  const saveNote = checklist.querySelector('[data-packing-save-note]');
  const prefix = 'south-america-packing:';
  const items = new Map(
    Array.from(checklist.querySelectorAll('input[type="checkbox"]'), item => [item.name, item])
  );
  const sections = Array.from(checklist.querySelectorAll('[data-packing-section]'), section => {
    const key = section.dataset.packingSection;
    const heading = section.querySelector('h3');
    checklist.querySelector(`[data-packing-jump="${key}"]`).addEventListener('click', () => {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: 'instant' });
    });

    return {
      items: Array.from(section.querySelectorAll('input[type="checkbox"]')),
      count: checklist.querySelector(`[data-packing-count="${key}"]`)
    };
  });

  function updateProgress() {
    let packed = 0;
    for (const section of sections) {
      const count = section.items.filter(item => item.checked).length;
      section.count.textContent = `${count}/${section.items.length}`;
      packed += count;
    }
    progress.value = packed;
    total.textContent = `${packed} of ${items.size} packed`;
  }

  let storage;
  function useSessionOnly() {
    storage = undefined;
    saveNote.textContent = 'Checks are available for this visit.';
  }

  try {
    storage = window.localStorage;
    for (const [name, item] of items) {
      item.checked = storage.getItem(prefix + name) === '1';
    }
    saveNote.textContent = 'Checks are saved in this browser.';
  } catch {
    useSessionOnly();
  }

  checklist.addEventListener('change', ({ target }) => {
    if (items.get(target.name) !== target) return;

    if (storage) {
      try {
        const key = prefix + target.name;
        if (target.checked) {
          storage.setItem(key, '1');
        } else {
          storage.removeItem(key);
        }
      } catch {
        useSessionOnly();
      }
    }
    updateProgress();
  });

  window.addEventListener('storage', event => {
    if (!storage || event.storageArea !== storage) return;

    if (event.key === null) {
      for (const item of items.values()) item.checked = false;
    } else {
      if (!event.key.startsWith(prefix)) return;
      const item = items.get(event.key.slice(prefix.length));
      if (!item) return;
      item.checked = event.newValue === '1';
    }
    updateProgress();
  });

  progress.max = items.size;
  updateProgress();
})();
