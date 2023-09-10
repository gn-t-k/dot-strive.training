export type Option<T> = Some<T> | None;
export type Some<T> = {
  hasSome: true;
  value: T;
};
export type None = {
  hasSome: false;
};

export const some = <T>(value: T): Some<T> => ({
  hasSome: true,
  value,
});

export const none = (): None => ({
  hasSome: false,
});
