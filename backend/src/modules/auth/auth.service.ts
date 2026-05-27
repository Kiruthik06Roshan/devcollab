import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../../utils/apiError.js';
import { env } from '../../config/env.js';
import { UserModel } from '../../models/user.model.js';
import { getDatabaseMode, memoryDb, createId } from '../../services/memoryDb.js';
import { WorkspaceModel } from '../../models/workspace.model.js';

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  workspaces: Array<{ id: string; name: string; slug: string; role: string }>;
};

function getCookieOptions() {
  const secure = env.nodeEnv === 'production';

  return {
    httpOnly: true,
    sameSite: secure ? ('none' as const) : ('lax' as const),
    secure,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  };
}

function issueToken(userId: string, role: string) {
  return jwt.sign({ role }, env.jwtSecret, { subject: userId, expiresIn: '7d' });
}

function toSafeUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  workspaceMemberships?: Array<{ workspace: { _id: { toString(): string }; name: string; slug: string } | null; role: string }>;
}): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl ?? '',
    workspaces: (user.workspaceMemberships ?? [])
      .filter((membership) => membership.workspace)
      .map((membership) => ({
        id: membership.workspace!._id.toString(),
        name: membership.workspace!.name,
        slug: membership.workspace!.slug,
        role: membership.role
      }))
  };
}

async function loadUserWithPassword(email: string) {
  if (getDatabaseMode() === 'memory') {
    return memoryDb.users.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  return UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
}

export const authService = {
  clearSession(res: Response) {
    res.clearCookie(env.jwtCookieName, { path: '/' });
  },
  async signup(payload: AuthPayload, res: Response) {
    const existingUser = await loadUserWithPassword(payload.email);
    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    let userId: string;
    let userRole = 'member';

    if (getDatabaseMode() === 'memory') {
      userId = createId();
      memoryDb.users.push({
        id: userId,
        name: payload.name!,
        email: payload.email.toLowerCase(),
        passwordHash,
        avatarUrl: '',
        role: userRole,
        workspaceMemberships: []
      });
    } else {
      const user = await UserModel.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        passwordHash,
        role: 'member'
      });
      userId = user.id;
      userRole = user.role;
    }

    const token = issueToken(userId, userRole);
    res.cookie(env.jwtCookieName, token, getCookieOptions());
    return { user: await this.getCurrentUser(userId), message: 'Account created' };
  },
  async login(payload: AuthPayload, res: Response) {
    const user = await loadUserWithPassword(payload.email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = issueToken(user.id, user.role);
    res.cookie(env.jwtCookieName, token, getCookieOptions());
    return { user: await this.getCurrentUser(user.id), message: 'Logged in' };
  },
  async getCurrentUser(userId?: string) {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (getDatabaseMode() === 'memory') {
      const user = memoryDb.users.find((item) => item.id === userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        workspaces: user.workspaceMemberships
          .map((membership) => {
            const workspace = memoryDb.workspaces.find((item) => item.id === membership.workspace);
            return workspace
              ? {
                  id: workspace.id,
                  name: workspace.name,
                  slug: workspace.slug,
                  role: membership.role
                }
              : null;
          })
          .filter(Boolean) as Array<{ id: string; name: string; slug: string; role: string }>
      };
    }

    const user = await UserModel.findById(userId)
      .select('name email role avatarUrl workspaceMemberships')
      .populate('workspaceMemberships.workspace', 'name slug');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return toSafeUser(user.toObject({ virtuals: false }) as any);
  }
};