import * as ort from "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/esm/ort.min.js";
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";
async function main() {
    try {
        const runButton = document.getElementById('runInference');
        runButton.addEventListener('click', async () => {
            const modelCardData = document.getElementById('modelcard').value;
            const modelCard = JSON.parse(modelCardData);

            const outputProbabilitiesField = modelCard.output.probabilities;
            const outputClassField = modelCard.output.class;
            const inputName = modelCard.input;

            const modelName = document.getElementById('modelurl').value
            const session = await ort.InferenceSession.create(modelName);
            const outputContainer = document.getElementById('outputContainer');
            const outputLabel = document.getElementById('label');

            const inputValues = [];
            modelCard.features.forEach((item) => {
                const label = Object.keys(item)[0];
                const inputField = document.getElementById('input.' + label);
                inputValues.push(parseFloat(inputField.value));
            });
            const inputTensorShape = [1, modelCard.features.length]; // Adjusting tensor shape
            const tensor = new ort.Tensor('float32', inputValues, inputTensorShape); // Adjusting tensor shape
            const feeds = {
                [inputName]: tensor
            };
            const results = await session.run(feeds);
            const data = results[outputProbabilitiesField].data;
            outputContainer.innerHTML = '';
            data.forEach((probability, index) => {
                const div = document.createElement('div');
                div.textContent = `Class ${index}: ${probability.toFixed(2)}`;
                outputContainer.appendChild(div);
            });

            if (outputClassField) {
                outputLabel.textContent = results[outputClassField].data;
            }
        });
   } catch (e) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = `Failed to inference model: ${e}`;
        console.error('Failed to inference model:', e);
   }
}
main();
