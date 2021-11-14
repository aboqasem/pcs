import { CreatedMaterialDto, CreateMaterialDto, MaterialDto } from './materials.classes';

export type TMaterialsGetMaterialsData = MaterialDto[];

export type TMaterialsGetMaterialData = MaterialDto;

export class MaterialsCreateMaterialBody extends CreateMaterialDto {}
export type TMaterialsCreateMaterialData = CreatedMaterialDto;
