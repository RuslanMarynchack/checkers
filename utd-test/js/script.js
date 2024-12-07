const selectors = {
    container: ".js-container-checkers",
    wrapper: ".js-checkers",
    cell: ".js-cell",
    figure: ".js-figure",
    finishBlock: ".js-checkers-finish",
    counterWhite: ".js-checkers-counter-white",
    counterBlack: ".js-checkers-counter-black",
    startWrapper: ".js-start-wrapper",
    firstMove: ".js-btn-first-move"
}

const classes = {
    active: "is-active",
    black: "is-black",
    focus: "is-focus",
    damka: "is-damka",
    hidden: "is-hidden"
}

// The size of the board is 8x8
const boardSize = 8;
const container = document.querySelector(selectors.container);
const wrapper = container.querySelector(selectors.wrapper);
let activeCell = null;
let nowTurn;

const directions = [
    {dx: -1, dy: -1}, // Вліво вгору
    {dx: -1, dy: 1},  // Вправо вгору
    {dx: 1, dy: -1},  // Вліво вниз
    {dx: 1, dy: 1}    // Вправо вниз
];

function handlerFirstMove() {
    const startWrapper = container.querySelector(selectors.startWrapper);

    if (!startWrapper) {
        return
    }

    const btnsFirstMove = [...container.querySelectorAll(selectors.firstMove)];

    btnsFirstMove.forEach((btn, _, btnsArr) => {
        btn.addEventListener('click', () => {
            nowTurn = btn.dataset.firtsMove;
            startWrapper.classList.remove(classes.active);

            startWrapper.addEventListener("transitionend", () => {
                document.body.classList.remove(classes.hidden);
            });

            createBoard();

            btnsArr.forEach(btn => {
                btn.classList.add(classes.hidden);
            });
        });
    });
}

handlerFirstMove();

function createBoard() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    const liters = ["a", "b", "c","d", "e", "f", "g", "h"];

    if(!wrapper) {
        return
    }

    let isBlack = false;

    for (let i=0; i<8; i++) {
        isBlack = !isBlack;

        for (let j=0; j<8; j++) {
            const cell = document.createElement('div');
            const cellInner = document.createElement('div');
            const coordination = `${numbers[i]}${liters[j]}`

            cell.classList.add('cell');
            cell.classList.add('js-cell');
            cell.setAttribute("data-coordination", coordination);
            cell.setAttribute("data-index", coordination);
            cellInner.classList.add('cell__inner');
            cell.appendChild(cellInner);
            isBlack = !isBlack;

            if (isBlack) {
                cell.classList.add(classes.black);
            }

            wrapper.appendChild(cell);
        }
    }

    handlerPositionFigure();
    handlerActiveCourse();
    handlerTransitionIntoCell();
}

function handlerPositionFigure() {
    const cells = [...document.querySelectorAll(`${selectors.cell}`)];

    cells.forEach((cell, index) => {
        cell.setAttribute("data-index", index)

        if (cell.classList.contains(classes.black)) {
            const figure = document.createElement('div');
            const cellInner = cell.querySelector('.cell__inner');

            figure.classList.add('cell__figure');
            figure.classList.add('js-figure');

            if (index > 24) {
                figure.classList.add(classes.black);
                figure.setAttribute("data-type", "black");
            } else {
                figure.setAttribute("data-type", "white");
            }

            if (index < 24 || index >= 40) {
                cellInner.appendChild(figure);
            }
        }
    });
}

// A function that receives active moves.
function getAvailableMoves(list, currentElement, index, addClassActive = true) {
    const figure = currentElement.querySelector(selectors.figure);

    if (!figure) {
        return;
    }

    handlerIsDamka(list);

    if (figure.dataset.type === nowTurn) {
        const isBlack = figure.dataset.type === "black";
        let captureAvailable = false;

        directions.forEach(direction => {
            if (figure.classList.contains(classes.damka)) {
                captureAvailable = captureAvailable || getAvailableMovesDamka(list, currentElement, index, direction.dx, direction.dy, addClassActive)
            } else {
                const baseOffsetIndex = index + (direction.dx * boardSize + direction.dy);
                const captureOffsetIndex = index + (2 * direction.dx * boardSize + 2 * direction.dy);
                const baseOffset = list[baseOffsetIndex];
                const captureOffset = list[captureOffsetIndex];

                if (baseOffset && baseOffset.querySelector(selectors.figure)) {
                    const baseFigure = baseOffset.querySelector(selectors.figure);

                    if (baseFigure && baseFigure.dataset.type !== figure.dataset.type && captureOffset && captureOffset.classList.contains(classes.black)) {
                        const captureFigure = captureOffset.querySelector(selectors.figure);

                        if (!captureFigure) {
                            captureAvailable = true;
                            baseOffset.classList.add(classes.focus);
                            addClassActive && captureOffset.classList.add(classes.active);
                        }
                    }
                }
            }
        });

        if (!captureAvailable) {
            directions.forEach((direction, i) => {
                if (i < 2 && isBlack || i >= 2 && !isBlack) {
                    if (figure.classList.contains(classes.damka)) {
                        captureAvailable = captureAvailable || getAvailableMovesDamka(list, currentElement, index, direction.dx, direction.dy, addClassActive);
                    } else {
                        const baseOffsetIndex = index + (direction.dx * boardSize + direction.dy);
                        const baseOffset = list[baseOffsetIndex];

                        if (baseOffset && !baseOffset.querySelector(selectors.figure) && baseOffset.classList.contains(classes.black)) {
                            addClassActive && baseOffset.classList.add(classes.active);
                        }
                    }
                }
            });
        }

        return captureAvailable
    }
}

function getAvailableMovesDamka(list, damka, index, dx, dy, addClassActive) {
    let captureAvailable = false;

    for (let i=1; i<list.length; i++) {
        const baseOffsetIndex = index + (i * dx * boardSize + i * dy);

        if (baseOffsetIndex < 0 || baseOffsetIndex >= list.length) {
            break
        }

        const baseOffset = list[baseOffsetIndex];

        if (!baseOffset) {
            break
        }

        const baseOffsetFigure = baseOffset.querySelector(selectors.figure);

        if (baseOffset && baseOffset.classList.contains(classes.black)) {
            if (!baseOffsetFigure) {
                addClassActive && baseOffset.classList.add(classes.active);
            } else {
                if (baseOffsetFigure.dataset.type !== nowTurn) {
                    const captureIndex = baseOffsetIndex + (dx * boardSize + dy);
                    const captureOffset = list[captureIndex];

                    if (captureOffset && !captureOffset.querySelector(selectors.figure) && captureOffset.classList.contains(classes.black)) {
                        captureAvailable = true;
                        removeClasses();
                        addClassActive && captureOffset.classList.add(classes.active);
                        baseOffset.classList.add(classes.focus);
                        console.log(captureOffset)
                    }
                }
            }

            if (captureAvailable) break
        }
    }

    return captureAvailable
}

function getAvailableStrikeMoves(list, activeCell, activeIndex) {
    const strikeMoves = [];

    list.forEach((cell, index) => {
        const cellFigure = cell.querySelector(selectors.figure);

        if (cellFigure) {
            const captureAvailable = getAvailableMoves(list, cell, index, false);

            if (captureAvailable) {
                strikeMoves.push(cell);
            }
        }
    });

    if (strikeMoves.length > 0) {
        strikeMoves.forEach(cell => {
            if (activeCell === cell) getAvailableMoves(list, cell, activeIndex);
        });
    } else {
        getAvailableMoves(list, activeCell, activeIndex);
    }
}

function handlerActiveCourse() {
    const cells = [...wrapper.querySelectorAll(selectors.cell)];

    cells.forEach((cell, index) => {
        cell.addEventListener('click', function() {
            const figure = cell.querySelector(selectors.figure);

            if (figure && figure.dataset.type === nowTurn) {
                removeClasses();

                activeCell = this;
                getAvailableStrikeMoves(cells, activeCell, index);
            }
        });
    });
}

// We roll the checker into another cell.
function handlerTransitionIntoCell() {
    const cells = [...wrapper.querySelectorAll(selectors.cell)];

    wrapper.addEventListener('click', function(e) {
        const cell = e.target.closest(selectors.cell);

        if (!cell || !activeCell) {
            return
        }

        const cellIndex = +cell.dataset.index;
        const activeIndex = +activeCell.dataset.index;
        const figure = activeCell.querySelector(selectors.figure);

        if (cell.classList.contains(classes.active)) {
            const activeCellFigure = activeCell.querySelector(selectors.figure);
            let isCapture = false;

            activeCellFigure.remove();
            cell.querySelector('.cell__inner').append(figure);

            const cellsBetween = [];
            const startRow = Math.floor(activeIndex / boardSize);
            const startCol = activeIndex % boardSize;
            const endRow = Math.floor(cellIndex / boardSize);
            const endCol = cellIndex % boardSize;

            const dx = Math.sign(endCol - startCol);
            const dy = Math.sign(endRow - startRow);

            let currentRow = startRow + dy;
            let currentCol = startCol + dx;

            while (currentRow !== endRow && currentCol !== endCol) {
                const cellIndex = currentRow * boardSize + currentCol;

                if (cellIndex >= 0 && cellIndex < cells.length) {
                    cellsBetween.push(cells[cellIndex]);
                }

                currentRow += dy;
                currentCol += dx;
            }

            removeClasses();

            cellsBetween.forEach(captureCell => {
                const captureFigure = captureCell.querySelector(selectors.figure);

                if (captureFigure) {
                    if (captureFigure.dataset.type !== nowTurn) captureFigure.remove();

                    removeClasses();
                    getAvailableMoves(cells, cell, cellIndex, false);

                    isCapture = cells.some(cell => cell.classList.contains(classes.focus));
                    handlerCounter();
                }
            });

            if (isCapture) {
                nowTurn = figure.dataset.type;
                return
            }

            nowTurn = figure.dataset.type === "black" ? "white" : "black";

            cells.forEach((cell, index, arr) => getAvailableMoves(arr, cell, index, false));
        }
    });
}

function handlerIsDamka(list) {
    const isPlacesWhite = ["1b", "1d", "1f", "1h"];
    const isPlacesBlack = ["8a", "8c", "8e", "8g"];

    list.forEach(cell => {
        const cellFigure = cell.querySelector(selectors.figure);

        if (isPlacesWhite.includes(cell.dataset.coordination) && cellFigure && cellFigure.dataset.type === "black") {
            cellFigure.classList.add(classes.damka);
        } else if (isPlacesBlack.includes(cell.dataset.coordination) && cellFigure && cellFigure.dataset.type === "white") {
            cellFigure.classList.add(classes.damka);
        }
    });
}

// We count how many checkers are broken on each side.
function handlerCounter() {
    const finishBlock = container.querySelector(selectors.finishBlock);
    const counterWhiteWrapper = container.querySelector(selectors.counterWhite);
    const counterBlackWrapper = container.querySelector(selectors.counterBlack);

    if (!counterWhiteWrapper || !counterBlackWrapper) {
        return;
    }

    const figureWhite = wrapper.querySelectorAll(`${selectors.figure}[data-type="white"]`);
    const figureBlack = wrapper.querySelectorAll(`${selectors.figure}[data-type="black"]`);
    const startFigures = 12;
    const counterWhite = startFigures - figureWhite.length;
    const counterBlack = startFigures - figureBlack.length;

    counterWhiteWrapper.innerHTML = `${counterWhite}`;
    counterBlackWrapper.innerHTML = `${counterBlack}`;

    if (!finishBlock) {
        return;
    }

    if (counterWhite === startFigures) {
        finishBlock.innerHTML += "Black";
    } else if (counterBlack === startFigures) {
        finishBlock.innerHTML += "White";
    }

    if (counterWhite === startFigures || counterBlack === startFigures) finishBlock.classList.add(classes.active);
}

function removeClasses() {
    wrapper.querySelectorAll(selectors.cell).forEach(cell => {
        cell.classList.remove(classes.active, classes.focus);
    });
}