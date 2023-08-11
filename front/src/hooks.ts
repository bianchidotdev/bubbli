import type { Handle, GetSession } from '@sveltejs/kit';
import * as cookie from 'cookie';
import * as jsonwebtoken from 'jsonwebtoken';
import { handleTokenRefresh } from '$lib/helpers/refresh';
import { JWT_SECRET } from './env';

const getJWT = (cookie: string): jsonwebtoken.Jwt => {
  if (typeof cookie !== 'string' || cookie.length === 0) return;

  return jsonwebtoken.decode(cookie, { complete: true });
};

const isMobileUser = (userAgent: string) =>
  /android/i.test(userAgent) || /i(Phone|Pad|Pod)/i.test(userAgent);

const isTokenExpired = (exp) => {
  const now = new Date();
  const expireDate = new Date(exp * 1000);

  return now.getTime() >= expireDate.getTime();
};

export const handle: Handle = async (req) => {
  const { request, resolve } = req;
  const cookies = cookie.parse(request.headers.cookie || '');

  let hasNewCookie: string | boolean = false;
  const user = cookies.jwt && getJWT(cookies.jwt);
  const userAgent = request.headers['user-agent'];

  const isMobile = isMobileUser(userAgent);
  request.locals.mobile = isMobile;
  request.locals.user = user ? user.payload : null;

  // Refresh access_token if expired
  if (
    request.url.pathname.includes('.json') &&
    request.locals.user &&
    isTokenExpired(user.payload.exp)
  ) {
    const data = await handleTokenRefresh({
      refresh_token: request.locals.user.refresh_token
    });
    const { refresh_token, access_token } = data;
    const user = { ...request.locals.user, refresh_token, access_token };

    const { exp, iat, ...rest } = user;
    request.locals.user = rest;

    const jwt = await jsonwebtoken.sign(rest, JWT_SECRET, { expiresIn: '1h' });

    hasNewCookie = cookie.serialize('jwt', jwt, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
  }

  const response = await resolve(request);
  if (hasNewCookie) {
    response.headers['set-cookie'] = hasNewCookie ? (hasNewCookie as string) : '';
  }

  return response;
};

export const getSession: GetSession = async (request) => {
  return {
    user: request.locals.user
      ? {
          name: request?.locals?.user?.name,
          user_thumbnail: request?.locals?.user?.user_thumbnail,
          karma: request?.locals?.user?.karma
        }
      : null,
    mobile: request.locals.mobile
  };
};
