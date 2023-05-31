export const ROW_HEIGHT = 33;

interface MinLengthOfParams<T> {
  length: number;
  N?: number;
  iterindex?: number;
  iterator?: Iterator<T>;
  index: number[];
  array: T[];
}

export function minlengthof<T>({
  length,
  N,
  iterindex,
  iterator,
  index,
  array
}: MinLengthOfParams<T>) {
  length = Math.floor(length);

  if (N !== undefined) {
    return Math.min(N, length);
  }

  if (typeof iterindex !== 'undefined' && length <= iterindex) {
    return length;
  }

  while (iterator && typeof iterindex !== 'undefined' && length > iterindex) {
    const { done, value } = iterator.next();
    if (done) return (N = iterindex);
    index.push(iterindex++);
    array.push(value);
  }

  return iterindex ?? 0;
}
