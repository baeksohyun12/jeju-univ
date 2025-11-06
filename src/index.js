// form fields
const form = document.querySelector('.form-data');
const region = document.querySelector('.region-name');
const apiKey = document.querySelector('.api-key');
// results
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');
const usage = document.querySelector('.carbon-usage');
const fossilfuel = document.querySelector('.fossil-fuel');
const myregion = document.querySelector('.my-region');
const clearBtn = document.querySelector('.clear-btn');

form.addEventListener('submit', (e) => handleSubmit(e));
clearBtn.addEventListener('click', (e) => reset(e));
init();

function reset(e) {
    e.preventDefault();
    localStorage.removeItem('regionName');
    init();
}

function init() {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegion = localStorage.getItem('regionName');
    //set icon to be generic green
    //todo
    if (storedApiKey === null || storedRegion === null) {
        form.style.display = 'block';
        results.style.display = 'none';
        loading.style.display = 'none';
        clearBtn.style.display = 'none';
        errors.textContent = '';
    } else {
        displayCarbonUsage(storedApiKey, storedRegion);
        results.style.display = 'none';
        form.style.display = 'none';
        clearBtn.style.display = 'block';
    }
};

function handleSubmit(e) {
    e.preventDefault();
    setUpUser(apiKey.value, region.value);
}

function setUpUser(apiKey, regionName) {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('regionName', regionName);
    loading.style.display = 'block';
    errors.textContent = '';
    clearBtn.style.display = 'block';
    displayCarbonUsage(apiKey, regionName);
}

async function displayCarbonUsage(apiKeyValue, regionNameValue) {
    // 로딩 표시
    loading.style.display = 'block';
    results.style.display = 'none';
    errors.textContent = '';

    try {
        // (임시 더미 데이터 — 나중에 실제 API 연결 가능)
        await new Promise(resolve => setTimeout(resolve, 700)); // 0.7초 로딩 흉내
        const data = {
            regionName: regionNameValue,
            carbonIntensity: 412.3,
            fossilFuelPercentage: 36.4
        };

        // 결과 표시
        myregion.textContent = data.regionName;
        usage.textContent = `${data.carbonIntensity} gCO₂/kWh`;
        fossilfuel.textContent = `${data.fossilFuelPercentage}%`;

        loading.style.display = 'none';
        results.style.display = 'block';
    } catch (err) {
        loading.style.display = 'none';
        errors.textContent = '데이터를 불러오지 못했습니다.';
    }
}