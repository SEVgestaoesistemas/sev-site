/* --------------------------------------------------------------------------
   Interações leves: menu mobile, links ativos, revelação no scroll e formulário
   -------------------------------------------------------------------------- */
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];

// Mantém o cabeçalho legível após o início da rolagem.
function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 8);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Abre e fecha a navegação mobile, atualizando os atributos ARIA.
menuToggle.addEventListener('click', () => {
  const isOpen = header.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  }
});

// Atualiza o item de navegação de acordo com a seção visível.
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-34% 0px -58% 0px', threshold: 0 });
sections.forEach((section) => activeObserver.observe(section));

// Revela cada bloco uma única vez, com fallback para navegadores sem observer.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

// Formulário pronto para integração: valida localmente e informa o ponto de envio.
const form = document.querySelector('#contact-form');
const statusMessage = document.querySelector('#form-status');
const fields = [
  { input: document.querySelector('#nome'), error: document.querySelector('#nome-erro'), message: 'Informe seu nome.' },
  { input: document.querySelector('#email'), error: document.querySelector('#email-erro'), message: 'Informe um e-mail válido.' },
  { input: document.querySelector('#mensagem'), error: document.querySelector('#mensagem-erro'), message: 'Conte brevemente como podemos ajudar.' },
];

function validateField(field) {
  const isValid = field.input.checkValidity() && field.input.value.trim() !== '';
  field.input.closest('.form-field').classList.toggle('is-invalid', !isValid);
  field.error.textContent = isValid ? '' : field.message;
  return isValid;
}

fields.forEach((field) => field.input.addEventListener('input', () => validateField(field)));

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formIsValid = fields.map(validateField).every(Boolean);

  if (!formIsValid) {
    statusMessage.className = 'form-status is-error';
    statusMessage.textContent = 'Revise os campos indicados para continuar.';
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const buttonText = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.textContent = 'Enviando mensagem...';
  statusMessage.className = 'form-status';
  statusMessage.textContent = 'Enviando sua mensagem...';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha no envio');
    }

    form.reset();
    statusMessage.className = 'form-status is-success';
    statusMessage.textContent =
      'Mensagem enviada com sucesso. Nossa equipe entrará em contato em breve.';
  } catch (error) {
    statusMessage.className = 'form-status is-error';
    statusMessage.textContent =
      'Não foi possível enviar a mensagem. Tente novamente em alguns instantes.';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = buttonText;
  }
});
  

document.querySelector('#current-year').textContent = new Date().getFullYear();
