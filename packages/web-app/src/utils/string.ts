import { kebabCase } from 'lodash-es';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    // Replace spaces with replacement character, treating multiple consecutive
    // spaces as a single space.
    .replace(/\s+/g, '-')
    // remove not allowed characters
    .replace(/[^\w\s$*_+~.()'"!\-:@]+/g, '')
    .replace(/[^a-z0-9-]/g, '');
}
