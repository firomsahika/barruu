import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createArticleSchema, updateArticleSchema } from '../validations/article.validation';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validations/auth.validation';

describe('Validation Schemas', () => {
  describe('createArticleSchema', () => {
    it('accepts valid article input', () => {
      const validData = {
        title: 'Seenaa Oromoo Bareedaa',
        content: 'Barruun kun seenaa bal\'aa fi ajaa\'ibsiisaa qabata.',
        category: 'SEENAA',
        tags: ['seenaa', 'oromiyaa'],
        coverImageUrl: 'https://example.com/cover.png',
        published: true,
      };

      const result = createArticleSchema.safeParse(validData);
      assert.equal(result.success, true);
    });

    it('rejects short title or short content', () => {
      const invalidData = {
        title: 'ab',
        content: 'gabaabaa',
      };

      const result = createArticleSchema.safeParse(invalidData);
      assert.equal(result.success, false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        assert.ok(errors.title);
        assert.ok(errors.content);
      }
    });

    it('rejects invalid category', () => {
      const invalidData = {
        title: 'Walaloo Addaa',
        content: 'Qabiyyee dheeraa fi gahaa qaba.',
        category: 'INVALID_CATEGORY',
      };

      const result = createArticleSchema.safeParse(invalidData);
      assert.equal(result.success, false);
    });
  });

  describe('updateArticleSchema', () => {
    it('accepts partial updates', () => {
      const updateData = {
        title: 'Mata duree haaraa fooyya\'e',
      };

      const result = updateArticleSchema.safeParse(updateData);
      assert.equal(result.success, true);
    });

    it('rejects empty object update', () => {
      const result = updateArticleSchema.safeParse({});
      assert.equal(result.success, false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration payload', () => {
      const payload = {
        email: 'user@example.com',
        username: 'oromo_writer_26',
        name: 'Chala Gemechu',
        password: 'password123',
      };

      const result = registerSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('rejects invalid characters in username', () => {
      const payload = {
        email: 'user@example.com',
        username: 'user@name!',
        name: 'Chala',
        password: 'password123',
      };

      const result = registerSchema.safeParse(payload);
      assert.equal(result.success, false);
    });

    it('rejects short passwords', () => {
      const payload = {
        email: 'user@example.com',
        username: 'chala_g',
        name: 'Chala',
        password: '123',
      };

      const result = registerSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      const payload = {
        email: 'writer@barruu.org',
        password: 'secretPassword',
      };

      const result = loginSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('rejects malformed email', () => {
      const payload = {
        email: 'not-an-email',
        password: 'secretPassword',
      };

      const result = loginSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates matching password and confirmation with valid token', () => {
      const payload = {
        token: 'a'.repeat(32),
        password: 'newSecurePassword1',
        confirmPassword: 'newSecurePassword1',
      };

      const result = resetPasswordSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('fails when password and confirmPassword do not match', () => {
      const payload = {
        token: 'a'.repeat(32),
        password: 'newSecurePassword1',
        confirmPassword: 'differentPassword2',
      };

      const result = resetPasswordSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('updateProfileSchema', () => {
    it('allows updating bio and normalizing empty strings', () => {
      const payload = {
        bio: 'Barreessaa seenaa fi aadaa.',
      };

      const result = updateProfileSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('rejects empty profile update', () => {
      const result = updateProfileSchema.safeParse({});
      assert.equal(result.success, false);
    });
  });
});
