export type EventSubscriber<Payload> = (payload: Payload) => void | Promise<void>;

export interface EventPublisher<EventMap> {
    publish<EventName extends keyof EventMap & string>(name: EventName, payload: EventMap[EventName]): Promise<void>;
}

export interface EventBus<EventMap> extends EventPublisher<EventMap> {
    subscribe<EventName extends keyof EventMap & string>(
        name: EventName,
        subscriber: EventSubscriber<EventMap[EventName]>,
    ): void;
}

/**
 * In-process bus. `publish` never rejects: the publisher's work is already committed,
 * so a failing subscriber is logged instead of undoing or failing the publisher.
 */
export function createEventBus<EventMap>(): EventBus<EventMap> {
    const subscribersByEvent = new Map<string, EventSubscriber<never>[]>();

    return {
        subscribe(name, subscriber) {
            const subscribers = subscribersByEvent.get(name) ?? [];
            subscribersByEvent.set(name, [...subscribers, subscriber]);
        },

        async publish(name, payload) {
            const subscribers = (subscribersByEvent.get(name) ?? []) as EventSubscriber<typeof payload>[];
            const outcomes = await Promise.allSettled(subscribers.map(async (subscriber) => subscriber(payload)));

            for (const outcome of outcomes) {
                if (outcome.status === 'rejected') {
                    console.error(`Subscriber of "${name}" failed:`, outcome.reason);
                }
            }
        },
    };
}
