(() => {
  "use strict";

  const canvas = document.querySelector("#starfield");
  const context = canvas?.getContext("2d");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let stars = [];
  let animationFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function makeStars() {
    const count = Math.min(
      190,
      Math.max(75, Math.floor((width * height) / 9500))
    );

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.2 + 0.25,
      speed: Math.random() * 0.11 + 0.025,
      opacity: Math.random() * 0.5 + 0.12,
      red: Math.random() > 0.78,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function resizeCanvas() {
    if (!canvas || !context) return;

    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    makeStars();
  }

  function drawStars(time = 0) {
    if (!context) return;

    context.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      if (!reducedMotion.matches) {
        star.y += star.speed;

        if (star.y > height + 3) {
          star.y = -3;
          star.x = Math.random() * width;
        }
      }

      const twinkle = reducedMotion.matches
        ? star.opacity
        : star.opacity + Math.sin(time * 0.0012 + star.phase) * 0.13;

      const parallaxX = reducedMotion.matches
        ? 0
        : pointerX * star.speed * 0.9;

      const parallaxY = reducedMotion.matches
        ? 0
        : pointerY * star.speed * 0.55;

      context.beginPath();

      context.arc(
        star.x + parallaxX,
        star.y + parallaxY,
        star.size,
        0,
        Math.PI * 2
      );

      context.fillStyle = star.red
        ? `rgba(255, 58, 74, ${Math.max(0.05, twinkle)})`
        : `rgba(255, 237, 237, ${Math.max(0.04, twinkle)})`;

      context.fill();
    });

    if (!reducedMotion.matches) {
      animationFrame = requestAnimationFrame(drawStars);
    }
  }

  function startStarfield() {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    drawStars();
  }

  window.addEventListener("resize", resizeCanvas, {
    passive: true,
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX / width - 0.5;
      pointerY = event.clientY / height - 0.5;
    },
    { passive: true }
  );

  reducedMotion.addEventListener("change", startStarfield);

  startStarfield();

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-nav]");

  const navLinks = [
    ...document.querySelectorAll("[data-nav] a[href^='#']"),
  ];

  function setMenu(open) {
    menuToggle?.classList.toggle("open", open);
    navigation?.classList.toggle("open", open);

    menuToggle?.setAttribute("aria-expanded", String(open));

    menuToggle?.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    document.body.style.overflow = open ? "hidden" : "";
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!navigation?.classList.contains("open"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  function handleScroll() {
    header?.classList.toggle("scrolled", window.scrollY > 28);

    const sections = [
      ...document.querySelectorAll("main section[id]"),
    ];

    let currentSection = "";

    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 220) {
        currentSection = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${currentSection}`
      );
    });
  }

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  handleScroll();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -45px",
    }
  );

  document
    .querySelectorAll("[data-reveal]")
    .forEach((element, index) => {
      element.style.transitionDelay =
        `${Math.min(index % 3, 2) * 70}ms`;

      revealObserver.observe(element);
    });

  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const toast = document.querySelector("[data-toast]");
  let toastTimer;

  document.querySelectorAll(".placeholder-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href);

      if (url.pathname === "/" || url.pathname === "") {
        event.preventDefault();

        toast?.classList.add("show");
        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
          toast?.classList.remove("show");
        }, 3200);
      }
    });
  });
})();
