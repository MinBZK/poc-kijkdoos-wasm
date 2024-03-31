import * as yaml from "https://cdn.skypack.dev/js-yaml";
import showdown from "https://cdn.skypack.dev/showdown";

async function loadModelCard(modelPath, title) {
    const response = await fetch(modelPath);
    if (!response.ok) {
        throw new Error('Failed to fetch model card: ' + response.status);
    }
    document.getElementById('modelcardurl').value = modelPath

    const modelCardMarkdown = await response.text();
    document.getElementById('modelcardraw').value = modelCardMarkdown

    // Extract YAML from Markdown preamble
    const yamlRegex = /^---\n([\s\S]*?)\n---/;
    const yamlMatch = modelCardMarkdown.match(yamlRegex);
    if (!yamlMatch) {
        throw new Error('Invalid model card format: YAML preamble not found');
    }
    const yamlString = yamlMatch[1];

    // Parse YAML
    const modelCard = yaml.load(yamlString);
    if (!modelCard) {
        throw new Error('Failed to parse YAML');
    }

    document.getElementById('title').innerText = title;

    const modelName = modelCard.model;
    const pathFromModelPath = modelPath.substring(0, modelPath.lastIndexOf('/') + 1);
    const modelNameWithPath = pathFromModelPath + modelName;
    document.getElementById('modelurl').value = modelNameWithPath

    document.getElementById('modelcard').value = JSON.stringify(modelCard, null, 2);

    // Render Markdown content
    const markdownContent = modelCardMarkdown.replace(yamlRegex, ''); // Remove YAML preamble
    const converter = new showdown.Converter();
    const htmlContent = converter.makeHtml(markdownContent);
    document.getElementById('generalContent').innerHTML = htmlContent;

    // Clear output fields
    document.getElementById('outputContainer').innerHTML = '';
    document.getElementById('label').textContent = '';

    // Create input fields
    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-sm');

    const tbody = document.createElement('tbody');

    modelCard.features.forEach((item) => {
        const label = Object.keys(item)[0];
        const value = Object.values(item)[0];

        const row = document.createElement('tr');

        const labelCell = document.createElement('td');
        labelCell.textContent = label + ": ";
        labelCell.style.fontSize = 'smaller';

        const inputCell = document.createElement('td');
        inputCell.style.textAlign = 'right';
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = 'input.' + label;
        inputField.value = value;
        inputField.classList.add('form-control', 'form-control-sm');
        inputCell.appendChild(inputField);

        row.appendChild(labelCell);
        row.appendChild(inputCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Create a div to wrap the table
    const tableWrapper = document.createElement('div');
    tableWrapper.style.maxHeight = '600px';
    tableWrapper.style.overflowY = 'scroll';

    // Append the table to the wrapper
    tableWrapper.appendChild(table);

    const formSection = document.getElementById('inputWrapper');
    formSection.innerHTML = '';
    formSection.appendChild(tableWrapper);

    return modelCard;
}

fetch('register.yaml')
    .then(response => response.text())
    .then(yamlString => {
        // Parse YAML
        const models = yaml.load(yamlString);

        // Get the dropdown menu element
        const dropdownMenu = document.getElementById('modelCardDropdown');

        // Iterate through models and create dropdown items
        models.forEach(model => {
            const dropdownItem = document.createElement('a');
            dropdownItem.classList.add('dropdown-item');
            dropdownItem.href = '#';
            dropdownItem.setAttribute('data-model', model.url); // Assuming each model object has a 'url' property
            dropdownItem.textContent = model.name; // Assuming each model object has a 'name' property
            dropdownMenu.appendChild(dropdownItem);
        });

        if (models.length > 0) {
            loadModelCard(models[0].url, models[0].name);
        }
    })
    .catch(error => console.error('Error fetching YAML:', error));

const modelCardDropdown = document.getElementById('modelCardDropdown');

modelCardDropdown.addEventListener('click', async (event) => {
    if (event.target.tagName === 'A') {
        const modelPath = event.target.dataset.model;
        const title = event.target.textContent; // Get the title from the clicked dropdown item
        await loadModelCard(modelPath, title); // Call loadModelCard() with the modelPath and title
    }
});
