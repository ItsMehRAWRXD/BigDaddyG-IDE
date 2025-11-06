# BigDaddyG IDE - Full Test Checklist

## 🔍 Tab System Tests (After ~3 seconds)

Look for console output: `========== TAB SYSTEM DIAGNOSTIC ==========`

**Expected Results:**
1. ✅ `window.tabSystem exists? true`
2. ✅ Chat Tab buttons found: 1 or more
3. ✅ `#ai-input` element: true
4. ✅ Tab content panels found: 0 or more
5. ✅ Monaco container: true

**Test Actions:**
- Click "💬 Open Chat Tab" button
- Click "📁 Open Explorer" button  
- Click "🐙 Open GitHub" button

**Expected:** Should open DIFFERENT tabs, not all "Welcome.md"

---

## 🎬 Visual Test (After ~8 seconds)

**Expected Behavior:**
1. Big overlay appears in center
2. Monaco bootstraps (creates welcome.js tab)
3. Creates new file "test.js"
4. Types code character-by-character
5. Toggles panels (explorer, chat) with colored glows
6. **GIANT ARROW** appears: "⬇️ TYPING HERE! ⬇️" (bouncing!)
7. Chat input glows cyan
8. Text appears in chat input
9. Terminal slides up/down
10. Full screen toggle
11. Final results: ALL PASS (green screen flash)

---

## 📊 Memory Leak Investigation

**Current Status:** 🚨 **97% MEMORY LEAK**
- Timeouts Created: 739
- Timeouts Cleared: 20 ❌
- **719 timers leaked!**

**Causes to Check:**
1. Visual test animations not cleaning up
2. Panel toggles creating timers
3. Event listeners piling up
4. Monaco editor not disposing properly

---

## 🎛️ Panel Manager Tests

**Test Each Panel:**
1. **View → Explorer** - Should toggle left sidebar
2. **View → Chat** - Should toggle right sidebar  
3. **View → Terminal** - Should slide up/down from bottom
4. **View → Full Screen** - Should hide ALL panels

**Expected:** Each should work INDEPENDENTLY

---

## 📝 Menu Bar Tests

**Verify Menus:**
- File | Edit | Selection | View | Go | Run | Terminal | Help
- All dropdowns open?
- Keyboard shortcuts work?

---

## ✅ Success Criteria

- [ ] Tab system diagnostic shows all green
- [ ] Can open Chat, Explorer, GitHub tabs
- [ ] Each tab shows DIFFERENT content (not all Welcome.md)
- [ ] Visual test completes with 8/8 PASS
- [ ] Chat input test shows bouncing arrow
- [ ] All panels toggle independently
- [ ] Memory leak reduced below 50%
- [ ] No JavaScript errors in console

---

## 🐛 Known Issues to Fix

1. **CRITICAL**: 97% memory leak - timers not being cleared
2. **HIGH**: All tabs show "Welcome.md" instead of proper content
3. **HIGH**: Chat input not visible during visual test
4. **MEDIUM**: Timer cleanup not working properly
5. **LOW**: Inline CSS warnings (86 warnings, not critical)

---

## 📋 Test Results

After IDE loads for 10 seconds, share console output with:
- `========== TAB SYSTEM DIAGNOSTIC ==========`
- `[VisualTest]` messages
- Any ERROR messages

Then test manually:
1. Click all 3 tab buttons in right sidebar
2. Use View menu to toggle panels
3. Check if chat works

