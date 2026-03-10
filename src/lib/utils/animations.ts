/**
 * Animation utilities for gamification effects
 */

/**
 * Trigger confetti animation
 * @param container Element to attach confetti to
 */
export function triggerConfetti(container?: HTMLElement): void {
  // Simple confetti effect using CSS animations
  // In production, consider using a library like canvas-confetti
  const confettiCount = 50;
  const confettiContainer = container || document.body;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${getRandomColor()};
      left: ${Math.random() * 100}%;
      top: -10px;
      z-index: 9999;
      pointer-events: none;
      animation: confetti-fall ${1 + Math.random() * 2}s linear forwards;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    
    confettiContainer.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

/**
 * Get random color for confetti
 */
function getRandomColor(): string {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
    "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Add confetti animation styles to document if not already added
 */
export function addConfettiStyles(): void {
  if (document.getElementById("confetti-styles")) return;
  
  const style = document.createElement("style");
  style.id = "confetti-styles";
  style.textContent = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
    
    @keyframes level-up-pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
    
    @keyframes points-increment {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
        color: #4ECDC4;
      }
      100% {
        transform: scale(1);
      }
    }
    
    @keyframes streak-flame {
      0%, 100% {
        transform: scale(1) rotate(0deg);
      }
      25% {
        transform: scale(1.1) rotate(-5deg);
      }
      75% {
        transform: scale(1.1) rotate(5deg);
      }
    }
    
    @keyframes achievement-unlock {
      0% {
        transform: scale(0) rotate(-180deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.2) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }
    
    @keyframes xp-progress-fill {
      from {
        width: 0%;
      }
      to {
        width: var(--target-width);
      }
    }
    
    .level-up-animation {
      animation: level-up-pulse 0.6s ease-in-out;
    }
    
    .points-increment-animation {
      animation: points-increment 0.5s ease-in-out;
    }
    
    .streak-flame-animation {
      animation: streak-flame 2s ease-in-out infinite;
    }
    
    .achievement-unlock-animation {
      animation: achievement-unlock 0.8s ease-out;
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Animate number increment
 * @param element Element to animate
 * @param startValue Starting value
 * @param endValue Ending value
 * @param duration Animation duration in ms
 */
export function animateNumberIncrement(
  element: HTMLElement,
  startValue: number,
  endValue: number,
  duration: number = 1000
): void {
  const startTime = performance.now();
  const difference = endValue - startValue;
  
  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + difference * easeOut);
    
    element.textContent = currentValue.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = endValue.toLocaleString();
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Trigger level up animation
 * @param element Element to animate
 */
export function triggerLevelUpAnimation(element: HTMLElement): void {
  element.classList.add("level-up-animation");
  setTimeout(() => {
    element.classList.remove("level-up-animation");
  }, 600);
}

/**
 * Trigger points increment animation
 * @param element Element to animate
 */
export function triggerPointsIncrementAnimation(element: HTMLElement): void {
  element.classList.add("points-increment-animation");
  setTimeout(() => {
    element.classList.remove("points-increment-animation");
  }, 500);
}

/**
 * Trigger streak flame animation
 * @param element Element to animate
 */
export function triggerStreakFlameAnimation(element: HTMLElement): void {
  element.classList.add("streak-flame-animation");
}

/**
 * Trigger achievement unlock animation
 * @param element Element to animate
 */
export function triggerAchievementUnlockAnimation(element: HTMLElement): void {
  element.classList.add("achievement-unlock-animation");
}

/**
 * Initialize animations (call on app mount)
 */
export function initializeAnimations(): void {
  addConfettiStyles();
}

