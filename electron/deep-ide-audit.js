/**
 * Deep IDE Audit - Shows REAL vs MISSING features
 * NO FAKES, NO PLACEHOLDERS, JUST TRUTH
 */

window.runDeepIDEAudit = () => {
  console.group("🔍 BigDaddyG IDE Deep Audit");

  const results = [];
  const check = (label, pass) => results.push({ label, pass });

  // --- Core system presence ---
  check("Tab system loaded", typeof window.tabSystem !== "undefined" || typeof window.completeTabSystem !== "undefined");
  check("File system integration", typeof window.fileSystem !== "undefined");
  check("Agentic executor", typeof window.agenticExecutor !== "undefined");
  check("Orchestra bridge", typeof window.Orchestra !== "undefined");
  check("Notification system", typeof window.notify !== "undefined");
  check("Renderer fully loaded", document.readyState === "complete");

  // --- UI layer ---
  check("Main container element", !!document.querySelector("#main-container, .main-container"));
  check("Tab bar element", !!document.querySelector("#master-tab-bar, .tab-bar"));
  check("Tab content area", !!document.querySelector("#master-tab-content, .tab-content"));
  check("AI Chat tab creator", typeof window.completeTabSystem?.createAIChatTab === "function");
  check("Image Generator tab creator", typeof window.completeTabSystem?.createImageGenTab === "function");
  check("Editor container", !!document.querySelector("#monaco-container, .editor-container, textarea"));

  // --- Inputs and selectors ---
  const inputs = document.querySelectorAll("input[type='text'], textarea");
  check(`Input fields present (${inputs.length})`, inputs.length > 0);

  const selectors = document.querySelectorAll("select");
  check(`Dropdowns present (${selectors.length})`, selectors.length > 0);

  if (selectors.length) {
    selectors.forEach((sel, i) =>
      check(`Dropdown ${i + 1} has options (${sel.options?.length || 0})`, sel.options?.length > 0)
    );
  }

  // --- Extensions and services ---
  check("Marketplace client", typeof window.marketplaceClient !== "undefined");
  check("Extension manager", typeof window.extensionManager !== "undefined");
  check("Marketplace database", Array.isArray(window.MARKETPLACE_EXTENSIONS) && window.MARKETPLACE_EXTENSIONS.length > 0);
  check("Voice coding engine", typeof window.voiceCodingEngine !== "undefined");
  
  // --- Electron APIs ---
  check("Electron API bridge", typeof window.electron !== "undefined");
  check("File operations", typeof window.electron?.openFileDialog === "function");
  check("Folder operations", typeof window.electron?.openFolderDialog === "function");
  check("Read file", typeof window.electron?.readFile === "function");
  check("Write file", typeof window.electron?.writeFile === "function");

  // --- Keyboard shortcuts ---
  check("Keyboard shortcuts system", typeof window.keyboardShortcuts !== "undefined");
  check("Menu system", typeof window.menuSystem !== "undefined");

  // --- AI/Model system ---
  check("BigDaddyGCore initialized", typeof window.bigDaddyGCore !== "undefined");
  check("Native Ollama Client", typeof window.nativeOllamaClient !== "undefined");
  check("Model discovery", typeof window.electron?.invoke === "function");

  // --- Check what's actually callable ---
  const callableFeatures = {
    "Open file dialog": () => window.fileSystem?.openFileDialog || window.electron?.openFileDialog,
    "Save file": () => window.fileSystem?.saveCurrentFile,
    "Create new file": () => window.fileSystem?.createNewFile || window.completeTabSystem?.createEditorTab,
    "AI Chat": () => window.completeTabSystem?.createAIChatTab,
    "Agentic Coding": () => window.completeTabSystem?.createAgenticCodingTab,
    "Show notifications": () => window.notify?.success || window.notify?.error,
    "Execute command": () => window.executeCommand,
    "Open marketplace": () => window.completeTabSystem?.createMarketplaceTab
  };

  console.log("\n📋 Callable Features:");
  for (const [feature, getter] of Object.entries(callableFeatures)) {
    const fn = getter();
    const callable = typeof fn === "function";
    console.log(`${callable ? "✅" : "❌"} ${feature}:`, callable ? "Available" : "Missing");
    check(feature, callable);
  }

  // --- Output summary ---
  const passed = results.filter(r => r.pass);
  const failed = results.filter(r => !r.pass);

  console.log("\n📊 Full Results:");
  console.table(results);

  console.log(`\n✅ Passed: ${passed.length}/${results.length}`);
  console.log(`❌ Missing/Inaccessible: ${failed.length}/${results.length}`);
  console.log(`📈 Functional: ${((passed.length / results.length) * 100).toFixed(1)}%`);

  if (failed.length) {
    console.warn("\n⚠️ Components needing completion:");
    failed.forEach(f => console.warn(" - " + f.label));
  } else {
    console.log("\n🎉 ALL SYSTEMS OPERATIONAL!");
  }

  console.groupEnd();
  
  return { passed: passed.length, failed: failed.length, total: results.length, results };
};

console.log("[DeepAudit] ✅ Loaded - Run: window.runDeepIDEAudit()");
