import { ClassConstructor } from 'class-transformer/types/interfaces';

export type TMappedType<T = {}> = ClassConstructor<T> & (new () => T);
