function loadScript(url, callback) {
  const script = document.createElement("script");
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
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

  // (Filter UI code remains unchanged...)
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
        
        /* Force the gradient to fill the entire viewport */
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
        margin-top: 5%; /* push the container down a bit */
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
      #filter-container select {
        padding: 10px;
        font-size: 16px;
        margin: 0 auto 20px;
        border-radius: 5px;
        border: none;
        background-color: #f2f2f2;
        color: #333;
        min-width: 180px;
        transition: box-shadow 0.3s;
      }
      #filter-container select:focus {
        outline: none;
        box-shadow: 0 0 6px #FFD700;
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
    </style>
    <div id="filter-container">
      <h1>Keyword Transformation Game</h1>
      <p>Select Level:</p>
      <select id="levelSelect">
        <option value="all">All Levels</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>
      </select>
      <p>Select Tag:</p>
      <select id="tagSelect">
        <option value="all">All Tags</option>
      </select>
      <br>
      <button id="startGameBtn">Start Game</button>
    </div>
  `;
  
  document.getElementById("levelSelect").addEventListener("change", () => this.updateTagOptions());
  document.getElementById("startGameBtn").addEventListener("click", () => this.startGame());
  this.updateTagOptions();
}




  updateTagOptions() {
    // (Code remains unchanged)
    const level = document.getElementById("levelSelect").value;
    let relevant = (level === "all") 
      ? this.allTransformations 
      : this.allTransformations.filter(t => {
          let tags = t.tags.split(",").map(s => s.trim().toLowerCase());
          return tags.includes(level.toLowerCase());
        });
    let tagSet = new Set();
    relevant.forEach(t => {
  t.tags.split(",")
    .map(s => s.trim().toLowerCase())
    .filter(s => s !== "")
    .forEach(tag => {
      // If you want to exclude b2, c1, c2 in any case:
      if (!["b2", "c1", "c2"].includes(tag)) {
        tagSet.add(tag);
      }
    });
});
    const tagArray = Array.from(tagSet).sort();
    const tagSelect = document.getElementById("tagSelect");
    tagSelect.innerHTML = `<option value="all">All Tags</option>`;
    tagArray.forEach(tag => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagSelect.appendChild(option);
    });
  }

  startGame() {
    const level = document.getElementById("levelSelect").value;
    const tag = document.getElementById("tagSelect").value;
    let filtered = this.allTransformations;
    if (level !== "all") {
      filtered = filtered.filter(t => {
        let tags = t.tags.split(",").map(s => s.trim().toLowerCase());
        return tags.includes(level.toLowerCase());
      });
    }
    if (tag !== "all") {
      filtered = filtered.filter(t => {
        let tags = t.tags.split(",").map(s => s.trim().toLowerCase());
        return tags.includes(tag.toLowerCase());
      });
    }
    if (filtered.length === 0) {
      alert("No transformations found for the selected filters.");
      return;
    }
    this.selectedChallenges = this.shuffle(filtered).slice(0, 8);
    this.score = 0;
    this.initGameUI();
  }

  initGameUI() {
    // Build HTML for each challenge, each with its own submit button.
    let challengesHTML = "";
    // Inside initGameUI() where challengesHTML is built:
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

  let expectedLength = "";
  if (levelTag === "c1") {
    expectedLength = "3-7 words";
  } else if (levelTag === "b2") {
    expectedLength = "2-5 words";
  } else if (levelTag === "c2") {
    expectedLength = "3-8 words";
  }

  challengesHTML += `
    <div class="challenge" style="margin-bottom:20px; padding:10px; background: rgba(0,0,0,0.6); border-radius:5px;">
      <p class="fullSentence">Full sentence: ${highlightedFull}</p>
      <p class="keyword" style="font-size:1.5em; font-weight:bold;">
         <span class="keyword-label" style="color: #235a8c;">Key word:</span>
         <span class="keyword-value" style="color: #FFD700;"> ${challenge.keyWord}</span>
      </p>
      <p class="gapFillPrompt">Fill in the blank: ${challenge.gapFill}</p>
      <p class="word-spec" style="color: #FF5733;">Expected answer length: ${expectedLength}</p>
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
    </style>
    <div id="game-container">
      <h1>Transformation Challenge</h1>
      ${challengesHTML}
      <p>Score: <span id="score">0</span></p>
      <button id="downloadReport">Download Report</button>
      <button id="reviewMistakes">Review Mistakes</button>
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
           <span class="keyword-value" style="color: #FFD700;"> ${challenge.keyWord}</span>
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
    tags: "C1, fixed phrase, future in the past"
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
    tags: "C1, comparatives"
  },
  {
    keyWord: "wonder",
    gapFill: "I __________________ her umbrella at home this morning.",
    fullSentence: "Could Sofia have forgotten her umbrella this morning?",
    answer: ["wonder if Sofia has left", "wonder if Sofia could have left", "wonder whether Sofia has left", "wonder whether Sofia could have left"],
    tags: "C1, modal verbs, past modals, indirect questions"
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
    "tags": "C1, fronting"
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
    "tags": "C1, general structure"
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
    "gapFill": "Jay’s startup was _____________________ during its first year.",
    "fullSentence": "Jay’s startup didn’t achieve much success during its first year.",
    "answer": "not so successful",
    "tags": "C1, comparatives"
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
    tags: "C1, fixed phrase, noun phrases"
  },
  {
    keyWord: "single",
    fullSentence: "By the time we got to the bakery, all the bread had gone.",
    gapFill: "By the time we got to the bakery, there _______________________ loaf left.",
    answer: ["was not a single", "was not one single"],
    tags: "C1, quantifiers, exceptions"
  },
  {
    keyWord: "so",
    fullSentence: "The performance was too loud for us to stay until the end.",
    gapFill: "If _______________________ noise, we might have stayed until the end of the performance.",
    answer: "there had not been so much",
    tags: "C1, conditionals"
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
    tags: "C1, fixed phrase, future, noun phrase"
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
    tags: "C1, formal, fixed phrase, prepositions, noun phrase"
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
    answer: ["account should this gate be", "account should this gate be kept"],
    tags: "C1, modal verbs, inversion"
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
    tags: "C1, question forms, prepositions"
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
  }
];

const game = new KeywordTransformationGame(transformations);
