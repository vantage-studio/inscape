import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Contact.css";

function Contact() {
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const containerRef = useRef(null);

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
        navigate("/");
      }, 500);
    }
  }, [navigate]);

  return (
    <>
      <div className="contact-overlay" ref={overlayRef}></div>
      <div
        className="contact-container"
        ref={containerRef}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className="contact-us-content">
          <div>
            <div className="contact-title">Contact</div>
          </div>
          <div className="contact-links">
            <div className="contact-link-item">
              <a href="mailto:office@powerhouse-company.com">Email</a>
            </div>
            <div className="contact-link-item">
              <a href="mailto:pr@powerhouse-company.com">Press</a>
            </div>
            <div className="contact-link-item">
              <a href="https://www.linkedin.com/company/powerhouse-company/">
                LinkedIn
              </a>
            </div>
            <div className="contact-link-item">
              <a href="https://www.instagram.com/powerhousecompany/">
                Instagram
              </a>
            </div>
          </div>
          <div>
            <div className="contact-title">Our Offices</div>
          </div>
          <div className="offices-grid">
            <div className="office-item">
              <div className="office-image">
                <a
                  href="https://goo.gl/maps/LDBbiQc6ex8bWBY16"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="image-wrapper">
                    <div
                      className="image"
                      style={{
                        backgroundImage: `url(https://static.powerhouse-company.com/wp-content/uploads/2021/05/04161308/Powerhouse-New-Rotterdam-02-768x767.jpg)`,
                      }}
                    ></div>
                  </div>
                </a>
              </div>
              <div className="office-details">
                <div className="office-name">Rotterdam</div>
                <div className="office-contacts">
                  <a href="mailto:office@powerhouse-company.com">
                    office@powerhouse-company.com
                  </a>
                  <a href="tel:+31 10 404 67 89">+31 10 404 67 89</a>
                </div>
                <a
                  href="https://goo.gl/maps/LDBbiQc6ex8bWBY16"
                  target="_blank"
                  rel="noreferrer"
                >
                  Antoine Platekade 1000
                  <br />
                  3072 ME Rotterdam
                  <br />
                  The Netherlands
                </a>
              </div>
            </div>
            <div className="office-item">
              <div className="office-image">
                <a
                  href="https://goo.gl/maps/4tAjiF1oRuTDmi8B9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="image-wrapper">
                    <div
                      className="image"
                      style={{
                        backgroundImage: `url(https://static.powerhouse-company.com/wp-content/uploads/2021/02/17112020/Powerhouse-New-Munich-768x768.jpg)`,
                      }}
                    ></div>
                  </div>
                </a>
              </div>
              <div className="office-details">
                <div className="office-name">München</div>
                <div className="office-contacts">
                  <a href="mailto:officemunich@powerhouse-company.com">
                    officemunich@powerhouse-company.com
                  </a>
                  <a href="tel:+49 89 212 363 50">+49 89 212 363 50</a>
                </div>
                <a
                  href="https://goo.gl/maps/4tAjiF1oRuTDmi8B9"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bavariaring 26
                  <br />
                  80336 München
                  <br />
                  Germany
                </a>
              </div>
            </div>
            <div className="office-item">
              <div className="office-image">
                <a
                  href="https://goo.gl/maps/DEgKbrmoeyhoaVEL6"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="image-wrapper">
                    <div
                      className="image"
                      style={{
                        backgroundImage: `url(https://static.powerhouse-company.com/wp-content/uploads/2022/11/02104058/Powerhouse-New-Oslo-03-768x768.jpg)`,
                      }}
                    ></div>
                  </div>
                </a>
              </div>
              <div className="office-details">
                <div className="office-name">Oslo</div>
                <div className="office-contacts">
                  <a href="mailto:officeoslo@powerhouse-company.com">
                    officeoslo@powerhouse-company.com
                  </a>
                  <a href="tel: +47 95 757 996"> +47 95 757 996</a>
                </div>
                <a
                  href="https://goo.gl/maps/DEgKbrmoeyhoaVEL6"
                  target="_blank"
                  rel="noreferrer"
                >
                  Waldemar Thranes gate 84c
                  <br />
                  0175 Oslo
                  <br />
                  Norway
                </a>
              </div>
            </div>
          </div>

          <div className="company-info">
            <div className="company-grid">
              <div className="company-left">
                <div className="company-title">
                  Powerhouse Company International B.V. , G.N. de Ru
                </div>
              </div>
              <div className="company-right">
                <div className="contact-group">
                  <a href="mailto:office@powerhouse-company.com">
                    office@powerhouse-company.com
                  </a>
                  <a href="tel:+31104046789">+31104046789</a>
                </div>
                <div className="contact-group">
                  <a
                    href="https://www.google.com/maps/place/Floating+Office+Rotterdam/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Antoine Platekade | 1000 | 3072 ME | Rotterdam | The
                    Netherlands
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;
