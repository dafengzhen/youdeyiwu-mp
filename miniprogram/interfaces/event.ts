import { type EventType } from 'mitt';

export interface IEvents extends Record<EventType, unknown> {
  ready_index_page: undefined;
}
