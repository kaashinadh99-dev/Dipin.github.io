
/* ==============================================
   DIPIN RAJ CYBER PORTFOLIO
   SYSTEM / AUDIO / NAVIGATION
============================================== */

document.addEventListener("DOMContentLoaded", () => {

  const bootScreen = document.getElementById("bootScreen");
  const mainSite = document.getElementById("mainSite");
  const launchButton = document.getElementById("launchButton");

  const soundToggle = document.getElementById("soundToggle");
  const soundIcon = document.getElementById("soundIcon");
  const soundLabel = document.getElementById("soundLabel");

  const menuButton = document.getElementById("menuButton");
  const mobileMenu = document.getElementById("mobileMenu");

  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  const toast = document.getElementById("toast");

  let audioContext = null;
  let soundEnabled = true;
  let launched = false;
  let toastTimer = null;

  document.body.classList.add("booting");

  /* ==========================================
     CYBER AUDIO ENGINE
  ========================================== */

  function getAudioContext() {

    if (!audioContext) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      audioContext = new AudioContextClass();
    }

    return audioContext;
  }

  function playTone({
    frequency = 440,
    endFrequency = null,
    duration = 0.3,
    type = "sine",
    volume = 0.08,
    delay = 0
  } = {}) {

    if (!soundEnabled) return;

    const ctx = getAudioContext();

    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      ctx.currentTime + delay
    );

    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, endFrequency),
        ctx.currentTime + delay + duration
      );
    }

    gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);

    gain.gain.exponentialRampToValueAtTime(
      volume,
      ctx.currentTime + delay + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + delay + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration + 0.05);
  }

  /* ==========================================
     STARTUP SOUND
  ========================================== */

  function playStartupSound() {

    if (!soundEnabled) return;

    const ctx = getAudioContext();

    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Low system activation sweep
    playTone({
      frequency: 80,
      endFrequency: 280,
      duration: 0.6,
      type: "sawtooth",
      volume: 0.045,
      delay: 0
    });

    // Digital scanning sound
    playTone({
      frequency: 700,
      endFrequency: 1800,
      duration: 0.22,
      type: "square",
      volume: 0.025,
      delay: 0.35
    });

    playTone({
      frequency: 1400,
      endFrequency: 500,
      duration: 0.15,
      type: "square",
      volume: 0.018,
      delay: 0.62
    });

    // Confirmation tones
    playTone({
      frequency: 440,
      duration: 0.16,
      type: "sine",
      volume: 0.06,
      delay: 0.85
    });

    playTone({
      frequency: 660,
      duration: 0.18,
      type: "sine",
      volume: 0.06,
      delay: 1.02
    });

    playTone({
      frequency: 880,
      duration: 0.32,
      type: "sine",
      volume: 0.07,
      delay: 1.2
    });

    // Final digital activation
    playTone({
      frequency: 1200,
      endFrequency: 1800,
      duration: 0.18,
      type: "triangle",
      volume: 0.045,
      delay: 1.45
    });

  }

  /* ==========================================
     UI SOUND EFFECTS
  ========================================== */

  function playClickSound() {

    if (!soundEnabled || !launched) return;

    playTone({
      frequency: 850,
      endFrequency: 650,
      duration: 0.07,
      type: "square",
      volume: 0.015
    });

  }

  function playHoverSound() {

    if (!soundEnabled || !launched) return;

    playTone({
      frequency: 1100,
      duration: 0.035,
      type: "sine",
      volume: 0.009
    });

  }

  /* ==========================================
     LAUNCH SYSTEM
  ========================================== */

  launchButton.addEventListener("click", async () => {

    if (launched) return;

    launched = true;

    launchButton.disabled = true;
    launchButton.innerHTML = "INITIALIZING...";

    if (soundEnabled) {
      const ctx = getAudioContext();

      if (ctx && ctx.state === "suspended") {
        await ctx.resume();
      }

      playStartupSound();
    }

    // Startup transition
    setTimeout(() => {

      bootScreen.classList.add("hide");
      mainSite.classList.add("show");

      document.body.classList.remove("booting");

      showToast("SYSTEM ACCESS GRANTED // WELCOME");

    }, 650);

  });

  /* ==========================================
     SOUND TOGGLE
  ========================================== */

  function updateSoundUI() {

    if (soundEnabled) {
      soundIcon.textContent = "🔊";
      soundLabel.textContent = "SOUND ON";
      soundToggle.classList.remove("sound-off");
    } else {
      soundIcon.textContent = "🔇";
      soundLabel.textContent = "SOUND OFF";
      soundToggle.classList.add("sound-off");
    }

  }

  soundToggle.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    updateSoundUI();

    if (soundEnabled && launched) {
      playTone({
        frequency: 650,
        endFrequency: 1000,
        duration: 0.15,
        type: "sine",
        volume: 0.05
      });
    }

    showToast(soundEnabled ? "AUDIO SYSTEM ENABLED" : "AUDIO SYSTEM MUTED");

  });

  updateSoundUI();

  /* ==========================================
     MOBILE MENU
  ========================================== */

  menuButton.addEventListener("click", () => {

    mobileMenu.classList.toggle("open");

    playClickSound();

  });

  mobileMenu.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      mobileMenu.classList.remove("open");

      playClickSound();

    });

  });

  /* ==========================================
     NAVIGATION ACTIVE STATE
  ========================================== */

  const allNavLinks = document.querySelectorAll(
    ".desktop-nav a, .bottom-link"
  );

  const sections = document.querySelectorAll(
    "main section[id]"
  );

  function setActiveSection(id) {

    allNavLinks.forEach(link => {

      const linkId = link.getAttribute("href");

      link.classList.toggle(
        "active",
        linkId === "#" + id
      );

    });

  }

  if ("IntersectionObserver" in window) {

    const sectionObserver = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }

        });

      },
      {
        threshold: 0.25,
        rootMargin: "-15% 0px -40% 0px"
      }
    );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });

  }

  /* ==========================================
     BUTTON / LINK SOUND
  ========================================== */

  document.querySelectorAll(
    ".primary-button, .secondary-button, .project-link, .contact-links a"
  ).forEach(element => {

    element.addEventListener("click", () => {
      playClickSound();
    });

  });

  document.querySelectorAll(
    ".desktop-nav a, .bottom-link"
  ).forEach(element => {

    element.addEventListener("mouseenter", () => {
      playHoverSound();
    });

  });

  /* ==========================================
     CONTACT FORM
     Opens visitor's email application
  ========================================== */

  contactForm.addEventListener("submit", event => {

    event.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !message) {

      formStatus.textContent = "ERROR: PLEASE COMPLETE ALL FIELDS.";
      return;

    }

    /*
      IMPORTANT:
      Replace this placeholder with your real email address.
    */

    const destinationEmail = "dipinraj@example.com";

    const subject = encodeURIComponent(
      "Portfolio Contact - " + name
    );

    const body = encodeURIComponent(
      "Name: " + name + "\n" +
      "Email: " + email + "\n\n" +
      "Message:\n" + message
    );

    const mailtoLink =
      "mailto:" + destinationEmail +
      "?subject=" + subject +
      "&body=" + body;

    formStatus.textContent = "OPENING EMAIL APPLICATION...";

    showToast("MESSAGE READY FOR TRANSMISSION");

    setTimeout(() => {
      window.location.href = mailtoLink;
    }, 300);

  });

  /* ==========================================
     TOAST MESSAGE
  ========================================== */

  function showToast(message) {

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);

  }

  /* ==========================================
     REVEAL ANIMATION
  ========================================== */

  const revealElements = document.querySelectorAll(
    ".glass-card, .section-heading, .hero-content, .hero-hud"
  );

  revealElements.forEach(element => {
    element.classList.add("reveal");
  });

  const revealStyle = document.createElement("style");

  revealStyle.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(25px);
      transition: opacity .7s ease, transform .7s ease;
    }

    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  document.head.appendChild(revealStyle);

  if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add("visible");

            revealObserver.unobserve(entry.target);

          }

        });

      },
      {
        threshold: 0.1
      }
    );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach(element => {
      element.classList.add("visible");
    });

  }

  /* ==========================================
     CONSOLE SIGNATURE
  ========================================== */

  console.log(
    "%c DIPIN RAJ // CYBER PORTFOLIO ",
    "background:#050810;color:#00f0ff;font-size:18px;font-weight:bold;padding:10px;"
  );

  console.log(
    "%c SYSTEM ONLINE | CREATIVE MODE ACTIVE ",
    "color:#00ff9d;font-size:12px;"
  );

});
