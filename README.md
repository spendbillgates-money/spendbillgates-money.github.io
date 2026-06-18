# Spend billgates money

An interactive, hyper-realistic, and fast-loading web-based simulator game that allows users to virtually spend the massive fortunes of the world's top billionaires, starting with **Bill Gates** as the default homepage, along with **Elon Musk**, **Jeff Bezos**, and **Mark Zuckerberg**.

Check out the running app locally at `http://localhost:3000/`.

---

## 🚀 Key Features

- **Pill-Capsule Navigation Header**: Seamless switching between billionaires directly from the header on any page.
- **45+ Simulation Items**: Loaded with normal and luxury items featuring high-quality stock images stored locally.
- **Hyper-Realistic Computerized thermal Receipt**:
  - Styled with classic monospace text and paper-rip boundaries.
  - Aligned prices using dynamic dot-leaders.
  - Fully computerized barcode and random checkout cashiers.
  - Interactive **Customer Signature Line** at the bottom with real-time bidirectional sync.
- **Dwell-Time & Engagement Upgrades**:
  - **News Ticker Marquee**: Parodic news ticker that shifts headlines based on your purchase history.
  - **Achievements Grid**: 8 unlockable badges with sound chimes and slide-in notifications.
  - **Wealth Recovery Stats**: Educational stats on how long it takes an average worker to afford your cart compared to the billionaire's recovery speed.
  - **Sound Synthesizer (SFX)**: Web Audio synthesizes audio effects (coin cha-ching, click, fanfare) with zero external network requests.
  - **Screenshot Generator**: Popup optimized to capture and share custom receipt slips.

---

## 🛠️ Technology Stack

- **Frontend Core**: Semantic HTML5 and Vanilla Javascript (ES6+).
- **Styling**: Modern CSS3 featuring grid layouts, flexboxes, responsive typography (`Outfit`, `Inter`, `Courier Prime`), glassmorphic panels, and custom dark mode colors.
- **Audio Logic**: Native HTML5 Web Audio API synthesizing sound effects programmatically.
- **Testing Server**: Simple Node.js static server (`server.js`).

---

## ⚙️ Installation & Running Locally

1. Clone or copy the project files to your directory.
2. Open a terminal in the project directory.
3. Run the development static server:
   ```bash
   node server.js
   ```
4. Open your web browser and navigate to:
   ```
   http://localhost:3000/
   ```

---

## 📂 Project Structure

```text
├── css/
│   └── style.css            # Responsive styles, dark mode, receipt layouts, ticker
├── images/
│   ├── avatar-*.jpg         # High-resolution official billionaire avatars
│   └── *.jpg                # Locally saved Unsplash stock images for items
├── js/
│   ├── items.js             # Categorized items list (45 luxury and normal assets)
│   └── app.js               # Audio synth, ticker logic, receipt engine, events
├── index.html               # Bill Gates Simulator (Home Page)
├── spend-elon-musk-money.html
├── spend-jeff-bezos-money.html
├── spend-mark-zuckerberg-money.html
├── server.js                # Lightweight local testing server
└── README.md                # Documentation and simulator overview
```

---

## 📝 Concept & Detailed Content: How it Works

The core philosophy of **Spend billgates money** is to visualize the mind-boggling scale of extreme wealth inequality through interactive design.

### 1. The Scale of $110 Billion
To put Bill Gates' estimated fortune of **$110 Billion USD** in perspective:
- If you spent **$1,000 every single hour**, it would take you over **12,500 years** to empty the wallet.
- Buying **10,000 Big Macs** every day would barely dent his daily interest earnings.
- He can buy an entire **NFL Sports Franchise ($4.5 Billion)** and not even feel a 5% drop in net worth.

### 2. Parodic Achievements Explained
To gamify spending, players unlock achievements as they shop:
- **Fast Food Lover**: Awarded when acquiring massive amounts of burgers, reminding players that billionaire wealth can feed entire cities.
- **Broke Billionaire**: Achieved when spending more than **99.9%** of the fortune, which triggers a congratulatory chime and cash register snapshot modal.

### 3. Middle-Class Labor Comparison
Every printed thermal receipt slip features a section comparing your total bill to average incomes:
- **Average Worker ($50K/year)**: Calculates the years of labor a middle-class citizen would have to work to afford your cart.
- **Billionaire Recovery Time**: Displays the time it takes the selected billionaire to earn back your spent total based on corporate dividends and investments. For Jeff Bezos, earning back $100 Million takes less than 13 hours.

---
*Disclaimer: This simulator is a parodic web application created for educational and entertainment purposes. Names, logos, and net worth values are used in a fictional/parodic context.*
