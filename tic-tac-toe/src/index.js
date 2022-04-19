import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  const className =
    "square " + (props.isWinnerTraceSquare ? "winner-trace" : "");
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function ChangeSortOrder(props) {
  return (
    <button className="change-order" onClick={props.onClick}>
      Sort {props.value ? "ASC" : "DESC"}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isWinnerTraceSquare) {
    return (
      <Square
        value={this.props.squares[i]}
        key={`square-${i}`}
        isWinnerTraceSquare={isWinnerTraceSquare}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let board = [];
    for (let row = 0; row < 3; row++) {
      let squares = [];
      for (let col = 0; col < 3; col++) {
        const i = row * 3 + col;
        let isWinnerTraceSquare = this.props.winnerTrace.includes(i);
        squares.push(this.renderSquare(i, isWinnerTraceSquare));
      }
      board.push(
        <div key={`row-${row}`} className="board-row">
          {squares}
        </div>
      );
    }
    return <div>{board}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.BORDER_SIZE = 3;
    this.state = {
      history: [
        {
          squares: Array(this.BORDER_SIZE ** 2).fill(null),
          coords: { col: -1, row: -1 },
        },
      ],
      xIsNext: true,
      stepNumber: 0,
      isSortOrderAsc: true,
    };
  }

  handleClick(i) {
    const stepNumber = this.state.stepNumber;
    const history = this.state.history.slice(0, stepNumber + 1);
    const current = history[stepNumber];
    const squares = current.squares.slice();
    const isDraw = calculateDraw(stepNumber, this.BORDER_SIZE);
    if (calculateWinner(squares) || isDraw || squares[i]) {
      return;
    }
    const coords = {
      col: i % this.BORDER_SIZE,
      row: parseInt(i / this.BORDER_SIZE),
    };
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{ squares: squares, coords: coords }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      selectedStepNumber: null,
    });
  }

  handleChangeSortOrderClick(isSortOrderAsc) {
    this.setState({
      isSortOrderAsc: !isSortOrderAsc,
    });
  }

  jumpToMove(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
      selectedStepNumber: step,
    });
  }

  render() {
    const { stepNumber, isSortOrderAsc, selectedStepNumber } = this.state;
    const history = this.state.history.slice();
    const current = history[stepNumber];
    const winner = calculateWinner(current.squares);
    const isDraw = calculateDraw(stepNumber, this.BORDER_SIZE);

    let moves = history.map((step, move) => {
      const { col, row } = step.coords;
      const isSelectedStep = move === selectedStepNumber;
      const desc = move
        ? `Go to move #${move} at ${col}:${row}`
        : "Go to game start";
      return (
        <li key={move}>
          <button
            className={isSelectedStep ? "selected-step" : ""}
            onClick={() => this.jumpToMove(move)}
          >
            {desc}
          </button>
        </li>
      );
    });

    if (!isSortOrderAsc) {
      moves = [].concat(moves[0], moves.slice(1).reverse());
    }

    let status;
    if (isDraw) {
      status = `Draw. Start over /*TO-DO*/`;
    } else if (winner) {
      status = `Winner is ${winner.team}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerTrace={winner?.trace ?? []}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>
            <ChangeSortOrder
              value={this.state.isSortOrderAsc}
              onClick={() =>
                this.handleChangeSortOrderClick(this.state.isSortOrderAsc)
              }
            />
          </div>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { team: squares[a], trace: lines[i] };
    }
  }
  return null;
}

function calculateDraw(stepNumber, borderSize) {
  return stepNumber === borderSize ** 2;
}
