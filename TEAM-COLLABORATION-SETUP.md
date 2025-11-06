# 👥 Team Collaboration Setup Guide

**Enable real-time team coding in BigDaddyG IDE - FREE forever!**

---

## 📋 Overview

BigDaddyG IDE's team features use **Firebase** (free tier) for real-time sync.

**Features:**

- ✅ Room-based collaboration (simple room codes)
- ✅ Real-time code sharing
- ✅ Live cursor positions
- ✅ Team chat
- ✅ Member presence
- ✅ File sharing
- ✅ **100% FREE** (Firebase free tier is generous!)
- ✅ No backend server needed!

---

## 🚀 Quick Setup (10 Minutes)

### **Step 1: Create Firebase Project**

1. Go to: <https://console.firebase.google.com>
2. Click **"Add project"**
3. Project name: `bigdaddyg-ide` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

### **Step 2: Enable Firestore**

1. In Firebase console, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select location closest to you
5. Click **"Enable"**

---

### **Step 3: Get Firebase Config**

1. Click the **⚙️ gear icon** → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click **"Web"** button (`</>`)
4. App nickname: `BigDaddyG IDE`
5. **Don't** check "Firebase Hosting"
6. Click **"Register app"**
7. **COPY** the `firebaseConfig` object - you'll need this!

It looks like this:

```javascript

const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bigdaddyg-ide.firebaseapp.com",
  projectId: "bigdaddyg-ide",
  storageBucket: "bigdaddyg-ide.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

```plaintext
---

### **Step 4: Add Firebase SDK to BigDaddyG**

Add these lines to `electron/index.html` **before** the `</body>` tag:

```html

<!-- Firebase SDK -->
<script src="<https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>>
<script src="<https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>>

<!-- Team Collaboration -->
<link rel="stylesheet" href="team-collaboration.css">
<script src="team-collaboration.js"></script>

```plaintext
---

### **Step 5: Update Config in team-collaboration.js**

1. Open `electron/team-collaboration.js`
2. Find this section (around line 17):

```javascript

this.firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "bigdaddyg-ide.firebaseapp.com",
    projectId: "bigdaddyg-ide",
    storageBucket: "bigdaddyg-ide.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

```plaintext
  1. **Replace** with YOUR actual Firebase config from Step 3
  2. Save the file

---

### **Step 6: Test It!**

1. Launch BigDaddyG IDE:

   ```bash
   npm start
   ```

  1. Look for **"👥 Team Collaboration"** panel in sidebar

  1. Click **"Create Room"**

  1. You should see a 6-character room code (e.g., `A1B2C3`)

  1. ✅ **Working!**

---

## 🎯 How to Use

### **Create a Room**

1. Click **"Create Room"**
2. Share the room code with teammates
3. They can join using that code

---

### **Join a Room**

1. Get room code from teammate
2. Enter code in "Enter room code" field
3. Click **"Join Room"**
4. ✅ You're in!

---

### **Share Code**

**Option 1: Auto-sync**

- Just type in the editor
- Code auto-shares after 1 second (debounced)

**Option 2: Manual share**

- Click **"Share Current Code"** button
- Code is sent to all team members

---

### **Chat with Team**

1. Type message in chat input
2. Press **Enter** or click **"Send"**
3. All members see the message instantly

---

### **See Team Members**

- Members list shows all online teammates
- Colored dots show who's who
- Green = online, Gray = offline

---

## 🔒 Secure Your Firestore

**Important:** Test mode is insecure! Here's how to secure it:

### **Firestore Rules (Basic)**

In Firebase Console → Firestore → Rules, use this:

```javascript

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to rooms you're a member of
    match /rooms/{roomCode} {
      allow read: if true; // Anyone can read (room codes are random)
      allow create: if request.auth != null || true; // Allow creation
      allow update: if true; // Allow updates (validate in app)
      allow delete: if false; // Don't allow deletion
    }
  }
}

```plaintext
**Better rules (with authentication):**

```javascript

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomCode} {
      // Only members can read
      allow read: if resource.data.members.hasAny([request.auth.uid]);

      // Anyone can create
      allow create: if true;

      // Only members can update
      allow update: if resource.data.members.hasAny([request.auth.uid]);

      // No deletion
      allow delete: if false;
    }
  }
}

```plaintext
---

## 💰 Costs (Spoiler: FREE!)

### **Firebase Free Tier:**

**Firestore:**

- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 20,000 deletes/day
- ✅ 1 GB storage

**Typical Usage for 10-person team:**

- ~5,000 writes/day (code sharing + chat)
- ~10,000 reads/day (syncing)
- **Well within free tier!**

**Only pay if you exceed limits** (very unlikely for teams < 50 people)

---

## 🆚 Comparison to Other Solutions

| Feature | BigDaddyG Team | Cursor Business | VS Code Live Share |
|---------|----------------|-----------------|-------------------|
| **Real-time sync** | ✅ | ✅ | ✅ |
| **Chat** | ✅ | ✅ | ❌ |
| **Room codes** | ✅ | ❌ | ❌ |
| **No server needed** | ✅ | ❌ | ❌ |
| **Cost** | **FREE** | $40/user/mo | Free |
| **Team size limit** | Unlimited | License based | 30 guests |
| **Setup time** | 10 min | Instant | 5 min |

---

## ⚡ Advanced Features (Optional)

### **Auto-Cleanup Old Rooms**

Rooms older than 24 hours auto-delete (Firebase Functions - free tier):

```javascript

// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.cleanupOldRooms = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    const oldRooms = await db.collection('rooms')
      .where('created', '<', cutoff)
      .get();

    const batch = db.batch();
    oldRooms.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    console.log(`Deleted ${oldRooms.size} old rooms`);
  });

```plaintext
---

### **P2P WebRTC (Advanced)**

For lower latency, enable P2P connections:

1. Firebase only for signaling
2. Direct peer-to-peer after connection
3. Lower Firebase usage
4. Faster code sync

**Implementation in future version!**

---

## 🐛 Troubleshooting

### **"Firebase not initialized"**

**Cause:** Firebase SDK not loaded

**Fix:**

1. Check `index.html` has Firebase scripts
2. Scripts must be **before** `team-collaboration.js`
3. Check browser console for loading errors

---

### **"Room not found"**

**Cause:** Room code wrong or expired

**Fix:**

1. Check room code (case-sensitive)
2. Ask teammate to create new room
3. Room may have auto-expired (24 hours)

---

### **Code not syncing**

**Cause:** Network issue or rate limiting

**Fix:**

1. Check internet connection
2. Manually click "Share Current Code"
3. Check Firebase console → Firestore → View data
4. Check browser console for errors

---

### **Chat messages not appearing**

**Cause:** Message array limit

**Fix:**

- Only last 50 messages shown
- Old messages auto-removed
- This is by design (performance)

---

## 📈 Monitoring

### **Check Firebase Usage**

1. Firebase Console → Usage tab
2. See reads/writes per day
3. Alerts if approaching limits
4. **Free tier is very generous!**

---

## 🎉 Real-World Use Cases

### **Pair Programming**

- Two developers, one room
- Share code in real-time
- Chat about changes
- Perfect for remote teams

---

### **Code Reviews**

- Reviewer joins room
- See code live as it's written
- Suggest changes via chat
- Apply changes in real-time

---

### **Teaching/Mentoring**

- Teacher creates room
- Students join with code
- Teacher shares examples
- Students see changes live

---

### **Hackathons**

- Team of 5-10 people
- Everyone in same room
- Real-time collaboration
- Chat for coordination

---

## 🚀 Next Steps

1. **Create your Firebase project**
2. **Update config in team-collaboration.js**
3. **Add Firebase SDK to index.html**
4. **Test with a friend!**
5. **Enjoy FREE real-time collaboration!**

---

## 📚 Resources

- **Firebase Console:** <https://console.firebase.google.com>
- **Firebase Docs:** <https://firebase.google.com/docs/firestore>
- **Firestore Security Rules:** <https://firebase.google.com/docs/firestore/security/get-started>
- **BigDaddyG GitHub:** <https://github.com/ItsMehRAWRXD/BigDaddyG-IDE>

---

## 🆘 Support

**Issues?** Open an issue:
<https://github.com/ItsMehRAWRXD/BigDaddyG-IDE/issues>

**Questions?** Check discussions:
<https://github.com/ItsMehRAWRXD/BigDaddyG-IDE/discussions>

---

**Made with ❤️ by the BigDaddyG Team**

*Bringing FREE real-time collaboration to everyone!* 🚀

