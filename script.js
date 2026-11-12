import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let cardSize = viewportWidth < 1000 ? 320 : 500;
let circleRadius = viewportWidth < 1000 ? 800 : 1250;
let expandInset = 64;
let expandedWidth = viewportWidth - expandInset;
let expandedHeight = viewportHeight - expandInset;

let expandOriginX = circleRadius * Math.sin(0.25);
let expandOriginY = circleRadius * (1 - Math.cos(0.25));
let expandOriginRotation = (0.25 * 180) / Math.PI;

const spotlight = document.querySelector(".spotlight");
const spotlightCopy = document.querySelector(".spotlight-copy");
const totalCards = 4;
const cards = [];
const images = [];
let copyHidden = false;

for (let i = totalCards; i >= 1; i--) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `<img src="/img${i}.jpg" />`;
  spotlight.appendChild(card);
  cards.unshift(card);
  images.unshift(card.querySelector("img"));
}

images.forEach((img) => gsap.set(img, { scale: 1.15 }));

function setInitialPositions() {
  cards.forEach((card, i) => {
    const angle = 1.5 - i * 0.45;

    gsap.set(card, {
      xPercent: -50,
      yPercent: -50,
      x: circleRadius * Math.sin(angle),
      y: circleRadius * (1 - Math.cos(angle)),
      rotation: (angle * 180) / Math.PI,
      width: cardSize,
      height: cardSize,
      borderRadius: 10,
    });
  });
}

function recalculate() {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  cardSize = viewportWidth < 1000 ? 320 : 500;
  circleRadius = viewportWidth < 1000 ? 800 : 1250;
  expandedWidth = viewportWidth - expandInset;
  expandedHeight = viewportHeight - expandInset;
  expandOriginX = circleRadius * Math.sin(0.25);
  expandOriginY = circleRadius * (1 - Math.cos(0.25));
}

setInitialPositions();

window.addEventListener("resize", () => {
  recalculate();
  ScrollTrigger.refresh();
});

ScrollTrigger.create({
  trigger: ".spotlight",
  start: "top top",
  end: `+=${viewportHeight * 10}`,
  pin: true,
  onUpdate: (self) => {
    const baseAngle = gsap.utils.interpolate(1.5, -1.5, self.progress);

    if (self.progress > 0.5 && !copyHidden) {
      copyHidden = true;
      gsap.to(spotlightCopy, { opacity: 0, duration: 0.3 });
    } else if (self.progress < 0.5 && copyHidden) {
      copyHidden = false;
      gsap.to(spotlightCopy, { opacity: 1, duration: 0.3 });
    }

    cards.forEach((card, i) => {
      const angle = baseAngle - i * 0.45;

      if (i === 0 && angle < 0.25) {
        const expandProgress = gsap.utils.clamp(0, 1, (0.25 - angle) / 1.5);

        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: gsap.utils.interpolate(expandOriginX, 0, expandProgress),
          y: gsap.utils.interpolate(expandOriginY, 0, expandProgress),
          rotation: gsap.utils.interpolate(
            expandOriginRotation,
            0,
            expandProgress,
          ),
          width: gsap.utils.interpolate(
            cardSize,
            expandedWidth,
            expandProgress,
          ),
          height: gsap.utils.interpolate(
            cardSize,
            expandedHeight,
            expandProgress,
          ),
          borderRadius: gsap.utils.interpolate(10, 20, expandProgress),
        });

        gsap.set(images[i], {
          scale: gsap.utils.interpolate(1.15, 1, expandProgress),
        });

        return;
      }

      gsap.set(card, {
        xPercent: -50,
        yPercent: -50,
        x: circleRadius * Math.sin(angle),
        y: circleRadius * (1 - Math.cos(angle)),
        rotation: (angle * 180) / Math.PI,
        width: cardSize,
        height: cardSize,
        borderRadius: 10,
      });

      gsap.set(images[i], { scale: 1.15 });
    });
  },
});
