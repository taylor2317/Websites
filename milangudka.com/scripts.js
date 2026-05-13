let gcse = false;
let alevel = false;
let i = 0;

const GCSE = [
    "https://milangudka.com/Resources/Coursework/GCSE%20DT/GCSE%20DT%20Front%20Cover.png",
    "https://milangudka.com/Resources/Coursework/GCSE%20DT/GCSE%20DT%20Contextual%20Problem.png",
    "https://milangudka.com/Resources/Coursework/GCSE%20DT/GCSE%20DT%20Product%20Analysis.png",
    "https://milangudka.com/Resources/Coursework/GCSE%20DT/GCSE%20DT%20Design%20Ideas.png",
    "https://milangudka.com/Resources/Coursework/GCSE%20DT/GCSE%20DT%20Developed%20Ideas.png",
    "https://milangudka.com/Resources/Coursework/GCSE%20DT/GCSE%20DT%20Orthographic.png"
];

const ALevel = [
    "https://milangudka.com/Resources/Coursework/A-Level%20DT/A-Level%20DT%20Front%20Cover.png",
    "https://milangudka.com/Resources/Coursework/A-Level%20DT/A-Level%20DT%20Secondary%20Research.png",
    "https://milangudka.com/Resources/Coursework/A-Level%20DT/A-Level%20DT%20Design%20Concepts.png",
    "https://milangudka.com/Resources/Coursework/A-Level%20DT/A-Level%20DT%20Client%20Feedback.png",
    "https://milangudka.com/Resources/Coursework/A-Level%20DT/A-Level%20DT%20Assessing%20Feedback.png",
    "https://milangudka.com/Resources/Coursework/A-Level%20DT/A-Level%20DT%20Health%20%26%20Safety.png"
];


function GCSEDTPopup() {
    console.log("GCSE Popup activated.");
    gcse = true;
    alevel = false;
    i = 0;
    console.log("GCSE is set to true. A-Level is set to false. Image index (i) reset to 0.");
    popups();
}

function ALevelDTPopup() {
    console.log("A-Level Popup activated.");
    alevel = true;
    gcse = false;
    i = 0;
    console.log("A-Level is set to true. GCSE is set to false. Image index (i) reset to 0.");
    popups();
}

function popups() {
    console.log("Popup displayed.");
    document.querySelector('.popup').style.display = 'block';
    generateDots();
    updateImage();
}

function popupClose() {
    console.log("Popup closed.");
    document.querySelector('.popup').style.display = 'none';
    gcse = false;
    alevel = false;
}

function next() {
    console.log("Next button clicked.");
    i = (i + 1) % getCurrentArray().length;
    console.log("Image index updated to " + i);
    updateImage();
}

function prev() {
    console.log("Previous button clicked.");
    i = (i - 1 + getCurrentArray().length) % getCurrentArray().length;
    console.log("Image index updated to " + i);
    updateImage();
}

function updateImage() {
    const img = document.getElementById("popupImg");
    const array = getCurrentArray();
    if (img && array.length > 0) {
        console.log("Updating image with source: " + array[i]);
        img.src = array[i]; // This must match the correct full path
        console.log("Image src set to:", img.src);
        updateDots();
    }
    
    else {
        console.log("No image found or array is empty.");
    }
}


function getCurrentArray() {
    if (gcse) {
        console.log("Returning GCSE image array.");
        return GCSE;
    }
    
    else if (alevel) {
        console.log("Returning A-Level image array.");
        return ALevel;
    }
    
    else {
        console.log("No image array selected.");
        return [];
    }
}

function generateDots() {
    const array = getCurrentArray();
    const dotsContainer = document.querySelector(".dots");

    if (!dotsContainer) return;

    // Clear previous dots
    dotsContainer.innerHTML = "";

    array.forEach((_, index) => {
        const dot = document.createElement("i");
        dot.classList.add("fa-solid", "fa-circle");
        if (index === i) dot.classList.add("active");

        dot.addEventListener("click", () => {
            i = index;
            updateImage();
        });

        dotsContainer.appendChild(dot);
    });
}


function updateDots() {
    const dots = document.querySelectorAll(".dots i");
    console.log("Updating dots.");

    dots.forEach((dot, index) => {
        if (index === i) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}
