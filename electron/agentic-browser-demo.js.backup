/**
 * Agentic Browser Demo - showcases AI controlling the embedded browser
 */

(function() {
'use strict';

class AgenticBrowserDemo {
  constructor() {
    this.running = false;
    this.overlay = null;
    this.steps = [];
    this.currentStep = 0;
    this.demoDelay = 1200;
    this.youtubeQuery = 'BigDaddyG IDE walkthrough';
    this.autoStartTimer = null;
    console.log('[BrowserDemo] ✅ Agentic browser demo ready');
  }

  async start() {
    if (this.running) {
      console.log('[BrowserDemo] ⚠️ Demo already running');
      return;
    }
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
      this.autoStartTimer = null;
    }
    
    // Close floating chat if open
    if (window.floatingChat) {
      window.floatingChat.ensureClosed();
    }
    
    this.running = true;
    this.currentStep = 0;
    this.createOverlay();
    this.registerSteps();

    try {
      for (const step of this.steps) {
        this.updateOverlay(step.title, step.description);
        console.log(`[BrowserDemo] 🎯 ${step.title}`);
        await step.action();
        await this.delay(step.wait ?? this.demoDelay);
        this.currentStep += 1;
      }
      this.finishOverlay('✅ Agentic browser demo complete!');
    } catch (error) {
      console.error('[BrowserDemo] ❌ Demo failed:', error);
      this.finishOverlay('❌ Browser demo failed, check console');
    } finally {
      this.running = false;
      setTimeout(() => this.destroyOverlay(), 4000);
    }
  }

  registerSteps() {
    this.steps = [
      {
        title: 'Step 1 • Opening Browser Panel',
        description: 'AI toggles the built-in browser and prepares media controls.',
        action: async () => {
          if (window.browserPanel) {
            window.browserPanel.show();
          } else if (window.webBrowser) {
            window.webBrowser.openBrowser();
          } else if (window.electron?.browser?.show) {
            await window.electron.browser.show();
          }
          this.highlight('#browser-panel');
        }
      },
      {
        title: 'Step 2 • Navigating to YouTube',
        description: 'AI navigates directly to youtube.com using native bridge.',
        action: async () => {
          if (window.browserPanel?.navigate) {
            window.browserPanel.navigate('youtube.com');
          } else if (window.electron?.browser?.openYouTube) {
            await window.electron.browser.openYouTube();
          }
        }
      },
      {
        title: 'Step 3 • Searching for a Topic',
        description: `AI searches YouTube for “${this.youtubeQuery}”.`,
        action: async () => {
          if (window.browserPanel?.navigate) {
            const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(this.youtubeQuery)}`;
            window.browserPanel.navigate(url);
          } else if (window.electron?.browser?.searchYouTube) {
            await window.electron.browser.searchYouTube(this.youtubeQuery);
          }
        }
      },
      {
        title: 'Step 4 • Launching the First Result',
        description: 'AI clicks the first available result and starts playback.',
        wait: 1800,
        action: async () => {
          if (window.browserPanel?.navigate) {
            await this.delay(400);
            this.executeInWebview(`
              (function() {
                const target = document.querySelector('ytd-video-renderer a#thumbnail, ytd-rich-item-renderer a#thumbnail, a#video-title');
                if (target) {
                  target.click();
                  return true;
                }
                return false;
              })();
            `);
          } else if (window.electron?.browser?.playYouTube) {
            await window.electron.browser.playYouTube();
          }
        }
      },
      {
        title: 'Step 5 • Enabling Picture-in-Picture',
        description: 'AI toggles PiP so the demo can float the video.',
        action: async () => {
          if (window.electron?.browser?.enterPictureInPicture) {
            await window.electron.browser.enterPictureInPicture();
          } else {
            this.executeInWebview(`
              (async function() {
                const video = document.querySelector('video');
                if (video && document.pictureInPictureEnabled) {
                  if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                  }
                  await video.requestPictureInPicture();
                }
              })();
            `);
          }
        }
      },
      {
        title: 'Step 6 • Media Control Overlay',
        description: 'AI shows how to pause/resume playback and highlight controls.',
        action: async () => {
          if (window.browserPanel?.togglePlayback) {
            await window.browserPanel.togglePlayback();
            await this.delay(800);
            await window.browserPanel.togglePlayback();
          } else if (window.electron?.browser?.togglePlayback) {
            await window.electron.browser.togglePlayback();
            await this.delay(800);
            await window.electron.browser.togglePlayback();
          }
          this.highlight('.browser-toolbar', 2000);
        }
      },
      {
        title: 'Step 7 • Marketplace Expansion',
        description: 'AI opens the plugin marketplace to showcase the new expansion tooling.',
        wait: 2200,
        action: async () => {
          const marketplace = window.pluginMarketplace;
          if (!marketplace?.open) {
            console.warn('[BrowserDemo] Plugin marketplace not available');
            return;
          }

          const wasOpen = marketplace.isOpen;
          if (!wasOpen) {
            marketplace.open();
            await this.delay(600);
          }

          this.highlight('#plugin-marketplace-panel', 2200);
          this.showCallout('#plugin-marketplace-panel', 'Marketplace expansion: curated catalog, API keys, Ollama models.');

          try {
            if (typeof marketplace.showApiKeyManager === 'function') {
              await marketplace.showApiKeyManager();
              await this.delay(400);
              const overlayBody = document.getElementById('plugin-marketplace-overlay-body');
              if (overlayBody) {
                this.showCallout(overlayBody, 'Manage provider API keys right inside the IDE.', 2000);
              }
              await this.delay(800);
              marketplace.closeOverlay?.();
            }
          } catch (error) {
            console.warn('[BrowserDemo] Unable to show API key manager:', error);
          }

          try {
            if (typeof marketplace.showOllamaManager === 'function') {
              await this.delay(200);
              await marketplace.showOllamaManager();
              await this.delay(400);
              const overlayBody = document.getElementById('plugin-marketplace-overlay-body');
              if (overlayBody) {
                this.showCallout(overlayBody, 'One-click Ollama model pulls & details.', 2000);
              }
              await this.delay(800);
              marketplace.closeOverlay?.();
            }
          } catch (error) {
            console.warn('[BrowserDemo] Unable to show Ollama manager:', error);
          }

          if (!wasOpen && typeof marketplace.close === 'function') {
            marketplace.close();
          }
        }
      }
    ];
  }

  async executeInWebview(script) {
    try {
      const activeTab = window.browserPanel?.tabs?.find(tab => tab.id === window.browserPanel.activeTabId);
      if (activeTab?.webview?.executeJavaScript) {
        return await activeTab.webview.executeJavaScript(script);
      }
    } catch (error) {
      console.warn('[BrowserDemo] Script execution failed:', error);
    }
    return null;
  }

  highlight(selector, duration = 1500) {
    const element = document.querySelector(selector);
    if (!element) return;

    const originalStyle = element.style.boxShadow;
    element.style.boxShadow = '0 0 40px rgba(0, 212, 255, 0.8)';
    element.style.transition = 'box-shadow 0.3s ease-in-out';

    setTimeout(() => {
      element.style.boxShadow = originalStyle || '';
    }, duration);
  }

  showCallout(target, message, duration = 2200) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const top = Math.max(20, rect.top - 70);
    const left = Math.min(
      window.innerWidth - 320,
      Math.max(20, rect.left + rect.width / 2 - 140)
    );

    const callout = document.createElement('div');
    callout.className = 'agentic-browser-demo-callout';
    callout.style.cssText = `
      position: fixed;
      top: ${top}px;
      left: ${left}px;
      max-width: 300px;
      padding: 12px 16px;
      background: rgba(0, 212, 255, 0.95);
      color: #05111e;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      z-index: 20080;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
      pointer-events: none;
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    callout.textContent = message;
    document.body.appendChild(callout);

    requestAnimationFrame(() => {
      callout.style.opacity = '1';
      callout.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      callout.style.opacity = '0';
      callout.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (callout.parentNode) {
          callout.remove();
        }
      }, 300);
    }, duration);
  }

  createOverlay() {
    this.destroyOverlay();
    const container = document.createElement('div');
    container.id = 'agentic-browser-demo-overlay';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 320px;
      padding: 18px 20px;
      background: rgba(10, 20, 40, 0.9);
      border: 1px solid rgba(0, 212, 255, 0.4);
      border-radius: 12px;
      color: white;
      font-family: 'Segoe UI', sans-serif;
      z-index: 20060;
      box-shadow: 0 16px 30px rgba(0, 0, 0, 0.35);
    `;
    container.innerHTML = `
      <div style="font-size: 14px; font-weight: 600; color: #00d4ff; margin-bottom: 6px;">🤖 Agentic Browser Demo</div>
      <div id="agentic-browser-demo-step" style="font-size: 13px; font-weight: 600; line-height: 1.4;">Preparing browser showcase...</div>
      <div id="agentic-browser-demo-desc" style="font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 8px; line-height: 1.5;"></div>
    `;
    document.body.appendChild(container);
    this.overlay = container;
  }

  updateOverlay(step, desc) {
    const stepEl = document.getElementById('agentic-browser-demo-step');
    const descEl = document.getElementById('agentic-browser-demo-desc');
    if (stepEl) stepEl.textContent = step;
    if (descEl) descEl.textContent = desc;
  }

  finishOverlay(message) {
    const stepEl = document.getElementById('agentic-browser-demo-step');
    const descEl = document.getElementById('agentic-browser-demo-desc');
    if (stepEl) stepEl.textContent = message;
    if (descEl) descEl.textContent = 'Demo wrap up complete.';
  }

  destroyOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const agenticBrowserDemoInstance = new AgenticBrowserDemo();
window.agenticBrowserDemo = agenticBrowserDemoInstance;

// Auto-start DISABLED - use agenticBrowserDemo.start() to run manually
// const scheduleBrowserAutoStart = (delay = 20000) => {
//   if (agenticBrowserDemoInstance.autoStartTimer) {
//     clearTimeout(agenticBrowserDemoInstance.autoStartTimer);
//     agenticBrowserDemoInstance.autoStartTimer = null;
//   }

//   agenticBrowserDemoInstance.autoStartTimer = setTimeout(function maybeStartBrowserDemo() {
//     agenticBrowserDemoInstance.autoStartTimer = null;

//     const fullDemo = window.fullAgenticDemo;
//     if (fullDemo?.isRunning) {
//       console.log('[BrowserDemo] ⏳ Full agentic demo running, deferring browser auto-start');
//       scheduleBrowserAutoStart(5000);
//       return;
//     }

//     console.log('[BrowserDemo] 🚀 Auto-starting agentic browser demo');
//     agenticBrowserDemoInstance.start().catch(err => {
//       console.error('[BrowserDemo] Demo crashed:', err);
//     });
//   }, delay);
// };

// scheduleBrowserAutoStart();
console.log('[BrowserDemo] 🚦 Auto-start disabled. Use agenticBrowserDemo.start() to run demo manually.');

})();

