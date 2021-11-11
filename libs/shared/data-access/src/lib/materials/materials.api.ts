import { CreatedMaterialDto, CreateMaterialDto, MaterialDto } from './materials.classes';

export type MaterialsGetOwnMaterialsData = MaterialDto[];

export type MaterialsGetOwnMaterialData = MaterialDto;

export class MaterialsCreateOwnMaterialBody extends CreateMaterialDto {}
export type MaterialsCreateOwnMaterialData = CreatedMaterialDto;
