import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useAuthStore, User } from '../store/authStore';

describe('AuthStore Client State Management', () => {
  const mockUser: User = {
    id: 'user-001',
    name: 'Bultum Caalaa',
    username: 'bultum',
    email: 'bultum@barruu.com',
    role: 'USER',
    createdAt: '2026-10-01T00:00:00Z',
    bio: 'Barreessaa Afaan Oromoo',
  };

  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,
      isInitializing: false,
    });
  });

  it('initializes with null user and token in default state', () => {
    const state = useAuthStore.getState();
    assert.equal(state.user, null);
    assert.equal(state.token, null);
    assert.equal(state.isLoading, false);
  });

  it('updates partial user profile state correctly', () => {
    useAuthStore.setState({ user: mockUser, token: 'mock-jwt-token' });

    useAuthStore.getState().updateUser({
      name: 'Bultum Caalaa Updated',
      bio: 'Qorataa Seenaa',
    });

    const updated = useAuthStore.getState().user;
    assert.equal(updated?.name, 'Bultum Caalaa Updated');
    assert.equal(updated?.bio, 'Qorataa Seenaa');
    assert.equal(updated?.email, 'bultum@barruu.com');
  });

  it('clears credentials cleanly on logout', () => {
    useAuthStore.setState({ user: mockUser, token: 'active-token-99' });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    assert.equal(state.user, null);
    assert.equal(state.token, null);
    assert.equal(state.isLoading, false);
  });
});
