import { MaterialEntity } from 'src/db/entities/material.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(MaterialEntity)
export class MaterialsRepository extends Repository<MaterialEntity> {}
