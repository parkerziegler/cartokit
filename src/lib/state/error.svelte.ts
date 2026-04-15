let message = $state('');
let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const error = {
  get message() {
    return message;
  },
  set(msg: string, duration = 5000) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    message = msg;
    timeoutId = setTimeout(() => {
      message = '';
      timeoutId = null;
    }, duration);
  },
  clear() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    message = '';
  }
};
