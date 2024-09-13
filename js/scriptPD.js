// Elementos del DOM
const selectButton = document.getElementById('selectButton');
const listButton = document.getElementById('listButton');
const listContainer = document.getElementById('listContainer');
const listItems = document.getElementById('listItems');
const searchButton = document.getElementById('searchButton');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const content = document.getElementById('content');
const infoContainer = document.getElementById('infoContainer');
const fullScreenBackground = document.getElementById('fullScreenBackground');

// Lista de elementos para la construcción
const listElements = [
    'Cabeza', 'Orejas', 'Boca', 'Color', 'Detalles', 'Ojos', 'Cola',
    'Cuerpo ↑', 'Cuerpo ↓', 'Patas Traseras', 'Patas Delanteras'
];

let selectedItems = new Array(11).fill(null);
let currentMode = null; // 'pokemon' o 'digimon'

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
selectButton.addEventListener('click', () => {
    currentMode = Math.random() < 0.5 ? 'pokemon' : 'digimon';
    selectButton.style.backgroundImage = currentMode === 'pokemon' ? 
        "url('Img/LogoP.svg')" : "url('Img/LogoD.png')";
    getRandomItem();
    content.style.display = 'block';
});

listButton.addEventListener('click', toggleList);
searchButton.addEventListener('click', toggleSearch);
searchInput.addEventListener('input', searchItem);

// Funciones de interfaz
function toggleList(event) {
    event.stopPropagation();
    const isListVisible = listContainer.style.display === 'block';
    listContainer.style.display = isListVisible ? 'none' : 'block';
    fullScreenBackground.style.display = isListVisible ? 'none' : 'block';
    searchContainer.style.display = 'none';
}

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

// Inicializar la lista
function initializeList() {
    listItems.innerHTML = '';
    listElements.forEach((element, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.innerHTML = `
            <span>${element}</span>
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="">
        `;
        listItem.addEventListener('click', () => {
            if (selectedItems[index]) {
                // Verificar si el ítem seleccionado es un Pokémon o Digimon y actualizar currentMode
                if (selectedItems[index].sprites) {
                    currentMode = 'pokemon'; // Es un Pokémon
                } else if (selectedItems[index].images) {
                    currentMode = 'digimon'; // Es un Digimon
                }

                selectItem(selectedItems[index].id);
                listContainer.style.display = 'none';
                fullScreenBackground.style.display = 'none';
            }
        });
        listItems.appendChild(listItem);
    });
}

function updateList(item) {
    const emptySlot = selectedItems.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
        selectedItems[emptySlot] = item;
        const listItem = listItems.children[emptySlot];
        const img = listItem.querySelector('img');

        // Obtener la imagen principal del Pokémon o Digimon
        let imageUrl = currentMode === 'pokemon'
            ? item.sprites?.front_default // Imagen principal del Pokémon
            : item.images?.[0]?.href;     // Imagen principal del Digimon

        // Si la imagen es null, usar la imagen principal ya cargada (no usar placeholder)
        if (!imageUrl) {
            imageUrl = currentMode === 'pokemon'
                ? item.sprites?.other?.['official-artwork']?.front_default // Otra imagen oficial de Pokémon
                : 'path/to/placeholder/image.png'; // Imagen predeterminada para Digimon
        }

        // Establecer la imagen
        setImage(img, imageUrl, item.name);
    }
}


async function searchItem() {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }

    try {
        let data;
        if (currentMode === 'pokemon') {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-form?limit=10447`);
            data = await response.json();
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
                    !pokemon.name.includes('gliding') &&
                    !pokemon.name.includes('construct') &&
                    !pokemon.name.includes('low') &&
                    !pokemon.name.includes('drive') &&
                    !pokemon.name.includes('aquatic') &&
                    !pokemon.name.includes('glide') &&
                    isValidPokemonId(id);
            });
            displaySearchResults(results.slice(0, 20), 'pokemon');
        } else {
            const response = await fetch(`https://digi-api.com/api/v1/digimon?name=${query}`);
            data = await response.json();
            displaySearchResults(data.content, 'digimon');
        }
    } catch (error) {
        console.error('Error searching:', error);
    }
}

function displaySearchResults(results, mode) {
    searchResults.innerHTML = '';
    results.forEach(item => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        resultElement.textContent = capitalizeFirstLetter(item.name);
        resultElement.addEventListener('click', () => {
            selectItem(mode === 'pokemon' ? item.url.split('/').slice(-2, -1)[0] : item.id);
            searchContainer.style.display = 'none';
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            fullScreenBackground.style.display = 'none';
        });
        searchResults.appendChild(resultElement);
    });
    searchResults.style.display = 'block';
}

async function getRandomItem() {
    try {
        if (currentMode === 'pokemon') {
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
            await selectItem(randomId);
        } else {
            const minId = 1;
            const maxId = 1460;
            const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
            await selectItem(randomId);
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

async function selectItem(id) {
    try {
        let itemData;
        if (currentMode === 'pokemon') {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-form/${id}`);
            const formData = await response.json();
            const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${formData.pokemon.name}`);
            const pokemonData = await pokemonResponse.json();
            itemData = {
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
        } else {
            const response = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
            itemData = await response.json();
        }

        if (!itemData || !itemData.name) {
            throw new Error('No se encontró el elemento o la API no devolvió datos válidos.');
        }

        await displayItemInfo(itemData);
        updateList(itemData);

    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

async function displayItemInfo(item) {
    let html = '';
    if (currentMode === 'pokemon') {
        const speciesResponse = await fetch(item.species.url);
        const speciesData = await speciesResponse.json();
        const spanishName = speciesData.names.find(name => name.language.name === 'es')?.name || item.name;

        const abilities = await Promise.all(item.abilities.map(async (ability) => {
            const abilityResponse = await fetch(ability.ability.url);
            const abilityData = await abilityResponse.json();
            const spanishAbilityName = abilityData.names.find(name => name.language.name === 'es')?.name || ability.ability.name;
            return capitalizeFirstLetter(spanishAbilityName);
        }));

        html = `
            <h2 id="itemName">${capitalizeFirstLetter(spanishName)}${item.form_name ? ` (${item.form_name})` : ''}</h2>
            <div class="info-container">
                <div id="itemNameAndImage">
                    <img id="mainImage" src="${item.sprites.other['official-artwork'].front_default || item.sprites.front_default}" alt="${spanishName}">
                </div>
                <div class="info-details">
                    <p><strong>Tipos:</strong> <span id="itemTypes">${item.types.map(t => tipoTraducciones[t.type.name] || capitalizeFirstLetter(t.type.name)).join(', ')}</span></p>
                    <p><strong>Habilidades:</strong> <span id="itemAbilities">${abilities.join(', ')}</span></p>
                </div>
            </div>
            <div class="evolution-container" id="evolutionChain"></div>
        `;
    } else {
        html = `
            <h2 id="itemName">${capitalizeFirstLetter(item.name)} (${item.id})</h2>
            <div class="info-container">
                <div id="itemNameAndImage">
                    <img id="mainImage" src="${item.images[0]?.href}" alt="${item.name}">
                </div>
                <div class="info-details">
                    <p><strong>Nivel:</strong> <span id="itemLevel">${item.levels?.[0]?.level || 'Unknown'}</span></p>
                    <p><strong>Atributo:</strong> <span id="itemAttribute">${item.attributes?.[0]?.attribute || 'Unknown'}</span></p>
                    <p><strong>Tipo:</strong> <span id="itemType">${item.types?.[0]?.type || 'Unknown'}</span></p>
                    <p><strong>X-Antibody:</strong> <span id="itemXAntibody">${item.xAntibody ? 'Yes' : 'No'}</span></p>
                </div>
            </div>
            <div id="itemFields">
                ${item.fields?.map(field => 
                    field.image && field.field !== "Unknown" ? 
                    `<img src="${field.image}" alt="${field.field || 'Unknown'}">` : 
                    ''
                ).join('')}
            </div>
            <div class="evolution-container">
                <h3>Evoluciones Previas</h3>
                <div class="evolution-images" id="priorEvolutions">
                    ${item.priorEvolutions?.map(evo => 
                        `<img src="${evo.image}" alt="${evo.digimon || 'Unknown'}" onclick="selectItem(${evo.id})">`
                    ).join('') || 'No hay evoluciones previas'}
                </div>
                <h3>Evoluciones Siguientes</h3>
                <div class="evolution-images" id="nextEvolutions">
                    ${item.nextEvolutions?.map(evo => 
                        `<img src="${evo.image}" alt="${evo.digimon || 'Unknown'}" onclick="selectItem(${evo.id})">`
                    ).join('') || 'No hay evoluciones siguientes'}
                </div>
            </div>
        `;
    }
    infoContainer.innerHTML = html;

    // Si es un Pokémon, obtén y muestra la cadena evolutiva después de actualizar el HTML
    if (currentMode === 'pokemon') {
        fetchEvolutionChain(item.species.url);
    }
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
        await displayEvolutionChain(evolutionData.chain);
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        const evolutionContainer = document.getElementById('evolutionChain');
        if (evolutionContainer) {
            evolutionContainer.innerHTML = '<p>No se pudo cargar la cadena evolutiva.</p>';
        }
    }
}

// Mostrar la cadena evolutiva
async function displayEvolutionChain(chain) {
    const evolutionContainer = document.getElementById('evolutionChain');
    if (!evolutionContainer) {
        console.error('Evolution container not found');
        return;
    }
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
                !form.name.includes('construct') &&
                !form.name.includes('aquatic') &&
                !form.name.includes('glide') &&
                !form.name.includes('starter') &&
                !form.name.includes('gulping') &&
                !form.name.includes('gorging') &&
                isValidPokemonId(id);
        });

        for (const form of forms) {
            let spriteUrl = null;
            let formDetail = null;

            try {
                const formDetailResponse = await fetch(form.url);
                formDetail = await formDetailResponse.json();
                spriteUrl = formDetail.sprites.front_default;
            } catch (error) {
                console.error('Error fetching form details:', error);
            }

            if (!spriteUrl) {
                try {
                    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${form.name}`);
                    const pokemonData = await pokemonResponse.json();
                    spriteUrl = pokemonData.sprites.front_default;

                    if (!spriteUrl) {
                        spriteUrl = pokemonData.sprites.other['official-artwork'].front_default;
                    }
                } catch (error) {
                    console.error('Error fetching Pokemon details:', error);
                }
            }

            if (!spriteUrl) {
                spriteUrl = 'path/to/your/placeholder/image.png';
            }

            const evolutionImg = document.createElement('img');
            evolutionImg.setAttribute('data-src', spriteUrl);
            evolutionImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Placeholder
            evolutionImg.alt = form.name;
            evolutionImg.addEventListener('click', () => selectItem(formDetail ? formDetail.id : form.name));

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
function setImage(imgElement, src, alt) {
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

// Establecer la imagen inicial del botón de selección
selectButton.style.backgroundImage = "url('Img/Logo.png')";