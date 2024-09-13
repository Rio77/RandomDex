// Elementos del DOM
const pokedexButton = document.getElementById('pokedexButton');
const listButton = document.getElementById('listButton');
const listContainer = document.getElementById('listContainer');
const listItems = document.getElementById('listItems');
const searchButton = document.getElementById('searchButton');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const content = document.getElementById('content');
const fullScreenBackground = document.getElementById('fullScreenBackground');

// Lista de elementos para la construcción del Pokémon
const listElements = [
    'Cabeza', 'Orejas', 'Boca', 'Color', 'Detalles', 'Ojos', 'Cola',
    'Cuerpo ↑', 'Cuerpo ↓', 'Patas Traseras', 'Patas Delanteras'
];

// Array para almacenar los Pokémon seleccionados
let selectedPokemons = new Array(11).fill(null);

// Caché de imágenes para optimizar la carga
const imageCache = new Map();

// Función para verificar si un ID de Pokémon es válido
function isValidPokemonId(id) {
    id = Number(id);
    return (id >= 1 && id <= 1025) ||
        (id >= 10001 && id <= 10064) ||
        (id >= 10066 && id <= 10248) || 
        (id >= 10255 && id <= 10270) ||
        (id >= 10309 && id <= 10345) ||
        (id >= 10432 && id <= 10441) ||
        (id >= 10354 && id <= 10447);
}

// Función para obtener el número de Pokédex Nacional
function getNationalDexNumber(id) {
    id = Number(id);
}

// Event listeners para los botones principales
pokedexButton.addEventListener('click', () => {
    getRandomPokemon();
    content.style.display = 'block';
});

listButton.addEventListener('click', toggleList);
searchButton.addEventListener('click', toggleSearch);
searchInput.addEventListener('input', searchPokemon);

// Función para mostrar/ocultar la lista
function toggleList(event) {
    event.stopPropagation();
    const isListVisible = listContainer.style.display === 'block';
    listContainer.style.display = isListVisible ? 'none' : 'block';
    fullScreenBackground.style.display = isListVisible ? 'none' : 'block';
    searchContainer.style.display = 'none';
}

// Función para mostrar/ocultar la búsqueda
function toggleSearch(event) {
    event.stopPropagation();
    const isSearchVisible = searchContainer.style.display === 'block';
    searchContainer.style.display = isSearchVisible ? 'none' : 'block';
    fullScreenBackground.style.display = isSearchVisible ? 'none' : 'block';
    searchInput.focus();
    listContainer.style.display = 'none';
}

// Cerrar lista y búsqueda al hacer clic fuera
document.addEventListener('click', (event) => {
    if (!listContainer.contains(event.target) && event.target !== listButton) {
        listContainer.style.display = 'none';
        fullScreenBackground.style.display = 'none';
    }
    if (!searchContainer.contains(event.target) && event.target !== searchButton) {
        searchContainer.style.display = 'none';
        fullScreenBackground.style.display = 'none';
    }
});

// Inicializar la lista de elementos
function initializeList() {
    listItems.innerHTML = '';
    listElements.forEach((element, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.innerHTML = `
            <span>${element}</span>
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" loading="lazy">
        `;
        listItem.addEventListener('click', () => {
            if (selectedPokemons[index]) {
                selectPokemon(selectedPokemons[index].id);
                listContainer.style.display = 'none';
                fullScreenBackground.style.display = 'none';
            }
        });
        listItems.appendChild(listItem);
    });
}

// Actualizar la lista con un nuevo Pokémon
function updateList(pokemon) {
    const emptySlot = selectedPokemons.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
        selectedPokemons[emptySlot] = pokemon;
        const listItem = listItems.children[emptySlot];
        const img = listItem.querySelector('img');

        // Obtener la imagen principal del Pokémon
        let imageUrl = pokemon.sprites?.front_default;  // Imagen principal

        // Si la imagen es null, usar la imagen principal ya cargada en la vista principal
        if (!imageUrl) {
            imageUrl = pokemon.sprites?.other?.['official-artwork']?.front_default;
        }

        // Si aún no hay imagen, usar una imagen predeterminada (opcional)
        if (!imageUrl) {
            imageUrl = 'path/to/placeholder/image.png'; // Puedes cambiar esto a la imagen que desees
        }

        // Establecer la imagen
        setImageWithCache(img, imageUrl, pokemon.name);
    }
}


// Función de búsqueda de Pokémon
async function searchPokemon() {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-form?limit=10447`);
        const data = await response.json();
        const results = data.results.filter(pokemon => {
            const id = Number(pokemon.url.split('/').slice(-2, -1)[0]);
            return pokemon.name.includes(query) &&
                !pokemon.name.includes('totem') &&
                !pokemon.name.includes('starter') &&
                !pokemon.name.includes('gulping') &&
                !pokemon.name.includes('gorging') &&
                !pokemon.name.includes('limited') &&
                !pokemon.name.includes('sprinting') &&
                !pokemon.name.includes('swimming') &&
                !pokemon.name.includes('construct') &&
                !pokemon.name.includes('low') &&
                !pokemon.name.includes('drive') &&
                !pokemon.name.includes('aquatic') &&
                !pokemon.name.includes('glide') &&
                isValidPokemonId(id);
        });

        searchResults.innerHTML = '';
        for (const pokemon of results.slice(0, 20)) {  // Limit to 20 results for performance
            addSearchResult(pokemon.name, pokemon.url.split('/').slice(-2, -1)[0]);
        }

        searchResults.style.display = 'block';
    } catch (error) {
        console.error('Error searching Pokémon:', error);
    }
}

// Añadir resultado de búsqueda a la lista
function addSearchResult(name, id) {
    const resultElement = document.createElement('div');
    resultElement.className = 'search-result';
    resultElement.textContent = capitalizeFirstLetter(name);
    resultElement.addEventListener('click', () => {
        selectPokemon(id);
        searchContainer.style.display = 'none';
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        fullScreenBackground.style.display = 'none';
    });
    searchResults.appendChild(resultElement);
}

// Obtener un Pokémon aleatorio
async function getRandomPokemon() {
    let randomId;
    do {
        if (Math.random() < 0.5) {
            randomId = Math.floor(Math.random() * 1025) + 1;
        } else {
            randomId = Math.floor(Math.random() * 447) + 10001;
            if (randomId === 10065 || (randomId >= 10271 && randomId <= 10308)) {
                randomId = 10309;
            }
        }
    } while (!isValidPokemonId(randomId));
    selectPokemon(randomId);
}

// Seleccionar y mostrar un Pokémon específico
async function selectPokemon(id) {
    if (!isValidPokemonId(id)) {
        console.error('ID de Pokémon no válido');
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-form/${id}`);
        const formData = await response.json();

        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${formData.pokemon.name}`);
        const pokemonData = await pokemonResponse.json();

        const mergedData = {
            ...pokemonData,
            sprites: {
                ...pokemonData.sprites,
                ...formData.sprites
            },
            types: formData.types,
            form_name: formData.form_name,
            id: formData.id,
            nationalDexNumber: getNationalDexNumber(id)
        };

        if (!mergedData || !mergedData.name) {
            throw new Error('No se encontró el Pokémon o la API no devolvió datos válidos.');
        }

        await displayPokemonInfo(mergedData);
        updateList(mergedData);
        fetchEvolutionChain(pokemonData.species.url);
    } catch (error) {
        console.error('Error al obtener datos del Pokémon:', error);
    }
}

// Mostrar la información del Pokémon
async function displayPokemonInfo(pokemon) {
    const pokemonName = document.getElementById('pokemonName');
    const mainImage = document.getElementById('mainImage');
    const pokemonNumber = document.getElementById('pokemonNumber');
    const pokemonTypes = document.getElementById('pokemonTypes');
    const pokemonAbilities = document.getElementById('pokemonAbilities');
    const pokemonStats = document.getElementById('pokemonStats');

    // Obtener el nombre en español
    const speciesResponse = await fetch(pokemon.species.url);
    const speciesData = await speciesResponse.json();
    const spanishName = speciesData.names.find(name => name.language.name === 'es')?.name || pokemon.name;

    pokemonName.textContent = capitalizeFirstLetter(spanishName) + (pokemon.form_name ? ` (${pokemon.form_name})` : '');

    // Priorizar la carga de la imagen principal
    const mainImageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    setProgressiveImage(mainImage, mainImageUrl, spanishName);

    // Lógica para el número de Pokédex Nacional
    let nationalDexNumber = pokemon.id;
    if (nationalDexNumber > 1025) {
        const baseName = pokemon.name.split('-')[0];
        try {
            const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
            const evolutionChainData = await evolutionChainResponse.json();
            
            const allForms = await getAllFormsFromEvolutionChain(evolutionChainData.chain);
            const relatedForms = allForms.filter(form => form.name.startsWith(baseName));
            
            if (relatedForms.length > 0) {
                const lowestIdForm = relatedForms.reduce((lowest, current) => 
                    current.id < lowest.id ? current : lowest
                );
                nationalDexNumber = lowestIdForm.id;
            }
        } catch (error) {
            console.error('Error al obtener el número de Pokédex Nacional:', error);
        }
    }
    pokemonNumber.textContent = nationalDexNumber;

    pokemonTypes.textContent = pokemon.types.map(typeInfo => tipoTraducciones[typeInfo.type.name] || capitalizeFirstLetter(typeInfo.type.name)).join(', ');

    // Obtener los nombres de las habilidades en español
    const abilities = await Promise.all(pokemon.abilities.map(async (ability) => {
        const abilityResponse = await fetch(ability.ability.url);
        const abilityData = await abilityResponse.json();
        const spanishAbilityName = abilityData.names.find(name => name.language.name === 'es')?.name || ability.ability.name;
        return capitalizeFirstLetter(spanishAbilityName);
    }));
    pokemonAbilities.textContent = abilities.join(', ');

    pokemonStats.innerHTML = `
        <tr>
            <td>PS</td>
            <td>${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</td>
            <td>Velocidad</td>
            <td>${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}</td>
        </tr>
        <tr>
            <td>Ataque</td>
            <td>${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</td>
            <td>Ataque Especial</td>
            <td>${pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat}</td>
        </tr>
        <tr>
            <td>Defensa</td>
            <td>${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}</td>
            <td>Defensa Especial</td>
            <td>${pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat}</td>
        </tr>
    `;
}

async function getAllFormsFromEvolutionChain(chain) {
    const forms = [];

    async function traverseChain(node) {
        if (node.species) {
            const speciesResponse = await fetch(node.species.url);
            const speciesData = await speciesResponse.json();
            
            const formResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-form?limit=10447`);
            const formData = await formResponse.json();
            const speciesForms = formData.results.filter(form => 
                form.name.startsWith(node.species.name) &&
                !form.name.includes('totem') &&
                !form.name.includes('limited') &&
                !form.name.includes('sprinting') &&
                !form.name.includes('swimming') &&
                !form.name.includes('gliding') &&
                !form.name.includes('low') &&
                !form.name.includes('drive') &&
                !form.name.includes('aquatic') &&
                !form.name.includes('glide') &&
                !form.name.includes('construct') &&
                !form.name.includes('starter') &&
                !form.name.includes('gulping') &&
                !form.name.includes('gorging')
            );

            for (const form of speciesForms) {
                const id = Number(form.url.split('/').slice(-2, -1)[0]);
                if (isValidPokemonId(id)) {
                    forms.push({ name: form.name, id: id });
                }
            }
        }

        for (const evolution of node.evolves_to) {
            await traverseChain(evolution);
        }
    }

    await traverseChain(chain);
    return forms;
}

// Traducciones de tipos de Pokémon
const tipoTraducciones = {
    'steel': 'Acero',
    'water': 'Agua',
    'bug': 'Bicho',
    'dragon': 'Dragón',
    'electric': 'Eléctrico',
    'ghost': 'Fantasma',
    'fire': 'Fuego',
    'fairy': 'Hada',
    'ice': 'Hielo',
    'fighting': 'Lucha',
    'normal': 'Normal',
    'grass': 'Planta',
    'psychic': 'Psíquico',
    'rock': 'Roca',
    'dark': 'Siniestro',
    'ground': 'Tierra',
    'poison': 'Veneno',
    'flying': 'Volador'
};

// Obtener y mostrar la cadena evolutiva
async function fetchEvolutionChain(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionResponse = await fetch(evolutionChainUrl);
        const evolutionData = await evolutionResponse.json();
        displayEvolutionChain(evolutionData.chain);
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
    }
}

// Mostrar la cadena evolutiva
async function displayEvolutionChain(chain) {
    const evolutionContainer = document.getElementById('evolutionChain');
    evolutionContainer.innerHTML = '';

    const evolutionsDiv = document.createElement('div');
    evolutionsDiv.className = 'evolution-images';

    await addEvolutionToChain(chain, evolutionsDiv);

    evolutionContainer.appendChild(evolutionsDiv);

    // Implementar lazy loading para las imágenes de evolución
    const evolutionImages = evolutionContainer.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                const src = image.getAttribute('data-src');
                if (src) {
                    image.src = src;
                    image.removeAttribute('data-src');
                }
                observer.unobserve(image);
            }
        });
    });

    evolutionImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// Añadir evolución a la cadena
async function addEvolutionToChain(evolution, container) {
    if (evolution.species) {
        const formResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-form?limit=10447`);
        const formData = await formResponse.json();
        const forms = formData.results.filter(form => {
            const id = Number(form.url.split('/').slice(-2, -1)[0]);
            return form.name.startsWith(evolution.species.name) &&
                !form.name.includes('totem') &&
                !form.name.includes('limited') &&
                !form.name.includes('sprinting') &&
                !form.name.includes('swimming') &&
                !form.name.includes('gliding') &&
                !form.name.includes('low') &&
                !form.name.includes('drive') &&
                !form.name.includes('aquatic') &&
                !form.name.includes('glide') &&
                !form.name.includes('construct') &&
                !form.name.includes('starter') &&
                !form.name.includes('gulping') &&
                !form.name.includes('gorging') &&
                isValidPokemonId(id);
        });

        for (const form of forms) {
            let spriteUrl = null;
            let formDetail = null;

            // Try to get the sprite from the form endpoint
            try {
                const formDetailResponse = await fetch(form.url);
                formDetail = await formDetailResponse.json();
                spriteUrl = formDetail.sprites.front_default;
            } catch (error) {
                console.error('Error fetching form details:', error);
            }

            // If the sprite is null, try the pokemon endpoint
            if (!spriteUrl) {
                try {
                    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${form.name}`);
                    const pokemonData = await pokemonResponse.json();
                    spriteUrl = pokemonData.sprites.front_default;

                    // If still null, try the official artwork
                    if (!spriteUrl) {
                        spriteUrl = pokemonData.sprites.other['official-artwork'].front_default;
                    }
                } catch (error) {
                    console.error('Error fetching Pokemon details:', error);
                }
            }

            // If we still don't have a sprite, use a placeholder
            if (!spriteUrl) {
                spriteUrl = '';
            }

            const evolutionImg = document.createElement('img');
            evolutionImg.setAttribute('data-src', spriteUrl);
            evolutionImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Placeholder
            evolutionImg.alt = form.name;
            evolutionImg.addEventListener('click', () => selectPokemon(formDetail ? formDetail.id : form.name));

            const evolutionDiv = document.createElement('div');
            evolutionDiv.className = 'evolution-item';
            evolutionDiv.appendChild(evolutionImg);

            container.appendChild(evolutionDiv);
        }

        if (evolution.evolves_to.length > 0) {
            const arrowIcon = document.createElement('span');
            arrowIcon.innerHTML = '→';
            arrowIcon.className = 'evolution-arrow';
            container.appendChild(arrowIcon);

            for (const nextEvolution of evolution.evolves_to) {
                await addEvolutionToChain(nextEvolution, container);
            }
        }
    }
}

// Función para establecer una imagen con manejo de errores y caché
function setImageWithCache(imgElement, src, alt) {
    if (imageCache.has(src)) {
        imgElement.src = imageCache.get(src);
        imgElement.alt = alt || 'Unknown';
    } else {
        const img = new Image();
        img.onload = () => {
            imageCache.set(src, img.src);
            imgElement.src = img.src;
        };
        img.onerror = () => {
            imgElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        };
        img.src = src;
    }
    imgElement.alt = alt || 'Unknown';
}

// Función para cargar imágenes de forma progresiva
function setProgressiveImage(imgElement, src, alt) {
    imgElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Placeholder
    imgElement.alt = alt || 'Loading...';

    const lowQualitySrc = src.replace('/official-artwork/', '/').replace('.png', '.png?size=96');

    const lowQualityImg = new Image();
    lowQualityImg.onload = () => {
        imgElement.src = lowQualitySrc;
    };
    lowQualityImg.src = lowQualitySrc;

    const highQualityImg = new Image();
    highQualityImg.onload = () => {
        imgElement.src = src;
    };
    highQualityImg.src = src;
}

// Función para capitalizar la primera letra de una cadena
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Event listener para el botón de retroceso
document.getElementById('backButton').addEventListener('click', function () {
    window.location.href = 'index.html';
});

// Inicializar la lista cuando se carga la página
initializeList();