import { app } from 'hyperapp'
import { withFx, delay, action, keydown } from '@hyperapp/fx'
import { g, rect, svg, text } from './svg';


const SIZE = 15
const WIDTH = SIZE * 40
const HEIGHT = SIZE * 27

const COLORS = {
	background: '#088c64',
	snake: {
		fill: '#bcaba0',
		stroke: '#706660',
	},
	apple: {
		fill: '#ff5a5f',
		stroke: '#b23e42',
	},
}

const UPDATE_INTERVAL = 150

const DIRECTIONS = {
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
}

const KEY_TO_DIRECTION = {
	ArrowUp: 'up',
	ArrowDown: 'down',
	ArrowLeft: 'left',
	ArrowRight: 'right',
}

const OPPOSITE_DIRECTION = {
	up: 'down',
	down: 'up',
	left: 'right',
	right: 'left',
}


const randInt = (from, to) =>
	Math.floor(Math.random() * (to - from) + from)

const createApple = () =>
	({
		x: randInt(0, WIDTH/SIZE) * SIZE,
		y: randInt(0, HEIGHT/SIZE) * SIZE,
	})

const state = {
	snake: [
		{ x: 3 * SIZE, y: 3 * SIZE},
		{ x: 2 * SIZE, y: 3 * SIZE},
		{ x: 1 * SIZE, y: 3 * SIZE},
	],
	direction: 'right',
	next_direction: 'right',
	apple: createApple(),
	score: 0,
	is_running: true,
}

const actions = {
	// Game lifecycle
	start: () => [
		keydown('keyPressed'),
		action('frame'),
	],
	frame: () => [
		action('updateDirection'),
		action('updateSnake'),
		action('checkEatApple'),
		action('continue'),
	],
	continue: () => state =>
		(isOutOfBounds(state.snake[0]) || selfCollision(state.snake)
			? action('updateIsRunning', false)
			: delay(UPDATE_INTERVAL, 'frame')
		),
	// Update
	updateSnake: () => state => ({
		...state,
		snake: updateSnake(state.snake, state.direction),
	}),
	updateDirection: () => state => ({
		...state,
		direction: state.next_direction,
	}),
	checkEatApple: () => state =>
		(collision(state.snake[0], state.apple)
			? [ action('eatApple'),
				action('relocateApple'),
				action('updateScore', 10) ]
			: []
		),
	eatApple: () => state => ({
		...state,
		snake: growSnake(state.snake),
	}),
	relocateApple: () => state => ({
		...state,
		apple: createApple(),
	}),
	updateScore: value => state => ({
		...state,
		score: state.score + value
	}),
	updateIsRunning: value => state => ({
		...state,
		is_running: value,
	}),
	// Keyboard
	keyPressed: ({ key }) =>
		(Object.keys(KEY_TO_DIRECTION).includes(key)
			? [ action('changeDirection', KEY_TO_DIRECTION[key]) ]
			: []
		),
	changeDirection: direction => state => ({
		...state,
		next_direction: (direction === OPPOSITE_DIRECTION[state.direction]
			? state.next_direction
			: direction
		)
	}),
}

const collision = (a, b) =>
	a.x === b.x && a.y === b.y

const isOutOfBounds = ({ x, y }) =>
	x < 0 || x > WIDTH || y < 0 || y > HEIGHT

const selfCollision = ([ head, ...tail ]) =>
	tail.some(({ x, y }) =>
		x === head.x && y === head.y
	)

const updateSnake = (snake, direction) => {
	for (let i = snake.length - 1; i > 0; i--) {
		snake[i].x = snake[i - 1].x
		snake[i].y = snake[i - 1].y
	}

	snake[0].x += SIZE * DIRECTIONS[direction].x
	snake[0].y += SIZE * DIRECTIONS[direction].y

	return snake
}

const growSnake = snake =>
	[ ...snake, {
		x: snake[snake.length - 1].x,
		y: snake[snake.length - 1].y,
	}]

const view = state =>
	svg({ viewBox: `0 0 ${WIDTH} ${HEIGHT}`, width: WIDTH, height: HEIGHT}, [
		Background(),
		Apple(state.apple),
		Snake(state.snake),
		state.is_running
            ? Score(state.score)
            : GameOver(state.score),
	])

const Background = () =>
	g({ key: 'background' }, [
		rect({ x: 0, y: 0, width: WIDTH, height: HEIGHT, fill: COLORS.background }),
	])

const Snake = state =>
	g({ key: 'snake' },
		state.map(({ x, y }) => rect({
			x, y, width: SIZE, height: SIZE,
			fill: COLORS.snake.fill,
			stroke: COLORS.snake.stroke,
			'stroke-width': 2
		}))
	)

const Apple = ({ x, y }) =>
	g({ key: 'apple' }, [
		rect({
			x, y, width: SIZE, height: SIZE,
			fill: COLORS.apple.fill,
			stroke: COLORS.apple.stroke,
			'stroke-width': 2
		})
	])

const score_style = {
	font: 'bold 20px sans-seriff',
	fill: '#fff',
	opacity: 0.8,
}

const Score = state =>
	g({ key: 'score' }, [
		text({
			style: score_style,
			x: 5,
			y: 20,
		}, state)
	])

const game_over_style = {
	title: {
		font: 'bold 48px sans-seriff',
		fill: '#fff',
		opacity: 0.8,
		'text-anchor': 'middle',
	},
	score: {
		font: '30px sans-seriff',
		fill: '#fff',
		opacity: 0.8,
		'text-anchor': 'middle',
	}
}

const GameOver = score =>
	g({ key: 'game-over'}, [
		rect({
			x: 0, y: 0, width: WIDTH, height: HEIGHT,
			fill: '#000',
			opacity: 0.4,
		}),
		text({
			style: game_over_style.title,
			x: WIDTH/2, y: 100,
		}, 'Game Over'),
		text({
			style: game_over_style.score,
			x: WIDTH/2, y: 160,
		}, `Score: ${score}`),
	])

const game = withFx(app) (state, actions, view, document.body)

game.start()
