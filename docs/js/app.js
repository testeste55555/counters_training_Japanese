    (() => {
      "use strict";

      const { counterData } = window.CounterTrainingData;
      const { drawBalanced: drawFromBag, makeRemainingPlan, reset: resetRandomizer } = window.CounterTrainingRandomizer;

      const counterKeys = Object.keys(counterData);
      const state = {
        mode: "flash",
        selectedCounters: new Set(counterKeys),
        max: 10,
        history: [],
        historyIndex: -1,
        answerVisible: false,
        chartIndex: 0,
        drawBags: new Map(),
        lastDraws: new Map(),
        remainingPlan: [],
        remainingRecentKeys: [],
        speechRate: 1,
        speechVolume: 1,
        autoSpeech: false,
        manualCompact: false
      };

      const speechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
      let japaneseVoice = null;
      let activeSpeechButton = null;

      const home = document.getElementById("home");
      const quiz = document.getElementById("quiz");
      const chart = document.getElementById("chart");
      const practiceSetup = document.getElementById("practice-setup");
      const rangeSetup = document.getElementById("range-setup");
      const bottomSetup = document.getElementById("bottom-setup");
      const startButton = document.getElementById("start");
      const selectionStatus = document.getElementById("selection-status");
      const objects = document.getElementById("objects");
      const itemName = document.getElementById("item-name");
      const modeTag = document.getElementById("mode-tag");
      const quizTitle = document.getElementById("quiz-title");
      const answerPanel = document.getElementById("answer-panel");
      const answerReading = document.getElementById("answer-reading");
      const answerSentence = document.getElementById("answer-sentence");
      const answerButton = document.getElementById("answer");
      const previousButton = document.getElementById("previous");
      const roleQuestion = document.getElementById("role-question");
      const questionSentence = document.getElementById("question-sentence");
      const questionPanel = document.querySelector(".question-panel");
      const roleLabel = document.querySelector(".role-label");
      const answerLabel = document.querySelector(".answer-label");
      const speakQuestionButton = document.getElementById("speak-question");
      const speakAnswerButton = document.getElementById("speak-answer");
      const autoplayButton = document.getElementById("autoplay-button");
      const speechVolume = document.getElementById("speech-volume");
      const volumeValue = document.getElementById("volume-value");
      const speechStatus = document.getElementById("speech-status");
      const displaySizeButton = document.getElementById("display-size-button");
      const displaySizeIcon = document.getElementById("display-size-icon");
      const displaySizeLabel = document.getElementById("display-size-label");

      function syncQuizDensity() {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const autoCompact = viewportHeight < 760;
        quiz.classList.toggle("compact-view", autoCompact || state.manualCompact);
        quiz.classList.toggle("compact-extra", autoCompact && state.manualCompact);
        displaySizeButton.setAttribute("aria-pressed", String(state.manualCompact));
        displaySizeButton.title = state.manualCompact ? "ひょうじを もどす" : "ひょうじを ちいさくする";
        displaySizeIcon.textContent = state.manualCompact ? "↗" : "↘";
        displaySizeLabel.textContent = state.manualCompact ? "もどす" : "ちいさく";
      }

      function drawBalanced(key, candidates, identity = (value) => String(value)) {
        return drawFromBag(state, key, candidates, identity);
      }

      function resetBalancedDraws() {
        resetRandomizer(state);
      }

      function clearSpeakingState() {
        if (activeSpeechButton) activeSpeechButton.classList.remove("speaking");
        activeSpeechButton = null;
      }

      function stopSpeech() {
        if (speechSupported) window.speechSynthesis.cancel();
        clearSpeakingState();
      }

      function loadJapaneseVoice() {
        if (!speechSupported) return;
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoices = voices.filter((voice) => /^ja(?:-|_)/i.test(voice.lang));
        japaneseVoice = japaneseVoices.find((voice) =>
          /natural|premium|google|microsoft/i.test(voice.name)
        ) || japaneseVoices[0] || null;
      }

      function speakText(text, button) {
        if (!speechSupported || !text) return;
        stopSpeech();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        utterance.rate = state.speechRate;
        utterance.volume = state.speechVolume;
        utterance.pitch = 1;
        if (japaneseVoice) utterance.voice = japaneseVoice;
        utterance.onstart = () => {
          activeSpeechButton = button || null;
          activeSpeechButton?.classList.add("speaking");
        };
        utterance.onend = clearSpeakingState;
        utterance.onerror = (event) => {
          clearSpeakingState();
          if (event.error !== "canceled" && event.error !== "interrupted") {
            speechStatus.textContent = "おんせいを さいせいできませんでした。";
          }
        };
        speechStatus.textContent = "";
        window.speechSynthesis.speak(utterance);
      }

      function speakQuestionAudio() {
        if (state.mode !== "roleplay" && state.mode !== "confirmation" && state.mode !== "remaining") return;
        speakText(questionSentence.textContent.trim(), speakQuestionButton);
      }

      function speakAnswerAudio() {
        if (!state.answerVisible) return;
        const spokenAnswer = state.mode === "confirmation" || state.mode === "remaining"
          ? answerReading.textContent.trim()
          : answerSentence.textContent.trim();
        speakText(spokenAnswer, speakAnswerButton);
      }

      function configureSpeech() {
        if (!speechSupported) {
          speechStatus.textContent = "この ぶらうざでは おんせいを つかえません。";
          document.querySelectorAll("[data-speech-rate], #autoplay-button, #speech-volume, #speak-question, #speak-answer")
            .forEach((control) => { control.disabled = true; });
          return;
        }
        loadJapaneseVoice();
        if (typeof window.speechSynthesis.addEventListener === "function") {
          window.speechSynthesis.addEventListener("voiceschanged", loadJapaneseVoice);
        } else {
          window.speechSynthesis.onvoiceschanged = loadJapaneseVoice;
        }
      }

      function updateSelectionStatus() {
        const count = state.selectedCounters.size;
        const disabled = state.mode !== "chart" && count === 0;
        const needsUniqueCounter = state.mode === "flash" || state.mode === "confirmation" || state.mode === "remaining";
        const genericCounterNotice = needsUniqueCounter && count > 1 && state.selectedCounters.has("tsu")
          ? "　※〜つは こたえが ひとつに きまらないため、みっくすでは でません。"
          : "";
        startButton.disabled = disabled;
        selectionStatus.classList.toggle("error", disabled);
        selectionStatus.textContent = disabled
          ? "じょすうしを ひとつ いじょう えらんでください。"
          : `${count}しゅるいを えらんでいます。${genericCounterNotice}`;
      }

      function syncCounterButtons() {
        document.querySelectorAll("button[data-counter]").forEach((button) => {
          const selected = state.selectedCounters.has(button.dataset.counter);
          button.classList.toggle("selected", selected);
          button.setAttribute("aria-pressed", String(selected));
        });
        updateSelectionStatus();
      }

      function updateModeSetup() {
        const isChart = state.mode === "chart";
        practiceSetup.hidden = isChart;
        rangeSetup.hidden = isChart;
        selectionStatus.hidden = isChart;
        bottomSetup.classList.toggle("chart-settings", isChart);
        startButton.textContent = isChart
          ? "いちらんひょうを みる"
          : state.mode === "confirmation"
            ? "かくにんを れんしゅうする"
            : state.mode === "remaining"
              ? "あと どのぐらい？を れんしゅうする"
            : "はじめる";
        updateSelectionStatus();
      }

      const packableItemKeys = new Set([
        "apple", "eraser", "key", "bento", "bread", "cup", "bag-small",
        "pencil", "pen", "screwdriver", "wrench", "bottle", "paper", "towel",
        "mask", "rag", "label", "book", "notebook", "dictionary", "textbook",
        "planner", "manual", "egg", "nut", "button"
      ]);

      // 物だけを見て答える複数助数詞の問題では、別の数え方も自然な物を除く。
      // 「〜つ」は特定の助数詞と広く重なるため、単独選択時だけ出題する。
      const flashMixItemKeys = new Set([
        "man", "woman", "child", "worker",
        "pencil", "pen", "umbrella", "pipe", "broom", "bottle",
        "paper", "towel", "mask", "rag", "sheet", "label",
        "dog", "cat", "rabbit", "fish", "mouse", "frog",
        "car", "bicycle", "motorcycle", "computer", "fridge", "washer", "microwave", "forklift",
        "book", "notebook", "dictionary", "textbook", "planner", "manual",
        "nut", "bucket", "tape-measure", "button"
      ]);

      const confirmationTypes = [
        "remaining-count",
        "remaining-time",
        "remaining-little",
        "put-check",
        "finish-check"
      ];

      const remainingClearItemKeys = new Set([
        "apple", "box",
        "worker",
        "pencil", "umbrella", "broom",
        "paper", "towel", "mask", "rag", "sheet", "label",
        "dog", "cat", "fish",
        "car", "bicycle", "motorcycle", "computer",
        "book", "notebook", "dictionary", "manual",
        "nut", "bucket", "button"
      ]);

      const timeOptions = [
        { minutes: 1, reading: "いっぷん" },
        { minutes: 2, reading: "にふん" },
        { minutes: 3, reading: "さんぷん" },
        { minutes: 4, reading: "よんぷん" },
        { minutes: 5, reading: "ごふん" },
        { minutes: 6, reading: "ろっぷん" },
        { minutes: 7, reading: "ななふん" },
        { minutes: 8, reading: "はっぷん" },
        { minutes: 9, reading: "きゅうふん" },
        { minutes: 10, reading: "じゅっぷん" },
        { minutes: 15, reading: "じゅうごふん" },
        { minutes: 20, reading: "にじゅっぷん" },
        { minutes: 30, reading: "さんじゅっぷん" }
      ];

      function selectedItems(filter = () => true) {
        return [...state.selectedCounters].flatMap((counter) =>
          counterData[counter].items
            .filter(filter)
            .map((item) => ({ counter, item }))
        );
      }

      function clearRemainingItems(counter) {
        if (state.selectedCounters.size > 1 && counter === "tsu") return [];
        return counterData[counter].items.filter((item) => remainingClearItemKeys.has(item.key));
      }

      function setNextTime(question) {
        const option = drawBalanced(
          `time:${state.mode}`,
          timeOptions,
          (candidate) => String(candidate.minutes)
        );
        question.minutes = option.minutes;
        question.minuteReading = option.reading;
      }

      function numberCandidates() {
        return Array.from({ length: state.max }, (_, index) => index + 1);
      }

      function questionForCounter(purpose, poolForCounter, counter) {
        const itemPool = poolForCounter(counter);
        const item = drawBalanced(
          `item:${state.mode}:${purpose}:${counter}`,
          itemPool,
          (candidate) => candidate.key
        );
        const number = drawBalanced(
          `number:${state.mode}:${purpose}`,
          numberCandidates()
        );
        return { counter, item, number };
      }

      function questionFromPools(purpose, poolForCounter) {
        const available = [...state.selectedCounters];
        const eligibleCounters = available.filter((counter) => poolForCounter(counter).length);
        const counter = drawBalanced(
          `counter:${state.mode}:${purpose}`,
          eligibleCounters,
          (candidate) => candidate
        );
        return questionForCounter(purpose, poolForCounter, counter);
      }

      function placeholderQuestion() {
        const counter = [...state.selectedCounters][0];
        return { counter, item: counterData[counter].items[0], number: 1 };
      }

      function availableConfirmationTypes() {
        const packable = selectedItems((candidate) => packableItemKeys.has(candidate.key));
        return packable.length
          ? confirmationTypes
          : confirmationTypes.filter((type) => type !== "put-check");
      }

      function makeConfirmationQuestion() {
        const confirmationType = drawBalanced(
          "type:confirmation",
          availableConfirmationTypes()
        );
        let question;

        if (confirmationType === "remaining-count") {
          question = questionFromPools("remaining-count", clearRemainingItems);
        } else if (confirmationType === "put-check") {
          const packable = selectedItems((candidate) => packableItemKeys.has(candidate.key));
          const selected = drawBalanced(
            "item:confirmation:put-check",
            packable,
            (candidate) => `${candidate.counter}:${candidate.item.key}`
          );
          question = { counter: selected.counter, item: selected.item, number: 1 };
        } else {
          question = placeholderQuestion();
        }

        question.confirmationType = confirmationType;
        if (confirmationType === "remaining-time") setNextTime(question);
        if (confirmationType === "put-check" || confirmationType === "finish-check") {
          question.completed = drawBalanced(
            `completed:confirmation:${confirmationType}`,
            [true, false]
          );
        }
        return question;
      }

      function makeRemainingQuestion() {
        if (state.remainingPlan.length === 0) {
          const eligibleCounters = [...state.selectedCounters]
            .filter((counter) => clearRemainingItems(counter).length);
          state.remainingPlan = makeRemainingPlan(
            state,
            eligibleCounters,
            state.remainingRecentKeys
          );
        }

        const slot = state.remainingPlan.shift();
        const question = slot.type === "remaining-count"
          ? questionForCounter("remaining-count", clearRemainingItems, slot.counter)
          : placeholderQuestion();
        question.confirmationType = slot.type;
        if (slot.type === "remaining-time") setNextTime(question);
        state.remainingRecentKeys.push(slot.combinationKey);
        state.remainingRecentKeys = state.remainingRecentKeys.slice(-2);
        return question;
      }

      function makeQuestion() {
        if (state.mode === "confirmation") return makeConfirmationQuestion();
        if (state.mode === "remaining") return makeRemainingQuestion();

        const isMixedFlash = state.mode === "flash" && state.selectedCounters.size > 1;
        return questionFromPools(
          "main",
          (counter) => isMixedFlash
            ? counterData[counter].items.filter((item) => flashMixItemKeys.has(item.key))
            : counterData[counter].items
        );
      }

      function objectMarkup(item, index) {
        if (item.draw) {
          return `<span class="object" style="--i:${index}" aria-hidden="true"><span class="draw-${item.draw}"><i></i><b></b></span></span>`;
        }
        const glyph = item.glyphs[index % item.glyphs.length];
        return `<span class="object emoji" style="--i:${index}" aria-hidden="true">${glyph}</span>`;
      }

      function setPhraseLine(container, phrases) {
        const fragment = document.createDocumentFragment();
        phrases.forEach((phrase, index) => {
          const unit = document.createElement("span");
          unit.className = "phrase-unit";
          unit.textContent = phrase;
          fragment.append(unit);
          if (index < phrases.length - 1) fragment.append(document.createTextNode(" "));
        });
        container.replaceChildren(fragment);
      }

      function confirmationQuestionPhrases(question) {
        switch (question.confirmationType) {
          case "put-check":
            return [`${question.item.name}を`, "はこに", "いれた？"]; 
          case "finish-check":
            return ["さぎょう", "おわった？"]; 
          default:
            return ["あと", "どのくらい？"]; 
        }
      }

      function remainingQuestionPhrases() {
        return ["あと", "どのぐらい？"];
      }

      function confirmationAnswerPhrases(question, reading) {
        switch (question.confirmationType) {
          case "remaining-count":
            return ["あと", `${reading}です。`];
          case "remaining-time":
            return ["あと", question.minuteReading, "ぐらいです。"]; 
          case "remaining-little":
            return ["あと", "すこしです。"]; 
          case "put-check":
            return question.completed ? ["はい、", "いれました。"] : ["いいえ、", "まだです。"]; 
          case "finish-check":
            return question.completed ? ["はい、", "おわりました。"] : ["いいえ、", "まだです。"]; 
          default:
            return [];
        }
      }

      function miniObjectsMarkup(item, count) {
        return Array.from({ length: count }, (_, index) => objectMarkup(item, index)).join("");
      }

      function renderConfirmationScene(question) {
        objects.classList.add("confirm-objects");
        const type = question.confirmationType;

        if (type === "remaining-count") {
          objects.innerHTML = `
            <div class="confirmation-scene count-scene">
              <section class="remaining-count-card" aria-label="${question.item.name}の のこり">
                <span class="remaining-item-label">${question.item.name}</span>
                <div class="remaining-count-items" style="--count-cols:${Math.min(question.number, 5)}">${miniObjectsMarkup(question.item, question.number)}</div>
              </section>
            </div>`;
          objects.setAttribute("aria-label", `${question.item.name}が あと ${question.number}`);
          return;
        }

        if (type === "remaining-time" || type === "remaining-little") {
          const isTime = type === "remaining-time";
          objects.innerHTML = `
            <div class="confirmation-scene timer-scene">
              ${isTime
                ? `<div class="time-only-card" aria-label="${question.minuteReading}">
                    <div class="time-value"><span class="time-number">${question.minutes}</span><span class="time-unit">${question.minuteReading}</span></div>
                  </div>`
                : `<div class="little-only-card" aria-label="さぎょうが もうすぐ おわります">
                    <div class="little-progress" aria-hidden="true">
                      <span class="filled"></span><span class="filled"></span><span class="filled"></span><span class="filled"></span><span></span>
                    </div>
                    <div class="little-finish-mark" aria-hidden="true">もうすぐ　✓</div>
                  </div>`}
            </div>`;
          objects.setAttribute("aria-label", isTime ? `あと ${question.minutes}ふん` : "あと すこし");
          return;
        }

        if (type === "put-check") {
          const pendingObjects = question.completed ? "" : miniObjectsMarkup(question.item, 3);
          objects.innerHTML = `
            <div class="confirmation-scene packing-scene">
              <div class="scene-worker" aria-hidden="true">👷</div>
              <div class="packing-board">
                <div class="packing-source" aria-hidden="true">${pendingObjects}</div>
                <span class="scene-arrow" aria-hidden="true">→</span>
                <div class="packing-box" aria-hidden="true">📦<span class="status-mark${question.completed ? "" : " pending"}">${question.completed ? "✓" : "…"}</span></div>
              </div>
            </div>`;
          objects.setAttribute("aria-label", question.completed ? `${question.item.name}を はこに いれました` : `${question.item.name}は まだ はこの そとです`);
          return;
        }

        const completedCount = question.completed ? 5 : 3;
        const products = Array.from({ length: 5 }, (_, index) => `
          <span class="finish-unit ${index < completedCount ? "finished" : "unfinished"}">
            <span class="finish-unit-body"></span>
          </span>`).join("");
        objects.innerHTML = `
          <div class="confirmation-scene finish-scene ${question.completed ? "is-finished" : "is-working"}">
            <div class="finish-worker" aria-hidden="true">
              <span class="finish-worker-helmet"></span>
              <span class="finish-worker-head"></span>
              <span class="finish-worker-body"></span>
              <span class="finish-worker-arm arm-back"></span>
              <span class="finish-worker-arm arm-work"></span>
              <span class="finish-worker-leg leg-back"></span>
              <span class="finish-worker-leg leg-front"></span>
              <span class="finish-hand-tool"></span>
              <span class="finish-motion motion-one"></span>
              <span class="finish-motion motion-two"></span>
            </div>
            <div class="finish-workboard" aria-hidden="true">
              <div class="finish-products">${products}</div>
              <div class="finish-board-lower">
                <div class="finish-materials">
                  ${question.completed ? "" : `
                    <span class="finish-material"><i></i><i></i></span>
                    <span class="finish-material"><i></i><i></i></span>`}
                </div>
                <div class="finish-tool-rack"><span class="finish-rack-tool"></span></div>
                <div class="finish-progress-number"><strong>${completedCount}</strong><span>/5</span></div>
              </div>
            </div>
          </div>`;
        objects.setAttribute(
          "aria-label",
          question.completed
            ? "さぎょういんが どうぐを おき、5この かんせいひんを かくにんしています。ざいりょうは のこっていません"
            : "さぎょういんが どうぐを もって さぎょうしています。3こが かんせいし、2この ざいりょうが のこっています"
        );
      }

      function renderQuestion() {
        stopSpeech();
        const question = state.history[state.historyIndex];
        const data = counterData[question.counter];
        const reading = data.readings[question.number - 1];
        const isRoleplay = state.mode === "roleplay";
        const isConfirmation = state.mode === "confirmation";
        const isRemainingOnly = state.mode === "remaining";
        const isConfirmationStyle = isConfirmation || isRemainingOnly;
        const isDialogue = isRoleplay || isConfirmationStyle;
        const counterHint = state.selectedCounters.size === 1 ? data.label : "えらんだ じょすうし";

        const showDialogueItem = isConfirmationStyle &&
          (question.confirmationType === "remaining-count" || question.confirmationType === "put-check");
        itemName.textContent = isRoleplay || showDialogueItem ? question.item.name : "";
        modeTag.textContent = isRemainingOnly ? "あと" : isConfirmation ? "かくにん" : counterHint;
        quizTitle.textContent = isRemainingOnly
          ? "あと　どのぐらい？　の れんしゅう"
          : isConfirmation
          ? "かくにんの やりとり"
          : isRoleplay
            ? "しつもんと こたえの やりとり"
            : "じょすうし ふらっしゅ";
        roleLabel.textContent = isConfirmationStyle ? "A" : "しつもん";
        answerLabel.textContent = isConfirmationStyle ? "B" : "こたえ";
        quiz.classList.toggle("roleplay", isDialogue);
        quiz.classList.toggle("confirmation", isConfirmationStyle);
        quiz.classList.toggle("remaining-only", isRemainingOnly);
        questionPanel.classList.toggle("roleplay-panel", isDialogue);
        roleQuestion.classList.toggle("active", isDialogue);

        if (isConfirmationStyle) {
          setPhraseLine(questionSentence, isRemainingOnly ? remainingQuestionPhrases() : confirmationQuestionPhrases(question));
          renderConfirmationScene(question);
        } else {
          setPhraseLine(questionSentence, [
            `${question.item.name}は`,
            data.question,
            `${question.item.verb}か。`
          ]);
          objects.classList.remove("confirm-objects");
          objects.style.setProperty("--cols", String(Math.min(question.number, 5)));
          objects.innerHTML = Array.from({ length: question.number }, (_, index) => objectMarkup(question.item, index)).join("");
          objects.setAttribute("aria-label", isRoleplay ? `${question.item.name}が ${question.number}` : "かずえる もの");
        }

        answerReading.replaceChildren();
        if (isConfirmationStyle) {
          setPhraseLine(answerReading, confirmationAnswerPhrases(question, reading));
        } else if (isRoleplay) {
          setPhraseLine(answerReading, [reading, `${question.item.verb}。`]);
        } else {
          const itemPart = document.createElement("span");
          const countPart = document.createElement("span");
          itemPart.className = "answer-item phrase-unit";
          countPart.className = "answer-count phrase-unit";
          itemPart.textContent = question.item.name;
          countPart.textContent = reading;
          answerReading.append(itemPart, countPart);
        }
        if (isConfirmationStyle) {
          answerSentence.replaceChildren();
        } else {
          setPhraseLine(answerSentence, [
            `${question.item.name}が`,
            reading,
            `${question.item.verb}。`
          ]);
        }
        state.answerVisible = false;
        answerPanel.classList.add("hidden-answer");
        answerButton.textContent = "こたえを みる";
        speakQuestionButton.disabled = !speechSupported;
        speakAnswerButton.disabled = true;
        previousButton.disabled = state.historyIndex === 0;

        if (state.autoSpeech && isDialogue && speechSupported) {
          window.setTimeout(() => {
            if (quiz.classList.contains("active") && state.history[state.historyIndex] === question) {
              speakQuestionAudio();
            }
          }, 180);
        }
      }

      function startQuiz() {
        if (state.mode === "chart") {
          openChart();
          return;
        }
        if (!state.selectedCounters.size) return;
        resetBalancedDraws();
        state.history = [makeQuestion()];
        state.historyIndex = 0;
        home.classList.remove("active");
        quiz.classList.add("active");
        renderQuestion();
      }

      function showHome() {
        stopSpeech();
        quiz.classList.remove("active");
        chart.classList.remove("active");
        home.classList.add("active");
      }

      function nextQuestion() {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
        } else {
          state.history.push(makeQuestion());
          state.historyIndex += 1;
        }
        renderQuestion();
      }

      function previousQuestion() {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          renderQuestion();
        }
      }

      function toggleAnswer() {
        state.answerVisible = !state.answerVisible;
        answerPanel.classList.toggle("hidden-answer", !state.answerVisible);
        answerButton.textContent = state.answerVisible ? "こたえを かくす" : "こたえを みる";
        speakAnswerButton.disabled = !state.answerVisible || !speechSupported;
        if (!state.answerVisible) {
          stopSpeech();
        } else if (state.autoSpeech && speechSupported) {
          speakAnswerAudio();
        }
      }

      function toggleFullscreen() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      }

      function renderChart() {
        stopSpeech();
        const key = counterKeys[state.chartIndex];
        const data = counterData[key];
        document.getElementById("chart-tabs").innerHTML = counterKeys.map((counterKey, index) =>
          `<button class="chart-tab${index === state.chartIndex ? " selected" : ""}" data-chart-counter="${counterKey}" type="button">${counterData[counterKey].label}</button>`
        ).join("");
        document.getElementById("chart-counter").textContent = data.label;
        const rows = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9]];
        document.getElementById("reading-body").innerHTML = rows.map((indices) =>
          `<tr>${indices.map((index) => `<th scope="col">${index + 1}</th>`).join("")}</tr>` +
          `<tr>${indices.map((index) => {
            const reading = data.readings[index];
            return `<td><button class="reading-button" data-reading="${reading}" type="button" aria-label="${reading}を きく"${speechSupported ? "" : " disabled"}><span>${reading}</span><span class="speaker-mark" aria-hidden="true">🔊</span></button></td>`;
          }).join("")}</tr>`
        ).join("");
      }

      function openChart() {
        state.chartIndex = 0;
        renderChart();
        home.classList.remove("active");
        quiz.classList.remove("active");
        chart.classList.add("active");
      }

      function moveChart(amount) {
        state.chartIndex = (state.chartIndex + amount + counterKeys.length) % counterKeys.length;
        renderChart();
      }

      document.getElementById("mode-grid").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-mode]");
        if (!button) return;
        document.querySelectorAll("button[data-mode]").forEach((item) => {
          const selected = item === button;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        state.mode = button.dataset.mode;
        updateModeSetup();
      });

      document.getElementById("counter-grid").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-counter]");
        if (!button) return;
        const key = button.dataset.counter;
        if (state.selectedCounters.has(key)) state.selectedCounters.delete(key);
        else state.selectedCounters.add(key);
        syncCounterButtons();
      });

      document.getElementById("select-all").addEventListener("click", () => {
        state.selectedCounters = new Set(counterKeys);
        syncCounterButtons();
      });

      document.getElementById("clear-all").addEventListener("click", () => {
        state.selectedCounters.clear();
        syncCounterButtons();
      });

      document.getElementById("range-row").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-max]");
        if (!button) return;
        document.querySelectorAll("button[data-max]").forEach((item) => {
          const selected = item === button;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        state.max = Number(button.dataset.max);
      });

      document.querySelectorAll("button[data-speech-rate]").forEach((button) => {
        button.addEventListener("click", () => {
          stopSpeech();
          state.speechRate = Number(button.dataset.speechRate);
          document.querySelectorAll("button[data-speech-rate]").forEach((item) => {
            const selected = item === button;
            item.classList.toggle("selected", selected);
            item.setAttribute("aria-pressed", String(selected));
          });
        });
      });

      speechVolume.addEventListener("input", () => {
        stopSpeech();
        const value = Number(speechVolume.value);
        state.speechVolume = value / 10;
        volumeValue.value = String(value);
        volumeValue.textContent = String(value);
      });

      autoplayButton.addEventListener("click", () => {
        state.autoSpeech = !state.autoSpeech;
        autoplayButton.classList.toggle("selected", state.autoSpeech);
        autoplayButton.setAttribute("aria-pressed", String(state.autoSpeech));
        autoplayButton.textContent = state.autoSpeech ? "じどう: あり" : "じどう: なし";
      });

      startButton.addEventListener("click", startQuiz);
      document.querySelectorAll(".home-button, #home-button").forEach((button) => button.addEventListener("click", showHome));
      document.querySelectorAll(".fullscreen-button, #fullscreen-button").forEach((button) => button.addEventListener("click", toggleFullscreen));
      displaySizeButton.addEventListener("click", () => {
        state.manualCompact = !state.manualCompact;
        syncQuizDensity();
      });
      speakQuestionButton.addEventListener("click", speakQuestionAudio);
      speakAnswerButton.addEventListener("click", speakAnswerAudio);
      document.getElementById("answer").addEventListener("click", toggleAnswer);
      document.getElementById("next").addEventListener("click", nextQuestion);
      document.getElementById("previous").addEventListener("click", previousQuestion);
      document.getElementById("chart-previous").addEventListener("click", () => moveChart(-1));
      document.getElementById("chart-next").addEventListener("click", () => moveChart(1));
      document.getElementById("chart-tabs").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-chart-counter]");
        if (!button) return;
        state.chartIndex = counterKeys.indexOf(button.dataset.chartCounter);
        renderChart();
      });
      document.getElementById("reading-body").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-reading]");
        if (!button) return;
        speakText(button.dataset.reading, button);
      });

      document.addEventListener("keydown", (event) => {
        if (quiz.classList.contains("active")) {
          if (event.code === "Space" || event.code === "Enter") {
            event.preventDefault();
            toggleAnswer();
          } else if (event.code === "ArrowRight") {
            event.preventDefault();
            nextQuestion();
          } else if (event.code === "ArrowLeft") {
            event.preventDefault();
            previousQuestion();
          } else if (event.code === "Escape" && !document.fullscreenElement) {
            showHome();
          }
        } else if (chart.classList.contains("active")) {
          if (event.code === "ArrowRight") {
            event.preventDefault();
            moveChart(1);
          } else if (event.code === "ArrowLeft") {
            event.preventDefault();
            moveChart(-1);
          } else if (event.code === "Escape" && !document.fullscreenElement) {
            showHome();
          }
        }
      });

      configureSpeech();
      syncQuizDensity();
      window.addEventListener("resize", syncQuizDensity);
      window.visualViewport?.addEventListener("resize", syncQuizDensity);
      document.addEventListener("fullscreenchange", syncQuizDensity);
      updateModeSetup();
      syncCounterButtons();
    })();
