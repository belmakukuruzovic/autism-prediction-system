const questions = [
    [
        { id: "age", label: "Godine", type: "number", min: 1, max: 18, placeholder: "Unesite godine" },
        { id: "gender", label: "Spol", type: "select", options: ["", "Muško", "Žensko"], placeholder: "Odaberite spol" },
        { id: "jundice", label: "Rođen/a sa žuticom", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "relation", label: "Genetska predispozicija (porodična istorija PDD)", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" }
    ],
    [
        { id: "q1", label: "Da li dijete izbjegava kontakt očima?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "q2", label: "Da li dijete voli igrati samo?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "q3", label: "Da li dijete ponavlja riječi?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "q4", label: "Ima li dijete poteškoća s rutinama?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "q5", label: "Neobične reakcije na zvuk ili svjetlo?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" }
    ],
    [
        { id: "q6", label: "Da li dijete ima specifična interesovanja?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "q7", label: "Pokazuje li dijete ponavljajuće pokrete?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "q8", label: "Poteškoće u razumijevanju emocija?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "q9", label: "Izbjegava li dijete fizički kontakt?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" },
        { id: "q10", label: "Kašnjenje u govoru?", type: "select", options: ["", "Da", "Ne"], placeholder: "Odaberite odgovor" }
    ]
];

let currentSectionIndex = 0;
const container = document.getElementById("card-container");
const formData = {};

function loadCard() {
    const section = questions[currentSectionIndex];
    container.innerHTML = `
        <h3>Predikcija autizma kod djece</h3>
        <div class="progress-indicator">${currentSectionIndex + 1}/${questions.length}</div>
        <div class="card-body">
            ${section.map(q => `
                <div class="mb-3">
                    <label for="${q.id}" class="form-label">${q.label}</label>
                    ${generateInputField(q)}
                    <div class="invalid-feedback">Molimo popunite polje za: ${q.label}</div>
                </div>
            `).join('')}
            <div class="mt-4 d-flex justify-content-between">
                ${currentSectionIndex > 0 ? '<button class="btn btn-secondary" onclick="goBack()">Nazad</button>' : ''}
                ${currentSectionIndex < questions.length - 1 ? '<button class="btn btn-primary" onclick="goNext()">Dalje</button>' : '<button class="btn btn-success" onclick="predict()">Predikcija</button>'}
            </div>
        </div>
    `;
}

function generateInputField(question) {
    const value = formData[question.id] || "";
    if (question.type === "number") {
        return `<input type="number" id="${question.id}" class="form-control" placeholder="${question.placeholder}" min="${question.min}" max="${question.max}" value="${value}" required>`;
    } else if (question.type === "select") {
        return `<select id="${question.id}" class="form-control">
            ${question.options.map(option => `
                <option value="${option}" ${value === option ? "selected" : ""}>${option || question.placeholder}</option>
            `).join('')}
        </select>`;
    }
}

function validateSection() {
    const section = questions[currentSectionIndex];
    let isValid = true;

    section.forEach(question => {
        const inputElement = document.getElementById(question.id);
        const value = inputElement.value;
        if (!value || (question.type === "number" && (value < question.min || value > question.max))) {
            inputElement.classList.add("is-invalid");
            isValid = false;
        } else {
            inputElement.classList.remove("is-invalid");
        }
        formData[question.id] = value;
    });

    return isValid;
}

function goNext() {
    if (!validateSection()) return;
    currentSectionIndex++;
    loadCard();
}

function goBack() {
    currentSectionIndex--;
    loadCard();
}

async function predict() {
    if (!validateSection()) return;

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "API request failed.");
        }

        const result = await response.json();
        container.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Rezultat Predikcije</h5>
                <p class="card-text">Vjerovatnoća za ASD: <strong>${result.probability.toFixed(2)}%</strong></p>
                <button class="btn btn-secondary" onclick="resetForm()">Početna</button>
            </div>
        `;
    } catch (error) {
        console.error("Došlo je do greške:", error);
        alert(error.message || "Greška: Molimo provjerite vezu sa serverom.");
    }
}

function resetForm() {
    currentSectionIndex = 0;
    Object.keys(formData).forEach(key => delete formData[key]);
    loadCard();
}

loadCard();
