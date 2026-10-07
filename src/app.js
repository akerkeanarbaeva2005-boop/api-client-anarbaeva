import {
    fetchPokemons,
    searchPokemons,
    fetchPokemonByName,
    fetchTwoPokemons,
} from './api.js';

const listEl = document.getElementById('country-list');
const searchInput = document.getElementById('search');
const searchForm = document.getElementById('search-form');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const detailEl = document.getElementById('detail');
const compareBtn = document.getElementById('compare-btn');
const compareResultEl = document.getElementById('compare-result');

function showLoading(show) { loadingEl.hidden = !show; }
function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = !message;
}

function renderPokemons(pokemons) {
    listEl.innerHTML = '';

    if (!pokemons.length) {
        listEl.innerHTML = '<p class="empty">Ничего не найдено</p>';
        return;
    }

    for (const p of pokemons) {
        const card = document.createElement('article');
        card.className = 'country-card';
        card.dataset.name = p.name;

        card.innerHTML = `
      <img src="${p.sprite}" alt="Покемон ${p.name}">
      <h3>${p.name}</h3>
      <p>Тип: ${p.types.join(', ')}</p>
      <p>ID: #${p.id}</p>
      <button class="details-btn" data-name="${p.name}">Подробнее</button>
    `;
        listEl.appendChild(card);
    }
}

async function loadAll() {
    showError('');
    showLoading(true);
    try {
        const pokemons = await fetchPokemons(20, 0);
        renderPokemons(pokemons);
    } catch (err) {
        showError('Не удалось загрузить данные. Проверьте интернет.');
        console.error(err);
    } finally {
        showLoading(false);
    }
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) { loadAll(); return; }

    showError('');
    showLoading(true);

    try {
        const pokemons = await searchPokemons(query);
        renderPokemons(pokemons);
    } catch (err) {
        showError('Ошибка поиска. Попробуйте снова.');
        console.error(err);
    } finally {
        showLoading(false);
    }
});

listEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    const card = e.target.closest('.country-card');
    if (!btn && !card) return;

    const name = btn ? btn.dataset.name : card.dataset.name;

    showError('');
    showLoading(true);
    detailEl.hidden = true;

    try {
        const p = await fetchPokemonByName(name);
        renderDetails(p);
    } catch (err) {
        showError('Не удалось загрузить детали.');
        console.error(err);
    } finally {
        showLoading(false);
    }
});

function renderDetails(p) {
    detailEl.hidden = false;
    detailEl.innerHTML = `
    <h2>${p.name} (#${p.id})</h2>
    <img src="${p.sprite}" alt="${p.name}" width="120">
    <p><strong>Типы:</strong> ${p.types.join(', ')}</p>
    <p><strong>Рост:</strong> ${p.height / 10} м</p>
    <p><strong>Вес:</strong> ${p.weight / 10} кг</p>
    <button id="close-detail">Закрыть</button>
  `;
    document.getElementById('close-detail').addEventListener('click', () => {
        detailEl.hidden = true;
    });
    detailEl.scrollIntoView({ behavior: 'smooth' });
}

compareBtn.addEventListener('click', async () => {
    showError('');
    showLoading(true);
    compareResultEl.innerHTML = '';

    try {
        const cards = listEl.querySelectorAll('.country-card');
        if (cards.length < 2) {
            showError('Нужно минимум 2 покемона в списке.');
            return;
        }
        const name1 = cards[0].dataset.name;
        const name2 = cards[1].dataset.name;

        const { p1, p2 } = await fetchTwoPokemons(name1, name2);

        compareResultEl.innerHTML = `
      <h3>⚖️ Сравнение</h3>
      <div class="compare-grid">
        <div>
          <img src="${p1.sprite}" alt="${p1.name}" width="80">
          <h4>${p1.name}</h4>
          <p>Типы: ${p1.types.join(', ')}</p>
          <p>Рост: ${p1.height / 10} м</p>
          <p>Вес: ${p1.weight / 10} кг</p>
        </div>
        <div>
          <img src="${p2.sprite}" alt="${p2.name}" width="80">
          <h4>${p2.name}</h4>
          <p>Типы: ${p2.types.join(', ')}</p>
          <p>Рост: ${p2.height / 10} м</p>
          <p>Вес: ${p2.weight / 10} кг</p>
        </div>
      </div>
    `;
    } catch (err) {
        showError('Ошибка сравнения.');
        console.error(err);
    } finally {
        showLoading(false);
    }
});

loadAll();