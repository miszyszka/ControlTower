"use strict";

// =================================================================
// 1. GLOBALNE STAŁE I FUNKCJE (BEZ DUPLIKATÓW)
// =================================================================

const CONTAINER = document.getElementById("grid-container");
const COLS = 16;
const ROWS = 16;
const CELL_SIZE = 50;
const GRID_SIZE = 16;
let monitorIntervalID = null;
let allPlanes = [];
let allCells = {};

// prettier-ignore
const gridData = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 1, 3, 1, 4, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0,
  0, 1, 3, 1, 4, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 3, 1, 4, 3, 1, 4, 0, 0, 0, 0, 1, 0, 1, 0, 
  0, 1, 8, 1, 9, 8, 1, 9, 2, 2, 2, 2, 1, 0, 1, 0, 
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 
  0, 1, 7, 1, 6, 7, 1, 6, 5, 5, 5, 5, 1, 0, 1, 0, 
  0, 1, 3, 1, 4, 3, 1, 4, 0, 0, 0, 0, 1, 1, 1, 0, 
  0, 1, 3, 1, 4, 3, 1, 4, 0, 0, 0, 0, 0, 0, 1, 0, 
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 
  0, 0, 3, 1, 4, 3, 1, 4, 0, 1, 0, 1, 1, 1, 1, 0, 
  0, 0, 3, 1, 4, 3, 1, 4, 0, 1, 0, 1, 1, 1, 1, 0,
  0, 0, 3, 1, 4, 3, 1, 4, 0, 1, 0, 1, 1, 1, 1, 0, 
  0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

// Funkcja generująca siatkę
function createGrid() {
  for (let i = 0; i < gridData.length; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    cell.id = `cell-${i}`;

    if (gridData[i] === 1) {
      cell.classList.add("white");
    }
    // UPP
    if (gridData[i] === 2) {
      const halfCell = document.createElement("div");
      halfCell.classList.add("halfCell");
      cell.style.transform = "rotate(180deg)";
      cell.appendChild(halfCell);
    }
    // RIGHT
    if (gridData[i] === 3) {
      const halfCell = document.createElement("div");
      halfCell.classList.add("halfCell");
      cell.style.transform = "rotate(90deg)";
      cell.appendChild(halfCell);
    }
    // LEFT
    if (gridData[i] === 4) {
      const halfCell = document.createElement("div");
      halfCell.classList.add("halfCell");
      cell.style.transform = "rotate(-90deg)";
      cell.appendChild(halfCell);
    }
    // BOTTOM
    if (gridData[i] === 5) {
      const halfCell = document.createElement("div");
      halfCell.classList.add("halfCell");
      cell.style.transform = "rotate(0deg)";
      cell.appendChild(halfCell);
    }

    // LEFT UP
    if (gridData[i] === 6) {
      const quarterCell = document.createElement("div");
      cell.style.backgroundColor = "var(--white)";
      quarterCell.classList.add("gray)");
      quarterCell.classList.add("quarterCell");
      cell.style.transform = "rotate(180deg)";
      cell.appendChild(quarterCell);
    }

    // RIGHT UP
    if (gridData[i] === 7) {
      const quarterCell = document.createElement("div");
      cell.style.backgroundColor = "var(--white)";
      quarterCell.classList.add("gray)");
      quarterCell.classList.add("quarterCell");
      cell.style.transform = "rotate(-90deg)";
      cell.appendChild(quarterCell);
    }

    // LEFT BOTTOM
    if (gridData[i] === 8) {
      const quarterCell = document.createElement("div");
      cell.style.backgroundColor = "var(--white)";
      quarterCell.classList.add("gray)");
      quarterCell.classList.add("quarterCell");
      cell.style.transform = "rotate(0deg)";
      cell.appendChild(quarterCell);
    }

    // RIGHT BOTTOM
    if (gridData[i] === 9) {
      const quarterCell = document.createElement("div");
      cell.style.backgroundColor = "var(--white)";
      quarterCell.classList.add("gray)");
      quarterCell.classList.add("quarterCell");
      cell.style.transform = "rotate(90deg)";
      cell.appendChild(quarterCell);
    }

    CONTAINER.appendChild(cell);
  }
}

function generateAllCells() {
  const cells = document.querySelectorAll(".grid-cell");

  cells.forEach((cell, index) => {
    const key = `cell-${index + 1}`;
    allCells[key] = { free: true };
  });
}
setTimeout(() => {
  generateAllCells();
}, 1000);

// Funkcja do wypełniania komórki
// function fillMyCell(content, className, row, col) {
//   const index = (row - 1) * COLS + (col - 1);
//   const targetCell = document.getElementById(`cell-${index}`);

//   targetCell.innerHTML = "";
//   const contentDiv = document.createElement("div");
//   contentDiv.innerHTML = content;
//   contentDiv.classList.add(className);
//   targetCell.appendChild(contentDiv);
// }

// Definicje położeń
const landingPositions = {
  "18L": { left: 200, top: 50 },
  "18R": { left: 350, top: 150 },
  "36L": { left: 200, top: 750 },
  "36R": { left: 350, top: 750 },
  "09": { left: 50, top: 300 },
  27: { left: 650, top: 300 },
};

// // Funkcja do oznaczania położeń
// const makeMarks = function () {
//   Object.entries(landingPositions).forEach(([planeId, coords]) => {
//     const mark = document.createElement("div");
//     mark.classList.add("mark");
//     mark.style.position = "absolute";
//     mark.style.left = `${coords.left}px`;
//     mark.style.top = `${coords.top}px`;

//     CONTAINER.appendChild(mark);
//   });
// };

createGrid();
// makeMarks();

let planeID = 1;

const fetchPlane = async function (planeDiv) {
  const response = await fetch("svg/plane.html");
  const data = await response.text();
  planeDiv.innerHTML = data;
};

// =================================================================
// 2. OBLICZANIE POŁOŻENIA SAMOLOTU I MONITORING
// =================================================================

// Funkcja do obliczania współrzędnych komórki
function getPlaneCellCoordinates(id) {
  const planeData = allPlanes.find((p) => p.planeID === id);

  let leftPx = planeData.X;
  let topPx = planeData.Y;

  let colIndex = Math.floor(leftPx / CELL_SIZE);
  let rowIndex = Math.floor(topPx / CELL_SIZE);

  let column = colIndex + 1;
  column = Math.max(1, Math.min(GRID_SIZE, column));

  let row = rowIndex + 1;
  row = Math.max(1, Math.min(GRID_SIZE, row));

  return {
    column: column, // X, liczona od 1
    row: row, // Y, liczona od 1
    index: rowIndex * GRID_SIZE + colIndex, // Indeks w płaskiej tablicy (0-255)
  };
}
// Funkcje monitorujące pozycję
// function startPositionMonitoring(planeElement) {
//   if (monitorIntervalID) {
//     clearInterval(monitorIntervalID);
//   }

//   monitorIntervalID = setInterval(() => {
//     const currentPosition = getPlaneCellCoordinates(planeElement);
//     console.log(
//       `[Monitor] Samolot: Rząd ${currentPosition.row}, Kolumna ${currentPosition.column}, Indeks: ${currentPosition.index}`
//     );
//   }, 500);
// }

// =================================================================
// =================================================================
// =================================================================
// MakeMOVE
const makeTurn = function (id, plane, direction) {
  return new Promise((resolve) => {
    const planeData = allPlanes.find((p) => p.planeID === id);

    let currentAngle = planeData.angle;

    let newAngle;

    if (direction === "left") {
      newAngle = currentAngle - 90;
    } else if (direction === "right") {
      newAngle = currentAngle + 90;
    }

    planeData.angle = newAngle;

    const performMovement = () => {
      const onTransitionEnd = (event) => {
        if (
          event.propertyName === "transform" ||
          event.propertyName === "translate"
        ) {
          plane.removeEventListener("transitionend", onTransitionEnd);
          resolve();
        }
      };
      plane.addEventListener("transitionend", onTransitionEnd);

      plane.style.transform = `translateX(${planeData.X}px) translateY(${planeData.Y}px) rotate(${newAngle}deg)`;
    };

    performMovement();
  });
};

const handleCellOcupation = function (cell, logic) {
  const currentCell = `cell-${cell}`;

  if (!allCells[currentCell]) return; // zabezpieczenie, jeśli komórka nie istnieje

  if (logic === false) {
    allCells[currentCell].free = false; // ustawiamy jako zajętą
  } else if (logic === true) {
    allCells[currentCell].free = true; // ustawiamy jako wolną
  }
};

const makeMove = function (id, plane, direction, distance) {
  return new Promise((resolve) => {
    (async () => {
      const planeData = allPlanes.find((p) => p.planeID === id);

      // Aktualne położenie
      let currentX = planeData.X;
      let currentY = planeData.Y;

      let newX = currentX;
      let newY = currentY;

      if (direction === "left") newX -= distance;
      else if (direction === "right") newX += distance;
      else if (direction === "up") newY -= distance;
      else if (direction === "down") newY += distance;
      else return resolve();

      // NOWA komórka
      const colIndex = Math.floor(newX / CELL_SIZE);
      const rowIndex = Math.floor(newY / CELL_SIZE);

      const newCellIndex = rowIndex * GRID_SIZE + colIndex + 1;
      const newKey = `cell-${newCellIndex}`;

      // Czekamy aż będzie wolna
      while (!allCells[newKey].free) {
        console.log(`Cell ${newKey} zajęta, czekam 1s...`);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Nowy ruch
      const oldCell = getPlaneCellCoordinates(planeData.planeID);

      // Aktualizacja pozycji w danych samolotu
      planeData.X = newX;
      planeData.Y = newY;

      // ANIMACJA
      const onTransitionEnd = (event) => {
        if (event.propertyName === "transform") {
          console.log(oldCell.index, newCellIndex);
          handleCellOcupation(oldCell.index, true);
          handleCellOcupation(newCellIndex, false);

          plane.removeEventListener("transitionend", onTransitionEnd);
          resolve();
        }
      };

      plane.addEventListener("transitionend", onTransitionEnd);

      plane.style.transform = `translateX(${newX}px) translateY(${newY}px) rotate(${planeData.angle}deg)`;
    })();
  });
};

// =================================================================
// =================================================================
// =================================================================
// TEST BTN

const testBTN = document.querySelector(".test-btn");
const testBTN2 = document.querySelector(".test-btn2");

testBTN.addEventListener("click", async () => {
  console.log("clicked");
  const container = document.getElementById("grid-container");

  const plane = document.createElement("div");

  plane.classList.add("plane", "plane-svg", `planeId-${planeID}`);
  plane.style.position = "absolute";

  const initialX = landingPositions[27].left;
  const initialY = landingPositions[27].top;

  // Ustawienie transformacji
  plane.style.transform = `translateX(${initialX}px) translateY(${initialY}px) rotate(180deg)`;

  const newPlane = {
    planeID: planeID,
    X: initialX,
    Y: initialY,
    angle: 180, // to będzie trzeba zmienić bo jest na sztywno a mus byc zalezne od pasa
  };
  container.appendChild(plane);
  await fetchPlane(plane);

  allPlanes.push(newPlane);
  planeID++;
  console.log(allPlanes);

  // startPositionMonitoring(plane);

  const sequence = [
    { type: "move", dir: "left", px: 50 },
    { type: "turn", dir: "left" },
    { type: "move", dir: "down", px: 50 },
    // { type: "move", dir: "down", px: 50 },
    // { type: "turn", dir: "left" },
    // { type: "move", dir: "right", px: 50 },
    // { type: "move", dir: "right", px: 50 },
    // { type: "turn", dir: "left" },
    // { type: "move", dir: "up", px: 50 },
    // { type: "move", dir: "up", px: 50 },
    // { type: "move", dir: "up", px: 50 },
    // { type: "move", dir: "up", px: 50 },
    // { type: "move", dir: "up", px: 50 },
    // { type: "turn", dir: "left" },
    // { type: "move", dir: "left", px: 50 },
    // { type: "move", dir: "left", px: 50 },
    // { type: "turn", dir: "left" },
    // { type: "move", dir: "down", px: 50 },
    // { type: "move", dir: "down", px: 50 },
    // { type: "move", dir: "down", px: 50 },
    // { type: "turn", dir: "right" },
    // { type: "move", dir: "left", px: 500 },
  ];

  async function runSequence(id, plane, seq) {
    for (const step of seq) {
      if (step.type === "move") {
        await makeMove(id, plane, step.dir, step.px);
      }

      if (step.type === "turn") {
        await makeTurn(id, plane, step.dir);
      }
    }
  }

  await runSequence(newPlane.planeID, plane, sequence);
});

testBTN2.addEventListener("click", function () {
  console.log(allCells);
});

// =================================================================
// =================================================================
// =================================================================
// =================================================================
// =================================================================
// =================================================================
