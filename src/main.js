import { app } from 'hyperapp'
import { withFx } from '@hyperapp/fx'
import { div } from '@hyperapp/html'
import { g, rect, svg } from './svg';


const SIZE = 15
const WIDTH = SIZE * 40
const HEIGHT = SIZE * 27

const COLORS = {
	background: '#088c64',
	snake: {
		fill: '#bcaba0',
		stroke: '#706660',
	},
}

const state = {
	snake: [
		{ x: 3 * SIZE, y: 3 * SIZE},
		{ x: 2 * SIZE, y: 3 * SIZE},
		{ x: 1 * SIZE, y: 3 * SIZE},
	]
}

const actions = {

}

const view = state =>
	div([
		svg({ viewBox: `0 0 ${WIDTH} ${HEIGHT}`, width: WIDTH, height: HEIGHT}, [
			Background(),
			Snake(state.snake),
		]),
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

const game = withFx(app) (state, actions, view, document.body)
