const URL = "https://teachablemachine.withgoogle.com/models/sd3n1Dk_W/";

let model, labelContainer, maxPredictions;

const constitutionInfo = {
    "태양인": "머리가 크고 목덜미가 발달하였으나 하체가 빈약한 편입니다. 과단성이 있고 창의적이지만, 급하고 독선적인 성격이 있을 수 있습니다.",
    "태음인": "체격이 크고 골격이 튼실하며 하체가 발달한 편입니다. 성격이 너그럽고 끈기가 있지만, 게을러지기 쉽고 욕심이 많을 수 있습니다.",
    "소양인": "가슴 부위가 발달하고 엉덩이 부위가 빈약한 편입니다. 민첩하고 명랑하며 봉사정신이 강하지만, 경솔하고 마무리가 부족할 수 있습니다.",
    "소음인": "상체에 비해 하체가 발달하고 몸이 가냘픈 편입니다. 꼼꼼하고 내성적이며 예의가 바르지만, 소심하고 질투가 많을 수 있습니다."
};

// 페이지 로드 시 모델 초기화
async function initModel() {
    const loading = document.getElementById("loading");
    loading.classList.remove("hidden");

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    loading.classList.add("hidden");
    
    // 결과 레이블 컨테이너 초기화
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        const item = document.createElement("div");
        item.className = "prediction-item";
        item.innerHTML = `
            <div class="label-text">
                <span class="class-name"></span>
                <span class="probability">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        labelContainer.appendChild(item);
    }

    setupFileUpload();
}

function setupFileUpload() {
    const fileInput = document.getElementById("image-upload");
    const imagePreview = document.getElementById("image-preview");

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.classList.remove("hidden");
            
            // 이미지가 로드된 후 예측 실행
            imagePreview.onload = () => {
                predict(imagePreview);
            };
        };
        reader.readAsDataURL(file);
    });
}

async function predict(imageElement) {
    const prediction = await model.predict(imageElement);
    let topPrediction = { className: "", probability: 0 };

    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const item = labelContainer.childNodes[i];
        item.querySelector(".class-name").innerText = className;
        item.querySelector(".probability").innerText = probability + "%";
        item.querySelector(".progress-fill").style.width = probability + "%";

        if (prediction[i].probability > topPrediction.probability) {
            topPrediction = prediction[i];
        }
    }

    if (topPrediction.probability > 0.01) { // 파일 업로드 시에는 더 낮은 확률에서도 결과를 보여줍니다.
        const diagnosisBox = document.getElementById("diagnosis");
        diagnosisBox.classList.remove("hidden");
        document.getElementById("top-constitution").innerText = topPrediction.className;
        document.getElementById("constitution-desc").innerText = constitutionInfo[topPrediction.className] || "";
    }
}

// 초기화 시작
initModel();
