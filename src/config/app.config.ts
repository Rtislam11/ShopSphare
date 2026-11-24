
import z, { ZodError } from 'zod';
import * as dotenv from 'dotenv';
import { fromZodError } from 'zod-validation-error';

dotenv.config();

const requiredString = z.string().trim().min(1);

const positiveNumber = z.coerce.number().int().positive();

const booleanValue = z.preprocess((value) => {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return value;
}, z.boolean());

export const envSchema = z
  .object({
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: positiveNumber.default(6379),
    REDIS_PASSWORD: z.string().optional(),

    DEBUG_LOG: booleanValue.default(false),
    WARN_LOG: booleanValue.default(true),
    ERROR_LOG: booleanValue.default(true),
    REQ_LOG: booleanValue.default(true),
    LOG_FILE: booleanValue.default(true),

    JWT_BEARER_SECRET: requiredString,

    AUTH_SERVER_AUDIENCE: z.string().optional(),
    JWT_TTL: positiveNumber.default(86400 * 365),

    PORT: positiveNumber.default(5001),

    NODE_ENV: z
      .enum(['development', 'production'])
      .default('development'),

    APP_ENV: z.enum(['local', 'dev', 'prod']).default('local'),

    MAILER_HOST: requiredString,
    MAILER_PORT: positiveNumber,
    MAILER_SECURE: booleanValue,
    MAILER_USER: requiredString,
    MAILER_PASSWORD: requiredString,
    MAILER_FROM: requiredString,

    BULB_REWARD_INTERVAL_SECOND: positiveNumber.default(7 * 86400),
    BLOCK_QUERY_INTERVAL: positiveNumber.default(10000),

    LONG_BREAK_THRESHOLD_IN_SECONDS: positiveNumber.default(
      18 * 60 * 60,
    ),

    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    RTC_PORT_MIN: positiveNumber.default(10000),
    RTC_PORT_MAX: positiveNumber.default(10100),

    NETWORK_NAME: z.string().default('mainnet'),
    CHAIN_ID: positiveNumber.default(1),

    PRIVATE_KEY: z.string().optional(),
  })
  .refine(
    (env) => env.RTC_PORT_MAX >= env.RTC_PORT_MIN,
    {
      message: 'RTC_PORT_MAX must be greater than or equal to RTC_PORT_MIN',
      path: ['RTC_PORT_MAX'],
    },
  )
  .transform((envs) => ({
    ...envs,
    REDIS_URL: envs.REDIS_PASSWORD
      ? `redis://:${envs.REDIS_PASSWORD}@${envs.REDIS_HOST}:${envs.REDIS_PORT}`
      : `redis://${envs.REDIS_HOST}:${envs.REDIS_PORT}`,
  }));

const env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`ENV Validation error: ${fromZodError(error).message}`);
    }

    throw new Error(`ENV ${error}`);
  }
})();

export const appConfig = {
  default_schema_identifier: 'public',
  default_migrations_folder: __dirname + '/../database/migrations',
  default_seeders_folder: __dirname + '/../database/seeders',
  tenant_migrations_folder: __dirname + '/../database/tenant_migrations',
  tenant_seeders_folder: __dirname + '/../database/tenant_seeders',
  recommended_bycrypt_rounds: 12,
  email_from: 'mailer@schmserver.com',
  env,
};
