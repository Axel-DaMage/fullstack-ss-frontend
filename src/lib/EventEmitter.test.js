import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventEmitter } from './EventEmitter';

describe('EventEmitter', () => {
  beforeEach(() => {
    eventEmitter.events.clear();
  });

  it('permite suscribirse a un evento', () => {
    const callback = vi.fn();
    const unsubscribe = eventEmitter.on('testEvent', callback);
    
    eventEmitter.emit('testEvent', { data: 'test' });
    
    expect(callback).toHaveBeenCalledWith({ data: 'test' });
    unsubscribe();
  });

  it('permite desuscribirse de un evento', () => {
    const callback = vi.fn();
    eventEmitter.on('testEvent', callback);
    
    eventEmitter.off('testEvent', callback);
    eventEmitter.emit('testEvent', { data: 'test' });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('llama a todos los listeners de un evento', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    eventEmitter.on('testEvent', callback1);
    eventEmitter.on('testEvent', callback2);
    
    eventEmitter.emit('testEvent', { data: 'test' });
    
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('retorna función de unsubscribe al suscribirse', () => {
    const callback = vi.fn();
    const unsubscribe = eventEmitter.on('testEvent', callback);
    
    unsubscribe();
    eventEmitter.emit('testEvent', { data: 'test' });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('permite escuchar evento una sola vez con once', () => {
    const callback = vi.fn();
    eventEmitter.once('testEvent', callback);
    
    eventEmitter.emit('testEvent', { data: '1' });
    eventEmitter.emit('testEvent', { data: '2' });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ data: '1' });
  });

  it('pasa datos correctamente al callback', () => {
    const callback = vi.fn();
    const testData = { id: 1, name: 'Test', items: ['a', 'b'] };
    
    eventEmitter.on('testEvent', callback);
    eventEmitter.emit('testEvent', testData);
    
    expect(callback).toHaveBeenCalledWith(testData);
  });

  it('no falla si no hay listeners para el evento', () => {
    expect(() => {
      eventEmitter.emit('nonExistentEvent', { data: 'test' });
    }).not.toThrow();
  });

  it('maneja múltiples eventos diferentes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    eventEmitter.on('event1', callback1);
    eventEmitter.on('event2', callback2);
    
    eventEmitter.emit('event1', { data: '1' });
    eventEmitter.emit('event2', { data: '2' });
    
    expect(callback1).toHaveBeenCalledWith({ data: '1' });
    expect(callback2).toHaveBeenCalledWith({ data: '2' });
  });
});