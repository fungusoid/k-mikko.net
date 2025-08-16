// Numerical Concepts Interactive Calculator
document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * Generic function to create a bank of bit switches.
     * @param {HTMLElement} container - The DOM element to hold the bits.
     * @param {Array<number>} bitsArray - The array holding the state of the bits.
     * @param {Function} updateCallback - The function to call when a bit is toggled.
     * @param {number} start - The starting index in the bitsArray.
     * @param {number} len - The number of bits to create.
     * @param {string} customClass - A custom class to apply to each bit switch.
     * @param {boolean} showBitValue - Whether to show the power-of-2 bit value.
     */
    function createBitSwitches(container, bitsArray, updateCallback, start, len, customClass = '', showBitValue = false) {
        container.innerHTML = '';
        // Iterate from the highest bit index down to the lowest
        for (let i = start + len - 1; i >= start; i--) {
            const bitValue = Math.pow(2, i - start); // Adjust bit value for display if needed
            const bitSwitch = document.createElement('div');
            bitSwitch.className = `bit-switch ${bitsArray[i] ? 'on' : ''} ${customClass}`;
            bitSwitch.innerHTML = `<span>${bitsArray[i]}</span>${showBitValue ? `<span class="bit-value">${bitValue}</span>` : ''}`;
            bitSwitch.dataset.index = i;
            bitSwitch.addEventListener('click', (event) => {
                // Toggle the bit in the array
                bitsArray[i] = bitsArray[i] ? 0 : 1;
                
                // Directly update the visual state of the clicked bit
                event.currentTarget.className = `bit-switch ${bitsArray[i] ? 'on' : ''} ${customClass}`;
                event.currentTarget.querySelector('span').textContent = bitsArray[i];

                // Call the overall update function for the calculator
                updateCallback(); 
            });
            container.appendChild(bitSwitch);
        }
    }

    // --- Unsigned Byte Calculator ---
    const byteCalculatorContainer = document.getElementById('byte-calculator');
    const decimalOutput = document.getElementById('decimal-output');
    const hexOutput = document.getElementById('hex-output');
    let unsignedBits = [0, 0, 0, 0, 0, 0, 0, 0];

    function renderUnsignedByteCalculator() {
        createBitSwitches(byteCalculatorContainer, unsignedBits, renderUnsignedByteCalculator, 0, 8, '', true);
        updateUnsignedByteCalculatorOutputs();
    }

    function updateUnsignedByteCalculatorOutputs() {
        const decimalValue = unsignedBits.reduce((acc, bit, i) => acc + bit * Math.pow(2, i), 0);
        decimalOutput.textContent = decimalValue;
        hexOutput.textContent = decimalValue.toString(16).toUpperCase().padStart(2, '0');
    }

    // --- Signed Integer (Two's Complement) Calculator ---
    const signedByteContainer = document.getElementById('signed-byte-calculator');
    const signedDecimalOutput = document.getElementById('signed-decimal-output');
    let signedBits = [0, 0, 0, 0, 0, 0, 0, 0];

    function renderSignedByteCalculator() {
        createBitSwitches(signedByteContainer, signedBits, renderSignedByteCalculator, 0, 8, 'signed-bit');
        updateSignedByteCalculator();
    }

    function updateSignedByteCalculator() {
        const isNegative = signedBits[7] === 1;
        let decimalValue = 0;

        if (isNegative) {
            decimalValue = -Math.pow(2, 7);
            for (let i = 0; i < 7; i++) {
                decimalValue += signedBits[i] * Math.pow(2, i);
            }
        } else {
            decimalValue = signedBits.reduce((acc, bit, i) => acc + bit * Math.pow(2, i), 0);
        }
        signedDecimalOutput.textContent = decimalValue;
    }

    // --- Floating-Point Calculator ---
    const floatSignContainer = document.getElementById('float-sign-bit');
    const floatExponentContainer = document.getElementById('float-exponent-bits');
    const floatMantissaContainer = document.getElementById('float-mantissa-bits');
    const floatOutput = document.getElementById('float-output');
    const floatCalcInfo = document.getElementById('float-calculation-info');
    let floatBits = Array(16).fill(0); // 1 sign, 5 exponent, 10 mantissa

    function renderFloatCalculator() {
        createBitSwitches(floatSignContainer, floatBits, renderFloatCalculator, 15, 1, 'sign-bit');
        createBitSwitches(floatExponentContainer, floatBits, renderFloatCalculator, 10, 5, 'exponent-bit');
        createBitSwitches(floatMantissaContainer, floatBits, renderFloatCalculator, 0, 10, 'mantissa-bit');
        updateFloatCalculator();
    }

    function updateFloatCalculator() {
        const sign = floatBits[15];
        const exponentBits = floatBits.slice(10, 15).reverse();
        const mantissaBits = floatBits.slice(0, 10).reverse();

        let exponentRaw = 0;
        for (let i = 0; i < exponentBits.length; i++) {
            exponentRaw += exponentBits[i] * Math.pow(2, exponentBits.length - 1 - i);
        }

        let mantissaVal = 0;
        for (let i = 0; i < mantissaBits.length; i++) {
            mantissaVal += mantissaBits[i] * Math.pow(2, -(i + 1));
        }
        
        const BIAS = 15;
        let result;
        let info = '';

        if (exponentRaw === 31) {
            if (mantissaVal === 0) {
                result = (sign === 1 ? -Infinity : Infinity);
                info = 'Special Case: Infinity';
            } else {
                result = NaN;
                info = 'Special Case: Not a Number (NaN)';
            }
        } else if (exponentRaw === 0) {
            if (mantissaVal === 0) {
                result = (sign === 1 ? -0 : 0);
                info = 'Special Case: Zero';
            } else {
                const exponent = 1 - BIAS;
                result = Math.pow(-1, sign) * Math.pow(2, exponent) * mantissaVal;
                info = 'Subnormal Number';
            }
        } else {
            const exponent = exponentRaw - BIAS;
            result = Math.pow(-1, sign) * Math.pow(2, exponent) * (1 + mantissaVal);
        }
        
        floatOutput.textContent = result;
        floatCalcInfo.textContent = info;
    }


    // --- Universal Base Converter ---
    const numberInput = document.getElementById('numberInput');
    const fromBaseSelect = document.getElementById('fromBase');
    const inputError = document.getElementById('inputError');
    const outputDecimal = document.getElementById('outputDecimal');
    const outputBinary = document.getElementById('outputBinary');
    const outputHex = document.getElementById('outputHex');
    const outputOctal = document.getElementById('outputOctal');

    function convertBases() {
        const fromBase = parseInt(fromBaseSelect.value);
        const value = numberInput.value.trim();
        inputError.textContent = '';

        if (value === '') {
            outputDecimal.textContent = '-';
            outputBinary.textContent = '-';
            outputHex.textContent = '-';
            outputOctal.textContent = '-';
            return;
        }

        const validationPatterns = {
            2: /^[01]+$/,
            8: /^[0-7]+$/,
            10: /^-?[0-9]+$/,
            16: /^[0-9a-fA-F]+$/i
        };

        if (!validationPatterns[fromBase].test(value)) {
            inputError.textContent = `Invalid character for base ${fromBase}.`;
            return;
        }

        const decimalValue = parseInt(value, fromBase);

        if (isNaN(decimalValue)) {
            inputError.textContent = 'Invalid number.';
            return;
        }
        
        outputDecimal.textContent = decimalValue.toString(10);
        outputBinary.textContent = decimalValue.toString(2);
        outputHex.textContent = decimalValue.toString(16).toUpperCase();
        outputOctal.textContent = decimalValue.toString(8);
    }

    numberInput.addEventListener('input', convertBases);
    fromBaseSelect.addEventListener('change', convertBases);

    // --- Logical Operations Calculator ---
    const byteAContainer = document.getElementById('logical-byte-a');
    const byteBContainer = document.getElementById('logical-byte-b');
    const resultContainer = document.getElementById('logical-result');
    const notResultContainer = document.getElementById('logical-not-result');
    const opSelector = document.getElementById('logical-op-selector');
    const logicalDecimalOut = document.getElementById('logical-decimal-output');
    const logicalHexOut = document.getElementById('logical-hex-output');

    let bitsA = [0, 0, 0, 0, 0, 0, 0, 0];
    let bitsB = [0, 0, 0, 0, 0, 0, 0, 0];

    function renderLogicalCalculator() {
        createBitSwitches(byteAContainer, bitsA, renderLogicalCalculator, 0, 8);
        createBitSwitches(byteBContainer, bitsB, renderLogicalCalculator, 0, 8);
        calculateLogicalResult();
    }

    function calculateLogicalResult() {
        const operation = opSelector.value;
        let resultBits = [0, 0, 0, 0, 0, 0, 0, 0];
        let notBits = [0, 0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < 8; i++) {
            switch (operation) {
                case 'AND':
                    resultBits[i] = bitsA[i] & bitsB[i];
                    break;
                case 'OR':
                    resultBits[i] = bitsA[i] | bitsB[i];
                    break;
                case 'XOR':
                    resultBits[i] = bitsA[i] ^ bitsB[i];
                    break;
            }
            notBits[i] = bitsA[i] ? 0 : 1;
        }

        displayResult(resultContainer, resultBits);
        displayResult(notResultContainer, notBits);
        
        const decimalValue = resultBits.reduce((acc, bit, i) => acc + bit * Math.pow(2, i), 0);
        logicalDecimalOut.textContent = decimalValue;
        logicalHexOut.textContent = decimalValue.toString(16).toUpperCase().padStart(2, '0');
    }

    function displayResult(container, bitsArray) {
        container.innerHTML = '';
        for (let i = 7; i >= 0; i--) {
            const resultBit = document.createElement('div');
            resultBit.className = `bit-switch ${bitsArray[i] ? 'on' : ''}`;
            resultBit.style.cursor = 'default';
            resultBit.innerHTML = `<span>${bitsArray[i]}</span>`;
            container.appendChild(resultBit);
        }
    }

    opSelector.addEventListener('change', calculateLogicalResult);

    // --- Shift and Rotate Calculator ---
    const shiftRotateContainer = document.getElementById('shift-rotate-calculator');
    const shiftRotateDecimalOutput = document.getElementById('shift-rotate-decimal-output');
    const shiftRotateHexOutput = document.getElementById('shift-rotate-hex-output');
    const shiftLeftBtn = document.getElementById('shift-left-btn');
    const shiftRightBtn = document.getElementById('shift-right-btn');
    const rotateLeftBtn = document.getElementById('rotate-left-btn');
    const rotateRightBtn = document.getElementById('rotate-right-btn');
    let shiftRotateBits = [0, 0, 0, 0, 0, 0, 0, 0]; // 8 bits

    function renderShiftRotateCalculator() {
        createBitSwitches(shiftRotateContainer, shiftRotateBits, renderShiftRotateCalculator, 0, 8);
        updateShiftRotateOutputs();
    }

    function updateShiftRotateOutputs() {
        const decimalValue = shiftRotateBits.reduce((acc, bit, i) => acc + bit * Math.pow(2, i), 0);
        shiftRotateDecimalOutput.textContent = decimalValue;
        shiftRotateHexOutput.textContent = decimalValue.toString(16).toUpperCase().padStart(2, '0');
    }

    function performShiftLeft() {
        for (let i = 7; i > 0; i--) {
            shiftRotateBits[i] = shiftRotateBits[i - 1];
        }
        shiftRotateBits[0] = 0;
        renderShiftRotateCalculator();
    }

    function performShiftRight() {
        for (let i = 0; i < 7; i++) {
            shiftRotateBits[i] = shiftRotateBits[i + 1];
        }
        shiftRotateBits[7] = 0;
        renderShiftRotateCalculator();
    }

    function performRotateLeft() {
        const leftmostBit = shiftRotateBits[7];
        for (let i = 7; i > 0; i--) {
            shiftRotateBits[i] = shiftRotateBits[i - 1];
        }
        shiftRotateBits[0] = leftmostBit;
        renderShiftRotateCalculator();
    }

    function performRotateRight() {
        const rightmostBit = shiftRotateBits[0];
        for (let i = 0; i < 7; i++) {
            shiftRotateBits[i] = shiftRotateBits[i + 1];
        }
        shiftRotateBits[7] = rightmostBit;
        renderShiftRotateCalculator();
    }

    shiftLeftBtn.addEventListener('click', performShiftLeft);
    shiftRightBtn.addEventListener('click', performShiftRight);
    rotateLeftBtn.addEventListener('click', performRotateLeft);
    rotateRightBtn.addEventListener('click', performRotateRight);

    // Initial renders for all calculators
    renderUnsignedByteCalculator();
    renderSignedByteCalculator();
    renderFloatCalculator();
    convertBases();
    renderLogicalCalculator();
    renderShiftRotateCalculator();
});
