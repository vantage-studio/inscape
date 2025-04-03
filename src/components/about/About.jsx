import { useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Routes,
  Route,
  useNavigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import Employee from "../employee/Employee";
import Contact from "../contact/Contact";
import { teamMembers } from "../../data/teamMembers";
import "./About.css";

gsap.registerPlugin(ScrollTrigger);

function About() {
  const [isRightActive, setIsRightActive] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const videoRef = useRef(null);
  const mainRightRef = useRef(null);
  const mainLeftRef = useRef(null);
  const mainLeftDisableLayerRef = useRef(null);
  const mainRightDisableLayerRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const mainRightContentRef = useRef(null);
  const location = useLocation();
  const isOverlayOpen =
    location.pathname.includes("/contact") ||
    location.pathname.includes("/employee");

  useGSAP(
    () => {
      const getValues = () => {
        if (window.innerWidth <= 768) {
          return {
            right: "-70vw",
            left: "-13vw",
            hoverRight: "-69vw",
            hoverLeft: "-14vw",
          };
        } else if (window.innerWidth <= 1024) {
          return {
            right: "-40vw",
            left: "-10vw",
            hoverRight: "-39vw",
            hoverLeft: "-11vw",
          };
        }
        return {
          right: "-29vw",
          left: "-5vw",
          hoverRight: "-28vw",
          hoverLeft: "-6vw",
        };
      };

      // Initial animations - Only run once when component mounts
      if (!isRightActive && !mainRightRef.current.style.right) {
        const rightWidth = mainRightRef.current.offsetWidth;
        const initialRight = `-${rightWidth}px`;

        gsap.set(mainRightRef.current, { right: initialRight });
        gsap.set(mainLeftRef.current, { x: "0vw" });

        gsap.to(mainRightRef.current, {
          right: getValues().right,
          duration: 1.5,
          ease: "power2.inOut",
          delay: 0.5,
        });

        gsap.to(mainLeftRef.current, {
          x: getValues().left,
          duration: 1.5,
          ease: "power2.inOut",
          delay: 0.5,
        });
      }

      const handleMouseEnter = () => {
        // Only apply hover effect if the right side is not active
        if (!isRightActive) {
          gsap.to(mainRightRef.current, {
            right: getValues().hoverRight,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(mainLeftRef.current, {
            x: getValues().hoverLeft,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      };

      const handleMouseLeave = () => {
        if (!isRightActive) {
          gsap.to(mainRightRef.current, {
            right: getValues().right,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(mainLeftRef.current, {
            x: getValues().left,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      };

      // Remove existing listeners first
      mainRightDisableLayerRef.current?.removeEventListener(
        "mouseenter",
        handleMouseEnter
      );
      mainRightDisableLayerRef.current?.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      // Add listeners only if not active
      if (!isRightActive) {
        mainRightDisableLayerRef.current.addEventListener(
          "mouseenter",
          handleMouseEnter
        );
        mainRightDisableLayerRef.current.addEventListener(
          "mouseleave",
          handleMouseLeave
        );
      }

      // Function to handle layer transitions
      const updateLayers = (isRight) => {
        gsap.to(mainRightDisableLayerRef.current, {
          opacity: isRight ? 0 : 1,
          duration: 0.3,
          ease: "power2.out",
          onStart: () => {
            if (isRight) {
              mainRightDisableLayerRef.current.style.zIndex = "-1";
              mainRightDisableLayerRef.current.style.cursor = "default";
            } else {
              mainRightDisableLayerRef.current.style.zIndex = "11";
              mainRightDisableLayerRef.current.style.cursor = "pointer";
            }
          },
        });

        gsap.to(mainLeftDisableLayerRef.current, {
          opacity: isRight ? 1 : 0,
          duration: 0.3,
          ease: "power2.out",
          onStart: () => {
            if (isRight) {
              mainLeftDisableLayerRef.current.style.zIndex = "11";
              mainLeftDisableLayerRef.current.style.cursor = "pointer";
            } else {
              mainLeftDisableLayerRef.current.style.zIndex = "-1";
              mainLeftDisableLayerRef.current.style.cursor = "default";
            }
          },
        });

        // Update background color animations
        gsap.to(mainLeftRef.current, {
          backgroundColor: isRight ? "#c4aa8d" : "#ffffff",
          duration: 0.3,
          ease: "power2.out",
        });

        gsap.to(mainRightRef.current, {
          backgroundColor: isRight ? "#ffffff" : "#c4aa8d",
          duration: 0.3,
          ease: "power2.out",
        });
      };

      // Update the click handlers to use the animation
      mainRightDisableLayerRef.current.addEventListener("click", () => {
        if (!isRightActive) {
          setIsRightActive(true);
          updateLayers(true);

          // Remove hover event listeners
          mainRightDisableLayerRef.current.removeEventListener(
            "mouseenter",
            handleMouseEnter
          );
          mainRightDisableLayerRef.current.removeEventListener(
            "mouseleave",
            handleMouseLeave
          );

          // Set position to 0 with overwrite to prevent other animations
          gsap.to(mainRightRef.current, {
            right: "0",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
          mainLeftRef.current.style.backgroundColor = "#c4aa8d";
          mainLeftRef.current.style.overflow = "hidden";
        }
      });

      mainLeftDisableLayerRef.current.addEventListener("click", () => {
        if (isRightActive) {
          setIsRightActive(false);
          setShowJoinTeam(false);
          updateLayers(false);

          // Add hover event listeners back
          mainRightDisableLayerRef.current.addEventListener(
            "mouseenter",
            handleMouseEnter
          );
          mainRightDisableLayerRef.current.addEventListener(
            "mouseleave",
            handleMouseLeave
          );

          // Animate both right and left positions when deactivating
          gsap.to(mainRightRef.current, {
            right: getValues().right,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(mainLeftRef.current, {
            x: getValues().left,
            duration: 0.3,
            ease: "power2.out",
          });
          mainLeftRef.current.style.backgroundColor = "#ffffff";
          mainLeftRef.current.style.overflow = "auto";
        }
      });

      // Call updateLayers immediately at the start
      updateLayers(isRightActive);

      // Remove the duplicate resize handlers and keep only one
      const handleResize = () => {
        if (!isRightActive) {
          gsap.set(mainRightRef.current, { right: getValues().right });
          gsap.set(mainLeftRef.current, { x: getValues().left });
        }
      };

      window.addEventListener("resize", handleResize);

      // Clean up
      return () => {
        window.removeEventListener("resize", handleResize);
        if (mainRightDisableLayerRef.current) {
          mainRightDisableLayerRef.current.removeEventListener(
            "mouseenter",
            handleMouseEnter
          );
          mainRightDisableLayerRef.current.removeEventListener(
            "mouseleave",
            handleMouseLeave
          );
        }
      };
    },
    {
      scope: [
        mainRightRef,
        mainLeftRef,
        mainRightDisableLayerRef,
        mainLeftDisableLayerRef,
      ],
      dependencies: [isRightActive],
    }
  );

  // Video click handler for fullscreen
  const handleVideoClick = () => {
    const iframe = videoRef.current;
    iframe.contentWindow.postMessage(
      JSON.stringify({
        method: "play",
        value: 1,
      }),
      "*"
    );

    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen();
    }
  };

  const handleTeamMemberClick = (member) => {
    navigate(`employee/${member.id}`);
  };

  const handleNavJoinTeamClick = () => {
    if (!isRightActive) {
      setIsRightActive(true);
      setShowJoinTeam(true);

      // Add the same animations as when clicking the right panel
      gsap.to(mainRightRef.current, {
        right: "0",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Update background colors
      mainLeftRef.current.style.backgroundColor = "#c4aa8d";
      mainLeftRef.current.style.overflow = "hidden";

      // Scroll to top
      if (mainRightContentRef.current) {
        mainRightContentRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  };

  const handleJoinTeamClick = () => {
    setShowJoinTeam(true);
    if (mainRightContentRef.current) {
      mainRightContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleContactClick = () => {
    navigate("/about/contact");
  };

  return (
    <>
      <div className="about-container">
        <div className="main">
          <div
            className="main-left"
            style={{ overflow: isRightActive ? "hidden" : "auto" }}
          >
            {/* Navigation Bar */}
            <div className="nav-wrapper">
              <div
                className={`nav-buttons-group ${
                  isRightActive ? "right-active" : ""
                }`}
              >
                <a className="nav-button nav-link" href="/sustainability">
                  Sustainability
                </a>
                <Link to="/about/contact" className="nav-button">
                  Contact
                </Link>
                <button
                  aria-label="Join the team"
                  className="nav-button"
                  onClick={handleNavJoinTeamClick}
                >
                  Join the team
                </button>
              </div>
            </div>
            <div ref={mainLeftRef}>
              <div
                ref={mainLeftDisableLayerRef}
                className="view-disable-layer"
                onClick={() => setIsRightActive(false)}
              ></div>
              <div
                className={`scroll-wrapper-left ${
                  isRightActive ? "right-active" : ""
                }`}
              >
                <div className="main-left-content">
                  {/* Hero Section */}
                  <div className="left-content-msg-one">
                    We give meaning to space through profound form and function.
                  </div>

                  {/* Main Description */}
                  <div className="left-content-description">
                    <div className="left-link-container">
                      <div className="left-fade-section left-link-container left-visible">
                        <p>
                          We are Powerhouse Company, an international
                          architectural firm rooted in the heart of Rotterdam,
                          the Netherlands, with offices in Oslo and Munich.
                          Since our establishment in 2005, we've grown into a
                          vibrant, multidisciplinary team of over 100 talented
                          professionals.
                        </p>
                        <p>
                          Founder Nanne de Ru is joined by an esteemed
                          leadership team, including Paul Stavert, Stefan Prins,
                          Sander Apperlo, Johanne Borthne, Albert Takashi
                          Richters and Emma Scholten. Together, we are forging
                          ahead into the future of architecture, driven by a
                          shared passion for innovation and design excellence.
                        </p>
                        <p>
                          Our portfolio consists of a diverse range of projects
                          that reflect our dedication to timelessness, beauty,
                          and the quality of life for the users of these
                          projects. Our work includes{" "}
                          <strong>
                            <a href="https://www.powerhouse-company.com/bunker-tower/article/reviving-a-brutalist-beast">
                              transformation projects
                            </a>
                          </strong>
                          ,{" "}
                          <strong>
                            <a href="https://www.powerhouse-company.com/cases/villas">
                              villas
                            </a>
                          </strong>
                          ,{" "}
                          <a href="https://www.powerhouse-company.com/cases/offices">
                            <strong>future-proof workspaces</strong>
                          </a>
                          ,{" "}
                          <a href="https://www.powerhouse-company.com/cases/living">
                            <strong>residential complexes</strong>
                          </a>
                          ,{" "}
                          <strong>
                            <a href="https://www.powerhouse-company.com/cases/interiors">
                              custom interior designs
                            </a>
                          </strong>
                          , and impactful{" "}
                          <a href="https://www.powerhouse-company.com/cases/public-spaces">
                            <strong>public projects</strong>
                          </a>
                          . From awe-inspiring residences that seamlessly blend
                          with nature to sustainable mixed-use developments that
                          redefine{" "}
                          <strong>
                            <a href="https://www.powerhouse-company.com/cases/towers">
                              cityscapes
                            </a>
                          </strong>
                          , we leave our mark by carefully shaping our projects
                          into well-balanced designs through in-depth research
                          into the historical and future context.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Video Section */}
                  <div className="video-container">
                    <div className="video-wrapper aspect-video">
                      <div className="video-frame">
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                          }}
                        >
                          <iframe
                            ref={videoRef}
                            src="https://player.vimeo.com/video/799141689?title=0&byline=0&portrait=0&autopause=0&app_id=122963&background=1&player_id=video1"
                            width="426"
                            height="240"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                            title="About Powerhouse Company.mp4"
                            style={{ width: "100%", height: "100%" }}
                          ></iframe>
                        </div>
                      </div>
                      <div
                        className="video-overlay clickable"
                        onClick={handleVideoClick}
                      ></div>
                      <div className="video-filter"></div>
                      <button
                        className="play-button"
                        onClick={handleVideoClick}
                      >
                        <div className="play-icon"></div>
                      </button>
                    </div>
                  </div>

                  {/* Mission Statement */}
                  <div className="left-content-msg-two">
                    Our mission is to create meaningful spaces that enhance
                    people's lives.
                  </div>

                  {/* Secondary Description */}
                  <div className="left-content-description left-content-description-inherit">
                    <div className="left-link-container">
                      <div className="left-fade-section left-link-container left-visible">
                        <p>
                          Behind every iconic project is a talented team of
                          international architects, designers, and thinkers. At
                          Powerhouse Company, our multidisciplinary team is our
                          enriching asset. Together we ensure that each creation
                          stands as a testament to the full ownership we take of
                          every project, from concept to construction
                          supervision. Our approach to design is based on how we
                          intertwine context, aesthetics, and function. The
                          outcome is the human and serene clarity that people
                          sense in all our projects.
                        </p>
                        <p>
                          At Powerhouse Company, we believe that the true
                          essence of a project emerges through a collaborative
                          journey with our clients. By actively engaging with
                          them, understanding their social, economic, and
                          <strong>
                            <a href="/sustainability">sustainability</a>
                          </strong>
                          goals, we coalesce their vision with our
                          <a href="/sustainability">
                            <strong>expertise</strong>
                          </a>
                          . Our collaborative spirit extends beyond our own
                          walls; we embrace the opportunity to co-create with
                          other design practices, fostering a vibrant ecosystem
                          of creativity. We actively engage by working hand in
                          hand with fellow architects and designers in workshops
                          and meaningful partnerships. We don't merely build
                          structures; we craft narratives, weaving together the
                          aspirations of our clients with our passion for
                          timeless, elegant, and purposeful design. With our
                          clients we seek to transform a vision into reality to
                          shape a future where architecture transcends the
                          ordinary, taking them on a journey where architecture
                          becomes a living testament to the delicate balance
                          between constraints and opportunities. Shaping a
                          future that transcends the ordinary.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company Statement */}
                  <div className="left-content-msg-three">
                    We are Powerhouse Company.
                    <br /> We give meaning to space.
                  </div>

                  {/* Awards Section */}
                  <div className="left-content-awards"></div>

                  {/* Newsletter Section */}
                  <div className="newsletter-container">
                    <section className="newsletter-content">
                      <div className="newsletter-heading">
                        <div>
                          Sign up for the
                          <br /> latest updates
                        </div>
                      </div>
                      <form className="newsletter-form">
                        <div className="newsletter-subheading">
                          Subscribe to our newsletter
                        </div>
                        <div className="input-container">
                          <div className="input-wrapper">
                            <input
                              type="email"
                              className="input-field"
                              id="subscribe-email"
                              placeholder=" "
                              required
                            />
                            <label
                              htmlFor="subscribe-email"
                              className="input-label"
                            >
                              Email address
                            </label>
                          </div>
                        </div>
                        <button className="subscribe-button">Subscribe</button>
                      </form>
                    </section>
                  </div>

                  {/* Featured Work Section */}
                  <div className="featured-work">
                    <div className="featured-work__heading">Featured work</div>
                    <div className="featured-work__grid">
                      {/* Project Card 1 */}
                      <div className="project-card">
                        <div className="project-card__image-wrapper project-card__image--library"></div>
                        <div className="project-card__title">
                          Rotterdam Central Library
                        </div>
                      </div>
                      {/* Project Card 2 */}
                      <div className="project-card">
                        <div className="project-card__image-wrapper project-card__image--hourglass"></div>
                        <div className="project-card__title">Hourglass</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div
            ref={mainRightRef}
            className={`main-right ${isRightActive ? "right-active" : ""}`}
          >
            <div
              ref={mainRightDisableLayerRef}
              className="view-disable-layer"
              onClick={() => setIsRightActive(true)}
            ></div>
            <div
              ref={mainRightContentRef}
              className="main-right-content"
              style={{ overflow: isRightActive ? "auto" : "hidden" }}
            >
              {!showJoinTeam ? (
                <div className="main-right-team">
                  {!isRightActive ? (
                    <div className="our-team-label-wrapper">
                      <span className="our-team-label-collapse">Our team</span>
                    </div>
                  ) : (
                    <div className="team-nav">
                      <p className="team-nav-option active">Our team</p>
                      <p className="team-nav-option">Latest updates</p>
                    </div>
                  )}
                  <div className="our-team-container">
                    {isRightActive ? (
                      <div className="team-search-container">
                        <label
                          className="team-search-label"
                          htmlFor="team-search"
                        >
                          <svg
                            className="search-icon-svg"
                            viewBox="0 0 19 20"
                            fill="none"
                          >
                            <circle
                              cx="11.022"
                              cy="7.71491"
                              r="6.71491"
                              strokeWidth="2"
                            />
                            <line
                              x1="5.11555"
                              y1="14.2986"
                              x2="0.707034"
                              y2="18.7071"
                              strokeWidth="2"
                            />
                          </svg>
                          <div className="team-search-input-box">
                            <input
                              type="text"
                              className="team-search-input"
                              id="team-search"
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                              placeholder="Name, role, location..."
                              autoComplete="off"
                            />
                            <button
                              className="team-search-input-clear-btn"
                              type="button"
                              onClick={() => setSearchValue("")}
                            >
                              Clear
                            </button>
                          </div>
                        </label>
                        <div className="show-all-btn">
                          Show
                          <button type="button">All</button>
                        </div>
                      </div>
                    ) : null}
                    <div
                      className={`our-team-list ${
                        !isRightActive ? "inActive" : ""
                      }`}
                    >
                      {teamMembers.map((member) => (
                        <div
                          className="our-team-list-item"
                          key={member.id}
                          onClick={() => handleTeamMemberClick(member)}
                        >
                          <div className="our-team-list-item-img-wrapper">
                            <img src={member.url} alt={member.name} />
                            <div className="our-team-list-item-img-wrapper-overlay"></div>
                          </div>
                          <div className="our-team-list-item-info">
                            <div className="our-team-list-item-name">
                              {member.name}
                            </div>
                            <div className="our-team-list-item-designation">
                              {member.designation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      aria-label="Join the team"
                      className="our-team-list-btn"
                      onClick={handleJoinTeamClick}
                    >
                      Join the team
                    </button>
                  </div>
                </div>
              ) : (
                <div className="join-team-container">
                  <div className="join-team-content">
                    <div className="join-team-section">
                      <div className="join-team-header">
                        <div className="join-team-title">Job positions</div>
                      </div>
                      <div className="job-listings">
                        <div className="job-list">
                          <div className="job-item">
                            <div className="job-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 227.37 302.21"
                              >
                                <path
                                  fill="#000"
                                  d="M107.92,0H0V40.35l.29,1.27L.35,260,0,261.84v40.37H64.51V182.46l43.41,0c54.49,0,119.45-15.89,119.45-91.64C227.37,30.54,187.18,0,107.92,0ZM163.1,90.79C163.1,134.77,139,160,97,160H64.63V22.47H97C139,22.46,163.1,47.37,163.1,90.79Z"
                                />
                              </svg>
                            </div>
                            <div className="job-details">
                              <strong>Ervaren Technisch Projectleider</strong>
                              <p>Rotterdam - 16 Mar 2025</p>
                            </div>
                          </div>

                          <div className="job-item">
                            <div className="job-image">
                              <img
                                src="https://static.powerhouse-company.com/wp-content/uploads/2021/04/20100747/JI-150x150.jpg"
                                alt="Ingenieur"
                              />
                            </div>
                            <div className="job-details">
                              <strong>Ingenieur</strong>
                              <p>Rotterdam - 16 Jan 2025</p>
                            </div>
                          </div>

                          <div className="job-item">
                            <div className="job-image">
                              <img
                                src="https://static.powerhouse-company.com/wp-content/uploads/2019/12/18120114/AI-150x150.jpg"
                                alt="Architecture Internship"
                              />
                            </div>
                            <div className="job-details">
                              <strong>Architecture Internship</strong>
                              <p>Rotterdam - 21 Mar 2025</p>
                            </div>
                          </div>

                          <div className="job-item">
                            <div className="job-image">
                              <img
                                src="https://static.powerhouse-company.com/wp-content/uploads/2020/01/09085427/TI-150x150.jpg"
                                alt="Technische Ingenieur Stage"
                              />
                            </div>
                            <div className="job-details">
                              <strong>Technische Ingenieur Stage</strong>
                              <p>Rotterdam - 21 Mar 2025</p>
                            </div>
                          </div>

                          <div className="job-item">
                            <div className="job-image">
                              <img
                                src="https://static.powerhouse-company.com/wp-content/uploads/2021/06/06162456/FM-150x150.jpg"
                                alt="Facility Management Stage"
                              />
                            </div>
                            <div className="job-details">
                              <strong>Facility Management Stage</strong>
                              <p>Rotterdam - 28 May 2024</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="contact" element={<Contact />} />
        <Route path="employee/:id" element={<Employee />} />
      </Routes>
    </>
  );
}

export default About;
