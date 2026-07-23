/**
 * Envelope opening interaction.
 *
 * Sequence:
 *  1. User clicks/taps the envelope.
 *  2. Further clicks are disabled immediately.
 *  3. The flap opens and the letter slides upward (handled by CSS
 *     transitions triggered via the "is-open" class).
 *  4. Once those transitions finish, the letter is switched from
 *     absolute positioning to normal document flow ("is-released"),
 *     so the page can grow to fit a letter of any length — nothing
 *     is ever cropped, hidden, or placed in a scrolling box.
 */
(function () {
  "use strict";

  const stage = document.getElementById("envelopeStage");
  const envelope = document.getElementById("envelope");
  const letter = document.getElementById("letter");
  const letterContent = document.getElementById("letterContent");

  if (!stage || !envelope || !letter || !letterContent) return;

  let hasOpened = false;

  // Roughly matches the longest CSS transition in the "opening" sequence
  // (flap rotation + letter reveal + its delay), with a small buffer.
  const OPEN_ANIMATION_MS = 1450;

  // ── Letter text ──────────────────────────────────────────────────
  const paragraphs = [
    "학교에서 처음 당신을 본 순간이 아직도 기억나요. 당신은 친구들과 함께 도서관을 걷고 있었고, 저는 근처에 앉아 책을 읽고 있었어요. 무엇을 하고 있는지 궁금해서 당신의 일행을 잠깐 바라봤는데, 잠시 후 당신이 제 시야로 걸어 들어왔고, 아주 짧은 순간이었지만 우리의 눈이 마주쳤어요.",

    "저는 너무 당황해서 바로 시선을 돌려버렸어요. 제 친구는 제가 한국 사람을 얼마나 좋아하는지, 그리고 K-드라마를 정말 좋아한다는 걸 알고 있었기 때문에 둘이 같이 웃었어요.",

    "처음에는 그 순간을 크게 신경 쓰지 않았어요. 그런데 시간이 지나면서 학교에서 당신을 자주 마주치게 되었어요. 신기하게도 거의 매일 아주 잠깐씩 우리의 눈이 마주쳤죠. 그때부터 쉬는 시간이 되면 저도 모르게 당신을 찾기 시작했어요. 심지어 당신 일행이 보통 몇 시쯤 로비에 모이는지까지 외우게 되었어요. 수업이 끝나는 시간도 우리와 비슷해서, 학교를 나가기 전이면 늘 당신을 한 번쯤 볼 수 있었어요.",

    "며칠 후 Ally의 스토리를 봤는데 그녀가 버디 프로그램에 참여하고 있더라고요. 그래서 제가 메시지를 보내서 \"어? 너 버디 프로그램 하고 있어?\"라고 물었어요. 그러자 Ally가 \"응 왜?\"라고 답했죠. 저는 그냥 \"아니 그냥.\"이라고 했어요.",

    "그러다가 Ally가 같이 집에 가자고 해서 저는 \"좋아.\"라고 했어요.",

    "집으로 가는 길에 Ally가 갑자기 저에게 \"서브 버디로 참여해 볼래?\"라고 물었어요. 저는 좋다고 대답했죠.",

    "사실 처음에는 참여할 생각이 없었어요. 제가 내성적인 성격이라 사람들과 대화하는 게 어려울 것 같았거든요. 그런데 Ally가 여러분은 모두 정말 편하고 다가가기 쉬운 사람들이라고 말해줘서, 한번 해보기로 마음먹었어요.",

    "그 후로 Ally는 버디 프로그램 행사에 저를 자주 초대했어요. 계속 저를 설득하면서 서브 버디로 함께하자고 했죠. 사실 그때쯤에는 이미 당신을 좋아하고 있었기 때문에, 오히려 당신에게 다가가는 게 더 무서웠어요. 당신이 제 근처에 있기만 해도 너무 긴장해서 아무 말도 할 수 없었어요. 너무 부끄러워서 먼저 말을 걸 용기도 나지 않았죠.",

    "원래 저는 누군가와 편해지고 나서야 말이 많아지는 사람이에요.",

    "당신과 함께한 시간은 정말 짧았지만, 그래도 당신을 만날 수 있었다는 것만으로도 저는 정말 행복했어요. 당신을 조금이나마 알아갈 수 있었던 시간은 앞으로도 오래도록 감사하게 간직할, 제게 가장 소중한 추억 중 하나가 되었어요.",

    "그리고 네… 그렇게 당신을 만나게 되었고, 그렇게 저는 당신을 좋아하게 되었다는 걸 깨달았어요.",

    "이 이야기를 한다고 해서 어떤 기대를 하고 있는 건 아니에요. 우리는 서로를 알게 된 시간이 정말 짧았으니까요. 그래서 당신이 같은 마음이 아니더라도 저는 충분히 이해해요. 다만 당신이 한국으로 돌아가기 전에 제 마음만큼은 솔직하게 전하고 싶었어요.",

    "하지만 만약 당신도 저를 조금 더 알아가 보고 싶다면, 저는 정말 기쁠 것 같아요. 전혀 부담 갖지 않아도 돼요. 저도 당신을 조금 더 알아갈 수 있는 기회가 있다면 정말 좋겠어요.",

    "제 일상을 나도 모르게 조금 더 밝게 만들어 준 사람이 되어줘서 고마워요. 앞으로 어떤 일이 생기든, 비록 아주 짧은 인연이었다 해도 당신과 만날 수 있었던 것만으로 저는 정말 행복했고, 우리의 길이 한 번이라도 스쳐 지나갔다는 사실만으로도 감사해요."
  ];

  // ── Typewriter effect ────────────────────────────────────────────
  let typewriterTimer = null;

  function startTypewriter() {
    const fullText = paragraphs.join("\n\n");
    letterContent.innerHTML = "";
    letterContent.textContent = "";

    let charIndex = 0;
    const allChars = fullText.split("");

    function typeNextChar() {
      if (charIndex >= allChars.length) {
        typewriterTimer = null;
        return;
      }

      const char = allChars[charIndex];
      charIndex++;

      // Detect paragraph breaks (two consecutive newlines)
      if (char === "\n" && charIndex < allChars.length && allChars[charIndex] === "\n") {
        letterContent.innerHTML += "<p></p>";
        charIndex++;
        typewriterTimer = window.setTimeout(typeNextChar, 60);
        return;
      }

      // Append character to the last <p> or create one
      let lastP = letterContent.querySelector("p:last-of-type");
      if (!lastP) {
        const p = document.createElement("p");
        letterContent.appendChild(p);
        lastP = p;
      }
      lastP.textContent += char;

      // Faster for spaces/punctuation, slower for letters
      const delay = (char === " " || char === "…" || char === "." || char === "," || char === "!" || char === "?") ? 18 : 32;

      typewriterTimer = window.setTimeout(typeNextChar, delay);
    }

    typeNextChar();
  }

  function openEnvelope() {
    if (hasOpened) return;
    hasOpened = true;

    // Disable further interaction with the envelope during and after opening.
    envelope.disabled = true;
    envelope.setAttribute("aria-expanded", "true");
    letter.setAttribute("aria-hidden", "false");

    stage.classList.add("is-open");

    // After the flap + letter animation completes, release the letter
    // and start the typewriter animation.
    window.setTimeout(function () {
      letter.classList.add("is-released");
      stage.classList.add("is-released");

      // Move keyboard focus to the letter for accessibility, now that
      // it is the main content on the page.
      letter.setAttribute("tabindex", "-1");
      letter.focus({ preventScroll: true });

      // Start typewriter animation
      startTypewriter();
    }, OPEN_ANIMATION_MS);
  }

  envelope.addEventListener("click", openEnvelope);

  // Support keyboard activation (Enter / Space) explicitly for clarity,
  // even though a <button> handles this natively via the click event.
  envelope.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEnvelope();
    }
  });
})();
