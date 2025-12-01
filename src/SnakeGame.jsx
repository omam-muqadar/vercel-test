import { useState, useEffect, useRef } from 'react'
import './SnakeGame.css'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const GAME_SPEED = 150

const FRUITS = [
  { type: 'apple', emoji: '🍎', points: 10, color: '#ff4444' },
  { type: 'banana', emoji: '🍌', points: 15, color: '#ffeb3b' },
  { type: 'grape', emoji: '🍇', points: 20, color: '#9c27b0' },
  { type: 'orange', emoji: '🍊', points: 25, color: '#ff9800' },
  { type: 'watermelon', emoji: '🍉', points: 30, color: '#4caf50' },
  { type: 'strawberry', emoji: '🍓', points: 35, color: '#e91e63' }
]

function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [fruit, setFruit] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const directionRef = useRef(direction)
  const gameLoopRef = useRef(null)

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }
  }, [])

  // Generate random fruit
  const generateFruit = () => {
    const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)]
    const newFruit = {
      ...randomFruit,
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    setFruit(newFruit)
  }

  // Initialize fruit
  useEffect(() => {
    if (!fruit) {
      generateFruit()
    }
  }, [fruit])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return

      const key = e.key.toLowerCase()

      if (key === ' ') {
        e.preventDefault()
        setIsPaused(prev => !prev)
        return
      }

      const newDirection = { ...directionRef.current }

      switch (key) {
        case 'arrowup':
        case 'w':
          if (directionRef.current.y === 0) {
            newDirection.x = 0
            newDirection.y = -1
          }
          break
        case 'arrowdown':
        case 's':
          if (directionRef.current.y === 0) {
            newDirection.x = 0
            newDirection.y = 1
          }
          break
        case 'arrowleft':
        case 'a':
          if (directionRef.current.x === 0) {
            newDirection.x = -1
            newDirection.y = 0
          }
          break
        case 'arrowright':
        case 'd':
          if (directionRef.current.x === 0) {
            newDirection.x = 1
            newDirection.y = 0
          }
          break
        default:
          return
      }

      directionRef.current = newDirection
      setDirection(newDirection)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver])

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0]
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y
        }

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true)
          return prevSnake
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          return prevSnake
        }

        const newSnake = [newHead, ...prevSnake]

        // Check fruit collision
        if (fruit && newHead.x === fruit.x && newHead.y === fruit.y) {
          setScore(prevScore => {
            const newScore = prevScore + fruit.points
            if (newScore > highScore) {
              setHighScore(newScore)
              localStorage.setItem('snakeHighScore', newScore.toString())
            }
            return newScore
          })
          generateFruit()
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, GAME_SPEED)

    return () => clearInterval(gameLoopRef.current)
  }, [gameOver, isPaused, fruit, highScore])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
    generateFruit()
  }

  return (
    <div className="snake-game-container">
      <h1>Snake Game</h1>

      <div className="game-info">
        <div className="score-display">
          <span className="score-label">Score:</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="score-display">
          <span className="score-label">High Score:</span>
          <span className="score-value">{highScore}</span>
        </div>
      </div>

      <div className="game-board-wrapper">
        <div
          className="game-board"
          style={{
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`
          }}
        >
          {/* Render snake */}
          {snake.map((segment, index) => (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`snake-segment ${index === 0 ? 'snake-head' : ''}`}
              style={{
                left: `${segment.x * CELL_SIZE}px`,
                top: `${segment.y * CELL_SIZE}px`,
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`
              }}
            />
          ))}

          {/* Render fruit */}
          {fruit && (
            <div
              className="fruit"
              style={{
                left: `${fruit.x * CELL_SIZE}px`,
                top: `${fruit.y * CELL_SIZE}px`,
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`
              }}
              title={`${fruit.type} (+${fruit.points} points)`}
            >
              {fruit.emoji}
            </div>
          )}

          {/* Game over overlay */}
          {gameOver && (
            <div className="game-overlay">
              <div className="game-message">
                <h2>Game Over!</h2>
                <p>Final Score: {score}</p>
                {score === highScore && score > 0 && (
                  <p className="new-high-score">New High Score!</p>
                )}
                <button onClick={resetGame} className="restart-button">
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Pause overlay */}
          {isPaused && !gameOver && (
            <div className="game-overlay">
              <div className="game-message">
                <h2>Paused</h2>
                <p>Press SPACE to continue</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="game-controls">
        <button onClick={() => setIsPaused(!isPaused)} disabled={gameOver}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={resetGame}>Restart</button>
      </div>

      <div className="game-instructions">
        <h3>How to Play:</h3>
        <ul>
          <li>Use Arrow Keys or WASD to control the snake</li>
          <li>Press SPACE to pause/resume</li>
          <li>Eat fruits to grow and earn points:</li>
        </ul>
        <div className="fruit-legend">
          {FRUITS.map(f => (
            <div key={f.type} className="fruit-info">
              <span className="fruit-emoji">{f.emoji}</span>
              <span className="fruit-name">{f.type}</span>
              <span className="fruit-points">+{f.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SnakeGame
