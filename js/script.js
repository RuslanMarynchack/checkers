const selectors = {
    container: ".js-container-checkers",
    wrapper: ".js-checkers",
    cell: ".js-cell",
    figure: ".js-figure",
    figureWhite: ".js-figure[data-type='white']",
    figureBlack: ".js-figure[data-type='black']",
    finishBlock: ".js-checkers-finish",
    counterWhite: ".js-checkers-counter-white",
    counterBlack: ".js-checkers-counter-black",
    firstMove: ".js-btn-first-move"
}

const classes = {
    active: "is-active",
    black: "is-black",
    focus: "is-focus",
    damka: "is-damka"
}

const boardSize = 8; // The size of the board is 8x8
const container = document.querySelector(selectors.container);
const wrapper = container.querySelector(selectors.wrapper);
let activeCell = null;
let chainTake = null;
let currentMove = "white";
let globalAvailableTypeMoves = false;

const directions = [
    {dx: -1, dy: -1}, // Left up
    {dx: -1, dy: 1},  // Right up
    {dx: 1, dy: -1},  // Left down
    {dx: 1, dy: 1}    // Right down
];

// We generate a board
function createBoard() {
    if(!wrapper) {
        return
    }

    let isBlack = false;

    for (let i=0; i<8; i++) {
        isBlack = !isBlack;

        for (let j=0; j<8; j++) {
            const cell = document.createElement('div');
            const cellInner = document.createElement('div');

            cell.classList.add('cell', 'js-cell');
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
    handlerMovesCheckers();
}

createBoard();

// We generate figures and add them to the board
function handlerPositionFigure() {
    const cells = [...document.querySelectorAll(`${selectors.cell}`)];

    cells.forEach((cell, index) => {
        cell.setAttribute("data-index", index)

        if (cell.classList.contains(classes.black)) {
            const figure = document.createElement('div');
            const cellInner = cell.querySelector('.cell__inner');

            figure.classList.add('cell__figure', 'js-figure');

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
function getAvailableMoves(list, currentCell, index, addClassActive = true) {
    const figure = currentCell.querySelector(selectors.figure);

    if (!figure) {
        return;
    }

    handlerIsDamka(list);

    if (figure.dataset.type === currentMove) {
        let captureAvailable = false;

        directions.forEach((direction, i) => {
            if (figure.classList.contains(classes.damka)) {
                captureAvailable = getAvailableMovesDamka(list, currentCell, index, direction.dx, direction.dy, addClassActive) || captureAvailable;
            } else {
                captureAvailable = getAvailableMovesChess(list, currentCell, index, i, direction.dx, direction.dy, addClassActive) || captureAvailable;
            }
        });

        if (!captureAvailable) {
            directions.forEach((direction, i) => {
                if (figure.classList.contains(classes.damka)) {
                    captureAvailable = getAvailableMovesDamka(list, currentCell, index, direction.dx, direction.dy, addClassActive) || captureAvailable;
                } else {
                    captureAvailable = getAvailableMovesChess(list, currentCell, index, i, direction.dx, direction.dy, addClassActive) || captureAvailable;
                }
            });
        }

        return captureAvailable
    }
}

// We process moves for chess
function getAvailableMovesChess(list, cell, index, directionIndex, dx, dy, addClassActive) {
    let captureAvailable = false;

    const figure = cell.querySelector(selectors.figure);
    const isBlack = figure.dataset.type === "black";
    const baseOffsetIndex = index + (dx * boardSize + dy);
    const captureOffsetIndex = index + (2 * dx * boardSize + 2 * dy);
    const baseOffset = list[baseOffsetIndex];
    const captureOffset = list[captureOffsetIndex];

    if (baseOffsetIndex < 0 || baseOffsetIndex >= list.length) {
        return;
    }

    if (baseOffset && baseOffset.querySelector(selectors.figure)) {
        const baseFigure = baseOffset.querySelector(selectors.figure);

        if (baseFigure && baseFigure.dataset.type !== figure.dataset.type && captureOffset && captureOffset.classList.contains(classes.black)) {
            const captureFigure = captureOffset.querySelector(selectors.figure);

            if (!captureFigure) {
                addClassActive && captureOffset.classList.add(classes.active);

                captureAvailable = true;
                // if (baseFigure.dataset.type === currentMove) {
                    baseOffset.classList.add(classes.focus);
                // }
            }
        }
    }

    if (!captureAvailable) {
        const isCapture = list.some(cell => cell?.classList.contains(classes.focus));

        if ((directionIndex < 2 && isBlack) || (directionIndex >= 2 && !isBlack)) {
            const baseOffsetIndex = index + (dx * boardSize + dy);
            const baseOffset = list[baseOffsetIndex];

            if (baseOffsetIndex < 0 || baseOffsetIndex >= list.length || !baseOffset) {
                return;
            }

            const baseOffsetFigure = baseOffset.querySelector(selectors.figure);

            if (
                baseOffset &&
                baseOffset.classList.contains(classes.black) &&
                !baseOffset.querySelector(selectors.figure) &&
                !isCapture
            ) {
                addClassActive && baseOffset.classList.add(classes.active);
            }

            if (baseOffsetFigure) {
                return;
            }
        }
    }

    return captureAvailable;
}

// We process moves for damka
function getAvailableMovesDamka(list, damkaCell, index, dx, dy, addClassActive) {
    let captureAvailable = false;

    for (let i=1; i<8; i++) {
        const baseOffsetIndex = index + (i * dx * boardSize + i * dy);
        const baseOffset = list[baseOffsetIndex];

        if (baseOffsetIndex < 0 || baseOffsetIndex >= list.length || !baseOffset) {
            break
        }

        const baseOffsetFigure = baseOffset.querySelector(selectors.figure);

        if (!baseOffsetFigure) {
            if (captureAvailable) {
                addClassActive && baseOffset.classList.add(classes.active);
            }
        } else {
            if (baseOffsetFigure.dataset.type !== currentMove) {
                const captureIndex = baseOffsetIndex + (dx * boardSize + dy);
                const prevCaptureIndex = baseOffsetIndex + (-dx * boardSize + -dy);
                const captureOffset = list[captureIndex];
                const prevCaptureOffset = list[prevCaptureIndex];

                if (captureOffset && !captureOffset.querySelector(selectors.figure) && captureOffset.classList.contains(classes.black)) {
                    if (damkaCell !== prevCaptureOffset && prevCaptureOffset.querySelector(selectors.figure)) {
                        break
                    }

                    captureAvailable = true;

                    baseOffset.classList.add(classes.focus);
                }
            }
        }

        if (baseOffsetFigure && baseOffsetFigure.dataset.type === currentMove) {
            break
        }
    }

    if (!captureAvailable) {
        const isCapture = list.some(cell => cell?.classList.contains(classes.focus));

        for (let i=1; i<list.length; i++) {
            const baseOffsetIndex = index + (i * dx * boardSize + i * dy);
            const baseOffset = list[baseOffsetIndex];

            if (baseOffsetIndex < 0 || baseOffsetIndex >= list.length || !baseOffset) {
                break
            }

            const baseOffsetFigure = baseOffset.querySelector(selectors.figure);

            if (
                baseOffset &&
                baseOffset.classList.contains(classes.black) &&
                !baseOffset.querySelector(selectors.figure) &&
                !isCapture
            ) {
                addClassActive && baseOffset.classList.add(classes.active);
            }

            if (baseOffsetFigure) {
                break
            }
        }
    }

    return captureAvailable
}

// The function checks whether one of the sides has the opportunity to beat (then this side can only beat the desired checker) or just make a move.
function getAvailableStrikeMoves(list, activeCell, activeIndex) {
    const captureAvailableList = [];
    const cellToCheck = chainTake ? [chainTake] : list;

    cellToCheck.forEach(cell => {
        if (!cell) {
            return
        }

        const cellFigure = cell.querySelector(selectors.figure);
        const cellIndex = +cell.dataset.index;

        if (cellFigure) {
            const availableTypeMoves = getAvailableMoves(list, cell, cellIndex, false);

            if (availableTypeMoves) {
                captureAvailableList.push(cell);
            }
        }
    });

    if (captureAvailableList.length > 0) {
        captureAvailableList.forEach(cell => {
            if (cell === activeCell) getAvailableMoves(list, activeCell, activeIndex);
        });
    } else {
        getAvailableMoves(list, activeCell, activeIndex)
    }
}

// We roll the checker into another cell.
function handlerMovesCheckers() {
    const cells = [...wrapper.querySelectorAll(selectors.cell)];
    let isLastMoveCellIndex;

    const cellsBlack = cells.map(cell => {
        if (!cell.classList.contains(classes.black)) {
            cell = null
        }
        return cell
    });

    wrapper.addEventListener('click', function(e) {
        const cell = e.target.closest(selectors.cell);

        if (!cell) {
            return;
        }

        cellsBlack.forEach(cellBlack => {
            if (cellBlack && cell === cellBlack) {
                const figure = cell.querySelector(selectors.figure);

                if (figure && figure.dataset.type === currentMove) {
                    removeClasses();

                    activeCell = cellBlack;

                    getAvailableStrikeMoves(cellsBlack, activeCell, +cellBlack.dataset.index);
                }
            }
        })

        if (!activeCell) {
            return;
        }

        const figureActive = activeCell.querySelector(selectors.figure);
        const isCellActive = cell.classList.contains(classes.active);

        if (!isCellActive) {
            isLastMoveCellIndex = +cell.dataset.index;
        }

        if (isCellActive) {
            const cellIndex = +cell.dataset.index;
            const fromCol = isLastMoveCellIndex % boardSize;
            const toCol = cellIndex % boardSize;
            const isMovingRight = toCol > fromCol;
            const boardSizePlus = boardSize + 1;
            const boardSizeMinus = boardSize - 1;
            let isDirection;
            let attackedFigure = null;
            // let isCapture = false;

            cell.querySelector('.cell__inner').append(figureActive);

            if (isLastMoveCellIndex < cellIndex) {
                isDirection = isMovingRight ? boardSizePlus : boardSizeMinus;
            } else {
                isDirection = isMovingRight ? boardSizeMinus : boardSizePlus;
            }

            for (let i=0; i<8; i++) {
                const index = cellIndex > isLastMoveCellIndex ? i : -i;
                const localIndex = cellIndex - (index * isDirection);

                if (isLastMoveCellIndex !== localIndex) {
                    if (+cell.dataset.index !== localIndex) {
                        const attackedCell = cells[localIndex]?.classList.contains(classes.focus);

                        if (attackedCell) {
                            attackedFigure = cells[localIndex].querySelector(selectors.figure);

                            if (attackedFigure) {
                                attackedFigure.remove();
                            }
                        }
                    }
                } else {
                    break
                }
            }

            removeClasses();
            getAvailableMoves(cells, cell, cellIndex, false);

            const isCapture = cells.some(cellFocus => attackedFigure && cellFocus.classList.contains(classes.focus));

            chainTake = cell;

            if (isCapture) {
                currentMove = figureActive.dataset.type;
                return
            }

            chainTake = null;
            currentMove = figureActive.dataset.type === "black" ? "white" : "black";
            removeClasses();
            cells.forEach((cell, index, arr) => getAvailableMoves(arr, cell, index, false));
        }

        handlerCounter(cells);
    });
}

// If the checker is in the desired cell, we make a damka out of it.
function handlerIsDamka(list) {
    const isPlacesWhite = [1, 3, 5, 7];
    const isPlacesBlack = [56, 58, 60, 62];

    list.forEach(cell => {
        if (!cell) {
            return
        }

        const cellFigure = cell.querySelector(selectors.figure);

        if (!cellFigure) {
            return;
        }

        const figureType = cellFigure.dataset.type;
        const cellIndex = +cell.dataset.index;

        if (
            (isPlacesWhite.includes(cellIndex) && figureType === "black") ||
            (isPlacesBlack.includes(cellIndex) && figureType === "white")
        ) {
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

    const figureWhite = wrapper.querySelectorAll(selectors.figureWhite);
    const figureBlack = wrapper.querySelectorAll(selectors.figureBlack);
    const startFigures = 12;
    const counterWhite = startFigures - figureWhite.length;
    const counterBlack = startFigures - figureBlack.length;

    if (+counterWhiteWrapper.innerHTML !== counterWhite) {
        counterWhiteWrapper.innerHTML = `${counterWhite}`;
    } else if (+counterBlackWrapper.innerHTML !== counterBlack) {
        counterBlackWrapper.innerHTML = `${counterBlack}`;
    }

    if (!finishBlock) {
        return;
    }

    if (counterWhite === startFigures) {
        finishBlock.innerHTML += "Black";
    } else if (counterBlack === startFigures) {
        finishBlock.innerHTML += "White";
    }

    // We add the is-active class for the block when all checkers are defeated in one of the sides.
    if (counterWhite === startFigures || counterBlack === startFigures) {
        finishBlock.classList.add(classes.active);
    }
}

// We delete classes.
function removeClasses() {
    wrapper.querySelectorAll(selectors.cell).forEach(cell => {
        cell.classList.remove(classes.active, classes.focus);
    });
}