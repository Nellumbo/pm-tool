const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

const { authenticateToken, checkRole } = require('../middleware/auth');

describe('Authentication Middleware', () => {
  describe('authenticateToken', () => {
    test('Valid token is accepted', () => {
      const token = jwt.sign(
        { id: '1', email: 'test@example.com', role: 'admin', name: 'Test User' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@example.com');
    });

    test('Missing token is rejected', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Токен доступа отсутствует' });
      expect(next).not.toHaveBeenCalled();
    });

    test('Invalid token is rejected', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkRole', () => {
    test('User with correct role is allowed', () => {
      const req = {
        user: { id: '1', role: 'admin', name: 'Admin User' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const middleware = checkRole(['admin', 'manager']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('User without required role is denied', () => {
      const req = {
        user: { id: '1', role: 'developer', name: 'Dev User' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const middleware = checkRole(['admin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Недостаточно прав для выполнения операции'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('User without authentication is denied', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const middleware = checkRole(['admin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('Validation Middleware', () => {
  const { body, validationResult } = require('express-validator');

  test('Email validation works', async () => {
    const validator = body('email').isEmail();

    const req = {
      body: { email: 'invalid-email' }
    };

    await validator.run(req);
    const errors = validationResult(req);

    expect(errors.isEmpty()).toBe(false);
  });

  test('Password length validation works', async () => {
    const validator = body('password').isLength({ min: 6 });

    const req = {
      body: { password: '123' }
    };

    await validator.run(req);
    const errors = validationResult(req);

    expect(errors.isEmpty()).toBe(false);
  });
});
