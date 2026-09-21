const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth.middleware');

class AuthService {
  /**
   * Admin Sign In
   * Checks email, bcrypt password hash, active status, and ADMIN role.
   * Updates lastLoginAt and issues JWT.
   */
  async signin(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail
      }
    });

    // Unified error message to prevent enumeration
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Account is inactive. Please contact a system administrator.');
    }

    if (user.role !== 'ADMIN') {
      throw new Error('Access denied. Administrator privileges required.');
    }

    // Update last login timestamp
    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: now }
    });

    const token = jwt.sign(
      {
        userId: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || 'N/A',
        status: user.status,
        createdBy: user.createdBy,
        lastLoginAt: now,
        createdAt: user.createdAt
      }
    };
  }

  /**
   * Create New Admin Account (Protected: can only be executed by authenticated ADMIN)
   */
  async signup(data, currentAdmin) {
    const { name, email, password, confirmPassword, phone, status = 'ACTIVE' } = data;

    if (!name || !email || !password) {
      throw new Error('Full Name, Email, and Password are required.');
    }

    if (confirmPassword && password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdByAdmin = currentAdmin ? (currentAdmin.name || currentAdmin.email) : 'System Admin';

    const newAdmin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: 'ADMIN',
        phone: phone ? phone.trim() : null,
        status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        createdBy: createdByAdmin,
        lastLoginAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdBy: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return newAdmin;
  }

  /**
   * Get Current Authenticated Admin Profile
   */
  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdBy: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('Admin user not found');
    }

    return user;
  }

  /**
   * List all Admin Accounts
   */
  async listAdmins() {
    return await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdBy: true,
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });
  }

  /**
   * Activate / Deactivate Admin Account (Soft status update, historical record preserved)
   */
  async updateAdminStatus(adminId, status, currentAdmin) {
    const targetId = parseInt(adminId);
    if (targetId === currentAdmin.userId && status === 'INACTIVE') {
      throw new Error('You cannot deactivate your own active admin account.');
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdBy: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    return updated;
  }
}

module.exports = new AuthService();
