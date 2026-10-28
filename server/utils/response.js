export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Express 4 tidak menangkap error dari fungsi async, jadi dibungkus di sini.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
