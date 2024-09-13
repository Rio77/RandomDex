const digiviceButton = document.getElementById('digiviceButton');
const listButton = document.getElementById('listButton');
const listContainer = document.getElementById('listContainer');
const listItems = document.getElementById('listItems');
const searchButton = document.getElementById('searchButton');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const content = document.getElementById('content');
const fullScreenBackground = document.getElementById('fullScreenBackground');

const listElements = [
    'Cabeza', 'Orejas', 'Boca', 'Color', 'Detalles', 'Ojos', 'Cola',
    'Cuerpo ↑', 'Cuerpo ↓', 'Patas Traseras', 'Patas Delanteras'
];

let selectedDigimons = new Array(11).fill(null);

// Cargar la imagen principal lo más rápido posible
function preloadImage(url) {
    const img = new Image();
    img.src = url;
}

function setImage(imgElement, src, alt) {
    imgElement.src = src || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    imgElement.alt = alt || 'Unknown';
    imgElement.loading = 'lazy'; // Lazy load para imágenes secundarias
    imgElement.onerror = function () {
        this.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    };
}

digiviceButton.addEventListener('click', () => {
    getRandomDigimon();
    content.style.display = 'block';
});

listButton.addEventListener('click', toggleList);
searchButton.addEventListener('click', toggleSearch);
searchInput.addEventListener('input', searchDigimon);

function toggleList(event) {
    event.stopPropagation();
    if (listContainer.style.display === 'none' || listContainer.style.display === '') {
        listContainer.style.display = 'block';
        fullScreenBackground.style.display = 'block'; // Mostrar el fondo
    } else {
        listContainer.style.display = 'none';
        fullScreenBackground.style.display = 'none'; // Ocultar el fondo
    }
    searchContainer.style.display = 'none';
}

function toggleSearch(event) {
    event.stopPropagation();
    if (searchContainer.style.display === 'none' || searchContainer.style.display === '') {
        searchContainer.style.display = 'block';
        fullScreenBackground.style.display = 'block'; // Mostrar el fondo
        searchInput.focus(); // Enfocar automáticamente el campo de búsqueda
    } else {
        searchContainer.style.display = 'none';
        fullScreenBackground.style.display = 'none'; // Ocultar el fondo
    }
    listContainer.style.display = 'none';
}

document.addEventListener('click', (event) => {
    if (!listContainer.contains(event.target) && event.target !== listButton) {
        listContainer.style.display = 'none';
        fullScreenBackground.style.display = 'none'; // Ocultar el fondo si se hace clic fuera de la lista
    }
    if (!searchContainer.contains(event.target) && event.target !== searchButton) {
        searchContainer.style.display = 'none';
        fullScreenBackground.style.display = 'none'; // Ocultar el fondo si se hace clic fuera del buscador
    }
});

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
            if (selectedDigimons[index]) {
                selectDigimon(selectedDigimons[index].id);
                listContainer.style.display = 'none';
                fullScreenBackground.style.display = 'none';
            }
        });
        listItems.appendChild(listItem);
    });
}

function updateList(digimon) {
    const emptySlot = selectedDigimons.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
        selectedDigimons[emptySlot] = digimon;
        const listItem = listItems.children[emptySlot];
        const img = listItem.querySelector('img');
        setImage(img, digimon.images[0]?.href, digimon.name);
    }
}

async function searchDigimon() {
    const query = searchInput.value.trim();

    if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`https://digi-api.com/api/v1/digimon?name=${query}`);
        const data = await response.json();

        searchResults.innerHTML = '';
        data.content.forEach(digimon => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result';
            resultElement.textContent = digimon.name;
            resultElement.addEventListener('click', () => {
                selectDigimon(digimon.id);
                searchContainer.style.display = 'none';
                searchInput.value = '';
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                fullScreenBackground.style.display = 'none'; // Ocultar el fondo
            });
            searchResults.appendChild(resultElement);
        });
        searchResults.style.display = 'block';
    } catch (error) {
        console.error('Error searching Digimon:', error);
    }
}

async function getRandomDigimon() {
    try {
        const minId = 1;
        const maxId = 1460;
        const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
        await selectDigimon(randomId);
    } catch (error) {
        console.error('Error al obtener datos del Digimon:', error);
    }
}

async function selectDigimon(id) {
    try {
        const response = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
        const digimonData = await response.json();

        if (!digimonData || !digimonData.name) {
            throw new Error('No se encontró el Digimon o la API no devolvió datos válidos.');
        }

        // Precargar la imagen principal
        preloadImage(digimonData.images[0]?.href);

        displayDigimonInfo(digimonData);
        updateList(digimonData);
    } catch (error) {
        console.error('Error al obtener datos del Digimon:', error);
    }
}

function displayDigimonInfo(digimon) {
    const digimonName = document.getElementById('digimonName');
    const mainImage = document.getElementById('mainImage');
    const digimonLevel = document.getElementById('digimonLevel');
    const digimonAttribute = document.getElementById('digimonAttribute');
    const digimonType = document.getElementById('digimonType');
    const digimonXAntibody = document.getElementById('digimonXAntibody');
    const digimonFields = document.getElementById('digimonFields');
    const priorEvolutionsContainer = document.getElementById('priorEvolutions');
    const nextEvolutionsContainer = document.getElementById('nextEvolutions');

    digimonName.textContent = `${digimon.name} (${digimon.id})`;
    setImage(mainImage, digimon.images[0]?.href, digimon.name);
    digimonLevel.textContent = digimon.levels && digimon.levels[0] ? digimon.levels[0].level : 'Unknown';
    digimonAttribute.textContent = digimon.attributes && digimon.attributes[0] ? digimon.attributes[0].attribute : 'Unknown';
    digimonType.textContent = digimon.types && digimon.types[0] ? digimon.types[0].type : 'Unknown';
    digimonXAntibody.textContent = digimon.xAntibody ? 'Yes' : 'No';

    digimonFields.innerHTML = '';
    if (digimon.fields && digimon.fields.length > 0) {
        digimon.fields.forEach(field => {
            if (field.image && field.field !== "Unknown") {
                const fieldImg = document.createElement('img');
                setImage(fieldImg, field.image, field.field || 'Unknown');
                digimonFields.appendChild(fieldImg);
            }
        });
    }

    displayEvolutions(priorEvolutionsContainer, digimon.priorEvolutions, 'Evoluciones Previas');
    displayEvolutions(nextEvolutionsContainer, digimon.nextEvolutions, 'Evoluciones Siguientes');
}

function displayEvolutions(container, evolutions, title) {
    container.innerHTML = '';
    if (evolutions && evolutions.length > 0) {
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.className = 'evolution-title';
        container.appendChild(titleElement);

        const evolutionsDiv = document.createElement('div');
        evolutionsDiv.className = 'evolution-images';

        evolutions.forEach(evolution => {
            if (evolution && evolution.image) {
                const evolutionImg = document.createElement('img');
                setImage(evolutionImg, evolution.image, evolution.digimon || 'Unknown');
                evolutionImg.addEventListener('click', () => selectDigimon(evolution.id));
                evolutionsDiv.appendChild(evolutionImg);
            }
        });

        container.appendChild(evolutionsDiv);
    }
}

document.getElementById('backButton').addEventListener('click', function () {
    window.location.href = 'index.html';
});

// Usar requestIdleCallback para inicializar funciones no críticas
window.onload = function () {
    initializeList();

    // Inicializar funciones no críticas cuando el navegador esté en reposo
    requestIdleCallback(() => {
        preloadImage('Img/Logo.png');  // Precargar logo
    });
};
