// Cookie Consent Management for Kuzamo - Multilingual Support
class CookieConsent {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.cookiePreferences = {
      necessary: true, // Always true, cannot be disabled
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    this.translations = {
      tr: {
        cookieTypes: {
          necessary: {
            name: 'necessary',
            title: 'Gerekli Çerezler',
            description: 'Bu çerezler web sitesinin temel işlevleri için gereklidir ve güvenlik, oturum yönetimi ve temel site işlevselliği için kullanılır.',
            required: true
          },
          analytics: {
            name: 'analytics',
            title: 'Analitik Çerezler',
            description: 'Bu çerezler site kullanımını analiz etmemize, performansı ölçmemize ve kullanıcı deneyimini iyileştirmemize yardımcı olur.',
            required: false
          },
          marketing: {
            name: 'marketing',
            title: 'Pazarlama Çerezleri',
            description: 'Bu çerezler size kişiselleştirilmiş reklamlar ve içerikler sunmamıza yardımcı olur.',
            required: false
          },
          preferences: {
            name: 'preferences',
            title: 'Tercih Çerezleri',
            description: 'Bu çerezler dil tercihlerinizi, tema seçimlerinizi ve diğer kişiselleştirme ayarlarınızı hatırlar.',
            required: false
          }
        },
        banner: {
          title: 'Çerez Kullanımı',
          description: 'Kuzamo olarak, web sitemizde deneyiminizi geliştirmek için çerezler kullanıyoruz.',
          privacyLink: 'Gizlilik Politikamız',
          moreInfoHTML: '<a href="/privacy.html" class="text-brand-600 dark:text-brand-400 hover:underline">Gizlilik Politikamız</a>\'nda detayları bulabilirsiniz.',
          settingsBtn: 'Çerez Ayarları',
          policyLink: 'Çerez Politikası',
          acceptAll: 'Tümünü Kabul Et',
          acceptNecessary: 'Sadece Gerekli',
          rejectAll: 'Tümünü Reddet'
        },
        modal: {
          title: 'Çerez Ayarları',
          description: 'Aşağıdaki çerez kategorilerini etkinleştirebilir veya devre dışı bırakabilirsiniz. Gerekli çerezler her zaman etkindir çünkü web sitesinin temel işlevleri için gereklidir.',
          savePreferences: 'Tercihleri Kaydet',
          acceptAll: 'Tümünü Kabul Et',
          rejectAll: 'Tümünü Reddet',
          required: 'Gerekli'
        }
      },
      en: {
        cookieTypes: {
          necessary: {
            name: 'necessary',
            title: 'Necessary Cookies',
            description: 'These cookies are essential for the basic functions of the website and are used for security, session management, and basic site functionality.',
            required: true
          },
          analytics: {
            name: 'analytics',
            title: 'Analytics Cookies',
            description: 'These cookies help us analyze site usage, measure performance, and improve user experience.',
            required: false
          },
          marketing: {
            name: 'marketing',
            title: 'Marketing Cookies',
            description: 'These cookies help us provide you with personalized ads and content.',
            required: false
          },
          preferences: {
            name: 'preferences',
            title: 'Preference Cookies',
            description: 'These cookies remember your language preferences, theme choices, and other personalization settings.',
            required: false
          }
        },
        banner: {
          title: 'Cookie Usage',
          description: 'At Kuzamo, we use cookies to enhance your experience on our website.',
          privacyLink: 'Privacy Policy',
          moreInfoHTML: ' See details in our <a href="/privacy.html" class="text-brand-600 dark:text-brand-400 hover:underline">Privacy Policy</a>.',
          settingsBtn: 'Cookie Settings',
          policyLink: 'Cookie Policy',
          acceptAll: 'Accept All',
          acceptNecessary: 'Necessary Only',
          rejectAll: 'Reject All'
        },
        modal: {
          title: 'Cookie Settings',
          description: 'You can enable or disable the following cookie categories. Necessary cookies are always enabled as they are required for the basic functions of the website.',
          savePreferences: 'Save Preferences',
          acceptAll: 'Accept All',
          rejectAll: 'Reject All',
          required: 'Required'
        }
      }
    };
    
    this.cookieTypes = this.translations[this.currentLanguage].cookieTypes;
    this.consentVersion = '1.1';
    this.init();
  }
  
  detectLanguage() {
    // Check localStorage first, then browser language, default to Turkish
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
      return savedLang;
    }
    
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.includes('en') ? 'en' : 'tr';
  }
  
  setLanguage(lang) {
    if (lang === 'tr' || lang === 'en') {
      this.currentLanguage = lang;
      this.cookieTypes = this.translations[lang].cookieTypes;
      
      // Update existing banner if it exists
      const existingBanner = document.getElementById('cookie-consent-banner');
      if (existingBanner) {
        this.updateBannerLanguage();
      }
      
      // Update existing modal if it exists
      const existingModal = document.getElementById('cookie-settings-modal');
      if (existingModal) {
        this.updateModalLanguage();
      }
      
      // Update floating widget
      this.updateFloatingWidgetLanguage();
    }
  }
  
  init() {
    // Check if consent banner should be shown
    if (!this.hasConsent()) {
      this.showBanner();
    }
    
    // Load saved preferences
    this.loadPreferences();
    
    // Apply preferences
    this.applyPreferences();
    
    // Listen for language changes
    this.listenForLanguageChanges();
    
    // Create floating cookie settings widget
    this.createFloatingWidget();
  }
  
  createFloatingWidget() {
    // Remove existing widget if any
    const existingWidget = document.getElementById('cookie-floating-widget');
    if (existingWidget) {
      existingWidget.remove();
    }
    
    const widget = document.createElement('div');
    widget.id = 'cookie-floating-widget';
    widget.className = 'fixed bottom-4 right-4 z-40';
    
    const t = this.translations[this.currentLanguage].banner;
    
    widget.innerHTML = `
      <button 
        id="cookie-floating-settings" 
        class="group bg-brand-600 hover:bg-brand-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        title="${t.settingsBtn}"
        aria-label="${t.settingsBtn}"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </button>
    `;
    
    document.body.appendChild(widget);
    
    // Add event listener
    widget.querySelector('#cookie-floating-settings').addEventListener('click', () => {
      this.showSettingsModal();
    });
  }
  
  updateFloatingWidgetLanguage() {
    const widget = document.getElementById('cookie-floating-widget');
    if (!widget) return;
    
    const t = this.translations[this.currentLanguage].banner;
    const button = widget.querySelector('#cookie-floating-settings');
    
    if (button) {
      button.title = t.settingsBtn;
      button.setAttribute('aria-label', t.settingsBtn);
    }
  }
  
  listenForLanguageChanges() {
    // Listen for custom language change events
    document.addEventListener('languageChanged', (e) => {
      if (e.detail && e.detail.language) {
        this.setLanguage(e.detail.language);
      }
    });
    
    // Also check for language toggle button clicks
    document.addEventListener('click', (e) => {
      if (e.target.id === 'langToggle') {
        // Wait a bit for the language to change, then update
        setTimeout(() => {
          const newLang = e.target.textContent.toLowerCase();
          if (newLang === 'tr' || newLang === 'en') {
            this.setLanguage(newLang);
          }
        }, 100);
      }
    });
  }
  
  hasConsent() {
    return localStorage.getItem('cookie-consent') !== null;
  }
  
  showBanner() {
    // Remove existing banner if any
    const existingBanner = document.getElementById('cookie-consent-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    // Compact widget card bottom-right
    banner.className = 'fixed bottom-4 right-4 z-50 max-w-sm w-[92vw] sm:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden transform translate-y-6 opacity-0 transition-all duration-300';
    
    const t = this.translations[this.currentLanguage].banner;
    const moreInfoText = this.translations[this.currentLanguage].banner.moreInfoHTML || '';

    banner.innerHTML = `
      <div class="p-4">
        <div class="flex items-start gap-3">
          <div class="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">⚙️</div>
          <div class="flex-1">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">${(t.title || '').trim()}</h3>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-300">${t.description}${moreInfoText}</p>
            <div class="mt-2 flex flex-wrap gap-3 items-center">
              <button id="cookie-settings-btn" class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
                ${t.settingsBtn}
              </button>
              <a href="/cookie-policy.html" class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
                ${t.policyLink}
              </a>
            </div>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2">
          <button id="cookie-accept-all" class="px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-xs font-medium">
            ${t.acceptAll}
          </button>
          <button id="cookie-accept-necessary" class="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs font-medium">
            ${t.acceptNecessary}
          </button>
          <button id="cookie-reject-all" class="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs font-medium">
            ${t.rejectAll}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Animate in
    requestAnimationFrame(() => {
      banner.classList.remove('translate-y-6');
      banner.classList.remove('opacity-0');
      banner.classList.add('opacity-100');
    });
    
    // Add event listeners
    this.addBannerEventListeners(banner);
  }
  
  updateBannerLanguage() {
    const banner = document.getElementById('cookie-consent-banner');
    if (!banner) return;
    
    const t = this.translations[this.currentLanguage].banner;
    
    // Update banner content
    const title = banner.querySelector('h3');
    if (title) title.textContent = t.title;
    
    const description = banner.querySelector('p');
    if (description) {
      const moreInfoText = this.translations[this.currentLanguage].banner.moreInfoHTML || '';
      description.innerHTML = `${t.description}${moreInfoText}`;
    }
    
    const settingsBtn = banner.querySelector('#cookie-settings-btn');
    if (settingsBtn) settingsBtn.textContent = t.settingsBtn;
    
    const policyLink = banner.querySelector('a[href="/cookie-policy.html"]');
    if (policyLink) policyLink.textContent = t.policyLink;
    
    const acceptAllBtn = banner.querySelector('#cookie-accept-all');
    if (acceptAllBtn) acceptAllBtn.textContent = t.acceptAll;
    
    const acceptNecessaryBtn = banner.querySelector('#cookie-accept-necessary');
    if (acceptNecessaryBtn) acceptNecessaryBtn.textContent = t.acceptNecessary;
    const rejectAllBtn = banner.querySelector('#cookie-reject-all');
    if (rejectAllBtn) rejectAllBtn.textContent = t.rejectAll;
  }
  
  showSettingsModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('cookie-settings-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'cookie-settings-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto';
    
    const t = this.translations[this.currentLanguage].modal;
    
    let settingsHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${t.title}
          </h2>
          <button id="close-cookie-settings" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          ${t.description}
        </p>
        
        <div class="space-y-4 mb-6">
    `;
    
    // Add cookie type toggles
    Object.values(this.cookieTypes).forEach(type => {
      const isDisabled = type.required;
      const isChecked = this.cookiePreferences[type.name];
      
      settingsHTML += `
        <div class="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <input 
                type="checkbox" 
                id="cookie-${type.name}" 
                name="cookie-${type.name}" 
                ${isChecked ? 'checked' : ''} 
                ${isDisabled ? 'disabled' : ''}
                class="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              />
              <label for="cookie-${type.name}" class="text-sm font-medium text-gray-900 dark:text-gray-100">
                ${type.title}
                ${type.required ? '<span class="text-red-500 ml-1">*</span>' : ''}
              </label>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 ml-7">
              ${type.description}
            </p>
          </div>
        </div>
      `;
    });
    
    settingsHTML += `
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button id="save-cookie-preferences" class="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium">
            ${t.savePreferences}
          </button>
          <button id="accept-all-cookies" class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
            ${t.acceptAll}
          </button>
          <button id="reject-all-cookies" class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
            ${t.rejectAll}
          </button>
        </div>
      </div>
    `;
    
    modalContent.innerHTML = settingsHTML;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners
    this.addModalEventListeners(modal);
  }
  
  updateModalLanguage() {
    const modal = document.getElementById('cookie-settings-modal');
    if (!modal) return;
    
    const t = this.translations[this.currentLanguage].modal;
    
    // Update modal content
    const title = modal.querySelector('h2');
    if (title) title.textContent = t.title;
    
    const description = modal.querySelector('p');
    if (description) description.textContent = t.description;
    
    const saveBtn = modal.querySelector('#save-cookie-preferences');
    if (saveBtn) saveBtn.textContent = t.savePreferences;
    
    const acceptAllBtn = modal.querySelector('#accept-all-cookies');
    if (acceptAllBtn) acceptAllBtn.textContent = t.acceptAll;
    const rejectAllBtn = modal.querySelector('#reject-all-cookies');
    if (rejectAllBtn) rejectAllBtn.textContent = t.rejectAll;
    
    // Update cookie type descriptions
    Object.values(this.cookieTypes).forEach(type => {
      const label = modal.querySelector(`label[for="cookie-${type.name}"]`);
      if (label) {
        label.innerHTML = `${type.title}${type.required ? '<span class="text-red-500 ml-1">*</span>' : ''}`;
      }
      
      const description = modal.querySelector(`#cookie-${type.name}`).closest('div').querySelector('p');
      if (description) description.textContent = type.description;
    });
  }
  
  addBannerEventListeners(banner) {
    // Accept all cookies
    banner.querySelector('#cookie-accept-all').addEventListener('click', () => {
      this.acceptAll();
    });
    
    // Accept only necessary cookies
    banner.querySelector('#cookie-accept-necessary').addEventListener('click', () => {
      this.acceptNecessary();
    });
    
    // Open settings modal
    banner.querySelector('#cookie-settings-btn').addEventListener('click', () => {
      this.showSettingsModal();
    });
    
    // Reject all cookies
    const rejectBtn = banner.querySelector('#cookie-reject-all');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        this.rejectAll();
      });
    }
  }
  
  addModalEventListeners(modal) {
    // Close modal
    modal.querySelector('#close-cookie-settings').addEventListener('click', () => {
      modal.remove();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Save preferences
    modal.querySelector('#save-cookie-preferences').addEventListener('click', () => {
      this.savePreferencesFromModal(modal);
      modal.remove();
    });
    
    // Accept all from modal
    modal.querySelector('#accept-all-cookies').addEventListener('click', () => {
      this.acceptAll();
      modal.remove();
    });
    // Reject all from modal
    const rejectAll = modal.querySelector('#reject-all-cookies');
    if (rejectAll) {
      rejectAll.addEventListener('click', () => {
        this.rejectAll();
        modal.remove();
      });
    }
    
    // Handle checkbox changes
    Object.keys(this.cookieTypes).forEach(typeName => {
      const checkbox = modal.querySelector(`#cookie-${typeName}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          if (!this.cookieTypes[typeName].required) {
            this.cookiePreferences[typeName] = e.target.checked;
          }
        });
      }
    });
  }
  
  savePreferencesFromModal(modal) {
    Object.keys(this.cookieTypes).forEach(typeName => {
      const checkbox = modal.querySelector(`#cookie-${typeName}`);
      if (checkbox && !this.cookieTypes[typeName].required) {
        this.cookiePreferences[typeName] = checkbox.checked;
      }
    });
    
    this.savePreferences();
    this.applyPreferences();
  }
  
  acceptAll() {
    Object.keys(this.cookiePreferences).forEach(key => {
      this.cookiePreferences[key] = true;
    });
    
    this.savePreferences();
    this.applyPreferences();
    this.hideBanner();
  }
  
  acceptNecessary() {
    Object.keys(this.cookiePreferences).forEach(key => {
      this.cookiePreferences[key] = this.cookieTypes[key].required;
    });
    
    this.savePreferences();
    this.applyPreferences();
    this.hideBanner();
  }
  
  rejectAll() {
    Object.keys(this.cookiePreferences).forEach(key => {
      this.cookiePreferences[key] = this.cookieTypes[key].required ? true : false;
    });
    this.savePreferences();
    this.applyPreferences();
    this.hideBanner();
  }
  
  savePreferences() {
    const record = {
      preferences: this.cookiePreferences,
      timestamp: new Date().toISOString(),
      version: this.consentVersion
    };
    localStorage.setItem('cookie-consent', JSON.stringify(record));
    try {
      fetch('/api/consent-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: this.cookiePreferences,
          version: this.consentVersion,
          gpc: !!(navigator && navigator.globalPrivacyControl),
          lang: this.currentLanguage
        })
      }).catch(() => {});
    } catch {}
  }
  
  loadPreferences() {
    const saved = localStorage.getItem('cookie-consent');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.preferences) {
          this.cookiePreferences = { ...this.cookiePreferences, ...data.preferences };
        }
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }
  
  applyPreferences() {
    // Apply analytics preferences
    if (this.cookiePreferences.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // Apply marketing preferences
    if (this.cookiePreferences.marketing) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }
    
    // Apply preference cookies
    if (this.cookiePreferences.preferences) {
      this.enablePreferences();
    } else {
      this.disablePreferences();
    }
  }
  
  enableAnalytics() {
    // Enable Google Analytics or other analytics tools
    if (typeof gtag === 'undefined' && !document.getElementById('ga-script')) {
      const mid = window.GA_MEASUREMENT_ID || '';
      if (mid) {
        const s = document.createElement('script');
        s.id = 'ga-script';
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(mid)}`;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag(){ window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', mid);
      }
    } else if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', { 'analytics_storage': 'granted' });
    }
    
    // Enable other analytics cookies
    this.setCookie('analytics_enabled', 'true', 365);
  }
  
  disableAnalytics() {
    // Disable analytics
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    
    // Remove analytics cookies
    this.removeCookie('analytics_enabled');
  }
  
  enableMarketing() {
    // Enable marketing cookies
    this.setCookie('marketing_enabled', 'true', 365);
  }
  
  disableMarketing() {
    // Remove marketing cookies
    this.removeCookie('marketing_enabled');
  }
  
  enablePreferences() {
    // Enable preference cookies
    this.setCookie('preferences_enabled', 'true', 365);
  }
  
  disablePreferences() {
    // Remove preference cookies
    this.removeCookie('preferences_enabled');
  }
  
  hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.add('translate-y-full');
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }
  
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const isSecure = (location.protocol === 'https:');
    const secureAttr = isSecure ? ';Secure' : '';
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureAttr}`;
  }
  
  removeCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
  
  applyGpcIfPresent() {
    try {
      if (navigator && navigator.globalPrivacyControl) {
        this.cookiePreferences.analytics = false;
        this.cookiePreferences.marketing = false;
        this.savePreferences();
        this.applyPreferences();
      }
    } catch {}
  }
  
  optOutSaleShare() {
    this.cookiePreferences.analytics = false;
    this.cookiePreferences.marketing = false;
    this.savePreferences();
    this.applyPreferences();
  }
  
  // Public method to check if specific cookie type is allowed
  isAllowed(type) {
    return this.cookiePreferences[type] || false;
  }
  
  // Public method to show banner again (for testing or policy updates)
  showBannerAgain() {
    localStorage.removeItem('cookie-consent');
    this.showBanner();
  }
  
  // Public method to get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  // Public method to refresh the widget (useful after language changes)
  refreshWidget() {
    this.createFloatingWidget();
  }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cookieConsent = new CookieConsent();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieConsent;
}
