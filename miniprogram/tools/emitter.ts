import { type IEvents } from '../interfaces/event';
import mitt from 'mitt';

const emitter = mitt<IEvents>();
export default emitter;
