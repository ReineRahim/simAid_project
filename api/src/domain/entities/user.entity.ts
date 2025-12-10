import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'users' })
export class UserEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'int' })
  user_id!: number;

  @Field()
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  full_name!: string;

  @Field()
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password!: string;

  @Field()
  @Column({ name: 'role', type: 'varchar', length: 50, default: 'user' })
  role!: string;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
