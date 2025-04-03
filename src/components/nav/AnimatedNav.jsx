import { useEffect, useState } from "react";
import styles from "./AnimatedNav.module.css";

const AnimatedNav = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showUnderline, setShowUnderline] = useState(false);

  useEffect(() => {
    // First show the nav
    const navTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    // Then show the underline after letters appear
    const underlineTimer = setTimeout(() => {
      setShowUnderline(true);
    }, 6500); // 5000 + 1500 (giving time for letters to appear)

    return () => {
      clearTimeout(navTimer);
      clearTimeout(underlineTimer);
    };
  }, []);

  return (
    <nav
      className={`${styles.nav} ${isVisible ? styles.visible : styles.hidden} ${
        showUnderline ? styles.showUnderline : ""
      }`}
    >
      <a className={styles.link} href="/about">
        <span className={styles.letter} style={{ transitionDelay: "0.5s" }}>
          W
        </span>
        <span className={styles.letter} style={{ transitionDelay: "0.55s" }}>
          e
        </span>
      </a>
      <span className={styles.space} style={{ transitionDelay: "0.6s" }}>
        &nbsp;
      </span>
      <span className={styles.letter} style={{ transitionDelay: "0.65s" }}>
        g
      </span>
      <span className={styles.letter} style={{ transitionDelay: "0.7s" }}>
        i
      </span>
      <span className={styles.letter} style={{ transitionDelay: "0.75s" }}>
        v
      </span>
      <span className={styles.letter} style={{ transitionDelay: "0.8s" }}>
        e
      </span>
      <span className={styles.space} style={{ transitionDelay: "0.85s" }}>
        &nbsp;
      </span>
      <span className={styles.letter} style={{ transitionDelay: "0.9s" }}>
        m
      </span>
      <span className={styles.letter} style={{ transitionDelay: "0.95s" }}>
        e
      </span>
      <span className={styles.letter} style={{ transitionDelay: "1s" }}>
        a
      </span>
      <span className={styles.letter} style={{ transitionDelay: "1.05s" }}>
        n
      </span>
      <span className={styles.letter} style={{ transitionDelay: "1.1s" }}>
        i
      </span>
      <span className={styles.letter} style={{ transitionDelay: "1.15s" }}>
        n
      </span>
      <span className={styles.letter} style={{ transitionDelay: "1.2s" }}>
        g
      </span>
      <span className={styles.space} style={{ transitionDelay: "1.25s" }}>
        &nbsp;
      </span>
      <span className={styles.letter} style={{ transitionDelay: "1.3s" }}>
        t
      </span>
      <span className={styles.letter} style={{ transitionDelay: "1.35s" }}>
        o
      </span>
      <span className={styles.separator} style={{ transitionDelay: "1.37s" }}>
        |
      </span>
      <button className={styles.link}>
        <span className={styles.letter} style={{ transitionDelay: "1.4s" }}>
          S
        </span>
        <span className={styles.letter} style={{ transitionDelay: "1.45s" }}>
          p
        </span>
        <span className={styles.letter} style={{ transitionDelay: "1.5s" }}>
          a
        </span>
        <span className={styles.letter} style={{ transitionDelay: "1.55s" }}>
          c
        </span>
        <span className={styles.letter} style={{ transitionDelay: "1.6s" }}>
          e
        </span>
      </button>
    </nav>
  );
};

export default AnimatedNav;
