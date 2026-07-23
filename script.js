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

  if (!stage || !envelope || !letter) return;

  let hasOpened = false;

  // Roughly matches the longest CSS transition in the "opening" sequence
  // (flap rotation + letter reveal + its delay), with a small buffer.
  const OPEN_ANIMATION_MS = 1450;

  function openEnvelope() {
    if (hasOpened) return;
    hasOpened = true;

    // Disable further interaction with the envelope during and after opening.
    envelope.disabled = true;
    envelope.setAttribute("aria-expanded", "true");
    letter.setAttribute("aria-hidden", "false");

    stage.classList.add("is-open");

    // After the flap + letter animation completes, release the letter
    // into normal document flow so it can grow to any height naturally.
    window.setTimeout(function () {
      letter.classList.add("is-released");
      stage.classList.add("is-released");

      // Move keyboard focus to the letter for accessibility, now that
      // it is the main content on the page.
      letter.setAttribute("tabindex", "-1");
      letter.focus({ preventScroll: true });
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
