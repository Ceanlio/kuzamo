
// Load language data and render content
(function() {
  // Get saved language preference or auto-detect
  const userLang = navigator.language || navigator.userLanguage;
  let currentLang = localStorage.getItem('language') || (userLang.includes('en') ? 'en' : 'tr');
  let languageData = null; // Store language data globally
  
  // Function to get text from language data
  function getText(key) {
    const lang = localStorage.getItem('language') || (navigator.language?.includes('en') ? 'en' : 'tr');
    if (!languageData || !languageData[lang]) return key;
    return languageData[lang][key] || key;
  }
  
  // Make getText globally available
  window.getText = getText;
  
  // Set initial language to prevent flicker
  if (currentLang === 'en') {
    document.documentElement.lang = 'en';
  }
  
  // When opened via file://, try to use inline languages JSON fallback to avoid CORS
  if (location.protocol === 'file:') {
    const inline = document.getElementById('languages');
    const langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.textContent = currentLang.toUpperCase();
    if (inline && inline.textContent) {
      try {
        const data = JSON.parse(inline.textContent);
        languageData = data; // Store globally
        function getNested(obj, path){
          if (!obj || !path) return undefined;
          return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
        }
        function renderContent(lang){
          const elements = document.querySelectorAll('[data-lang]');
          elements.forEach(el => {
            const key = el.getAttribute('data-lang');
            const value = getNested(data[lang], key) ?? (data[lang] ? data[lang][key] : undefined);
            if (value !== undefined) el.innerHTML = value;
          });

          // Navbar texts
          const aboutLink = document.querySelector('nav a[href="/about.html"]');
          const pricingLink = document.querySelector('nav a[href="/pricing.html"]');
          const faqLink = document.querySelector('nav a[href="/faq.html"]');
          const contactLink = document.querySelector('nav a[href="/contact.html"]');
          if (aboutLink && data[lang]?.navbar?.about) aboutLink.textContent = data[lang].navbar.about;
          if (pricingLink && data[lang]?.navbar?.pricing) pricingLink.textContent = data[lang].navbar.pricing;
          if (faqLink && data[lang]?.navbar?.faq) faqLink.textContent = data[lang].navbar.faq;
          if (contactLink && data[lang]?.navbar?.contact) contactLink.textContent = data[lang].navbar.contact;

          // Footer texts
          const footerDescription = document.querySelector('.footer-description');
          if (footerDescription && data[lang]?.footer?.description) footerDescription.textContent = data[lang].footer.description;
          const footerAddress = document.querySelector('.footer-address');
          if (footerAddress && data[lang]?.footer?.address) footerAddress.textContent = data[lang].footer.address;
          const footerCopyright = document.querySelector('.footer-copyright');
          if (footerCopyright && data[lang]?.footer?.copyright) footerCopyright.textContent = data[lang].footer.copyright;
          const footerAboutLink = document.querySelector('.footer-about');
          if (footerAboutLink && data[lang]?.footer?.links?.about) footerAboutLink.textContent = data[lang].footer.links.about;
          const footerPricingLink = document.querySelector('.footer-pricing');
          if (footerPricingLink && data[lang]?.footer?.links?.pricing) footerPricingLink.textContent = data[lang].footer.links.pricing;
          const footerFaqLink = document.querySelector('.footer-faq');
          if (footerFaqLink && data[lang]?.footer?.links?.faq) footerFaqLink.textContent = data[lang].footer.links.faq;
          const footerContactLink = document.querySelector('.footer-contact');
          if (footerContactLink && data[lang]?.footer?.links?.contact) footerContactLink.textContent = data[lang].footer.links.contact;
          const footerPrivacyLink = document.querySelector('.footer-privacy');
          if (footerPrivacyLink && data[lang]?.footer?.links?.privacy) footerPrivacyLink.textContent = data[lang].footer.links.privacy;
          const footerTermsLink = document.querySelector('.footer-terms');
          if (footerTermsLink && data[lang]?.footer?.links?.terms) footerTermsLink.textContent = data[lang].footer.links.terms;
          const footerCookiePolicyLink = document.querySelector('.footer-cookie-policy');
          if (footerCookiePolicyLink && data[lang]?.footer?.links?.cookie_policy) footerCookiePolicyLink.textContent = data[lang].footer.links.cookie_policy;
        }

        renderContent(currentLang);
        if (langToggle) {
          langToggle.addEventListener('click', function(){
            currentLang = currentLang === 'en' ? 'tr' : 'en';
            localStorage.setItem('language', currentLang);
            document.documentElement.lang = currentLang;
            renderContent(currentLang);
            langToggle.textContent = currentLang.toUpperCase();
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLang } }));
          });
        }
        return;
      } catch (e) {
        // Fallback to toggle-only behavior if inline JSON invalid
        if (langToggle) {
          langToggle.addEventListener('click', function(){
            currentLang = currentLang === 'en' ? 'tr' : 'en';
            localStorage.setItem('language', currentLang);
            document.documentElement.lang = currentLang;
            langToggle.textContent = currentLang.toUpperCase();
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLang } }));
          });
        }
        return;
      }
    } else {
      // No inline JSON present; keep toggle-only behavior
      const langToggle2 = document.getElementById('langToggle');
      if (langToggle2) {
        langToggle2.addEventListener('click', function(){
          currentLang = currentLang === 'en' ? 'tr' : 'en';
          localStorage.setItem('language', currentLang);
          document.documentElement.lang = currentLang;
          langToggle2.textContent = currentLang.toUpperCase();
          document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLang } }));
        });
      }
      return;
    }
  }
  
  fetch('languages.json')
    .then(response => response.json())
    .then(data => {
      languageData = data; // Store globally
      const langToggle = document.getElementById('langToggle');
      
      // Update toggle button text
      if (langToggle) {
        langToggle.textContent = currentLang.toUpperCase();
      }

      function renderContent(lang) {
        // Helper to safely resolve nested keys like "hero.title"
        const getNested = (obj, path) => {
          if (!obj || !path) return undefined;
          return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
        };

        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(element => {
          const key = element.getAttribute('data-lang');
          const value = getNested(data[lang], key) ?? (data[lang] ? data[lang][key] : undefined);
          if (value !== undefined) {
            element.innerHTML = value;
          }
        });

        // Update inputs/textareas placeholders marked with data-lang-placeholder
        const placeholderEls = document.querySelectorAll('[data-lang-placeholder]');
        placeholderEls.forEach(el => {
          const key = el.getAttribute('data-lang-placeholder');
          const value = getNested(data[lang], key) ?? (data[lang] ? data[lang][key] : undefined);
          if (value !== undefined) {
            el.placeholder = value;
          }
        });

        // Global: Navbar texts (works on all pages that have these links)
        const aboutLink = document.querySelector('nav a[href="/about.html"]');
        const pricingLink = document.querySelector('nav a[href="/pricing.html"]');
        const faqLink = document.querySelector('nav a[href="/faq.html"]');
        const contactLink = document.querySelector('nav a[href="/contact.html"]');
        if (aboutLink && data[lang]?.navbar?.about) aboutLink.textContent = data[lang].navbar.about;
        if (pricingLink && data[lang]?.navbar?.pricing) pricingLink.textContent = data[lang].navbar.pricing;
        if (faqLink && data[lang]?.navbar?.faq) faqLink.textContent = data[lang].navbar.faq;
        if (contactLink && data[lang]?.navbar?.contact) contactLink.textContent = data[lang].navbar.contact;

        const themeToggleBtn = document.getElementById('themeToggle');
        if (themeToggleBtn && data[lang]?.navbar?.theme_toggle) {
          themeToggleBtn.setAttribute('aria-label', data[lang].navbar.theme_toggle);
        }
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn && data[lang]?.navbar?.mobile_menu) {
          mobileMenuBtn.textContent = data[lang].navbar.mobile_menu;
        }

        // Global: Footer texts
        const footerDescription = document.querySelector('.footer-description');
        if (footerDescription && data[lang]?.footer?.description) footerDescription.textContent = data[lang].footer.description;
        const footerAddress = document.querySelector('.footer-address');
        if (footerAddress && data[lang]?.footer?.address) footerAddress.textContent = data[lang].footer.address;
        const footerCopyright = document.querySelector('.footer-copyright');
        if (footerCopyright && data[lang]?.footer?.copyright) footerCopyright.textContent = data[lang].footer.copyright;

        const footerAboutLink = document.querySelector('.footer-about');
        if (footerAboutLink && data[lang]?.footer?.links?.about) footerAboutLink.textContent = data[lang].footer.links.about;
        const footerPricingLink = document.querySelector('.footer-pricing');
        if (footerPricingLink && data[lang]?.footer?.links?.pricing) footerPricingLink.textContent = data[lang].footer.links.pricing;
        const footerFaqLink = document.querySelector('.footer-faq');
        if (footerFaqLink && data[lang]?.footer?.links?.faq) footerFaqLink.textContent = data[lang].footer.links.faq;
        const footerContactLink = document.querySelector('.footer-contact');
        if (footerContactLink && data[lang]?.footer?.links?.contact) footerContactLink.textContent = data[lang].footer.links.contact;
        const footerPrivacyLink = document.querySelector('.footer-privacy');
        if (footerPrivacyLink && data[lang]?.footer?.links?.privacy) footerPrivacyLink.textContent = data[lang].footer.links.privacy;
        const footerTermsLink = document.querySelector('.footer-terms');
        if (footerTermsLink && data[lang]?.footer?.links?.terms) footerTermsLink.textContent = data[lang].footer.links.terms;
        const footerCookiePolicyLink = document.querySelector('.footer-cookie-policy');
        if (footerCookiePolicyLink && data[lang]?.footer?.links?.cookie_policy) footerCookiePolicyLink.textContent = data[lang].footer.links.cookie_policy;

        // Pricing page dynamic texts
        const pricingTitleEl = document.querySelector('main h1');
        const pricingSubtitleEl = document.querySelector('.pricing-subtitle');
        const freeTitle = document.querySelector('.free-title');
        const freePrice = document.querySelector('.free-price');
        const freeButton = document.querySelector('.free-button');
        const teamTitle = document.querySelector('.team-title');
        const teamPrice = document.querySelector('.team-price');
        const teamButton = document.querySelector('.team-button');
        const businessTitle = document.querySelector('.business-title');
        const businessPrice = document.querySelector('.business-price');
        const businessButton = document.querySelector('.business-button');
        const enterpriseTitle = document.querySelector('.enterprise-title');
        const enterprisePrice = document.querySelector('.enterprise-price');
        const enterpriseButton = document.querySelector('.enterprise-button');
        const freeFeatures = document.querySelectorAll('.free-features li');
        const teamFeatures = document.querySelectorAll('.team-features li');
        const businessFeatures = document.querySelectorAll('.business-features li');
        const enterpriseFeatures = document.querySelectorAll('.enterprise-features li');
        const comparisonTitle = document.querySelector('.comparison-title');
        const faqTitle = document.querySelector('.pricing-faq-title');
        const q1 = document.querySelector('.pricing-faq-q1');
        const a1 = document.querySelector('.pricing-faq-a1');
        const q2 = document.querySelector('.pricing-faq-q2');
        const a2 = document.querySelector('.pricing-faq-a2');
        const q3 = document.querySelector('.pricing-faq-q3');
        const a3 = document.querySelector('.pricing-faq-a3');
        const q4 = document.querySelector('.pricing-faq-q4');
        const a4 = document.querySelector('.pricing-faq-a4');
        const ctaTitle = document.querySelector('.pricing-cta-title');
        const ctaDesc = document.querySelector('.pricing-cta-desc');
        const ctaButton = document.querySelector('.pricing-cta-button');

        if (pricingSubtitleEl || teamTitle || enterpriseTitle || comparisonTitle || faqTitle) {
          const p = data[lang]?.pricing;
          if (p) {
            if (pricingTitleEl) pricingTitleEl.textContent = p.title;
            if (pricingSubtitleEl) pricingSubtitleEl.textContent = p.subtitle;
            // Billing toggle labels
            const monthBtn = document.querySelector('#pricingToggle .billing-month');
            const yearBtn = document.querySelector('#pricingToggle .billing-year');
            const saveBadge = document.querySelector('.billing-save');
            if (p.billing) {
              if (monthBtn) monthBtn.textContent = p.billing.monthly;
              if (yearBtn) yearBtn.textContent = p.billing.yearly;
              if (saveBadge) saveBadge.textContent = p.billing.save_badge;
            }
            if (freeTitle) freeTitle.textContent = p.free?.title;
            if (freePrice) {
              freePrice.textContent = p.free?.price;
              freePrice.setAttribute('data-monthly', p.free?.price_monthly || p.free?.price || '');
              freePrice.setAttribute('data-yearly', p.free?.price_yearly || p.free?.price || '');
            }
            if (freeButton) freeButton.textContent = p.free?.button;
            if (teamTitle) teamTitle.textContent = p.team?.title;
            if (teamPrice) {
              teamPrice.textContent = p.team?.price;
              teamPrice.setAttribute('data-monthly', p.team?.price_monthly || p.team?.price || '');
              teamPrice.setAttribute('data-yearly', p.team?.price_yearly || p.team?.price || '');
            }
            if (teamButton) teamButton.textContent = p.team?.button;
            if (businessTitle) businessTitle.textContent = p.business?.title;
            if (businessPrice) {
              businessPrice.textContent = p.business?.price;
              businessPrice.setAttribute('data-monthly', p.business?.price_monthly || p.business?.price || '');
              businessPrice.setAttribute('data-yearly', p.business?.price_yearly || p.business?.price || '');
            }
            if (businessButton) businessButton.textContent = p.business?.button;
            if (enterpriseTitle) enterpriseTitle.textContent = p.enterprise?.title;
            if (enterprisePrice) {
              enterprisePrice.textContent = p.enterprise?.price;
              enterprisePrice.setAttribute('data-monthly', p.enterprise?.price_monthly || p.enterprise?.price || '');
              enterprisePrice.setAttribute('data-yearly', p.enterprise?.price_yearly || p.enterprise?.price || '');
            }
            if (enterpriseButton) enterpriseButton.textContent = p.enterprise?.button;
            const badge = document.querySelector('.badge-popular');
            if (badge && p.popular_badge) badge.textContent = p.popular_badge;
            if (freeFeatures.length && p.free?.features) p.free.features.forEach((f,i)=>{ if (freeFeatures[i]) freeFeatures[i].textContent = '• ' + f; });
            if (teamFeatures.length && p.team?.features) p.team.features.forEach((f,i)=>{ if (teamFeatures[i]) teamFeatures[i].textContent = '• ' + f; });
            if (businessFeatures.length && p.business?.features) p.business.features.forEach((f,i)=>{ if (businessFeatures[i]) businessFeatures[i].textContent = '• ' + f; });
            if (enterpriseFeatures.length && p.enterprise?.features) p.enterprise.features.forEach((f,i)=>{ if (enterpriseFeatures[i]) enterpriseFeatures[i].textContent = '• ' + f; });
            if (comparisonTitle) comparisonTitle.textContent = p.comparison_title;
            // Comparison table headers
            const colFree = document.querySelector('.col-free');
            const colTeam = document.querySelector('.col-team');
            const colBusiness = document.querySelector('.col-business');
            const colEnterprise = document.querySelector('.col-enterprise');
            const featureCol = document.querySelector('.feature-col');
            if (p.comparison_cols) {
              if (featureCol) featureCol.textContent = p.comparison_cols.feature;
              if (colFree && p.comparison_cols.free) colFree.textContent = p.comparison_cols.free;
              if (colTeam) colTeam.textContent = p.comparison_cols.team;
              if (colBusiness && p.comparison_cols.business) colBusiness.textContent = p.comparison_cols.business;
              if (colEnterprise) colEnterprise.textContent = p.comparison_cols.enterprise;
            }
            // Comparison table rows
            const rowUsers = document.querySelector('.row-users');
            const rowProjects = document.querySelector('.row-projects');
            const rowAi = document.querySelector('.row-ai');
            const rowAiCredits = document.querySelector('.row-ai-credits');
            const rowChannels = document.querySelector('.row-channels');
            const rowMonthlyContent = document.querySelector('.row-monthly-content');
            const rowApprovals = document.querySelector('.row-approvals');
            const rowSupport = document.querySelector('.row-support');
            const rowSso = document.querySelector('.row-sso');
            const rowAudit = document.querySelector('.row-audit');
            if (p.comparison_rows) {
              if (rowUsers) rowUsers.textContent = p.comparison_rows.users;
              if (rowProjects) rowProjects.textContent = p.comparison_rows.projects;
              if (rowAi) rowAi.textContent = p.comparison_rows.ai;
              if (rowAiCredits) rowAiCredits.textContent = p.comparison_rows.ai_credits;
              if (rowChannels) rowChannels.textContent = p.comparison_rows.channels;
              if (rowMonthlyContent) rowMonthlyContent.textContent = p.comparison_rows.monthly_content;
              if (rowApprovals) rowApprovals.textContent = p.comparison_rows.approvals;
              if (rowSupport) rowSupport.textContent = p.comparison_rows.support;
              if (rowSso) rowSso.textContent = p.comparison_rows.sso;
              if (rowAudit) rowAudit.textContent = p.comparison_rows.audit;
              const aiBasic = document.querySelector('.val-ai-basic');
              const aiAdvanced = document.querySelector('.val-ai-advanced');
              const aiCustom = document.querySelector('.val-ai-custom');
              if (aiBasic) aiBasic.textContent = p.comparison_rows.ai_values?.basic || aiBasic.textContent;
              if (aiAdvanced) aiAdvanced.textContent = p.comparison_rows.ai_values?.advanced || aiAdvanced.textContent;
              if (aiCustom) aiCustom.textContent = p.comparison_rows.ai_values?.custom || aiCustom.textContent;
              const yesVals = document.querySelectorAll('.val-yes');
              yesVals.forEach(el=> el.textContent = p.comparison_rows.boolean?.yes || '✔');
              const noVals = document.querySelectorAll('.val-no');
              noVals.forEach(el=> el.textContent = p.comparison_rows.boolean?.no || '-');
              // Approval workflow values
              const approvalNone = document.querySelectorAll('.val-approval-none');
              approvalNone.forEach(el=> el.textContent = p.comparison_rows.approval_values?.none || '-');
              const approvalMultiStep = document.querySelectorAll('.val-approval-multi-step');
              approvalMultiStep.forEach(el=> el.textContent = p.comparison_rows.approval_values?.multi_step || 'Multi-step');
              const approvalMultiStepRoles = document.querySelectorAll('.val-approval-multi-step-roles');
              approvalMultiStepRoles.forEach(el=> el.textContent = p.comparison_rows.approval_values?.multi_step_roles || 'Multi-step + roles');
              const approvalEnterprise = document.querySelectorAll('.val-approval-enterprise');
              approvalEnterprise.forEach(el=> el.textContent = p.comparison_rows.approval_values?.enterprise || 'Enterprise');
            }
            if (faqTitle) faqTitle.textContent = p.faq_title;
            if (q1) q1.textContent = p.faq?.q1; if (a1) a1.textContent = p.faq?.a1;
            if (q2) q2.textContent = p.faq?.q2; if (a2) a2.textContent = p.faq?.a2;
            if (q3) q3.textContent = p.faq?.q3; if (a3) a3.textContent = p.faq?.a3;
            if (q4) q4.textContent = p.faq?.q4; if (a4) a4.textContent = p.faq?.a4;
            if (ctaTitle) ctaTitle.textContent = p.cta?.title;
            if (ctaDesc) ctaDesc.textContent = p.cta?.desc;
            if (ctaButton) ctaButton.textContent = p.cta?.button;

            // Unlimited labels
            document.querySelectorAll('.val-unlimited').forEach(el => {
              el.textContent = p.comparison_rows?.unlimited || el.textContent;
            });
            // Custom labels
            document.querySelectorAll('.val-custom').forEach(el => {
              el.textContent = p.comparison_rows?.custom || el.textContent;
            });
          }
        }

        // FAQ page dynamic texts (subtitle + CTA)
        const faqPageSubtitle = document.querySelector('.faq-subtitle');
        const faqPageCta = document.querySelector('.faq-cta');
        const faqPageData = data[lang]?.faq_page;
        if (faqPageData) {
          if (faqPageSubtitle && faqPageData.subtitle) faqPageSubtitle.textContent = faqPageData.subtitle;
          if (faqPageCta && faqPageData.cta) faqPageCta.textContent = faqPageData.cta;
        }
      }

      renderContent(currentLang);

      if (langToggle) {
        langToggle.addEventListener('click', function() {
          currentLang = currentLang === 'en' ? 'tr' : 'en';
          localStorage.setItem('language', currentLang);
          document.documentElement.lang = currentLang;
          renderContent(currentLang);
          langToggle.textContent = currentLang.toUpperCase();
          
          // Trigger language change event for cookie consent widget
          document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: currentLang } 
          }));
        });
      }
    })
    .catch(error => {
      console.error('Error loading language data:', error);
    });
})();

// Tema değiştirici
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    // Update button text based on current theme
    const isDark = document.documentElement.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    
    themeToggle.addEventListener('click', function(){
  const el = document.documentElement;
  const isDark = el.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
});
  }
  
// Mobil menü
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function(){
  const m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('hidden');
});
  }
  

// Reveal on scroll
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if (entry.isIntersecting) {
        entry.target.classList.add('motion-safe:animate-fade-in-up');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((el)=> io.observe(el));
}
  
  // Main Contact Form Validation
  const mainForm = document.getElementById('mainContactForm');
  const mainSubmitBtn = document.getElementById('mainSubmitBtn');
  
  if (mainForm && mainSubmitBtn) {
    // Form validation
    function validateMainForm() {
      let isValid = true;
      
      // Reset all error messages
      document.querySelectorAll('[id^="main"][id$="Error"]').forEach(el => el.classList.add('hidden'));
      
      // Validate name
      const nameElement = document.getElementById('mainName');
      const name = nameElement ? nameElement.value.trim() : '';
      if (!name) {
        const nameError = document.getElementById('mainNameError');
        if (nameError) {
          nameError.classList.remove('hidden');
        }
        isValid = false;
      }
      
      // Validate email
      const emailElement = document.getElementById('mainEmail');
      const email = emailElement ? emailElement.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        const emailError = document.getElementById('mainEmailError');
        if (emailError) {
          emailError.classList.remove('hidden');
        }
        isValid = false;
      } else {
        // Check for duplicate email in localStorage
        const submittedEmails = JSON.parse(localStorage.getItem('submittedEmails') || '[]');
        const emailExists = submittedEmails.some(item => 
          item.email.toLowerCase() === email.toLowerCase() && 
          (Date.now() - item.timestamp) < (24 * 60 * 60 * 1000) // 24 hours
        );
        
        if (emailExists) {
          const emailError = document.getElementById('mainEmailError');
          if (emailError) {
            emailError.textContent = getText('form_email_duplicate');
            emailError.classList.remove('hidden');
          }
          isValid = false;
        }
      }
      
      // Message removed
      
      // Validate captcha
      if (typeof turnstile !== 'undefined') {
        const turnstileResponse = turnstile.getResponse();
        if (!turnstileResponse) {
          document.getElementById('mainCaptchaError').classList.remove('hidden');
          isValid = false;
        }
      }
      
      // Validate consent
      const consentElement = document.getElementById('mainConsent');
      const consent = consentElement ? consentElement.checked : false;
      
      if (!consent) {
        const consentError = document.getElementById('mainConsentError');
        if (consentError) {
          consentError.classList.remove('hidden');
        }
        isValid = false;
      }
      
      return isValid;
    }
    
    // Form submission
    mainForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (!validateMainForm()) {
        return;
      }
      
      // Disable submit button and show loading state (robust to missing span)
      mainSubmitBtn.disabled = true;
      const spanEl = mainSubmitBtn.querySelector('span');
      const originalHTML = spanEl ? spanEl.innerHTML : mainSubmitBtn.innerHTML;
      // Get current language and loading text
      const currentLang = localStorage.getItem('language') || (navigator.language?.includes('en') ? 'en' : 'tr');
      const loadingText = currentLang === 'en' ? 'Sending...' : 'Gönderiliyor...';
      
      const loadingHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        ${loadingText}
      `;
      if (spanEl) { spanEl.innerHTML = loadingHTML; } else { mainSubmitBtn.innerHTML = loadingHTML; }
      
      try {
        // Build payload
        const nameElement = document.getElementById('mainName');
        const emailElement = document.getElementById('mainEmail');
        const companyElement = document.getElementById('mainCompany');
        const messageElement = document.getElementById('mainMessage');
        
        const payload = {
          name: nameElement ? nameElement.value.trim() : '',
          email: emailElement ? emailElement.value.trim() : '',
          company: companyElement ? companyElement.value.trim() : '',
          message: messageElement ? messageElement.value.trim() : '',
          lang: (localStorage.getItem('language') || ((navigator.language||'').includes('en') ? 'en' : 'tr'))
        };
        
        // Call Cloudflare Pages Function (double opt-in)
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
          const err = await safeJson(res);
          const errorMsg = err?.error || 'Server error';
          console.error('API Error:', errorMsg, 'Response:', err);
          throw new Error(errorMsg);
        }
        
        // Store email in localStorage to prevent duplicate submissions
        const submittedEmails = JSON.parse(localStorage.getItem('submittedEmails') || '[]');
        submittedEmails.push({
          email: payload.email.toLowerCase(),
          timestamp: Date.now()
        });
        // Keep only last 50 entries and clean old ones (older than 24h)
        const cleanedEmails = submittedEmails
          .filter(item => (Date.now() - item.timestamp) < (24 * 60 * 60 * 1000))
          .slice(-50);
        localStorage.setItem('submittedEmails', JSON.stringify(cleanedEmails));

        // Success modal
        openSuccessModal();
        mainForm.reset();
        if (typeof turnstile !== 'undefined') turnstile.reset();
      } catch (error) {
        console.error('Form submission error:', error);
        let errorMessage = 'Gönderim başarısız. Lütfen tekrar deneyin.';
        
        if (error.message === 'Invalid name or email') {
          errorMessage = 'Lütfen geçerli bir ad ve e-posta adresi giriniz.';
        } else if (error.message === 'Already requested. Please check your inbox.') {
          errorMessage = getText('form_email_pending');
        } else if (error.message === 'Email already confirmed. You are already on our list.') {
          errorMessage = getText('form_email_confirmed');
        } else if (error.message === 'Too many requests') {
          errorMessage = getText('form_rate_limit');
        } else if (error.message === 'Disposable email not allowed') {
          errorMessage = getText('form_disposable_email');
        } else if (error.message === 'Email domain has no MX') {
          errorMessage = getText('form_invalid_domain');
        } else if (error.message === 'This email has been unsubscribed. Please contact support if you want to resubscribe.') {
          errorMessage = getText('form_unsubscribed');
        }
        
        showMessage(errorMessage, 'error');
      } finally {
        // Re-enable submit button
        mainSubmitBtn.disabled = false;
        if (spanEl) { spanEl.innerHTML = originalHTML; } else { mainSubmitBtn.innerHTML = originalHTML; }
      }
    });
    
    // Real-time validation
    const mainInputs = mainForm.querySelectorAll('input[required], textarea[required]');
    mainInputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateMainField(input);
      });
      
      input.addEventListener('input', function() {
        // Clear error when user starts typing
        const errorId = input.id + 'Error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          errorElement.classList.add('hidden');
        }
      });
    });
    
    function validateMainField(field) {
      const value = field.value.trim();
      const errorId = field.id + 'Error';
      const errorElement = document.getElementById(errorId);
      
      if (!errorElement) return;
      
      let isValid = true;
      let errorMessage = '';
      
      switch (field.id) {
        case 'mainName':
          if (!value) {
            isValid = false;
            errorMessage = 'Ad soyad alanı zorunludur.';
          }
          break;
          
        case 'mainEmail':
          if (!value) {
            isValid = false;
            errorMessage = 'E-posta alanı zorunludur.';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Geçerli bir e-posta adresi giriniz.';
          }
          break;
          
        
      }
      
      if (!isValid) {
        errorElement.textContent = errorMessage;
        errorElement.classList.remove('hidden');
      } else {
        errorElement.classList.add('hidden');
      }
    }
    
    // Checkbox validation
    const mainConsentCheckbox = document.getElementById('mainConsent');
    if (mainConsentCheckbox) {
      mainConsentCheckbox.addEventListener('change', function() {
        const consentError = document.getElementById('mainConsentError');
        
        if (consentError) {
          if (this.checked) {
            consentError.classList.add('hidden');
          } else {
            consentError.classList.remove('hidden');
          }
        }
      });
    }
  }

  // Utils
  async function safeJson(res){
    try { return await res.json(); } catch { return null; }
  }

  // Show message function
  function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast fixed top-20 right-6 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  // Pricing billing toggle (monthly/yearly)
  const pricingToggle = document.getElementById('pricingToggle');
  if (pricingToggle) {
    const monthBtn = pricingToggle.querySelector('.billing-month');
    const yearBtn = pricingToggle.querySelector('.billing-year');
    function applyPrices(mode){
      document.querySelectorAll('.price-amount').forEach(el=>{
        const val = el.getAttribute(mode === 'yearly' ? 'data-yearly' : 'data-monthly');
        if (val) el.textContent = val;
      });
      if (mode === 'yearly') {
        monthBtn.classList.remove('active');
        monthBtn.classList.remove('bg-gray-100','dark:bg-gray-800');
        yearBtn.classList.add('active');
        yearBtn.classList.add('bg-gray-100','dark:bg-gray-800');
      } else {
        yearBtn.classList.remove('active');
        yearBtn.classList.remove('bg-gray-100','dark:bg-gray-800');
        monthBtn.classList.add('active');
        monthBtn.classList.add('bg-gray-100','dark:bg-gray-800');
      }
    }
    monthBtn?.addEventListener('click', ()=> applyPrices('monthly'));
    yearBtn?.addEventListener('click', ()=> applyPrices('yearly'));
  }

  // Modern success modal (double opt-in)
  function openSuccessModal(){
    const existing = document.getElementById('success-modal');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'success-modal';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4';
    const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en');
    const title = isEn ? 'Request Received' : 'Talebiniz Alındı';
    const desc = isEn ? 'We sent a confirmation link to your email. Please check your inbox.' : 'E‑postanıza bir onay bağlantısı gönderdik. Lütfen e‑postanızı kontrol edin.';
    const okText = isEn ? 'OK' : 'Tamam';
    overlay.innerHTML = `
      <div class="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-6 text-center">
          <div class="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg class="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">${title}</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">${desc}</p>
          <div class="mt-6 flex justify-center gap-3">
            <button id="success-close" class="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700">${okText}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('success-close').addEventListener('click', ()=> overlay.remove());
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove(); });
  }
});
