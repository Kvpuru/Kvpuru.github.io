const puzzleState = {
  scrambleSolved: false,
  riddleSolved: false,
  matchSolved: false,
};

const scrambleAnswer = "LOVE";
const riddles = [
  {
    question:
      "I speak without a mouth and hear without ears. I have nobody, but I come alive with the wind. What am I?",
    answers: ["ECHO"],
    success: "Yes! The wind carries an echo.",
  },
  {
    question:
      "The more you take, the more you leave behind. What are they?",
    answers: ["FOOTSTEPS", "FOOTSTEP", "STEPS", "STEP"],
    success: "Correct! Footsteps are the trail of memories.",
  },
  {
    question:
      "I am full of holes, yet I still hold water. What am I?",
    answers: ["SPONGE"],
    success: "Right! A sponge holds every drop of love.",
  },
  {
    question:
      "I’m light as a feather, yet the strongest person can’t hold me for long. What am I?",
    answers: ["BREATH", "YOUR BREATH"],
    success: "Yes! A gentle breath, like a whispered secret.",
  },
];

const startJourneyButton = document.getElementById("startJourney");
const scrollToPuzzlesButton = document.getElementById("scrollToPuzzles");
const revealLetterButton = document.getElementById("revealLetter");
const lockMessage = document.getElementById("lockMessage");
const loveLetter = document.getElementById("loveLetter");

const scrambleInput = document.getElementById("scrambleInput");
const scrambleFeedback = document.getElementById("scrambleFeedback");
const checkScrambleButton = document.getElementById("checkScramble");

const riddleInput = document.getElementById("riddleInput");
const riddleFeedback = document.getElementById("riddleFeedback");
const checkRiddleButton = document.getElementById("checkRiddle");
const riddlePrompt = document.getElementById("riddlePrompt");
const riddleCount = document.getElementById("riddleCount");
const prevRiddleButton = document.getElementById("prevRiddle");
const nextRiddleButton = document.getElementById("nextRiddle");

const matchGrid = document.getElementById("matchGrid");
const matchFeedback = document.getElementById("matchFeedback");
const resetMatchButton = document.getElementById("resetMatch");
const openProfileButton = document.getElementById("openProfile");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const closeProfileButton = document.getElementById("closeProfileButton");

const cards = ["🌸", "🌸", "💌", "💌", "🍫", "🍫"];
let flippedCards = [];
let matchesFound = 0;
let currentRiddleIndex = 0;

const normalizeAnswer = (value) => value.trim().toUpperCase();

const updateFinalLock = () => {
  const allSolved =
    puzzleState.scrambleSolved &&
    puzzleState.riddleSolved &&
    puzzleState.matchSolved;

  if (allSolved) {
    lockMessage.textContent = "All puzzles solved. The letter is ready!";
    revealLetterButton.disabled = false;
  } else {
    const remaining = [
      puzzleState.scrambleSolved ? null : "scramble",
      puzzleState.riddleSolved ? null : "riddle",
      puzzleState.matchSolved ? null : "match",
    ].filter(Boolean);
    lockMessage.textContent = `Solve the ${remaining.join(
      ", "
    )} puzzle(s) to unlock the letter.`;
  }
};

const handleScrambleCheck = () => {
  const answer = normalizeAnswer(scrambleInput.value);
  if (!answer) {
    scrambleFeedback.textContent = "Type an answer first.";
    return;
  }

  if (answer === scrambleAnswer) {
    puzzleState.scrambleSolved = true;
    scrambleFeedback.textContent = "Correct! Love is in the air.";
    scrambleInput.disabled = true;
    checkScrambleButton.disabled = true;
    updateFinalLock();
  } else {
    scrambleFeedback.textContent = "Not quite. Try rearranging again.";
  }
};

const handleRiddleCheck = () => {
  const answer = normalizeAnswer(riddleInput.value);
  if (!answer) {
    riddleFeedback.textContent = "Whisper an answer.";
    return;
  }

  const currentRiddle = riddles[currentRiddleIndex];
  const isCorrect = currentRiddle.answers.some(
    (item) => normalizeAnswer(item) === answer
  );

  if (isCorrect) {
    puzzleState.riddleSolved = true;
    riddleFeedback.textContent = currentRiddle.success;
    riddleInput.disabled = true;
    checkRiddleButton.disabled = true;
    prevRiddleButton.disabled = true;
    nextRiddleButton.disabled = true;
    updateFinalLock();
  } else {
    riddleFeedback.textContent = "That is not it. Try another answer.";
  }
};

const renderRiddle = () => {
  const currentRiddle = riddles[currentRiddleIndex];
  riddlePrompt.textContent = currentRiddle.question;
  riddleCount.textContent = `${currentRiddleIndex + 1} / ${riddles.length}`;
  riddleInput.value = "";
  riddleFeedback.textContent = "Stuck? Switch the riddle with the arrows.";
};

const handleRiddleNavigation = (direction) => {
  if (puzzleState.riddleSolved) {
    return;
  }
  currentRiddleIndex =
    (currentRiddleIndex + direction + riddles.length) % riddles.length;
  renderRiddle();
};

const shuffleCards = (values) => {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};

const renderMatchCards = () => {
  matchGrid.innerHTML = "";
  const shuffled = shuffleCards(cards);
  shuffled.forEach((icon) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.setAttribute("aria-label", "Hidden card");
    card.dataset.icon = icon;
    card.textContent = "❓";
    card.addEventListener("click", () => handleCardFlip(card));
    matchGrid.appendChild(card);
  });
  flippedCards = [];
  matchesFound = 0;
  matchFeedback.textContent = "Find all three pairs.";
};

const handleCardFlip = (card) => {
  if (
    card.classList.contains("is-flipped") ||
    card.classList.contains("is-matched") ||
    flippedCards.length === 2
  ) {
    return;
  }

  card.classList.add("is-flipped");
  card.textContent = card.dataset.icon;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    const [first, second] = flippedCards;
    if (first.dataset.icon === second.dataset.icon) {
      first.classList.add("is-matched");
      second.classList.add("is-matched");
      flippedCards = [];
      matchesFound += 1;
      if (matchesFound === cards.length / 2) {
        puzzleState.matchSolved = true;
        matchFeedback.textContent = "Bouquet complete! You did it.";
        updateFinalLock();
      } else {
        matchFeedback.textContent = "Sweet match! Keep going.";
      }
    } else {
      matchFeedback.textContent = "Not a match. Try again.";
      setTimeout(() => {
        flippedCards.forEach((item) => {
          item.classList.remove("is-flipped");
          item.textContent = "❓";
        });
        flippedCards = [];
      }, 700);
    }
  }
};

const handleRevealLetter = () => {
  loveLetter.hidden = false;
  revealLetterButton.disabled = true;
  revealLetterButton.textContent = "Letter revealed";
};

startJourneyButton.addEventListener("click", () => {
  document.getElementById("journey").scrollIntoView({ behavior: "smooth" });
});

scrollToPuzzlesButton.addEventListener("click", () => {
  document.getElementById("puzzles").scrollIntoView({ behavior: "smooth" });
});

checkScrambleButton.addEventListener("click", handleScrambleCheck);
checkRiddleButton.addEventListener("click", handleRiddleCheck);
prevRiddleButton.addEventListener("click", () => handleRiddleNavigation(-1));
nextRiddleButton.addEventListener("click", () => handleRiddleNavigation(1));
resetMatchButton.addEventListener("click", renderMatchCards);
revealLetterButton.addEventListener("click", handleRevealLetter);

renderMatchCards();
renderRiddle();
updateFinalLock();

const openProfileModal = () => {
  profileModal.classList.add("is-open");
  profileModal.setAttribute("aria-hidden", "false");
};

const closeProfileModal = () => {
  profileModal.classList.remove("is-open");
  profileModal.setAttribute("aria-hidden", "true");
};

openProfileButton.addEventListener("click", openProfileModal);
closeProfile.addEventListener("click", closeProfileModal);
closeProfileButton.addEventListener("click", closeProfileModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && profileModal.classList.contains("is-open")) {
    closeProfileModal();
  }
});
