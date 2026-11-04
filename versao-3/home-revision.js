// Alterna entre reproduções vetoriais das capturas fornecidas pela Unclik.
const hubTabs = [...document.querySelectorAll('[data-hub-screen]')];
const hubPanel = document.querySelector('#hub-real-panel');
const hubImage = document.querySelector('#hub-real-image');
const hubScreens = {
  finance: { src: 'assets/v3/hub-financeiro-vetorial.svg', alt: 'Reprodução vetorial da visão financeira do HUB Unclik, com gráficos, contas bancárias e calendário' },
  opening: { src: 'assets/v3/hub-abertura-vetorial.svg', alt: 'Reprodução vetorial do acompanhamento de abertura de empresa no HUB Unclik' }
};
function selectHubTab(tab, focus = false) {
  if (!tab || !hubImage || !hubPanel) return;
  hubTabs.forEach(button => {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  const screen = hubScreens[tab.dataset.hubScreen];
  hubImage.src = screen.src;
  hubImage.alt = screen.alt;
  hubPanel.classList.toggle('is-opening', tab.dataset.hubScreen === 'opening');
  hubPanel.setAttribute('aria-labelledby', tab.id);
  if (focus) tab.focus();
}
hubTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectHubTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % hubTabs.length;
    if (event.key === 'ArrowLeft') next = (index + hubTabs.length - 1) % hubTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = hubTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectHubTab(hubTabs[next], true);
  });
});
