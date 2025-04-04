import { useEffect, useRef, useCallback, useState } from "react";
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

// Add video file imports
const videos = import.meta.glob(
  "../../assets/metadata/**/videos/*.{mp4,webm,ogg}",
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
  const [activeTab, setActiveTab] = useState("info");

  // Get metadata store hooks
  const { getProject, metadata } = useMetadata();

  // Find project key by checking which project contains the image
  const projectKey = Object.keys(metadata || {}).find((key) => {
    const project = metadata[key];
    return (
      (project.photographs &&
        project.photographs.some((photo) => photo.includes(imageName))) ||
      (project.photographs_portraits &&
        project.photographs_portraits.some((photo) =>
          photo.includes(imageName)
        ))
    );
  });
  const projectData = getProject(projectKey);

  // Add debug logs
  console.log("Image Name:", imageName);
  console.log("Project Key:", projectKey);
  console.log("Project Data:", projectData);

  // Get text based on image index
  const getTextForImage = (imageName, projectData) => {
    if (!projectData) return "";

    // Find the index of the image in photographs or photographs_portraits
    const photoIndex =
      projectData.photographs?.findIndex((photo) =>
        photo.includes(imageName)
      ) ?? -1;
    const portraitIndex =
      projectData.photographs_portraits?.findIndex((photo) =>
        photo.includes(imageName)
      ) ?? -1;

    // Get the total index (if image is in portraits, add length of photographs)
    const totalIndex =
      photoIndex >= 0
        ? photoIndex
        : portraitIndex >= 0
        ? portraitIndex + (projectData.photographs?.length || 0)
        : 0;

    // Use modulo to cycle through available texts
    const textIndex = totalIndex % (projectData.text?.length || 1);
    return projectData.text?.[textIndex] || "";
  };

  const selectedText = getTextForImage(imageName, projectData);
  const projectTitle = projectData?.title || "";

  // Get random video from project data and find its path
  const randomVideo = projectData?.videos
    ? projectData.videos[Math.floor(Math.random() * projectData.videos.length)]
    : "";

  // Find the video path if it's a local file
  const videoPath = Object.entries(videos).find(([path]) => {
    if (!path) return false;
    const normalizedPath = path.toLowerCase();
    const normalizedVideo = String(randomVideo).toLowerCase();
    return normalizedPath.includes(normalizedVideo);
  })?.[1];

  // Check if it's a Vimeo ID or a video file
  const isVimeoId = randomVideo && /^\d+$/.test(randomVideo);
  const isVideoFile = randomVideo && /\.(mp4|webm|ogg)$/i.test(randomVideo);

  // Log final values
  console.log("Project Title:", projectTitle);
  console.log("Selected Text:", selectedText);
  console.log("Selected Video:", randomVideo);
  console.log("Video Path:", videoPath);
  console.log("Is Vimeo ID:", isVimeoId);
  console.log("Is Video File:", isVideoFile);

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
    const textBlocks = document.querySelectorAll(".animated-text-block");

    // Add will-animate class immediately
    textBlocks.forEach((element) => {
      element.classList.add("will-animate");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("will-animate");
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.05,
        root: null,
        rootMargin: "0px",
      }
    );

    textBlocks.forEach((element) => observer.observe(element));

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
            <h2 className="case-study-heading">{selectedText}</h2>
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
                </div>
              </div>
            </div>

            <div className="video-section">
              <div className="video-container">
                <div className="video-wrapper">
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {isVimeoId ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${randomVideo}?title=0&byline=0&portrait=0&muted=1&autopause=0&controls=0&loop=1&app_id=122963`}
                        width="426"
                        height="240"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                        title={`${projectTitle} video`}
                      />
                    ) : isVideoFile && videoPath ? (
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      >
                        <source
                          src={videoPath}
                          type={`video/${randomVideo.split(".").pop()}`}
                        />
                      </video>
                    ) : null}
                  </div>
                </div>
                <div className="video-overlay"></div>
                <div className="video-filter"></div>
                <button className="expand-button">
                  <div className="expand-icon"></div>
                </button>
              </div>
            </div>
            <div className="project-info">
              <div className="project-info-tabs">
                <div>
                  <button
                    className={`tab-button ${
                      activeTab === "info" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("info")}
                  >
                    Key info
                  </button>
                  <button
                    className={`tab-button ${
                      activeTab === "team" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("team")}
                  >
                    Team
                  </button>
                  <button
                    className={`tab-button ${
                      activeTab === "collaborators" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("collaborators")}
                  >
                    Collaborators
                  </button>
                </div>
              </div>
              <div className="project-info-content" style={{ height: "148px" }}>
                <div
                  className="info-panel"
                  style={{
                    opacity: activeTab === "info" ? 1 : 0,
                    transitionDelay: "0.45s",
                    pointerEvents: activeTab === "info" ? "auto" : "none",
                    userSelect: activeTab === "info" ? "auto" : "none",
                  }}
                >
                  <div className="info-grid">
                    <div className="info-grid-left">
                      <div className="info-item">
                        <span>Budget</span>Confidential
                      </div>
                      <div className="info-item">
                        <span>Time span</span>2015 - 2017
                      </div>
                      <div className="info-item">
                        <span>Size</span>1 000 m²
                      </div>
                      <div className="info-item">
                        <span>Status</span>Completed
                      </div>
                      <div className="info-item">
                        <span>Location</span>St. Moritz, CH
                      </div>
                      <div className="info-item">
                        <span>Type</span>Living
                      </div>
                    </div>
                    <div className="info-grid-right">
                      <div className="info-item-large">
                        <span>Client</span>
                        <div>Confidential</div>
                      </div>
                      <div className="info-item-large">
                        <span>Partners in charge</span>
                        <div>Nanne de Ru, Sander Apperlo</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="team-panel"
                  style={{
                    opacity: activeTab === "team" ? 1 : 0,
                    transitionDelay: "0.45s",
                    pointerEvents: activeTab === "team" ? "auto" : "none",
                    userSelect: activeTab === "team" ? "auto" : "none",
                  }}
                >
                  <div className="team-section">
                    <div className="team-group">
                      <span className="team-title">Partner in charge</span>
                      <div className="team-members">
                        <div className="member-list">
                          <div className="member-item">
                            <div className="member-image">
                              <img
                                alt=""
                                src="https://static.powerhouse-company.com/wp-content/uploads/2020/01/24093921/Powerhouse-Compnay-Sander-Apperlo-300x300.jpg"
                              />
                            </div>
                            <button type="button" className="member-name">
                              Sander Apperlo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="team-group">
                      <span className="team-title">Project lead</span>
                      <div className="team-members">
                        <div className="member-list">
                          <div className="member-item">
                            <div className="member-image">
                              <img
                                alt=""
                                src="https://static.powerhouse-company.com/wp-content/uploads/2019/12/11152631/Powerhouse-Company-Nanne-de-Ru-300x300.jpg"
                              />
                            </div>
                            <button type="button" className="member-name">
                              Nanne de Ru
                            </button>
                          </div>
                          <div className="member-item">
                            <div className="member-image">
                              <img
                                alt=""
                                src="https://static.powerhouse-company.com/wp-content/uploads/2020/01/24093921/Powerhouse-Compnay-Sander-Apperlo-300x300.jpg"
                              />
                            </div>
                            <button type="button" className="member-name">
                              Sander Apperlo
                            </button>
                          </div>
                          <div>Charles Bessard</div>
                        </div>
                      </div>
                    </div>

                    <div className="team-group large">
                      <span className="team-title">Project team</span>
                      <div className="team-members">
                        <div className="member-list">
                          <div className="member-item">
                            <div className="member-image">
                              <img
                                alt=""
                                src="https://static.powerhouse-company.com/wp-content/uploads/2019/12/11152631/Powerhouse-Company-Nanne-de-Ru-300x300.jpg"
                              />
                            </div>
                            <button type="button" className="member-name">
                              Nanne de Ru
                            </button>
                          </div>
                          <div className="member-item">
                            <div className="member-image">
                              <img
                                alt=""
                                src="https://static.powerhouse-company.com/wp-content/uploads/2020/01/24093921/Powerhouse-Compnay-Sander-Apperlo-300x300.jpg"
                              />
                            </div>
                            <button type="button" className="member-name">
                              Sander Apperlo
                            </button>
                          </div>
                          <div>Marco Overwijk</div>
                          <div>Amber Peters</div>
                          <div>Charles Bessard</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="collaborators-panel"
                  style={{
                    opacity: activeTab === "collaborators" ? 1 : 0,
                    transitionDelay: "0.45s",
                    pointerEvents:
                      activeTab === "collaborators" ? "auto" : "none",
                    userSelect: activeTab === "collaborators" ? "auto" : "none",
                  }}
                >
                  <div className="collaborator-list">
                    <div className="collaborator-item">
                      <div className="collaborator-title">Co-architect</div>
                      <div>
                        <div>
                          <a
                            href="https://www.chiavi-architektur.ch/"
                            className="collaborator-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Fulvio Chiavi Architektur AG
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="collaborator-item">
                      <div className="collaborator-title">
                        Interior architect
                      </div>
                      <div>
                        <div>
                          <a
                            href="https://www.liaigre.com/en/"
                            className="collaborator-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Liaigre
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="collaborator-item">
                      <div className="collaborator-title">
                        Lighting consultant
                      </div>
                      <div>
                        <div>
                          <a
                            href="https://www.isometrix.co.uk/"
                            className="collaborator-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Isometrix Lighting and Design
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="collaborator-item">
                      <div className="collaborator-title">Photography</div>
                      <div>
                        <div>
                          <a
                            href="https://www.sebastianvandamme.nl/"
                            className="collaborator-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Sebastian van Damme
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="collaborator-item">
                      <div className="collaborator-title">Videography</div>
                      <div>
                        <div>
                          <a
                            href="https://www.marcelijzerman.com/"
                            className="collaborator-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Marcel IJzerman
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-block">
              <h2 className="content-block-title mobile">
                <div className="title-wrapper mobile">
                  <div>Making an Entrance</div>
                </div>
              </h2>
              <div className="content-block-container">
                <div className="image-container">
                  <div className="image-wrapper">
                    <div
                      className="background-image visible"
                      style={{
                        backgroundImage: `url(https://static.powerhouse-company.com/wp-content/uploads/2019/12/15092315/Powerhouse-Company-Chalet-B-05-683x1024.jpg)`,
                      }}
                    />
                    <div className="image-caption right visible">
                      <div>Spectacular views of the Swiss Alps</div>
                    </div>
                  </div>
                </div>
                <div className="text-container">
                  <div>
                    <h2 className="content-block-title desktop">
                      <div className="title-wrapper desktop">
                        <div>Making an Entrance</div>
                      </div>
                    </h2>
                    <div className="text-content">
                      <div className="animated-text-block">
                        <p>
                          Custom designed and engineered in partnership with a
                          German car elevator company, the disappearing entrance
                          to the garage evokes a scenef from a James Bond film –
                          a section of the road approaching the chalet lifts to
                          allow cars to enter, then closes invisibly behind
                          them.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="test"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseStudy;
