document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setTemporaryButtonLabel = (button, label, duration) => {
        const originalLabel = button.dataset.originalLabel || button.textContent.trim();
        button.dataset.originalLabel = originalLabel;
        button.textContent = label;
        button.disabled = true;
        window.setTimeout(() => {
            button.textContent = originalLabel;
            button.disabled = false;
        }, duration);
    };

    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.prepend(progress);

    let progressFrame = null;
    const updateScrollProgress = () => {
        if (progressFrame !== null) {
            return;
        }
        progressFrame = window.requestAnimationFrame(() => {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percentage = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
            progress.style.width = `${percentage}%`;
            progressFrame = null;
        });
    };
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();

    const heroScenes = document.querySelectorAll(".page-hero, .hero_section");

    if (!reduceMotion) {
        heroScenes.forEach((hero) => {
            hero.addEventListener("pointermove", (event) => {
                const bounds = hero.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                hero.style.setProperty("--hero-x", `${x * -18}`);
                hero.style.setProperty("--hero-y", `${y * -12}`);
                const background = hero.querySelector(".site-background-video, .hero-video");
                if (background) {
                    background.style.transform = `scale(1.06) translate(${x * -1.5}%, ${y * -1.5}%)`;
                }
            });
            hero.addEventListener("pointerleave", () => {
                hero.style.setProperty("--hero-x", "0");
                hero.style.setProperty("--hero-y", "0");
                const background = hero.querySelector(".site-background-video, .hero-video");
                if (background) {
                    background.style.transform = "";
                }
            });
        });
    }

    const revealItems = document.querySelectorAll(".reveal, .coffee_card, .menu_card");
    if ("IntersectionObserver" in window && !reduceMotion) {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    currentObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealItems.forEach((item) => {
            item.classList.add("reveal");
            observer.observe(item);
        });
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    if (!reduceMotion) {
        document.querySelectorAll(".tilt-card").forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const bounds = card.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-4px)`;
            });
            card.addEventListener("pointerleave", () => { card.style.transform = ""; });
        });
    }

    const menuCategories = {
        espresso: ["espresso", "americano"],
        latte: ["latte", "flat white"],
        cappuccino: ["cappuccino"],
        "cold coffee": ["iced coffee", "cold brew"],
        specials: ["mocha", "caramel latte"]
    };

    document.querySelectorAll(".menu_filters button").forEach((filter) => {
        filter.addEventListener("click", () => {
            document.querySelectorAll(".menu_filters button").forEach((button) => {
                button.classList.remove("active");
                button.setAttribute("aria-pressed", "false");
            });
            filter.classList.add("active");
            filter.setAttribute("aria-pressed", "true");
            const wanted = filter.textContent.trim().toLowerCase();
            const categoryNames = menuCategories[wanted] || [];
            document.querySelectorAll(".menu_card").forEach((card) => {
                const title = card.querySelector("h3")?.textContent.trim().toLowerCase() || "";
                const visible = wanted === "all" || categoryNames.some((name) => title.includes(name));
                card.style.display = visible ? "" : "none";
            });
        });
    });

    document.querySelectorAll("form").forEach((form) => {
        const messageFields = form.querySelectorAll("textarea[maxlength]");
        messageFields.forEach((message) => {
            const counter = document.createElement("small");
            counter.className = "message-counter text-secondary d-block mt-1";
            counter.setAttribute("aria-live", "polite");
            const updateCounter = () => {
                counter.textContent = `${message.value.length} / ${message.maxLength}`;
            };
            updateCounter();
            message.insertAdjacentElement("afterend", counter);
            message.addEventListener("input", updateCounter);
        });

        form.addEventListener("submit", (event) => {
            if (form.getAttribute("action") !== "#") {
                return;
            }

            event.preventDefault();
            if (!form.reportValidity()) {
                return;
            }

            const button = form.querySelector("button[type='submit']");
            if (button) {
                setTemporaryButtonLabel(button, "Thanks — received!", 2400);
            }

            let status = form.querySelector(".form-status");
            if (!status) {
                status = document.createElement("p");
                status.className = "form-status text-success mt-3";
                status.setAttribute("role", "status");
                form.appendChild(status);
            }
            status.textContent = form.classList.contains("register_form")
                ? "Your account request has been received."
                : "Your message has been received. We will get back to you soon.";
        });

        form.addEventListener("reset", () => {
            window.setTimeout(() => {
                form.querySelectorAll("textarea[maxlength]").forEach((message) => {
                    const counter = message.nextElementSibling;
                    if (counter?.classList.contains("message-counter")) {
                        counter.textContent = `0 / ${message.maxLength}`;
                    }
                });
                const status = form.querySelector(".form-status");
                if (status) {
                    status.remove();
                }
            }, 0);
        });
    });

    document.querySelectorAll(".menu_card button").forEach((button) => {
        button.addEventListener("click", () => {
            setTemporaryButtonLabel(button, "Added ✓", 1400);
        });
    });

    document.querySelectorAll(".menu_filters button").forEach((filter) => {
        filter.setAttribute("aria-pressed", filter.classList.contains("active") ? "true" : "false");
    });

});