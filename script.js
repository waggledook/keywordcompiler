// Firebase initialization (using ES modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getFirestore, 
  addDoc, 
  collection, 
  serverTimestamp, 
  getDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// Optionally, import analytics if needed
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpUNy_xjg9IE6K9CIPlYA-f26YuhNQD9c",
  authDomain: "key-word-compiler.firebaseapp.com",
  projectId: "key-word-compiler",
  storageBucket: "key-word-compiler.firebasestorage.app",
  messagingSenderId: "101672648997",
  appId: "1:101672648997:web:908397d03fcebb548f1acc",
  measurementId: "G-QK0FWQQYHV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Now you have access to Firestore
const analytics = getAnalytics(app); // Optional, if you're using analytics

loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js", () => {
  console.log("QRCode library loaded!");
});

// Utility functions
function loadScript(url, callback) {
  const script = document.createElement("script");
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
}

function loadCSS(url) {
  const link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

// Since we're now using a plain dropdown, we don't need to initialize select2.
// This function can simply be a placeholder (or removed entirely if not needed).
function initTagSelect() {
  document.addEventListener("DOMContentLoaded", function () {
    // No special initialization is required for the plain dropdown.
  });
}

function addCustomSelect2Styles() {
  // No custom styles needed for plain dropdown.
}


loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", () => {
  loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js", () => {
    console.log("jsPDF and AutoTable loaded!");
    // Now you can safely call your PDF-generating code, e.g. this.downloadReport()
  });
});

function normalizeContractions(text) {
  // Standard contractions expanded.
  text = text.replace(/\bcan't\b/gi, "cannot");
  text = text.replace(/\bwon't\b/gi, "will not");
  text = text.replace(/\bdon't\b/gi, "do not");
  text = text.replace(/\bdoesn't\b/gi, "does not");
  text = text.replace(/\bi'm\b/gi, "i am");
  text = text.replace(/\byou're\b/gi, "you are");
  text = text.replace(/\bit's\b/gi, "it is");
  text = text.replace(/\bwe're\b/gi, "we are");
  text = text.replace(/\bthey're\b/gi, "they are");
  text = text.replace(/\bI've\b/gi, "i have");
  text = text.replace(/\byou've\b/gi, "you have");
  text = text.replace(/\bwe've\b/gi, "we have");
  text = text.replace(/\bthey've\b/gi, "they have");
  text = text.replace(/\bI'll\b/gi, "i will");
  text = text.replace(/\byou'll\b/gi, "you will");
  text = text.replace(/\bwe'll\b/gi, "we will");
  text = text.replace(/\bthey'll\b/gi, "they will");
  text = text.replace(/\bhaven't\b/gi, "have not");
  text = text.replace(/\bhasn't\b/gi, "has not");
  text = text.replace(/\bhadn't\b/gi, "had not"); 
  text = text.replace(/\bdidn't\b/gi, "did not");
  text = text.replace(/\bwasn't\b/gi, "was not");
  text = text.replace(/\bweren't\b/gi, "were not");
  text = text.replace(/\b(\w+)'d(?=\s+\w+(ed|en)\b)/gi, "$1 had");
  text = text.replace(/\b(\w+)'d\b/gi, "$1 would");
  // Ambiguous "'s" will be uniformly expanded to "is" (e.g., "Mark's" becomes "mark is")
  text = text.replace(/\b(\w+)'s\b/gi, "$1 is");
  return text;
}

function normalize(text) {
  // 1) Convert curly quotes ’ or ‘ to straight '.
  //    This ensures 'cousin’s' becomes 'cousin's'.
  text = text.replace(/[’‘]/g, "'");

  // 2) Expand common contractions using your existing function.
  text = normalizeContractions(text);

  // 3) Remove punctuation if desired (this will remove commas, periods, etc. 
  //    but leave apostrophes for the 's expansions).
  text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  // 4) Collapse multiple spaces and trim.
  text = text.replace(/\s{2,}/g, " ").trim();

  // 5) Convert to lowercase.
  text = text.toLowerCase();

  return text;
}

function isAnswerCorrect(userAnswer, acceptedAnswers) {
  const normUser = normalize(userAnswer);
  return acceptedAnswers.some(ans => normalize(ans) === normUser);
}

class KeywordTransformationGame {
  constructor(transformations) {
    this.allTransformations = transformations;
    this.selectedChallenges = [];
    this.score = 0;
    this.initFilterUI();
  }

  initFilterUI() {
  document.body.innerHTML = `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
      }
      body {
        font-family: 'Poppins', sans-serif;
        color: white;
        text-align: center;
        background: linear-gradient(135deg, #2E3192, #1BFFFF) no-repeat center center fixed;
        background-size: cover;
      }
      #filter-container {
        max-width: 600px;
        margin: auto;
        background: rgba(0,0,0,0.8);
        padding: 30px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        margin-top: 5%;
      }
      /* New title container to fit the game box */
      #title-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }
      #menu-image {
        max-width: 75%; /* Scales with the container */
        height: auto;
      }
      #title-container h1 {
        font-size: 2em; /* Adjust as needed */
        margin-top: 10px;
      }
      #filter-container h1 {
        margin-bottom: 20px;
        font-size: 2em;
        text-shadow: 1px 1px 5px rgba(0,0,0,0.5);
      }
      #filter-container p {
        margin: 10px 0 5px;
        font-weight: 600;
      }
      #filter-container button {
        padding: 12px 24px;
        font-size: 16px;
        margin: 10px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #000;
        transition: background 0.3s ease, transform 0.2s ease;
      }
      #filter-container button:hover {
        background: linear-gradient(135deg, #FFA500, #FFD700);
        transform: translateY(-2px);
      }
      #filter-container button:active {
        transform: translateY(1px);
      }
      /* Styles for level checkboxes */
      #levelCheckboxes {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 20px;
      }
      #levelCheckboxes label {
        font-size: 16px;
      }
      /* Shared styles for both select elements */
      #filter-container select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-color: #333;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 0.5em 2.5em 0.5em 0.5em;
        font-size: 16px;
        cursor: pointer;
        outline: none;
        background-image: url("data:image/svg+xml,%3Csvg fill='%23FFF' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75em center;
        background-size: 1em;
        width: 60%;
      }
      #filter-container select:focus {
        border-color: #999;
      }
      /* Styles for the tag search input */
      #tagSearch {
        margin-bottom: 10px;
        padding: 0.5em;
        width: 60%;
        font-size: 16px;
        border: 1px solid #555;
        border-radius: 4px;
        background-color: #333;
        color: #fff;
        outline: none;
      }
      #addTagBtn {
  background: linear-gradient(135deg, #FFFFFF 0%, #C0C0C0 50%, #E5E4E2 100%) !important;
  color: #000;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}
#addTagBtn:hover {
  background: linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 50%, #FFFFFF 100%) !important;
  transform: translateY(-2px);
}
#addTagBtn:active {
  transform: translateY(1px);
}
    </style>
    <div id="filter-container">
      <!-- Title container with image and title text -->
      <div id="title-container">
        <img id="menu-image" src="images/key-puzzle.png" alt="Keyword Transformation Game">
      </div>

      <p>Select Level(s):</p>
      <div id="levelCheckboxes">
        <label><input type="checkbox" value="B2" checked> B2</label>
        <label><input type="checkbox" value="C1" checked> C1</label>
        <label><input type="checkbox" value="C2" checked> C2</label>
      </div>
      <p>Select Tag:</p>
      <input type="text" id="tagSearch" placeholder="Search tags...">
      <select id="tagSelect">
        <option value="all">All Tags</option>
      </select>
      <!-- New "Add Tag" button -->
      <button id="addTagBtn">Add Tag?</button>
      <!-- Container for the additional tag dropdown (hidden by default) -->
      <div id="additionalTagContainer" style="display:none;">
        <p>Select Additional Tag:</p>
        <select id="secondaryTagSelect">
          <option value="none">None</option>
        </select>
      </div>
      <br>
      <button id="startGameBtn">Start Game</button>
    </div>
  `;
  
  // Attach listeners for level checkboxes
  const checkboxes = document.querySelectorAll("#levelCheckboxes input[type='checkbox']");
  checkboxes.forEach(chk => {
    chk.addEventListener("change", () => this.updateTagOptions());
  });

  // Attach listener for the "Add Tag?" button to toggle the secondary tag dropdown
  document.getElementById("addTagBtn").addEventListener("click", () => {
    const container = document.getElementById("additionalTagContainer");
    if (container.style.display === "none") {
      container.style.display = "block";
      this.updateSecondaryTagOptions(); // Populate the secondary tag dropdown
    } else {
      container.style.display = "none";
    }
  });

  // Attach listener to update secondary tag options when the primary tag changes
  document.getElementById("tagSelect").addEventListener("change", () => this.updateSecondaryTagOptions());

  // Attach the start game button listener
  document.getElementById("startGameBtn").addEventListener("click", () => this.startGame());
  
  // Initialize the tag options
  this.updateTagOptions();
  
  document.getElementById("tagSearch").addEventListener("input", function() {
  const filter = this.value.toLowerCase();
  const tagSelect = document.getElementById("tagSelect");
  // Rebuild the options list using the full tag array
  tagSelect.innerHTML = `<option value="all">All Tags</option>`;
  // Use the stored array from the game instance; assuming "game" is your instance
  const fullTags = game.fullTagArray || [];
  fullTags.forEach(tag => {
    if (tag.toLowerCase().includes(filter)) {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagSelect.appendChild(option);
    }
  });
});
}

  updateTagOptions() {
  const checkboxes = document.querySelectorAll("#levelCheckboxes input[type='checkbox']");
  let selectedLevels = Array.from(checkboxes)
    .filter(chk => chk.checked)
    .map(chk => chk.value.toLowerCase());
  if (selectedLevels.length === 0) {
    selectedLevels = ["b2", "c1", "c2"];
  }

  // Filter transformations based on selected levels
  let relevant = this.allTransformations.filter(t => {
    let tags = t.tags.split(",").map(s => s.trim().toLowerCase());
    return selectedLevels.some(level => tags.includes(level));
  });

  // Build a set of non-level tags
  let tagSet = new Set();
  relevant.forEach(t => {
    t.tags.split(",")
      .map(s => s.trim().toLowerCase())
      .filter(s => s && !["b2", "c1", "c2"].includes(s))
      .forEach(tag => tagSet.add(tag));
  });

  const tagArray = Array.from(tagSet).sort();

  // Step 1: Save the full tag array for later use
  this.fullTagArray = tagArray;

  const tagSelect = document.getElementById("tagSelect");
  tagSelect.innerHTML = `<option value="all">All Tags</option>`;
  tagArray.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagSelect.appendChild(option);
  });
}

  updateSecondaryTagOptions() {
  const primaryTag = document.getElementById("tagSelect").value;
  // If the primary tag is "all", hide the secondary dropdown.
  if (primaryTag === "all") {
    document.getElementById("additionalTagContainer").style.display = "none";
    return;
  }
  
  // Get the selected levels.
  const checkboxes = document.querySelectorAll("#levelCheckboxes input[type='checkbox']");
  let selectedLevels = Array.from(checkboxes)
    .filter(chk => chk.checked)
    .map(chk => chk.value.toLowerCase());
  if (selectedLevels.length === 0) {
    selectedLevels = ["b2", "c1", "c2"];
  }
  
  // Filter transformations that have the primary tag.
  let relevant = this.allTransformations.filter(t => {
    let tags = t.tags.split(",").map(s => s.trim().toLowerCase());
    return selectedLevels.some(level => tags.includes(level)) &&
           tags.includes(primaryTag.toLowerCase());
  });
  
  // Build a set of additional tags from these transformations (excluding levels and the primary tag).
  let tagSet = new Set();
  relevant.forEach(t => {
    t.tags.split(",")
      .map(s => s.trim().toLowerCase())
      .forEach(tag => {
        if (tag && !["b2", "c1", "c2"].includes(tag) && tag !== primaryTag.toLowerCase()) {
          tagSet.add(tag);
        }
      });
  });
  
  const tagArray = Array.from(tagSet).sort();
  
  // Populate the secondary tag select element.
  const secondarySelect = document.getElementById("secondaryTagSelect");
  secondarySelect.innerHTML = `<option value="none">None</option>`;
  tagArray.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    secondarySelect.appendChild(option);
  });
}

  startGame() {
  const checkboxes = document.querySelectorAll("#levelCheckboxes input[type='checkbox']");
  let selectedLevels = Array.from(checkboxes)
    .filter(chk => chk.checked)
    .map(chk => chk.value.toLowerCase());
  if (selectedLevels.length === 0) {
    selectedLevels = ["b2", "c1", "c2"];
  }
  
  let filtered = this.allTransformations.filter(t => {
    let tags = t.tags.split(",").map(s => s.trim().toLowerCase());
    return selectedLevels.some(level => tags.includes(level));
  });
  
  // Filter by primary tag if one is selected.
  const primaryTag = document.getElementById("tagSelect").value;
  if (primaryTag !== "all") {
    filtered = filtered.filter(t => {
      let tags = t.tags.split(",").map(s => s.trim().toLowerCase());
      return tags.includes(primaryTag.toLowerCase());
    });
  }
  
  // Additionally filter by the secondary tag if the dropdown is visible and a valid tag is chosen.
  const secondarySelect = document.getElementById("secondaryTagSelect");
  if (secondarySelect && secondarySelect.style.display !== "none") {
    const secondaryTag = secondarySelect.value;
    if (secondaryTag && secondaryTag !== "none") {
      filtered = filtered.filter(t => {
        let tags = t.tags.split(",").map(s => s.trim().toLowerCase());
        return tags.includes(secondaryTag.toLowerCase());
      });
    }
  }
  
  if (filtered.length === 0) {
    alert("No transformations found for the selected filters.");
    return;
  }
  
  this.currentPool = filtered;
  this.selectedChallenges = this.shuffle(filtered).slice(0, 8);
  this.score = 0;
  this.initGameUI();
}

shareSet() {
  // Get the current set of challenges to share
  const setToShare = this.selectedChallenges;

  // Add the set to Firestore
  addDoc(collection(db, "sharedSets"), {
    set: setToShare,
    createdAt: serverTimestamp()
  })
  .then(docRef => {
    // Construct the shareable URL
    const shareUrl = `${window.location.origin}${window.location.pathname}?shareId=${docRef.id}`;

    // Get the container for the QR code and link
    const qrContainer = document.getElementById("qrCodeContainer");
    // Clear any previous content
    qrContainer.innerHTML = "";

    // Create a styled box for the QR code, centered content
    qrContainer.insertAdjacentHTML('beforeend', `
      <div style="
        margin-top: 20px; 
        padding: 20px; 
        background-color: rgba(0, 0, 0, 0.7); 
        border-radius: 10px; 
        text-align: center;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
      ">
        <p style="font-size:1.2em; margin-bottom: 10px;">
          Scan this QR code to play the set:
        </p>
        <div id="qrCodeBox" style="display: inline-block;"></div>
        <p style="margin-top: 10px; font-size:14px;">
          <a href="${shareUrl}" target="_blank" style="color: white; text-decoration: underline;">
            ${shareUrl}
          </a>
        </p>
      </div>
    `);

    // Now generate the QR code inside the #qrCodeBox
    const qrCodeBox = document.getElementById("qrCodeBox");
    new QRCode(qrCodeBox, {
      text: shareUrl,
      width: 128,
      height: 128
    });
  })
  .catch(error => {
    console.error("Error sharing set: ", error);
  });
}


  checkForSharedSet() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('shareId');
  if (shareId) {
    getDoc(doc(db, "sharedSets", shareId))
      .then(docSnap => {
        if (docSnap.exists()) {
          const sharedSet = docSnap.data().set;
          console.log("Shared set:", sharedSet);
          // For example, you might want to instantiate your game with this set:
          this.selectedChallenges = sharedSet;
          this.initGameUI();
        } else {
          console.log("No shared set found with this ID.");
        }
      })
      .catch(error => {
        console.error("Error fetching shared set: ", error);
      });
  }
}

  initGameUI() {
  let challengesHTML = "";
  
  this.selectedChallenges.forEach((challenge, index) => {
    // Highlight key word in the full sentence (only first occurrence)
    let highlightedFull = challenge.fullSentence.replace(
      new RegExp(`\\b(${challenge.keyWord})\\b`, "i"),
      `<span class="highlight">$1</span>`
    );

    // Determine level from tags and set expected word count
    let levelTag = challenge.tags
      .split(",")
      .map(s => s.trim().toLowerCase())
      .find(t => t === "c1" || t === "b2" || t === "c2");

    // Build a display string like "B2: 2-5 words"
    let displayLevel = "";
    if (levelTag === "b2") {
      displayLevel = "B2: 2-5 words";
    } else if (levelTag === "c1") {
      displayLevel = "C1: 3-7 words";
    } else if (levelTag === "c2") {
      displayLevel = "C2: 3-8 words";
    }

    challengesHTML += `
      <div class="challenge" style="margin-bottom:20px; padding:10px; background: rgba(0,0,0,0.6); border-radius:5px;">
        <!-- Remove "Full sentence:" label, just show the sentence -->
        <p class="fullSentence">${highlightedFull}</p>

        <!-- Keep the keyword display -->
        <p class="keyword" style="font-size:1.5em; font-weight:bold;">
          <span class="keyword-label" style="color: #235a8c;">Key word:</span>
          <span class="keyword-value" style="color: #FFD700;"> ${String(challenge.keyWord).toLowerCase()}</span>
        </p>

        <!-- Show the gap fill + level info in red -->
        <p class="gapFillPrompt">
  ${challenge.gapFill} 
  <strong style="color: #FF5733;">(${displayLevel})</strong>
</p>

        <!-- Removed the "Expected answer length" line entirely -->

        <input type="text" id="answer-${index}" placeholder="Enter missing words">
        <button id="submit-${index}">Submit Answer</button>
        <p id="feedback-${index}" style="margin:5px 0;"></p>
      </div>
    `;
  });
    
    document.body.innerHTML = `
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(135deg, #2E3192, #1BFFFF);
        color: white;
        text-align: center;
        margin: 0;
        padding: 20px;
      }
      #game-container {
        max-width: 600px;
        margin: auto;
        background: rgba(0,0,0,0.8);
        padding: 20px;
        border-radius: 10px;
      }
      /* Title container styling matching the main title page */
      #title-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 1px;
      }
      #challenge-image {
        max-width: 70%; /* Ensures the image scales with the container */
        height: auto;
      }
      input, button {
        padding: 10px;
        font-size: 16px;
        margin: 10px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
      }
      input[type="text"] {
        width: 80%;
      }
      .highlight {
        font-weight: bold;
        color: #FFD700;
      }
      /* FEEDBACK CLASSES */
      .submitted-correct {
        background-color: #d4edda;
        color: #155724;
      }
      .submitted-incorrect {
        background-color: #f8d7da;
        color: #721c24;
      }
      .correct-feedback {
        font-weight: bold;
        color: green;
      }
      .incorrect-feedback {
        font-weight: bold;
        color: red;
      }

      /* BUTTON STYLES */
      /* 1) Download Report button */
      #downloadReport {
        background: linear-gradient(135deg, #FFA500, #FFD700);
        color: #000;
        transition: background 0.3s ease, transform 0.2s ease;
      }
      #downloadReport:hover {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        transform: translateY(-2px);
      }
      #downloadReport:active {
        transform: translateY(1px);
      }

      /* 2) Review Mistakes button */
      #reviewMistakes {
        background: linear-gradient(135deg, #32CD32, #228B22);
        color: #fff;
        transition: background 0.3s ease, transform 0.2s ease;
      }
      #reviewMistakes:hover {
        background: linear-gradient(135deg, #228B22, #32CD32);
        transform: translateY(-2px);
      }
      #reviewMistakes:active {
        transform: translateY(1px);
      }

      /* 3) Submit buttons for each challenge */
      .challenge button {
  background: linear-gradient(135deg, #80cbc4, #4db6ac); /* softer teal tones */
  color: #000; /* black text for contrast */
  transition: background 0.3s ease, transform 0.2s ease;
}

.challenge button:hover {
  background: linear-gradient(135deg, #4db6ac, #80cbc4);
  transform: translateY(-2px);
}

.challenge button:active {
  transform: translateY(1px);
}
#regenerateBtn,
#mainMenuBtn {
  background: linear-gradient(135deg, #FFA500, #FFD700);
  color: #000;
  transition: background 0.3s ease, transform 0.2s ease;
}
#regenerateBtn:hover,
#mainMenuBtn:hover {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  transform: translateY(-2px);
}
#regenerateBtn:active,
#mainMenuBtn:active {
  transform: translateY(1px);
}
/* Share Set button - a playful pink–purple surprise! */
#shareSetBtn {
  background: linear-gradient(135deg, #FF69B4, #8A2BE2);
  color: #fff;
  transition: background 0.3s ease, transform 0.2s ease;
}
#shareSetBtn:hover {
  background: linear-gradient(135deg, #8A2BE2, #FF69B4);
  transform: translateY(-2px);
}
#shareSetBtn:active {
  transform: translateY(1px);
}
// In the UI markup (inside your game container, along with your other buttons)
<button id="shareSetBtn">Share Set</button>
    </style>
    <div id="game-container">
      <!-- Title container with the new image fixed to the game box -->
      <div id="title-container">
        <img id="challenge-image" src="images/key-puzzle-challenge.png" alt="Transformation Challenge">
      </div>
      ${challengesHTML}
      <p>Score: <span id="score">0</span></p>
      <button id="downloadReport">Download Report</button>
      <button id="reviewMistakes">Review Mistakes</button>
      <button id="regenerateBtn">Regenerate Sentences</button>
      <button id="mainMenuBtn">Main Menu</button>
      <button id="shareSetBtn">Share Set</button>
      <!-- Container for the QR Code -->
      <div id="qrCodeContainer" style="margin-top:20px;"></div>
    </div>
  `;

  // Standard logic for attaching event listeners
  document.getElementById("downloadReport")
          .addEventListener("click", () => this.downloadReport());
  document.getElementById("reviewMistakes")
          .addEventListener("click", () => this.reviewMistakes());

  // Attach submit logic for each challenge
  this.selectedChallenges.forEach((_, index) => {
    const submitBtn = document.getElementById(`submit-${index}`);
    const inputEl = document.getElementById(`answer-${index}`);

    submitBtn.addEventListener("click", () => this.checkAnswer(index));
    inputEl.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        this.checkAnswer(index);
      }
    });
  });
  // NEW LISTENERS:
  document.getElementById("regenerateBtn").addEventListener("click", () => {
    // This assumes that this.currentPool was saved in startGame() after filtering
    this.selectedChallenges = this.shuffle(this.currentPool).slice(0, 8);
    this.score = 0;
    this.initGameUI();
  });

  document.getElementById("mainMenuBtn").addEventListener("click", () => {
    this.initFilterUI();
  });

  // NEW: Add the event listener for the Share Set button.
  document.getElementById("shareSetBtn").addEventListener("click", () => {
    this.shareSet();
  });

  // Attach listeners for downloadReport and reviewMistakes as before
  document.getElementById("downloadReport").addEventListener("click", () => this.downloadReport());
  document.getElementById("reviewMistakes").addEventListener("click", () => this.reviewMistakes());
}

checkAnswer(index) {
  const inputEl = document.getElementById(`answer-${index}`);
  // Prevent re-submission if already disabled.
  if (inputEl.disabled) return;
  
  const userAnswer = inputEl.value;
  const challenge = this.selectedChallenges[index];
  
  // If challenge.answer is an array, use it; otherwise, split by '/'
  let acceptedAnswers = Array.isArray(challenge.answer)
    ? challenge.answer
    : challenge.answer.split('/').map(a => a.trim());
    
  const feedbackEl = document.getElementById(`feedback-${index}`);
  
  if (isAnswerCorrect(userAnswer, acceptedAnswers)) {
    feedbackEl.textContent = "Correct!";
    feedbackEl.classList.add("correct-feedback");
    inputEl.classList.add("submitted-correct");
    this.score += 1;
    challenge.wasCorrect = true;
  } else {
    feedbackEl.textContent = "Incorrect. Correct answer: " + acceptedAnswers.join(" / ");
    feedbackEl.classList.add("incorrect-feedback");
    inputEl.classList.add("submitted-incorrect");
    challenge.wasCorrect = false;
  }
  // Record the player's answer
  challenge.userAnswer = userAnswer;
  
  document.getElementById("score").textContent = this.score;
  
  // Disable input and button for this challenge.
  inputEl.disabled = true;
  document.getElementById(`submit-${index}`).disabled = true;
}

downloadReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Build rows for the PDF table: each row contains challenge data.
  let tableRows = [];
  this.selectedChallenges.forEach((challenge, index) => {
    tableRows.push([
      index + 1,
      challenge.fullSentence,
      challenge.gapFill,
      challenge.userAnswer || "",
      Array.isArray(challenge.answer) ? challenge.answer.join(" / ") : challenge.answer,
      challenge.wasCorrect ? "Correct" : "Incorrect"
    ]);
  });

  // Add a title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 150);
  doc.text("Keyword Transformation Game Report", 14, 20);

  // Build the table using AutoTable with conditional styling for "Your Answer"
  doc.autoTable({
    startY: 30,
    head: [["#", "Full Sentence", "Gap Fill", "Your Answer", "Correct Answer", "Result"]],
    body: tableRows,
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    bodyStyles: { fillColor: [216, 216, 216], textColor: 0 },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 10, right: 10 },
    styles: { fontSize: 10, cellPadding: 3 },
    didParseCell: function(data) {
      if (data.column.index === 3) { // "Your Answer" column
        let result = data.row.raw[5]; // "Result" column value
        if (result === "Correct") {
          data.cell.styles.textColor = [0, 128, 0]; // green
        } else if (result === "Incorrect") {
          data.cell.styles.textColor = [255, 0, 0]; // red
        }
      }
    }
  });

  // Save the PDF
  doc.save("Transformation_Game_Report.pdf");
}

reviewMistakes() {
  // Filter challenges answered incorrectly
  const mistakes = this.selectedChallenges.filter(challenge => !challenge.wasCorrect);
  if (mistakes.length === 0) {
    alert("No mistakes to review!");
    return;
  }
  
  // Build HTML for each mistake challenge
  let reviewHTML = "";
  mistakes.forEach((challenge, index) => {
    // Highlight key word in the full sentence
    let highlightedFull = challenge.fullSentence.replace(
      new RegExp(`\\b(${challenge.keyWord})\\b`, "i"),
      `<span class="highlight">$1</span>`
    );
  
    // Determine level and expected word count (as before)
    let levelTag = challenge.tags
      .split(",")
      .map(s => s.trim().toLowerCase())
      .find(t => t === "c1" || t === "b2" || t === "c2");
  
    let expectedLength = "";
    if (levelTag === "c1") {
      expectedLength = "3-7 words";
    } else if (levelTag === "b2") {
      expectedLength = "2-5 words";
    } else if (levelTag === "c2") {
      expectedLength = "3-8 words";
    }
  
    reviewHTML += `
      <div class="challenge" style="margin-bottom:20px; padding:10px; background: rgba(0,0,0,0.6); border-radius:5px;">
        <p class="fullSentence">Full sentence: ${highlightedFull}</p>
        <p class="keyword" style="font-size:1.5em; font-weight:bold;">
           <span class="keyword-label" style="color: #235a8c;">Key word:</span>
           <span class="keyword-value" style="color: #FFD700;"> ${challenge.keyWord.toLowerCase()}</span>
        </p>
        <p class="gapFillPrompt">Fill in the blank: ${challenge.gapFill}</p>
        <p class="word-spec" style="color: #FF5733;">Expected answer length: ${expectedLength}</p>
        <input type="text" id="review-answer-${index}" placeholder="Enter missing words">
        <button id="review-submit-${index}">Submit Answer</button>
        <p id="review-feedback-${index}" style="margin:5px 0;"></p>
      </div>
    `;
  });
  
  // Render the review UI. (We include a "Back" button to return to the main UI and the Download Report button.)
  document.body.innerHTML = `
  <style>
    /* Reuse the same button styles as the game UI */
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #2E3192, #1BFFFF);
      color: white;
      text-align: center;
      margin: 0;
      padding: 20px;
    }
    #review-container {
      max-width: 600px;
      margin: auto;
      background: rgba(0,0,0,0.8);
      padding: 20px;
      border-radius: 10px;
    }
    input, button {
      padding: 10px;
      font-size: 16px;
      margin: 10px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
    }
    input[type="text"] {
      width: 80%;
    }
    .highlight {
      font-weight: bold;
      color: #FFD700;
    }
    .submitted-correct {
      background-color: #d4edda;
      color: #155724;
    }
    .submitted-incorrect {
      background-color: #f8d7da;
      color: #721c24;
    }
    .correct-feedback {
      font-weight: bold;
      color: green;
    }
    .incorrect-feedback {
      font-weight: bold;
      color: red;
    }
    /* Download Report button (if present) */
    #downloadReport {
      background: linear-gradient(135deg, #FFA500, #FFD700);
      color: #000;
      transition: background 0.3s ease, transform 0.2s ease;
    }
    #downloadReport:hover {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      transform: translateY(-2px);
    }
    #downloadReport:active {
      transform: translateY(1px);
    }
    /* Review screen submit buttons */
    #backToMain, #downloadReport {
      /* You might want to ensure these buttons also follow the same style */
      background: linear-gradient(135deg, #32CD32, #228B22);
      color: #fff;
      transition: background 0.3s ease, transform 0.2s ease;
    }
    #backToMain:hover, #downloadReport:hover {
      background: linear-gradient(135deg, #228B22, #32CD32);
      transform: translateY(-2px);
    }
    #backToMain:active, #downloadReport:active {
      transform: translateY(1px);
    }
    /* And the challenge submit buttons in the review screen */
    .challenge button {
      background: linear-gradient(135deg, #80cbc4, #4db6ac); /* same softer teal tones */
      color: #000;
      transition: background 0.3s ease, transform 0.2s ease;
    }
    .challenge button:hover {
      background: linear-gradient(135deg, #4db6ac, #80cbc4);
      transform: translateY(-2px);
    }
    .challenge button:active {
      transform: translateY(1px);
    }
  </style>
  <div id="review-container">
    <h1>Review Mistakes</h1>
    ${reviewHTML}
    <button id="backToMain">Back</button>
    <button id="downloadReport">Download Report</button>
  </div>
`;
  
  // Attach event listeners for each review challenge's submit button using a separate check method.
  mistakes.forEach((challenge, index) => {
    const submitBtn = document.getElementById(`review-submit-${index}`);
    const inputEl = document.getElementById(`review-answer-${index}`);
    
    submitBtn.addEventListener("click", () => this.checkReviewAnswer(challenge, index));
    inputEl.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        this.checkReviewAnswer(challenge, index);
      }
    });
  });
  
  // "Back" button returns to the main game UI (the original report remains unchanged)
  document.getElementById("backToMain").addEventListener("click", () => this.initGameUI());
  document.getElementById("downloadReport").addEventListener("click", () => this.downloadReport());
}

checkReviewAnswer(challenge, index) {
  const inputEl = document.getElementById(`review-answer-${index}`);
  if (inputEl.disabled) return;
  
  const userAnswer = inputEl.value;
  let acceptedAnswers = Array.isArray(challenge.answer)
    ? challenge.answer
    : challenge.answer.split('/').map(a => a.trim());
    
  const feedbackEl = document.getElementById(`review-feedback-${index}`);
  
  if (isAnswerCorrect(userAnswer, acceptedAnswers)) {
    feedbackEl.textContent = "Correct!";
    feedbackEl.classList.add("correct-feedback");
    inputEl.classList.add("submitted-correct");
  } else {
    feedbackEl.textContent = "Incorrect. Correct answer: " + acceptedAnswers.join(" / ");
    feedbackEl.classList.add("incorrect-feedback");
    inputEl.classList.add("submitted-incorrect");
  }
  // Disable the input and button for this review challenge
  inputEl.disabled = true;
  document.getElementById(`review-submit-${index}`).disabled = true;
}

  // <-- ADD THIS METHOD HERE INSIDE THE CLASS
  shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }
}



const transformations = [
  {
    keyWord: "gaps",
    gapFill: "There are very __________________ when it comes to geography.",
    fullSentence: "When it comes to geography, there is very little that Luis doesn’t know.",
    answer: ["few gaps in Luis's knowledge", "few gaps in Luis' knowledge"],
    tags: "C1, noun phrases, quantifiers"
  },
  {
    keyWord: "must",
    gapFill: "Daniel __________________ taking his sister to the concert.",
    fullSentence: "Daniel was going to take his sister to the concert, but it looks as if he’s forgotten.",
    answer: ["must have forgotten about", "must have forgotten he was", "must have forgotten that he was"],
    tags: "C1, modals, past modals, probability"
  },
  {
    keyWord: "loss",
    gapFill: "Removing the fence has __________________ for the neighbours.",
    fullSentence: "The fence was removed and, as a result, the neighbours no longer feel they have privacy.",
    answer: ["resulted in a loss of privacy", "resulted in the loss of privacy", "led to a loss of privacy", "led to the loss of privacy", "caused a loss of privacy", "caused the loss of privacy", "meant a loss of privacy", "meant the loss of privacy"],
    tags: "C1, result, noun phrases, linking"
  },
  {
    keyWord: "intention",
    gapFill: "Sasha had absolutely no __________________ to the flat until the heating was fixed.",
    fullSentence: "Sasha definitely didn’t plan to return to the flat until the heating was fixed.",
    answer: ["intention of returning", "intention at all of returning", "intention of going back", "intention at all of going back", "intention whatsoever of returning", "intention whatsoever of going back"],
    tags: "C1, verb patterns, fixed phrase, formal"
  },
  {
    keyWord: "changed",
    gapFill: "Irene seems __________________ joining us this evening.",
    fullSentence: "Irene was going to join us this evening, but it seems she’s decided not to.",
    answer: "to have changed her mind about",
    tags: "C1, perfect, verb patterns, gerunds and infinitives"
  },
  {
    keyWord: "impression",
    gapFill: "Alessio was under the __________________ be easy to pass the driving test.",
    fullSentence: "Alessio thought the driving test would be easy to pass.",
    answer: ["impression it would", "impression that it would"],
    tags: "C1, fixed phrase, future"
  },
  {
    keyWord: "reputation",
    gapFill: "Among her colleagues, Dr Lee soon gained __________________ a skilled negotiator.",
    fullSentence: "Dr Lee’s negotiating skills quickly impressed her colleagues.",
    answer: ["a reputation for being", "an impressive reputation for being", "the reputation for being", "the reputation of being", "the impressive reputation of being", "a reputation of being"],
    tags: "C1, noun phrases, fixed phrase, prepositions"
  },
  {
    keyWord: "help",
    gapFill: "But __________________, I would never have got the sofa through the door.",
    fullSentence: "If you hadn’t helped me, I would never have got the sofa through the door.",
    answer: ["for your help", "for the help you gave me", "for the help that you gave me", "for the help which you gave me"],
    tags: "C1, fixed phrase, conditionals"
  },
  {
    keyWord: "beaten",
    gapFill: "Most fans think France __________________ the final.",
    fullSentence: "Most fans think Brazil will win the final against France.",
    answer: ["will be beaten by Brazil in", "will get beaten by Brazil in"],
    tags: "C1, passive voice, future"
  },
  {
    keyWord: "prevent",
    gapFill: "The alarm system is designed to __________________ stolen during the night.",
    fullSentence: "The alarm system is there so that no valuables can be stolen during the night.",
    answer: ["prevent valuables from being", "prevent valuables from getting", "prevent valuables being", "prevent valuables getting"],
    tags: "C1, passive voice, verb patterns, gerunds and infinitives"
  },
  {
    keyWord: "avoid",
    gapFill: "The hacker used software in __________________ any trace of the attack.",
    fullSentence: "The hacker used special software so as not to leave any trace of the attack.",
    answer: ["order to avoid leaving", "an attempt to avoid leaving", "effort to avoid leaving"],
    tags: "C1, verb patterns, purpose, linking, gerunds and infinitives"
  },
  {
    keyWord: "can",
    gapFill: "Whether your phone __________________ not, you’ll still be charged for the repair service.",
    fullSentence: "Even if your phone is beyond repair, you’ll still be charged for the service.",
    answer: ["can be repaired or", "can be fixed or", "can be mended or"],
    tags: "C1, passive voice, modal verbs, possibility"
  },
  {
    keyWord: "manage",
    gapFill: "I __________________ hold of Javier before the deadline.",
    fullSentence: "I had no success in contacting Javier before the deadline.",
    answer: ["couldn't manage to get", "didn't manage to get"],
    tags: "C1, verb patterns, modal verbs, ability"
  },
  {
    keyWord: "turned",
    gapFill: "Because of the metro strike, not __________________ to the event on time.",
    fullSentence: "Because of the metro strike, all of the guests arrived late to the event.",
    answer: ["even one guest turned up", "even one of the guests turned up", "a single guest turned up", "one of the guests turned up"],
    tags: "C1, quantifiers, exceptions"
  },
  {
    keyWord: "charge",
    gapFill: "Lena should __________________ of leading the tour group on her first day.",
    fullSentence: "It was a mistake to make Lena responsible for leading the tour group on her first day.",
    answer: ["not have been put in charge", "never have been put in charge", "not have been left in charge", "never have been left in charge", "not have been placed in charge", "never have been placed in charge"],
    tags: "C1, passive voice, past modals, modals"
  },
  {
    keyWord: "forward",
    gapFill: "A suggestion has __________________ the school’s uniform policy.",
    fullSentence: "Someone has suggested changing the school’s uniform policy.",
    answer: ["been put forward to change", "been put forward for changing", "been put forward about changing"],
    tags: "C1, passive voice, phrasal verbs"
  },
  {
    keyWord: "crossed",
    gapFill: "The guide says that we __________________ in less than a week.",
    fullSentence: "The guide says it will take us less than a week to cross the mountains.",
    answer: "will have crossed the mountains",
    tags: "C1, future, perfect"
  },
  {
    keyWord: "reached",
    gapFill: "By the end of the discussion, an __________________ the proposed changes.",
    fullSentence: "By the end of the discussion, the team had agreed on the proposed changes.",
    answer: ["agreement had been reached about", "agreement had been reached on", "agreement was reached about", "agreement was reached on"],
    tags: "C1, passive voice, noun phrases, formal"
  },
  {
    keyWord: "managed",
    gapFill: "Despite __________________ pass the exam.",
    fullSentence: "Maya succeeded in passing the exam, even though she had a cold.",
    answer: ["having a cold, Maya managed to", "her cold, Maya managed to"],
    tags: "C1, concession, ability, linking"
  },
  {
    keyWord: "heard",
    gapFill: "Among my students, very __________________ the author James Baldwin.",
    fullSentence: "Hardly any of my students know who James Baldwin is.",
    answer: ["few have heard of", "few of them have heard of", "few have heard about", "few of them have heard about"],
    tags: "C1, quantifiers, prepositions, perfect"
  },
  {
    keyWord: "not",
    gapFill: "There is absolutely __________________ to help her family.",
    fullSentence: "Emma would do anything at all to help her family.",
    answer: ["nothing that Emma would not do", "nothing which Emma would not do", "nothing Emma would not do"],
    tags: "C1, Quantifiers, modals"
  },
  {
    keyWord: "likelihood",
    gapFill: "There’s __________________ Max before he flies to Tokyo.",
    fullSentence: "I don’t think we’ll see Max before he flies to Tokyo.",
    answer: ["little likelihood of seeing", "little likelihood that we will see"],
    tags: "C1, probability, noun phrases, formal"
  },
  {
    keyWord: "first",
    gapFill: "Although Peter travels frequently, this __________________ he’s lost his suitcase.",
    fullSentence: "Although Peter travels frequently, he’s always losing his suitcase.",
    answer: ["is not the first time", "will not be the first time", "is not the first occasion", "will not be the first occasion"],
    tags: "C1, Linking"
  },
  {
    keyWord: "time",
    gapFill: "The train was on the point __________________ I arrived at the platform.",
    fullSentence: "When I finally got to the platform, the train was about to leave.",
    answer: ["of leaving by the time", "of leaving by the time that"],
    tags: "C1, Fixed phrase, prepositions"
  },
  {
    keyWord: "far",
    gapFill: "The meals in that restaurant are __________________ pay for.",
    fullSentence: "Olivia couldn’t possibly afford any of the meals in that restaurant.",
    answer: "far too expensive for Olivia to",
    tags: "C1, comparatives and superlatives, intensifiers"
  },
  {
    keyWord: "wonder",
    gapFill: "I __________________ her umbrella at home this morning.",
    fullSentence: "Could Sofia have forgotten her umbrella this morning?",
    answer: ["wonder if Sofia has left", "wonder if Sofia could have left", "wonder whether Sofia has left", "wonder whether Sofia could have left"],
    tags: "C1, modal verbs, past modals, indirect questions, questions"
  },
  {
    keyWord: "imposed",
    gapFill: "Tougher rules __________________ result of last year's accident.",
    fullSentence: "The accident last year led to the imposition of tougher safety rules.",
    answer: "have been imposed",
    tags: "C1, passive voice, result, linking"
  },
  {
    keyWord: "before",
    gapFill: "Why don’t __________________ to the football match?",
    fullSentence: "We could do our chores first and then go to the football match.",
    answer: ["we do our chores before going", "we finish our chores before going", "we do our chores before we go", "we finish our chores before we go", "we complete our chores before going", "we complete our chores before we go"],
    tags: "C1, gerunds and infinitives"
  },
  {
    keyWord: "account",
    gapFill: "I was shocked by my __________________ what had happened the day before.",
    fullSentence: "I was really shocked when my cousin told me what had happened the day before.",
    answer: "cousin’s account of",
    tags: "C1, noun phrases, formal, fixed phrase"
  },
  {
    keyWord: "since",
    gapFill: "It __________________ a woman first led a major space mission.",
    fullSentence: "A woman led a major space mission several decades ago.",
    answer: ["is several decades since", "has been several decades since"],
    tags: "C1, perfect, verb forms"
  },
  {
    keyWord: "takes",
    gapFill: "People often comment on the extent to __________________ her aunt.",
    fullSentence: "People often say that Jenny looks and behaves just like her aunt.",
    answer: "which Jenny takes after",
    tags: "C1, Relative clauses, phrasal verbs"
  },
  {
    keyWord: "agreement",
    gapFill: "By the end of the workshop, an __________________ how to proceed.",
    fullSentence: "By the end of the workshop, the group had agreed on the next steps.",
    answer: ["agreement had been reached about", "agreement had been reached on", "agreement was reached about", "agreement was reached on"],
    tags: "C1, passive voice, noun phrases, formal"
  },
    {
    "keyWord": "for",
    "gapFill": "By the end of the week, Samantha _____________________ two years.",
    "fullSentence": "By the end of the week, it will be two years since Samantha came to Paris.",
    "answer": ["will have been in Paris for", " will have lived in Paris for", "will have been living in Paris for"],
    "tags": "C1, future, perfect"
  },
  {
    "keyWord": "led",
    "gapFill": "Stormy weather _____________________ of a number of open-air shows.",
    "fullSentence": "A number of open-air shows had to be cancelled owing to the stormy weather.",
    "answer": ["led to the cancellation", "led to the cancelling"],
    "tags": "C1, result, linking"
  },
  {
    "keyWord": "reference",
    "gapFill": "During the meeting, the director _____________________ the training programme.",
    "fullSentence": "During the meeting, the director did not mention the training programme.",
    "answer": ["did not make reference to", "did not make any reference to", "made no reference to"],
    "tags": "C1, fixed phrase, formal"
  },
  {
    "keyWord": "clear",
    "gapFill": "Daniel made _____________________ willing to stay late at the office.",
    "fullSentence": "\"I'm not staying late again,\" said Daniel.",
    "answer": ["it clear he was not", "it clear that he was not"],
    "tags": "C1, fixed phrase"
  },
  {
    "keyWord": "point",
    "gapFill": "Jordan _____________________ the flat when the doorbell rang.",
    "fullSentence": "Jordan was just about to leave the flat when the doorbell rang.",
    "answer": "was on the point of leaving",
    "tags": "C1, fixed phrase, prepositions"
  },
  {
    "keyWord": "delight",
    "gapFill": "Much to _____________________ selected for the scholarship.",
    "fullSentence": "Ivy was thrilled to be selected for the scholarship.",
    "answer": ["her delight, Ivy was", "Ivy's delight, she was"],
    "tags": "C1, fronting, intensifiers"
  },
  {
    "keyWord": "result",
    "gapFill": "Attendance at the event _____________________ the ticket discount.",
    "fullSentence": "The ticket discount led to a rise in attendance at the event.",
    "answer": ["grew as a result of", "increased as a result of", "went up as a result of", "rose as a result of"],
    "tags": "C1, linking, result"
  },
  {
    "keyWord": "short",
    "gapFill": "Maya didn’t email back _____________________ time.",
    "fullSentence": "Maya would have emailed back if she had had more time.",
    "answer": ["because she was short of", "as she was short of", "since she was short of"],
    "tags": "C1, linking, fixed phrase"
  },
  {
    "keyWord": "moment",
    "gapFill": "Elliot said that _____________________ he arrived at the station.",
    "fullSentence": "Elliot promised to call as soon as he arrived at the station.",
    "answer": ["he would call the moment", "he would call the moment that", "he was going to call the moment that", "he was going to call the moment"],
    "tags": "C1, reported speech, linking"
  },
  {
    "keyWord": "intention",
    "gapFill": "Leo has _____________________ abroad this summer.",
    "fullSentence": "Leo doesn't plan to travel abroad this summer.",
    "answer": ["no intention of travelling", "no intention of traveling", "no intention of going"],
    "tags": "C1, prepositions, noun phrases, formal"
  },
  {
    "keyWord": "change",
    "gapFill": "Hopefully, there’ll be _____________________ better in the economy soon.",
    "fullSentence": "Hopefully, the economy will improve soon.",
    "answer": "a change for the",
    "tags": "C1, fixed phrase"
  },
  {
    "keyWord": "interested",
    "gapFill": "Liam asked his cousin whether _____________________ the new film at the cinema.",
    "fullSentence": "'Do you fancy seeing the new film at the cinema?' Liam asked his cousin.",
    "answer": ["he was interested in seeing", "he would be interested in seeing", "she was interested in seeing", "she would be interested in seeing"],
    "tags": "C1, gerunds and infinitives, reported speech"
  },
  {
    "keyWord": "heard",
    "gapFill": "I _____________________ ages.",
    "fullSentence": "Luis hasn't messaged me in ages.",
    "answer": ["have not heard from Luis for", "have not heard from Luis in", "have heard nothing from Luis for", "have heard nothing from Luis in", "have not heard anything from Luis for", "have not heard anything from Luis in"],
    "tags": "C1, perfect, prepositions"
  },
  {
    "keyWord": "every",
    "gapFill": "The team has _____________________ the tournament.",
    "fullSentence": "The team is almost certain to win the tournament.",
    "answer": "every chance of winning",
    "tags": "C1, fixed phrase, probability"
  },
  {
    "keyWord": "rise",
    "gapFill": "There _____________________ the cost of vegetables recently.",
    "fullSentence": "The cost of vegetables has gone up significantly recently.",
    "answer": ["has been a sharp rise in", "has been a significant rise in"],
    "tags": "C1, noun phrases, trends"
  },
  {
    "keyWord": "knowing",
    "gapFill": "If she fails the course, _____________________ what will happen next!",
    "fullSentence": "If she fails the course, who knows what will happen next!",
    "answer": "there is no knowing",
    "tags": "C1, fixed phrase, probability"
  },
  {
    "keyWord": "made",
    "gapFill": "Amira’s attitude to challenges has _____________________ us.",
    "fullSentence": "We've all been impressed by Amira’s attitude to challenges.",
    "answer": ["made a great impression on", "made a big impression on"],
    "tags": "C1, fixed phrase, prepositions"
  },
  {
    "keyWord": "so",
    "gapFill": "Jay’s startup _____________________ during its first year.",
    "fullSentence": "Jay’s startup didn’t achieve much success during its first year.",
    "answer": "was not so successful",
    "tags": "C1, comparatives and superlatives, intensifiers"
  },
  {
    "keyWord": "should",
    "gapFill": "I don’t think _____________________ your laptop to Ben.",
    "fullSentence": "It was probably a bad idea to lend your laptop to Ben.",
    "answer": "you should have lent",
    "tags": "C1, modal verbs, past modals"
  },
  {
  "keyWord": "failure",
  "gapFill": "The teacher found _____________________ the email quite unusual.",
  "fullSentence": "The teacher thought it was strange that Mark hadn't replied to the email.",
  "answer": ["mark's failure to answer", "mark's failure to reply to", "mark's failure to respond to"],
  "tags": "C1, fixed phrase, formal"
},
  {
    "keyWord": "find",
    "gapFill": "I doubt _____________________ to follow the instructions.",
    "fullSentence": "I doubt you'll have much trouble following the instructions.",
    "answer": ["you will find it difficult", "you will find it hard"],
    "tags": "C1, fixed phrase"
  },
  {
    "keyWord": "capable",
    "gapFill": "Experts think Leila _____________________ the national title in tennis.",
    "fullSentence": "Experts think Leila has the ability to win the national title in tennis.",
    "answer": "is capable of winning",
    "tags": "C1, ability, prepositions"
  },
  {
  "keyWord": "why",
  "gapFill": "Gina was asked to _____________________ the error.",
  "fullSentence": "Gina was asked to give an explanation for making the error.",
  "answer": ["explain why she made", "explain why she had made"],
  "tags": "C1, reported speech, verb patterns"
},
  {
    "keyWord": "made",
    "gapFill": "Omar _____________________ organising the school event.",
    "fullSentence": "They put Omar in charge of organising the school event.",
    "answer": "was made responsible for",
    "tags": "C1, passive voice, prepositions"
  },
  {
    "keyWord": "chance",
    "gapFill": "Do you think Arjun is in _____________________ the election?",
    "fullSentence": "Do you think Arjun is likely to win the election?",
    "answer": ["with a chance of winning", "with any chance of winning"],
    "tags": "C1, fixed phrase, probability, prepositions"
  },
  {
    "keyWord": "apart",
    "gapFill": "Theo claims that _____________________ knows about the surprise party.",
    "fullSentence": "Theo says that only his cousin knows about the surprise party.",
    "answer": ["apart from his cousin nobody", "apart from his cousin no one", "nobody apart from his cousin", "no one apart from his cousin"],
    "tags": "C1, exceptions, quantifiers"
  },
  {
    "keyWord": "high",
    "gapFill": "It's _____________________ her glasses repaired.",
    "fullSentence": "Rita really should get her glasses repaired.",
    "answer": ["high time Rita got", "high time Rita had"],
    "tags": "C1, fixed phrase, unreal forms"
  },
  {
    "keyWord": "hard",
    "gapFill": "No matter _____________________, the door wouldn’t open.",
    "fullSentence": "Despite all their efforts, the door wouldn’t open.",
    "answer": "how hard they tried",
    "tags": "C1, linking, concession"
  },
  {
    "keyWord": "concerned",
    "gapFill": "As _____________________, Daria knows everything.",
    "fullSentence": "When it comes to science fiction, Daria knows everything.",
    "answer": "far as science fiction is concerned",
    "tags": "C1, linking, fixed phrase"
  },
  {
    "keyWord": "occurred",
    "gapFill": "It _____________________ me for help.",
    "fullSentence": "Nina never thought of asking me for help.",
    "answer": ["never occurred to Nina to ask", "had never occurred to Nina to ask"],
    "tags": "C1, gerunds and infinitives"
  },
  {
    keyWord: "spite",
    fullSentence: "Cavalli painted exotic scenes of the jungle although he had never set foot outside Europe.",
    gapFill: "Cavalli painted exotic scenes of the jungle _______________________ set foot outside Europe.",
    answer: ["in spite of never having", "in spite of having never"],
    tags: "C1, concession, linking"
  },
  {
    keyWord: "only",
    fullSentence: "Zara didn’t fully grasp the situation until she listened to Luis’s voicemail.",
    gapFill: "It _______________________ she listened to Luis’s voicemail that Zara fully grasped the situation.",
    answer: ["was only when", "was only after", "was only once"],
    tags: "C1, concession, linking"
  },
  {
    keyWord: "prevent",
    fullSentence: "Due to its high cost, the new gadget might never gain widespread popularity.",
    gapFill: "The cost of the new gadget may _______________________ widely popular.",
    answer: ["prevent it from becoming", "prevent it from being", "prevent it becoming", "prevent it being"],
    tags: "C1, formal, verb patterns, gerunds and infinitives"
  },
  {
    keyWord: "offer",
    fullSentence: "The island is abundant in terms of biodiversity and untouched ecosystems.",
    gapFill: "The island has a lot _______________________ terms of biodiversity.",
    answer: "to offer in",
    tags: "C1, noun phrases, prepositions"
  },
  {
    keyWord: "rather",
    fullSentence: "Simone says she prefers to cook dinner by herself.",
    gapFill: "Simone says that _______________________ cook dinner with anyone else.",
    answer: ["she would rather not","she'd rather not"],
    tags: "C1, modal verbs, formal, gerunds and infinitives"
  },
  {
    keyWord: "deal",
    fullSentence: "To succeed as a nurse, you need to have an enormous amount of patience.",
    gapFill: "Being a nurse calls _______________________ these days.",
    answer: ["for a great deal of patience", "for a good deal of patience"],
    tags: "C1, phrasal verbs, noun phrases, quantifiers, formal"
  },
  {
    keyWord: "to",
    fullSentence: "The suspect insisted that he hadn't gone anywhere near the building that night.",
    gapFill: "The suspect claimed not _______________________ near the building that night.",
    answer: ["to have been", "to have been anywhere"],
    tags: "C1, verb patterns, gerunds and infinitives, perfect"
  },
  {
    keyWord: "get",
    fullSentence: "I need to renew my ID before travelling next month.",
    gapFill: "I need _______________________ before travelling next month.",
    answer: "to get my ID renewed",
    tags: "C1, causative, passive voice"
  },
  {
    keyWord: "down",
    fullSentence: "I'm going to eat fewer crisps this year.",
    gapFill: "I'm going to _______________________ of crisps I eat this year.",
    answer: ["cut down on the amount", "cut down on the quantity", "cut down the amount", "cut down the quantity"],
    tags: "C1, phrasal verbs, quantifiers"
  },
  {
    keyWord: "caused",
    fullSentence: "The majority of the issues came about because no one was leading the team.",
    gapFill: "It was the _______________________ most of the issues within the team.",
    answer: ["lack of leadership that caused", "absence of leadership that caused", "lack of leadership which caused", "absence of leadership which caused"],
    tags: "C1, noun phrases, relative clauses, cleft sentences"
  },
  {
    keyWord: "unable",
    fullSentence: "Experts believe that many people find it hard to manage their finances.",
    gapFill: "Many people are thought _______________________ their finances under control.",
    answer: "to be unable to keep",
    tags: "C1, fixed phrase, passive voice"
  },
  {
    keyWord: "having",
    fullSentence: "Leo insisted that he had never seen the missing notebook.",
    gapFill: "Leo _______________________ the missing notebook.",
    answer: "denied having seen",
    tags: "C1, verb patterns, gerunds and infinitives, reported speech, reporting verbs"
  },
  {
    keyWord: "grateful",
    fullSentence: "This suitcase is incredibly heavy — I'd really appreciate some help getting it to the taxi.",
    gapFill: "This suitcase is really heavy so I'd _______________________ help me carry it to the taxi.",
    answer: ["be grateful if you would", "be grateful if you could"],
    tags: "C1, conditionals"
  },
  {
    keyWord: "time",
    fullSentence: "The team started testing the new app immediately after the planning phase.",
    gapFill: "The team lost _______________________ testing the new app after the planning phase.",
    answer: ["no time in getting started", "no time getting started", "little time in getting started", "little time getting started", "no time starting", "no time in starting"],
    tags: "C1, fixed phrase, gerunds and infinitives"
  },
  {
    keyWord: "hard",
    fullSentence: "The sculpture is so well preserved that it’s difficult to believe it's over 500 years old.",
    gapFill: "The sculpture is in such good _______________________ believe it’s over 500 years old.",
    answer: ["condition that it is hard to", "condition it is hard to"],
    tags: "C1, fixed phrase, noun phrases, intensifiers"
  },
  {
    keyWord: "single",
    fullSentence: "By the time we got to the bakery, all the bread had gone.",
    gapFill: "By the time we got to the bakery, there _______________________ loaf left.",
    answer: ["was not a single", "was not one single"],
    tags: "C1, quantifiers, exceptions, intensifiers"
  },
  {
    keyWord: "so",
    fullSentence: "The performance was too loud for us to stay until the end.",
    gapFill: "If _______________________ noise, we might have stayed until the end of the performance.",
    answer: "there had not been so much",
    tags: "C1, conditionals, intensifiers"
  },
  {
    keyWord: "fall",
    fullSentence: "The number of students registering for evening classes went down last year.",
    gapFill: "There _______________________ number of students registering for evening classes last year.",
    answer: "was a fall in the",
    tags: "C1, noun phrases, trends"
  },
  {
    keyWord: "result",
    fullSentence: "If you pay late, your reservation will be cancelled.",
    gapFill: "Failure to _______________________ your reservation being cancelled.",
    answer: ["pay on time will result in"],
    tags: "C1, result, formal, linking"
  },
  {
    keyWord: "made",
    fullSentence: "After her operation, Ella recovered quickly and rejoined the team.",
    gapFill: "After her operation, Ella _______________________ and rejoined the team.",
    answer: ["made a fast recovery", "made a speedy recovery", "made a quick recovery"],
    tags: "C1, fixed phrase"
  },
  {
    keyWord: "notice",
    fullSentence: "Most students didn’t pay attention to what the teacher said.",
    gapFill: "Few students _______________________ what the teacher said.",
    answer: ["took any notice of", "took much notice of"],
    tags: "C1, fixed phrase, exceptions, prepositions"
  },
  {
    keyWord: "made",
    fullSentence: "I hadn’t realised how small the performer was until I saw him live.",
    gapFill: "It was only _______________________ me realise how small the performer was.",
    answer: ["seeing him live that made"],
    tags: "C1, cleft sentences, relative clauses"
  },
  {
    keyWord: "come",
    fullSentence: "It’s really tough creating new content for the event each year.",
    gapFill: "How difficult _______________________ with new content for the event each year.",
    answer: ["it is to come up", "it can be to come up"],
    tags: "C1, phrasal verbs, emphasis"
  },
  {
    keyWord: "put",
    fullSentence: "Claims for pay must be submitted before the deadline.",
    gapFill: "You have _______________________ your pay claims before the end of the month.",
    answer: ["to put in"],
    tags: "C1, phrasal verbs"
  },
  {
    keyWord: "prevented",
    fullSentence: "There are various ways of avoiding mosquito bites.",
    gapFill: "Mosquito bites can _______________________ various ways.",
    answer: ["be prevented in"],
    tags: "C1, passive voice, prepositions"
  },
  {
    keyWord: "point",
    fullSentence: "Learning to use a fax machine is a waste of time.",
    gapFill: "I can’t _______________________ how to use a fax machine.",
    answer: ["see the point in learning", "see the point of learning", "see any point in learning"],
    tags: "C1, gerunds and infinitives, fixed phrase"
  },
  {
    keyWord: "should",
    fullSentence: "Turn off your phone completely during the performance.",
    gapFill: "Under no _______________________ your phone switched on during the performance.",
    answer: ["circumstances should you keep", "circumstances should you have", "circumstances should you leave"],
    tags: "C1, inversion, formal, modals"
  },
  {
    keyWord: "highly",
    fullSentence: "This firm has a great reputation locally.",
    gapFill: "The firm _______________________ of in the local area.",
    answer: ["is highly thought", "is highly spoken"],
    tags: "C1, passive voice, formal"
  },
  {
    keyWord: "matter",
    fullSentence: "I’m sure Yara will become a famous architect one day.",
    gapFill: "I think it’s only _______________________ Yara becomes a famous architect.",
    answer: ["a matter of time before"],
    tags: "C1, fixed phrase, future, noun phrases"
  },
  {
    keyWord: "many",
    fullSentence: "This food festival should attract a lot of people—up to twenty food trucks are expected.",
    gapFill: "This festival will appeal _______________________ as twenty food trucks are expected.",
    answer: ["to everyone because as many"],
    tags: "C1, quantifiers, result"
  },
  {
    keyWord: "discussion",
    fullSentence: "At the start of the show, the presenters discussed online privacy.",
    gapFill: "The presenters began the show _______________________ online privacy.",
    answer: ["with a discussion about", "with a discussion on", "with a discussion of", "by having a discussion on", "by having a discussion about", "by having a discussion of"],
    tags: "C1, noun phrases, prepositions"
  },
  {
    keyWord: "doubt",
    fullSentence: "Camila’s parents were certain she’d become a great violinist.",
    gapFill: "Camila’s parents were _______________________ she’d become a great violinist.",
    answer: ["in no doubt", "not in any doubt", "in no doubt that", "not in any doubt that"],
    tags: "C1, formal, fixed phrase, prepositions, noun phrases"
  },
  {
    keyWord: "recollection",
    fullSentence: "My uncle had completely forgotten that he emailed me.",
    gapFill: "My uncle didn’t _______________________ emailing me.",
    answer: ["have any recollection of"],
    tags: "C1, noun phrases, formal, prepositions"
  },
  {
    keyWord: "name",
    fullSentence: "If Asha hadn’t pursued photography, she might have become a famous chef.",
    gapFill: "If Asha hadn’t pursued photography, she might have _______________________ herself as a chef.",
    answer: ["made a name for"],
    tags: "C1, fixed phrase"
  },
  {
    keyWord: "count",
    fullSentence: "Staff shouldn’t expect a guaranteed locker.",
    gapFill: "The staff shouldn’t _______________________ allocated a locker.",
    answer: ["count on being"],
    tags: "C1, phrasal verbs, passive voice"
  },
  {
    keyWord: "put",
    fullSentence: "‘I’ve had enough of people being rude to me,’ said Ava.",
    gapFill: "‘I’m not prepared _______________________ from people any longer,’ said Ava.",
    answer: ["to put up with any rudeness", "to put up with rudeness", "to put up with rude behaviour", "to put up with any rude behaviour"],
    tags: "C1, phrasal verbs"
  },
  {
    keyWord: "afford",
    fullSentence: "This weekend away is affordable, provided we don’t eat at expensive places.",
    gapFill: "We _______________________ as we avoid expensive places.",
    answer: ["can afford this weekend as long", "can afford the weekend as long", "can afford this weekend away so long", "can afford the weekend away so long"],
    tags: "C1, conditionals, linking"
  },
  {
    keyWord: "chance",
    fullSentence: "Since Carlos is out of practice, he probably won’t win the race.",
    gapFill: "Carlos has almost _______________________ the race, since he’s out of practice.",
    answer: ["no chance of winning"],
    tags: "C1, probability, noun phrases, fixed phrase"
  },
  {
    keyWord: "point",
    fullSentence: "Nina was just about to leave the café when her cousin arrived.",
    gapFill: "Nina was just _______________________ the café when her cousin arrived.",
    answer: ["on the point of leaving"],
    tags: "C1, fixed phrase, prepositions"
  },
  {
    keyWord: "impossible",
    fullSentence: "Due to the storm, Theo wasn’t able to leave his apartment.",
    gapFill: "The storm _______________________ Theo to leave his apartment.",
    answer: ["made it impossible for"],
    tags: "C1, causative, formal"
  },
  {
    keyWord: "danger",
    fullSentence: "Theo’s likely to be dismissed if he keeps arguing with his manager.",
    gapFill: "If he keeps arguing with his manager, Theo’s _______________________ from his job.",
    answer: ["in danger of being fired", "in danger of being dismissed", "in danger of being sacked", "in danger of getting fired", "in danger of getting dismissed", "in danger of getting sacked"],
    tags: "C1, probability, noun phrases, prepositions"
  },
  {
    keyWord: "attention",
    fullSentence: "Although the students weren’t listening, the lecturer stayed calm.",
    gapFill: "Although the students weren’t _______________________ saying, the lecturer stayed calm.",
    answer: ["paying attention to what he was", "paying attention to what she was", "paying any attention to what she", "paying any attention to what she"],
    tags: "C1, fixed phrase, relative clauses"
  },
  {
    keyWord: "affect",
    fullSentence: "Can Andre handle this task with no previous experience?",
    gapFill: "Will Andre's _______________________ ability to handle this task?",
    answer: ["lack of experience affect his", "inexperience affect his", "absence of experience affect his"],
    tags: "C1, noun phrases, prepositions"
  },
  {
    keyWord: "touch",
    fullSentence: "'Don't forget to write or message me,' said Beatriz as she left.",
    gapFill: "'Don’t _______________________,' said Beatriz as she left.",
    answer: ["forget to keep in touch", "forget to stay in touch"],
    tags: "C1, fixed phrase, gerunds and infinitives"
  },
  {
    keyWord: "ahead",
    fullSentence: "No changes are planned for the event.",
    gapFill: "This event will _______________________ to plan.",
    answer: ["go ahead according"],
    tags: "C1, future, fixed phrase, phrasal verbs"
  },
  {
    keyWord: "hope",
    fullSentence: "Leo no longer believes he’ll find a flat by June.",
    gapFill: "He has given _______________________ a flat by June.",
    answer: ["up hope of finding", "up hope of getting", "up any hope of finding", "up all hope of finding"],
    tags: "C1, noun phrases, phrasal verbs, prepositions"
  },
  {
    keyWord: "how",
    fullSentence: "It’s hard to say what I’d have done in that scenario.",
    gapFill: "I’m not _______________________ in that scenario.",
    answer: ["sure how I would have reacted", "certain how I would have reacted"],
    tags: "C1, indirect questions, past modals, modals"
  },
  {
    keyWord: "surprised",
    fullSentence: "I don’t think the business will break even this year, considering the economy.",
    gapFill: "Given the economic climate, _______________________ the business made a profit this year.",
    answer: ["I would be surprised if", "I will be surprised if"],
    tags: "C1, conditionals, probability"
  },
  {
    keyWord: "should",
    fullSentence: "This gate must remain open at all times.",
    gapFill: "On no _______________________ closed.",
    answer: ["account should this gate be", "account should this gate be kept", "account must this gate be", "account must this gate be kept"],
    tags: "C1, modal verbs, inversion, passive voice"
  },
  {
    keyWord: "support",
    fullSentence: "None of Anna’s suggestions were backed by the rest of the team.",
    gapFill: "Anna’s suggestions met with _______________________ the rest of the team.",
    answer: "no support from",
    tags: "C1, formal, noun phrases, prepositions"
  },
  {
    keyWord: "name",
    fullSentence: "Alba is quickly gaining a reputation as a talented filmmaker.",
    gapFill: "Alba is making _______________________ herself as a filmmaker.",
    answer: "a name for",
    tags: "C1, fixed phrase"
  },
  {
    keyWord: "by",
    fullSentence: "After this morning’s briefing, there will be a short feedback session.",
    gapFill: "This morning’s briefing _______________________ a short feedback session.",
    answer: "will be followed by",
    tags: "C1, passive voice, future"
  },
  {
    keyWord: "take",
    fullSentence: "I’d love to show you around when you come to Lisbon.",
    gapFill: "It will be a _______________________ tour when you come to Lisbon.",
    answer: ["pleasure to take you on a", "pleasure to take you for a", "pleasure to take you on"],
    tags: "C1, fixed phrase, prepositions"
  },
  {
    keyWord: "as",
    fullSentence: "Omar volunteered with a local youth charity last summer.",
    gapFill: "Omar used _______________________ with a local youth charity.",
    answer: "to work as a volunteer",
    tags: "C1, modal verbs, noun phrases"
  },
  {
    keyWord: "point",
    fullSentence: "Isla was just about to step out when she got the call.",
    gapFill: "Isla was _______________________ out when she got the call.",
    answer: "on the point of stepping",
    tags: "C1, fixed phrase, prepositions"
  },
  {
    keyWord: "decision",
    fullSentence: "I didn’t know that Nina had chosen to attend the workshop.",
    gapFill: "I was unaware _______________________ attend the workshop.",
    answer: "of Nina's decision to",
    tags: "C1, prepositions, noun phrases"
  },
  {
    keyWord: "concerned",
    fullSentence: "When it comes to reliability, Luca is just like his father.",
    gapFill: "As _______________________, Luca is just like his father.",
    answer: "far as reliability is concerned",
    tags: "C1, linking, passive voice"
  },
  {
    keyWord: "spent",
    fullSentence: "It took Jules ten minutes to find her sunglasses.",
    gapFill: "Jules _______________________ for her sunglasses.",
    answer: ["spent ten minutes looking", "spent ten minutes searching"],
    tags: "C1, verb patterns, gerunds and infinitives"
  },
  {
    keyWord: "belong",
    fullSentence: "'Sorry sir, is this your wallet?' the attendant asked.",
    gapFill: "''Excuse me sir, but _______________________?' the attendant asked.",
    answer: "does this wallet belong to you",
    tags: "C1, questions, prepositions"
  },
  {
    keyWord: "notify",
    fullSentence: "Please let us know if you change your booking.",
    gapFill: "Please ensure that _______________________ change in your booking.",
    answer: "you notify us of any",
    tags: "C1, formal, prepositions, verb patterns"
  },
  {
    keyWord: "scheduled",
    fullSentence: "The roof repairs are planned for next Saturday.",
    gapFill: "The roof repairs _______________________ place next Saturday.",
    answer: ["are scheduled to take", "have been scheduled to take"],
    tags: "C1, fixed phrase, passive voice, prepositions"
  },
  {
    keyWord: "great",
    fullSentence: "Layla struggled a lot to convince her manager to approve the leave.",
    gapFill: "Layla had _______________________ her manager to approve the leave.",
    answer: ["great difficulty in convincing", "great difficulty convincing", "great difficulty in persuading", "great difficulty persuading"],
    tags: "C1, gerunds and infinitives, noun phrases"
  },
  {
    keyWord: "fact",
    gapFill: "Americans still eat fast food despite _______________________ unhealthy.",
    fullSentence: "Americans continue to eat fast food even though it’s unhealthy.",
    answer: ["the fact it is", "the fact that it is"],
    tags: "B2, linking, contrast, concession"
  },
  {
    keyWord: "there",
    gapFill: "The tomatoes would have ripened earlier last year _______________________ more sunshine.",
    fullSentence: "The tomatoes would have ripened earlier if the weather had been sunnier.",
    answer: ["if there had been"],
    tags: "B2, conditionals, past perfect"
  },
  {
    keyWord: "said",
    gapFill: "The new restaurant _______________________ excellent.",
    fullSentence: "They say the new restaurant is excellent.",
    answer: ["is said to be"],
    tags: "B2, passive voice, reported speech"
  },
  {
    keyWord: "used",
    gapFill: "It’s taken me a few months _______________________ in this company.",
    fullSentence: "I’ve worked here for a few months and I’m only just beginning to feel comfortable.",
    answer: ["to get used to working", "to get used to being"],
    tags: "B2, verb patterns, used to"
  },
  {
    keyWord: "refused",
    gapFill: "Ali _______________________ sorry and stormed out of the room.",
    fullSentence: "Ali said he would not apologise and stormed out of the room.",
    answer: ["refused to say"],
    tags: "B2, reporting verbs, gerunds and infinitives"
  },
  {
    keyWord: "ought",
    gapFill: "In my view, _______________________ to a wedding wearing jeans.",
    fullSentence: "In my view, wearing jeans to a wedding is inappropriate.",
    answer: ["you ought not to go"],
    tags: "B2, modal verbs, advice"
  },
  {
    keyWord: "whose",
    gapFill: "Emily found a bracelet in her bag but had no _______________________ be.",
    fullSentence: "Emily found a bracelet in her bag but had no idea who it belonged to.",
    answer: [
      "idea whose it might",
      "idea whose it could",
      "idea whose bracelet it might",
      "idea whose bracelet it could"
    ],
    tags: "B2, relative clauses, indirect questions, questions"
  },
  {
    keyWord: "only",
    gapFill: "That wooden chair was the _______________________ broken.",
    fullSentence: "All the chairs were broken except that wooden one.",
    answer: [
      "only one not to be",
      "only one to not be",
      "only one not to get",
      "only one to not get"
    ],
    tags: "B2, emphasis, passive voice"
  },
  {
    keyWord: "been",
    gapFill: "Lara felt hurt because she _______________________ to the picnic.",
    fullSentence: "Lara felt hurt because nobody had invited her to the picnic.",
    answer: ["had not been invited"],
    tags: "B2, passive voice, past perfect"
  },
  {
    keyWord: "far",
    gapFill: "Doctors _______________________ social workers.",
    fullSentence: "Social workers don't earn nearly as much as doctors.",
    answer: [
      "earn far more than",
      "earn far more money than",
      "get far more than",
      "get far more money than"
    ],
    tags: "B2, comparatives and superlatives, quantifiers"
  },
  {
    keyWord: "feel",
    gapFill: "Tania _______________________ going to the cinema tonight.",
    fullSentence: "Tania doesn’t want to go to the cinema tonight.",
    answer: ["does not feel like"],
    tags: "B2, phrasal verbs, verb patterns, gerunds and infinitives"
  },
  {
    keyWord: "turned",
    gapFill: "The book _______________________ really moving.",
    fullSentence: "I didn’t expect the book to be so moving.",
    answer: ["turned out to be"],
    tags: "B2, phrasal verbs, gerunds and infinitives"
  },
  {
    keyWord: "succeeded",
    gapFill: "Despite the _______________________ completing the hike.",
    fullSentence: "They completed the hike even though it rained all day.",
    answer: ["rain they succeeded in"],
    tags: "B2, linking, contrast, concession, ability"
  },
  {
    keyWord: "choice",
    gapFill: "There _______________________ over forty different dishes on our menu.",
    fullSentence: "Our hotel menu includes more than forty different dishes.",
    answer: ["is a choice of"],
    tags: "B2, noun phrases, prepositions"
  },
  {
    keyWord: "doubted",
    gapFill: "The engineers announced that they _______________________ solve traffic problems.",
    fullSentence: "'We don't believe that more roads will solve traffic problems,' said the engineers.",
    answer: [
      "doubted that more roads would",
      "doubted that more roads will",
      "doubted if more roads would",
      "doubted if more roads will",
      "doubted whether more roads would",
      "doubted whether more roads will"
    ],
    tags: "B2, reporting verbs, future"
  },
  {
    keyWord: "intention",
    gapFill: "'I have _______________________ the country this year,' said Mr Riley.",
    fullSentence: "'I'm definitely not leaving the country this year,' said Mr Riley.",
    answer: ["no intention of leaving"],
    tags: "B2, fixed phrase, noun phrases, formal"
  },
  {
    keyWord: "mistake",
    gapFill: "'I may _______________________ about the time of the interview,' said Zoe.",
    fullSentence: "'Maybe I was wrong about the time of the interview,' said Zoe.",
    answer: ["have made a mistake"],
    tags: "B2, modal verbs, deduction, past modals"
  },
  {
    keyWord: "point",
    gapFill: "There is _______________________ to the party now.",
    fullSentence: "It’s too late now to go to the party.",
    answer: [
      "little point in going",
      "no point in going",
      "Little point going",
      "No point going",
      "Is not any point going"
    ],
    tags: "B2, fixed phrase, noun phrases, prepositions"
  },
  {
    keyWord: "long",
    gapFill: "Sam said I could borrow his camera _______________________ to look after it.",
    fullSentence: "Sam said, 'You can borrow my camera, if you agree to look after it.'",
    answer: ["as long as I agreed", "so long as I agreed", "as long I promised", "so long as I promised"],
    tags: "B2, conditionals, reported speech"
  },
  {
    keyWord: "much",
    gapFill: "Yoga _______________________ now than ten years ago.",
    fullSentence: "The popularity of yoga has grown over the past ten years.",
    answer: ["is much more popular"],
    tags: "B2, comparatives and superlatives"
  },
  {
    keyWord: "give",
    gapFill: "My uncle's decision _______________________ is a smart one.",
    fullSentence: "My uncle has decided not to smoke anymore, which is a smart choice.",
    answer: ["to give up smoking"],
    tags: "B2, verb patterns, gerunds and infinitives, phrasal verbs"
  },
  {
    keyWord: "were",
    gapFill: "Hardly _______________________ by my students this term.",
    fullSentence: "My students did very few writings this term",
    answer: [
      "any writings were done"],
    tags: "B2, passive voice, quantifiers"
  },
  {
    keyWord: "attention",
    gapFill: "I didn’t pay _______________________ Ben was acting.",
    fullSentence: "I ignored how Ben was acting during the meeting.",
    answer: [
      "any attention to how",
      "any attention to the way",
      "Attention to how",
      "Attention to the way"
    ],
    tags: "B2, fixed phrase, prepositions"
  },
  {
    keyWord: "used",
    gapFill: "Sophie still has not _______________________ emails in English at work.",
    fullSentence: "Sophie still finds it odd to write emails in English at work.",
    answer: ["got used to writing", "got used to sending"],
    tags: "B2, verb patterns, used to, prepositions"
  },
  {
    keyWord: "could",
    gapFill: "Maria asked the assistant _______________________ on that jumper.",
    fullSentence: "‘Can my son try this jumper on?’ asked Maria.",
    answer: [
      "if her son could try",
      "whether her son could try"
    ],
    tags: "B2, indirect questions, reported speech, questions"
  },
  {
    keyWord: "warned",
    gapFill: "The optician _______________________________________ too close to the TV screen for a long time.",
    fullSentence: "‘Don't sit too close to the TV screen for a long time,’ the optician told us.",
    answer: ["warned us not to sit"],
    tags: "B2, reported speech, reporting verbs, gerunds and infinitives"
  },
  {
    keyWord: "way",
    gapFill: "We couldn't _______________________________________ from the museum.",
    fullSentence: "We got lost trying to get back from the museum.",
    answer: ["find the way home", "find our way home"],
    tags: "B2, fixed phrase"
  },
  {
    keyWord: "difficulty",
    gapFill: "Tom had _______________________________________ his final exam.",
    fullSentence: "Tom passed his final exam easily.",
    answer: ["no difficulty passing", "little difficulty in passing", "no difficulty in passing", "little difficulty passing"],
    tags: "B2, fixed phrase, noun phrases, gerunds and infinitives"
  },
  {
    keyWord: "somebody",
    gapFill: "David _______________________________________ advice I always rely on.",
    fullSentence: "I always rely on David’s advice.",
    answer: ["is somebody whose", "is someone whose"],
    tags: "B2, relative clauses"
  },
  {
    keyWord: "as",
    gapFill: "It _______________________________________ we've gone to the wrong train platform.",
    fullSentence: "We appear to have gone to the wrong train platform.",
    answer: ["seems as if", "appears as if", "looks as though", "looks as if", "seems as though", "appears as though"],
    tags: "B2, linking, speculation"
  },
  {
    keyWord: "sense",
    gapFill: "The explanation for the maths problem didn’t _______________________________________ me.",
    fullSentence: "I didn’t understand the explanation for the maths problem.",
    answer: ["make any sense to", "make much sense to", "make sense to"],
    tags: "B2, fixed phrase, quantifiers"
  },
  {
    keyWord: "could",
    gapFill: "I wish that we _______________________________________ more when we lived abroad.",
    fullSentence: "It's a shame we didn’t travel more when we lived abroad.",
    answer: ["could have travelled", "could have done"],
    tags: "B2, unreal forms, modal verbs, past modals"
  },
  {
    keyWord: "detailed",
    gapFill: "She _______________________________________ of the apartment.",
    fullSentence: "She described the apartment to us in detail.",
    answer: ["gave us a detailed description"],
    tags: "B2, noun phrases, formal"
  },
  {
    keyWord: "too",
    gapFill: "The instructions were _______________________________________ the students to follow.",
    fullSentence: "The instructions were so tricky that none of the students could follow them.",
    answer: ["too complicated for", "too tricky for"],
    tags: "B2, quantifiers, prepositions, intensifiers"
  },
  {
    keyWord: "mean",
    gapFill: "Sandra _______________________________________ break the window.",
    fullSentence: "Sandra broke the window by mistake.",
    answer: ["did not mean to"],
    tags: "B2, verb patterns, past simple, gerunds and infinitives"
  },
  {
    keyWord: "arrangements",
    gapFill: "Lena has already _______________________________________ her next trip to Italy.",
    fullSentence: "Lena has already planned her next trip to Italy.",
    answer: ["made arrangements for", "made the arrangements for"],
    tags: "B2, fixed phrase, noun phrases, prepositions"
  },
  {
    keyWord: "said",
    gapFill: "The forests in this region _______________________________________ disappearing.",
    fullSentence: "They say the forests in this region are disappearing.",
    answer: ["are said to be"],
    tags: "B2, passive voice, reported speech"
  },
  {
    keyWord: "prevented",
    gapFill: "The rain _______________________________________ our meal outside.",
    fullSentence: "We didn’t enjoy our meal outside because it started to rain.",
    answer: ["prevented us from enjoying"],
    tags: "B2, gerunds and infinitives, verb patterns, prepositions"
  },
  {
    keyWord: "seems",
    gapFill: "Luca _______________________________________ his wallet at home.",
    fullSentence: "It looks like Luca has left his wallet at home.",
    answer: ["seems to have left"],
    tags: "B2, perfect, speculation"
  },
  {
    keyWord: "had",
    gapFill: "Mr Silva _______________________________________ by a trainee dentist.",
    fullSentence: "A trainee dentist took out Mr Silva’s tooth.",
    answer: ["had his tooth taken out", "had his tooth extracted", "had a tooth taken out", "had a tooth extracted"],
    tags: "B2, causative, passive voice"
  },
  {
    keyWord: "not",
    gapFill: "If Ben had _______________________________________ passed the test.",
    fullSentence: "Ben only failed the test because he overslept.",
    answer: ["not overslept he would have"],
    tags: "B2, conditionals, past perfect"
  },
  {
    keyWord: "off",
    gapFill: "The trip to the castle _______________________________________ manager until after the inspection.",
    fullSentence: "The manager postponed the excursion until after the inspection.",
    answer: ["was put off by the"],
    tags: "B2, phrasal verbs, passive voice"
  },
  {
    keyWord: "wide",
    gapFill: "Liam asked his dad _______________________________________ was.",
    fullSentence: "‘Can you tell me how wide this sofa is?’ Liam asked his dad.",
    answer: ["how wide the sofa"],
    tags: "B2, indirect questions, questions"
  },
  {
    keyWord: "took",
    gapFill: "It _______________________________________ out her files.",
    fullSentence: "Ella spent ages sorting out her files.",
    answer: ["took Ella ages to sort"],
    tags: "B2, causality, emphasis"
  },
  {
    keyWord: "had",
    gapFill: "Professor Klein _______________________________________ by an architect.",
    fullSentence: "An architect designed the building for Professor Klein.",
    answer: ["had the building designed"],
    tags: "B2, causative have, passive voice, causative"
  },
  {
    keyWord: "accused",
    gapFill: "Luca’s neighbour _______________________________________ the window.",
    fullSentence: "'Luca, you broke the window!' shouted his neighbour.",
    answer: ["accused him of breaking", "accused him of having broken"],
    tags: "B2, reporting verbs, gerunds and infinitives, reported speech"
  },
  {
    keyWord: "paying",
    gapFill: "If Freya  _______________________________________ to where she was going, she wouldn’t have fallen.",
    fullSentence: "Freya fell down the stairs because she wasn’t watching where she was going.",
    answer: ["had been paying attention", "had been paying any attention"],
    tags: "B2, conditionals, fixed phrase"
  },
  {
    keyWord: "could",
    gapFill: "It _______________________________________ us to find accommodation at short notice.",
    fullSentence: "It might not be easy for us to find accommodation at short notice.",
    answer: ["could be difficult for", "could be hard for", " could be tricky for", "could be tough for"],
    tags: "B2, speculation, modal verbs, prepositions"
  },
  {
    keyWord: "ought",
    gapFill: "You _______________________________________ me before borrowing my shoes.",
    fullSentence: "You should have asked me before borrowing my shoes.",
    answer: ["ought to have asked"],
    tags: "B2, modal verbs, past modals"
  },
  {
    keyWord: "because",
    gapFill: "Several flights were cancelled _______________________________________ so heavy.",
    fullSentence: "Several flights were cancelled as a result of the heavy fog.",
    answer: ["because the fog was"],
    tags: "B2, linking, causality"
  },
  {
    keyWord: "heard",
    gapFill: "I _______________________________________ Clara for six months.",
    fullSentence: "I last got a message from Clara six months ago.",
    answer: ["have not heard from"],
    tags: "B2, present perfect, verb forms"
  },
  {
    keyWord: "advisable",
    gapFill: "It’s _______________________________________ tickets through that website.",
    fullSentence: "I don’t recommend booking tickets through that website.",
    answer: ["not advisable to book"],
    tags: "B2, formal, gerunds and infinitives"
  },
  {
    keyWord: "set",
    gapFill: "The travel agency _______________________________________ Lara’s aunt in 1988.",
    fullSentence: "Lara’s aunt founded the travel agency in 1988.",
    answer: ["was set up by"],
    tags: "B2, phrasal verbs, passive voice"
  },
  {
    keyWord: "rise",
    gapFill: "There _______________________________________ in the number of people working from home in the last two years.",
    fullSentence: "The number of people working from home has gone up in the last two years.",
    answer: ["has been a rise"],
    tags: "B2, noun phrases, trends"
  },
  {
    keyWord: "discuss",
    gapFill: "Jacob promised never _______________________________________ again.",
    fullSentence: "Jacob said he would never mention the incident again.",
    answer: ["to discuss the incident"],
    tags: "B2, reported speech, gerunds and infinitives, verb patterns"
  },
  {
    keyWord: "never",
    gapFill: "'I've _______________________________________ Airbnb than this,' said Jordan.",
    fullSentence: "'This is the nicest Airbnb I've ever stayed in,' said Jordan.",
    answer: ["never stayed in a nicer", "never stayed in a better"],
    tags: "B2, comparatives and superlatives, present perfect"
  },
  {
    keyWord: "came",
    gapFill: "Hardly _______________________________________ the poetry reading on Monday.",
    fullSentence: "There were very few people at the poetry reading on Monday.",
    answer: ["anyone came to", "anybody came to"],
    tags: "B2, quantifiers, past simple"
  },
  {
    keyWord: "until",
    fullSentence: "We had to complete the report before we could leave the office.",
    gapFill: "We had to stay in the office ____________________________ the report.",
    answer: ["until we had completed", "until we completed"],
    tags: "B2, linking, past perfect"
  },
  {
    keyWord: "better",
    fullSentence: "Ella hadn’t expected the exhibition to be so interesting.",
    gapFill: "The exhibition ____________________________ Ella had expected.",
    answer: ["was better than"],
    tags: "B2, comparatives and superlatives"
  },
  {
    keyWord: "does",
    fullSentence: "If Josh doesn’t study more, he won’t pass the final exam.",
    gapFill: "Josh won’t pass the final exam ____________________________ studying.",
    answer: ["unless he does more"],
    tags: "B2, conditionals, verb forms"
  },
  {
    keyWord: "what",
    fullSentence: "“Do you know what the problem is, Alex?” asked Priya.",
    gapFill: "Priya asked Alex ____________________________.",
    answer: ["what the problem was"],
    tags: "B2, indirect questions, reported speech, questions"
  },
  {
    keyWord: "put",
    fullSentence: "The school decided to advertise the vacancy online.",
    gapFill: "The school decided to ____________________________ the vacancy online.",
    answer: ["put an advertisement for", "put an ad for", "put an advert for"],
    tags: "B2, fixed phrase"
  },
  {
    keyWord: "finished",
    fullSentence: "At the end of her presentation, the student congratulated her teacher.",
    gapFill: "The student ____________________________ her teacher.",
    answer: ["finished her presentation by congratulating"],
    tags: "B2, gerunds and infinitives, verb patterns"
  },
  {
    keyWord: "month",
    fullSentence: "I sent off my university application a month ago.",
    gapFill: "It ____________________________ I sent off my university application.",
    answer: ["has been a month since", "is a month since", "'s a month since", "'s been a month since"],
    tags: "B2, present perfect, time expressions"
  },
  {
    keyWord: "following",
    fullSentence: "The band received loads of fan mail after they had appeared on TV.",
    gapFill: "The band received loads of fan mail ____________________________ on TV.",
    answer: ["following their appearance"],
    tags: "B2, noun phrases, prepositions"
  },
  {
    keyWord: "like",
    fullSentence: "Mia is interested in learning more about photography.",
    gapFill: "Mia would ____________________________ more about photography.",
    answer: ["like to learn", "like to know"],
    tags: "B2, verb patterns, gerunds and infinitives"
  },
  {
    keyWord: "let",
    fullSentence: "Because of the roadworks, the police didn’t allow us to drive through the tunnel.",
    gapFill: "The police wouldn’t ____________________________ through the tunnel.",
    answer: ["let us drive"],
    tags: "B2, causative, modal verbs, gerunds and infinitives"
  },
  {
    keyWord: "seen",
    fullSentence: "“Did you see the football match on Sunday?” asked Marco.",
    gapFill: "Marco wanted to know if I had ____________________________ on Sunday.",
    answer: ["seen the football match"],
    tags: "B2, reported speech, past perfect"
  },
  {
    keyWord: "there",
    fullSentence: "“I think this shirt is torn,” said Anna to the cashier.",
    gapFill: "“I think ____________________________ this shirt,” Anna said to the cashier.",
    answer: ["there is a tear in"],
    tags: "B2, noun phrases"
  },
  {
    keyWord: "attention",
    fullSentence: "Leo always ignores everything I suggest.",
    gapFill: "Leo never pays ____________________________ I suggest.",
    answer: ["attention to what"],
    tags: "B2, fixed phrase, prepositions"
  },
  {
    keyWord: "lend",
    fullSentence: "“Could I borrow your tablet, Jason?” asked Emma.",
    gapFill: "Emma asked Jason ____________________________ his tablet.",
    answer: ["to lend her"],
    tags: "B2, reporting verbs, gerunds and infinitives"
  },
  {
    keyWord: "might",
    fullSentence: "Maybe Tom didn’t remember that we moved the deadline.",
    gapFill: "Tom ____________________________ that we moved the deadline.",
    answer: ["might have forgotten"],
    tags: "B2, past modals, speculation"
  },
  {
    keyWord: "fun",
    fullSentence: "All the students have a great time during the science workshop.",
    gapFill: "Every ____________________________ during the science workshop.",
    answer: ["student has fun", "student has a lot of fun"],
    tags: "B2, noun phrases, quantifiers"
  },
  {
    keyWord: "my",
    fullSentence: "While I was in Berlin, I had some unforgettable experiences.",
    gapFill: "During ____________________________ had some unforgettable experiences.",
    answer: [
      "my trip to Berlin I",
      "my time in Berlin I",
      "my holiday in Berlin I"
    ],
    tags: "B2, noun phrases, past simple"
  },
  {
    keyWord: "ought",
    fullSentence: "You were careless to go out without switching the oven off.",
    gapFill: "You ____________________________ the oven off before you went out.",
    answer: ["ought to have switched", "ought to have turned"],
    tags: "B2, past modals, advice"
  },
  {
    keyWord: "chance",
    fullSentence: "“Is there any possibility that James will leave his partner?” asked Zoe.",
    gapFill: "Zoe asked if there was any ____________________________ leaving his partner.",
    answer: ["chance of James", "chance of James’s"],
    tags: "B2, noun phrases, speculation"
  },
  {
    keyWord: "nobody",
    fullSentence: "Sophie is the only one who responded to the email.",
    gapFill: "Apart ____________________________ responded to the email.",
    answer: ["from Sophie nobody"],
    tags: "B2, prepositions, quantifiers"
  },
  {
    keyWord: "used",
    fullSentence: "Do you feel comfortable with the new software yet?",
    gapFill: "Have you ____________________________ the new software yet?",
    answer: ["got used to", "gotten used to"],
    tags: "B2, used to, verb patterns, perfect"
  },
  {
    keyWord: "felt",
    fullSentence: "It was such a cold day that nobody wanted to go outside.",
    gapFill: "Nobody ____________________________ outside because it was so cold.",
    answer: ["felt like going"],
    tags: "B2, Gerunds and infinitives, phrasal verbs"
  },
  {
    keyWord: "unable",
    fullSentence: "Daniel couldn’t speak or understand French.",
    gapFill: "Besides ____________________________ French, Daniel couldn’t understand it either.",
    answer: ["being unable to speak"],
    tags: "B2, gerunds and infinitives, ability"
  },
  {
    keyWord: "soon",
    fullSentence: "The meeting will begin immediately upon the CEO’s entrance.",
    gapFill: "The meeting will begin ____________________________ the CEO enters.",
    answer: ["as soon as"],
    tags: "B2, linking, time expressions"
  },
  {
    keyWord: "strange",
    fullSentence: "That’s the weirdest book I’ve ever read!",
    gapFill: "I’ve never ____________________________ book!",
    answer: ["read such a strange"],
    tags: "B2, emphasis, comparatives and superlatives"
  },
  {
    keyWord: "around",
    fullSentence: "A cheerful guide took us around the city.",
    gapFill: "We ____________________________ by a cheerful guide.",
    answer: ["were taken around the city"],
    tags: "B2, Passive voice, verb forms, phrasal verbs"
  },
  {
    keyWord: "insisted",
    fullSentence: "My dad was determined to cover the bill.",
    gapFill: "My dad ____________________________ the bill.",
    answer: ["insisted on paying"],
    tags: "B2, reporting verbs, gerunds and infinitives, reported speech, prepositions"
  },
  {
    keyWord: "succeed",
    fullSentence: "The coach didn’t manage to convince Mia to join the team.",
    gapFill: "The coach didn’t ____________________________ Mia to join the team.",
    answer: ["succeed in convincing"],
    tags: "B2, verb patterns, prepositions, gerunds and infinitives, formal"
  },
  {
    keyWord: "mind",
    fullSentence: "“I’d prefer it if you didn’t eat in this room,” said the teacher.",
    gapFill: "“Would you ____________________________ in this room?” said the teacher.",
    answer: ["mind not eating"],
    tags: "B2, Gerunds and infinitives, verb patterns"
  },
  {
    keyWord: "good",
    fullSentence: "Rachel impressed her interviewer by answering confidently.",
    gapFill: "Rachel ____________________________ her interviewer by answering confidently.",
    answer: ["made a good impression on"],
    tags: "B2, fixed phrase, prepositions"
  },
  {
    keyWord: "wishes",
    fullSentence: "Hannah regrets not telling her friend the truth.",
    gapFill: "Hannah ____________________________ her friend the truth.",
    answer: ["wishes she had told"],
    tags: "B2, unreal forms, past perfect, perfect"
  },
  {
    keyWord: "trouble",
    fullSentence: "I struggled to understand the safety guidelines.",
    gapFill: "I ____________________________ the safety guidelines.",
    answer: ["had trouble understanding"],
    tags: "B2, Gerunds and infinitives, fixed phrase, noun phrases"
  },
  {
    keyWord: "IT",
    fullSentence: "Lara was so nervous she had difficulty following the examiner’s instructions.",
    gapFill: "Lara was so nervous she ................................................ the examiner’s instructions.",
    answer: ["found it hard to follow", "found it difficult to follow", "found it tough to follow"],
    tags: "B2, fixed phrase, verb patterns"
  },
  {
    keyWord: "PUT",
    fullSentence: "They have postponed the concert and it will now happen next month.",
    gapFill: "The concert ................................................ until next month.",
    answer: ["has been put off", "'s been put off"],
    tags: "B2, phrasal verbs, passive voice, verbs forms"
  },
  {
    keyWord: "INTENTION",
    fullSentence: "I don’t plan on playing with Marcus again.",
    gapFill: "I’ve got ................................................ with Marcus again.",
    answer: ["no intention of playing", "little intention of playing"],
    tags: "B2, noun phrase, verb pattern (preposition + -ing)"
  },
  {
    keyWord: "HAVE",
    fullSentence: "It seems a short circuit caused the explosion.",
    gapFill: "The explosion ................................................ by a short circuit.",
    answer: "seems to have been caused",
    tags: "B2, passive voice, perfect, speculation"
  },
  {
    keyWord: "POINT",
    fullSentence: "The town was dead in winter, so it wasn’t worth going out.",
    gapFill: "The town was dead in winter, so................................................ going out.",
    answer: ["there was no point in", "there was little point in", "there was no point", "there was little point", "there was not any point"],
    tags: "B2, fixed phrase, verb patterns, noun phrases"
  },
  {
    keyWord: "HAVE",
    fullSentence: "I called the doctor, but they told me I didn’t need an appointment.",
    gapFill: "I called the doctor, but they said I ................................................ an appointment.",
    answer: "did not have to make",
    tags: "B2, modal verbs, obligation, reported speech"
  },
  {
    keyWord: "LONG",
    fullSentence: "“I’ll take you to the airport if you’re packed,” said Jake.",
    gapFill: "Jake said he’d take me to the airport ................................................ packed.",
    answer: ["as long as I was", "so long as I was", "as long as I had", "so long as I had"],
    tags: "B2, conditionals, reported speech, linking"
  },
  {
    keyWord: "GET",
    fullSentence: "My phone needs to be fixed again.",
    gapFill: "I’ll have to ................................................ again.",
    answer: ["get my phone fixed", "get my phone repaired", "get my phone mended"],
    tags: "B2, causative, passive voice"
  },
  {
    keyWord: "FALL",
    fullSentence: "Sales decreased because of the pandemic, the company said.",
    gapFill: "The company blamed the ................................................ the pandemic.",
    answer: "fall in sales on",
    tags: "B2, noun phrase, prepositions, reporting verbs, reported speech"
  },
  {
    keyWord: "WISHED",
    fullSentence: "Ellie regretted wasting so much time online.",
    gapFill: "Ellie ................................................ so much time online.",
    answer: "wished she had not wasted",
    tags: "B2, wish, past perfect, verb forms, unreal forms"
  },
  {
    keyWord: "HAVE",
    fullSentence: "People think the song was about his childhood.",
    gapFill: "That song ................................................written about his childhood.",
    answer: ["is thought to have been", "is believed to have been"],
    tags: "B2, passive voice, reported speech, perfect"
  },
  {
    keyWord: "BEEN",
    fullSentence: "I couldn’t have passed the exam if you hadn’t helped.",
    gapFill: "I wouldn’t have passed the exam if ................................................ your help.",
    answer: "it had not been for",
    tags: "B2, unreal conditional, fixed expression (if it hadn’t been for)"
  },
  {
    keyWord: "WERE",
    fullSentence: "The platoon left almost no soldiers behind.",
    gapFill: "Hardly................................................ by the platoon.",
    answer: ["any soldiers were left behind", "any soldiers were abandoned"],
    tags: "B2, passive voice, quantifiers, emphasis"
  },
  {
    keyWord: "HOW",
    fullSentence: "“What’s the height of that mountain?” She asked.",
    gapFill: "She asked ................................................ was.",
    answer: "how high the mountain",
    tags: "B2, indirect questions, questions, reported speech"
  },
  {
    keyWord: "MUCH",
    fullSentence: "This sofa is almost the same as the one we saw yesterday.",
    gapFill: "There isn’t ................................................ this sofa and the one we saw yesterday.",
    answer: "much difference between",
    tags: "B2, comparatives and superlatives, noun phrases"
  },
  {
    keyWord: "WAS",
    fullSentence: "Maria wouldn’t apologise for shouting at us.",
    gapFill: "Maria refused to................................................ shouting at us.",
    answer: "say she was sorry for",
    tags: "B2, reporting verbs, verb forms, prepositions, reported speech"
  },
  {
    keyWord: "FIND",
    fullSentence: "This town’s restaurants are what visitors enjoy the most.",
    gapFill: "What most visitors ................................................ this town is its restaurants.",
    answer: "find most enjoyable about",
    tags: "B2, verb patterns, fixed phrase, cleft sentences, comparatives and superlatives"
  },
  {
    keyWord: "SUCCEED",
    fullSentence: "Our team probably won’t manage to get the grant.",
    gapFill: "Our team is unlikely to ................................................ the grant.",
    answer: ["succeed in getting", "succeed in obtaining"],
    tags: "B2, verb patterns, gerunds and infinitives, probability, speculation"
  },
  {
    keyWord: "BEEN",
    fullSentence: "We last spoke on the phone two years ago.",
    gapFill: "It’s ................................................ we last spoke on the phone.",
    answer: "been two years since",
    tags: "B2, time expressions, present perfect, verb forms"
  },
  {
    keyWord: "ACCUSED",
    fullSentence: "“You weren’t honest with me,” Anna told Paul.",
    gapFill: "Anna ................................................ honest with her.",
    answer: "accused Paul of not being",
    tags: "B2, reporting verbs, verb patterns, reported speech, prepositions"
  },
  {
    keyWord: "LATE",
    fullSentence: "You really ought to get to the interview on time.",
    gapFill: "I strongly advise you................................................ for the interview.",
    answer: ["not to be late", "not to arrive late"],
    tags: "B2, reporting verbs, verb forms, gerunds and infinitives"
  },
  {
    keyWord: "SPITE",
    fullSentence: "We managed to win the race, even though we weren’t well prepared.",
    gapFill: "We won the race ................................................ badly prepared.",
    answer: ["in spite of being", "in spite of having been"],
    tags: "B2, concession, prepositions, linking, contrast"
  },
  {
    keyWord: "FLY",
    fullSentence: "The journey to Barcelona lasts two hours by plane.",
    gapFill: "It ................................................ to Barcelona.",
    answer: "takes two hours to fly",
    tags: "B2, verb forms, time expressions, gerunds and infinitives"
  },
  {
    keyWord: "SUCH",
    fullSentence: "I didn’t know the hotel was that far from the station.",
    gapFill: "I didn’t know the hotel ................................................ way from the station.",
    answer: "was such a long",
    tags: "B2, emphasis, noun phrases, intensifiers"
  },
  {
    keyWord: "HAVE",
    fullSentence: "Dan missed the bus because he didn’t leave on time.",
    gapFill: "If Dan had left on time, he would ................................................ bus.",
    answer: "not have missed the",
    tags: "B2, conditionals, past modals, modal verbs"
  },
  {
    keyWord: "NEARLY",
    fullSentence: "None of the other apps perform better than this one.",
    gapFill: "The other apps don’t work ................................................ this one.",
    answer: "nearly as well as",
    tags: "B2, comparatives and superlatives, emphasis, intensifiers"
  },
  {
    keyWord: "WHETHER",
    fullSentence: "“Could I use your laptop for a second?” Mia asked Ben.",
    gapFill: "Mia asked Ben ................................................ his laptop for a second.",
    answer: "whether she could use",
    tags: "B2, reported speech, questions, indirect questions, modal verbs"
  },
  {
    keyWord: "SUCH",
    fullSentence: "Lucas show so much talent as a photographer—his pictures look unreal.",
    gapFill: "Lucas is ................................................ photographer that his pictures look unreal.",
    answer: "such a talented",
    tags: "B2, emphasis, noun phrases, intensifiers"
  },
  {
    keyWord: "NOT",
    fullSentence: "I wish I hadn’t drunk so much at the weekend.",
    gapFill: "I should ................................................ at the weekend.",
    answer: "not have drunk so much",
    tags: "B2, advice, past modals, quantifiers, modal verbs, wish"
  },
  {
    keyWord: "CAUSED",
    fullSentence: "The train was delayed because a signal failed.",
    gapFill: "The train’s delay ................................................ signal failure.",
    answer: ["was caused by a", "was caused by the"],
    tags: "B2, causality, verb forms, passive voice"
  },
  {
    keyWord: "INVITED",
    fullSentence: "“Do you want to go to my presentation, Leo?” asked Mia.",
    gapFill: "Mia ................................................ presentation.",
    answer: "invited Leo to her",
    tags: "B2, reporting verbs, verb patterns, reported speech"
  },
  {
    keyWord: "PAID",
    fullSentence: "Several drivers ignored the roadwork signs.",
    gapFill: "Several drivers ................................................ the roadwork signs.",
    answer: ["paid no attention to", "paid little attention to"],
    tags: "B2, fixed phrase, verb forms, noun phrases"
  },
  {
    keyWord: "NOT",
    fullSentence: "The volunteers had too little water for all the hikers.",
    gapFill: "There ................................................ the volunteers to give to all the hikers.",
    answer: ["was not enough water for", "was not sufficient water for"],
    tags: "B2, quantifiers, noun phrases, prepositions"
  },
  {
    keyWord: "ONLY",
    fullSentence: "Eva gets no exercise other than cycling to school.",
    gapFill: "The ................................................  cycling to school.",
    answer: ["only exercise Eva gets is", "only exercise Eva does is"],
    tags: "B2, noun phrases, emphasis, cleft sentences"
  },
  {
    keyWord: "GAVE",
    fullSentence: "Leo wanted to start painting so he quit his job as a coach.",
    gapFill: "Leo ................................................ become a painter.",
    answer: ["gave up coaching to", "gave coaching up to"],
    tags: "B2, phrasal verbs, verb patterns, gerunds and infinitives"
  },
  {
    keyWord: "NEARLY",
    fullSentence: "There’s far less pollution in Madrid than there once was.",
    gapFill: "There isn’t ................................................ Madrid as there used to be.",
    answer: "nearly as much pollution in",
    tags: "B2, comparatives and superlatives, quantifiers, intensifiers"
  },
  {
    keyWord: "ACCOUNT",
    fullSentence: "In the documentary, witnesses describe their experiences vividly.",
    gapFill: "The documentary ____________________________ the witnesses’ experiences.",
    answer: [
      "gives a vivid account of",
      "contains a vivid account of",
      "includes a vivid account of",
      "is a vivid account of"
    ],
    tags: "C2, fixed phrase, noun phrases"
  },
  {
    keyWord: "PRONE",
    fullSentence: "These delicate herbs are frequently damaged by mites and aphids.",
    gapFill: "These herbs ____________________________ by mites and aphids.",
    answer: [
      "are prone to getting damaged by",
      "are prone to being damaged",
      "are prone to damage"
    ],
    tags: "C2, adjectives, prepositions, passive voice"
  },
  {
    keyWord: "LIGHT",
    fullSentence: "Do you have any idea how Marta managed to fund such a lavish wedding?",
    gapFill: "Can anyone ____________________________ Marta paid for such a lavish wedding?",
    answer: [
      "shed some light on how",
      "cast some light on how",
      "throw some light on how",
      "shed any light on how",
      "cast any light on how",
      "throw any light on how",
      "shed light on how",
      "cast light on how",
      "throw light on how"
    ],
    tags: "C2, fixed phrase, indirect questions, questions"
  },
  {
    keyWord: "TERMS",
    fullSentence: "It took Oliver a while to accept that he wouldn’t be returning to the company.",
    gapFill: "Oliver has finally ____________________________ he won't be going back to the company.",
    answer: [
      "come to terms with the fact that",
      "Come to terms with the fact"
    ],
    tags: "C2, fixed phrase, noun phrases"
  },
  {
    keyWord: "TOOK",
    fullSentence: "The attendees didn't expect Nina to start rapping during the presentation.",
    gapFill: "It ____________________________ rapping during the presentation.",
    answer: [
      "took the attendees by surprise when Nina began",
      "took the attendees aback when Nina began",
      "took the attendees by surprise when Nina started",
      "took the attendees aback when Nina started"
    ],
    tags: "C2, fixed phrase, prepositions, phrasal verbs"
  },
  {
    keyWord: "GET",
    fullSentence: "Leo bounced back from the flu in just a few days.",
    gapFill: "It did ____________________________ the flu.",
    answer: [
      "not take Leo long to get over",
      "not take long for Leo to get over"
    ],
    tags: "C2, verb patterns, time expressions, phrasal verbs"
  },
  {
    keyWord: "EXTENT",
    fullSentence: "We had no idea how much destruction the fire had caused until it was out.",
    gapFill: "It wasn’t until the fire was ____________________________ became apparent.",
    answer: [
      "extinguished that the extent of the destruction",
      "put out the extent of the destruction",
      "out that the extent of the destruction",
      "extinguished extent of the destruction",
      "out the extent of the destruction"
    ],
    tags: "C2, cleft sentences, time expressions"
  },
  {
    keyWord: "DAWN",
    fullSentence: "As soon as she heard the news, Maya began to realise how fortunate she'd been.",
    gapFill: "When she heard the news, it began ____________________________ how lucky she had been.",
    answer: [
      "to dawn on Maya"
    ],
    tags: "C2, fixed phrase, idioms"
  },
  {
    keyWord: "RESTRICTED",
    fullSentence: "Only students with advanced passes are allowed to access the research library.",
    gapFill: "Access to the research library ____________________________ with advanced passes.",
    answer: [
      "is restricted to students",
      "is restricted to those students"
    ],
    tags: "C2, passive voice, prepositions"
  },
  {
    keyWord: "CIRCUMSTANCES",
    fullSentence: "You must never leave this storeroom locked during opening hours.",
    gapFill: "Under no ____________________________ left locked during opening hours.",
    answer: [
      "circumstances should this storeroom be",
      "circumstances must this storeroom be",
      "circumstances is this storeroom to be"
    ],
    tags: "C2, inversion, modal verbs"
  },
  {
    keyWord: "SOURCE",
    fullSentence: "Carla always felt embarrassed when her mother laughed in public.",
    gapFill: "Her mother’s laugh ____________________________ Carla.",
    answer: [
      "was a constant source of embarrassment to",
      "was always a source of embarrassment to",
      "was a constant source of embarrassment for",
      "was always a source of embarrassment for"
    ],
    tags: "C2, fixed phrase, noun phrases"
  },
  {
    keyWord: "PROSPECTS",
    fullSentence: "Is the company likely to launch the new app successfully?",
    gapFill: "What ____________________________ the company launching the new app successfully?",
    answer: [
      "are the prospects of",
      "prospects are there of",
      "prospects does the company have of"
    ],
    tags: "C2, noun phrases, speculation, probability"
  },
  {
    keyWord: "NOTICE",
    fullSentence: "Mia ignored every warning her sister gave her.",
    gapFill: "Mia didn’t ____________________________ her sister’s warnings.",
    answer: [
      "take much notice of",
      "take any notice of",
      "take a lot of notice of"
    ],
    tags: "C2, fixed phrase, prepositions"
  },
  {
    keyWord: "CONCERNED",
    fullSentence: "In Vanessa’s opinion, she has nothing to feel guilty about.",
    gapFill: "As ____________________________, she has nothing to feel guilty about.",
    answer: [
      "far as Vanessa is concerned"
    ],
    tags: "C2, fixed phrase, linking"
  },
  {
    keyWord: "EXCEPTION",
    fullSentence: "Professor Ling was upset by several comments made during the conference.",
    gapFill: "Professor Ling ____________________________ some of the comments made at the conference.",
    answer: [
      "took exception to"
    ],
    tags: "C2, fixed phrase, idioms"
  },
  {
    keyWord: "DARK",
    fullSentence: "James refused to share anything, for personal reasons.",
    gapFill: "James kept us ____________________________ reasons.",
    answer: [
      "in the dark for personal"
    ],
    tags: "C2, Idioms, fixed phrase"
  },
  {
    keyWord: "TAKEN",
    fullSentence: "I really wish I hadn’t believed everything Lucas told me.",
    gapFill: "I wish ____________________________ by what Lucas told me!",
    answer: [
      "I hadn’t been taken in"
    ],
    tags: "C2, unreal forms, passive voice, phrasal verbs"
  },
  {
    keyWord: "DISCUSSION",
    fullSentence: "The board made it clear that there would be no more talk of the proposal.",
    gapFill: "The board said that further ____________________________ question.",
    answer: [
      "discussion of the proposal was out of the"
    ],
    tags: "C2, fixed phrase, noun phrases, prepositions"
  },
  {
    keyWord: "INGENUITY",
    fullSentence: "Without Laura’s creative thinking, the whole project would have failed.",
    gapFill: "But ____________________________, the whole project would have failed.",
    answer: [
      "for the ingenuity of Laura’s thinking"
    ],
    tags: "C2, prepositions, noun phrases, conditionals"
  },
  {
    keyWord: "VIEW",
    fullSentence: "Jonah enrolled in a nutrition course because he planned to become a dietician.",
    gapFill: "Jonah enrolled in the course ____________________________ a dietician.",
    answer: [
      "with a view to becoming"
    ],
    tags: "C2, verb patterns, fixed phrase"
  },
  {
    keyWord: "CONTRAST",
    fullSentence: "The professor’s elegant essays were completely different from his clumsy speech.",
    gapFill: "There ____________________________ the professor’s clumsy speech and his elegant essays.",
    answer: [
      "was a sharp contrast between",
      "was a clear contrast between"
    ],
    tags: "C2, comparatives and superlatives, noun phrases"
  },
  {
    keyWord: "CHANCE",
    fullSentence: "It’s unlikely that Theo will be asked to lead the next phase of the project.",
    gapFill: "Theo has ____________________________ the next phase of the project.",
    answer: [
      "little chance of leading",
      "Little chance of being asked to lead",
      "Almost no chance if leading",
      "almost no chance of being asked to lead"
    ],
    tags: "C2, noun phrases, probability"
  },
  {
    keyWord: "CLUE",
    fullSentence: "When I started the internship, I didn’t even know how to set up a printer.",
    gapFill: "I didn’t ____________________________ set up a printer when I started the internship.",
    answer: [
      "have a clue how to",
      "have any clue how to",
      "Have a clue about how to",
      "Have any clue about how to"
    ],
    tags: "C2, informal, noun phrases, fixed phrase"
  },
  {
    keyWord: "MAKE",
    fullSentence: "It was a few months before Teresa fully recovered from her illness.",
    gapFill: "Only after a few months ____________________________ from her illness.",
    answer: [
      "did Teresa make a full recovery",
      "did Teresa make a complete recovery",
      "did Teresa make a total recovery"
    ],
    tags: "C2, inversion, fixed phrase"
  },
  {
    keyWord: "POPULAR",
    fullSentence: "Lots of people assume that all French wine is better than Spanish, but that’s just not true.",
    gapFill: "Contrary ____________________________ French wine is better than Spanish.",
    answer: [
      "to popular belief not all"
    ],
    tags: "C2, fixed phrase, contrast, linking"
  },
  {
    keyWord: "DUE",
    fullSentence: "Luke’s was not an ambitious person, and that’s why he was so satisfied.",
    gapFill: "Luke’s ____________________________ of ambition.",
    answer: [
      "satisfaction was due to a lack",
      "satisfaction was due to his lack",
      "satisfaction was due to an absence",
      "satisfaction was due to his absence",
      "Being satisfied was due to a lack",
      "Being satisfied was due to his lack"
    ],
    tags: "C2, noun phrases, causality, linking"
  },
  {
    keyWord: "LUCK",
    fullSentence: "“This is unbelievable – I’ve just won an electric car!” cried Hannah.",
    gapFill: "Hannah couldn’t ____________________________ won an electric car.",
    answer: [
      "believe her luck when she"
    ],
    tags: "C2, Idioms, fixed phrase"
  },
  {
    keyWord: "CAME",
    fullSentence: "The team made no progress until Andrea suggested a new strategy.",
    gapFill: "The team were getting ____________________________ a new strategy.",
    answer: [
      "nowhere until Andrea came up with",
      "Nowhere before Andrea came up with"
    ],
    tags: "C2, phrasal verbs, linking, fixed phrase"
  },
  {
    keyWord: "LACKS",
    fullSentence: "Max is not very aware when people around him are uncomfortable.",
    gapFill: "Max ____________________________ comes to people around him feeling uncomfortable.",
    answer: [
      "lacks awareness when it"
    ],
    tags: "C2, noun phrases, fixed phrase, linking"
  },
  {
    keyWord: "APART",
    fullSentence: "If you haven't done this kind of thing before, don’t try to disassemble the engine.",
    gapFill: "Don’t ____________________________ you’ve done this kind of thing before.",
    answer: [
      "take the engine apart unless",
      "take apart the engine unless",
      "Try taking the engine apart unless",
      "Try taking apart the engine unless",
      "Try to take the engine apart unless",
      "Try to take apart the engine unless"
    ],
    tags: "C2, phrasal verbs, conditionals"
  },
  {
    keyWord: "AFFECT",
    fullSentence: "Do you think Josh will still be able to play guitar after spraining his wrist?",
    gapFill: "Will Josh’s ____________________________ to play guitar?",
    answer: [
      "sprained wrist affect his ability"
    ],
    tags: "C2, noun phrases, ability"
  },
  {
    keyWord: "TURNED",
    fullSentence: "Liam will forever regret saying no to the chance to move abroad.",
    gapFill: "Liam will always wish ____________________________ the chance to move abroad.",
    answer: [
      "he had not turned down"
    ],
    tags: "C2, unreal forms, perfect, wish"
  },
  {
    keyWord: "HELD",
    fullSentence: "Construction was delayed due to licensing issues no one had foreseen.",
    gapFill: "The construction work ____________________________ licensing issues.",
    answer: [
      "was held up by unforeseen",
      "was held up due to unforeseen",
      "was held up on account of unforeseen",
      "was held up as a result of unforeseen"
    ],
    tags: "C2, passive voice, causative, linking"
  },
  {
    keyWord: "ANYTHING",
    fullSentence: "I had no other option but to wait it out in silence.",
    gapFill: "There ____________________________ wait it out in silence.",
    answer: [
      "was not anything I could do except",
      "Was not anything else I could do except",
      "was not anything I could do but",
      "Was not anything else I could do but",
      "was not anything I could do apart from",
      "was not anything for me to do but",
      "was not anything for me to do except"
    ],
    tags: "C2, fixed phrase, negatives"
  },
  {
    keyWord: "WITHOUT",
    fullSentence: "Nora wouldn't have landed the role had her sister not advised her for the audition.",
    gapFill: "Nora wouldn’t have landed the role ____________________________ for the audition.",
    answer: [
      "without her sister’s advice",
      "without her sister having advised her",
      "without the advice of her sister",
      "Without being advised by her sister",
      "Without having been advised by her sister",
      "Without her sister's advising her"
    ],
    tags: "C2, conditionals, prepositions, time clauses"
  },
  {
    keyWord: "SUBJECT",
    fullSentence: "The expansion of the school will go ahead if the board approves the updated design.",
    gapFill: "The expansion will proceed ____________________________ of the updated design.",
    answer: [
      "subject to the board's approval",
      "subject to the board approving to",
      "subject to the approval of the board",
      "subject to the board's approving"
    ],
    tags: "C2, conditionals, formal"
  },
  {
    keyWord: "WHICH",
    fullSentence: "'Carl pronounces things unclearly, which means I can't understand most of his instructions', Jack explained.",
    gapFill: "Jack explained that it was ____________________________ understanding him difficult.",
    answer: [
      "Carl's unclear pronunciation which made",
      "Carl's unclear pronunciation which rendered",
      "Carl's pronouncing things unclearly which made",
      "Carl pronouncing things unclearly which made"
    ],
    tags: "C2, relative clauses, causative, reported speech, cleft sentences"
  },
  {
    keyWord: "GET",
    fullSentence: "Lily hardly has any opportunities to perform her own songs.",
    gapFill: "Rarely ____________________________ perform her own songs.",
    answer: [
      "does Lily get the opportunity to",
      "Does Lily get an opportunity to",
      "Does Lily get any opportunity to",
      "does Lily get any chance to",
      "does Lily get a chance to",
      "Does Lily get the chance to",
      "Does Lily get to"
    ],
    tags: "C2, inversion, adverbs of frequency"
  },
  {
    keyWord: "DREW",
    fullSentence: "The historian pointed out to us the inscriptions over the entrance.",
    gapFill: "The historian ____________________________ the inscriptions over the entrance.",
    answer: [
      "drew our attention to",
      "drew our attentions to"
    ],
    tags: "C2, phrasal verbs, fixed phrase"
  },
  {
    keyWord: "REMAIN",
    fullSentence: "Visitors are asked not to leave their seats until the lecture has ended.",
    gapFill: "Visitors are ____________________________ until the lecture has ended.",
    answer: [
      "asked to remain seated",
      "Asked to remain in their seats",
      "requested to remain in their seats",
      "Requested to remain seated"
    ],
    tags: "C2, passive voice, formal"
  },
  {
    keyWord: "DEAL",
    fullSentence: "Playing violin demands significantly more technique than playing ukulele.",
    gapFill: "Playing violin requires ____________________________ playing ukulele.",
    answer: [
      "a great deal more skill than",
      "a good deal more skill than"
    ],
    tags: "C2, comparatives and superlatives, noun phrases, quantifiers"
  },
  {
    keyWord: "GO",
    fullSentence: "Ava’s remarks about the project weren’t particularly appreciated by the team.",
    gapFill: "Ava’s remarks about the project ____________________________ well with the team.",
    answer: [
      "did not go down",
      "did not go over",
      "did not go down particularly",
      "did not go down very",
      "did not go down so",
      "did not go over particularly",
      "did not go over very",
      "did not go over so"
    ],
    tags: "C2, phrasal verbs"
  },
  {
    keyWord: "GIVEN",
    fullSentence: "Nobody ever explained why she suddenly quit the company.",
    gapFill: "No ____________________________ for her sudden decision to quit the company.",
    answer: [
      "explanations were ever given",
      "explanation was ever given"
    ],
    tags: "C2, passive voice, noun phrases"
  },
  {
    keyWord: "CAME",
    fullSentence: "Everyone was shocked when Pablo resigned.",
    gapFill: "Pablo’s resignation ____________________________ everyone.",
    answer: [
      "came as a complete surprise to",
      "came as a total surprise to",
      "came as a surprise to",
      "came as a complete shock to",
      "came as a total shock to",
      "came as a shock to"
    ],
    tags: "C2, fixed phrase, noun phrases"
  },
  {
    keyWord: "VERGE",
    fullSentence: "I was literally heading out the door when the doorbell rang.",
    gapFill: "I was ____________________________ the house when the doorbell rang.",
    answer: [
      "on the verge of leaving",
      "on the verge of going out of",
      "On the verge of heading out",
      "On the verge of heading out of"
    ],
    tags: "C2, idioms, verb patterns"
  },
  {
    keyWord: "EXTEND",
    fullSentence: "Amira made the choice to stay at the resort for another fortnight.",
    gapFill: "Amira decided ____________________________ two weeks.",
    answer: [
      "to extend her stay at the resort by",
      "To extend her stay at the resort for"
    ],
    tags: "C2, verb patterns, time expressions"
  },
  {
    keyWord: "INTENTION",
    fullSentence: "Sorry — I really wasn’t trying to disturb the meeting.",
    gapFill: "I’m sorry, I ____________________________ the meeting.",
    answer: [
      "had no intention of disturbing",
      "didn’t have any intention of disturbing"
    ],
    tags: "C2, noun phrases, formal, prepositions"
  },
  {
    keyWord: "UNLIKE",
    fullSentence: "I wonder why Eliza hasn’t arrived yet — she’s always punctual.",
    gapFill: "I wonder what’s happened to Eliza; it’s ____________________________ late.",
    answer: [
      "unlike her to be",
      "unlike her to arrive",
      "unlike her to turn up",
      "unlike her to show up",
      "most unlike her to be",
      "most unlike her to arrive",
      "most unlike her to turn up",
      "most unlike her to show up",
      "Quite unlike her to be",
      "Quite unlike her to arrive",
      "Quite unlike her to turn up",
      "Quite unlike her to show up"
    ],
    tags: "C2, contrast, fixed phrase"
  },
  {
    keyWord: "CALL",
    fullSentence: "These days, there’s almost no demand for used printers and monitors.",
    gapFill: "There is ____________________________ used printers and monitors these days.",
    answer: [
      "almost no call for",
      "virtually no call for",
      "hardly any call for",
      "scarcely any call for",
      "no call for",
      "not any call for",
      "Little call for",
      "Very little call for"
    ],
    tags: "C2, quantifiers, formal, noun phrases, phrasal verbs"
  },
  {
    keyWord: "RIGHT",
    fullSentence: "The clause clearly states that you’re entitled to extend your contract.",
    gapFill: "This clause makes ____________________________ extend your contract.",
    answer: [
      "it clear you have the right to",
      "it clear it is your right to",
      "it clear you have every right to",
      "it clear you have a right to"
    ],
    tags: "C2, formal, noun phrases"
  },
  {
    keyWord: "GREAT",
    fullSentence: "Camilla was very annoyed when she found out her daughter had taken her laptop.",
    gapFill: "To ____________________________, her daughter had taken her laptop.",
    answer: [
      "Camilla’s great annoyance"
    ],
    tags: "C2, noun phrases, formal, possessive"
  },
  {
    keyWord: "IS",
    fullSentence: "This substance must always be attended at all times.",
    gapFill: "Under ____________________________ left unattended.",
    answer: [
      "no circumstances is this substance to be",
      "no circumstances is the substance to be"
    ],
    tags: "C2, inversion, formal, passive voice"
  },
  {
    keyWord: "BOUND",
    fullSentence: "It’s almost certain that Mia will complete the manuscript by next week.",
    gapFill: "Mia ____________________________ by next week.",
    answer: [
      "is bound to have completed the manuscript",
      "is bound to have completed her manuscript"
    ],
    tags: "C2, probability, perfect, future"
  },
  {
    keyWord: "MATTER",
    fullSentence: "Eventually, Dylan will break into the music industry.",
    gapFill: "It’s only ____________________________ into the music industry.",
    answer: [
      "a matter of time before Dylan breaks",
      "a matter of time until Dylan breaks"
    ],
    tags: "C2, fixed phrase, future, time expressions"
  },
  {
    keyWord: "SUBJECT",
    fullSentence: "Due to heavy snow, delays are expected on certain bus routes.",
    gapFill: "Some bus routes ____________________________ because of the heavy snow.",
    answer: [
      "will be subject to delay",
      "are subject to delay",
      "will be subject to delays",
      "are subject to delays"
    ],
    tags: "C2, passive voice, formal"
  },
  {
    keyWord: "CONSEQUENCE",
    fullSentence: "I have no preference regarding the brand of coffee you go for.",
    gapFill: "It ____________________________ brand of coffee you choose.",
    answer: [
      "is of no consequence to me which",
      "is of little consequence to me which",
      "is of no consequence to me what",
      "is of little consequence to me what"
    ],
    tags: "C2, formal, noun phrases, prepositions"
  },
  {
    keyWord: "DECLINED",
    fullSentence: "The population of wild horses is now significantly lower than it was a decade ago.",
    gapFill: "The number of wild horses on the reserve ____________________________ decade.",
    answer: [
      "has declined significantly over the past",
      "has declined significantly in the past",
      "has declined significantly during the last",
      "has declined significantly over the last",
      "has declined significantly during the past",
      "has declined significantly in the last"
    ],
    tags: "C2, present perfect, trends, time expressions"
  },
  {
    keyWord: "DROP",
    fullSentence: "I told Natalie to send us a quick message to say she’d got there okay.",
    gapFill: "I asked Natalie ____________________________ to say she’d got there safely.",
    answer: [
      "to drop us a line",
      "to drop us a quick line",
      "to drop a line",
      "to drop a quick line"
    ],
    tags: "C2, informal, idioms, fixed phrase"
  },
  {
    keyWord: "FAILURE",
    fullSentence: "Darren was furious that Emily hadn’t responded to his proposal.",
    gapFill: "Darren thought that ____________________________ was enfuriating.",
    answer: [
      "Emily’s failure to reply to his proposal",
      "Emily's failure to respond to his proposal",
      "Emily’s failure to answer his proposal"
    ],
    tags: "C2, noun phrases, formal, possessive"
  },
  {
    keyWord: "MADE",
    fullSentence: "Emma believed it would be feasible for someone to turn the cracked jug into a flower pot.",
    gapFill: "Emma thought ____________________________ a flower pot.",
    answer: [
      "the cracked jug could be made into",
      "the cracked jug might be made into"
    ],
    tags: "C2, passive voice, modal verbs"
  },
  {
    keyWord: "HABIT",
    fullSentence: "Zak typically runs half marathons on Sundays.",
    gapFill: "Zak is ____________________________ half marathons on Sundays.",
    answer: [
      "in the habit of running"
    ],
    tags: "C2, habit, prepositions, gerunds and infinitives, noun phrases"
  },
  {
    keyWord: "HEIGHT",
    fullSentence: "During her most successful period, the CEO had exceptional authority.",
    gapFill: "At ____________________________, the CEO had exceptional authority.",
    answer: [
      "the height of her success"
    ],
    tags: "C2, noun phrases, time expressions, formal"
  },
  {
    keyWord: "MAJORITY",
    fullSentence: "Leo makes far more use of the lab than most of his classmates.",
    gapFill: "Unlike ____________________________, Leo makes extensive use of the lab.",
    answer: [
      "the vast majority of his classmates",
      "the majority of his classmates",
      "the great majority of his classmates"
    ],
    tags: "C2, contrast, quantifiers, noun phrases, formal"
  },
  {
    keyWord: "HOW",
    fullSentence: "In my opinion, his skill as a debater was most thrilling.",
    gapFill: "I was most ____________________________ debater Daniel was.",
    answer: [
      "thrilled by how skilled a",
      "thrilled by how skilful a",
      "Thrilled by how skillful a",
      "thrilled at how skilled a",
      "thrilled at how skilful a",
      "Thrilled at how skillful a"
    ],
    tags: "C2, emphasis, noun phrases, passive voice"
  },
  {
    keyWord: "herself",
    gapFill: "Paula has always ____________________________ most outstanding way.",
    fullSentence: "Paula has consistently shown outstanding dedication to her career.",
    answer: ["dedicated herself to her career in the", "committed herself to her career in the"],
    tags: "C2, reflexive pronouns, present perfect, collocations, prepositions"
  },
  {
    keyWord: "come",
    gapFill: "This hold-up is annoying, but I’m sure Fran can ____________________________ to these issues.",
    fullSentence: "This hold-up is annoying, but I’m confident Fran will solve these issues.",
    answer: ["come up with a solution", "come up with the answer", "come up with the solution"],
    tags: "C2, phrasal verbs, modals"
  },
  {
    keyWord: "delight",
    gapFill: "Much ____________________________ chosen for the national choir.",
    fullSentence: "Lara was thrilled to be chosen for the national choir.",
    answer: ["to Lara’s delight, she was", "to the delight of Lara, she was"],
    tags: "C2, fixed phrase, passive voice, fronting, possessive"
  },
  {
    keyWord: "leave",
    gapFill: "Fatima didn’t ____________________________ on the day of the event.",
    fullSentence: "Fatima wanted to make sure that every detail of the event went according to plan.",
    answer: ["want to leave anything to chance", "intend to leave anything to chance"],
    tags: "C2, idioms, verb patterns, gerunds and infinitives"
  },
  {
    keyWord: "purpose",
    gapFill: "The director’s ____________________________ to review the department’s employee turnover.",
    fullSentence: "The director organised a meeting to go over the department’s employee turnover.",
    answer: ["purpose in organising a meeting was", "purpose for organising a meeting was", "purpose for organising the meeting was", "purpose in organising the meeting was"],
    tags: "C2, gerunds and infinitives, noun phrases, purpose, prepositions"
  },
  {
    keyWord: "lacks",
    gapFill: "Odd ____________________________ formal qualifications in fashion.",
    fullSentence: "It may appear odd, the designer has no official qualifications in fashion.",
    answer: ["as it seems, the designer lacks any", "though it seems, the designer lacks any", "though it appears, the designer lacks any", "as it appears, the designer lacks any", "as it seems, the designer lacks", "though it seems, the designer lacks", "though it appears, the designer lacks", "as it appears, the designer lacks", "though it may appear the designer lacks", "as it may appear the designer lacks", "though it may seem the designer lacks", "though it may appear the designer lacks any", "as it may appear the designer lacks any", "though it may seem the designer lacks any"],
    tags: "C2, concession, contrast, fronting"
  },
  {
    keyWord: "occurred",
    gapFill: "It has never ____________________________ the concierge for dining advice.",
    fullSentence: "It never crossed my mind to ask the concierge where to eat.",
    answer: ["occurred to me to ask", "occurred to me that I could ask", "occurred to me I could ask"],
    tags: "C2, fixed phrase, past simple, negatives"
  },
  {
    keyWord: "hard",
    gapFill: "No matter ____________________________, I couldn’t convince Mia to attend the show.",
    fullSentence: "Even though I tried everything, I couldn’t convince Mia to attend the show.",
    answer: ["how hard I tried", "how much I tried"],
    tags: "C2, concession, emphasis"
  },
  {
    keyWord: "light",
    gapFill: "The authorities had to release the accused ____________________________ evidence that emerged.",
    fullSentence: "The authorities were forced to release the accused after new proof emerged.",
    answer: ["in light of the new", "in the light of the new", "in the light of new", "in light of new"],
    tags: "C2, linking, formal, noun phrases, idioms"
  },
  {
    keyWord: "sharp",
    gapFill: "There has been ____________________________ wood and cement in recent months.",
    fullSentence: "The price of wood and cement has gone up significantly in recent months.",
    answer: ["a sharp rise in the price of", "a sharp increase in the price of"],
    tags: "C2, noun phrases, quantifiers, trends"
  },
  {
    keyWord: "waited",
    gapFill: "Lena ____________________________ before breaking the news.",
    fullSentence: "Lena didn’t break the news to Josh until he’d cleared his plate.",
    answer: ["waited for Josh to clear his plate", "waited until Josh had cleared his plate"],
    tags: "C2, past perfect, time clauses, verb patterns"
  },
  {
    keyWord: "taken",
    gapFill: "Don’t let ____________________________ his casual style. He's extremely sharp in negotiations.",
    fullSentence: "Don’t be fooled by Max’s casual style — he’s extremely sharp in negotiations.",
    answer: ["yourself be taken in by", "yourself get taken in by"],
    tags: "C2, passive voice, reflexive pronouns, idioms, phrasal verbs"
  },
  {
    keyWord: "no",
    gapFill: "Providing ____________________________  the situation, we’ll leave in the evening.",
    fullSentence: "We’ll leave in the evening unless the situation changes dramatically.",
    answer: ["there is no dramatic change in", "there are no dramatic changes in", "there is no dramatic change to", "there are no dramatic changes to"],
    tags: "C2, conditionals, noun phrases, linking, formal"
  },
  {
    keyWord: "terms",
    gapFill: "Mateo found it difficult ____________________________ losing his job.",
    fullSentence: "Mateo struggled to accept that he was no longer employed.",
    answer: ["to come to terms with", "coming to terms with"],
    tags: "C2, idioms, gerunds and infinitives, fixed phrase"
  },
  {
    keyWord: "has",
    gapFill: "Ben ____________________________ his cousin again.",
    fullSentence: "Ben never intends to visit his cousin again.",
    answer: ["has no intention of visiting", "has no plans of visiting", "has no intention of ever visiting", "has no plans of ever visiting"],
    tags: "C2, fixed phrase, noun phrases, formal, prepositions"
  },
  {
    keyWord: "believe",
    gapFill: "Sam ____________________________ he would win the competition.",
    fullSentence: "They made Sam think he would to win the competition.",
    answer: ["was led to believe that", "was given to believe that", "was led to believe", "was given to believe"],
    tags: "C2, passive voice, gerunds and infinitives, formal"
  },
  {
    keyWord: "how",
    gapFill: "Little does ____________________________ a table at that restaurant is.",
    fullSentence: "Kyra is completely unaware of the difficulty of getting a table at that restaurant.",
    answer: ["Kyra know how difficult getting", "Kyra realise how difficult getting", "Kyra suspect how difficult getting", "Kyra know how hard getting", "Kyra realise how hard getting", "Kyra suspect how hard getting"],
    tags: "C2, inversion, indirect questions, emphasis"
  },
  {
    keyWord: "made",
    gapFill: "The first speaker ____________________________ the panel.",
    fullSentence: "From the moment he spoke, the panel were impressed by his confidence.",
    answer: ["made an instant impression on", "made an immediate impression on"],
    tags: "C2, fixed phrase, noun phrases, formal"
  },
  {
    keyWord: "ease",
    gapFill: "Sam’s parents ____________________________ their warm greeting.",
    fullSentence: "Sam’s parents greeted me so warmly that I felt comfortable.",
    answer: ["put me at ease with", "made me feel at ease with"],
    tags: "C2, idioms, verb patterns, noun phrases, prepositions"
  },
  {
    keyWord: "whatsoever",
    gapFill: "There ____________________________  the quarry.",
    fullSentence: "The quarry was completely devoid of valuable minerals.",
    answer: ["were no valuable minerals whatsoever in", "were not any valuable materials whatsoever in"],
    tags: "C2, emphasis, formal, quantifiers"
  },
  {
    keyWord: "ever",
    gapFill: "Under ____________________________ with that band again.",
    fullSentence: "We’ve made it clear we won’t collaborate with that brand again — no exceptions.",
    answer: ["no circumstances will we ever collaborate", "no circumstances whatsoever will we ever collaborate"],
    tags: "C2, inversion, fixed phrase, emphasis"
  },
  {
    keyWord: "came",
    gapFill: "Leo ____________________________ that accepting the offer was best.",
    fullSentence: "Eventually, Leo concluded that accepting the offer was the best option.",
    answer: ["came to the conclusion", "came to the realisation", "came to the realization", "came to the conclusion that", "came to the realisation that", "came to the realization that"],
    tags: "C2, fixed phrase, noun phrases, prepositions, formal"
  },
  {
    keyWord: "mood",
    gapFill: "Bella ____________________________ anything social last night.",
    fullSentence: "Last night, Bella didn't feel like doing anything social.",
    answer: ["was not in the mood to do", "was not in any mood to do", "was not in the mood for doing", "was in no mood to do", "was in no mood for doing"],
    tags: "C2, idioms, noun phrases, prepositions"
  },
  {
    keyWord: "aback",
    gapFill: "Everyone ____________________________ the president’s arrest.",
    fullSentence: "The announcement that the president had been arrested was a great shock.",
    answer: ["was taken aback by the announcement of", "was taken aback at the announcement of"],
    tags: "C2, passive voice, phrasal verbs, noun phrases"
  },
  {
    keyWord: "it",
    gapFill: "Had ____________________________ the new fitness routine, Ravi would never have qualified.",
    fullSentence: "If he hadn't had a new fitness routine, Ravi would never have qualified for the finals.",
    answer: ["it not been for"],
    tags: "C2, inversion, conditionals, formal, emphasis"
  },
  {
    keyWord: "concern",
    gapFill: "Finn told his mother that what he ____________________________ of hers.",
    fullSentence: "‘What I choose to do with my time is none of your business!’ Finn said to his mother.",
    answer: ["did with his time was no concern", "was doing with his time was no concern"],
    tags: "C2, reported speech, noun phrases, cleft sentences, emphasis"
  },
  {
    keyWord: "point",
    gapFill: "I ____________________________ when Leo arrived.",
    fullSentence: "I was just about to leave the gym when Leo called.",
    answer: ["was on the point of leaving the gym", "was on the point of leaving"],
    tags: "C2, time expressions, fixed phrase, prepositions"
  },
  {
    keyWord: "sooner",
    gapFill: "No ____________________________ I realised I’d left my bag at home.",
    fullSentence: "I’d barely got into the taxi when I realised I’d left my bag at home.",
    answer: ["sooner had I got into the taxi than", "sooner had I got in the taxi than"],
    tags: "C2, inversion, time clauses, past perfect, emphasis"
  },
  {
    keyWord: "notice",
    gapFill: "Lucas ____________________________ his brother’s advice.",
    fullSentence: "Lucas paid no attention at all to what his brother told him.",
    answer: [
      "took absolutely no notice of",
      "took no notice whatsoever of",
      "took no notice of",
      "took no notice at all of",
      "did not take any notice of",
      "did not take notice at all of",
      "did not take any notice whatsoever of"
    ],
    tags: "C2, emphasis, fixed phrase, prepositions, noun phrases"
  },
  {
    keyWord: "time",
    gapFill: "This is ____________________________ school early without telling anyone.",
    fullSentence: "Erin has left school early without telling anyone in the past.",
    answer: ["not the first time Erin has left", "not the first time that Erin has left"],
    tags: "C2, present perfect, time expressions"
  },
  {
    keyWord: "better",
    gapFill: "Sonia is ____________________________ than as a poet.",
    fullSentence: "Most people know more about Sonia’s journalism than her poetry.",
    answer: ["better known as a journalist", "better known as a writer"],
    tags: "C2, comparatives and superlatives, passive voice, noun phrases, prepositions"
  },
  {
    keyWord: "brought",
    gapFill: "It ____________________________ that you’ve missed every deadline this month.",
    fullSentence: "I've just been informed you’ve missed every deadline this month.",
    answer: ["has been brought to my attention", "has just been brought to my attention"],
    tags: "C2, passive voice, formal, present perfect, noun phrases"
  },
  {
    keyWord: "complete",
    gapFill: "There was _________________________ the two directors.",
    fullSentence: "The two directors didn’t trust each other in any way.",
    answer: [
      "complete distrust between",
      "a complete lack of trust between",
      "a complete absence of trust",
      "complete mistrust between"
    ],
    tags: "C2, noun phrases, emphasis, quantifiers"
  },
  {
    keyWord: "reference",
    gapFill: "In her memoirs, the actress _________________________ of her drama coach.",
    fullSentence: "In her memoirs, the actress didn’t acknowledge the impact of her drama coach.",
    answer: [
      "made no reference to the impact",
      "did not make any reference to the impact"
    ],
    tags: "C2, noun phrases, reporting, prepositions"
  },
  {
    keyWord: "event",
    gapFill: "The celebration _________________________ his party’s victory.",
    fullSentence: "If his party wins, they will hold the celebration indoors.",
    answer: [
      "will be held indoors in the event of",
      "will take place indoors in the event of"
    ],
    tags: "C2, conditionals, formal, prepositions, linking"
  },
  {
    keyWord: "arrival",
    gapFill: "Maya took _________________________ at the party.",
    fullSentence: "We were surprised when Maya arrived suddenly at the party",
    answer: [
      "us by surprise with her sudden arrival",
      "us by surprise by her sudden arrival"
    ],
    tags: "C2, fixed phrase, noun phrases"
  },
  {
    keyWord: "more",
    gapFill: "There’s _________________________ to spend some time living abroad.",
    fullSentence: "What I’d love more than anything is to spend some time living abroad.",
    answer: [
      "nothing I would love more than",
      "nothing that I would love more than",
      "nothing would please me more than",
      "nothing that would please me more than",
      "nothing would give me more pleasure than",
      "nothing that would give me more pleasure than",
      "Nothing that I would like more than",
      "Nothing I would like more than"
    ],
    tags: "C2, emphasis, cleft sentences, noun phrases, comparatives and superlatives"
  },
  {
    keyWord: "her",
    gapFill: "The manager explained that had _________________________ would have been dismissed.",
    fullSentence: "The manager explained that the executive’s language skills was the sole reason she avoided dismissal.",
    answer: ["it not been for her language skills she"],
    tags: "C2, conditionals, inversion, emphasis, unreal conditionals"
  },
  {
    keyWord: "suppose",
    gapFill: "I’ve _________________________ the factory ignored safety procedures.",
    fullSentence: "To the best of my knowledge, the factory followed all safety procedures.",
    answer: [
      "no reason to suppose",
      "no grounds to suppose"
    ],
    tags: "C2, negation, noun phrases"
  },
  {
    keyWord: "threat",
    gapFill: "My phone says _________________________ in the mountains later.",
    fullSentence: "My phone says there could be storms in the mountains later.",
    answer: [
      "there is a threat of storms",
      "there is the threat of storms",
      "That there is a threat of storms",
      "That there is the threat of storms"
    ],
    tags: "C2, probability, noun phrases, future, idioms"
  },
  {
    keyWord: "over",
    gapFill: "It _________________________ the server.",
    fullSentence: "The technician spent more than four hours repairing the server.",
    answer: ["took the technician over four hours to repair"],
    tags: "C2, time expressions, verb patterns"
  },
  {
    keyWord: "anywhere",
    gapFill: "I was _________________________ that had the book in stock.",
    fullSentence: "I couldn’t find a single place that had the book in stock.",
    answer: [
      "unable to find anywhere",
      "not able to find anywhere"
    ],
    tags: "C2, ability, modality, negation"
  },
  {
    keyWord: "intention",
    gapFill: "I _________________________ to technical support operators all afternoon",
    fullSentence: "I refuse to spend the whole afternoon speaking to technical support operators.",
    answer: [
      "have no intention of speaking",
      "do not have any intention of speaking",
      "have not got any intention of speaking",
      "have little intention of speaking"
    ],
    tags: "C2, verb patterns, modality, noun phrases, negation, formal"
  },
  {
    keyWord: "broke",
    gapFill: "A _________________________ the two candidates over education policy.",
    fullSentence: "The two candidates started to debate passionately about education policy.",
    answer: ["passionate debate broke out between"],
    tags: "C2, phrasal verbs, noun phrases"
  },
  {
    keyWord: "dislike",
    gapFill: "Much _________________________ his leadership style.",
    fullSentence: "I respect Jasper’s creativity, but his leadership style leaves much to be desired.",
    answer: ["as I respect Jasper’s creativity I dislike"],
    tags: "C2, contrast, concession, linking, fronting"
  },
  {
    keyWord: "aware",
    gapFill: "As _________________________, Claudia is settling in well abroad.",
    fullSentence: "From what I can tell, Claudia’s settling in well abroad.",
    answer: ["far as I am aware"],
    tags: "C2, fixed phrase, linking"
  },
  {
    keyWord: "reason",
    gapFill: "Technical issues were given _________________________ in releasing the update.",
    fullSentence: "Technical issues were held responsible for the delayed release of the software update.",
    answer: [
      "as the reason for the delay",
      "as the reason for a delay"
    ],
    tags: "C2, noun phrases, causality, linking"
  },
  {
    keyWord: "live",
    gapFill: "The author’s latest novel _________________________ of the fans.",
    fullSentence: "Fans were underwhelmed by the author’s highly anticipated latest novel.",
    answer: [
      "did not live up to the expectations",
      "failed to live up to the expectations"
    ],
    tags: "C2, idioms, noun phrases, phrasal verbs"
  },
  {
    keyWord: "took",
    gapFill: "The company’s _________________________ surprise.",
    fullSentence: "Everyone was surprised when the company changed its objectives",
    answer: [
      "change in objectives took everyone by",
      "change of objectives took everyone by",
      "objective change took everyone by"
    ],
    tags: "C2, fixed phrase, noun phrases, prepositions"
  },
  {
    keyWord: "did",
    gapFill: "Only _________________________ to finish his thesis.",
    fullSentence: "After studying for years, Tomas was eventually able to finish his thesis.",
    answer: [
      "After years of studying did Tomas manage",
      "after studying for years did Tomas manage",
      "After years of study did Tomas manage"
    ],
    tags: "C2, inversion, emphasis, time expressions"
  },
  {
    keyWord: "speed",
    gapFill: "The _________________________ change could not have been foreseen.",
    fullSentence: "Nobody could have realized how fast the temperature would change.",
    answer: [
      "speed at which the temperature would",
      "speed with which the temperature would",
      "speed of the temperature"
    ],
    tags: "C2, relative clauses, noun phrases, emphasis"
  },
  {
    keyWord: "dark",
    gapFill: "The teacher _________________________ about the next exam.",
    fullSentence: "The teacher revealed absolutely nothing to his students about the next exam.",
    answer: [
      "kept his students in the dark",
      "left his students in the dark"
    ],
    tags: "C2, idioms, prepositions"
  },
  {
    keyWord: "being",
    gapFill: "Far _________________________ behaviour, his parents seem to enjoy it.",
    fullSentence: "His parents appear to find the way Max behaves more enjoyable than a cause for shock.",
    answer: ["from being shocked by Max’s"],
    tags: "C2, contrast, fixed phrase, linking"
  },
  {
    keyWord: "reputed",
    gapFill: "Mr Holt _________________________ economist.",
    fullSentence: "Mr Holt is known for his reliability and knowledge as an economist.",
    answer: ["is reputed to be a reliable and knowledgeable", "is reputed for being a reliable and knowledgeable"],
    tags: "C2, passive voice, verb patterns"
  },
  {
    keyWord: "hold",
    gapFill: "Unless I _________________________ the lab results, I won’t be able to complete the analysis.",
    fullSentence: "Without access to the lab results, I won’t be able to finish the analysis.",
    answer: [
      "get hold of",
      "can get hold of",
      "get a hold of",
      "can get a hold of"
    ],
    tags: "C2, fixed phrase, conditionals, informal"
  },
  {
    keyWord: "hope",
    gapFill: "The dancers trained intensively _________________________ a spot in the national company.",
    fullSentence: "All the dancers put in extra hours in order to get a spot in the national company.",
    answer: [
      "in the hope of getting",
      "with the hope of getting"
    ],
    tags: "C2, noun phrases, purpose, verb patterns"
  },
  {
    keyWord: "rumoured",
    gapFill: "According to Silvia, the journalist _________________________ the story to another publication.",
    fullSentence: "Silvia believes the journalist has sold the story to another publication.",
    answer: ["is rumoured to have sold"],
    tags: "C2, reporting verbs, modality, perfect, passive voice, reported speech"
  },
  {
    keyWord: "of",
    gapFill: "Noah had little _________________________ a success.",
    fullSentence: "Noah didn’t expect that the proposal would work out.",
    answer: [
      "expectation of the proposal being",
      "expectation of the proposal’s being",
      "expectation of her proposal being",
      "expectation of her proposal’s being"
    ],
    tags: "C2, noun phrases, modality, verb patterns, formal"
  },
  {
    keyWord: "exception",
    gapFill: "With _________________________, Henry is an expert in every department.",
    fullSentence: "Henry knows every department inside out, apart from logistics.",
    answer: ["the exception of logistics"],
    tags: "C2, exceptions, prepositions, noun phrases"
  },
  {
    keyWord: "on",
    gapFill: "What Zoe _________________________ running first thing in the morning.",
    fullSentence: "Zoe really loves her early morning run.",
    answer: [
      "is keen on doing is",
      "is really keen on doing is",
      "is keen on is",
      "is really keen on is"
    ],
    tags: "C2, verb patterns, emphasis, cleft sentences"
  },
  {
    keyWord: "bears",
    gapFill: "This updated tablet _________________________ last year’s model.",
    fullSentence: "The updated tablet is completely different from last year’s version.",
    answer: [
      "bears no resemblance to",
      "bears little resemblance to",
      "bears no similarity to",
      "bears little similarity to"
    ],
    tags: "C2, emphasis, noun phrases, comparatives and superlatives, formal"
  },
  {
    keyWord: "reason",
    gapFill: "Maria’s _________________________ to work on her accent.",
    fullSentence: "Maria visited New York primarily to improve her accent.",
    answer: [
      "reason for visiting New York was",
      "main reason for visiting New York was",
      "primary reason for visiting New York was"
    ],
    tags: "C2, noun phrases, purpose, linking"
  },
  {
    keyWord: "are",
    gapFill: "Employees _________________________ restructuring plans by the board.",
    fullSentence: "The board plans to warn employees about restructuring plans.",
    answer: [
      "are to be warned about",
      "are to be warned regarding",
      "are to be warned concerning",
      "are to be warned over",
      "are expected to be warned about",
      "are set to be warned about"
    ],
    tags: "C2, passive voice, modality, formal, future"
  },
  {
    keyWord: "escaping",
    gapFill: "There is  _________________________ we’ll have to work faster to meet the deadline.",
    fullSentence: "It cannot be denied that we’ll need to speed things up if we want to meet the deadline.",
    answer: [
      "no escaping the fact that",
      "no escaping the fact",
      "no way of escaping the fact",
      "no way of escaping the fact that",
      "Little escaping the fact that",
      "Little escaping that fact"
    ],
    tags: "C2, fixed phrase, emphasis, modality, probability"
  }
];

transformations.forEach(obj => {
  if (!obj.fullSentence || !obj.keyWord) {
    console.error("Incomplete transformation detected:", obj);
  }
});

const game = new KeywordTransformationGame(transformations);
game.checkForSharedSet();
