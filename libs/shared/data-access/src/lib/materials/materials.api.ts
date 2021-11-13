import { CreatedMaterialDto, CreateMaterialDto, MaterialDto } from './materials.classes';

export type TMaterialsGetOwnMaterialsData = MaterialDto[];

export type TMaterialsGetOwnMaterialData = MaterialDto;

export class MaterialsCreateOwnMaterialBody extends CreateMaterialDto {}
export type TMaterialsCreateOwnMaterialData = CreatedMaterialDto;
