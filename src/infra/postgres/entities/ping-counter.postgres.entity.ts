import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('ping_counters')
export class PingCounterPostgresEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('integer')
  count!: number;

  @Column('timestamp')
  lastPingedAt!: Date;

  @Column('timestamp')
  createdAt!: Date;
}
