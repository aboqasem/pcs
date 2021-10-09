import { ClassConstructor } from 'class-transformer/types/interfaces';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from './type-helpers.utils';
import { TMappedType } from './types';

export function IntersectionType<A, B>(
  target: ClassConstructor<A>,
  source: ClassConstructor<B>,
): TMappedType<A & B>;

export function IntersectionType<A, B, C>(
  target: ClassConstructor<A>,
  sourceB: ClassConstructor<B>,
  sourceC: ClassConstructor<C>,
): TMappedType<A & B & C>;

export function IntersectionType<A, B, C, D>(
  target: ClassConstructor<A>,
  sourceB: ClassConstructor<B>,
  sourceC: ClassConstructor<C>,
  sourceD: ClassConstructor<D>,
): TMappedType<A & B & C & D>;

export function IntersectionType<A, B, C, D, E>(
  target: ClassConstructor<A>,
  sourceB: ClassConstructor<B>,
  sourceC: ClassConstructor<C>,
  sourceD: ClassConstructor<D>,
  sourceE: ClassConstructor<E>,
): TMappedType<A & B & C & D & E>;

export function IntersectionType<A, B, C, D, E, F>(
  target: ClassConstructor<A>,
  sourceB: ClassConstructor<B>,
  sourceC: ClassConstructor<C>,
  sourceD: ClassConstructor<D>,
  sourceE: ClassConstructor<E>,
  sourceF: ClassConstructor<F>,
): TMappedType<A & B & C & D & E & F>;

export function IntersectionType<A, B, C, D, E, F, G>(
  target: ClassConstructor<A>,
  sourceB: ClassConstructor<B>,
  sourceC: ClassConstructor<C>,
  sourceD: ClassConstructor<D>,
  sourceE: ClassConstructor<E>,
  sourceF: ClassConstructor<F>,
  sourceG: ClassConstructor<G>,
): TMappedType<A & B & C & D & E & F & G>;

export function IntersectionType<A, T extends ClassConstructor<any>[]>(
  classA: ClassConstructor<A>,
  ...classRefs: T
): TMappedType<A> {
  const allClassRefs = [classA, ...classRefs];

  abstract class IntersectionClassType {
    constructor() {
      allClassRefs.forEach((classRef) => {
        inheritPropertyInitializers(this, classRef);
      });
    }
  }

  allClassRefs.forEach((classRef) => {
    inheritValidationMetadata(classRef, IntersectionClassType);
    inheritTransformationMetadata(classRef, IntersectionClassType);
  });

  const intersectedNames = allClassRefs.reduce((prev, ref) => prev + ref.name, '');

  Object.defineProperty(IntersectionClassType, 'name', {
    value: `Intersection${intersectedNames}`,
  });

  return IntersectionClassType as TMappedType<A>;
}
