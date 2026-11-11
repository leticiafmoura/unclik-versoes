(() => {
  const dialog = document.querySelector('#whatsapp-lead-dialog');
  const localPreview = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
  if (!dialog) return;

  const form = dialog.querySelector('form');
  const name = form.elements.namedItem('name');
  const phone = form.elements.namedItem('phone');
  const email = form.elements.namedItem('email');
  const submit = form.querySelector('[type="submit"]');
  const close = dialog.querySelector('.whatsapp-lead-close');
  const status = dialog.querySelector('.whatsapp-lead-status');
  let trigger;
  let leadId;

  if (!localPreview) {
    dialog.querySelector('#whatsapp-lead-description').textContent =
      'Demonstração para aprovação. Use dados fictícios. Ao continuar, o WhatsApp será aberto e os dados do formulário serão descartados.';
    [name, phone, email].forEach(field => { field.autocomplete = 'off'; });
  }

  function openWhatsApp() {
    form.reset();
    dialog.close();
    window.location.assign(trigger.href);
  }

  document.querySelectorAll('[data-whatsapp-lead]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      if (localPreview) leadId = crypto.randomUUID();
      status.textContent = '';
      dialog.showModal();
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => {
    if (submit.disabled) event.preventDefault();
  });
  dialog.addEventListener('close', () => trigger?.focus());
  name.addEventListener('input', () => name.setCustomValidity(''));
  phone.addEventListener('input', () => phone.setCustomValidity(''));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;

    const fullName = name.value.trim();
    const rawPhone = phone.value.trim();
    const digits = rawPhone.replace(/\D/g, '');
    name.setCustomValidity(fullName ? '' : 'Informe seu nome.');
    phone.setCustomValidity(
      /^\+?[\d\s()-]+$/.test(rawPhone) && /^\d{10,15}$/.test(digits)
        ? ''
        : 'Informe um telefone válido com DDD.'
    );
    if (!form.reportValidity()) return;
    if (!localPreview) {
      openWhatsApp();
      return;
    }

    close.disabled = submit.disabled = true;
    status.textContent = '';
    submit.textContent = 'Salvando contato…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          name: fullName,
          phone: rawPhone.startsWith('+') ? '+' + digits : digits,
          email: email.value.trim(),
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error('Falha ao salvar');
      const result = await response.json();
      if (result.saved !== true) throw new Error('Registro sem confirmação');
    } catch {
      status.textContent = 'Não foi possível salvar seu contato. Tente novamente.';
      return;
    } finally {
      close.disabled = submit.disabled = false;
      submit.textContent = 'Continuar no WhatsApp';
    }

    openWhatsApp();
  });
})();
