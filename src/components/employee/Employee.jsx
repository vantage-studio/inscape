import { useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teamMembers } from "../../data/teamMembers";
import "./Employee.css";

export default function Employee() {
  // Navigation and routing hooks
  const navigate = useNavigate();
  const { id } = useParams();

  // Find employee data from team members
  const employee = teamMembers.find((member) => member.id === id);

  // Refs for animation elements
  const overlayRef = useRef(null);
  const containerRef = useRef(null);

  // Handle modal close with animations
  const handleClose = useCallback(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;

    if (overlay && container) {
      overlay.style.animation = "";
      container.style.animation = "";

      void overlay.offsetWidth;
      void container.offsetWidth;

      overlay.classList.add("exit");
      container.classList.add("exit");

      setTimeout(() => {
        navigate("/about");
      }, 500);
    }
  }, [navigate]);

  // Safety check for invalid employee
  if (!employee) return null;

  return (
    <>
      {/* Overlay background */}
      <div
        className="employee-overlay"
        ref={overlayRef}
        onClick={handleClose}
      ></div>

      {/* Main content container */}
      <div
        className="employee-content-container"
        ref={containerRef}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className="employee-content">
          <div>
            {/* Employee header info */}
            <div className="employee-designation">{employee.designation}</div>
            <div className="employee-name">{employee.name}</div>

            {/* Employee image */}
            <div className="employee-image">
              <img src={employee.url} alt={employee.name} />
            </div>

            {/* Employee details section */}
            <div className="employee-description-container">
              <div className="employee-description">
                `{employee.description}`
              </div>

              {/* Additional employee information */}
              <div className="employee-other-details">
                <aside className="employee-Nationality">
                  <div>Nationality</div>
                  <span>Dutch</span>
                </aside>

                {/* Detailed employee description */}
                <div className="employee-other-info">
                  <p>
                    I founded Powerhouse Company because I wanted to create a
                    team of outstanding professionals – a real powerhouse that
                    would create next-level architecture. I'm proud that we have
                    grown into an international office with the ability to work
                    on an exceptionally wide range of projects, from interiors
                    to train stations and from villas to high rises. We have
                    grown steadily, boosted by the trust that our amazing
                    clients place in our services. In the office what I find
                    most gratifying is the talent of our incredible people and
                    the wonderful times we have with our clients when we're
                    working together on projects.
                  </p>
                  <p>
                    The thing I enjoy most about my job is working with our
                    fantastic clients and architects and engineers. The reason I
                    chose this profession is because I wanted to create
                    meaningful spaces, in which the sum of all the component
                    parts add up to more than all the individual elements.
                  </p>
                  <p>
                    My top prediction for architecture and engineering in the
                    future is that they will continue to be of crucial value for
                    the development of our cities. In particular, inner-city
                    redevelopment projects need architects as team players and
                    visionary leaders.
                  </p>

                  {/* Social links */}
                  <div className="employee-social-links">
                    <a
                      href="mailto:contact@example.com"
                      className="animated-link"
                    >
                      Email
                    </a>
                    <a
                      href="https://linkedin.com/in/example"
                      className="animated-link"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured projects section */}
            <div className="employee-featured-projects">
              <div className="employee-featured-projects-title">
                Featured projects
              </div>
              <div className="employee-featured-projects-list">
                <div className="employee-featured-projects-item">
                  <div className="employee-featured-projects-image"></div>
                  <div className="employee-featured-projects-name">Villa 1</div>
                </div>
                <div className="employee-featured-projects-item">
                  <div className="employee-featured-projects-image"></div>
                  <div className="employee-featured-projects-name">Villa B</div>
                </div>
                <div className="employee-featured-projects-item">
                  <div className="employee-featured-projects-image"></div>
                  <div className="employee-featured-projects-name">
                    Penthouse West
                  </div>
                </div>
                <div className="employee-featured-projects-item">
                  <div className="employee-featured-projects-image"></div>
                  <div className="employee-featured-projects-name">FOR</div>
                </div>
                <div className="employee-featured-projects-item">
                  <div className="employee-featured-projects-image"></div>
                  <div className="employee-featured-projects-name">
                    Jakoba Mulderhuis
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
