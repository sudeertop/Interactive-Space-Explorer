const scene = document.getElementById("landing-scene");
const exploreLink = document.getElementById("explore-link");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let transitionStarted = false;
let fallbackTimer;

function continueToSystem() {
  window.clearTimeout(fallbackTimer);
  try {
    window.sessionStorage.setItem("solar-entry-transition", "1");
  } catch {
    // Navigation remains functional if session storage is unavailable.
  }
  window.location.assign(exploreLink.href);
}

exploreLink.addEventListener("click", (event) => {
  if (reduceMotion || transitionStarted || !scene.contentWindow) return;

  event.preventDefault();
  transitionStarted = true;
  document.body.classList.add("is-entering");
  scene.contentWindow.postMessage({ type: "solar-entry-start" }, window.location.origin);
  fallbackTimer = window.setTimeout(continueToSystem, 2600);
});

window.addEventListener("message", (event) => {
  if (
    event.origin !== window.location.origin ||
    event.source !== scene.contentWindow ||
    event.data?.type !== "solar-entry-complete" ||
    !transitionStarted
  ) {
    return;
  }
  continueToSystem();
});
