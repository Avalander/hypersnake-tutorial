import { app } from 'hyperapp'
import { withFx, delay, action, keydown } from '@hyperapp/fx'
import { g, rect, svg, text } from './svg'


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

const DIRECTIONS = {
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
}

const KEY_TO_ACTION = {
	ArrowUp: () => action('changeDirection', 'up'),
	ArrowDown: () => action('changeDirection', 'down'),
	ArrowLeft: () => action('changeDirection', 'left'),
	ArrowRight: () => action('changeDirection', 'right'),
	r: () => action('restartIfOver'),
}

const OPPOSITE_DIRECTION = {
	up: 'down',
	down: 'up',
	left: 'right',
	right: 'left',
}

const APPLE_POINTS =
	[ 0, 5, 5, 10, 10, 10, 10, 10, 10, 20, 20, 30 ]


const randInt = (from, to) =>
	Math.floor(Math.random() * (to - from) + from)

const choose = options =>
	options[randInt(0, options.length)]

const max = (a, b) =>
	a > b ? a : b

const randomPoint = () =>
	({
		x: randInt(0, WIDTH/SIZE) * SIZE,
		y: randInt(0, HEIGHT/SIZE) * SIZE,
	})

const ensureNotForbidden = (forbidden, point) =>
	(forbidden.some(cell => collision(point, cell))
		? ensureNotForbidden(forbidden, randomPoint())
		: point
	)

const withScore = point =>
	({
		...point,
		score: choose(APPLE_POINTS),
	})

const createApple = snake =>
	withScore(
		ensureNotForbidden(snake, randomPoint())
	)

const initState = () => ({
	snake: [
		{ x: 3 * SIZE, y: 3 * SIZE },
		{ x: 2 * SIZE, y: 3 * SIZE },
		{ x: 1 * SIZE, y: 3 * SIZE },
	],
	direction: 'right',
	next_direction: 'right',
	apple: { x: 20 * SIZE, y: 4 * SIZE, score: 10 },
	score: 0,
	is_running: true,
	update_interval: 150,
})

const state = initState()

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
		(isOutOfBounds(state.snake[0]) || selfCollision(state.snake)
			? action('updateIsRunning', false)
			: delay(state.update_interval, 'frame')
		),
	restartIfOver: () => state =>
		(state.is_running
			? []
			: [ action('reset'),
				action('frame')]
		),
	reset: () => state => initState(),
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
				action('updateScore', state.apple.score),
				action('updateSpeed', state.score) ]
			: []
		),
	eatApple: () => state => ({
		...state,
		snake: growSnake(state.snake),
	}),
	relocateApple: () => state => ({
		...state,
		apple: createApple(state.snake),
	}),
	updateScore: value => state => ({
		...state,
		score: state.score + value
	}),
	updateSpeed: old_score => state => ({
		...state,
		update_interval: (Math.floor(state.score / 100) > Math.floor(old_score / 100)
			? max(50, state.update_interval - 10)
			: state.update_interval)
	}),
	updateIsRunning: value => state => ({
		...state,
		is_running: value,
	}),
	// Keyboard
	keyPressed: ({ key }) =>
		(Object.keys(KEY_TO_ACTION).includes(key)
			? KEY_TO_ACTION[key]()
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

const isOutOfBounds = ({ x, y }) =>
	x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT

const selfCollision = ([ head, ...tail ]) =>
    tail.some(cell => collision(head, cell))

const updateSnake = (snake, direction) => {
	const [ head ] = snake
	const tail = snake.pop()

	tail.x = head.x + SIZE * DIRECTIONS[direction].x
	tail.y = head.y + SIZE * DIRECTIONS[direction].y
	snake.unshift(tail)

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

const Score = score =>
	g({ key: 'score' }, [
		text({
			style: score_style,
			x: 5,
			y: 20,
		}, `Score: ${score}`)
	])

const game_over_style = {
	title: {
		font: 'bold 48px sans-seriff',
		fill: '#fff',
		opacity: 0.8,
		'text-anchor': 'middle',
	},
	text: {
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
			style: game_over_style.text,
			x: WIDTH/2, y: 160,
		}, `Score: ${score}`),
		text({
			style: game_over_style.text,
			x: WIDTH/2, y: 200,
		}, `Press 'R' to restart`),
	])

const game = withFx(app) (state, actions, view, document.body)

game.start()
