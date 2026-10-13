document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // SET THE BIRTHDAY DATE HERE: 2009-11-04
  // Example: "2027-05-18". Use null until you know the date.
  const BIRTHDAY_DATE = "2009-11-04";

  const slides = [$("slide1"), $("slide2"), $("slide3")];
  const dots = [...document.querySelectorAll(".dot")];
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const autoBtn = $("autoBtn");
  const counter = $("slideCounter");

  const envelopeBtn = $("envelopeBtn");
  const enterBtn = $("enterBtn");
  const envelopeHint = $("envelopeHint");

  const letterBtn = $("letterBtn");
  const letterContent = $("letterContent");

  const song = $("birthdaySong");
  const musicBtn = $("musicBtn");
  const musicStatus = $("musicStatus");

  const fireworksBtn = $("fireworksBtn");
  const wishMessage = $("wishMessage");
  const revealBtn = $("revealBtn");
  const finalNote = $("finalNote");
  const replayBtn = $("replayBtn");

  const heartsLayer = $("heartsLayer");
  const canvas = $("fireworksCanvas");
  const ctx = canvas.getContext("2d");

  const photoButtons = [...document.querySelectorAll(".photo")];
  const viewer = $("photoViewer");
  const expandedPhoto = $("expandedPhoto");
  const photoCaption = $("photoCaption");

  const photos = photoButtons.map((button) => ({
    src: button.querySelector("img").getAttribute("src"),
    alt: button.querySelector("img").alt
  }));

  const SLIDE_DELAY = 15000;
  let currentSlide = 0;
  let autoplay = true;
  let timer = null;
  let remaining = SLIDE_DELAY;
  let deadline = 0;
  let envelopeOpened = false;
  let wishCount = 0;
  let finalRevealed = false;
  let currentPhoto = 0;
  let heartTimer = null;
  let particles = [];
  let frame = null;
  let lastFrame = 0;
  let fireworkEndTime = 0;

  // ---------- SLIDESHOW ----------

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function scheduleAutoplay(delay = SLIDE_DELAY) {
    clearTimer();
    if (!autoplay || document.hidden) return;

    remaining = delay;
    deadline = Date.now() + remaining;

    timer = setTimeout(() => {
      timer = null;

      if (currentSlide < 2) {
        showSlide(currentSlide + 1);
      } else {
        setAutoplay(false);
      }
    }, remaining);
  }

  function showSlide(index) {
    currentSlide = Math.max(0, Math.min(2, index));

    slides.forEach((slide, i) => {
      const active = i === currentSlide;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active;
    });

    dots.forEach((dot, i) => {
      const active = i === currentSlide;
      dot.classList.toggle("active", active);

      if (active) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });

    counter.textContent = `0${currentSlide + 1} / 03`;
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === 2;
    nextBtn.textContent = currentSlide === 2 ? "Final Slide" : "Next →";

    slides[currentSlide].scrollTop = 0;

    if (autoplay) scheduleAutoplay();
  }

  function setAutoplay(enabled) {
    autoplay = enabled;
    autoBtn.textContent = autoplay ? "Ⅱ Auto" : "▶ Auto";
    autoBtn.setAttribute(
      "aria-label",
      autoplay ? "Pause automatic slideshow" : "Resume automatic slideshow"
    );

    if (autoplay) scheduleAutoplay();
    else clearTimer();
  }

  prevBtn.addEventListener("click", () => {
    if (currentSlide > 0) showSlide(currentSlide - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (currentSlide < 2) showSlide(currentSlide + 1);
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slide));
    });
  });

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      showSlide(Number(button.dataset.go));
    });
  });

  autoBtn.addEventListener("click", () => setAutoplay(!autoplay));

  $("brandLink").addEventListener("click", (event) => {
    event.preventDefault();
    showSlide(0);
  });

  document.addEventListener("keydown", (event) => {
    if (viewer.open) {
      if (event.key === "Escape") viewer.close();
      if (event.key === "ArrowRight") changePhoto(1);
      if (event.key === "ArrowLeft") changePhoto(-1);
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.matches("input, textarea, select, audio, video, button")) {
      return;
    }

    if (event.key === "ArrowRight" && currentSlide < 2) {
      showSlide(currentSlide + 1);
    } else if (event.key === "ArrowLeft" && currentSlide > 0) {
      showSlide(currentSlide - 1);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (timer !== null) {
        remaining = Math.max(0, deadline - Date.now());
        clearTimer();
      }
    } else if (autoplay) {
      scheduleAutoplay(remaining);
    }
  });

  // ---------- ROYAL ENVELOPE ----------

  envelopeBtn.addEventListener("click", () => {
    if (envelopeOpened) return;

    envelopeOpened = true;
    envelopeBtn.classList.add("opened");
    envelopeBtn.setAttribute("aria-label", "Envelope opened");
    envelopeHint.textContent = "A little wish, sealed just for you. ♡";

    setTimeout(() => {
      enterBtn.disabled = false;
      enterBtn.textContent = "Enter Your Universe ♛";
      envelopeHint.textContent = "Your royal surprise is ready!";
      makeConfetti(35);
    }, reducedMotion ? 50 : 850);
  });

  enterBtn.addEventListener("click", () => {
    if (!envelopeOpened) return;
    showSlide(1);
    makeConfetti(30);
  });

  // ---------- FLOATING HEARTS ----------

  function createHeart() {
    if (document.hidden || reducedMotion) return;

    const heart = document.createElement("span");
    const symbols = ["♥", "♡", "✦"];
    const colors = ["#d9b66f", "#f4dfaa", "#f5d5a0"];

    heart.className = "floating-heart";
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    heart.style.setProperty("--left", `${Math.random() * 100}%`);
    heart.style.setProperty(
      "--heart-color", colors[Math.floor(Math.random() * colors.length)]
    );
    heart.style.setProperty("--heart-size", `${12 + Math.random() * 22}px`);
    heart.style.setProperty("--duration", `${5 + Math.random() * 5}s`);

    heartsLayer.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }

  function startHearts() {
    if (heartTimer || reducedMotion) return;

    for (let i = 0; i < 6; i++) {
      setTimeout(createHeart, i * 200);
    }

    heartTimer = setInterval(createHeart, 750);
  }

  startHearts();

  // ---------- SECRET LETTER ----------

  letterBtn.addEventListener("click", () => {
    const opening = letterContent.classList.contains("hidden");
    letterContent.classList.toggle("hidden", !opening);

    letterBtn.textContent = opening
      ? "Close Your Letter ♡"
      : "Unseal Your Letter ♡";

    if (opening) {
      letterContent.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest"
      });
      makeConfetti(12);
    }
  });

  // ---------- EXISTING AUDIO ----------

  song.addEventListener("play", () => {
    musicBtn.textContent = "Ⅱ Pause Our Song";
    musicStatus.textContent = "Let the music play. ♡";
  });

  song.addEventListener("pause", () => {
    musicBtn.textContent = "▶ Play Our Song";
    musicStatus.textContent = "Your melody is waiting.";
  });

  musicBtn.addEventListener("click", async () => {
    if (!song.paused) {
      song.pause();
      return;
    }

    try {
      await song.play();
    } catch {
      musicStatus.textContent =
        "Music couldn't start. Check the audio filename and try again.";
    }
  });

  song.addEventListener("error", () => {
    musicStatus.textContent =
      "Audio file not found. Check that audio 1.mpeg is in the project folder.";
  });

  // ---------- FIREWORKS ----------

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function createBurst(x, y, count = 65) {
    const colors = ["#ffe6a6", "#d9b66f", "#ffffff", "#c99d51"];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;

      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: .009 + Math.random() * .018,
        size: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    if (particles.length > 1400) particles = particles.slice(-1400);
  }

  function launchFireworks(number = 6) {
    if (reducedMotion) number = Math.min(number, 2);

    for (let i = 0; i < number; i++) {
      setTimeout(() => {
        createBurst(
          innerWidth * (.12 + Math.random() * .76),
          innerHeight * (.12 + Math.random() * .42),
          reducedMotion ? 16 : 65
        );
      }, i * 300);
    }

    fireworkEndTime = Math.max(
      fireworkEndTime,
      performance.now() + number * 300 + 3500
    );

    if (frame === null) frame = requestAnimationFrame(animateFireworks);
  }

  function animateFireworks(timestamp) {
    frame = null;

    if (timestamp - lastFrame < 1000 / 45) {
      frame = requestAnimationFrame(animateFireworks);
      return;
    }

    lastFrame = timestamp;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = "lighter";

    particles = particles.filter((p) => p.alpha > .035);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= .985;
      p.vy = p.vy * .985 + .025;
      p.alpha -= p.decay;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (particles.length || timestamp < fireworkEndTime) {
      frame = requestAnimationFrame(animateFireworks);
    } else {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  // ---------- CONFETTI ----------

  function makeConfetti(count = 50) {
    if (reducedMotion) return;

    const colors = ["#ffe6a6", "#d9b66f", "#fff8df", "#b88a3c"];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--left", `${Math.random() * 100}%`);
      piece.style.setProperty("--duration", `${2 + Math.random() * 2.5}s`);
      piece.style.setProperty(
        "--piece-color", colors[Math.floor(Math.random() * colors.length)]
      );

      document.body.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove(), {
        once: true
      });
    }
  }

  // ---------- MAKE A WISH ----------

  const wishes = [
    "May your dreams find their way to you. ✨",
    "May happiness find you in unexpected moments. ♡",
    "May your new chapter be full of love and laughter.",
    "May you always remember how wonderfully special you are. 👑"
  ];

  fireworksBtn.addEventListener("click", () => {
    wishCount++;
    wishMessage.textContent = wishes[(wishCount - 1) % wishes.length];
    launchFireworks(7);
    makeConfetti(55);
  });

  // ---------- GRAND FINALE ----------

  revealBtn.addEventListener("click", () => {
    finalRevealed = !finalRevealed;
    finalNote.classList.toggle("hidden", !finalRevealed);

    revealBtn.textContent = finalRevealed
      ? "Hide Your Final Message ♡"
      : "Reveal Your Final Message ♡";

    if (finalRevealed) {
      launchFireworks(10);
      makeConfetti(90);

      finalNote.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest"
      });
    }
  });

  // ---------- BIRTHDAY COUNTDOWN ----------

  function updateCountdown() {
    if (!BIRTHDAY_DATE) {
      $("countdown").classList.add("hidden");
      $("countdownHeading").textContent = "A DATE TO REMEMBER";
      $("countdownCaption").textContent =
        "Add your birthday date in script.js to activate the countdown.";
      return;
    }

    // Date is interpreted in the visitor's local time zone.
    const target = new Date(`${BIRTHDAY_DATE}T00:00:00`);

    if (Number.isNaN(target.getTime())) {
      $("countdown").classList.add("hidden");
      $("countdownCaption").textContent =
        "Please enter the date in YYYY-MM-DD format.";
      return;
    }

    const now = new Date();
    let nextBirthday = new Date(target);

    // If the date has passed this year, count toward next year.
    nextBirthday.setFullYear(now.getFullYear());

    if (nextBirthday.getTime() <= now.getTime()) {
      nextBirthday.setFullYear(now.getFullYear() + 1);
    }

    const diff = nextBirthday.getTime() - now.getTime();
    const day = 86400000;
    const hour = 3600000;
    const minute = 60000;

    const days = Math.floor(diff / day);
    const hours = Math.floor((diff % day) / hour);
    const minutes = Math.floor((diff % hour) / minute);
    const seconds = Math.floor((diff % minute) / 1000);

    $("days").textContent = String(days).padStart(2, "0");
    $("hours").textContent = String(hours).padStart(2, "0");
    $("minutes").textContent = String(minutes).padStart(2, "0");
    $("seconds").textContent = String(seconds).padStart(2, "0");

    $("countdown").classList.remove("hidden");
    $("countdownHeading").textContent = "COUNTING DOWN TO YOUR DAY";
    $("countdownCaption").textContent =
      `A golden day awaits · ${BIRTHDAY_DATE}`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---------- INTERACTIVE PHOTO GALLERY ----------

  function openPhoto(index) {
    currentPhoto = (index + photos.length) % photos.length;
    const photo = photos[currentPhoto];

    expandedPhoto.src = photo.src;
    expandedPhoto.alt = photo.alt;
    photoCaption.textContent =
      `${photo.alt} · ${currentPhoto + 1} / ${photos.length}`;

    if (!viewer.open) viewer.showModal();
  }

  function changePhoto(direction) {
    openPhoto(currentPhoto + direction);
  }

  photoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openPhoto(Number(button.dataset.photo));
    });
  });

  $("closePhoto").addEventListener("click", () => viewer.close());
  $("previousPhoto").addEventListener("click", () => changePhoto(-1));
  $("nextPhoto").addEventListener("click", () => changePhoto(1));

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });

  // ---------- REPLAY ----------

  replayBtn.addEventListener("click", () => {
    wishCount = 0;
    wishMessage.textContent = "";

    finalRevealed = false;
    finalNote.classList.add("hidden");
    revealBtn.textContent = "Reveal Your Final Message ♡";

    letterContent.classList.add("hidden");
    letterBtn.textContent = "Unseal Your Letter ♡";

    showSlide(0);
    makeConfetti(25);
  });

  // Start on the invitation screen.
  showSlide(0);
});