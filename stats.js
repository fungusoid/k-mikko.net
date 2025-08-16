// Basic Statistics Calculator
document.addEventListener('DOMContentLoaded', () => {
    // --- Descriptive Statistics Calculator ---
    const dataInput = document.getElementById('data-input');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsDiv = document.getElementById('results');
    const meanOutput = document.getElementById('mean-output');
    const medianOutput = document.getElementById('median-output');
    const modeOutput = document.getElementById('mode-output');
    const stddevOutput = document.getElementById('stddev-output');
    const errorMessage = document.getElementById('error-message');

    if(calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const rawText = dataInput.value;
            if (!rawText) {
                errorMessage.textContent = 'Please enter some data.';
                resultsDiv.classList.add('hidden');
                return;
            }
            
            // Parse the input into an array of numbers
            const numbers = rawText.split(',')
                .map(item => item.trim())
                .filter(item => item !== '')
                .map(Number)
                .filter(num => !isNaN(num));

            if (numbers.length === 0) {
                errorMessage.textContent = 'No valid numbers found. Please check your input.';
                resultsDiv.classList.add('hidden');
                return;
            }

            errorMessage.textContent = '';
            resultsDiv.classList.remove('hidden');

            // Calculate Mean
            const sum = numbers.reduce((acc, val) => acc + val, 0);
            const mean = sum / numbers.length;
            meanOutput.textContent = mean.toFixed(2);

            // Calculate Median
            const sorted = [...numbers].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
            medianOutput.textContent = median.toFixed(2);

            // Calculate Mode
            const counts = {};
            numbers.forEach(num => {
                counts[num] = (counts[num] || 0) + 1;
            });
            let maxFreq = 0;
            let modes = [];
            for (const num in counts) {
                if (counts[num] > maxFreq) {
                    maxFreq = counts[num];
                    modes = [num];
                } else if (counts[num] === maxFreq) {
                    modes.push(num);
                }
            }
            if (maxFreq <= 1 && new Set(numbers).size === numbers.length) {
                modeOutput.textContent = 'N/A';
            } else {
                modeOutput.textContent = modes.join(', ');
            }

            // Calculate Standard Deviation
            const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
            const stddev = Math.sqrt(variance);
            stddevOutput.textContent = stddev.toFixed(2);
        });
    }

    // --- Linear Regression ---
    const canvas = document.getElementById('regression-canvas');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const equationOutput = document.getElementById('regression-equation');
    
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let points = [];

        function draw() {
            // Responsive canvas sizing
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.width * (2/3);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const padding = 40;
            const graphOriginX = padding;
            const graphOriginY = canvas.height - padding;
            const graphWidth = canvas.width - padding * 1.5;
            const graphHeight = canvas.height - padding * 1.5;

            // --- Draw Grid and Labels ---
            const numGridLines = 10;
            ctx.strokeStyle = '#e2e8f0'; // slate-200
            ctx.fillStyle = '#64748b';   // slate-500
            ctx.font = '12px Inter';
            ctx.lineWidth = 1;

            // Horizontal grid lines and Y-axis labels
            for (let i = 0; i <= numGridLines; i++) {
                const y = graphOriginY - (i * (graphHeight / numGridLines));
                const label = (i / numGridLines).toFixed(1);
                
                ctx.beginPath();
                ctx.moveTo(graphOriginX - 5, y);
                ctx.lineTo(graphOriginX + graphWidth, y);
                ctx.stroke();

                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, graphOriginX - 10, y);
            }

            // Vertical grid lines and X-axis labels
            for (let i = 0; i <= numGridLines; i++) {
                const x = graphOriginX + (i * (graphWidth / numGridLines));
                const label = (i / numGridLines).toFixed(1);

                ctx.beginPath();
                ctx.moveTo(x, graphOriginY + 5);
                ctx.lineTo(x, graphOriginY - graphHeight);
                ctx.stroke();
                
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(label, x, graphOriginY + 10);
            }

            // --- Draw Main Axes ---
            ctx.beginPath();
            ctx.strokeStyle = '#94a3b8'; // slate-400
            ctx.lineWidth = 1.5;
            ctx.moveTo(graphOriginX, graphOriginY - graphHeight - 5);
            ctx.lineTo(graphOriginX, graphOriginY + 5); // Y-axis
            ctx.moveTo(graphOriginX - 5, graphOriginY);
            ctx.lineTo(graphOriginX + graphWidth + 5, graphOriginY); // X-axis
            ctx.stroke();
            
            // --- Draw Points ---
            ctx.fillStyle = '#4f46e5';
            points.forEach(p => {
                const plotX = graphOriginX + p.x * graphWidth;
                const plotY = graphOriginY - p.y * graphHeight;
                ctx.beginPath();
                ctx.arc(plotX, plotY, 5, 0, 2 * Math.PI);
                ctx.fill();
            });

            // --- Calculate and Draw Regression Line ---
            if (points.length > 1) {
                let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
                points.forEach(p => {
                    sumX += p.x;
                    sumY += p.y;
                    sumXY += p.x * p.y;
                    sumX2 += p.x * p.x;
                });
                const n = points.length;
                const m = (n * sumX2 - sumX * sumX) === 0 ? 0 : (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                const b = (sumY - m * sumX) / n;

                const startX = graphOriginX;
                const startY = graphOriginY - b * graphHeight;
                const endX = graphOriginX + graphWidth;
                const endY = graphOriginY - (m * 1 + b) * graphHeight;

                // Clip the line to the graph bounds
                ctx.save();
                ctx.beginPath();
                ctx.rect(graphOriginX, graphOriginY - graphHeight, graphWidth, graphHeight);
                ctx.clip();
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = '#ef4444'; // red-500
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.restore();
                
                equationOutput.textContent = `y = ${m.toFixed(2)}x + ${b.toFixed(2)}`;
            } else {
                equationOutput.textContent = 'y = mx + b';
            }
        }
        
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const padding = 40;
            const graphOriginX = padding;
            const graphOriginY = canvas.height - padding;
            const graphWidth = canvas.width - padding * 1.5;
            const graphHeight = canvas.height - padding * 1.5;
            
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (mouseX > graphOriginX && mouseX < graphOriginX + graphWidth && 
                mouseY > graphOriginY - graphHeight && mouseY < graphOriginY) {
                
                const x = (mouseX - graphOriginX) / graphWidth;
                const y = (graphOriginY - mouseY) / graphHeight;
                points.push({ x, y });
                draw();
            }
        });

        clearCanvasBtn.addEventListener('click', () => {
            points = [];
            draw();
        });

        // Initial draw and responsive redraw
        draw();
        window.addEventListener('resize', draw);
    }
});
