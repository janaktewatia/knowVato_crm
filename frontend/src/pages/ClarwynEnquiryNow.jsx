import React from 'react';
import './ClarwynEnquiryNow.css';

export default function ClarwynEnquiryNow() {
  return (
    <div className="clarwyn-landing">
      <header className="main-header">
        <div className="brand">
          <img src="https://clarwynschool.com/wp-content/themes/astra/assets/images/logo.png" alt="Clarwyn Logo" className="brand-logo" />
          <div className="brand-text">
            <h1 className="brand-name">CLARWYN SCHOOL</h1>
            <span className="brand-tagline">Clarity to Wisdom</span>
          </div>
        </div>

        {/* Desktop Contact Info (Hidden on Mobile) */}
        <div className="header-contact-info desktop-only">
          <div className="contact-item">
            <img src="https://edunext-main-storage-cf.edunexttechnologies.com/edunext_lead_management/school___static/1733286006921_Layer12.svg" alt="Phone" className="contact-icon" />
            <div className="contact-text-container">
              <span className="contact-label">Call Now</span>
              <a href="tel:+919012559012" className="contact-value">+91 9012559012</a>
            </div>
          </div>
          <div className="contact-item">
            <img src="https://edunext-main-storage-cf.edunexttechnologies.com/edunext_lead_management/school___static/1733285951682_mail1.svg" alt="Email" className="contact-icon" />
            <div className="contact-text-container">
              <span className="contact-label">Email Us</span>
              <a href="mailto:admin@clarwynschool.com" className="contact-value">admin@clarwynschool.com</a>
            </div>
          </div>
          <div className="contact-item">
            <img src="https://edunext-main-storage-cf.edunexttechnologies.com/edunext_lead_management/school___static/1733285970031_location1.svg" alt="Location" className="contact-icon" />
            <div className="contact-text-container">
              <span className="contact-label">Address</span>
              <a href="https://maps.app.goo.gl/rqhFxiPPrg17rjVB8" target="_blank" rel="noopener noreferrer" className="contact-value">A-04, Sector 145, Noida</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        {/* Left Content (Text) */}
        <div className="hero-left">
          <div className="admissions-badge">ADMISSIONS OPEN</div>
          <h2 className="hero-title">CBSE with<br />Applied<br />Inquiry</h2>
          <p className="hero-subtitle">A CBSE-led school in Sector 145, Noida, where clear teaching, purposeful questions and hands-on application help students learn with clarity, confidence and depth.</p>
        </div>

        {/* Right Form Area */}
        <div className="hero-right">
          <div className="hero-form-wrapper">
            <iframe src="https://clarwyn.simplyadmission.com/common/customizedRegistrationForm/Mg==" id="simplyIframe" title="Admission Registration Form" scrolling="yes"></iframe>
          </div>
        </div>
      </main>

      {/* Section 2: The Parent Lens */}
      <section className="parent-lens-section">
        <div className="parent-lens-container">
          {/* Left Side (Circle) */}
          <div className="parent-lens-left">
            <div className="parent-lens-circle-wrapper">
              <div className="parent-lens-circle">
                <h4 className="lens-eyebrow">THE PARENT LENS</h4>
                <h2 className="lens-title">One visit. The<br />whole school in<br />view.</h2>
                <p className="lens-desc">From one focused visit, families can understand Clarwyn's academics, foundation learning, campus, beyond academics, values, core and admissions journey.</p>
              </div>
            </div>
          </div>

          {/* Right Side (List) */}
          <div className="parent-lens-right">
            <div className="lens-item">
              <div className="lens-number">01</div>
              <div className="lens-text">
                <h3>Academic identity</h3>
                <p><strong>CBSE with Applied Inquiry</strong><br />Clear teaching, purposeful questions and hands-on application shape learning across the school.</p>
              </div>
            </div>
            <div className="lens-item">
              <div className="lens-number">02</div>
              <div className="lens-text">
                <h3>Teaching method</h3>
                <p><strong>The Clarwyn Praxis</strong><br />Students understand, question, practise, apply and reflect; the method keeps learning active without losing clarity.</p>
              </div>
            </div>
            <div className="lens-item">
              <div className="lens-number">03</div>
              <div className="lens-text">
                <h3>Foundation stage</h3>
                <p><strong>Cambridge Early Years Exposure</strong><br />Pre-Primary learning is play-rich, language-rich, teacher-guided, child-active and space-supported.</p>
              </div>
            </div>
            <div className="lens-item">
              <div className="lens-number">04</div>
              <div className="lens-text">
                <h3>Campus evidence</h3>
                <p><strong>25+ labs, studios and activity spaces</strong><br />Learning moves into the Athenaeum Library, labs, studios, stages, sports and early-years spaces.</p>
              </div>
            </div>
            <div className="lens-item">
              <div className="lens-number">05</div>
              <div className="lens-text">
                <h3>Beyond Academics</h3>
                <p><strong>Move, perform, explore, serve and lead</strong><br />Sports, arts, expeditions, service and Houses help students practise confidence and courtesy.</p>
              </div>
            </div>
            <div className="lens-item">
              <div className="lens-number">06</div>
              <div className="lens-text">
                <h3>Daily confidence</h3>
                <p><strong>Core systems families can recognise</strong><br />Safety, transport, dining, infirmary, access and communication support the school day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Footer Contact Info (Hidden on Desktop) */}
      <footer className="mobile-footer mobile-only">
        <div className="footer-contact-info">
          <div className="contact-item">
            <img src="https://edunext-main-storage-cf.edunexttechnologies.com/edunext_lead_management/school___static/1733286006921_Layer12.svg" alt="Phone" className="contact-icon" />
            <div className="contact-text-container">
              <span className="contact-label">Call Now</span>
              <a href="tel:+919012559012" className="contact-value">+91 9012559012</a>
            </div>
          </div>
          <div className="contact-item">
            <img src="https://edunext-main-storage-cf.edunexttechnologies.com/edunext_lead_management/school___static/1733285951682_mail1.svg" alt="Email" className="contact-icon" />
            <div className="contact-text-container">
              <span className="contact-label">Email Us</span>
              <a href="mailto:admin@clarwynschool.com" className="contact-value">admin@clarwynschool.com</a>
            </div>
          </div>
          <div className="contact-item">
            <img src="https://edunext-main-storage-cf.edunexttechnologies.com/edunext_lead_management/school___static/1733285970031_location1.svg" alt="Location" className="contact-icon" />
            <div className="contact-text-container">
              <span className="contact-label">Address</span>
              <a href="https://maps.app.goo.gl/rqhFxiPPrg17rjVB8" target="_blank" rel="noopener noreferrer" className="contact-value">A-04, Sector 145, Noida</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Footer Bottom Bar */}
      <div className="global-footer-bar">
        <a href="https://clarwynschool.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> About us
        </a>
        <a href="https://simplyadmission.com/" target="_blank" rel="noopener noreferrer" className="powered-by" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Powered by Simply Admission <img src="https://apps.simplyadmission.com/assets/img/logo.png" alt="Simply Admission" style={{ height: '20px' }} onError={(e) => { e.target.style.display = 'none'; }} />
        </a>
      </div>
    </div>
  );
}
