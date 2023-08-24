export type Result<T, E> = Ok<T> | Err<E>;
type Ok<T> = {
  isOk: true;
  isErr: false;
  value: T;
};
type Err<E> = {
  isOk: false;
  isErr: true;
  error: E;
};

export const ok = <T>(value: T): Ok<T> => ({
  isOk: true,
  isErr: false,
  value,
});

export const err = <E>(error: E): Err<E> => ({
  isOk: false,
  isErr: true,
  error,
});
