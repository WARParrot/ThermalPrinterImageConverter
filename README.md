# 🖨️ Thermalizer

**Thermalizer** is a client‑side image converter that transforms color photographs into crisp, 1‑bit black‑and‑white renders optimized for thermal printers. It uses advanced dithering algorithms and real‑time parameter controls to help you achieve the most attractive print possible—all inside your browser, with zero uploads.

## ✨ Features

- **🖼️ Drag‑and‑drop upload** – Supports PNG, JPG, WEBP, and more.
- **⚡ Real‑time preview** – See changes immediately as you adjust parameters.
- **🎛️ Multiple dithering algorithms**
  - Floyd‑Steinberg (classic error diffusion)
  - Atkinson (optimized for thermal printers)
  - Ordered (Bayer matrix, selectable 2×2, 4×4, 8×8)
  - Simple threshold
- **🌓 Brightness & contrast** – Fine‑tune the tonal range before dithering.
- **🔄 Invert colors** – Switch between black‑on‑white and white‑on‑black.
- **💾 Download as PNG** – Save the processed 1‑bit image locally.
- **🔒 100% client‑side** – No server, no tracking, your images never leave your machine.

## 🛠️ Tech Stack

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- HTML5 Canvas API for pixel manipulation
- Pure functional image processing

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/thermalizer.git
cd thermalizer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:5173 in your browser.

## 🚀 Usage
Upload an image – Click the upload area or drag an image onto it.

Adjust parameters – Choose a dithering algorithm, tweak brightness/contrast, and optionally invert colors.

Process – Click the Process button to generate the thermal‑ready preview.

Download – Save the final 1‑bit PNG to your computer.

## ⚙️ Customization
You can easily add new dithering algorithms or modify existing ones.

Add your function in src/utils/dithering.ts.

Update the Algorithm type in src/types/index.ts.

Add the new option to the dropdown in src/components/ControlsPanel.tsx.

Wire it up in the processImageData switch in src/utils/imageProcessing.ts.

## 📁 Project Structure
text
src/
├── components/       # React components (uploader, preview, controls)
├── types/            # TypeScript interfaces and types
├── utils/            # Image processing and dithering logic
├── App.tsx           # Main application component
├── App.css           # Main styles
├── index.tsx         # Entry point
└── index.css         # Global styles

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests for new features, bug fixes, or performance improvements.

## 📄 License
This project is licensed under the MIT License. See LICENSE for details.
