# Mikko Kärenlampi - Portfolio & Educational Demos

A comprehensive web project combining a personal portfolio with interactive educational demonstrations covering computer science and mathematical concepts.

## Project Overview

This project serves dual purposes:
1. **Personal Portfolio** - Professional showcase of education, experience, and contact information
2. **Educational Platform** - Interactive demos teaching fundamental concepts in computer science, mathematics, and algorithms

## Interactive Demos

### 🔢 Numerical Concepts (`numerical.html`)
An educational guide to digital fundamentals including:
- **Binary System**: Interactive bit manipulation and visualization
- **Number Base Conversion**: Convert between binary, decimal, and hexadecimal
- **Floating-Point Representation**: IEEE 754 format exploration
- **Bitwise Operations**: AND, OR, XOR, NOT operations with visual feedback
- **Two's Complement**: Signed integer representation
- **Endianness**: Big-endian vs little-endian byte ordering

### 🔀 Sorting Algorithms (`sorting.html`)
Visual algorithm demonstrations featuring:
- **Algorithm Implementations**: Quick Sort, Merge Sort, Insertion Sort, Bucket Sort
- **Real-time Visualization**: Animated bar charts showing step-by-step sorting process
- **Performance Comparison**: Visual comparison of algorithm efficiency
- **Interactive Controls**: Start, pause, and reset functionality
- **Educational Commentary**: Explanations of time complexity and use cases

### 📊 Basic Statistics (`stats.html`)
Interactive statistical analysis tools:
- **Descriptive Statistics**: Mean, median, mode, standard deviation calculators
- **Data Input**: Multiple ways to input datasets
- **Visual Analysis**: Canvas-based scatter plots and regression lines
- **Linear Regression**: Interactive best-fit line calculation
- **Real-time Updates**: Statistics update as you modify data points

### 🌀 Mandelbrot Fractal (`mandelbrot.html`)
Advanced mathematical visualization:
- **Interactive Fractal Explorer**: Click to zoom into the Mandelbrot set
- **Web Workers**: Multi-threaded rendering for smooth performance
- **Dynamic Color Palettes**: Randomizable color schemes
- **Quality Settings**: Adjustable rendering quality (fast, medium, high)
- **Real-time Coordinates**: Display current position and zoom level
- **Zoom Navigation**: Left-click to zoom in, right-click to zoom out

## Technical Architecture

### Clean Code Structure
All pages follow separation of concerns principle:
- **HTML**: Semantic structure and content
- **CSS**: Styling and layout (separate files per page)
- **JavaScript**: Functionality and interactivity (modular approach)

### File Organization
```
├── index.html              # Main portfolio page
├── numerical.html          # Numerical concepts demo
├── sorting.html           # Sorting algorithms visualization  
├── stats.html             # Statistics calculator
├── mandelbrot.html        # Fractal explorer
├── styles.css             # Main stylesheet
├── numerical.css          # Numerical demo styles
├── sorting.css            # Sorting visualization styles
├── stats.css              # Statistics page styles
├── mandelbrot.css         # Fractal explorer styles
├── scripts.js             # Portfolio functionality
├── numerical.js           # Numerical concepts logic
├── sorting.js             # Sorting algorithms implementation
├── stats.js               # Statistical calculations
├── mandelbrot.js          # Fractal rendering with Web Workers
├── tw.css                 # Tailwind CSS framework
├── beach.jpg              # Profile image
├── favicon files          # Site icons
└── README.md              # This documentation
```

## Technologies & Features

### Core Technologies
- **HTML5**: Semantic markup with proper accessibility
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Modern JavaScript features including:
  - Web Workers for performance
  - Canvas API for graphics
  - Async/await patterns
  - Generator functions for animations
  - Module pattern for code organization

### Frameworks & Libraries
- **Tailwind CSS**: Utility-first CSS framework
- **Google Fonts**: Inter typeface for modern typography

### Advanced Features
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Performance Optimization**: Web Workers for CPU-intensive calculations
- **Interactive Visualizations**: Real-time graphics and animations
- **Educational Content**: Comprehensive explanations of complex topics
- **Cross-browser Compatibility**: Tested on modern browsers

## Getting Started

### Quick Start
1. Clone this repository:
   ```bash
   git clone [repository-url]
   cd k-mikko2
   ```

2. Open any HTML file in a web browser:
   - `index.html` - Start with the portfolio
   - Or jump directly to any educational demo

### Local Development
For best performance with Web Workers and to avoid CORS issues:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Educational Value

This project demonstrates practical applications of:
- **Computer Science Fundamentals**: Binary systems, algorithms, data structures
- **Mathematical Concepts**: Statistics, complex numbers, fractal geometry
- **Web Development**: Modern JavaScript, responsive design, performance optimization
- **Software Engineering**: Clean code, separation of concerns, modular architecture

## Browser Support

- **Chrome**: Full support (recommended for best performance)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

*Note: Web Workers and Canvas API are used extensively, requiring modern browser support.*

## Contact

**Mikko Kärenlampi** - ICT Specialist
- **Email**: mikko.karenlampi@gmail.com
- **GitHub**: [github.com/fungusoid](https://github.com/fungusoid)
- **Location**: Kaarina, Finland
- **Work**: WhiBiotech Oy ([whibiotech.com](https://whibiotech.com))

## License

This project combines personal portfolio content with educational demonstrations. The educational components are designed to be learning resources and may be used for educational purposes. The overall structure and individual implementations can serve as inspiration for similar projects.
