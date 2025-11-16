"use strict";

// =================================================================
// 1. GLOBALNE STAŁE I FUNKCJE (BEZ DUPLIKATÓW)
// =================================================================

const CONTAINER = document.getElementById("grid-container");
const COLS = 16;
const ROWS = 16;
const CELL_SIZE = 50; // JEDNA DEFINICJA
const GRID_SIZE = 16; // JEDNA DEFINICJA
let monitorIntervalID = null;
let allPlanes = [];

const gridData = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1,
  1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0,
  1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1,
  0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0,
  0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0,
  1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0,
  0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 2, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
  0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
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

    CONTAINER.appendChild(cell);
  }
}

// Funkcja do wypełniania komórki
function fillMyCell(content, className, row, col) {
  const index = (row - 1) * COLS + (col - 1);
  const targetCell = document.getElementById(`cell-${index}`);

  targetCell.innerHTML = "";
  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = content;
  contentDiv.classList.add(className);
  targetCell.appendChild(contentDiv);
}

// Definicje położeń
const landingPositions = {
  "18L": { left: 200, top: 50 },
  "18R": { left: 350, top: 150 },
  "36L": { left: 200, top: 750 },
  "36R": { left: 350, top: 750 },
  "09": { left: 50, top: 300 },
  27: { left: 650, top: 275 },
};

// Funkcja do oznaczania położeń
const makeMarks = function () {
  Object.entries(landingPositions).forEach(([planeId, coords]) => {
    const mark = document.createElement("div");
    mark.classList.add("mark");
    mark.style.position = "absolute";
    mark.style.left = `${coords.left}px`;
    mark.style.top = `${coords.top}px`;

    CONTAINER.appendChild(mark);
  });
};

createGrid();
makeMarks();

const landingAngle = {
  left: 180,
  right: 1,
  up: -90,
  down: 90,
};

const testBTN = document.querySelector(".test-btn");
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

const makeMove = function (id, plane, direction, distance) {
  return new Promise((resolve) => {
    const planeData = allPlanes.find((p) => p.planeID === id);

    let currentX = planeData.X;
    let currentY = planeData.Y;
    let currentAngle = planeData.angle;

    let newX = currentX;
    let newY = currentY;
    let newAngle = currentAngle;
    let needsRotation = false;

    newAngle = landingAngle[direction] || currentAngle;

    if (planeData.angle !== newAngle) {
      needsRotation = true;
    }

    if (direction === "left") {
      newX = currentX - distance;
    } else if (direction === "right") {
      newX = currentX + distance;
    } else if (direction === "up") {
      newY = currentY - distance;
    } else if (direction === "down") {
      newY = currentY + distance;
    } else {
      return resolve();
    }

    if (newX === currentX && newY === currentY && newAngle === currentAngle) {
      return resolve();
    }

    planeData.X = newX;
    planeData.Y = newY;
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

      plane.style.transform = `translateX(${newX}px) translateY(${newY}px) rotate(${newAngle}deg)`;
    };

    if (needsRotation) {
      const onRotationEnd = (event) => {
        if (
          event.propertyName === "transform" ||
          event.propertyName === "rotate"
        ) {
          plane.removeEventListener("transitionend", onRotationEnd);
          performMovement();
        }
      };
      plane.addEventListener("transitionend", onRotationEnd);

      // Wykonanie obrotu, utrzymując pozycję (currentX/Y)
      plane.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${newAngle}deg)`;
    } else {
      performMovement();
    }
  });
};

// =================================================================
// =================================================================
// =================================================================
// TEST BTN

testBTN.addEventListener("click", async () => {
  console.log("clicked");
  const container = document.getElementById("grid-container");

  const plane = document.createElement("div");

  plane.classList.add("plane", "plane-svg", `planeId-${planeID}`);

  plane.style.position = "absolute";

  const initialX = landingPositions[27].left;
  const initialY = landingPositions[27].top;

  // Ustawienie transformacji
  plane.style.transform = `translateX(${initialX}px) translateY(${initialY}px) rotate(${landingAngle.left}deg)`;

  container.appendChild(plane);
  await fetchPlane(plane);

  const newPlane = {
    planeID: planeID,
    X: initialX,
    Y: initialY,
    angle: landingAngle.left, // to będzie trzeba zmienić bo jest na sztywno a mus byc zalezne od pasa
  };

  allPlanes.push(newPlane);
  planeID++;
  console.log(allPlanes);

  // startPositionMonitoring(plane);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "left", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "down", 75);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "down", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "right", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "right", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "up", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "up", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "up", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "up", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "up", 50);
  console.log(getPlaneCellCoordinates(newPlane.planeID));
  await makeMove(newPlane.planeID, plane, "left", 50);

});

// =================================================================
// =================================================================
// =================================================================
// =================================================================
// =================================================================
// =================================================================

// OLD WAY

// const makeMove = function (plane, distance, direction, tSpeed) {
//   const speed = tSpeed;

//   return new Promise((resolve) => {
//     let x = parseInt(plane.style.left) || 0;
//     let y = parseInt(plane.style.top) || 0;

//     let targetX = x;
//     let targetY = y;

//     let angle = 0;
//     if (direction === "left") angle = 180;
//     else if (direction === "right") angle = 0;
//     else if (direction === "up") angle = -90;
//     else if (direction === "down") angle = 90;

//     if (direction === "left") targetX = x - distance;
//     else if (direction === "right") targetX = x + distance;
//     else if (direction === "up") targetY = y - distance;
//     else if (direction === "down") targetY = y + distance;
//     else return resolve();

//     function animate() {
//       let dx = targetX - x;
//       let dy = targetY - y;

//       if (Math.abs(dx) > speed) x += dx > 0 ? speed : -speed;
//       else x = targetX;

//       if (Math.abs(dy) > speed) y += dy > 0 ? speed : -speed;
//       else y = targetY;

//       plane.style.left = x + "px";
//       plane.style.top = y + "px";
//       plane.style.transform = `rotate(${angle}deg)`;

//       if (x !== targetX || y !== targetY) {
//         requestAnimationFrame(animate);
//       } else {
//         resolve();
//       }
//     }

//     animate();
//   });
// };

// const makeTurn = function (plane, direction) {
//   const speed = 2;

//   return new Promise((resolve) => {
//     const style = window.getComputedStyle(plane);
//     let transform = style.transform;

//     let angle = 0;
//     if (transform && transform !== "none") {
//       const values = transform.match(/matrix\((.+)\)/)[1].split(", ");
//       const a = parseFloat(values[0]);
//       const b = parseFloat(values[1]);
//       angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
//     }

//     let targetAngle = angle;
//     if (direction === "left") targetAngle -= 90;
//     else if (direction === "right") targetAngle += 90;
//     else return resolve();

//     function animate() {
//       const diff = targetAngle - angle;
//       if (Math.abs(diff) > speed) {
//         angle += diff > 0 ? speed : -speed;
//         plane.style.transform = `rotate(${angle}deg)`;
//         requestAnimationFrame(animate);
//       } else {
//         angle = targetAngle;
//         plane.style.transform = `rotate(${angle}deg)`;
//         resolve();
//       }
//     }

//     animate();
//   });
// };

// const takeOf = async (plane, direction) => {
//   let distance = 10;
//   let speed = 1;

//   for (let i = 0; i < 40; i++) {
//     distance = distance + 5;
//     speed = speed + 0.5;
//     await makeMove(plane, distance, direction, speed);
//   }
// };

// const landing = async (plane, direction) => {
//   if (direction === "left") {
//     plane.style.left = "1200px";
//   }
//   let distance = 20;
//   let speed = 20;

//   for (let i = 0; i < 63; i++) {
//     speed = speed - 0.3;
//     distance = distance - 0.1;
//     await makeMove(plane, distance, direction, speed);
//   }
// };
