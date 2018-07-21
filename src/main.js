import { app } from 'hyperapp'
import { withFx } from '@hyperapp/fx'
import { div } from '@hyperapp/html'
import { g, rect, svg } from './svg';


const SIZE = 15
const WIDTH = SIZE * 40
const HEIGHT = SIZE * 27

const COLORS = {
	background: '#088c64',
}

const state = {

}

const actions = {

}

const view = state =>
	div([
		svg({ viewBox: `0 0 ${WIDTH} ${HEIGHT}`, width: WIDTH, height: HEIGHT}, [
			Background(),
		]),
	])

const Background = () =>
	g({ key: 'background' }, [
		rect({ x: 0, y: 0, width: WIDTH, height: HEIGHT, fill: COLORS.background }),
	])

const game = withFx(app) (state, actions, view, document.body)
