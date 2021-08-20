import { MappedType, Never, Type } from './types';

export function NeverType<A>(target: Type<A>): MappedType<Never<keyof A>>;

export function NeverType<A, B>(
  classA: Type<A>,
  classB: Type<B>,
): MappedType<Never<keyof A & keyof B>>;

export function NeverType<A, B, C>(
  classA: Type<A>,
  classB: Type<B>,
  classC: Type<C>,
): MappedType<Never<keyof A & keyof B & keyof C>>;

export function NeverType<A, B, C, D>(
  classA: Type<A>,
  classB: Type<B>,
  classC: Type<C>,
  classD: Type<D>,
): MappedType<Never<keyof A & keyof B & keyof C & keyof D>>;

export function NeverType<A, B, C, D, E>(
  classA: Type<A>,
  classB: Type<B>,
  classC: Type<C>,
  classD: Type<D>,
  classE: Type<E>,
): MappedType<Never<keyof A & keyof B & keyof C & keyof D & keyof E>>;

export function NeverType<A, B, C, D, E, F>(
  classA: Type<A>,
  classB: Type<B>,
  classC: Type<C>,
  classD: Type<D>,
  classE: Type<E>,
  classF: Type<F>,
): MappedType<Never<keyof A & keyof B & keyof C & keyof D & keyof E & keyof F>>;

export function NeverType<A, B, C, D, E, F, G>(
  classA: Type<A>,
  classB: Type<B>,
  classC: Type<C>,
  classD: Type<D>,
  classE: Type<E>,
  classF: Type<F>,
  classG: Type<G>,
): MappedType<Never<keyof A & keyof B & keyof C & keyof D & keyof E & keyof F & keyof G>>;

export function NeverType<A, T extends Type[]>(
  classA: Type<A>,
  ...classRefs: T
): MappedType<Never<keyof A>> {
  abstract class NeverClassType {}

  const allClassRefs = [classA, ...classRefs];
  const neverNames = allClassRefs.reduce((prev, ref) => prev + ref.name, '');

  Object.defineProperty(NeverClassType, 'name', {
    value: `Never${neverNames}`,
  });

  return NeverClassType as MappedType<Never<keyof A>>;
}
