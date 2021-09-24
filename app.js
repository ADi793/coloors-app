// selectors
const colorDivs = document.querySelectorAll(".color");
const sliders = document.querySelectorAll("input[type=range]");
const hexTexts = document.querySelectorAll(".color h2");
const copyPopup = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const closeAdjustmentBtns = document.querySelectorAll(".close-adjustment");
const generateButton = document.querySelector(".generate");
const lockButtons = document.querySelectorAll(".lock");
let initialColors;
let savedPalettes = [];

// add event listeners
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUi(index);
  });
});

hexTexts.forEach((hexText) => {
  hexText.addEventListener("click", (e) => {
    copyToClipBoard(hexText);
  });
});

copyPopup.addEventListener("transitionend", (e) => {
  copyPopup.children[0].classList.remove("active");
  copyPopup.classList.remove("active");
});

adjustButtons.forEach((adjustButton, index) => {
  adjustButton.addEventListener("click", (e) => {
    openAndCloseAdjustments(index);
  });
});

closeAdjustmentBtns.forEach((closeAdjustmentBtn, index) => {
  closeAdjustmentBtn.addEventListener("click", (e) => {
    closeAdjustments(index);
  });
});

generateButton.addEventListener("click", (e) => {
  randomColors();
});

lockButtons.forEach((lockButton, index) => {
  lockButton.addEventListener("click", (e) => {
    lockAndUnlockDivColor(index);
  });
});

function generateHex() {
  return chroma.random();
}

function randomColors() {
  initialColors = [];

  colorDivs.forEach((div) => {
    // generate color and grab hexText
    const hexText = div.children[0];
    const buttons = div.querySelectorAll(".controls button");
    const color = generateHex();

    if (div.classList.contains("active")) {
      return;
    } else {
      initialColors.push(color.hex());

      // add color to the current div and hex to hexText
      div.style.background = color;
      hexText.innerText = color;

      checkTextContrast(color, hexText);
      for (button of buttons) {
        checkTextContrast(color, button);
      }

      // colorize sliders
      const sliders = div.querySelectorAll("input");
      const hue = sliders[0];
      const brightness = sliders[1];
      const saturation = sliders[2];

      colorizeSliders(color, hue, brightness, saturation);

      resetInputs(color, hue, brightness, saturation);
    }
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();

  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // bright scale
  const midBright = color.set("hsl.l", 0.5);
  const brightScale = chroma.scale(["black", midBright, "white"]);

  // saturation scale
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const saturationScale = chroma.scale([noSat, color, fullSat]);

  hue.style.background = `linear-gradient(to right, rgb(204, 75,75), rgb(204, 204, 75), rgb(75, 204, 204), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
  brightness.style.background = `linear-gradient(to right, ${brightScale(
    0
  )}, ${brightScale(0.5)}, ${brightScale(1)})`;
  saturation.style.background = `linear-gradient(to right, ${saturationScale(
    0
  )}, ${saturationScale(1)})`;
}

function hslControls(e) {
  const divIndex =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat");

  // const hex = colorDivs[divIndex].children[0].innerText;
  const hex = initialColors[divIndex];

  const sliders = e.target.parentElement.querySelectorAll("input[type=range]");

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const color = chroma(hex)
    .set("hsl.h", hue.value)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value);

  colorDivs[divIndex].style.background = color;

  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUi(index) {
  const activeDiv = colorDivs[index];
  const hexText = activeDiv.children[0];

  const color = activeDiv.style.backgroundColor;
  hexText.innerText = chroma(color).hex();

  checkTextContrast(color, hexText);

  const icons = activeDiv.querySelectorAll(".controls button");
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs(color, hue, brightness, saturation) {
  hue.value = Math.floor(chroma(color).hsl()[0]);
  brightness.value = Math.floor(chroma(color).hsl()[1] * 100) / 100;
  saturation.value = Math.floor(chroma(color).hsl()[2] * 100) / 100;
}

function copyToClipBoard(hexText) {
  const textArea = document.createElement("textarea");
  textArea.value = hexText.innerText;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  // popup animation
  const popup = copyPopup.children[0];
  copyPopup.classList.add("active");
  popup.classList.add("active");
}

function openAndCloseAdjustments(index) {
  const sliders = colorDivs[index].querySelector(".sliders");
  sliders.classList.toggle("active");
}

function closeAdjustments(index) {
  const sliders = colorDivs[index].querySelector(".sliders");
  sliders.classList.remove("active");
}

function lockAndUnlockDivColor(index) {
  const activeDiv = colorDivs[index];
  if (!activeDiv.classList.contains("active")) {
    activeDiv.classList.add("active");
    lockButtons[index].innerHTML = `<i class='fas fa-lock'><i>`;
  } else {
    activeDiv.classList.remove("active");
    lockButtons[index].innerHTML = `<i class='fas fa-lock-open'><i>`;
  }
}

randomColors();

// implement save palette stuff
const savePaletteButton = document.querySelector(".save");
const closeSaveButton = document.querySelector(".close-save");
const savePopupContainer = document.querySelector(".save-container");
const savePopup = document.querySelector(".save-popup");
const submitSave = document.querySelector(".submit-save");
const saveName = document.querySelector(".save-name");
const libraryButton = document.querySelector(".library");
const libraryPopupContainer = document.querySelector(".library-container");
const libraryPopup = document.querySelector(".library-popup");
const closeLibraryButton = document.querySelector(".close-library");

savePaletteButton.addEventListener("click", openSavePalette);
closeSaveButton.addEventListener("click", closeSavePalette);
submitSave.addEventListener("click", savePalette);
libraryButton.addEventListener("click", openSavedPalettes);
closeLibraryButton.addEventListener("click", closeSavedPalettes);

function openSavePalette() {
  savePopupContainer.classList.add("active");
  savePopup.classList.add("active");
}

function closeSavePalette() {
  savePopup.classList.remove("active");
  savePopupContainer.classList.remove("active");
}

function savePalette(e) {
  savePopup.classList.remove("active");
  savePopupContainer.classList.remove("active");

  const name = saveName.value;

  let colors = [];
  hexTexts.forEach((hexText) => {
    colors.push(hexText.innerText);
  });

  let paletteNumber;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNumber = paletteObjects.length;
  } else {
    paletteNumber = savedPalettes.length;
  }

  const paletteObject = { name, colors, paletteNumber };
  savedPalettes.push(paletteObject);
  // save to local storage
  saveToLocalStorage(paletteObject);
  saveName.value = "";

  // generat palette for library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const paletteTitle = document.createElement("h5");
  paletteTitle.innerText = paletteObject.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObject.colors.forEach((color) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = color;
    preview.appendChild(smallDiv);
  });

  const pickPaletteButton = document.createElement("button");
  pickPaletteButton.classList.add("pick-palette-btn");
  pickPaletteButton.classList.add(paletteObject.paletteNumber);
  pickPaletteButton.innerText = "Select";

  pickPaletteButton.addEventListener("click", (e) => {
    closeSavedPalettes();
    const paletteIndex = pickPaletteButton.classList[1];
    const palette = savedPalettes[paletteIndex];

    initialColors = [];
    palette.colors.forEach((color, index) => {
      colorDivs[index].style.background = color;
      initialColors.push(color);

      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUi(index);

      const sliders = colorDivs[index].querySelectorAll("input");
      const hue = sliders[0];
      const brightness = sliders[1];
      const saturation = sliders[2];

      colorizeSliders(chroma(color), hue, brightness, saturation);
      resetInputs(color, hue, brightness, saturation);
    });
  });

  palette.appendChild(paletteTitle);
  palette.appendChild(preview);
  palette.appendChild(pickPaletteButton);
  libraryPopup.appendChild(palette);
}

function saveToLocalStorage(paletteObject) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  localPalettes.push(paletteObject);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openSavedPalettes() {
  libraryPopupContainer.classList.add("active");
  libraryPopup.classList.add("active");
}

function closeSavedPalettes() {
  libraryPopup.classList.remove("active");
  libraryPopupContainer.classList.remove("active");
}

function getPalettesFromLocal() {
  if (localStorage.getItem("palettes") !== null) {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));

    savedPalettes = [...paletteObjects];

    savedPalettes.forEach((savePalette) => {
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const paletteTitle = document.createElement("h5");
      paletteTitle.innerText = savePalette.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      savePalette.colors.forEach((color) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = color;
        preview.appendChild(smallDiv);
      });

      const pickPaletteButton = document.createElement("button");
      pickPaletteButton.classList.add("pick-palette-btn");
      pickPaletteButton.classList.add(savePalette.paletteNumber);
      pickPaletteButton.innerText = "Select";

      pickPaletteButton.addEventListener("click", (e) => {
        closeSavedPalettes();
        const paletteIndex = pickPaletteButton.classList[1];
        const palette = savedPalettes[paletteIndex];

        initialColors = [];
        palette.colors.forEach((color, index) => {
          colorDivs[index].style.background = color;
          initialColors.push(color);

          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUi(index);

          const sliders = colorDivs[index].querySelectorAll("input");
          const hue = sliders[0];
          const brightness = sliders[1];
          const saturation = sliders[2];

          colorizeSliders(chroma(color), hue, brightness, saturation);
          resetInputs(color, hue, brightness, saturation);
        });
      });

      palette.appendChild(paletteTitle);
      palette.appendChild(preview);
      palette.appendChild(pickPaletteButton);
      libraryPopup.appendChild(palette);
    });
  }
}

getPalettesFromLocal();
