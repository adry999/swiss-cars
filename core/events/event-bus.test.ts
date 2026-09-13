import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from './event-bus';

interface TestEvents {
    'cars.sold': { carId: string };
    'cars.listed': { carId: string };
}

describe('createEventBus', () => {
    it('delivers a published payload to every subscriber of that event', async () => {
        const bus = createEventBus<TestEvents>();
        const firstSubscriber = vi.fn();
        const secondSubscriber = vi.fn();
        bus.subscribe('cars.sold', firstSubscriber);
        bus.subscribe('cars.sold', secondSubscriber);

        await bus.publish('cars.sold', { carId: 'car-1' });

        expect(firstSubscriber).toHaveBeenCalledWith({ carId: 'car-1' });
        expect(secondSubscriber).toHaveBeenCalledWith({ carId: 'car-1' });
    });

    it('does not deliver to subscribers of other events', async () => {
        const bus = createEventBus<TestEvents>();
        const listedSubscriber = vi.fn();
        bus.subscribe('cars.listed', listedSubscriber);

        await bus.publish('cars.sold', { carId: 'car-1' });

        expect(listedSubscriber).not.toHaveBeenCalled();
    });

    it('resolves without subscribers', async () => {
        const bus = createEventBus<TestEvents>();

        await expect(bus.publish('cars.sold', { carId: 'car-1' })).resolves.toBeUndefined();
    });

    it('keeps delivering and still resolves when one subscriber fails', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const bus = createEventBus<TestEvents>();
        const healthySubscriber = vi.fn();
        bus.subscribe('cars.sold', () => {
            throw new Error('telegram down');
        });
        bus.subscribe('cars.sold', async () => {
            throw new Error('email down');
        });
        bus.subscribe('cars.sold', healthySubscriber);

        await expect(bus.publish('cars.sold', { carId: 'car-1' })).resolves.toBeUndefined();

        expect(healthySubscriber).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledTimes(2);
        consoleError.mockRestore();
    });
});
