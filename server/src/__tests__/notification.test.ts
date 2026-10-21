import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setSocketIO, getSocketIO } from '../lib/socket';
import { NotificationService } from '../services/notification.service';

describe('Notification Service & Real-Time Events', () => {
  it('does not create self-notifications when actor is the user', async () => {
    const result = await NotificationService.createNotification({
      userId: 'user_123',
      actorId: 'user_123',
      type: 'LIKE',
      message: 'liked your article',
    });

    assert.equal(result, null);
  });

  it('manages socket.io singleton registry safely', () => {
    assert.equal(getSocketIO(), null);

    let emittedRoom = '';
    let emittedEvent = '';
    let emittedPayload: unknown = null;

    const mockSocketServer = {
      to(room: string) {
        emittedRoom = room;
        return {
          emit(event: string, payload: unknown) {
            emittedEvent = event;
            emittedPayload = payload;
          },
        };
      },
    };

    setSocketIO(mockSocketServer as any);
    const io = getSocketIO();
    assert.ok(io);

    io?.to('room_456').emit('test_event', { ok: true });
    assert.equal(emittedRoom, 'room_456');
    assert.equal(emittedEvent, 'test_event');
    assert.deepEqual(emittedPayload, { ok: true });

    // Reset back
    setSocketIO(null as any);
  });
});
