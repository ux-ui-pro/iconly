import { defineLibrary } from '@ux-ui/tsdown-config';

export default defineLibrary({
  platform: 'browser',
  entry: {
    index: 'src/index.ts',
    sprite: 'src/sprite.ts',
  },
});
