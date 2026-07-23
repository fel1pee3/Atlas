/**
 * @atlas/shared — kernel compartilhado entre backend (apps/api) e mobile (apps/mobile).
 * Fonte única do modelo de Evento e da validação. Ver docs/11_Event_Model.md.
 */
export * from './events/event-types';
export * from './events/payloads';
export * from './events/event';
export * from './insights/insight-types';
export * from './insights/insight-schemas';
