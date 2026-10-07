const BASE_URL = 'https://pokeapi.co/api/v2';

export async function fetchPokemons(limit = 20, offset = 0) {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const data = await response.json();
    const detailed = await Promise.all(
        data.results.map((p) => fetchPokemonByName(p.name))
    );
    return detailed;
}
export async function searchPokemons(query) {
    const url = `${BASE_URL}/pokemon/${encodeURIComponent(query.toLowerCase())}`;

    const response = await fetch(url);

    if (response.status === 404) {
        return [];
    }
    if (!response.ok) {
        throw new Error(`Ошибка поиска: ${response.status}`);
    }

    const data = await response.json();
    return [data];
}
export async function fetchPokemonByName(name) {
    const url = `${BASE_URL}/pokemon/${name}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка деталей: ${response.status}`);
    }

    const data = await response.json();
    return {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        types: data.types.map((t) => t.type.name),
        height: data.height,
        weight: data.weight,
    };
}
export async function fetchTwoPokemons(name1, name2) {
    const [p1, p2] = await Promise.all([
        fetchPokemonByName(name1),
        fetchPokemonByName(name2),
    ]);
    return { p1, p2 };
}