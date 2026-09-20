import * as Comlink from 'comlink';

import {
  replayTransformations,
  runTransformation
} from '$lib/utils/transformation';

Comlink.expose({ runTransformation, replayTransformations });
