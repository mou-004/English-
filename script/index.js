
const loadLevels = async () => {
  const res = await fetch("https://openapi.programming-hero.com/api/levels/all");
  const data = await res.json();
  displayLevels(data.data);
};


const displayLevels = (levels) => {
  const container = document.getElementById("lesson-container");
  container.innerHTML = "";

  levels.forEach(level => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline btn-primary lesson-btn";
    btn.innerText = `Lesson ${level.level_no}`;

    btn.addEventListener("click", () => {
      setActive(btn);
      loadWords(level.level_no);
    });

    container.appendChild(btn);
  });
};

const setActive = (clickedBtn) => {
  document.querySelectorAll(".lesson-btn").forEach(btn => {
    btn.classList.remove("bg-primary", "text-white");
  });
  clickedBtn.classList.add("bg-primary", "text-white");
};


const loadWords = async (level) => {
  const res = await fetch(
    `https://openapi.programming-hero.com/api/level/${level}`
  );
  const data = await res.json();
  displayWords(data.data);
};


const displayWords = (words) => {
  const container = document.getElementById("word-container");
  container.innerHTML = "";

  if (!words || words.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10">
       There is  No lesson found.
        <br>
        Please select another lesson.

      </div>
    `;
    return;
  }

  words.forEach(word => {
    const card = document.createElement("div");
    card.className = "bg-white p-6 rounded-xl shadow relative";

    card.innerHTML = `
      <button 
        onclick="loadWordDetails(${word.id})"
        class="absolute top-3 left-3 btn btn-sm btn-circle bg-sky-100"
      >
        <i class="fa-solid fa-circle-info"></i>
      </button>

      <button 
        onclick="playPronunciation('${word.word}')"
        class="absolute top-3 right-3 btn btn-sm btn-circle bg-sky-100"
      >
        <i class="fa-solid fa-volume-high"></i>
      </button>

      <div class="pt-10 text-center">
        <h3 class="text-xl font-bold mb-2">
          ${word.word || "Word not found"}
        </h3>

        <p class="font-semibold mb-2">
          ${word.meaning || "Word not found"}
        </p>

        <p class="text-sm text-gray-500">
          ${word.pronunciation || "Word not found"}
        </p>
      </div>
    `;

    container.appendChild(card);
  });
};


const playPronunciation = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
};


const loadWordDetails = async (id) => {
  try {
    const res = await fetch(
      `https://openapi.programming-hero.com/api/word/${id}`
    );
    const data = await res.json();
    showWordModal(data.data);
  } catch (error) {
    console.error("Word details error:", error);
  }
};


const showWordModal = (word) => {
  const container = document.getElementById("details-container");

  container.innerHTML = `
    <h2 class="text-2xl font-bold">
      ${word.word || "Word not found"} 
      <span class="text-lg font-normal">
        (${word.pronunciation || "Not found"})
      </span>
    </h2>

    <div>
      <p class="font-semibold mt-4">Meaning</p>
      <p>${word.meaning || "Word not found"}</p>
    </div>

    <div>
      <p class="font-semibold mt-4">Example</p>
      <p>${word.sentence || "Word not found"}</p>
    </div>

    <div>
      <p class="font-semibold mt-4">Synonyms</p>
      <div class="flex flex-wrap gap-2 mt-2">
        ${
          word.synonyms && word.synonyms.length > 0
            ? word.synonyms
                .map(syn => `<span class="badge badge-outline">${syn}</span>`)
                .join("")
            : `<span class="text-gray-400">Word not found</span>`
        }
      </div>
    </div>

    <button 
      onclick="document.getElementById('word_modal').close()"
      class="btn btn-primary mt-6 w-full"
    >
      Complete Learning
    </button>
  `;

  document.getElementById("word_modal").showModal();
};


document.getElementById("btn-search").addEventListener("click", async () => {
  const value = document.getElementById("input-search").value.trim();
  if (!value) return;

  document.querySelectorAll(".lesson-btn").forEach(btn => {
    btn.classList.remove("bg-primary", "text-white");
  });

  const container = document.getElementById("word-container");
  container.innerHTML = `<div class="col-span-full text-center py-10">Searching...</div>`;

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${value}`
    );

    if (!res.ok) {
      container.innerHTML = `<div class="col-span-full text-center py-10">Word not found</div>`;
      return;
    }

    const data = await res.json();
    displaySearchResult(data[0]);

  } catch (error) {
    container.innerHTML = `<div class="col-span-full text-center py-10">Error fetching word</div>`;
  }
});


const displaySearchResult = async (data) => {
  const container = document.getElementById("word-container");
  container.innerHTML = "";

  const word = data.word;
  const pronunciation = data.phonetics?.[0]?.text || "Not found";
  const audio = data.phonetics?.find(p => p.audio)?.audio || null;
  const meaning = data.meanings?.[0]?.definitions?.[0]?.definition || "Not found";
  const example = data.meanings?.[0]?.definitions?.[0]?.example || "Not found";
  const synonyms = data.meanings?.[0]?.synonyms || [];

  let banglaMeaning = "Not found";

  try {
    const transRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${meaning}&langpair=en|bn`
    );
    const transData = await transRes.json();
    banglaMeaning = transData.responseData.translatedText;
  } catch (error) {
    console.log("Translation error");
  }

  const card = document.createElement("div");
  card.className = "bg-white p-6 rounded-xl shadow relative col-span-full";

  card.innerHTML = `
    <h3 class="text-2xl font-bold mb-2">${word}</h3>
    <p class="text-gray-500 mb-3">${pronunciation}</p>

    <p class="font-semibold">Meaning (English):</p>
    <p class="mb-3">${meaning}</p>

    <p class="font-semibold font-bangla">বাংলা অর্থ:</p>
    <p class="mb-3 font-bangla">${banglaMeaning}</p>

    <p class="font-semibold">Example:</p>
    <p class="mb-3">${example}</p>

    <p class="font-semibold">Synonyms:</p>
    <div class="flex flex-wrap gap-2 mt-2">
      ${
        synonyms.length > 0
          ? synonyms.map(s => `<span class="badge badge-outline">${s}</span>`).join("")
          : `<span class="text-gray-400">Not found</span>`
      }
    </div>

    ${
      audio
        ? `<button onclick="new Audio('${audio}').play()" 
             class="btn btn-sm btn-circle absolute top-3 right-3 bg-sky-100">
             <i class="fa-solid fa-volume-high"></i>
           </button>`
        : ""
    }
  `;

  container.appendChild(card);
};

document.getElementById("input-search")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("btn-search").click();
    }
  });


document.addEventListener("DOMContentLoaded", loadLevels);