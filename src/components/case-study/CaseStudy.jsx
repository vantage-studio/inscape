import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CaseStudy.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMetadata } from "../../store/MetadataStore";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Update the glob pattern to look in metadata project directories
const images = import.meta.glob(
  "../../assets/metadata/**/photographs/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const CaseStudy = ({ imageName: propImageName, onClose, onBeforeClose }) => {
  const navigate = useNavigate();
  const { imageId } = useParams(); // Get image name from URL params
  const imageName = propImageName || imageId; // Use prop or URL param
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const isClosingRef = useRef(false);
  const progressCircleRef = useRef(null);
  const textBlockRef = useRef(null);

  // Get metadata store hooks
  const { getProject } = useMetadata();

  // Extract project key from image name (get first two parts for project key)
  const projectKey = imageName?.split("_").slice(0, 2).join("_").toUpperCase();
  const projectData = getProject(projectKey);

  // Add debug logs
  console.log("Image Name:", imageName);
  console.log("Project Key:", projectKey);
  console.log("Project Data:", projectData);

  // Get random text from project data
  const randomText = projectData?.text
    ? projectData.text[Math.floor(Math.random() * projectData.text.length)]
    : "";
  const projectTitle = projectData?.title || "";

  // Log final values
  console.log("Project Title:", projectTitle);
  console.log("Selected Text:", randomText);

  // Add body class when component mounts
  useEffect(() => {
    document.body.classList.add("case-study-open");
    return () => {
      document.body.classList.remove("case-study-open");
    };
  }, []);

  // Handle missing imageName with useEffect
  useEffect(() => {
    if (!imageName) {
      console.warn("No image name provided to CaseStudy component");
      navigate("/", { replace: true });
    }
  }, [imageName, navigate]);

  // If no imageName, render nothing while the useEffect handles navigation
  if (!imageName) {
    return null;
  }

  const handleClose = useCallback(
    (e) => {
      e?.preventDefault();
      if (isClosingRef.current) return;
      isClosingRef.current = true;

      const overlay = overlayRef.current;
      const container = containerRef.current;

      if (overlay && container) {
        overlay.style.animation = "";
        container.style.animation = "";

        void overlay.offsetWidth;
        void container.offsetWidth;

        overlay.classList.add("exit");
        container.classList.add("exit");

        // Call onBeforeClose before starting the exit animation
        if (typeof onBeforeClose === "function") {
          onBeforeClose();
        }

        setTimeout(() => {
          if (typeof onClose === "function") {
            onClose();
          }
          navigate("/", {
            replace: true,
            state: { preserveCanvas: true },
          });
          isClosingRef.current = false;
        }, 500);
      }
    },
    [navigate, onClose, onBeforeClose]
  );

  useEffect(() => {
    const handlePopState = () => {
      handleClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [handleClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  // Find the correct image path with improved logging
  const imagePath = Object.entries(images).find(([path]) => {
    if (!path) return false;
    const normalizedPath = path.toLowerCase();
    const normalizedName = String(imageName).toLowerCase();
    const isMatch = normalizedPath.includes(normalizedName);
    return isMatch;
  })?.[1];

  // Handle missing image path with useEffect
  useEffect(() => {
    if (!imagePath) {
      console.warn(`Image not found for: ${imageName}`);
      console.log("Available paths:", Object.keys(images));
      handleClose();
    }
  }, [imagePath, imageName, handleClose]);

  useEffect(() => {
    const circle = progressCircleRef.current;
    const container = containerRef.current;

    if (circle && container) {
      const radius = 22;
      const circumference = Math.PI * radius * 2;

      // Set initial state
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${circumference}`;

      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollPercentage =
              container.scrollTop /
              (container.scrollHeight - container.clientHeight);
            const progress = Math.min(Math.max(scrollPercentage, 0), 1);

            // Update circle progress
            const offset = circumference * (1 - progress);
            circle.style.strokeDasharray = `${circumference}`;
            circle.style.strokeDashoffset = `${offset}`;

            // Update circle visibility
            const progressElement = circle.closest(".close-progress");
            if (progressElement) {
              progressElement.style.opacity = progress > 0 ? 1 : 0;
            }

            // Update padding with even more aggressive scaling
            const imageWrapper = container.querySelector(
              ".case-study-image-container-wrapper"
            );
            if (imageWrapper) {
              const maxPadding = 36;
              // Scale progress by 4x to reach max padding much earlier
              const scaledProgress = Math.min(progress * 4, 1);
              const paddingValue = maxPadding * scaledProgress;
              imageWrapper.style.padding = `${paddingValue}px`;
            }

            ticking = false;
          });
          ticking = true;
        }
      };

      container.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Initial call

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, options);

    if (textBlockRef.current) {
      observer.observe(textBlockRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!imagePath) {
    return null;
  }

  return (
    <>
      <div className="case-study-overlay" ref={overlayRef}></div>
      <div className="case-study-container" ref={containerRef}>
        <div className="close-button-wrapper">
          <button className="close-button" onClick={handleClose}>
            <div className="close-icon"></div>
            <svg
              className="close-progress"
              width="48"
              height="48"
              viewBox="0 0 48 48"
            >
              <circle
                ref={progressCircleRef}
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="black"
                strokeWidth="3"
                style={{
                  transformOrigin: "center",
                }}
              />
            </svg>
          </button>
        </div>
        <div className="case-study-content">
          <div className="case-study-text-wrapper">
            <span className="case-study-subtitle">{projectTitle}</span>
            <h2 className="case-study-heading">{randomText}</h2>
          </div>
          <div className="case-study-image-container-wrapper">
            <div
              className="case-study-image-container"
              style={{ backgroundImage: `url(${imagePath})` }}
            />
          </div>
          <div className="case-study-additional-content">
            <div className="text-content-block">
              <div className="text-wrapper">
                <div className="animated-text-block" ref={textBlockRef}>
                  <p>
                    Marga Klompé Building is the first college building in
                    Europe to be entirely constructed from solid wood. The new,
                    nearly energy-neutral complex is situated on a plot of land
                    measuring 33 x 33 meters, within the forested campus of
                    Tilburg University. The building accommodates a foyer, 1
                    auditorium, 13 lecture halls, and self-study spaces for
                    approximately 1,000 students. Set within a wooded landscape,
                    the building's timeless form echoes the existing Modernist
                    structures on the campus.
                  </p>
                  {/* <p>
                    <img
                      loading="lazy"
                      src="https://static.powerhouse-company.com/wp-content/uploads/2019/12/25094728/Group-216.jpg"
                      alt="Building view"
                      width="593"
                      height="341"
                    />
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseStudy;
