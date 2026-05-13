type EventCallback<T = unknown> = (data: T) => void;

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map();

  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback as EventCallback);
    return () => this.off(event, callback);
  }

  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    this.events.get(event)?.delete(callback as EventCallback);
  }

  emit<T = unknown>(event: string, data: T): void {
    this.events.get(event)?.forEach(callback => callback(data));
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): void {
    const wrapper: EventCallback<T> = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

export const eventEmitter = new EventEmitter();