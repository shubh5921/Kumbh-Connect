import {
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  status: parseAsString.withDefault(''),
  q: parseAsString,
};

export const serialize = createSerializer(searchParams);