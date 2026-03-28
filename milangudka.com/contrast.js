let isHighContrastEnabled = localStorage.getItem('highContrastEnabled') === 'true';

function toggleHighContrast() {
    console.log("Toggling high contrast mode...");
    isHighContrastEnabled = !isHighContrastEnabled;

    // Store the current state in localStorage
    localStorage.setItem('highContrastEnabled', isHighContrastEnabled);
    console.log("High contrast mode state set to: " + isHighContrastEnabled);

    if (isHighContrastEnabled) {
        enableHighContrast();
    }

    else {
        disableHighContrast();
    }
}

function enableHighContrast() {
    console.log("High contrast mode enabled.");
    document.querySelectorAll('*').forEach(function(el) {
        const color = window.getComputedStyle(el).color;
        console.log("Element color: " + color);
        if (color === '#008080ff' || color === '#15b295ff') {
            el.style.color = 'black';
            console.log("Changed color to black for element: ", el);
        }
    });

    removeGradients();
    makeBordersBlack();
    removeTransitions();
    removeAllBoxShadows();
}

function disableHighContrast() {
    console.log("High contrast mode disabled.");
    document.querySelectorAll('*').forEach(function(el) {
        // Reset color to default
        el.style.color = '';
        el.style.backgroundImage = '';
        el.style.backgroundColor = '';
        el.style.border = '';
        el.style.transition = '';
        el.style.boxShadow = '';
        console.log("Reset styles for element: ", el);
    });
}

function removeGradients() {
    console.log("Removing gradients...");
    document.querySelectorAll('*').forEach(function(el) {
        const bgImage = window.getComputedStyle(el).backgroundImage;
        if (bgImage && bgImage.includes('gradient')) {
            el.style.backgroundImage = 'none';
            el.style.backgroundColor = 'black';
            console.log("Removed gradient from element: ", el);
        }
    });
}

function makeBordersBlack() {
    console.log("Making borders black...");
    document.querySelectorAll('*').forEach(function(el) {
        const style = window.getComputedStyle(el);
        const hasVisibleBorder = ['top', 'right', 'bottom', 'left'].some(side => {
            return parseFloat(style[`border-${side}-width`]) > 0 &&
                   style[`border-${side}-style`] !== 'none';
        });

        if (hasVisibleBorder) {
            el.style.border = '2px solid black';
            console.log("Set border to black for element: ", el);
        }
    });
}

function removeTransitions() {
    console.log("Removing transitions...");
    document.querySelectorAll('*').forEach(function(el) {
        el.style.setProperty('transition', 'none', 'important');
        console.log("Removed transition for element: ", el);
    });
}

function removeAllBoxShadows() {
    console.log("Removing box shadows...");
    document.querySelectorAll('*').forEach(function(el) {
        el.style.boxShadow = 'none';
        console.log("Removed box shadow for element: ", el);
    });
}

// Apply the high contrast mode state on page load
if (isHighContrastEnabled) {
    console.log("Applying high contrast mode on page load...");
    enableHighContrast();
}

else {
    console.log("High contrast mode is off on page load.");
    disableHighContrast();
}
